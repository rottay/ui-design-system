'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Layers, Puzzle, LayoutGrid, Monitor, Palette, PartyPopper } from 'lucide-react';
import { Building2Icon, BriefcaseIcon, ArrowRightIcon, ChevronRightIcon } from '@rottay/design-system/icons';
import { primitives, patterns, structures, surfaces, charts, icons } from '@/data/registry';

/* ------------------------------------------------------------------ */
/*  Animated counter hook                                              */
/* ------------------------------------------------------------------ */
function useCountUp(target: number, duration = 1400) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let raf: number;
    const t0 = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * ease));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return { value, start: () => setStarted(true) };
}

/* ------------------------------------------------------------------ */
/*  Stat pill                                                          */
/* ------------------------------------------------------------------ */
function StatPill({ label, count }: { label: string; count: number }) {
  const counter = useCountUp(count);

  useEffect(() => {
    const timer = setTimeout(() => counter.start(), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col items-center gap-1 px-4 py-3 sm:px-6">
      <span className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
        {counter.value}
      </span>
      <span className="text-xs tracking-widest text-neutral-400 uppercase">
        {label}
      </span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tier card (Architecture section)                                   */
/* ------------------------------------------------------------------ */
const tiers = [
  {
    name: 'Primitives',
    count: primitives.length,
    description: 'Engine-switched leaf components. The smallest reusable bricks.',
    color: 'from-blue-500 to-cyan-400',
    icon: Layers,
  },
  {
    name: 'Patterns',
    count: patterns.length,
    description: 'Task-level compositions. Reusable machines made of bricks.',
    color: 'from-violet-500 to-purple-400',
    icon: Puzzle,
  },
  {
    name: 'Structures',
    count: structures.length,
    description: 'Page-structure chrome. The frame around the machine.',
    color: 'from-amber-500 to-orange-400',
    icon: LayoutGrid,
  },
  {
    name: 'Surfaces',
    count: surfaces.length,
    description: 'Declarative page recipes. The whole room layout.',
    color: 'from-emerald-500 to-teal-400',
    icon: Monitor,
  },
];

/* ------------------------------------------------------------------ */
/*  Engine data                                                        */
/* ------------------------------------------------------------------ */
const engines = [
  {
    name: 'Classic',
    runtime: 'Ant Design',
    description:
      'Enterprise density. Refined controls. Battle-tested component library with full accessibility out of the box.',
    accent: '#1677ff',
    bg: 'bg-[#111827]',
    border: 'border-blue-500/30',
  },
  {
    name: 'Modern',
    runtime: 'DaisyUI',
    description:
      'Utility-first styling. Crisp spacing. A Tailwind-native engine for teams that think in classes.',
    accent: '#a78bfa',
    bg: 'bg-[#111827]',
    border: 'border-violet-500/30',
  },
  {
    name: 'Rustic',
    runtime: 'Vanilla CSS',
    description:
      'Zero dependencies. Pure CSS variables. The lightest engine for maximum control and smallest bundles.',
    accent: '#f59e0b',
    bg: 'bg-[#111827]',
    border: 'border-amber-500/30',
  },
] as const;

/* ------------------------------------------------------------------ */
/*  Vertical data                                                      */
/* ------------------------------------------------------------------ */
const verticals = [
  {
    name: 'Platform',
    description:
      'Admin portal for tenant management, billing, compliance, and system configuration.',
    color: '#3b82f6',
    gradient: 'from-blue-600 to-blue-400',
    icon: Building2Icon,
  },
  {
    name: 'BitHire',
    description:
      'AI-powered recruiting. Pipeline management, candidate tracking, and hiring workflows.',
    color: '#8b5cf6',
    gradient: 'from-violet-600 to-violet-400',
    icon: BriefcaseIcon,
  },
  {
    name: 'Evnto',
    description:
      'Event management at scale. Ticketing, venue operations, and attendee engagement.',
    color: '#f97316',
    gradient: 'from-orange-600 to-orange-400',
    icon: PartyPopper,
  },
] as const;

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */
export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const fade = mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4';

  return (
    <main className="min-h-screen bg-[#0a0a0a] font-sans text-white antialiased">
      {/* ---------------------------------------------------------- */}
      {/*  HERO                                                       */}
      {/* ---------------------------------------------------------- */}
      <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        {/* Background grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.4) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />

        {/* Radial glow */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 h-[600px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-blue-600/10 via-violet-600/10 to-transparent blur-3xl" />

        <div className={`relative z-10 max-w-4xl transition-all duration-700 ease-out ${fade}`}>
          <p className="mb-4 text-sm tracking-[0.25em] text-neutral-400 uppercase">
            @rottay/design-system
          </p>

          <h1 className="mb-6 text-4xl leading-tight font-bold tracking-tight sm:text-5xl md:text-6xl">
            One Design System.
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-amber-400 bg-clip-text text-transparent">
              Four Engines.
            </span>{' '}
            Every Brand.
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-base leading-relaxed text-neutral-400 sm:text-lg">
            A multi-tenant, multi-engine design system built on a 4-tier architecture.
            Ship three verticals from a single component library -- with runtime engine
            switching, 140-variable brand theming, and zero forks.
          </p>

          {/* CTA */}
          <div className="mb-16 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/foundations"
              className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
            >
              Explore the Showroom
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/foundations"
              className="inline-flex items-center gap-2 rounded-lg border border-neutral-700 px-6 py-3 text-sm font-semibold text-neutral-300 transition hover:border-neutral-500 hover:text-white"
            >
              Read the Docs
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Stats */}
          <div className="inline-flex flex-wrap items-center justify-center divide-x divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm">
            <StatPill label="Primitives" count={primitives.length} />
            <StatPill label="Patterns" count={patterns.length} />
            <StatPill label="Structures" count={structures.length} />
            <StatPill label="Surfaces" count={surfaces.length} />
            <StatPill label="Charts" count={charts.length} />
            <StatPill label="Icons" count={icons.length} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  ARCHITECTURE                                                */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-neutral-50 px-6 py-24 text-neutral-900">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-sm tracking-[0.2em] text-neutral-500 uppercase">
            Architecture
          </p>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Four Tiers. One Mental Model.
          </h2>
          <p className="mx-auto mb-14 max-w-2xl text-center text-neutral-500">
            Every component belongs to exactly one tier. Primitives compose into patterns,
            structures frame them on a page, and surfaces describe the whole screen.
          </p>

          {/* Tier flow */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {tiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <div
                  key={tier.name}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-lg"
                >
                  {/* Gradient top bar */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${tier.color}`}
                  />
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${tier.color} text-white`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-2xl font-bold">{tier.count}</span>
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">{tier.name}</h3>
                  <p className="text-sm leading-relaxed text-neutral-500">
                    {tier.description}
                  </p>

                  {/* Arrow connector (hidden on last) */}
                  {i < tiers.length - 1 && (
                    <div className="absolute top-1/2 -right-3 z-10 hidden -translate-y-1/2 text-neutral-300 lg:block">
                      <ChevronRightIcon className="h-5 w-5" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  ENGINES                                                     */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-[#0a0a0a] px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-sm tracking-[0.2em] text-neutral-500 uppercase">
            Runtime Engines
          </p>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Same Code. Four Faces.
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-neutral-500">
            Write your component once. The active engine renders it with a completely
            different visual identity -- at runtime, with zero code changes.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {engines.map((engine) => (
              <div
                key={engine.name}
                className={`relative overflow-hidden rounded-2xl border ${engine.border} ${engine.bg} p-6 transition hover:border-opacity-60`}
              >
                {/* Accent dot */}
                <div
                  className="mb-5 h-3 w-3 rounded-full"
                  style={{ backgroundColor: engine.accent }}
                />
                <h3 className="mb-1 text-xl font-semibold text-white">{engine.name}</h3>
                <p className="mb-3 text-xs tracking-wider text-neutral-500 uppercase">
                  {engine.runtime}
                </p>
                <p className="text-sm leading-relaxed text-neutral-400">
                  {engine.description}
                </p>

                {/* Decorative preview bar */}
                <div className="mt-6 flex gap-2">
                  <div
                    className="h-8 flex-1 rounded-md opacity-80"
                    style={{ backgroundColor: engine.accent }}
                  />
                  <div className="h-8 w-20 rounded-md bg-neutral-800" />
                  <div className="h-8 w-10 rounded-md bg-neutral-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  VERTICALS                                                   */}
      {/* ---------------------------------------------------------- */}
      <section className="bg-neutral-50 px-6 py-24 text-neutral-900">
        <div className="mx-auto max-w-6xl">
          <p className="mb-2 text-center text-sm tracking-[0.2em] text-neutral-500 uppercase">
            Verticals
          </p>
          <h2 className="mb-4 text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Three Products. One System. Zero Forks.
          </h2>
          <p className="mx-auto mb-14 max-w-xl text-center text-neutral-500">
            Each vertical defines its own brand identity -- colors, typography, motion,
            and product profile -- without duplicating a single component.
          </p>

          <div className="grid gap-6 md:grid-cols-3">
            {verticals.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.name}
                  className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-6 transition hover:shadow-lg"
                >
                  {/* Gradient accent */}
                  <div
                    className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${v.gradient}`}
                  />
                  <div
                    className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: `${v.color}14` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: v.color }} />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{v.name}</h3>
                  <p className="text-sm leading-relaxed text-neutral-500">{v.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- */}
      {/*  CTA FOOTER                                                  */}
      {/* ---------------------------------------------------------- */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0a0a0a] to-[#111] px-6 py-24 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-blue-600/5 to-transparent" />

        <div className="relative z-10 mx-auto max-w-2xl">
          <Palette className="mx-auto mb-6 h-10 w-10 text-neutral-600" />
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Ready to explore?
          </h2>
          <p className="mb-8 text-neutral-500">
            Browse every primitive, pattern, structure, and surface in the interactive showroom.
          </p>
          <Link
            href="/foundations"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 text-sm font-semibold text-black transition hover:bg-neutral-200"
          >
            Enter the Showroom
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer bar */}
      <footer className="border-t border-neutral-800 bg-[#0a0a0a] px-6 py-6 text-center text-xs text-neutral-600">
        @rottay/design-system -- Built for multi-tenant, multi-engine product suites.
      </footer>
    </main>
  );
}
