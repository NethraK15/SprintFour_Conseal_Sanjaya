import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, ArrowRight, Eye, EyeOff, Check, Sparkles, Lock, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Signup() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [org, setOrg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("sanjaya_user", email || "new.user@conseal.ai");
      navigate("/upload");
    }, 900);
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Ambient glowing background spheres */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left column: Security & Privacy Guarantee */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-6 space-y-6 text-left hidden lg:block pr-6"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-600">
            <Sparkles className="h-3.5 w-3.5" />
            14-Day Free Enterprise Trial
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight leading-tight">
            Take back control over sensitive AI prompts.
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed">
            Empower your team with verifiable data redaction and explainable AI courtroom audits. Get started in less than 60 seconds.
          </p>

          <div className="space-y-3 pt-2">
            {[
              "Instant side-by-side PII & trade-secret sanitization",
              "Interactive 'Ask Sanjaya Why' interrogation on any phrase",
              "Cryptographic verification passports for legal compliance",
              "Zero-retention memory architecture — nothing saved to disk",
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-6 w-6 rounded-full bg-success/20 text-success flex items-center justify-center shrink-0">
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                </div>
                <span className="text-sm font-medium text-foreground/90">{feature}</span>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-border/60 flex items-center gap-3 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary" />
            <span>No credit card required • Unlimited ephemeral document scans</span>
          </div>
        </motion.div>

        {/* Right column: Glassmorphic Signup Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-6 w-full max-w-md mx-auto"
        >
          <div className="rounded-3xl border border-border/80 bg-card/80 backdrop-blur-xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-primary to-purple-500" />

            <div className="mb-6 text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">Create your account</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Start protecting confidential documents before AI ingestion.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Marcus Vance"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Work Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marcus@company.com"
                  className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Organization / Company Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={org}
                    onChange={(e) => setOrg(e.target.value)}
                    placeholder="Conseal Security Labs"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm pl-10 transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                  <Building2 className="h-4 w-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Secure Passkey / Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create strong passkey"
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-2.5 text-sm pr-10 transition-all focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-soft transition-transform active:scale-[0.99] mt-2"
              >
                {loading ? "Creating Ephemeral Session..." : "Create Account & Start Scanning"}
                {!loading && <ArrowRight className="h-4 w-4 ml-2" />}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Already have an enterprise account?{" "}
              <Link to="/login" className="font-semibold text-primary hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
