import fs from "fs";
import path from "path";
import { Candidate, SystemSettings, VoteRecord, User, WebCustomization } from "@/types";
import { ALL_SUB_CRITERIA } from "@/data/criteria";

interface DBData {
  settings: SystemSettings;
  candidates: Candidate[];
  votes: VoteRecord[];
  users: User[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

const DEFAULT_CUSTOMIZATION: WebCustomization = {
  headerTitle: "Football Skills Tier List 2026",
  headerSubtitle: "ประเมินทักษะนักเตะ 7 หมวด 36 ข้อย่อย จัด Tier อัตโนมัติ",
  themeColor: "rose",
  customAnnouncement: "",
};

export const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "cand_1",
    name: "กล้า (ประตู)",
    nickname: "กล้า (GK)",
    number: 1,
    position: "Goalkeeper (GK)",
    team: "Squad",
    userEmail: "kla_gk@gmail.com",
    avatarUrl: "/avatars/kla_gk.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_2",
    name: "กล้า",
    nickname: "กล้า",
    number: 2,
    position: "Player",
    team: "Squad",
    userEmail: "kla@gmail.com",
    avatarUrl: "/avatars/kla.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_3",
    name: "โต้",
    nickname: "โต้",
    number: 3,
    position: "Player",
    team: "Squad",
    userEmail: "toe@gmail.com",
    avatarUrl: "/avatars/toe.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_4",
    name: "ลิ้ง",
    nickname: "ลิ้ง",
    number: 4,
    position: "Player",
    team: "Squad",
    userEmail: "link@gmail.com",
    avatarUrl: "/avatars/link.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_5",
    name: "เอิด",
    nickname: "เอิด",
    number: 5,
    position: "Player",
    team: "Squad",
    userEmail: "erd@gmail.com",
    avatarUrl: "/avatars/erd.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_6",
    name: "น็อต",
    nickname: "น็อต",
    number: 6,
    position: "Player",
    team: "Squad",
    userEmail: "knot@gmail.com",
    avatarUrl: "/avatars/knot.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_7",
    name: "บุ๊ค",
    nickname: "บุ๊ค",
    number: 7,
    position: "Player",
    team: "Squad",
    userEmail: "book@gmail.com",
    avatarUrl: "/avatars/book.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_8",
    name: "คิว",
    nickname: "คิว",
    number: 8,
    position: "Player",
    team: "Squad",
    userEmail: "q@gmail.com",
    avatarUrl: "/avatars/q.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_9",
    name: "เว่น",
    nickname: "เว่น",
    number: 9,
    position: "Player",
    team: "Squad",
    userEmail: "wen@gmail.com",
    avatarUrl: "/avatars/wen.webp",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_10",
    name: "เปรม",
    nickname: "เปรม",
    number: 10,
    position: "Player",
    team: "Squad",
    userEmail: "prem@gmail.com",
    avatarUrl: "/avatars/prem.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_11",
    name: "ปลื้ม",
    nickname: "ปลื้ม",
    number: 11,
    position: "Player",
    team: "Squad",
    userEmail: "pleum@gmail.com",
    avatarUrl: "/avatars/pleum.webp",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_12",
    name: "ตูน",
    nickname: "ตูน",
    number: 12,
    position: "Player",
    team: "Squad",
    userEmail: "toon@gmail.com",
    avatarUrl: "/avatars/toon.jpg",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_13",
    name: "ปูน",
    nickname: "ปูน",
    number: 13,
    position: "Player",
    team: "Squad",
    userEmail: "poon@gmail.com",
    avatarUrl: "/avatars/poon.png",
    createdAt: new Date().toISOString(),
  },
  {
    id: "cand_14",
    name: "เนม",
    nickname: "เนม",
    number: 14,
    position: "Player",
    team: "Squad",
    userEmail: "name@gmail.com",
    avatarUrl: "/avatars/name.png",
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_RESTRICTIONS: Record<string, string[]> = {};
INITIAL_CANDIDATES.forEach((c) => {
  if (c.userEmail) {
    DEFAULT_RESTRICTIONS[c.userEmail.toLowerCase()] = [c.id];
  }
});

const DEFAULT_SETTINGS: SystemSettings = {
  id: "global_settings",
  title: "Football Skills Tier List 2026",
  description: "ระบบโหวตประเมินทักษะฟุตบอล 7 หมวด 36 ข้อย่อย และจัด Tier อัตโนมัติ",
  votingStartTime: null,
  votingEndTime: null,
  isLocked: false,
  preventSelfVoting: true,
  allowEditVote: false,
  votingPasscode: "1234",
  requireApproval: true,
  approvedUsers: [],
  bannedUsers: [],
  adminEmails: ["xekphphbrrnsa@gmail.com", "admin@gmail.com"],
  votingRestrictions: DEFAULT_RESTRICTIONS,
  customization: DEFAULT_CUSTOMIZATION,
  lastUpdated: new Date().toISOString(),
};

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readDB(): DBData {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DBData = {
      settings: DEFAULT_SETTINGS,
      candidates: INITIAL_CANDIDATES,
      votes: [],
      users: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(raw);
    if (!data.settings.bannedUsers) data.settings.bannedUsers = [];
    if (!data.settings.customization) data.settings.customization = DEFAULT_CUSTOMIZATION;
    if (!data.settings.adminEmails.includes("xekphphbrrnsa@gmail.com")) {
      data.settings.adminEmails.unshift("xekphphbrrnsa@gmail.com");
    }
    return data;
  } catch (e) {
    const initialData: DBData = {
      settings: DEFAULT_SETTINGS,
      candidates: INITIAL_CANDIDATES,
      votes: [],
      users: [],
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function writeDB(data: DBData): void {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

export const Storage = {
  getSettings(): SystemSettings {
    const db = readDB();
    const envAdminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim().toLowerCase())
      : [];
    const mergedAdminEmails = Array.from(
      new Set(["xekphphbrrnsa@gmail.com", ...db.settings.adminEmails, ...envAdminEmails])
    );
    return {
      ...db.settings,
      adminEmails: mergedAdminEmails,
    };
  },

  updateSettings(updates: Partial<SystemSettings>): SystemSettings {
    const db = readDB();
    db.settings = {
      ...db.settings,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    writeDB(db);
    return db.settings;
  },

  updateCustomization(customization: Partial<WebCustomization>): SystemSettings {
    const db = readDB();
    db.settings.customization = {
      ...db.settings.customization,
      ...customization,
    };
    db.settings.lastUpdated = new Date().toISOString();
    writeDB(db);
    return db.settings;
  },

  // Account Banning System (ระบบบล็อคแอคเคาน์)
  isUserBanned(email?: string | null): boolean {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    if (clean === "xekphphbrrnsa@gmail.com") return false; // Admin cannot be banned
    const settings = this.getSettings();
    const banned = settings.bannedUsers || [];
    return banned.map((e) => e.toLowerCase().trim()).includes(clean);
  },

  banUser(email: string): SystemSettings {
    const db = readDB();
    const clean = email.toLowerCase().trim();
    if (clean === "xekphphbrrnsa@gmail.com") return db.settings; // Cannot ban owner
    let banned = db.settings.bannedUsers || [];
    if (!banned.includes(clean)) {
      banned.push(clean);
    }
    db.settings.bannedUsers = banned;
    db.settings.lastUpdated = new Date().toISOString();

    db.users.forEach((u) => {
      if (u.email.toLowerCase() === clean) {
        u.isBanned = true;
      }
    });

    writeDB(db);
    return db.settings;
  },

  unbanUser(email: string): SystemSettings {
    const db = readDB();
    const clean = email.toLowerCase().trim();
    let banned = db.settings.bannedUsers || [];
    banned = banned.filter((e) => e.toLowerCase() !== clean);
    db.settings.bannedUsers = banned;
    db.settings.lastUpdated = new Date().toISOString();

    db.users.forEach((u) => {
      if (u.email.toLowerCase() === clean) {
        u.isBanned = false;
      }
    });

    writeDB(db);
    return db.settings;
  },

  // Hard Reset Web App to clean slate
  hardResetAllData(): DBData {
    const freshData: DBData = {
      settings: {
        ...DEFAULT_SETTINGS,
        lastUpdated: new Date().toISOString(),
      },
      candidates: INITIAL_CANDIDATES,
      votes: [],
      users: [],
    };
    writeDB(freshData);
    return freshData;
  },

  // Custom Voting Restrictions Matrix
  isVoterRestrictedFromCandidate(
    voterEmailOrId?: string | null,
    candidateId?: string | null
  ): { isRestricted: boolean; reason: string } {
    if (!voterEmailOrId || !candidateId) {
      return { isRestricted: false, reason: "" };
    }

    const cleanVoter = voterEmailOrId.toLowerCase().trim();

    // First check if user is banned
    if (this.isUserBanned(cleanVoter)) {
      return {
        isRestricted: true,
        reason: "บัญชีของคุณถูกระงับการใช้งานโดยแอดมิน (Account Banned)",
      };
    }

    const settings = this.getSettings();
    const restrictions = settings.votingRestrictions || {};

    const forbiddenCandidateIds = restrictions[cleanVoter] || [];
    if (forbiddenCandidateIds.includes(candidateId)) {
      return {
        isRestricted: true,
        reason: "แอดมินได้กำหนดสิทธิ์ระงับไม่ให้คุณโหวตผู้เล่นคนนี้",
      };
    }

    if (settings.preventSelfVoting && this.isSelfVote(candidateId, cleanVoter, voterEmailOrId)) {
      return {
        isRestricted: true,
        reason: "ระบบล็อคไม่ให้โหวตให้ตนเอง (ห้ามโหวตตัวเอง)",
      };
    }

    return { isRestricted: false, reason: "" };
  },

  updateVotingRestrictions(restrictions: Record<string, string[]>): SystemSettings {
    const db = readDB();
    db.settings.votingRestrictions = restrictions;
    db.settings.lastUpdated = new Date().toISOString();
    writeDB(db);
    return db.settings;
  },

  // Users & Approval
  getUsers(): User[] {
    const db = readDB();
    const settings = this.getSettings();
    const existingMap = new Map<string, User>();

    db.users.forEach((u) => {
      const clean = u.email.toLowerCase();
      existingMap.set(clean, {
        ...u,
        isBanned: (settings.bannedUsers || []).map((e) => e.toLowerCase()).includes(clean),
        isApproved: (settings.approvedUsers || []).map((e) => e.toLowerCase()).includes(clean),
      });
    });

    return Array.from(existingMap.values());
  },

  registerUser(user: User): User {
    const db = readDB();
    const settings = this.getSettings();
    const cleanEmail = user.email.toLowerCase().trim();
    const isAdmin = this.checkUserRole(cleanEmail) === "ADMIN";
    const isApproved = isAdmin || (settings.approvedUsers || []).map(e => e.toLowerCase()).includes(cleanEmail);
    const isBanned = (settings.bannedUsers || []).map(e => e.toLowerCase()).includes(cleanEmail);

    const fullUser: User = {
      ...user,
      role: isAdmin ? "ADMIN" : "USER",
      isApproved,
      isBanned,
    };

    const idx = db.users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...fullUser };
    } else {
      db.users.push(fullUser);
    }
    writeDB(db);
    return fullUser;
  },

  toggleUserApproval(email: string, approve: boolean): SystemSettings {
    const db = readDB();
    const clean = email.toLowerCase().trim();
    let approved = db.settings.approvedUsers || [];
    if (approve) {
      if (!approved.includes(clean)) approved.push(clean);
    } else {
      approved = approved.filter((e) => e.toLowerCase() !== clean);
    }
    db.settings.approvedUsers = approved;
    db.settings.lastUpdated = new Date().toISOString();

    db.users.forEach((u) => {
      if (u.email.toLowerCase() === clean) {
        u.isApproved = approve;
      }
    });

    writeDB(db);
    return db.settings;
  },

  isUserApproved(email?: string | null): boolean {
    if (!email) return false;
    const clean = email.toLowerCase().trim();
    if (this.checkUserRole(clean) === "ADMIN") return true;
    if (this.isUserBanned(clean)) return false; // Banned users cannot vote
    const settings = this.getSettings();
    if (!settings.requireApproval) return true;
    return (settings.approvedUsers || []).map((e) => e.toLowerCase().trim()).includes(clean);
  },

  verifyPasscode(code?: string | null): boolean {
    const settings = this.getSettings();
    if (!settings.votingPasscode) return true;
    if (!code) return false;
    return code.trim() === settings.votingPasscode.trim();
  },

  getCandidates(): Candidate[] {
    const db = readDB();
    return db.candidates;
  },

  getCandidateById(id: string): Candidate | undefined {
    const db = readDB();
    return db.candidates.find((c) => c.id === id);
  },

  addCandidate(candidate: Omit<Candidate, "id" | "createdAt">): Candidate {
    const db = readDB();
    const newCandidate: Candidate = {
      ...candidate,
      id: `cand_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    db.candidates.push(newCandidate);
    writeDB(db);
    return newCandidate;
  },

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const db = readDB();
    const index = db.candidates.findIndex((c) => c.id === id);
    if (index === -1) return null;
    db.candidates[index] = {
      ...db.candidates[index],
      ...updates,
    };
    writeDB(db);
    return db.candidates[index];
  },

  deleteCandidate(id: string): boolean {
    const db = readDB();
    const initialLen = db.candidates.length;
    db.candidates = db.candidates.filter((c) => c.id !== id);
    db.votes = db.votes.filter((v) => v.candidateId !== id);
    writeDB(db);
    return db.candidates.length < initialLen;
  },

  getVotes(): VoteRecord[] {
    const db = readDB();
    return db.votes;
  },

  getVotesByCandidate(candidateId: string): VoteRecord[] {
    const db = readDB();
    return db.votes.filter((v) => v.candidateId === candidateId);
  },

  getUserVoteForCandidate(userId: string, candidateId: string): VoteRecord | undefined {
    const db = readDB();
    return db.votes.find((v) => (v.userId === userId || v.userEmail === userId) && v.candidateId === candidateId);
  },

  isSelfVote(candidateId: string, userEmail?: string, userId?: string): boolean {
    if (!userEmail && !userId) return false;
    const candidate = this.getCandidateById(candidateId);
    if (!candidate) return false;

    const cleanUserEmail = (userEmail || "").toLowerCase().trim();
    if (candidate.userEmail && candidate.userEmail.toLowerCase().trim() === cleanUserEmail) {
      return true;
    }
    if (candidate.userId && candidate.userId === userId) {
      return true;
    }
    if (candidate.name && cleanUserEmail.includes(candidate.name.toLowerCase())) {
      return true;
    }
    if (candidate.nickname && cleanUserEmail.includes(candidate.nickname.toLowerCase())) {
      return true;
    }

    return false;
  },

  saveVote(
    candidateId: string,
    userId: string,
    userEmail: string,
    scores: Record<string, number>,
    passcode?: string
  ): { success: boolean; data?: VoteRecord; error?: string } {
    const db = readDB();
    const settings = this.getSettings();

    // Check if user is banned
    if (this.isUserBanned(userEmail)) {
      return {
        success: false,
        error: "บัญชีของคุณถูกระงับการใช้งานโดยแอดมิน (Account Banned)",
      };
    }

    // Check User Approval
    if (settings.requireApproval && !this.isUserApproved(userEmail)) {
      return {
        success: false,
        error: "บัญชีของคุณยังไม่ได้รับอนุมัติจากแอดมิน กรุณาติดต่อแอดมิน (Approval Required)",
      };
    }

    // Check Voting Passcode
    if (settings.votingPasscode && !this.verifyPasscode(passcode)) {
      return {
        success: false,
        error: "รหัสผ่านการโหวตไม่ถูกต้อง กรุณาติดต่อแอดมินเพื่อขอรหัสผ่าน (Invalid Passcode)",
      };
    }

    // Check Custom Voting Restriction (ใครห้ามโหวตใคร)
    const checkRes = this.isVoterRestrictedFromCandidate(userEmail || userId, candidateId);
    if (checkRes.isRestricted) {
      return {
        success: false,
        error: checkRes.reason,
      };
    }

    // Check existing vote
    const existingIndex = db.votes.findIndex(
      (v) => (v.userId === userId || v.userEmail === userEmail) && v.candidateId === candidateId
    );

    if (existingIndex >= 0) {
      if (!settings.allowEditVote) {
        return {
          success: false,
          error: "ท่านได้ส่งผลโหวตไปแล้ว ระบบไม่อนุญาตให้แก้ไขคะแนน (Vote is locked after submission)",
        };
      }

      const now = new Date().toISOString();
      db.votes[existingIndex] = {
        ...db.votes[existingIndex],
        userId,
        userEmail,
        scores,
        isFinal: true,
        updatedAt: now,
      };
      writeDB(db);
      return { success: true, data: db.votes[existingIndex] };
    } else {
      const now = new Date().toISOString();
      const newVote: VoteRecord = {
        id: `vote_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        candidateId,
        userId,
        userEmail,
        scores,
        isFinal: true,
        submittedAt: now,
        updatedAt: now,
      };
      db.votes.push(newVote);
      writeDB(db);
      return { success: true, data: newVote };
    }
  },

  resetAllVotes(): void {
    const db = readDB();
    db.votes = [];
    writeDB(db);
  },

  seedDemoData(): void {
    const db = readDB();
    db.candidates = INITIAL_CANDIDATES;
    db.votes = [];
    db.settings = DEFAULT_SETTINGS;
    writeDB(db);
  },

  isVotingOpen(): { isOpen: boolean; reason: string } {
    const settings = this.getSettings();
    if (settings.isLocked) {
      return { isOpen: false, reason: "ระบบถูกล็อคโดยผู้ดูแลระบบ (Admin Locked)" };
    }

    const now = new Date().getTime();
    if (settings.votingStartTime) {
      const startTime = new Date(settings.votingStartTime).getTime();
      if (now < startTime) {
        return { isOpen: false, reason: `ยังไม่ถึงเวลาเริ่มโหวต (เริ่มตามเวลาไทย)` };
      }
    }

    if (settings.votingEndTime) {
      const endTime = new Date(settings.votingEndTime).getTime();
      if (now > endTime) {
        return { isOpen: false, reason: `หมดเวลาโหวตแล้ว (สิ้นสุดตามเวลาไทย)` };
      }
    }

    return { isOpen: true, reason: "เปิดรับการโหวตอยู่ในขณะนี้" };
  },

  checkUserRole(email: string | null | undefined): "ADMIN" | "USER" {
    if (!email) return "USER";
    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail === "xekphphbrrnsa@gmail.com") return "ADMIN";
    const settings = this.getSettings();
    const isAdmin = settings.adminEmails.some(
      (admin) => admin.toLowerCase().trim() === cleanEmail
    );
    return isAdmin ? "ADMIN" : "USER";
  },
};
