// Chapman-INSPIRED branding only — no official logo, window icon, or seal.
// A text wordmark plus a small geometric (triangle) accent evokes the brand.
export default function BrandHeader() {
  return (
    <header className="border-b-4 border-chapman-red bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <span aria-hidden className="inline-block h-0 w-0 border-x-8 border-b-[14px] border-x-transparent border-b-chapman-red" />
        <div>
          <p className="font-heading text-lg font-bold uppercase tracking-wide text-chapman-red">Chapman University</p>
          <p className="font-heading text-xs uppercase tracking-widest text-pillar">Career &amp; Professional Development</p>
        </div>
      </div>
    </header>
  )
}
