import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { useNavigate } from "react-router";
import {
  useAllBranchTCRs,
  useAllAverageInterestRates,
  useAllInterestRateVisualization,
} from "~/hooks/use-all-branch-stats";
import { useStabilityPoolData } from "~/hooks/use-stability-pool-data";
import { COLLATERAL_LIST } from "~/lib/collateral";
import Big from "big.js";
import { NumericFormat } from "react-number-format";

interface BorrowRateItem {
  collateral: string;
  icon: string;
  borrowRate: Big | undefined;
  totalDebt: string;
  maxLTV: string;
  totalCollateral: string;
  collateralAddress?: string;
}

interface EarnRateItem {
  pool: string;
  icon: string;
  supplyAPR: Big | undefined;
  totalDeposits: string;
  collateralParam?: string;
}

interface RatesTableProps {
  borrowRates: BorrowRateItem[];
  earnRates: EarnRateItem[];
}

export function RatesTable({ borrowRates, earnRates }: RatesTableProps) {
  const navigate = useNavigate();

  const handleBorrowClick = (collateralAddress?: string) => {
    if (collateralAddress) {
      navigate(`/borrow?collateral=${collateralAddress}`);
    }
  };

  const handleEarnClick = (collateralParam?: string) => {
    if (collateralParam) {
      navigate(`/earn?collateral=${collateralParam}`);
    } else {
      navigate("/earn");
    }
  };

  return (
    <div className="bg-[#242424] rounded-lg p-4 md:p-6 h-full flex flex-col w-full">
      {/* Tablet: Side by side layout */}
      <div className="md:grid md:grid-cols-2 md:gap-6 lg:block flex-1">
        {/* Borrow Rates Section */}
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12.4849 6.49966C12.4849 9.66431 10.0375 12.2563 6.93615 12.4835C6.78948 12.4946 6.64188 12.5001 6.49244 12.5001C6.343 12.5001 6.19448 12.4946 6.0478 12.4835V9.68741C5.71571 9.65138 5.42236 9.57564 5.1696 9.45925C4.80799 9.29298 4.53309 9.05651 4.34675 8.74891C4.15948 8.44224 4.06631 8.07829 4.06631 7.65708H5.02938C5.02938 7.84459 5.07643 8.03026 5.1696 8.21408C5.26277 8.39882 5.41775 8.55031 5.63361 8.67039C5.85039 8.79048 6.13913 8.85052 6.50074 8.85052C6.97951 8.85052 7.3402 8.75353 7.58281 8.56047C7.8245 8.36741 7.94627 8.13649 7.94627 7.86768C7.94627 7.59888 7.83926 7.39751 7.62617 7.22755C7.41307 7.05851 7.09666 6.95598 6.67601 6.92087L6.1419 6.86822C5.56442 6.81557 5.10318 6.64007 4.75817 6.3417C4.41409 6.04334 4.24158 5.62028 4.24158 5.07067C4.24158 4.6901 4.33014 4.36865 4.5091 4.10539C4.68714 3.84213 4.94083 3.64076 5.27107 3.50035C5.50077 3.40244 5.75907 3.3387 6.0478 3.31007V1.40906C3.43718 1.63445 1.38835 3.82735 1.38835 6.49966C1.38835 8.85791 2.98332 10.8439 5.153 11.4332V12.3496C2.48795 11.7408 0.5 9.35302 0.5 6.49966C0.5 3.33593 2.9455 0.743983 6.0478 0.516749C6.19448 0.505664 6.343 0.500122 6.49244 0.500122C6.64188 0.500122 6.78948 0.505664 6.93615 0.516749V3.32392C7.19076 3.3618 7.41953 3.42923 7.62248 3.52714C7.94904 3.6851 8.19995 3.91141 8.37522 4.207C8.55049 4.50166 8.63813 4.85729 8.63813 5.27204H7.68336C7.68336 5.07898 7.63816 4.89609 7.54776 4.72428C7.45735 4.55154 7.32175 4.41114 7.14002 4.30306C6.95921 4.19499 6.72583 4.14049 6.43986 4.14049C6.17695 4.14049 5.95555 4.18206 5.77383 4.26334C5.59302 4.34555 5.4528 4.4564 5.3541 4.5968C5.25447 4.73721 5.20466 4.89516 5.20466 5.07067C5.20466 5.2979 5.28768 5.49743 5.45465 5.66647C5.62069 5.83643 5.87899 5.93896 6.22953 5.97407L6.76365 6.02579C7.41769 6.08491 7.94073 6.26873 8.33187 6.5791C8.723 6.88854 8.91856 7.31807 8.91856 7.86768C8.91856 8.24179 8.82078 8.56694 8.62522 8.84128C8.42965 9.11655 8.15198 9.32993 7.79314 9.48142C7.54222 9.58764 7.25718 9.65692 6.93615 9.68833V11.5912C9.54677 11.3667 11.5965 9.1729 11.5965 6.49966C11.5965 4.14049 9.99879 2.1545 7.82727 1.56609V0.650688C10.4942 1.25757 12.4849 3.64538 12.4849 6.49966Z"
                  fill="white"
                />
              </svg>
              <h3 className="text-white text-base font-medium font-sora leading-none">
                Borrow against your collateral
              </h3>
            </div>
            <p className="text-xs text-[#B2B2B2]">
              Borrow USDU against your wBTC at the interest rate of your choice.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 px-0">
                    Collateral
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Total Collateral
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Total debt
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Borrow
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {borrowRates.map((rate, index) => (
                  <TableRow
                    key={index}
                    className="border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <TableCell className="px-0 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-mg overflow-hidden bg-zinc-800">
                          <img
                            src={rate.icon}
                            alt={rate.collateral}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-white text-sm font-normal font-sora">
                          {rate.collateral}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-sm font-normal font-sora text-right tabular-nums min-w-[70px]">
                      {rate.totalCollateral}
                    </TableCell>
                    <TableCell className="text-white text-sm font-normal font-sora text-right tabular-nums min-w-[70px]">
                      {rate.totalDebt}
                    </TableCell>
                    <TableCell className="text-right pr-0 py-3">
                      <button
                        onClick={() =>
                          handleBorrowClick(rate.collateralAddress)
                        }
                        className="inline-flex items-center justify-center px-3 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <svg
                          width="10"
                          height="7"
                          viewBox="0 0 10 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.66705 4.03044L0.66705 2.9698L7.46995 2.9698L5.75013 1.24999L6.50053 0.500121L9.5 3.50012L6.50053 6.50012L5.75013 5.75025L7.46995 4.03044L0.66705 4.03044Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-3">
            {borrowRates.map((rate, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-lg p-4 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="space-y-3">
                  {/* Header with icon and name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                        <img
                          src={rate.icon}
                          alt={rate.collateral}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-white text-base font-medium font-sora">
                        {rate.collateral}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between gap-6">
                    <div className="flex-1">
                      <div className="text-[#B2B2B2] text-xs mb-1">
                        Total Coll.
                      </div>
                      <div className="text-white text-sm font-medium">
                        {rate.totalCollateral}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[#B2B2B2] text-xs mb-1">
                        Total Debt
                      </div>
                      <div className="text-white text-sm font-medium">
                        {rate.totalDebt}
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-3 border-t border-zinc-700">
                    <button
                      onClick={() => handleBorrowClick(rate.collateralAddress)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      <span className="text-white text-sm font-medium">
                        Borrow
                      </span>
                      <svg
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.66705 4.03044L0.66705 2.9698L7.46995 2.9698L5.75013 1.24999L6.50053 0.500121L9.5 3.50012L6.50053 6.50012L5.75013 5.75025L7.46995 4.03044L0.66705 4.03044Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Separator - only visible on mobile, hidden on tablet and desktop */}
        <div className="my-8 h-px bg-[#484848] md:hidden lg:block lg:my-6" />

        {/* Earn Rates Section */}
        <div>
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="12"
                height="13"
                viewBox="0 0 12 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10.1553 0.724762C11.1667 0.724843 11.9881 1.54636 11.9883 2.55777V2.78922C11.9883 3.04348 11.7816 3.25098 11.5273 3.25113C11.273 3.25113 11.0664 3.04357 11.0664 2.78922V2.55777C11.0662 2.05507 10.658 1.64672 10.1553 1.64664H2.67676C1.99608 1.65765 1.44449 2.19939 1.42285 2.88101L1.42188 2.88785L1.42285 2.89566C1.445 3.54333 1.97727 4.05289 2.62305 4.05289H10.1553C11.1668 4.05297 11.9883 4.87435 11.9883 5.88589V10.7853C11.9882 11.6098 11.3225 12.2755 10.498 12.2755H3.01953C1.62932 12.2755 0.5 11.1462 0.5 9.75601V2.84781C0.5 1.67586 1.4511 0.724762 2.62305 0.724762H10.1553ZM1.42188 9.75601C1.42188 10.6375 2.13803 11.3537 3.01953 11.3537H10.5029C10.8185 11.3535 11.0703 11.101 11.0703 10.7853V9.75797H8.47266C7.6549 9.75409 6.98918 9.0954 6.98145 8.27945V7.86734C6.9816 7.0422 7.64803 6.3732 8.47168 6.3732H11.0664V5.88589C11.0664 5.38306 10.6581 4.97484 10.1553 4.97476H2.62305C2.31661 4.97476 2.01927 4.90989 1.74219 4.7814L1.42188 4.63297V9.75601ZM8.47168 7.29996C8.15598 7.29996 7.90348 7.55168 7.90332 7.86734V8.27359C7.91052 8.57589 8.15561 8.83609 8.47168 8.83609H11.0703V7.29996H8.47168Z"
                  fill="white"
                />
              </svg>
              <h3 className="text-white text-base font-medium font-sora leading-none">
                Earn yield on your USDU
              </h3>
            </div>
            <p className="text-xs text-[#B2B2B2]">
              Deposit USDU and earn rewards from liquidations and borrower
              interest.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 px-0">
                    Pool
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Supply APR
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Total Deposits
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Earn
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {earnRates.map((rate, index) => (
                  <TableRow
                    key={index}
                    className="border-zinc-800 hover:bg-zinc-900/50"
                  >
                    <TableCell className="px-0 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center p-0.5">
                            <img
                              src="/usdu.png"
                              alt="USDU"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <svg
                            width="8"
                            height="6"
                            viewBox="0 0 8 6"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="flex-shrink-0"
                          >
                            <path
                              d="M0.5 3.5L0.5 2.5L5.793 2.5L4.146 0.853L4.854 0.146L7.707 3L4.854 5.854L4.146 5.147L5.793 3.5L0.5 3.5Z"
                              fill="#666666"
                            />
                          </svg>
                          <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800">
                            <img
                              src={rate.icon}
                              alt={rate.pool}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <span className="text-white text-sm font-normal font-sora">
                          {rate.pool}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white text-sm font-normal font-sora text-right tabular-nums min-w-[100px]">
                      {rate.supplyAPR ? (
                        <>
                          <NumericFormat
                            displayType="text"
                            value={rate.supplyAPR.toString()}
                            thousandSeparator=","
                            decimalScale={2}
                            fixedDecimalScale
                          />
                          %
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-white text-sm font-normal font-sora text-right tabular-nums min-w-[90px]">
                      {rate.totalDeposits}
                    </TableCell>
                    <TableCell className="text-right pr-0 py-3">
                      <button
                        onClick={() => handleEarnClick(rate.collateralParam)}
                        className="inline-flex items-center justify-center px-3 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                      >
                        <svg
                          width="10"
                          height="7"
                          viewBox="0 0 10 7"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M0.66705 4.03044L0.66705 2.9698L7.46995 2.9698L5.75013 1.24999L6.50053 0.500121L9.5 3.50012L6.50053 6.50012L5.75013 5.75025L7.46995 4.03044L0.66705 4.03044Z"
                            fill="white"
                          />
                        </svg>
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-3">
            {earnRates.map((rate, index) => (
              <div
                key={index}
                className="border border-zinc-800 rounded-lg p-4 hover:bg-zinc-900/50 transition-colors"
              >
                <div className="space-y-3">
                  {/* Header with icons and name */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center p-1">
                          <img
                            src="/usdu.png"
                            alt="USDU"
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <svg
                          width="10"
                          height="8"
                          viewBox="0 0 10 8"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="flex-shrink-0"
                        >
                          <path
                            d="M0.5 4.5L0.5 3.5L7.293 3.5L5.646 1.853L6.354 1.146L9.707 4.5L6.354 7.854L5.646 7.147L7.293 4.5L0.5 4.5Z"
                            fill="#666666"
                          />
                        </svg>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800">
                          <img
                            src={rate.icon}
                            alt={rate.pool}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <span className="text-white text-base font-medium font-sora">
                        {rate.pool}
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between gap-6">
                    <div className="flex-1">
                      <div className="text-[#B2B2B2] text-xs mb-1">
                        Supply APR
                      </div>
                      <div className="text-white text-sm font-medium">
                        {rate.supplyAPR ? (
                          <>
                            <NumericFormat
                              displayType="text"
                              value={rate.supplyAPR.toString()}
                              thousandSeparator=","
                              decimalScale={2}
                              fixedDecimalScale
                            />
                            %
                          </>
                        ) : (
                          "—"
                        )}
                      </div>
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-[#B2B2B2] text-xs mb-1">
                        Total Deposits
                      </div>
                      <div className="text-white text-sm font-medium">
                        {rate.totalDeposits}
                      </div>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="pt-3 border-t border-zinc-700">
                    <button
                      onClick={() => handleEarnClick(rate.collateralParam)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      <span className="text-white text-sm font-medium">
                        Earn
                      </span>
                      <svg
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.66705 4.03044L0.66705 2.9698L7.46995 2.9698L5.75013 1.24999L6.50053 0.500121L9.5 3.50012L6.50053 6.50012L5.75013 5.75025L7.46995 4.03044L0.66705 4.03044Z"
                          fill="white"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="my-8 h-px bg-[#484848] md:hidden lg:block lg:my-6" />

        {/* Provide Liquidity Section */}
        <div className="mb-4 md:mb-0">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-4">
              <svg
                width="13"
                height="13"
                viewBox="0 0 13 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5ZM6.5 1.5C3.73858 1.5 1.5 3.73858 1.5 6.5C1.5 9.26142 3.73858 11.5 6.5 11.5C9.26142 11.5 11.5 9.26142 11.5 6.5C11.5 3.73858 9.26142 1.5 6.5 1.5ZM6.5 3C6.77614 3 7 3.22386 7 3.5V6.293L8.854 8.146C9.04926 8.34127 9.04926 8.65873 8.854 8.854C8.65873 9.04926 8.34127 9.04926 8.146 8.854L6.146 6.854C6.05211 6.76011 6 6.63261 6 6.5V3.5C6 3.22386 6.22386 3 6.5 3Z"
                  fill="white"
                />
              </svg>
              <h3 className="text-white text-base font-medium font-sora leading-none">
                Provide Liquidity
              </h3>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 1L7.545 4.13L11 4.635L8.5 7.07L9.09 10.51L6 8.885L2.91 10.51L3.5 7.07L1 4.635L4.455 4.13L6 1Z"
                    fill="#FCD34D"
                    stroke="#FCD34D"
                    strokeWidth="0.5"
                  />
                </svg>
                <span className="text-yellow-400 text-[10px] font-semibold font-sora">
                  Points Boost
                </span>
              </div>
            </div>
            <p className="text-xs text-[#B2B2B2]">
              Provide liquidity to the USDU/USDC pool on Ekubo and earn bonus points.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 px-0">
                    Pool
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Platform
                  </TableHead>
                  <TableHead className="text-[#B2B2B2] text-[7px] leading-[7px] font-normal font-sora uppercase h-6 text-right">
                    Provide
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-zinc-800 hover:bg-zinc-900/50">
                  <TableCell className="px-0 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-1">
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border-2 border-[#242424]">
                          <img
                            src="/usdu.png"
                            alt="USDU"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-zinc-800 border-2 border-[#242424]">
                          <img
                            src="/usdc.svg"
                            alt="USDC"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <span className="text-white text-sm font-normal font-sora">
                        USDU/USDC
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white text-sm font-normal font-sora text-right">
                    Ekubo
                  </TableCell>
                  <TableCell className="text-right pr-0 py-3">
                    <a
                      href="https://app.ekubo.org/charts/USDU/USDC"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-1 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                    >
                      <svg
                        width="10"
                        height="7"
                        viewBox="0 0 10 7"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M0.66705 4.03044L0.66705 2.9698L7.46995 2.9698L5.75013 1.24999L6.50053 0.500121L9.5 3.50012L6.50053 6.50012L5.75013 5.75025L7.46995 4.03044L0.66705 4.03044Z"
                          fill="white"
                        />
                      </svg>
                    </a>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Mobile/Tablet Card View */}
          <div className="lg:hidden space-y-3">
            <div className="border border-zinc-800 rounded-lg p-4 hover:bg-zinc-900/50 transition-colors">
              <div className="space-y-3">
                {/* Header with icons and pool name */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border-2 border-[#242424]">
                        <img
                          src="/usdu.png"
                          alt="USDU"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-zinc-800 border-2 border-[#242424]">
                        <img
                          src="/usdc.svg"
                          alt="USDC"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <span className="text-white text-base font-medium font-sora">
                      USDU/USDC
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-white text-sm font-medium">
                      Ekubo
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="pt-3 border-t border-zinc-700">
                  <a
                    href="https://app.ekubo.org/positions/new?baseCurrency=USDU&quoteCurrency=USDC&tickLower=-27641100&tickUpper=-27621100"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
                  >
                    <span className="text-white text-sm font-medium">
                      Provide Liquidity
                    </span>
                    <svg
                      width="10"
                      height="7"
                      viewBox="0 0 10 7"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M0.66705 4.03044L0.66705 2.9698L7.46995 2.9698L5.75013 1.24999L6.50053 0.500121L9.5 3.50012L6.50053 6.50012L5.75013 5.75025L7.46995 4.03044L0.66705 4.03044Z"
                        fill="white"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Stats() {
  // Fetch data for all collaterals dynamically
  const interestRateData = useAllAverageInterestRates();
  const visualizationData = useAllInterestRateVisualization();
  const tcrData = useAllBranchTCRs();
  const stabilityPoolData = useStabilityPoolData();

  // Helper function to format currency values
  const formatCurrency = (value: Big | undefined): string => {
    if (value === undefined || value === null) return "—";

    if (value.gte(1_000_000)) {
      return `$${value.div(1_000_000).toFixed(1)}M`;
    } else if (value.gte(1_000)) {
      return `$${value.div(1_000).toFixed(1)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };

  // Build borrow rates dynamically using COLLATERAL_LIST
  const borrowRates: BorrowRateItem[] = COLLATERAL_LIST.map((collateral) => {
    const rateData = interestRateData[collateral.id];
    const vizData = visualizationData[collateral.id];
    const tcr = tcrData[collateral.id];
    const minCollatRatio = collateral.minCollateralizationRatio.toNumber();
    const maxLTV = (1 / minCollatRatio) * 100;

    return {
      collateral: collateral.symbol,
      icon: collateral.icon,
      borrowRate: rateData.data,
      totalDebt: formatCurrency(vizData.data?.totalDebt),
      maxLTV: `${maxLTV.toFixed(2)}%`,
      totalCollateral: formatCurrency(tcr.data?.totalCollateralUSD),
      collateralAddress: collateral.address,
    };
  });

  // Build earn rates dynamically from stability pool
  const earnRates: EarnRateItem[] = COLLATERAL_LIST.map((collateral) => {
    const poolData = stabilityPoolData[collateral.id];

    return {
      pool: collateral.symbol,
      icon: collateral.icon,
      supplyAPR:
        poolData?.apr !== undefined ? new Big(poolData.apr) : undefined,
      totalDeposits: formatCurrency(poolData?.totalDeposits),
    };
  });

  return <RatesTable borrowRates={borrowRates} earnRates={earnRates} />;
}
