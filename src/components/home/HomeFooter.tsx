import Image from "next/image";

const NAV_LINKS = [
  { label: "CONCEPT", href: "#concept" },
  { label: "FACILITY", href: "#facility" },
  { label: "SERVICES", href: "#services" },
  { label: "PRICING", href: "#pricing" },
  { label: "ACCESS", href: "#access" },
  { label: "CONTACT", href: "#contact" },
] as const;

export default function HomeFooter() {
  return (
    <footer className="bg-deep-black">
      <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #306EC3, transparent)' }} />

      <div className="mx-auto max-w-7xl px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* Left: Logo */}
          <div>
            <Image
              src="/logos/yoko-w.png"
              alt="THE PICKLE BANG THEORY"
              width={200}
              height={32}
              className="h-8 w-auto"
            />
          </div>

          {/* Center: Nav links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-3 lg:justify-center">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm tracking-[0.15em] text-text-gray hover:text-text-light transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right: Email */}
          <div className="lg:text-right">
            <a
              href="mailto:hello@rstagency.com"
              className="text-sm text-text-gray hover:text-accent transition-colors"
            >
              hello@rstagency.com
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-text-gray/20">
        <div className="mx-auto max-w-7xl px-6 lg:px-12 py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-gray">
            &copy; 2026 RST Agency Inc.
          </p>
          <p className="text-xs text-text-gray">
            〒272-0021 千葉県市川市八幡2-16-6 6階
          </p>
        </div>
      </div>
    </footer>
  );
}
