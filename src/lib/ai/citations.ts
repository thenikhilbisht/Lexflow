// Citation engine and Source Status evaluator based on PRD §16 & §17
import { Citation, SourceStatus, Clause } from '@/types';
import { NOT_FOUND_RESPONSE } from './guardrails';

export interface GroundedAnswer {
  answer: string;
  sourceStatus: SourceStatus;
  statusLabel: string;
  citations: Citation[];
  suggestedFollowUps: string[];
}

/**
 * Searches clauses for matches against user query and extracts grounded citations.
 */
export function generateGroundedAnswer(query: string, clauses: Clause[]): GroundedAnswer {
  const qLower = query.toLowerCase();

  const COMMON_STOP_WORDS = new Set([
    'what', 'when', 'where', 'which', 'who', 'whom', 'whose', 'why', 'how',
    'does', 'this', 'that', 'these', 'those', 'have', 'there', 'about',
    'agreement', 'contract', 'party', 'parties', 'section', 'document', 'offer',
    'provide', 'shall', 'under', 'herein', 'thereof', 'with', 'from', 'into'
  ]);

  const queryWords = qLower
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 3 && !COMMON_STOP_WORDS.has(w));

  const notFoundText = `${NOT_FOUND_RESPONSE} I couldn't find a reliable answer in this document. You can try asking the question differently or review the relevant sections manually.`;

  // If after removing stop words there are substantive terms, check if any appear
  if (queryWords.length > 0) {
    const isSubstantiveTermPresent = clauses.some(c => {
      const text = (c.originalText + ' ' + c.title + ' ' + c.plainEnglish + ' ' + c.category).toLowerCase();
      return queryWords.some(word => text.includes(word));
    });

    if (!isSubstantiveTermPresent) {
      return {
        answer: notFoundText,
        sourceStatus: 'NOT_FOUND',
        statusLabel: '— Not found in document',
        citations: [],
        suggestedFollowUps: [
          'What are my termination notice requirements?',
          'Can this agreement renew automatically?',
          'What are my compensation and salary details?'
        ]
      };
    }
  }

  // Find relevant clauses ranked by term frequency
  const scoredClauses = clauses.map(c => {
    let score = 0;
    const combined = (c.originalText + ' ' + c.title + ' ' + c.plainEnglish + ' ' + c.category).toLowerCase();

    for (const w of queryWords) {
      if (c.title.toLowerCase().includes(w)) score += 6;
      if (c.category.toLowerCase().includes(w)) score += 5;
      if (combined.includes(w)) score += 2;
    }

    return { clause: c, score };
  }).filter(item => item.score >= 4)
    .sort((a, b) => b.score - a.score);

  if (scoredClauses.length === 0) {
    return {
      answer: notFoundText,
      sourceStatus: 'NOT_FOUND',
      statusLabel: '— Not found in document',
      citations: [],
      suggestedFollowUps: ['What is the term of this agreement?', 'What happens if I terminate early?']
    };
  }

  const top = scoredClauses[0].clause;
  const citations: Citation[] = scoredClauses.slice(0, 2).map(sc => ({
    id: `cit-${sc.clause.id}`,
    section: `Section ${sc.clause.sectionNumber}`,
    page: sc.clause.pageNumber,
    excerpt: sc.clause.originalText.substring(0, 160) + '...',
    relevanceScore: Math.min(100, sc.score * 12)
  }));

  // Determine source status
  let sourceStatus: SourceStatus = 'DIRECTLY_STATED';
  let statusLabel = '✓ Directly stated';

  if (top.originalText.toLowerCase().includes('sole discretion') || top.originalText.toLowerCase().includes('reasonable efforts')) {
    sourceStatus = 'AMBIGUOUS';
    statusLabel = '? Unclear / ambiguous';
  } else if (scoredClauses.length > 1 && scoredClauses[0].score < 8) {
    sourceStatus = 'INFERRED';
    statusLabel = '≈ Inferred from document';
  }

  const answer = `Based on ${top.title} (Section ${top.sectionNumber}), ${top.plainEnglish}

${top.yourObligation ? `**Your Obligation:** ${top.yourObligation}` : ''}
${top.whenItApplies ? `**When It Applies:** ${top.whenItApplies}` : ''}`;

  return {
    answer,
    sourceStatus,
    statusLabel,
    citations,
    suggestedFollowUps: [
      `What are the consequences under Section ${top.sectionNumber}?`,
      'How does this interact with termination?',
      'What questions should I ask a lawyer about this?'
    ]
  };
}
