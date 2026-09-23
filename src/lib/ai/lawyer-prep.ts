import { LegalDocument, Clause, Obligation, ExtractedDate, LawyerPrepPackage } from '@/types';

export function generateLawyerPrepPackage(
  doc: LegalDocument,
  clauses: Clause[],
  obligations: Obligation[],
  dates: ExtractedDate[]
): LawyerPrepPackage {
  // 1. Identify key clauses to review (Prioritize HIGH or REVIEW attention)
  const highAttentionClauses = clauses.filter(
    c => c.attentionLevel === 'HIGH' || c.attentionLevel === 'REVIEW'
  );

  const clausesToSelect = highAttentionClauses.length > 0 
    ? highAttentionClauses.slice(0, 5)
    : clauses.slice(0, 4);

  const keyClausesToReview = clausesToSelect.map(c => {
    let risk = 'Contains operational commitments or compliance duties.';
    if (c.category === 'Restrictions' || c.category === 'Intellectual Property') {
      risk = 'May limit post-agreement commercial flexibility, inventions, or outside activities.';
    } else if (c.category === 'Termination' || c.category === 'Renewal') {
      risk = 'Strict notice windows or conditions may lock party into commitments or sever rights prematurely.';
    } else if (c.category === 'Liability' || c.category === 'Indemnification') {
      risk = 'Exposes party to potential uncapped damages or third-party defense obligations.';
    } else if (c.category === 'Dispute Resolution') {
      risk = 'May restrict appellate rights or mandate unfavorable venue/jurisdiction.';
    }

    return {
      category: c.category,
      section: `Section ${c.sectionNumber}`,
      page: c.pageNumber,
      clauseSummary: c.plainEnglish || c.title,
      potentialRisk: risk
    };
  });

  // 2. Generate counsel questions based on detected categories
  const questions: string[] = [];
  const categories = new Set(clauses.map(c => c.category));

  if (categories.has('Restrictions')) {
    questions.push('Are the restrictive covenants (non-compete / non-solicitation) legally enforceable under governing state law?');
  }
  if (categories.has('Termination') || categories.has('Renewal')) {
    questions.push('What exact notice triggers and cure periods apply before either party can terminate or trigger automatic renewal?');
  }
  if (categories.has('Liability') || categories.has('Indemnification')) {
    questions.push('Does the liability limitation provide mutual protection or does it disproportionately expose our side?');
  }
  if (categories.has('Dispute Resolution')) {
    questions.push('Is the dispute resolution venue, arbitration forum, and fee-shifting mechanism commercially standard and balanced?');
  }
  if (questions.length < 3) {
    questions.push('Are there any missing standard protections or ambiguous terms in the agreement that should be clarified?');
    questions.push('What amendments or carve-outs should be requested prior to executing or renewing this agreement?');
  }

  // 3. Documents to bring
  const documentsToBring = [
    `Original signed copy or draft of ${doc.filename}`,
    'Prior email correspondence and term sheets discussing key commercial terms',
    'Any referenced exhibits, schedules, statement of work (SOW), or addenda',
    'Previous agreements between the parties that could create overlapping obligations'
  ];

  // 4. Action plan derived from obligations and dates
  const actionPlan: LawyerPrepPackage['actionPlan'] = [];

  // Add date-related tasks
  dates.slice(0, 2).forEach((d, idx) => {
    actionPlan.push({
      id: `act-date-${idx}`,
      type: 'DOCUMENT_DERIVED',
      task: `Calendar critical milestone on ${d.dateStr} (${d.description}) [${d.sourceSection}]`,
      completed: false
    });
  });

  // Add obligation-related tasks
  obligations.filter(o => o.party === 'USER').slice(0, 2).forEach((o, idx) => {
    actionPlan.push({
      id: `act-ob-${idx}`,
      type: 'DOCUMENT_DERIVED',
      task: `Verify compliance procedure for: "${o.description.substring(0, 90)}..." [${o.sourceSection}]`,
      completed: false
    });
  });

  // General counsel consultation action
  actionPlan.push({
    id: 'act-counsel',
    type: 'GENERAL_SUGGESTION',
    task: `Schedule a 30-minute legal consultation to review highlighted risks and finalize negotiation stance.`,
    completed: false
  });

  return {
    documentId: doc.id,
    overview: {
      documentType: doc.documentType,
      parties: ['Designated Party A', 'Designated Party B'],
      duration: 'Standard Term (refer to Section 1 or Term Clause)',
      governingLaw: 'Applicable State Jurisdiction',
      summary: doc.summary || `Executive analysis of ${doc.filename} containing ${clauses.length} evaluated clauses.`
    },
    keyClausesToReview,
    questionsToAskCounsel: questions.slice(0, 4),
    documentsToBring,
    actionPlan
  };
}
