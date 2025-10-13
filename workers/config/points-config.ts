export type WeekConfig = {
  startDate: string; // ISO date: "2025-01-13"
  endDate: string; // ISO date: "2025-01-19"
  totalPointsPool: number; // Total points available this week
  formula: {
    // Trove/Borrowing weights
    borrowWeight: number; // 0-1, weight for borrowed amount
    collateralWeight: number; // 0-1, weight for collateral amount

    // Stability Pool weight
    stabilityPoolWeight: number; // 0-1, weight for stability pool deposits

    // Ekubo liquidity weight
    ekuboLiquidityWeight: number; // 0-1, weight for Ekubo LP

    minSnapshotsRequired?: number; // Min snapshots to qualify
    multipliers?: {
      earlyAdopter?: number; // Bonus for first week participants
      highCollateral?: number; // Bonus for >1 BTC
      highStabilityDeposit?: number; // Bonus for large stability pool deposits
      highLiquidity?: number; // Bonus for significant liquidity provision
    };
  };
};

export type SeasonConfig = {
  seasonNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  weeks: WeekConfig[];
};

export const POINTS_CONFIG: SeasonConfig[] = [
  {
    seasonNumber: 1,
    name: 'Season 1: Genesis',
    startDate: '2025-01-13', // Monday
    endDate: '2025-02-21', // Friday (6 weeks later)
    weeks: [
      {
        startDate: '2025-01-13',
        endDate: '2025-01-19',
        totalPointsPool: 1_000_000,
        formula: {
          borrowWeight: 0.4,
          collateralWeight: 0.2,
          stabilityPoolWeight: 0.2,
          ekuboLiquidityWeight: 0.2,
          multipliers: {
            earlyAdopter: 1.5, // 50% bonus for week 1
          },
        },
      },
      {
        startDate: '2025-01-20',
        endDate: '2025-01-26',
        totalPointsPool: 1_000_000,
        formula: {
          borrowWeight: 0.3,
          collateralWeight: 0.2,
          stabilityPoolWeight: 0.25,
          ekuboLiquidityWeight: 0.25,
          minSnapshotsRequired: 100, // Must have consistent position
        },
      },
      {
        startDate: '2025-01-27',
        endDate: '2025-02-02',
        totalPointsPool: 1_000_000,
        formula: {
          borrowWeight: 0.25,
          collateralWeight: 0.25,
          stabilityPoolWeight: 0.25,
          ekuboLiquidityWeight: 0.25,
          multipliers: {
            highCollateral: 1.2, // 20% bonus for >=1 BTC
          },
        },
      },
      {
        startDate: '2025-02-03',
        endDate: '2025-02-09',
        totalPointsPool: 1_000_000,
        formula: {
          borrowWeight: 0.25,
          collateralWeight: 0.25,
          stabilityPoolWeight: 0.25,
          ekuboLiquidityWeight: 0.25,
        },
      },
      {
        startDate: '2025-02-10',
        endDate: '2025-02-16',
        totalPointsPool: 1_500_000, // Increased pool
        formula: {
          borrowWeight: 0.2,
          collateralWeight: 0.2,
          stabilityPoolWeight: 0.3,
          ekuboLiquidityWeight: 0.3,
        },
      },
      {
        startDate: '2025-02-17',
        endDate: '2025-02-21',
        totalPointsPool: 2_000_000, // Final week bonus
        formula: {
          borrowWeight: 0.25,
          collateralWeight: 0.25,
          stabilityPoolWeight: 0.25,
          ekuboLiquidityWeight: 0.25,
          multipliers: {
            earlyAdopter: 1.3, // Bonus for consistent participants
          },
        },
      },
    ],
  },
  // Season 2 and 3 configurations can be added here...
];

export const REFERRAL_CONFIG = {
  bonusRate: 0.15, // Referrer gets 15% of referee's points
  retroactiveAllowed: true, // Can apply codes retroactively
  minPointsForBonus: 0, // Minimum points referee must earn
};

// Helper functions
export function getCurrentWeek(): WeekConfig | null {
  const now = new Date();
  for (const season of POINTS_CONFIG) {
    for (const week of season.weeks) {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      if (now >= start && now <= end) {
        return week;
      }
    }
  }
  return null;
}

export function getWeekConfig(weekStart: string): WeekConfig | null {
  for (const season of POINTS_CONFIG) {
    const week = season.weeks.find((w) => w.startDate === weekStart);
    if (week) return week;
  }
  return null;
}

export function getCurrentSeason(): SeasonConfig | null {
  const now = new Date();
  return (
    POINTS_CONFIG.find((season) => {
      const start = new Date(season.startDate);
      const end = new Date(season.endDate);
      return now >= start && now <= end;
    }) || null
  );
}
