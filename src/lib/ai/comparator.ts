import { LegalDocument, Clause, ContractComparisonResult, ClauseCategory } from '@/types';

export function compareDocuments(
  docA: LegalDocument,
  docB: LegalDocument,
  clausesA: Clause[],
  clausesB: Clause[]
): ContractComparisonResult {
  const clauseDiffs: ContractComparisonResult['clauseDiffs'] = [];
  const processedBIds = new Set<string>();

  let addedCount = 0;
  let modifiedCount = 0;
  let removedCount = 0;

  // 1. Match clauses from A against B
  clausesA.forEach((cA, idx) => {
    // Look for matching category or similar title in B
    const matchB = clausesB.find(
      cB => !processedBIds.has(cB.id) && (cB.category === cA.category || cB.title.toLowerCase() === cA.title.toLowerCase())
    );

    if (matchB) {
      processedBIds.add(matchB.id);
      const isExact = matchB.originalText.trim() === cA.originalText.trim();

      if (isExact) {
        clauseDiffs.push({
          id: `diff-${cA.id}-${matchB.id}`,
          category: cA.category,
          title: cA.title,
          status: 'UNCHANGED',
          versionAContent: cA.originalText,
          versionBContent: matchB.originalText,
          versionAPage: cA.pageNumber,
          versionBPage: matchB.pageNumber,
          explanation: `Terms in Section ${cA.sectionNumber} are identical between both documents.`
        });
      } else {
        modifiedCount++;
        clauseDiffs.push({
          id: `diff-${cA.id}-${matchB.id}`,
          category: cA.category,
          title: `${cA.title} (Revised)`,
          status: 'MODIFIED',
          versionAContent: cA.originalText,
          versionBContent: matchB.originalText,
          versionAPage: cA.pageNumber,
          versionBPage: matchB.pageNumber,
          explanation: `Wording revised from Section ${cA.sectionNumber} (vA) to Section ${matchB.sectionNumber} (vB). Review changes to obligations or liability.`
        });
      }
    } else {
      // Present in A but removed from B
      removedCount++;
      clauseDiffs.push({
        id: `diff-rem-${cA.id}`,
        category: cA.category,
        title: cA.title,
        status: 'REMOVED',
        versionAContent: cA.originalText,
        versionAPage: cA.pageNumber,
        explanation: `Clause present in ${docA.filename} (Section ${cA.sectionNumber}) was omitted from ${docB.filename}.`
      });
    }
  });

  // 2. Any remaining clauses in B are ADDED
  clausesB.forEach(cB => {
    if (!processedBIds.has(cB.id)) {
      addedCount++;
      clauseDiffs.push({
        id: `diff-add-${cB.id}`,
        category: cB.category,
        title: cB.title,
        status: 'ADDED',
        versionBContent: cB.originalText,
        versionBPage: cB.pageNumber,
        explanation: `New provision introduced in ${docB.filename} (Section ${cB.sectionNumber}) not present in baseline.`
      });
    }
  });

  const totalChanges = addedCount + modifiedCount + removedCount;

  return {
    id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    documentAId: docA.id,
    documentBId: docB.id,
    documentAName: docA.filename,
    documentBName: docB.filename,
    summary: {
      totalChanges,
      addedCount,
      modifiedCount,
      removedCount
    },
    clauseDiffs,
    createdAt: new Date().toISOString()
  };
}
