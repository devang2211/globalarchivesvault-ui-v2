export const Footer = () => {
  const year = new Date().getFullYear()

  return (
    <footer className="shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-6 py-3 flex items-center justify-center gap-4">
      <p className="text-xs text-muted-foreground">
        &copy; {year} Global Archives Vault. All rights reserved.
      </p>
      <span className="text-muted-foreground/40 text-xs">·</span>
      <p className="text-xs text-muted-foreground">v1.0.0</p>
    </footer>
  )
}
