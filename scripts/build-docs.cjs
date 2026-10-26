/* eslint-disable */
/**
 * Builds the delivery documents (PDF and plain text) from the Markdown sources in docs/handbook.
 * Run:  node scripts/build-docs.cjs
 * Output: docs/delivery/*.pdf and *.txt
 */
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const SRC = path.join(__dirname, "..", "docs", "handbook");
const OUT = path.join(__dirname, "..", "docs", "delivery");

const MAROON = "#641E2B";
const SAFFRON = "#E77B18";
const INK = "#271B1B";
const MUTED = "#5E4F4B";
const LINE = "#E3D3BD";
const CREAM = "#FFF3DF";
const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = { top: 64, bottom: 64, left: 56, right: 56 };
const CONTENT_W = PAGE_W - M.left - M.right;

/* ---------- Markdown parsing ---------- */

function parseFrontMatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!m) return { meta: {}, body: text };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return { meta, body: text.slice(m[0].length) };
}

function parseBlocks(body) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    if (line.startsWith("```")) {
      const code = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++;
      blocks.push({ type: "code", lines: code });
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(line);
    if (h) { blocks.push({ type: "h" + h[1].length, text: h[2].trim() }); i++; continue; }
    if (line.startsWith("|")) {
      const rows = [];
      while (i < lines.length && lines[i].startsWith("|")) {
        const cells = lines[i].replace(/^\|/, "").replace(/\|\s*$/, "").split("|").map((c) => c.trim());
        if (!cells.every((c) => /^:?-{2,}:?$/.test(c))) rows.push(cells);
        i++;
      }
      blocks.push({ type: "table", rows });
      continue;
    }
    if (line.startsWith(">")) {
      const parts = [];
      while (i < lines.length && lines[i].startsWith(">")) parts.push(lines[i++].replace(/^>\s?/, ""));
      blocks.push({ type: "note", text: parts.join(" ") });
      continue;
    }
    if (/^\s*([-*]|\d+\.)\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^\s*([-*]|\d+\.|- \[[ x]\])\s+/.test(lines[i])) {
        const m = /^\s*(?:([-*])|(\d+)\.)\s+(.*)$/.exec(lines[i]);
        let text = m[3];
        let box = null;
        const cb = /^\[( |x)\]\s+(.*)$/.exec(text);
        if (cb) { box = cb[1] === "x"; text = cb[2]; }
        items.push({ ordered: !!m[2], n: m[2] ? Number(m[2]) : null, text, box });
        i++;
      }
      blocks.push({ type: "list", items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|\||>|```|\s*([-*]|\d+\.)\s+)/.test(lines[i])) para.push(lines[i++].trim());
    blocks.push({ type: "p", text: para.join(" ") });
  }
  return blocks;
}

/* ---------- Text helpers ---------- */

function clean(s) {
  return s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–|—/g, "-")
    .replace(/…/g, "...")
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x09\x0A\x20-\x7E\xA0-\xFF]/g, "");
}

/** Splits text into runs of normal and bold text. */
function runs(text) {
  const out = [];
  const re = /\*\*(.+?)\*\*|`(.+?)`/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ t: text.slice(last, m.index), style: "n" });
    out.push({ t: m[1] || m[2], style: m[1] ? "b" : "c" });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ t: text.slice(last), style: "n" });
  return out;
}

const plain = (s) => clean(s.replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1"));

function writeRich(doc, text, opts, pos) {
  const parts = runs(clean(text));
  parts.forEach((r, idx) => {
    doc.font(r.style === "b" ? "Helvetica-Bold" : r.style === "c" ? "Courier" : "Helvetica");
    const o = { ...opts, continued: idx < parts.length - 1 };
    if (idx === 0 && pos) doc.text(r.t, pos.x, pos.y, o);
    else doc.text(r.t, o);
  });
  doc.font("Helvetica");
}

/* ---------- PDF ---------- */

function ensureSpace(doc, h) {
  if (doc.y + h > PAGE_H - M.bottom) doc.addPage();
}

function renderTable(doc, rows) {
  if (!rows.length) return;
  const cols = rows[0].length;
  const FS = 8.5;
  const padX = 5, padY = 4;
  // Column widths from the longest word and the average text length.
  const weights = Array.from({ length: cols }, (_, c) => {
    const lens = rows.map((r) => plain(r[c] || "").length);
    const longestWord = Math.max(...rows.map((r) => Math.max(...plain(r[c] || "").split(/\s+/).map((w) => w.length), 1)));
    return { avg: lens.reduce((a, b) => a + b, 0) / rows.length, min: Math.min(longestWord, 18) };
  });
  const minW = weights.map((w) => w.min * 5 + padX * 2);
  const totalAvg = weights.reduce((a, w) => a + Math.max(w.avg, 6), 0);
  let widths = weights.map((w) => (Math.max(w.avg, 6) / totalAvg) * CONTENT_W);
  widths = widths.map((w, i) => Math.max(w, minW[i]));
  const scale = CONTENT_W / widths.reduce((a, b) => a + b, 0);
  widths = widths.map((w) => w * scale);

  const rowHeight = (row, bold) => {
    doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(FS);
    return Math.max(...row.map((c, i) => doc.heightOfString(plain(c || ""), { width: widths[i] - padX * 2 }))) + padY * 2;
  };

  const drawRow = (row, header, zebra) => {
    const h = rowHeight(row, header);
    if (doc.y + h > PAGE_H - M.bottom) {
      doc.addPage();
      // repeat the header row on a new page
      if (!header) drawRow(rows[0], true, false);
    }
    const y = doc.y;
    let x = M.left;
    row.forEach((cell, i) => {
      doc.rect(x, y, widths[i], h).fill(header ? MAROON : zebra ? "#FFF9EF" : "#FFFFFF");
      doc.rect(x, y, widths[i], h).lineWidth(0.5).stroke(LINE);
      doc.fillColor(header ? "#FFFFFF" : INK).font(header ? "Helvetica-Bold" : "Helvetica").fontSize(FS);
      doc.text(plain(cell || ""), x + padX, y + padY, { width: widths[i] - padX * 2, lineBreak: true });
      x += widths[i];
    });
    doc.y = y + h;
    doc.x = M.left;
  };

  rows.forEach((r, idx) => drawRow(r, idx === 0, idx % 2 === 0));
  doc.moveDown(0.8);
  doc.fillColor(INK).font("Helvetica").fontSize(10);
}

function renderBlocks(doc, blocks, tocSink) {
  for (const b of blocks) {
    doc.x = M.left;
    if (b.type === "h1") {
      if (!tocSink.length || doc.y > PAGE_H * 0.6) doc.addPage();
      else doc.moveDown(2);
      tocSink.push({ level: 1, text: plain(b.text), page: doc.bufferedPageRange().count });
      doc.fillColor(MAROON).font("Helvetica-Bold").fontSize(20).text(plain(b.text), M.left, doc.y, { width: CONTENT_W });
      doc.moveDown(0.25);
      const y = doc.y;
      doc.moveTo(M.left, y).lineTo(M.left + 60, y).lineWidth(3).stroke(SAFFRON);
      doc.moveDown(0.9);
      doc.fillColor(INK).font("Helvetica").fontSize(10);
    } else if (b.type === "h2") {
      ensureSpace(doc, 70);
      doc.moveDown(0.6);
      tocSink.push({ level: 2, text: plain(b.text), page: doc.bufferedPageRange().count });
      doc.fillColor(MAROON).font("Helvetica-Bold").fontSize(13.5).text(plain(b.text), M.left, doc.y, { width: CONTENT_W });
      doc.moveDown(0.4);
      doc.fillColor(INK).font("Helvetica").fontSize(10);
    } else if (b.type === "h3") {
      ensureSpace(doc, 50);
      doc.moveDown(0.4);
      doc.fillColor(SAFFRON).font("Helvetica-Bold").fontSize(11).text(plain(b.text), M.left, doc.y, { width: CONTENT_W });
      doc.moveDown(0.3);
      doc.fillColor(INK).font("Helvetica").fontSize(10);
    } else if (b.type === "p") {
      ensureSpace(doc, 30);
      doc.fillColor(INK).fontSize(10);
      writeRich(doc, b.text, { width: CONTENT_W, lineGap: 3, align: "left" }, { x: M.left, y: doc.y });
      doc.moveDown(0.6);
    } else if (b.type === "list") {
      for (const it of b.items) {
        ensureSpace(doc, 24);
        const y = doc.y;
        doc.fillColor(INK).fontSize(10).font("Helvetica");
        if (it.box !== null) {
          doc.rect(M.left + 4, y + 1.5, 8, 8).lineWidth(0.8).stroke(MAROON);
        } else if (it.ordered) {
          doc.font("Helvetica-Bold").fillColor(MAROON).text(`${it.n}.`, M.left + 2, y, { width: 18, lineBreak: false });
        } else {
          doc.circle(M.left + 8, y + 5.2, 1.8).fill(SAFFRON);
        }
        doc.fillColor(INK);
        writeRich(doc, it.text, { width: CONTENT_W - 26, lineGap: 2, align: "left" }, { x: M.left + 24, y });
        doc.x = M.left;
        doc.moveDown(0.25);
      }
      doc.moveDown(0.4);
    } else if (b.type === "note") {
      const text = plain(b.text);
      doc.font("Helvetica").fontSize(9.5);
      const h = doc.heightOfString(text, { width: CONTENT_W - 28, lineGap: 2 }) + 16;
      ensureSpace(doc, h + 6);
      const y = doc.y;
      doc.rect(M.left, y, CONTENT_W, h).fill(CREAM);
      doc.rect(M.left, y, 4, h).fill(SAFFRON);
      doc.fillColor(MAROON).font("Helvetica-Oblique").text(text, M.left + 16, y + 8, { width: CONTENT_W - 28, lineGap: 2 });
      doc.y = y + h;
      doc.moveDown(0.8);
      doc.fillColor(INK).font("Helvetica").fontSize(10);
    } else if (b.type === "code") {
      doc.font("Courier").fontSize(8);
      const h = b.lines.length * 10.5 + 14;
      if (h < PAGE_H - M.top - M.bottom) ensureSpace(doc, h + 6);
      const y = doc.y;
      doc.rect(M.left, y, CONTENT_W, h).fill("#F6EEE2");
      doc.fillColor(INK);
      b.lines.forEach((l, idx) => doc.text(clean(l), M.left + 10, y + 7 + idx * 10.5, { lineBreak: false }));
      doc.y = y + h;
      doc.moveDown(0.8);
      doc.font("Helvetica").fontSize(10);
    } else if (b.type === "table") {
      ensureSpace(doc, 60);
      renderTable(doc, b.rows);
    }
  }
}

function buildPdf(file, meta, blocks) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: M.top, bottom: M.bottom, left: M.left, right: M.right },
      bufferPages: true,
      info: { Title: meta.title + " - Maharshi Kanad Jyotish Kendra", Author: "Maharshi Kanad Jyotish Kendra", Subject: meta.subtitle || "" },
    });
    const stream = fs.createWriteStream(file);
    doc.pipe(stream);
    stream.on("finish", resolve);
    stream.on("error", reject);

    // Cover page
    doc.rect(0, 0, PAGE_W, PAGE_H).fill("#4B1724");
    doc.rect(0, PAGE_H * 0.62, PAGE_W, 6).fill(SAFFRON);
    doc.fillColor("#F4C65D").font("Helvetica-Bold").fontSize(11).text("MAHARSHI KANAD JYOTISH KENDRA", M.left, 150, { characterSpacing: 2 });
    doc.fillColor("#FFF8EC").font("Helvetica-Bold").fontSize(34).text(meta.title, M.left, 200, { width: CONTENT_W, lineGap: 4 });
    doc.moveDown(0.6);
    doc.fillColor("#F4C65D").font("Helvetica").fontSize(14).text(clean(meta.subtitle || ""), { width: CONTENT_W });
    doc.fillColor("#FFF8EC").font("Helvetica").fontSize(10.5);
    const y0 = PAGE_H * 0.62 + 40;
    doc.text(`Version ${meta.version || "1.0"}`, M.left, y0);
    doc.text(`Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`, M.left, y0 + 18);
    doc.text(`For: ${clean(meta.audience || "")}`, M.left, y0 + 36, { width: CONTENT_W });
    doc.text("Website: kanadjyotishkendra.vercel.app", M.left, y0 + 72);

    // Reserve table-of-contents pages (filled in at the end)
    const headings = blocks.filter((b) => b.type === "h1" || b.type === "h2");
    const tocHeight = headings.reduce((h, b) => h + (b.type === "h1" ? 18 : 15), 0);
    const tocPages = Math.max(1, Math.ceil(tocHeight / (PAGE_H - M.top - M.bottom - 70)));
    for (let i = 0; i < tocPages; i++) doc.addPage();

    const toc = [];
    // Content starts on a fresh page after the table of contents
    doc.addPage();
    // The first h1 adds its own page, so remove the blank one by moving back is not possible;
    // instead render the first h1 into this page.
    const first = blocks.findIndex((b) => b.type === "h1");
    const adjusted = blocks.slice();
    const origAddPage = doc.addPage.bind(doc);
    let skipNext = true;
    doc.addPage = function (...a) {
      if (skipNext) { skipNext = false; return doc; }
      return origAddPage(...a);
    };
    renderBlocks(doc, adjusted, toc);
    doc.addPage = origAddPage;

    // Table of contents
    const range = doc.bufferedPageRange();
    let idx = 0;
    for (let p = 0; p < tocPages; p++) {
      doc.switchToPage(1 + p);
      doc.fillColor(MAROON).font("Helvetica-Bold").fontSize(20).text("Contents", M.left, M.top, { width: CONTENT_W });
      const yy = doc.y + 4;
      doc.moveTo(M.left, yy).lineTo(M.left + 60, yy).lineWidth(3).stroke(SAFFRON);
      let y = yy + 22;
      while (idx < toc.length && y < PAGE_H - M.bottom - 16) {
        const e = toc[idx++];
        const x = M.left + (e.level === 2 ? 18 : 0);
        doc.font(e.level === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(e.level === 1 ? 10.5 : 9.5).fillColor(e.level === 1 ? MAROON : INK);
        const label = e.text;
        const pageLabel = String(e.page);
        doc.text(label, x, y, { width: CONTENT_W - 40 - (x - M.left), lineBreak: false, ellipsis: true });
        const lw = doc.widthOfString(label);
        const pw = doc.widthOfString(pageLabel);
        const dotsStart = x + lw + 6;
        const dotsEnd = M.left + CONTENT_W - pw - 6;
        if (dotsEnd > dotsStart) {
          doc.fillColor("#B8A58C").font("Helvetica").fontSize(9).text(".".repeat(Math.floor((dotsEnd - dotsStart) / 3.1)), dotsStart, y, { lineBreak: false });
        }
        doc.fillColor(e.level === 1 ? MAROON : INK).font(e.level === 1 ? "Helvetica-Bold" : "Helvetica").fontSize(e.level === 1 ? 10.5 : 9.5).text(pageLabel, M.left, y, { width: CONTENT_W, align: "right", lineBreak: false });
        y += e.level === 1 ? 18 : 15;
      }
    }

    // Header and footer on every page except the cover
    const total = doc.bufferedPageRange().count;
    for (let p = 1; p < total; p++) {
      doc.switchToPage(p);
      const saved = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.moveTo(M.left, 44).lineTo(PAGE_W - M.right, 44).lineWidth(0.5).stroke(LINE);
      doc.fillColor(MUTED).font("Helvetica").fontSize(8).text("Maharshi Kanad Jyotish Kendra", M.left, 32, { lineBreak: false });
      doc.text(clean(meta.title), M.left, 32, { width: CONTENT_W, align: "right", lineBreak: false });
      doc.moveTo(M.left, PAGE_H - 46).lineTo(PAGE_W - M.right, PAGE_H - 46).lineWidth(0.5).stroke(LINE);
      doc.text(`Page ${p + 1} of ${total}`, M.left, PAGE_H - 36, { width: CONTENT_W, align: "center", lineBreak: false });
      doc.page.margins.bottom = saved;
    }
    void range; void first;
    doc.end();
  });
}

/* ---------- Plain text ---------- */

function buildText(meta, blocks) {
  const out = [];
  const line = (c, n) => c.repeat(n);
  out.push(line("=", 78), clean(meta.title).toUpperCase(), clean(meta.subtitle || ""), line("=", 78));
  out.push(`Version ${meta.version || "1.0"}  |  ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}`);
  out.push(`For: ${clean(meta.audience || "")}`, "");
  const wrap = (s, w, indent = "") => {
    const words = s.split(/\s+/);
    const lines = [];
    let cur = "";
    for (const wd of words) {
      if ((cur + " " + wd).trim().length > w) { lines.push(indent + cur.trim()); cur = wd; } else cur = (cur + " " + wd).trim();
    }
    if (cur) lines.push(indent + cur);
    return lines.join("\n");
  };
  let n1 = 0;
  for (const b of blocks) {
    if (b.type === "h1") { n1++; out.push("", "", plain(b.text).toUpperCase(), line("=", Math.min(plain(b.text).length, 78)), ""); }
    else if (b.type === "h2") out.push("", plain(b.text), line("-", Math.min(plain(b.text).length, 78)), "");
    else if (b.type === "h3") out.push("", plain(b.text).toUpperCase() + ":", "");
    else if (b.type === "p") out.push(wrap(plain(b.text), 78), "");
    else if (b.type === "note") out.push(wrap("NOTE: " + plain(b.text), 74, "  "), "");
    else if (b.type === "code") out.push(...b.lines.map((l) => "    " + clean(l)), "");
    else if (b.type === "list") {
      for (const it of b.items) {
        const mark = it.box !== null ? "[ ] " : it.ordered ? `${it.n}. ` : "- ";
        out.push(wrap(mark + plain(it.text), 76, "  ").replace(/^  /, ""));
      }
      out.push("");
    } else if (b.type === "table") {
      const head = b.rows[0];
      for (const r of b.rows.slice(1)) {
        out.push(`* ${plain(r[0] || "")}`);
        for (let c = 1; c < r.length; c++) out.push(wrap(`${plain(head[c] || "")}: ${plain(r[c] || "")}`, 72, "    "));
      }
      out.push("");
    }
  }
  void n1;
  return out.join("\n").replace(/\n{4,}/g, "\n\n\n") + "\n";
}

/* ---------- Main ---------- */

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs = [
    ["01_PROJECT_DOCUMENTATION.md", "Maharshi_Kanad_Project_Documentation"],
    ["02_ADMIN_PANEL_MANUAL.md", "Maharshi_Kanad_Admin_Panel_Manual"],
  ];
  for (const [src, base] of jobs) {
    const raw = fs.readFileSync(path.join(SRC, src), "utf8").replace(/\r\n/g, "\n");
    const { meta, body } = parseFrontMatter(raw);
    const blocks = parseBlocks(body);
    await buildPdf(path.join(OUT, base + ".pdf"), meta, blocks);
    fs.writeFileSync(path.join(OUT, base + ".txt"), buildText(meta, blocks), "utf8");
    console.log("built", base);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
