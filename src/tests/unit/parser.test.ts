import { describe, it, expect } from 'vitest';
import { extractTextFromBuffer, analyzeDocumentContent } from '../../lib/ai/parser';
import { generateLawyerPrepPackage } from '../../lib/ai/lawyer-prep';
import { compareDocuments } from '../../lib/ai/comparator';
import { LegalDocument } from '../../types';

describe('Document Parser & Analysis Engine', () => {
  it('extracts raw text from file buffer', async () => {
    const rawContent = 'Section 1.1 Parties\nThis Agreement is entered into on January 15, 2027 by and between Party A and Party B.';
    const buffer = Buffer.from(rawContent, 'utf8');

    const result = await extractTextFromBuffer(buffer, 'agreement.txt', 'text/plain');
    expect(result.text).toContain('January 15, 2027');
    expect(result.pageCount).toBeGreaterThanOrEqual(1);
  });

  it('analyzes text to extract structured clauses, obligations, and dates', () => {
    const text = `
Section 1. Term and Termination
This agreement shall commence on January 1, 2027 and expire on December 31, 2027.
The employee must deliver thirty (30) days prior notice for termination without cause.

Section 2. Restrictive Covenants
Employee shall not compete with Company in North America for a period of twelve (12) months following separation.
    `;

    const parsed = analyzeDocumentContent('doc-101', text, 'Employment Contract', 2);

    expect(parsed.clauses.length).toBeGreaterThan(0);
    expect(parsed.dates.length).toBeGreaterThan(0);
    expect(parsed.obligations.length).toBeGreaterThan(0);

    // Verify date extracted
    const hasJan = parsed.dates.some(d => d.dateStr.includes('January 1, 2027'));
    expect(hasJan).toBe(true);

    // Verify obligation extracted
    const hasObligation = parsed.obligations.some(o => o.description.toLowerCase().includes('notice') || o.description.toLowerCase().includes('shall not compete'));
    expect(hasObligation).toBe(true);
  });

  it('generates a lawyer preparation package based on detected clauses and obligations', () => {
    const dummyDoc: LegalDocument = {
      id: 'doc-prep-test',
      userId: 'usr-1',
      filename: 'Consulting Agreement.pdf',
      documentType: 'Service Agreement',
      fileSize: 1024,
      mimeType: 'application/pdf',
      pageCount: 3,
      status: 'READY',
      summary: 'Test summary',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const text = `
Section 3. Non-Competition Restriction
Consultant shall not compete with Company for 24 months post-termination.

Section 4. Termination Notice
Either party may terminate on September 1, 2028 with 60 days advance notice.
    `;

    const parsed = analyzeDocumentContent(dummyDoc.id, text, dummyDoc.documentType, dummyDoc.pageCount);
    const prep = generateLawyerPrepPackage(dummyDoc, parsed.clauses, parsed.obligations, parsed.dates);

    expect(prep.documentId).toBe(dummyDoc.id);
    expect(prep.questionsToAskCounsel.length).toBeGreaterThan(0);
    expect(prep.documentsToBring.length).toBeGreaterThan(0);
    expect(prep.actionPlan.length).toBeGreaterThan(0);
  });

  it('accurately compares two documents and categorizes changes', () => {
    const docA: LegalDocument = {
      id: 'doc-a',
      userId: 'usr-1',
      filename: 'Draft_v1.pdf',
      documentType: 'Service Agreement',
      fileSize: 1024,
      mimeType: 'application/pdf',
      pageCount: 2,
      status: 'READY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docB: LegalDocument = {
      id: 'doc-b',
      userId: 'usr-1',
      filename: 'Draft_v2.pdf',
      documentType: 'Service Agreement',
      fileSize: 1024,
      mimeType: 'application/pdf',
      pageCount: 2,
      status: 'READY',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const parsedA = analyzeDocumentContent(docA.id, 'Section 1. Fee is $5,000 payable monthly.', 'Service Agreement', 1);
    const parsedB = analyzeDocumentContent(docB.id, 'Section 1. Fee is $8,000 payable bi-weekly.\n\nSection 2. Audit Rights. Company shall audit records annually.', 'Service Agreement', 2);

    const diffResult = compareDocuments(docA, docB, parsedA.clauses, parsedB.clauses);

    expect(diffResult.documentAId).toBe(docA.id);
    expect(diffResult.documentBId).toBe(docB.id);
    expect(diffResult.clauseDiffs.length).toBeGreaterThan(0);
    expect(diffResult.summary.totalChanges).toBeGreaterThan(0);
  });
});
