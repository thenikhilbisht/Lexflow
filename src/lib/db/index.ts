// File-backed persistent database store for LexiGuide with ZERO fake demo data
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  LegalDocument,
  Clause,
  Obligation,
  ExtractedDate,
  ContractComparisonResult,
  AuditLog,
  UserFeedback,
  AIConfiguration,
  LawyerPrepPackage,
  ChatMessage
} from '@/types';

interface Schema {
  users: User[];
  documents: LegalDocument[];
  clauses: Record<string, Clause[]>;
  obligations: Record<string, Obligation[]>;
  extractedDates: Record<string, ExtractedDate[]>;
  comparisons: ContractComparisonResult[];
  auditLogs: AuditLog[];
  feedback: UserFeedback[];
  aiConfig: AIConfiguration;
  chatQueryCount: number;
  chatConversations?: Record<string, ChatMessage[]>;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function hashPasswordHelper(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

class PersistentStore {
  public data: Schema;

  constructor() {
    this.data = this.loadOrInitialize();
  }

  private loadOrInitialize(): Schema {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed.chatConversations) parsed.chatConversations = {};
        return parsed;
      }
    } catch (e) {
      console.error('Failed to read db.json, reinitializing...', e);
    }

    // Initialize with 1 default Administrator and ZERO fake documents/data
    const adminSalt = crypto.randomBytes(16).toString('hex');
    const adminHash = hashPasswordHelper('Admin@LexiGuide2026!', adminSalt);

    const initialSchema: Schema = {
      users: [
        {
          id: 'usr-admin-default',
          email: 'admin@lexiguide.com',
          name: 'System Administrator',
          role: 'ADMIN',
          status: 'ACTIVE',
          passwordHash: adminHash,
          salt: adminSalt,
          documentCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      documents: [],
      clauses: {},
      obligations: {},
      extractedDates: {},
      comparisons: [],
      auditLogs: [
        {
          id: 'audit-init',
          actorId: 'usr-admin-default',
          actorName: 'System Initializer',
          actorEmail: 'admin@lexiguide.com',
          action: 'SYSTEM_BOOTSTRAP',
          resourceType: 'DATABASE',
          resourceId: 'db-init',
          result: 'SUCCESS',
          ipAddress: '127.0.0.1',
          createdAt: new Date().toISOString()
        }
      ],
      feedback: [],
      aiConfig: {
        version: '1.0.0',
        model: 'gemini-1.5-flash / local-rag-hybrid',
        embeddingModel: 'text-embedding-004 / tf-idf-bm25',
        chunkSize: 512,
        retrievalTopK: 4,
        temperature: 0.1,
        systemPromptVersion: 'v1.0-strict-grounding',
        safetyPolicyVersion: 'sp-2026',
        promptInjectionDefenseActive: true,
        strictCitationGroundingActive: true,
        updatedAt: new Date().toISOString(),
        updatedBy: 'System Administrator'
      },
      chatQueryCount: 0
    };

    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(initialSchema, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to write initial db.json:', e);
    }

    return initialSchema;
  }

  public save() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to persist database:', e);
    }
  }

  // --- Users ---
  get users(): User[] {
    return this.data.users;
  }

  public getUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  public getUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public createUser(user: User) {
    this.data.users.push(user);
    this.save();
    return user;
  }

  public updateUser(id: string, updates: Partial<User>) {
    const user = this.getUserById(id);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date().toISOString() });
      this.save();
    }
    return user;
  }

  // --- Documents ---
  get documents(): LegalDocument[] {
    return this.data.documents;
  }

  public getDocumentsForUser(userId: string): LegalDocument[] {
    return this.data.documents.filter(d => d.userId === userId);
  }

  public getDocumentById(id: string): LegalDocument | undefined {
    return this.data.documents.find(d => d.id === id);
  }

  public createDocument(
    doc: LegalDocument,
    clauses: Clause[],
    obligations: Obligation[],
    dates: ExtractedDate[]
  ) {
    this.data.documents.unshift(doc);
    this.data.clauses[doc.id] = clauses;
    this.data.obligations[doc.id] = obligations;
    this.data.extractedDates[doc.id] = dates;

    // Increment user documentCount
    const user = this.getUserById(doc.userId);
    if (user) {
      user.documentCount = (user.documentCount || 0) + 1;
    }

    this.save();
    return doc;
  }

  public deleteDocument(id: string, userId?: string): boolean {
    const index = this.data.documents.findIndex(d => d.id === id);
    if (index === -1) return false;

    const doc = this.data.documents[index];
    if (userId && doc.userId !== userId) {
      // Not authorized to delete another user's document
      return false;
    }

    this.data.documents.splice(index, 1);
    delete this.data.clauses[id];
    delete this.data.obligations[id];
    delete this.data.extractedDates[id];

    // Decrement user documentCount
    const user = this.getUserById(doc.userId);
    if (user && user.documentCount > 0) {
      user.documentCount -= 1;
    }

    this.save();
    return true;
  }

  // --- Clauses & Obligations & Dates ---
  public getClauses(docId: string): Clause[] {
    return this.data.clauses[docId] || [];
  }

  public getObligations(docId: string): Obligation[] {
    return this.data.obligations[docId] || [];
  }

  public toggleObligation(obligationId: string): boolean {
    for (const docId of Object.keys(this.data.obligations)) {
      const list = this.data.obligations[docId];
      const ob = list.find(o => o.id === obligationId);
      if (ob) {
        ob.isCompleted = !ob.isCompleted;
        this.save();
        return true;
      }
    }
    return false;
  }

  public getDates(docId: string): ExtractedDate[] {
    return this.data.extractedDates[docId] || [];
  }

  // --- Audit Logs ---
  get auditLogs(): AuditLog[] {
    return this.data.auditLogs;
  }

  public logAudit(
    actor: { id: string; name: string; email: string },
    action: string,
    resourceType: string,
    resourceId: string,
    metadata?: Record<string, unknown>
  ): AuditLog {
    const entry: AuditLog = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      actorId: actor.id,
      actorName: actor.name,
      actorEmail: actor.email,
      action,
      resourceType,
      resourceId,
      result: 'SUCCESS',
      ipAddress: '127.0.0.1',
      metadata,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.unshift(entry);
    this.save();
    return entry;
  }

  // --- Feedback ---
  get feedback(): UserFeedback[] {
    return this.data.feedback;
  }

  public addFeedback(fb: UserFeedback) {
    this.data.feedback.unshift(fb);
    this.save();
    return fb;
  }

  // --- AI Config ---
  get aiConfig(): AIConfiguration {
    return this.data.aiConfig;
  }

  public updateAiConfig(updates: Partial<AIConfiguration>, adminName: string) {
    this.data.aiConfig = {
      ...this.data.aiConfig,
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: adminName
    };
    this.save();
    return this.data.aiConfig;
  }

  // --- Comparisons ---
  get comparisons(): ContractComparisonResult[] {
    return this.data.comparisons;
  }

  public addComparison(comp: ContractComparisonResult) {
    this.data.comparisons.unshift(comp);
    this.save();
    return comp;
  }

  public incrementQueryCount() {
    this.data.chatQueryCount = (this.data.chatQueryCount || 0) + 1;
    this.save();
  }

  // --- Persistent Chat Conversations ---
  public getChatHistory(documentId: string, userId: string): ChatMessage[] {
    if (!this.data.chatConversations) {
      this.data.chatConversations = {};
    }
    const key = `${documentId}:${userId}`;
    return this.data.chatConversations[key] || [];
  }

  public saveChatMessage(documentId: string, userId: string, message: ChatMessage) {
    if (!this.data.chatConversations) {
      this.data.chatConversations = {};
    }
    const key = `${documentId}:${userId}`;
    if (!this.data.chatConversations[key]) {
      this.data.chatConversations[key] = [];
    }
    this.data.chatConversations[key].push(message);
    // Keep last 50 messages per document
    if (this.data.chatConversations[key].length > 50) {
      this.data.chatConversations[key] = this.data.chatConversations[key].slice(-50);
    }
    this.save();
  }

  public clearChatHistory(documentId: string, userId: string) {
    if (!this.data.chatConversations) {
      this.data.chatConversations = {};
    }
    const key = `${documentId}:${userId}`;
    delete this.data.chatConversations[key];
    this.save();
  }

  // --- Real Stats (No Hardcoded Numbers) ---
  public getRealStats() {
    const totalDocs = this.data.documents.length;
    let avgLatency = 0;
    if (totalDocs > 0) {
      const sum = this.data.documents.reduce((acc, d) => acc + (d.processingTimeMs || 1000), 0);
      avgLatency = Number((sum / totalDocs / 1000).toFixed(2));
    }

    return {
      totalUsers: this.data.users.length,
      activeUsersCount: this.data.users.filter(u => u.status === 'ACTIVE').length,
      totalDocuments: totalDocs,
      aiRequests: this.data.chatQueryCount || 0,
      avgLatencySec: avgLatency || 0,
      totalFeedback: this.data.feedback.length,
      helpfulFeedbackCount: this.data.feedback.filter(f => f.rating === 'HELPFUL').length
    };
  }
}

// In-memory sliding-window rate limiter (PRD §46, 30 req/min per key)
interface RateLimitBucket {
  timestamps: number[];
}
const rateLimitMap = new Map<string, RateLimitBucket>();

export function checkRateLimit(
  key: string,
  limit: number = 30,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; retryAfterSec?: number } {
  const now = Date.now();
  const bucket = rateLimitMap.get(key) || { timestamps: [] };
  // Discard timestamps outside active window
  bucket.timestamps = bucket.timestamps.filter(ts => now - ts < windowMs);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    const retryAfterSec = Math.ceil((windowMs - (now - oldest)) / 1000);
    return { allowed: false, remaining: 0, retryAfterSec };
  }

  bucket.timestamps.push(now);
  rateLimitMap.set(key, bucket);
  return { allowed: true, remaining: limit - bucket.timestamps.length };
}

// Global singleton for Next.js hot-reloading
const globalForDb = globalThis as unknown as { dbStore?: PersistentStore };
export const db = globalForDb.dbStore || new PersistentStore();
if (process.env.NODE_ENV !== 'production') globalForDb.dbStore = db;
