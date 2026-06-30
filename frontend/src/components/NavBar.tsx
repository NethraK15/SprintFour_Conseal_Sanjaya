import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const navigate = useNavigate();
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    setUser(localStorage.getItem("sanjaya_user"));
  }, [location.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem("sanjaya_user");
    setUser(null);
    navigate("/");
  };

  const isAuthPage = location.pathname === "/login" || location.pathname === "/signup";
  const isLanding = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 glass border-b border-border/70 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="font-bold tracking-tight text-xl flex items-center gap-2 hover:text-primary transition-colors">
            <Shield className="h-5 w-5 text-primary" />
            Sanjaya
          </Link>

          {!isLanding && !isAuthPage && (
            <nav className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full border border-border/50">
              {STEPS.map((step) => {
                const active = location.pathname === step.path;
                return (
                  <span
                    key={step.path}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all",
                      active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                );
              })}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary/10 border border-primary/20 px-3 py-1 text-xs font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                {user}
              </span>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-xs text-muted-foreground hover:text-danger">
                <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold">
                  <LogIn className="h-3.5 w-3.5 mr-1.5" />
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button size="sm" className="text-xs font-semibold shadow-soft">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
