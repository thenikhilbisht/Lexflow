import { describe, it, expect } from 'vitest';
import { generateGroundedAnswer } from '../../lib/ai/citations';
import { Clause } from '../../types';

describe('Citation Engine & Abstention Grounding', () => {
  const clauses: Clause[] = [
    {
      id: 'cl-1',
      documentId: 'doc-test',
      sectionNumber: '11.2',
      pageNumber: 18,
      category: 'Termination',
      title: 'Termination Without Cause Notice Period',
      originalText: 'Either party may terminate this Agreement without cause upon providing thirty (30) days prior written notice.',
      plainEnglish: 'You or the employer may terminate without cause by giving 30 days notice.',
      whoItAffects: 'Both Parties',
      attentionLevel: 'INFORMATIONAL'
    }
  ];

  it('provides precise citations with Section and Page numbers for stated terms', () => {
    const result = generateGroundedAnswer('What is the notice period for terminating without cause?', clauses);
    expect(result.sourceStatus).toBe('DIRECTLY_STATED');
    expect(result.citations.length).toBeGreaterThan(0);
    expect(result.citations[0].section).toContain('11.2');
    expect(result.citations[0].page).toBe(18);
  });

  it('reliably abstains without hallucinating when a concept is not present in document', () => {
    const result = generateGroundedAnswer('Does this agreement offer pet daycare benefits and cryptocurrency stock options?', clauses);
    expect(result.sourceStatus).toBe('NOT_FOUND');
    expect(result.statusLabel).toBe('— Not found in document');
    expect(result.answer).toContain("I couldn't find a reliable answer in this document");
    expect(result.citations).toHaveLength(0);
  });
});
