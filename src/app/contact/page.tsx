import Link from "next/link";
import { ArrowLeft, Mail, Building, MapPin, Phone } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand-cyan transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Return to Home
      </Link>

      <div className="space-y-2 border-b border-border/80 pb-6">
        <span className="text-xs font-mono text-brand-cyan uppercase tracking-wider">
          Enterprise Relations
        </span>
        <h1 className="text-3xl font-extrabold text-white">Contact & Support Desk</h1>
        <p className="text-xs text-zinc-400">Available 24/7/365 for Enterprise SLA Clients</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border bg-[#0E1017] p-6 space-y-3">
          <div className="h-9 w-9 rounded-lg bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center text-brand-cyan">
            <Mail className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-white">General Inquiries & Billing</h3>
          <p className="text-xs text-zinc-400">
            For invoicing, high-ticket wire authorizations, and merchant documentation:
          </p>
          <div className="pt-2 font-mono text-xs text-brand-cyan font-bold">
            billing@flywaycloud.ai
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-[#0E1017] p-6 space-y-3">
          <div className="h-9 w-9 rounded-lg bg-brand-purple/10 border border-brand-purple/30 flex items-center justify-center text-brand-purple">
            <MapPin className="h-4 w-4" />
          </div>
          <h3 className="text-base font-bold text-white">Corporate Offices</h3>
          <p className="text-xs text-zinc-400">
            <strong>Americas HQ:</strong> 100 University Ave, Suite 1900, Toronto, ON M5J 1V6, Canada
          </p>
          <p className="text-xs text-zinc-400">
            <strong>EMEA Node:</strong> Dubai International Financial Centre (DIFC), Gate Precinct 4, Dubai, UAE
          </p>
        </div>
      </div>
    </div>
  );
}
