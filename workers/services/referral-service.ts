import { createDbClient } from '../db/client';
import { referralCodes, referrals, userTotalPoints, userPoints } from '../db/schema';
import { and, desc, eq, sql } from 'drizzle-orm';
import { REFERRAL_CONFIG } from '../config/points-config';

const CODE_LENGTH = 7;
const CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

/**
 * Generate a consistent anonymous name from an address
 * This ensures the same address always gets the same name
 */
function generateAnonymousName(address: string): string {
  const adjectives = [
    'Swift', 'Bright', 'Noble', 'Silent', 'Golden', 'Cosmic', 'Mystic', 'Lunar',
    'Solar', 'Crystal', 'Thunder', 'Shadow', 'Emerald', 'Sapphire', 'Azure', 'Crimson'
  ];
  const nouns = [
    'Tiger', 'Eagle', 'Phoenix', 'Dragon', 'Wolf', 'Falcon', 'Lion', 'Bear',
    'Hawk', 'Panther', 'Raven', 'Shark', 'Cobra', 'Jaguar', 'Lynx', 'Viper'
  ];

  // Use address as seed for consistent naming
  const hash = address.toLowerCase().split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const adjIndex = hash % adjectives.length;
  const nounIndex = (hash * 7) % nouns.length;

  return `${adjectives[adjIndex]} ${nouns[nounIndex]}`;
}

export async function generateReferralCode(userAddress: string, env: Env): Promise<string> {
  console.log('[generateReferralCode] Starting...', { userAddress, hasDB: !!env.DB });

  if (!env.DB) {
    throw new Error('DB binding is not available. Make sure the dev server has been restarted.');
  }

  const db = createDbClient(env.DB);
  const normalizedAddress = userAddress.toLowerCase();

  // Check if user already has a code
  try {
    console.log('[generateReferralCode] Querying for existing code...');
    const existing = await db
      .select()
      .from(referralCodes)
      .where(eq(referralCodes.userAddress, normalizedAddress))
      .get();

    console.log('[generateReferralCode] Query result:', { hasExisting: !!existing });

    if (existing) {
      return existing.referralCode;
    }
  } catch (error) {
    console.error('[generateReferralCode] Database query error:', error);
    throw new Error(`Failed to query database: ${error instanceof Error ? error.message : String(error)}`);
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
    } catch (error: any) {
      // If duplicate code, try again
      if (error.message?.includes('UNIQUE constraint failed')) {
        attempts++;
        continue;
      }
      throw error;
    }
  }

  throw new Error('Failed to generate unique referral code after multiple attempts');
}

function generateRandomCode(): string {
  const randomValues = new Uint32Array(CODE_LENGTH);
  globalThis.crypto.getRandomValues(randomValues);

  let code = '';
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
    return { success: false, message: 'Invalid referral code' };
  }

  // 2. Check if user is trying to refer themselves
  if (referrerData.userAddress === normalizedReferee) {
    return { success: false, message: 'Cannot use your own referral code' };
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
    return { success: false, message: 'Cannot use referral code from someone you referred' };
  }

  // 4. Check if user already used a code
  const existingReferral = await db.select().from(referrals).where(eq(referrals.refereeAddress, normalizedReferee)).get();

  if (existingReferral) {
    return {
      success: false,
      message: 'You have already used a referral code',
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

    return { success: true, message: 'Referral code applied successfully' };
  } catch (error: any) {
    console.error('[Referral] Error applying code:', error);

    // Handle race condition (another request applied a code simultaneously)
    if (error.message?.includes('UNIQUE constraint failed')) {
      return {
        success: false,
        message: 'You have already used a referral code',
      };
    }

    throw error;
  }
}

export async function getReferralInfo(
  userAddress: string,
  env: Env
): Promise<{
  referralCode: string | null;
  appliedReferralCode: string | null;
  referees: Array<{ anonymousName: string; appliedAt: Date; totalPoints: number }>;
  totalReferrals: number;
  totalBonusEarned: number;
  bonusRate: number;
}> {
  const db = createDbClient(env.DB);
  const normalizedAddress = userAddress.toLowerCase();

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

  // Get user's referees with their points
  const refereesData = await db
    .select({
      refereeAnonymousName: referrals.refereeAnonymousName,
      refereeAddress: referrals.refereeAddress,
      appliedAt: referrals.appliedAt,
      totalPoints: sql<number>`COALESCE(SUM(${userPoints.totalPoints}), 0)`,
    })
    .from(referrals)
    .leftJoin(userPoints, eq(referrals.refereeAddress, userPoints.userAddress))
    .where(eq(referrals.referrerAddress, normalizedAddress))
    .groupBy(referrals.refereeAnonymousName, referrals.refereeAddress, referrals.appliedAt)
    .orderBy(desc(referrals.appliedAt))
    .all();

  // Calculate total bonus earned
  const bonusData = await db
    .select({
      totalBonus: sql<number>`COALESCE(SUM(${userPoints.referralBonus}), 0)`,
    })
    .from(userPoints)
    .where(eq(userPoints.userAddress, normalizedAddress))
    .get();

  return {
    referralCode: codeData?.referralCode || null,
    appliedReferralCode: appliedReferralData?.referralCode || null,
    referees: refereesData.map((r) => ({
      anonymousName: r.refereeAnonymousName,
      appliedAt: r.appliedAt,
      totalPoints: r.totalPoints,
    })),
    totalReferrals: refereesData.length,
    totalBonusEarned: bonusData?.totalBonus || 0,
    bonusRate: REFERRAL_CONFIG.bonusRate,
  };
}
