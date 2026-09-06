export type UserRole = "ADMIN" | "USER";

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  role: UserRole;
  isApproved?: boolean;
  isBanned?: boolean;
}

export interface Candidate {
  id: string;
  name: string;
  nickname?: string;
  number?: number;
  position?: string;
  team?: string;
  avatarUrl: string;
  userEmail?: string;
  userId?: string;
  createdAt: string;
}

export interface SubCriteria {
  id: string;
  categoryId: number;
  nameEn: string;
  nameTh: string;
  description?: string;
}

export interface Category {
  id: number;
  nameEn: string;
  nameTh: string;
  iconName: string;
  color: string;
  subCriteria: SubCriteria[];
}

export interface VoteRecord {
  id: string;
  candidateId: string;
  userId: string;
  userEmail: string;
  scores: Record<string, number>;
  isFinal: boolean;
  submittedAt: string;
  updatedAt: string;
}

export interface WebCustomization {
  headerTitle: string;
  headerSubtitle: string;
  logoUrl?: string;
  bannerImageUrl?: string;
  themeColor: "rose" | "amber" | "emerald" | "indigo" | "cyan";
  customAnnouncement?: string;
}

export interface SystemSettings {
  id: string;
  title: string;
  description: string;
  votingStartTime: string | null;
  votingEndTime: string | null;
  isLocked: boolean;
  preventSelfVoting: boolean;
  allowEditVote: boolean;
  votingPasscode: string;
  requireApproval: boolean;
  approvedUsers: string[];
  bannedUsers: string[]; // รายชื่ออีเมลที่ถูกแบน
  adminEmails: string[];
  votingRestrictions: Record<string, string[]>;
  customization: WebCustomization;
  lastUpdated: string;
}

export type TierType = "S" | "A" | "B" | "C";

export interface CategoryAverage {
  categoryId: number;
  categoryName: string;
  totalScore: number;
  maxScore: number;
  averageOutOf5: number;
  percentage: number;
}

export interface CandidateTierResult {
  candidate: Candidate;
  totalScore: number;
  tier: TierType;
  tierRank: number;
  overallRank: number;
  voteCount: number;
  subCriteriaAverages: Record<string, number>;
  categoryAverages: CategoryAverage[];
}

export interface TierListSummary {
  totalCandidates: number;
  totalVoters: number;
  tiers: {
    S: CandidateTierResult[];
    A: CandidateTierResult[];
    B: CandidateTierResult[];
    C: CandidateTierResult[];
  };
  rankings: CandidateTierResult[];
}
