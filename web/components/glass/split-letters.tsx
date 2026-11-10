import type { ReactNode } from "react";

type Word = { text: string; className?: string };

/**
 * Words split into letters that flip up into place (CSS, see .ch in
 * glass.css). The heading keeps a readable aria-label; letters are hidden from
 * assistive tech.
 */
export function SplitLetters({ lines }: { lines: Word[][] }) {
  let i = 0;
  const out: ReactNode[] = lines.map((line, li) => (
    <span className={lines.length > 1 ? "dline" : undefined} aria-hidden="true" key={li}>
      {line.map((word) => (
        <span className={word.className ? `word ${word.className}` : "word"} key={word.text}>
          {word.text.split("").map((ch) => (
            <span className="ch" style={{ "--i": i++ } as React.CSSProperties} key={i}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  ));
  return <>{out}</>;
}

export function lineText(lines: Word[][]) {
  return lines.map((line) => line.map((w) => w.text).join(" ")).join(" ");
}
