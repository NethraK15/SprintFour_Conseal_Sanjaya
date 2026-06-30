import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const STEPS = [
  { path: "/upload", label: "Upload" },
  { path: "/replay", label: "Replay" },
  { path: "/review", label: "Review" },
  { path: "/verification", label: "Verify" },
  { path: "/passport", label: "Passport" },
  { path: "/export", label: "Export" },
];

export default function NavBar() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 glass border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-semibold tracking-tight text-lg hover:text-primary transition-colors">
          Sanjaya
        </Link>

        {!isLanding && (
          <nav className="hidden md:flex items-center gap-1">
            {STEPS.map((step) => {
              const active = location.pathname === step.path;
              return (
                <span
                  key={step.path}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
                    active ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              );
            })}
          </nav>
        )}

        <div className="text-xs text-muted-foreground font-medium hidden sm:block">
          Don't Trust Us. Verify Us.
        </div>
      </div>
    </header>
  );
}
