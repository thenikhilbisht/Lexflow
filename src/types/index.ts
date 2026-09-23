// Data types for LexiGuide platform based on PRD Section 40 & feature specifications

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  avatarUrl?: string;
  passwordHash?: string;
  salt?: string;
  documentCount: number;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = 'UPLOADED' | 'PROCESSING' | 'ANALYZED' | 'FAILED' | 'DELETED';

export type DocumentType =
  | 'Employment Contract'
  | 'Rental Agreement'
  | 'NDA'
  | 'Loan Agreement'
  | 'Insurance Policy'
  | 'Terms & Conditions'
  | 'Service Agreement'
  | 'Vendor Contract'
  | 'Offer Letter'
  | 'Partnership Agreement'
  | 'Notice / Other';

export interface LegalDocument {
  id: string;
  userId: string;
  userName?: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  pageCount: number;
  status: DocumentStatus;
  documentType: DocumentType;
  summary: string;
  processingTimeMs: number;
  createdAt: string;
  updatedAt: string;
  content?: string; // Full extracted text
  clauses?: Clause[];
}

export interface DocumentSection {
  id: string;
  documentId: string;
  sectionNumber: string;
  title: string;
  pageStart: number;
  pageEnd: number;
  content: string;
  embedding?: number[];
}

export type AttentionLevel = 'HIGH' | 'REVIEW' | 'UNDERSTAND' | 'INFORMATIONAL';

export type ClauseCategory =
  | 'Payment'
  | 'Termination'
  | 'Renewal'
  | 'Liability'
  | 'Indemnification'
  | 'Confidentiality'
  | 'Intellectual Property'
  | 'Data & Privacy'
  | 'Dispute Resolution'
  | 'Governing Law'
  | 'Notice'
  | 'Obligations'
  | 'Restrictions'
  | 'Insurance'
  | 'Representations'
  | 'Warranties'
  | 'Penalties'
  | 'Other';

export interface Clause {
  id: string;
  documentId: string;
  sectionNumber: string;
  pageNumber: number;
  category: ClauseCategory;
  title: string;
  originalText: string;
  plainEnglish: string;
  whoItAffects: string;
  yourObligation?: string;
  whenItApplies?: string;
  attentionLevel: AttentionLevel;
  attentionTitle?: string;
  whyThisMatters?: string;
  verifyInstructions?: string;
}

export interface Obligation {
  id: string;
  documentId: string;
  party: 'USER' | 'COUNTERPARTY' | 'MUTUAL';
  partyLabel: string;
  description: string;
  deadline?: string;
  sourceSection: string;
  sourcePage: number;
  isCompleted?: boolean;
}

export interface ExtractedDate {
  id: string;
  documentId: string;
  dateStr: string;
  isoDate?: string;
  eventType: 'START' | 'END' | 'PAYMENT' | 'NOTICE' | 'RENEWAL' | 'REVIEW' | 'OTHER';
  description: string;
  sourceSection: string;
  sourcePage: number;
}

export type SourceStatus =
  | 'DIRECTLY_STATED'     // ✓ Directly stated
  | 'INFERRED'            // ≈ Inferred from document
  | 'AMBIGUOUS'           // ? Unclear / ambiguous
  | 'NOT_FOUND';          // — Not found in document

export interface Citation {
  id: string;
  section: string;
  page: number;
  excerpt: string;
  relevanceScore: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  sourceStatus?: SourceStatus;
  citations?: Citation[];
  suggestedFollowUps?: string[];
  createdAt: string;
}

export interface ContractComparisonResult {
  id: string;
  documentAId: string;
  documentBId: string;
  documentAName: string;
  documentBName: string;
  summary: {
    totalChanges: number;
    addedCount: number;
    modifiedCount: number;
    removedCount: number;
  };
  clauseDiffs: {
    id: string;
    category: ClauseCategory;
    title: string;
    status: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
    versionAContent?: string;
    versionBContent?: string;
    versionAPage?: number;
    versionBPage?: number;
    explanation: string;
  }[];
  createdAt: string;
}

export interface LawyerPrepPackage {
  documentId: string;
  overview: {
    documentType: DocumentType;
    parties: string[];
    duration: string;
    governingLaw: string;
    summary: string;
  };
  keyClausesToReview: {
    category: ClauseCategory;
    section: string;
    page: number;
    clauseSummary: string;
    potentialRisk: string;
  }[];
  questionsToAskCounsel: string[];
  documentsToBring: string[];
  actionPlan: {
    id: string;
    type: 'DOCUMENT_DERIVED' | 'GENERAL_SUGGESTION';
    task: string;
    completed: boolean;
  }[];
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  result: 'SUCCESS' | 'FAILURE';
  ipAddress: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  timestamp?: string;
  details?: string;
}

export interface UserFeedback {
  id: string;
  userId: string;
  userEmail: string;
  messageId: string;
  rating: 'HELPFUL' | 'UNHELPFUL';
  reason?: 'Incorrect' | 'Not relevant' | 'Could not find answer' | 'Explanation unclear' | 'Citation incorrect' | 'Other';
  comments?: string;
  comment?: string;
  isHelpful?: boolean;
  createdAt: string;
}

export type Feedback = UserFeedback;

export interface AIConfiguration {
  version: string;
  model: string;
  embeddingModel: string;
  chunkSize: number;
  retrievalTopK: number;
  temperature: number;
  systemPromptVersion: string;
  safetyPolicyVersion: string;
  promptInjectionDefenseActive: boolean;
  strictCitationGroundingActive: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface EvaluationCategoryScore {
  category: string;
  score: number;
  status: 'PASSED' | 'FAILED';
  checksPassed: number;
  totalChecks: number;
  details: {
    name: string;
    passed: boolean;
    description: string;
    evidence: string;
  }[];
}

export interface FullEvaluationReport {
  overallScore: number;
  timestamp: string;
  passed: boolean;
  categories: {
    codeQuality: EvaluationCategoryScore;
    security: EvaluationCategoryScore;
    efficiency: EvaluationCategoryScore;
    testing: EvaluationCategoryScore;
    accessibility: EvaluationCategoryScore;
    problemAlignment: EvaluationCategoryScore;
  };
}
