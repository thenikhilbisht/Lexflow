import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface LegalDisclaimerBannerProps {
  compact?: boolean;
}

export const LegalDisclaimerBanner: React.FC<LegalDisclaimerBannerProps> = ({ compact = false }) => {
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
        <Info className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
        <span><strong>Legal Information Notice:</strong> LexiGuide provides informational assistance only, not formal legal advice.</span>
      </div>
    );
  }

  return (
    <aside
      aria-label="Legal Disclaimer"
      className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 flex items-start gap-3 shadow-sm"
    >
      <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
      <div className="space-y-1">
        <p className="font-semibold text-amber-950">Important Legal Positioning & Boundary Notice</p>
        <p className="leading-relaxed text-amber-800/90">
          LexiGuide provides general information and document-understanding assistance. It does not provide legal advice, establish an attorney-client relationship, or determine whether a legal provision is enforceable. Laws and legal outcomes depend on jurisdiction and individual circumstances. Always consider consulting a qualified legal professional for advice about your situation.
        </p>
      </div>
    </aside>
  );
};
