import { createDbClient } from "../db/client";
import {
  referralCodes,
  referrals,
  userTotalPoints,
  userPoints,
} from "../db/schema";
import { and, desc, eq, sql } from "drizzle-orm";

const CODE_LENGTH = 7;
const CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

/**
 * Generate a consistent anonymous name from an address
 * This ensures the same address always gets the same name
 */
function generateAnonymousName(address: string): string {
  const adjectives = [
    "Swift",
    "Bright",
    "Noble",
    "Silent",
    "Golden",
    "Cosmic",
    "Mystic",
    "Lunar",
    "Solar",
    "Crystal",
    "Thunder",
    "Shadow",
    "Emerald",
    "Sapphire",
    "Azure",
    "Crimson",
  ];
  const nouns = [
    "Tiger",
    "Eagle",
    "Phoenix",
    "Dragon",
    "Wolf",
    "Falcon",
    "Lion",
    "Bear",
    "Hawk",
    "Panther",
    "Raven",
    "Shark",
    "Cobra",
    "Jaguar",
    "Lynx",
    "Viper",
  ];

  // Use address as seed for consistent naming
  const hash = address
    .toLowerCase()
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adjIndex = hash % adjectives.length;
  const nounIndex = (hash * 7) % nouns.length;

  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`;
}

export async function generateReferralCode(
  userAddress: string,
  env: Env
): Promise<string> {
  console.log("[generateReferralCode] Starting...", {
    userAddress,
    hasDB: !!env.DB,
  });

  if (!env.DB) {
    throw new Error(
      "DB binding is not available. Make sure the dev server has been restarted."
    );
  }

  const db = createDbClient(env.DB);
  const normalizedAddress = userAddress.toLowerCase();

  // Check if user already has a code
  try {
    console.log("[generateReferralCode] Querying for existing code...");
    const existing = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userAddress, normalizedAddress))
      .get();

    console.log("[generateReferralCode] Query result:", {
      hasExisting: !!existing,
    });

    if (existing) {
      return existing.referralCode;
    }
  } catch (error) {
    console.error("[generateReferralCode] Database query error:", error);
    throw new Error(
      `Failed to query database: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  // Generate unique code
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    const code = generateRandomCode();

    try {
      // Try to insert (will fail if code already exists due to UNIQUE constraint)
      await db.insert(referralCodes).values({
        userAddress: normalizedAddress,
        referralCode: code,
      });

      return code;
    } catch (error: unknown) {
      // If duplicate code, try again
      if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
        attempts++;
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    "Failed to generate unique referral code after multiple attempts"
  );
}

function generateRandomCode(): string {
  const randomValues = new Uint32Array(CODE_LENGTH);
  globalThis.crypto.getRandomValues(randomValues);

  let code = "";
  for (const value of randomValues) {
    const randomIndex = value % CODE_CHARS.length;
    code += CODE_CHARS[randomIndex];
  }

  return code;
}

export async function applyReferralCode(
  refereeAddress: string,
  referralCode: string,
  env: Env
): Promise<{ success: boolean; message: string }> {
  const db = createDbClient(env.DB);
  const normalizedReferee = refereeAddress.toLowerCase();
  const normalizedCode = referralCode.toUpperCase().trim();

  // 1. Validate code exists
  const referrerData = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.referralCode, normalizedCode))
    .get();

  if (!referrerData) {
    return { success: false, message: "Invalid referral code" };
  }

  // 2. Check if user is trying to refer themselves
  if (referrerData.userAddress === normalizedReferee) {
    return { success: false, message: "Cannot use your own referral code" };
  }

  // 3. Prevent mutual referrals (referring someone and then using their code)
  const reverseReferral = await db
    .select()
    .from(referrals)
    .where(
      and(
        eq(referrals.referrerAddress, normalizedReferee),
        eq(referrals.refereeAddress, referrerData.userAddress)
      )
    )
    .get();

  if (reverseReferral) {
    return {
      success: false,
      message: "Cannot use referral code from someone you referred",
    };
  }

  // 4. Check if user already used a code
  const existingReferral = await db
    .select()
    .from(referrals)
    .where(eq(referrals.refereeAddress, normalizedReferee))
    .get();

  if (existingReferral) {
    return {
      success: false,
      message: "You have already used a referral code",
    };
  }

  // 5. Apply the code
  try {
    // Generate anonymous name for this referee
    const anonymousName = generateAnonymousName(normalizedReferee);

    await db.insert(referrals).values({
      referrerAddress: referrerData.userAddress,
      refereeAddress: normalizedReferee,
      refereeAnonymousName: anonymousName,
      referralCode: normalizedCode,
      appliedRetroactively: false,
    });

    // Update referrer's total referral count
    await db
      .insert(userTotalPoints)
      .values({
        userAddress: referrerData.userAddress,
        totalReferrals: 1,
      })
      .onConflictDoUpdate({
        target: userTotalPoints.userAddress,
        set: {
          totalReferrals: sql`${userTotalPoints.totalReferrals} + 1`,
          lastUpdated: new Date(),
        },
      });

    return { success: true, message: "Referral code applied successfully" };
  } catch (error: unknown) {
    console.error("[Referral] Error applying code:", error);

    // Handle race condition (another request applied a code simultaneously)
    if (error instanceof Error && error.message.includes("UNIQUE constraint failed")) {
      return {
        success: false,
        message: "You have already used a referral code",
      };
    }

    throw error;
  }
}

type ReferralInfoReferee = {
  anonymousName: string;
  appliedAt: number;
  pointsSinceReferral: number;
  bonusEarned: number;
};

type ReferralInfo = {
  referralCode: string | null;
  appliedReferralCode: string | null;
  referees: ReferralInfoReferee[];
  totalReferrals: number;
  totalBonusEarned: number;
  bonusRate: number;
};

export async function getReferralInfo(userAddress: string, env: Env): Promise<ReferralInfo> {
  const db = createDbClient(env.DB);
  const normalizedAddress = userAddress.toLowerCase();

  const bonusRate = 0.1;

  // Get user's referral code
  const codeData = await db
    .select()
    .from(referralCodes)
    .where(eq(referralCodes.userAddress, normalizedAddress))
    .get();

  // Check if user has applied someone else's referral code
  const appliedReferralData = await db
    .select()
    .from(referrals)
    .where(eq(referrals.refereeAddress, normalizedAddress))
    .get();

  const baseReferrals = await db
    .select({
      refereeAnonymousName: referrals.refereeAnonymousName,
      refereeAddress: referrals.refereeAddress,
      appliedAt: referrals.appliedAt,
    })
    .from(referrals)
    .where(eq(referrals.referrerAddress, normalizedAddress))
    .orderBy(desc(referrals.appliedAt))
    .all();

  if (baseReferrals.length === 0) {
    return {
      referralCode: codeData?.referralCode || null,
      appliedReferralCode: appliedReferralData?.referralCode || null,
      referees: [],
      totalReferrals: 0,
      totalBonusEarned: 0,
      bonusRate,
    };
  }

  const refereeWeeklyPoints = await db
    .select({
      refereeAddress: referrals.refereeAddress,
      weekStart: userPoints.weekStart,
      totalPoints: userPoints.totalPoints,
    })
    .from(referrals)
    .innerJoin(
      userPoints,
      and(
        eq(referrals.refereeAddress, userPoints.userAddress),
        sql`strftime('%s', ${userPoints.weekStart}) >= (${referrals.appliedAt} / 1000)`
      )
    )
    .where(eq(referrals.referrerAddress, normalizedAddress))
    .all();

  const referrerWeeklyBonuses = await db
    .select({
      weekStart: userPoints.weekStart,
      referralBonus: userPoints.referralBonus,
    })
    .from(userPoints)
    .where(eq(userPoints.userAddress, normalizedAddress))
    .all();

  const pointsByReferee = new Map<string, number>();
  const weeklyPointsByReferee = new Map<string, Map<string, number>>();

  for (const row of refereeWeeklyPoints) {
    const weekKey = row.weekStart;
    const refereeAddress = row.refereeAddress;
    if (!weekKey || !refereeAddress) continue;

    const points = Number(row.totalPoints ?? 0);
    if (!Number.isFinite(points)) continue;

    pointsByReferee.set(
      refereeAddress,
      (pointsByReferee.get(refereeAddress) ?? 0) + points
    );

    const weekMap =
      weeklyPointsByReferee.get(weekKey) ?? new Map<string, number>();
    weekMap.set(refereeAddress, (weekMap.get(refereeAddress) ?? 0) + points);
    weeklyPointsByReferee.set(weekKey, weekMap);
  }

  const weeklyBonusMap = new Map<string, number>();
  let totalBonusEarned = 0;

  for (const row of referrerWeeklyBonuses) {
    const weekKey = row.weekStart;
    if (!weekKey) continue;

    const bonus = Number(row.referralBonus ?? 0);
    if (!Number.isFinite(bonus) || bonus === 0) continue;

    weeklyBonusMap.set(weekKey, (weeklyBonusMap.get(weekKey) ?? 0) + bonus);
    totalBonusEarned += bonus;
  }

  const bonusByReferee = new Map<string, number>();

  for (const [weekKey, weekMap] of weeklyPointsByReferee) {
    const creditedBonus = weeklyBonusMap.get(weekKey) ?? 0;
    if (creditedBonus <= 0) {
      continue;
    }

    let weekTotalPoints = 0;
    for (const value of weekMap.values()) {
      weekTotalPoints += value;
    }

    if (weekTotalPoints <= 0) {
      continue;
    }

    for (const [refereeAddress, refereePoints] of weekMap) {
      const allocation = (refereePoints / weekTotalPoints) * creditedBonus;
      bonusByReferee.set(
        refereeAddress,
        (bonusByReferee.get(refereeAddress) ?? 0) + allocation
      );
    }
  }

  return {
    referralCode: codeData?.referralCode || null,
    appliedReferralCode: appliedReferralData?.referralCode || null,
    referees: baseReferrals.map((ref) => ({
      anonymousName: ref.refereeAnonymousName,
      appliedAt:
        typeof ref.appliedAt === "number"
          ? ref.appliedAt
          : new Date(ref.appliedAt).getTime(),
      pointsSinceReferral: pointsByReferee.get(ref.refereeAddress) ?? 0,
      bonusEarned: bonusByReferee.get(ref.refereeAddress) ?? 0,
    })),
    totalReferrals: baseReferrals.length,
    totalBonusEarned,
    bonusRate,
  };
}
