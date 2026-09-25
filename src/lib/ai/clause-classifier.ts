import { ClauseCategory, Clause, AttentionLevel } from '@/types';

interface ClassifierPattern {
  category: ClauseCategory;
  keywords: string[];
  patterns: RegExp[];
  defaultAttention: AttentionLevel;
  whoItAffectsDefault: string;
}

export const CLAUSE_TAXONOMY: ClassifierPattern[] = [
  {
    category: 'Renewal',
    keywords: ['automatic renewal', 'renew automatically', 'successive terms', 'evergreen', 'extension of term', 'notice of non-renewal'],
    patterns: [/renew(s|al)?\s+automatically/i, /automatic(ally)?\s+renew/i, /successive\s+(one-year|annual|monthly)\s+periods/i],
    defaultAttention: 'HIGH',
    whoItAffectsDefault: 'Both Parties'
  },
  {
    category: 'Termination',
    keywords: ['terminate without cause', 'for cause', 'termination notice', 'immediate termination', 'severance', 'resignation', 'convenience', 'terminate this agreement'],
    patterns: [/terminat(e|ion).*?(without|for)\s+cause/i, /terminat(e|ion)\s+(of\s+)?(employment|agreement)/i, /notice\s+of\s+termination/i, /severance\s+(pay|package)/i],
    defaultAttention: 'REVIEW',
    whoItAffectsDefault: 'Both Parties'
  },
  {
    category: 'Restrictions',
    keywords: ['non-competition', 'non-compete', 'non-solicitation', 'restrictive covenants', 'exclusive service', 'outside business'],
    patterns: [/non-compet(e|ition)/i, /non-solicit(ation)?/i, /shall\s+not\s+(directly\s+or\s+indirectly\s+)?(engage|compete)/i],
    defaultAttention: 'HIGH',
    whoItAffectsDefault: 'Restricted Party (e.g. Employee or Vendor)'
  },
  {
    category: 'Payment',
    keywords: ['base salary', 'annual bonus', 'fee', 'monthly rent', 'invoicing', 'reimbursement', 'compensation', 'hourly rate'],
    patterns: [/base\s+salary\s+of/i, /pay(able)?\s+in\s+installments/i, /compensation\s+and\s+benefits/i, /\$\d[\d,]*/],
    defaultAttention: 'INFORMATIONAL',
    whoItAffectsDefault: 'Payor & Payee'
  },
  {
    category: 'Intellectual Property',
    keywords: ['inventions', 'proprietary rights', 'copyright', 'patent', 'work made for hire', 'assignment of ip', 'trade secrets'],
    patterns: [/inventions\s+and\s+works/i, /belong\s+exclusively\s+to/i, /work(s)?\s+made\s+for\s+hire/i, /assign(s|ment)?\s+of\s+intellectual\s+property/i],
    defaultAttention: 'UNDERSTAND',
    whoItAffectsDefault: 'Creator / Employee / Contractor'
  },
  {
    category: 'Confidentiality',
    keywords: ['confidential information', 'non-disclosure', 'trade secrets', 'proprietary data', 'confidentiality period'],
    patterns: [/hold\s+all\s+confidential\s+information/i, /strictest\s+confidence/i, /shall\s+not\s+disclose/i],
    defaultAttention: 'UNDERSTAND',
    whoItAffectsDefault: 'Receiving Party'
  },
  {
    category: 'Dispute Resolution',
    keywords: ['binding arbitration', 'american arbitration association', 'aaa', 'waiver of jury trial', 'mediation', 'venue', 'jurisdiction'],
    patterns: [/binding\s+arbitration/i, /waive\s+(any\s+)?right\s+to\s+trial\s+by\s+jury/i, /dispute\s+resolution/i],
    defaultAttention: 'REVIEW',
    whoItAffectsDefault: 'Both Parties'
  },
  {
    category: 'Indemnification',
    keywords: ['indemnify', 'hold harmless', 'defense of claims', 'liabilities and legal expenses', 'indemnity'],
    patterns: [/indemnify\s+(and\s+)?hold\s+harmless/i, /defend,\s+indemnify/i],
    defaultAttention: 'REVIEW',
    whoItAffectsDefault: 'Indemnifying Party'
  },
  {
    category: 'Liability',
    keywords: ['limitation of liability', 'liability cap', 'consequential damages', 'aggregate liability', 'sole remedy'],
    patterns: [/limit(ation)?\s+of\s+liability/i, /aggregate\s+liability/i, /consequential\s+damages/i],
    defaultAttention: 'HIGH',
    whoItAffectsDefault: 'Both Parties'
  },
  {
    category: 'Notice',
    keywords: ['written notice', 'prior notice', 'notice requirement', 'certified mail', 'email notice'],
    patterns: [/written\s+notice\s+to/i, /\d+\s+days['’]?\s+prior\s+written\s+notice/i],
    defaultAttention: 'UNDERSTAND',
    whoItAffectsDefault: 'Notifying Party'
  },
  {
    category: 'Governing Law',
    keywords: ['governing law', 'jurisdiction', 'construed under the laws', 'state of', 'conflicts of law'],
    patterns: [/governed\s+by\s+the\s+laws\s+of/i, /construed,\s+interpreted/i],
    defaultAttention: 'INFORMATIONAL',
    whoItAffectsDefault: 'Both Parties'
  },
  {
    category: 'Data & Privacy',
    keywords: ['gdpr', 'ccpa', 'personal data', 'security breach', 'data protection', 'hipaa', 'privacy policy'],
    patterns: [/personal\s+data/i, /security\s+breach/i, /data\s+protection/i],
    defaultAttention: 'REVIEW',
    whoItAffectsDefault: 'Data Processor & Data Subject'
  },
  {
    category: 'Insurance',
    keywords: ['d&o insurance', 'commercial general liability', 'errors and omissions', 'policy limits', 'certificate of insurance'],
    patterns: [/maintain(s)?\s+.*insurance/i, /insurance\s+coverage/i],
    defaultAttention: 'INFORMATIONAL',
    whoItAffectsDefault: 'Insured Party'
  },
  {
    category: 'Warranties',
    keywords: ['express warranty', 'as is', 'disclaimer of warranties', 'merchantability', 'fitness for particular purpose'],
    patterns: [/warrant(s|y)?\s+that/i, /disclaim(s|er)?\s+all\s+warranties/i],
    defaultAttention: 'UNDERSTAND',
    whoItAffectsDefault: 'Warrantor'
  },
  {
    category: 'Penalties',
    keywords: ['liquidated damages', 'late fee', 'interest penalty', 'default surcharge'],
    patterns: [/liquidated\s+damages/i, /late\s+fee\s+of/i, /penalty/i],
    defaultAttention: 'HIGH',
    whoItAffectsDefault: 'Defaulting Party'
  }
];

export function classifyClause(text: string): {
  category: ClauseCategory;
  attentionLevel: AttentionLevel;
  whoItAffects: string;
} {
  const lower = text.toLowerCase();

  for (const rule of CLAUSE_TAXONOMY) {
    // Check keywords first (fast substring lookup)
    for (let i = 0; i < rule.keywords.length; i++) {
      if (lower.includes(rule.keywords[i])) {
        return {
          category: rule.category,
          attentionLevel: rule.defaultAttention,
          whoItAffects: rule.whoItAffectsDefault
        };
      }
    }
    // Fallback to regex evaluation
    for (let i = 0; i < rule.patterns.length; i++) {
      if (rule.patterns[i].test(text)) {
        return {
          category: rule.category,
          attentionLevel: rule.defaultAttention,
          whoItAffects: rule.whoItAffectsDefault
        };
      }
    }
  }

  return {
    category: 'Other',
    attentionLevel: 'INFORMATIONAL',
    whoItAffects: 'Both Parties'
  };
}
