import { Candidate, CandidateTierResult, TierListSummary, TierType, VoteRecord } from "@/types";
import { CATEGORIES, ALL_SUB_CRITERIA } from "@/data/criteria";

export function getTierFromScore(score: number): TierType {
  if (score >= 136) return "S";
  if (score >= 91) return "A";
  if (score >= 46) return "B";
  return "C";
}

export function getTierInfo(tier: TierType) {
  switch (tier) {
    case "S":
      return {
        name: "Tier S",
        range: "136 - 180 คะแนน",
        badgeColor: "bg-red-500 text-white border-red-400 shadow-red-500/50",
        headerGradient: "from-red-600 to-rose-700",
        bgGlow: "bg-red-500/10 border-red-500/30",
        textColor: "text-red-400",
        borderColor: "border-red-500",
        hexColor: "#ef4444",
        description: "ระดับซูเปอร์สตาร์ / เวิลด์คลาส",
      };
    case "A":
      return {
        name: "Tier A",
        range: "91 - 135 คะแนน",
        badgeColor: "bg-amber-500 text-white border-amber-400 shadow-amber-500/50",
        headerGradient: "from-amber-500 to-orange-600",
        bgGlow: "bg-amber-500/10 border-amber-500/30",
        textColor: "text-amber-400",
        borderColor: "border-amber-500",
        hexColor: "#f59e0b",
        description: "ระดับตัวท็อป / ยอดเยี่ยม",
      };
    case "B":
      return {
        name: "Tier B",
        range: "46 - 90 คะแนน",
        badgeColor: "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/50",
        headerGradient: "from-emerald-500 to-teal-600",
        bgGlow: "bg-emerald-500/10 border-emerald-500/30",
        textColor: "text-emerald-400",
        borderColor: "border-emerald-500",
        hexColor: "#10b981",
        description: "ระดับมาตรฐาน / กำลังพัฒนาได้ดี",
      };
    case "C":
      return {
        name: "Tier C",
        range: "0 - 45 คะแนน",
        badgeColor: "bg-blue-500 text-white border-blue-400 shadow-blue-500/50",
        headerGradient: "from-blue-600 to-indigo-700",
        bgGlow: "bg-blue-500/10 border-blue-500/30",
        textColor: "text-blue-400",
        borderColor: "border-blue-500",
        hexColor: "#3b82f6",
        description: "ระดับเริ่มต้น / ต้องฝึกฝนเพิ่ม",
      };
  }
}

export function calculateCandidateResult(
  candidate: Candidate,
  votes: VoteRecord[]
): CandidateTierResult {
  const candidateVotes = votes.filter((v) => v.candidateId === candidate.id);
  const voteCount = candidateVotes.length;

  const subCriteriaAverages: Record<string, number> = {};

  // Calculate average for each of the 36 subcriteria
  for (const sub of ALL_SUB_CRITERIA) {
    if (voteCount === 0) {
      subCriteriaAverages[sub.id] = 0;
    } else {
      let sum = 0;
      let ratedCount = 0;
      for (const vote of candidateVotes) {
        if (vote.scores && vote.scores[sub.id] !== undefined) {
          sum += vote.scores[sub.id];
          ratedCount++;
        }
      }
      subCriteriaAverages[sub.id] = ratedCount > 0 ? Number((sum / ratedCount).toFixed(2)) : 0;
    }
  }

  // Sum up all 36 averages
  const totalScore = Number(
    Object.values(subCriteriaAverages)
      .reduce((acc, curr) => acc + curr, 0)
      .toFixed(2)
  );

  // Category breakdowns
  const categoryAverages = CATEGORIES.map((cat) => {
    const catSubIds = cat.subCriteria.map((s) => s.id);
    const catSum = catSubIds.reduce((acc, id) => acc + (subCriteriaAverages[id] || 0), 0);
    const maxCatScore = cat.subCriteria.length * 5;
    const avgOutOf5 = cat.subCriteria.length > 0 ? Number((catSum / cat.subCriteria.length).toFixed(2)) : 0;
    const percentage = maxCatScore > 0 ? Number(((catSum / maxCatScore) * 100).toFixed(1)) : 0;

    return {
      categoryId: cat.id,
      categoryName: cat.nameTh,
      totalScore: Number(catSum.toFixed(2)),
      maxScore: maxCatScore,
      averageOutOf5: avgOutOf5,
      percentage: percentage,
    };
  });

  const tier = getTierFromScore(totalScore);

  return {
    candidate,
    totalScore,
    tier,
    tierRank: 1,
    overallRank: 1,
    voteCount,
    subCriteriaAverages,
    categoryAverages,
  };
}

export function calculateTierListSummary(
  candidates: Candidate[],
  votes: VoteRecord[]
): TierListSummary {
  const uniqueVoterEmails = new Set<string>();
  votes.forEach((v) => {
    if (v.userEmail) uniqueVoterEmails.add(v.userEmail);
  });

  const results: CandidateTierResult[] = candidates.map((cand) =>
    calculateCandidateResult(cand, votes)
  );

  // Sort overall by totalScore descending
  results.sort((a, b) => b.totalScore - a.totalScore);
  results.forEach((res, index) => {
    res.overallRank = index + 1;
  });

  // Group into tiers
  const tiers: Record<TierType, CandidateTierResult[]> = {
    S: [],
    A: [],
    B: [],
    C: [],
  };

  results.forEach((res) => {
    tiers[res.tier].push(res);
  });

  // Sort inside each tier descending (higher score is leftmost/first)
  (["S", "A", "B", "C"] as TierType[]).forEach((t) => {
    tiers[t].sort((a, b) => b.totalScore - a.totalScore);
    tiers[t].forEach((res, idx) => {
      res.tierRank = idx + 1;
    });
  });

  return {
    totalCandidates: candidates.length,
    totalVoters: uniqueVoterEmails.size,
    tiers,
    rankings: results,
  };
}
