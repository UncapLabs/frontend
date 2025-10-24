import { createDbClient } from "../db/client";
import {
  referralCodes,
  referrals,
  referralPointBreakdowns,
} from "../db/schema";
import { and, desc, eq, sum } from "drizzle-orm";

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
  bonusEarned: number;
  hasCalculation: boolean; // Whether any weekly calculation has been done for this referee
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

  // Get base referral relationships
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

  // Get aggregated bonus points per referee from the breakdown table
  const bonusBreakdown = await db
    .select({
      refereeAddress: referralPointBreakdowns.refereeAddress,
      totalBonus: sum(referralPointBreakdowns.bonusPoints).as("totalBonus"),
    })
    .from(referralPointBreakdowns)
    .where(eq(referralPointBreakdowns.referrerAddress, normalizedAddress))
    .groupBy(referralPointBreakdowns.refereeAddress)
    .all();

  // Create maps for referee data
  const bonusByReferee = new Map<string, number>();
  const hasCalculationByReferee = new Map<string, boolean>();
  let totalBonusEarned = 0;

  for (const row of bonusBreakdown) {
    const bonus = Number(row.totalBonus ?? 0);
    if (Number.isFinite(bonus)) {
      bonusByReferee.set(row.refereeAddress, bonus);
      hasCalculationByReferee.set(row.refereeAddress, true);
      if (bonus > 0) {
        totalBonusEarned += bonus;
      }
    }
  }

  return {
    referralCode: codeData?.referralCode || null,
    appliedReferralCode: appliedReferralData?.referralCode || null,
    referees: baseReferrals.map((ref) => {
      const bonus = bonusByReferee.get(ref.refereeAddress) ?? 0;
      const hasCalculation = hasCalculationByReferee.get(ref.refereeAddress) ?? false;

      return {
        anonymousName: ref.refereeAnonymousName,
        appliedAt:
          typeof ref.appliedAt === "number"
            ? ref.appliedAt
            : new Date(ref.appliedAt).getTime(),
        bonusEarned: bonus,
        hasCalculation,
      };
    }),
    totalReferrals: baseReferrals.length,
    totalBonusEarned,
    bonusRate,
  };
}
