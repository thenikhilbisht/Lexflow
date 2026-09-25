import { describe, it, expect } from 'vitest';
import { compareDocuments } from '../../lib/ai/comparator';
import { LegalDocument, Clause } from '@/types';

describe('Document Comparison Engine', () => {
  const mockDocA: LegalDocument = {
    id: 'doc-a',
    userId: 'usr-1',
    filename: 'Agreement_v1.txt',
    documentType: 'Service Agreement',
    fileSize: 1024,
    mimeType: 'text/plain',
    status: 'COMPLETED',
    pageCount: 1,
    summary: 'Version 1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const mockDocB: LegalDocument = {
    id: 'doc-b',
    userId: 'usr-1',
    filename: 'Agreement_v2.txt',
    documentType: 'Service Agreement',
    fileSize: 1200,
    mimeType: 'text/plain',
    status: 'COMPLETED',
    pageCount: 1,
    summary: 'Version 2',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const clausesA: Clause[] = [
    {
      id: 'cl-a1',
      documentId: 'doc-a',
      sectionNumber: '3.1',
      pageNumber: 1,
      category: 'Termination',
      title: 'Termination Notice',
      originalText: 'Either party may terminate upon 30 days notice.',
      plainEnglish: '30 days termination notice.',
      whoItAffects: 'Both Parties',
      attentionLevel: 'INFORMATIONAL'
    }
  ];

  const clausesB: Clause[] = [
    {
      id: 'cl-b1',
      documentId: 'doc-b',
      sectionNumber: '3.1',
      pageNumber: 1,
      category: 'Termination',
      title: 'Termination Notice',
      originalText: 'Either party may terminate upon 60 days notice.',
      plainEnglish: '60 days termination notice required.',
      whoItAffects: 'Both Parties',
      attentionLevel: 'REVIEW'
    }
  ];

  it('accurately identifies MODIFIED clauses between contract versions', () => {
    const result = compareDocuments(mockDocA, mockDocB, clausesA, clausesB);
    expect(result.summary.modifiedCount).toBe(1);
    expect(result.summary.totalChanges).toBe(1);
    expect(result.clauseDiffs[0].status).toBe('MODIFIED');
  });
});
