import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, ArrowRight, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("sanjaya_user", email || "marcus.vance@conseal.ai");
      navigate("/upload");
    }, 900);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient glowing gradient backdrop */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Security Briefing / Value Prop */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Zero-Trust Enterprise Session
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Verify every token before prompting LLMs.
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed">
            Sanjaya processes documents inside ephemeral browser memory. Sign in to sync your custom cryptographic passports and challenge logs across devices.
          </p>

          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-success/15 text-success flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Client-Side Memory Sandbox</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Raw documents never touch database disks or cloud storage buckets.</p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="h-9 w-9 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Cryptographic Verification Passports</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Generate courts-ready adversarial audit trails for legal compliance.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-border/60 flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <Lock className="h-3.5 w-3.5 text-success" /> End-to-End Encrypted
            </span>
            <span>•</span>
            <span>SOC2 Type II Compliant Architecture</span>
          </div>
        </motion.div>

        {/* Right column: Glassmorphic Sign In Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-emerald-500 to-purple-500" />

            <div className="mb-8 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">Sign in to Sanjaya</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Access your secure document verification workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Password / Passkey
                  </label>
                  <a href="#" className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm pr-10 transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-soft transition-transform active:scale-[0.99]"
              >
                {loading ? "Authenticating Session..." : "Sign In to Workspace"}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            <div className="relative my-7">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-3 text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={handleSubmit}
                className="h-11 rounded-xl text-xs font-medium border-border/80 hover:bg-muted/50"
              >
                Enterprise SSO / SAML
              </Button>
              <Button
                variant="outline"
                type="button"
                onClick={handleSubmit}
                className="h-11 rounded-xl text-xs font-medium border-border/80 hover:bg-muted/50"
              >
                Passkey Authentication
              </Button>
            </div>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Don't have an enterprise account yet?{" "}
              <Link to="/signup" className="font-semibold text-primary hover:underline">
                Create free account
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
