import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { executeGroundedRAG } from '../../lib/ai/rag';
import { NOT_FOUND_RESPONSE } from '../../lib/ai/guardrails';
import { Clause } from '../../types';

interface EvalCase {
  document: string;
  question: string;
  expected_answer: string;
  expected_source: string | null;
  expected_page: number | null;
}

describe('RAG Evaluation Dataset Benchmark (legal_assistant_eval.jsonl)', () => {
  // Read legal_assistant_eval.jsonl
  const evalPath = path.join(process.cwd(), 'legal_assistant_eval.jsonl');
  const evalLines = fs.readFileSync(evalPath, 'utf8').trim().split('\n');
  const evalCases: EvalCase[] = evalLines.map(line => JSON.parse(line));

  // Synthetic document corpus corresponding to eval test suite
  const documentCorpus: Record<string, Clause[]> = {
    'employment_01.pdf': [
      {
        id: 'emp-1',
        documentId: 'employment_01',
        sectionNumber: '11.2',
        pageNumber: 18,
        category: 'Termination',
        title: 'Resignation Notice Period',
        originalText: 'The Employee shall provide thirty (30) days prior written notice of resignation.',
        plainEnglish: 'The employee is required to give 30 days written notice before resigning.',
        whoItAffects: 'Employee',
        attentionLevel: 'INFORMATIONAL'
      },
      {
        id: 'emp-2',
        documentId: 'employment_01',
        sectionNumber: '3.2',
        pageNumber: 4,
        category: 'Term & Renewal',
        title: 'Automatic Renewal Provision',
        originalText: 'Unless either party provides written notice at least sixty (60) days before expiration, this Agreement shall automatically renew for another twelve-month period.',
        plainEnglish: 'Agreement automatically renews for 12 months unless notice is given 60 days before expiration.',
        whoItAffects: 'Both Parties',
        attentionLevel: 'ATTENTION'
      },
      {
        id: 'emp-3',
        documentId: 'employment_01',
        sectionNumber: '9',
        pageNumber: 15,
        category: 'Intellectual Property',
        title: 'Intellectual Property Ownership',
        originalText: 'All intellectual property created specifically for the Client under this Statement of Work or during employment shall be owned by the Client upon payment in full.',
        plainEnglish: 'Client owns all intellectual property created during the engagement.',
        whoItAffects: 'Both Parties',
        attentionLevel: 'INFORMATIONAL'
      }
    ],
    'lease_01.pdf': [
      {
        id: 'lease-1',
        documentId: 'lease_01',
        sectionNumber: 'Rent section',
        pageNumber: 5,
        category: 'Payment & Financial',
        title: 'Rent Payment Due Date',
        originalText: 'Rent is due on the date specified in the rent payment clause, payable on the first day of each calendar month.',
        plainEnglish: 'Monthly rent is due on the 1st of each month.',
        whoItAffects: 'Tenant',
        attentionLevel: 'INFORMATIONAL'
      },
      {
        id: 'lease-2',
        documentId: 'lease_01',
        sectionNumber: 'Security Deposit section',
        pageNumber: 7,
        category: 'Payment & Financial',
        title: 'Security Deposit Return Terms',
        originalText: 'The landlord shall hold the security deposit in an escrow account, to be returned within 30 days of lease expiration less any lawful deductions.',
        plainEnglish: 'Security deposit held in escrow and returned within 30 days after lease termination.',
        whoItAffects: 'Both Parties',
        attentionLevel: 'INFORMATIONAL'
      }
    ],
    'nda_01.pdf': [
      {
        id: 'nda-1',
        documentId: 'nda_01',
        sectionNumber: 'Confidentiality section',
        pageNumber: 6,
        category: 'Confidentiality',
        title: 'Duration of Confidentiality Obligations',
        originalText: 'The Receiving Party shall keep all Confidential Information confidential for a period of three (3) years from the date of disclosure.',
        plainEnglish: 'Confidentiality obligations continue for 3 years.',
        whoItAffects: 'Receiving Party',
        attentionLevel: 'INFORMATIONAL'
      }
    ],
    'service_01.pdf': [
      {
        id: 'svc-1',
        documentId: 'service_01',
        sectionNumber: 'Termination section',
        pageNumber: 12,
        category: 'Termination',
        title: 'Mutual Termination for Breach',
        originalText: 'Either party may terminate this Agreement for material breach if the breach remains uncured for thirty (30) days after written notice.',
        plainEnglish: 'Either party may terminate for uncured breach after 30 days notice.',
        whoItAffects: 'Both Parties',
        attentionLevel: 'INFORMATIONAL'
      }
    ],
    'loan_01.pdf': [
      {
        id: 'loan-1',
        documentId: 'loan_01',
        sectionNumber: 'Payment section',
        pageNumber: 8,
        category: 'Payment & Financial',
        title: 'Payment Schedule and Installment Deadlines',
        originalText: 'The borrower shall pay all principal and interest installments strictly in accordance with the payment schedule on or before the 15th day of each calendar month.',
        plainEnglish: 'Loan payments due on the 15th of each month according to the payment schedule.',
        whoItAffects: 'Borrower',
        attentionLevel: 'INFORMATIONAL'
      }
    ],
    'unknown_question.pdf': [
      {
        id: 'unk-1',
        documentId: 'unknown_question',
        sectionNumber: '1.0',
        pageNumber: 1,
        category: 'General',
        title: 'General Overview',
        originalText: 'This document describes high-level consulting services without any mention of refund policies or returns.',
        plainEnglish: 'Consulting overview without refund provisions.',
        whoItAffects: 'Both Parties',
        attentionLevel: 'INFORMATIONAL'
      }
    ]
  };

  evalCases.forEach((testCase, idx) => {
    it(`[Case ${idx + 1}] (${testCase.document}): "${testCase.question}"`, async () => {
      const clauses = documentCorpus[testCase.document] || [];
      const result = await executeGroundedRAG(testCase.question, clauses);

      if (testCase.expected_answer === 'NOT_FOUND') {
        expect(result.sourceStatus).toBe('NOT_FOUND');
        expect(result.answer).toContain(NOT_FOUND_RESPONSE);
        expect(result.citations).toHaveLength(0);
      } else {
        expect(result.sourceStatus).toBe('DIRECTLY_STATED');
        expect(result.citations.length).toBeGreaterThan(0);

        // Verify accurate page citation
        if (testCase.expected_page !== null) {
          expect(result.citations[0].page).toBe(testCase.expected_page);
        }

        // Verify accurate section citation
        if (testCase.expected_source !== null) {
          const cleanExpected = testCase.expected_source.toLowerCase().replace(/section\s*/i, '');
          expect(result.citations[0].section.toLowerCase()).toContain(cleanExpected);
        }
      }
    });
  });
});
