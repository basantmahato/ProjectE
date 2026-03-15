import Link from "next/link";

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Updates", href: "#" },
  ],
  Resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Blog", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[var(--navy-900)] py-16 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-2 gap-12 md:grid-cols-4 lg:grid-cols-5">
          <div className="col-span-2 space-y-6 lg:col-span-2">
            <div className="flex items-center gap-2 text-white">
              <span className="material-symbols-outlined text-3xl text-[var(--primary)]">
                school
              </span>
              <span className="text-2xl font-bold tracking-tight">
                EduSaaS
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed">
              Exam prep made simple: question bank, mock tests, sample papers,
              notes, and interview prep in one platform.
            </p>
            <div className="flex gap-4">
              <a href="#" className="transition-colors hover:text-[var(--primary)]">
                <span className="material-symbols-outlined">public</span>
              </a>
              <a href="#" className="transition-colors hover:text-[var(--primary)]">
                <span className="material-symbols-outlined">share</span>
              </a>
              <a href="#" className="transition-colors hover:text-[var(--primary)]">
                <span className="material-symbols-outlined">link</span>
              </a>
            </div>
          </div>

          <div>
            <h6 className="mb-6 font-bold text-white">Product</h6>
            <ul className="space-y-4 text-sm">
              {FOOTER_LINKS.Product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className="mb-6 font-bold text-white">Resources</h6>
            <ul className="space-y-4 text-sm">
              {FOOTER_LINKS.Resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h6 className="mb-6 font-bold text-white">Company</h6>
            <ul className="space-y-4 text-sm">
              {FOOTER_LINKS.Company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="transition-colors hover:text-[var(--primary)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col border-t border-[var(--navy-800)] pt-8 md:flex-row md:items-center md:justify-between md:gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} EduSaaS. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs">
            <Link
              href="#"
              className="transition-colors hover:text-[var(--primary)]"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[var(--primary)]"
            >
              Terms of Service
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[var(--primary)]"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
