import { Github } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-6 md:px-8">
        <div className="flex items-center justify-center gap-4">
          <p className="text-base text-muted-foreground">
            ©{" "}
            <a
              href="https://www.torn.com/profiles.php?XID=1712955"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-foreground hover:underline"
            >
              oxiblurr [1712955]
            </a>
          </p>
          <a
            href="https://github.com/blacksmithop/TRA"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label="View source on GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  )
}
