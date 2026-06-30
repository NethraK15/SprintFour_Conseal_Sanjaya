import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, ShieldCheck, SlidersHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import RedactionBackground from "@/components/RedactionBackground";

const FEATURES = [
  {
    icon: Eye,
    title: "Explain",
    description:
      "Every detected entity comes with a clear, human-readable explanation of why it was flagged — no black boxes.",
  },
  {
    icon: ShieldCheck,
    title: "Verify",
    description:
      "Challenge any AI decision in the AI Courtroom. See the evidence, the alternatives, and the reasoning before you trust it.",
  },
  {
    icon: SlidersHorizontal,
    title: "Control",
    description:
      "Keep hidden, reveal, or edit — you make the final call on every single piece of sensitive information.",
  },
];

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute -top-40 -left-40 h-[480px] w-[480px] rounded-full bg-blue-300/30 blur-3xl pointer-events-none animate-float" />
      <div
        className="absolute -bottom-40 -right-40 h-[480px] w-[480px] rounded-full bg-sky-300/30 blur-3xl pointer-events-none animate-float"
        style={{ animationDelay: "2s" }}
      />

      <section className="container relative pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-primary mb-8 shadow-sm"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Explainable & Verifiable AI
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.08]"
          >
            Your Documents Deserve{" "}
            <span className="text-gradient">Trust</span> Before Intelligence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed"
          >
            Review every AI decision before sharing your document with AI.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-10 flex items-center justify-center gap-4"
          >
            <Button asChild size="lg" className="group">
              <Link to="/upload">
                Witness the AI
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-20"
        >
          <RedactionBackground />
        </motion.div>
      </section>

      <section className="container relative pb-28">
        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass rounded-2xl p-7 shadow-soft hover:shadow-glow transition-shadow"
            >
              <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <f.icon className="h-5 w-5 text-primary" strokeWidth={2.2} />
              </div>
              <h3 className="text-lg font-semibold mb-2 tracking-tight">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="container relative pb-24">
        <div className="rounded-3xl glass p-10 md:p-14 text-center shadow-soft">
          <p className="text-sm font-medium text-primary mb-3 tracking-wide uppercase">The Sanjaya Promise</p>
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
            Nothing leaves your control until you approve every decision.
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Built for product managers, founders, and teams who want the power of AI without
            gambling on confidential data.
          </p>
          <Button asChild size="lg">
            <Link to="/upload">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
