import { describe, it, expect, beforeEach, afterEach } from "vitest";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { LocalDiskStorageProvider } from "@/lib/storage";

/**
 * H4: storage subfolders must be allow-listed and every resolved path must stay
 * inside the storage base directory (read and write).
 */

const PDF_BYTES = Buffer.from("%PDF-1.4\n% test pdf\n");

let baseDir: string;
let outsideDir: string;

beforeEach(() => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "mkjk-storage-"));
  baseDir = path.join(root, "storage");
  outsideDir = path.join(root, "outside");
  fs.mkdirSync(baseDir, { recursive: true });
  fs.mkdirSync(outsideDir, { recursive: true });
});

afterEach(() => {
  fs.rmSync(path.dirname(baseDir), { recursive: true, force: true });
});

describe("H4 - storage path containment", () => {
  it("rejects traversal subfolders on write", async () => {
    const storage = new LocalDiskStorageProvider(baseDir);

    await expect(
      storage.saveFile(PDF_BYTES, "doc.pdf", "application/pdf", "../outside")
    ).rejects.toThrow(/subfolder|traversal|invalid/i);

    expect(fs.existsSync(path.join(outsideDir, "doc.pdf"))).toBe(false);
  });

  it("rejects encoded and nested traversal subfolders on write", async () => {
    const storage = new LocalDiskStorageProvider(baseDir);

    for (const subfolder of ["..%2foutside", "media/../../outside", "..\\outside", "/etc"]) {
      await expect(
        storage.saveFile(PDF_BYTES, "doc.pdf", "application/pdf", subfolder)
      ).rejects.toThrow(/subfolder|traversal|invalid/i);
    }
  });

  it("accepts allow-listed subfolders", async () => {
    const storage = new LocalDiskStorageProvider(baseDir);
    const result = await storage.saveFile(PDF_BYTES, "doc.pdf", "application/pdf", "media");

    expect(result.storageKey.startsWith("media/")).toBe(true);
    expect(fs.existsSync(path.join(baseDir, result.storageKey))).toBe(true);
  });

  it("refuses to read files outside the base directory", async () => {
    const secretPath = path.join(outsideDir, "secret.txt");
    fs.writeFileSync(secretPath, "top secret");
    const storage = new LocalDiskStorageProvider(baseDir);

    for (const key of [
      "../outside/secret.txt",
      "media/../../outside/secret.txt",
      "..\\outside\\secret.txt",
      secretPath,
      "..%2foutside%2fsecret.txt",
    ]) {
      await expect(storage.getFile(key)).rejects.toThrow();
    }
  });

  it("reads an allow-listed file normally", async () => {
    const storage = new LocalDiskStorageProvider(baseDir);
    const saved = await storage.saveFile(PDF_BYTES, "doc.pdf", "application/pdf", "vault");
    const loaded = await storage.getFile(saved.storageKey);

    expect(loaded.buffer.equals(PDF_BYTES)).toBe(true);
  });
});
