import Link from "next/link";

interface NavProps {
  active?: "home" | "library" | "create";
}

export function Nav({ active }: NavProps) {
  const navItems = [
    { href: "/", icon: "auto_awesome", label: "Home", key: "home" },
    { href: "/dashboard", icon: "library_music", label: "My Library", key: "library" },
    { href: "/create", icon: "add_circle", label: "Create", key: "create" },
  ];

  return (
    <>
      {/* ── Top header — logo only ── */}
      <header className="fixed top-0 w-full flex items-center px-6 lg:px-8 h-20 bg-background/40 backdrop-blur-[40px] border-b border-white/10 z-50">
        <Link href="/" className="text-xl font-headline font-bold text-primary tracking-tight">
          DeepBook
        </Link>
      </header>

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:flex flex-col h-full w-64 fixed left-0 top-0 pt-24 pb-10 bg-background/60 backdrop-blur-[40px] border-r border-white/10 z-40">
        <div className="px-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="material-symbols-outlined text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <span className="font-headline font-bold text-primary text-lg">The Observatory</span>
          </div>
          <p className="text-[10px] font-label text-on-surface-variant/60 uppercase tracking-[0.2em]">Precision Synthesis</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {navItems.map(({ href, icon, label, key }) => (
            <Link
              key={key}
              href={href}
              className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl font-label text-sm transition-all duration-200 ${
                active === key
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </nav>

        <div className="px-4 mt-auto">
          <Link
            href="/create"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-primary text-on-primary-fixed font-label font-bold text-sm shadow-[0_0_30px_rgba(255,185,95,0.2)] hover:scale-[1.02] transition-transform"
          >
            <span className="material-symbols-outlined text-base">add</span>
            New Generation
          </Link>
        </div>
      </aside>

      {/* ── Mobile bottom nav ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-background/80 backdrop-blur-[64px] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        {[
          { href: "/", icon: "home", label: "Home" },
          { href: "/dashboard", icon: "library_music", label: "Library" },
          { href: "/create", icon: "add_circle", label: "Create" },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-1 text-on-surface-variant p-2">
            <span className="material-symbols-outlined">{icon}</span>
            <span className="text-[10px] font-label">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
