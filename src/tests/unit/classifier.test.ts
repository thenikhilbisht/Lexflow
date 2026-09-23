import { describe, it, expect } from 'vitest';
import { classifyClause } from '../../lib/ai/clause-classifier';

describe('Legal Clause Classifier', () => {
  it('identifies automatic renewal clauses correctly with HIGH attention', () => {
    const text = 'The Term shall automatically renew for successive one-year periods unless written notice of non-renewal is delivered 60 days in advance.';
    const result = classifyClause(text);
    expect(result.category).toBe('Renewal');
    expect(result.attentionLevel).toBe('HIGH');
  });

  it('identifies termination without cause clauses correctly', () => {
    const text = 'Either Employer or Employee may terminate this Agreement without cause upon providing thirty (30) days prior written notice.';
    const result = classifyClause(text);
    expect(result.category).toBe('Termination');
  });

  it('identifies post-employment non-competition restrictions', () => {
    const text = 'During employment and for 12 months following separation, Employee shall not engage in or compete with Employer in North America.';
    const result = classifyClause(text);
    expect(result.category).toBe('Restrictions');
    expect(result.attentionLevel).toBe('HIGH');
  });

  it('identifies intellectual property assignment clauses', () => {
    const text = 'Employee acknowledges that all inventions, discoveries, software, and copyrightable works created during employment belong exclusively to Employer.';
    const result = classifyClause(text);
    expect(result.category).toBe('Intellectual Property');
  });

  it('identifies dispute resolution and mandatory arbitration clauses', () => {
    const text = 'Any controversy or claim arising out of this Agreement shall be resolved by binding arbitration under the American Arbitration Association.';
    const result = classifyClause(text);
    expect(result.category).toBe('Dispute Resolution');
  });
});
