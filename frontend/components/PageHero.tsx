"use client";

interface Props {
  tag: string;
  title: string;
  subtitle: string;
  gradient: string;
}

export default function PageHero({ tag, title, subtitle, gradient }: Props) {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-gradient-to-r ${gradient} opacity-5 blur-3xl pointer-events-none`} />

      <div className="relative max-w-screen-xl mx-auto text-center">
        <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${gradient} bg-opacity-10 border border-white/10 rounded-full px-4 py-1.5 mb-6`}>
          <span className={`text-xs font-bold uppercase tracking-widest bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {tag}
          </span>
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-4">{title}</h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">{subtitle}</p>
      </div>
    </section>
  );
}
