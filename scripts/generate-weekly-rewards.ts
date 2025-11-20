/**
 * Script to generate weekly STRK rewards allocation JSON file
 * Fetches data from OpenBlockLabs API and generates JSON with user addresses and amounts in 18 decimals
 *
 * Usage:
 *   npx tsx scripts/generate-weekly-rewards.ts --week <week-number> [output-file]
 *   npx tsx scripts/generate-weekly-rewards.ts [output-file] [start-date] [end-date]
 *
 * Examples:
 *   # Generate rewards for week 1 (Nov 12-19, 2025)
 *   npx tsx scripts/generate-weekly-rewards.ts --week 1
 *
 *   # Generate rewards for week 2 with custom output file
 *   npx tsx scripts/generate-weekly-rewards.ts --week 2 week-2-rewards.json
 *
 *   # Get data for a custom date range
 *   npx tsx scripts/generate-weekly-rewards.ts custom.json 2025-11-13 2025-11-19
 *
 *   # Get all available data
 *   npx tsx scripts/generate-weekly-rewards.ts all-rewards.json
 *
 * Week Schedule (Thursday to Wednesday):
 *   Week 1: Nov 13, 2025 - Nov 19, 2025 (Thu-Wed)
 *   Week 2: Nov 20, 2025 - Nov 26, 2025 (Thu-Wed)
 *   Week 3: Nov 27, 2025 - Dec 3, 2025 (Thu-Wed)
 *   Week 4: Dec 4, 2025 - Dec 10, 2025 (Thu-Wed)
 *   (and so on, 7 days per week, Thursday 00:00 UTC to Wednesday 23:59 UTC)
 */

interface AggregatedItem {
  date: string;
  protocol: string;
  user_address: string;
  row_count: number;
  allocated_tokens: number | null;
}

interface AggregatedResponse {
  items: AggregatedItem[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

interface RewardAllocation {
  address: string;
  amount: string; // 18 decimal format (wei)
}

const API_BASE_URL = "https://www.data-openblocklabs.com";
const PROTOCOL = "Uncap";
const PAGE_SIZE = 1000;

// Week 1 starts on Thursday Nov 13, 2025
const WEEK_1_START = new Date("2025-11-13");

/**
 * Calculate start and end dates for a given week number
 * Follows the official schedule: Thursday 00:00:00 UTC to Wednesday 23:59:59 UTC
 * Week 1: Thursday Nov 13 - Wednesday Nov 19, 2025
 * Week 2: Thursday Nov 20 - Wednesday Nov 26, 2025
 * etc.
 */
function getWeekDates(weekNumber: number): { startDate: string; endDate: string } {
  if (weekNumber < 1) {
    throw new Error("Week number must be >= 1");
  }

  // Calculate days offset from Week 1 start
  const daysOffset = (weekNumber - 1) * 7;

  // Start date for this week (Thursday)
  const startDate = new Date(WEEK_1_START);
  startDate.setDate(WEEK_1_START.getDate() + daysOffset);

  // End date is 6 days after start (Wednesday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);

  // Format as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split("T")[0];

  return {
    startDate: formatDate(startDate),
    endDate: formatDate(endDate),
  };
}

/**
 * Convert STRK amount to 18 decimal format (wei)
 * Uses BigInt for precise conversion without floating point errors
 */
function toWei(amount: number): string {
  // Convert to string to preserve precision
  const amountStr = amount.toString();

  // Split into whole and fractional parts
  const [whole = "0", fractional = ""] = amountStr.split(".");

  // Pad fractional part to 18 digits (or truncate if longer)
  const fractionalPadded = fractional.padEnd(18, "0").slice(0, 18);

  // Combine whole and fractional parts as a single integer string
  const weiStr = whole + fractionalPadded;

  // Convert to BigInt to handle large numbers and ensure valid format
  return BigInt(weiStr).toString();
}

/**
 * Fetch all pages from the aggregated API endpoint
 */
async function fetchAllAllocations(): Promise<AggregatedItem[]> {
  const allItems: AggregatedItem[] = [];
  let currentPage = 1;
  let totalPages = 1;

  console.log("Fetching allocations from OBL API...");

  while (currentPage <= totalPages) {
    const url = `${API_BASE_URL}/starknet/lending-incentives/aggregated/user-protocol?page=${currentPage}&size=${PAGE_SIZE}`;

    console.log(`Fetching page ${currentPage}/${totalPages}...`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data: AggregatedResponse = await response.json();

    // Update total pages on first request
    if (currentPage === 1) {
      totalPages = data.pages;
      console.log(`Total pages: ${totalPages}`);
    }

    // Filter for Uncap protocol
    const uncapItems = data.items.filter(item => item.protocol === PROTOCOL);
    allItems.push(...uncapItems);

    currentPage++;
  }

  console.log(`Fetched ${allItems.length} Uncap allocation entries`);
  return allItems;
}

/**
 * Filter allocations by date range
 */
function filterByDateRange(
  items: AggregatedItem[],
  startDate?: string,
  endDate?: string
): AggregatedItem[] {
  if (!startDate && !endDate) {
    return items;
  }

  const filtered = items.filter(item => {
    if (startDate && item.date < startDate) return false;
    if (endDate && item.date > endDate) return false;
    return true;
  });

  if (startDate || endDate) {
    const range = `${startDate || 'beginning'} to ${endDate || 'latest'}`;
    console.log(`Filtered to date range: ${range}`);
    console.log(`${filtered.length} entries in date range`);
  }

  return filtered;
}

/**
 * Aggregate allocations by user address
 */
function aggregateByUser(items: AggregatedItem[]): Map<string, number> {
  const userAllocations = new Map<string, number>();

  for (const item of items) {
    const { user_address, allocated_tokens } = item;

    if (allocated_tokens === null) continue;

    const currentTotal = userAllocations.get(user_address) || 0;
    userAllocations.set(user_address, currentTotal + allocated_tokens);
  }

  console.log(`Aggregated to ${userAllocations.size} unique users`);
  return userAllocations;
}

/**
 * Generate reward allocation JSON
 */
function generateRewardJSON(userAllocations: Map<string, number>): RewardAllocation[] {
  const rewards: RewardAllocation[] = [];
  let totalSTRK = 0;

  for (const [address, amount] of userAllocations.entries()) {
    if (amount <= 0) continue; // Skip users with 0 or negative allocations

    rewards.push({
      address,
      amount: toWei(amount)
    });

    totalSTRK += amount;
  }

  // Sort by address for consistency
  rewards.sort((a, b) => a.address.localeCompare(b.address));

  console.log(`\nGenerated ${rewards.length} reward allocations`);
  console.log(`Total STRK allocated: ${totalSTRK.toFixed(6)}`);

  return rewards;
}

/**
 * Main function
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    let outputFile: string;
    let startDate: string | undefined;
    let endDate: string | undefined;
    let weekNumber: number | undefined;

    // Parse arguments
    if (args[0] === "--week") {
      weekNumber = parseInt(args[1]);
      if (isNaN(weekNumber)) {
        throw new Error("Week number must be a valid integer");
      }

      const dates = getWeekDates(weekNumber);
      startDate = dates.startDate;
      endDate = dates.endDate;
      outputFile = args[2] || `week-${weekNumber}-rewards.json`;

      console.log(`=== STRK Weekly Rewards Generator ===`);
      console.log(`Week ${weekNumber}: ${startDate} to ${endDate}\n`);
    } else {
      // Original argument parsing
      outputFile = args[0] || "weekly-rewards.json";
      startDate = args[1]; // Optional: YYYY-MM-DD
      endDate = args[2];   // Optional: YYYY-MM-DD

      console.log("=== STRK Weekly Rewards Generator ===\n");
    }

    // Fetch all allocations
    const allItems = await fetchAllAllocations();

    // Filter by date range if specified
    const filteredItems = filterByDateRange(allItems, startDate, endDate);

    // Aggregate by user
    const userAllocations = aggregateByUser(filteredItems);

    // Generate reward JSON
    const rewards = generateRewardJSON(userAllocations);

    // Write to file
    const fs = await import("fs/promises");
    await fs.writeFile(outputFile, JSON.stringify(rewards, null, 2));

    console.log(`\n✓ Rewards file generated: ${outputFile}`);

  } catch (error) {
    console.error("Error generating rewards:", error);
    process.exit(1);
  }
}

main();
