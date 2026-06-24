export default function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="text-center">
      <p className="font-heading text-sm font-bold uppercase tracking-widest text-chapman-red">
        Driven by Curiosity. Inspired by Chapman.
      </p>
      <h1 className="mt-3 font-heading text-4xl font-bold text-panther-black sm:text-5xl">
        Find your next career step
      </h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-pillar">
        Answer a few quick questions and we&apos;ll point you to the Chapman career
        services that fit you best — tools to use and the right office to talk to.
      </p>
      <button
        type="button"
        onClick={onStart}
        className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-chapman-red px-8 py-3 font-heading text-lg font-bold text-white transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-chapman-red focus-visible:ring-offset-2"
      >
        Start the survey
      </button>
      <p className="mt-4 text-xs text-pillar">Takes about 2 minutes · No sign-in required</p>
    </section>
  )
}
