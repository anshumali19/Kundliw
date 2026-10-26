import { Fragment } from "react";
import { parseRich } from "@/lib/content/richText";

/** Renders the admin's text with links and bold words. Safe: nothing is ever injected as raw HTML. */
export function RichText({ text, className = "" }: { text?: string | null; className?: string }) {
  const paragraphs = parseRich(text || "");
  if (paragraphs.length === 0) return null;
  return (
    <>
      {paragraphs.map((lines, pi) => (
        <p key={pi} className={className}>
          {lines.map((parts, li) => (
            <Fragment key={li}>
              {li > 0 && <br />}
              {parts.map((p, i) =>
                p.type === "bold" ? (
                  <strong key={i}>{p.text}</strong>
                ) : p.type === "link" ? (
                  <a
                    key={i}
                    href={p.href}
                    {...(p.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="font-semibold text-primary underline underline-offset-2 hover:text-brand-hover"
                  >
                    {p.text}
                  </a>
                ) : (
                  <Fragment key={i}>{p.text}</Fragment>
                )
              )}
            </Fragment>
          ))}
        </p>
      ))}
    </>
  );
}
