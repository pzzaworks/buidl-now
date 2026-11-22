import { externalLinkRel } from "@/lib/seo";

/** Site-wide copyright line; the same in every locale, so it is not translated. */
export function Copyright() {
  return (
    <>
      © 2026{" "}
      <a
        href="https://pzza.works"
        target="_blank"
        rel={externalLinkRel}
        className="hover:opacity-50 transition-opacity"
      >
        pzzaworks
      </a>
    </>
  );
}
