import Image from 'next/image'

// Official Chapman master-brand logo (from brand.chapman.edu), used by Chapman
// Career & Professional Development, locked up with the unit name.
export default function BrandHeader() {
  return (
    <header className="border-b-4 border-chapman-red bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-4">
        <Image
          src="/chapman-logo.png"
          alt="Chapman University"
          width={180}
          height={34}
          priority
          className="h-7 w-auto sm:h-9"
        />
        <span aria-hidden className="h-8 w-px bg-pillar/30" />
        <p className="font-heading text-xs font-bold uppercase leading-tight tracking-widest text-pillar">
          Career &amp;<br />Professional Development
        </p>
      </div>
    </header>
  )
}
