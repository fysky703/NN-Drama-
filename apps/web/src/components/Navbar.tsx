import Link from "next/link";
import { Bot, FolderOpen, ScanLine, Settings2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "New Scan", icon: ScanLine },
  { href: "/projects", label: "Projects", icon: FolderOpen },
  { href: "/docs", label: "Documentation", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings2 },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white shadow-[0_0_20px_rgba(99,102,241,0.4)] transition group-hover:shadow-[0_0_28px_rgba(99,102,241,0.6)]">
            <Bot size={18} />
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            NN <span className="text-brand">Drama</span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted transition hover:bg-elevated hover:text-ink",
                link.href === "/" && "text-ink",
              )}
            >
              <link.icon size={15} />
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}