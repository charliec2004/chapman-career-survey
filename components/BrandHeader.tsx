import Image from 'next/image'
import logo from '@/public/chapman-logo.png'

// Official Chapman master-brand logo (from brand.chapman.edu), used by Chapman
// Career & Professional Development, locked up with the unit name.
// Static import (not a string src) so next/image emits a basePath-aware URL that
// resolves correctly under the GitHub Pages project subpath.
export default function BrandHeader() {
  return (
    <header className="border-b-4 border-chapman-red bg-white">
      <div className="flex items-center justify-center gap-3 px-4 py-4">
        <Image src={logo} alt="Chapman University" priority className="h-7 w-auto sm:h-9" />
        <span aria-hidden className="h-8 w-px bg-pillar/30" />
        <p className="font-heading text-xs font-bold uppercase leading-tight tracking-widest text-pillar">
          Career &amp;<br />Professional Development
        </p>
      </div>
    </header>
  )
}
