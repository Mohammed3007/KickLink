import { LEGAL } from "@/lib/legal";

export type LegalSection = { heading: string; body: (string | string[])[] };

/** Plain, readable layout shared by the privacy policy and terms. */
export function LegalPage({ title, sections }: { title: string; sections: LegalSection[] }) {
  return (
    <article className="mx-auto max-w-2xl px-5 py-14">
      <h1 className="text-3xl font-bold tracking-[-0.02em] text-ink">{title}</h1>
      <p className="mt-2 text-sm text-ink-3">
        {LEGAL.operator} · Effective {LEGAL.effectiveDate}
      </p>
      <div className="mt-8 space-y-8">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-lg font-semibold text-ink">{section.heading}</h2>
            <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-ink-2">
              {section.body.map((block, i) =>
                Array.isArray(block) ? (
                  <ul key={i} className="list-disc space-y-1 pl-5">
                    {block.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i}>{block}</p>
                )
              )}
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}
