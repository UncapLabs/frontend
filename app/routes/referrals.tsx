import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { useAccount } from "@starknet-react/core";
import { useReferral } from "~/hooks/use-referral";
import { Check, Copy, Users, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function ReferralsPage() {
  const { address } = useAccount();
  const {
    referralInfo,
    isLoading,
    generateCode,
    applyCode,
    isGenerating,
    isApplying,
  } = useReferral();

  const [inputCode, setInputCode] = useState("");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (referralInfo?.referralCode) {
      navigator.clipboard.writeText(referralInfo.referralCode);
      setCopied(true);
      toast.success("Referral code copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTwitterShare = () => {
    if (!referralInfo?.referralCode) return;

    const text = `Join me on Uncap Finance and earn rewards! Use my referral code: ${referralInfo.referralCode}`;
    const url = `https://uncap.finance?ref=${referralInfo.referralCode}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;

    window.open(twitterUrl, "_blank");
  };

  const handleApplyCode = () => {
    if (inputCode.trim()) {
      applyCode(inputCode.trim());
    }
  };


  if (!address) {
    return (
      <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 min-h-screen pb-32">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424] mb-8">
          Referrals
        </h1>

        <div className="bg-white rounded-2xl p-8 md:p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-[#006CFF]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#006CFF]" />
            </div>
            <h2 className="text-2xl font-medium font-sora text-[#242424] mb-3">
              Connect your wallet
            </h2>
            <p className="text-sm text-[#94938D] font-sora mb-6">
              Connect your wallet to generate your referral code and start earning rewards.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mx-auto max-w-7xl py-8 lg:py-8 px-4 sm:px-6 lg:px-8 min-h-screen pb-32">
      <div className="flex flex-col md:flex-row md:justify-between md:items-baseline pb-6 lg:pb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium leading-10 font-sora text-[#242424]">
            Referrals
          </h1>
          <p className="text-sm text-[#94938D] font-sora mt-2">
            Refer users to earn rewards. Earn 15% of your referees' points!
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {/* Total Referrals */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-[#006CFF]/10 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-[#006CFF]" />
            </div>
          </div>
          <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider mb-2">
            Total Referrals
          </p>
          <p className="text-3xl font-medium font-sora text-[#242424]">
            {isLoading ? "..." : referralInfo?.totalReferrals || 0}
          </p>
        </div>

        {/* Bonus Earned */}
        <div className="bg-white rounded-2xl p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="w-10 h-10 bg-[#00C853]/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-[#00C853]" />
            </div>
          </div>
          <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider mb-2">
            Points from Referrals
          </p>
          <p className="text-3xl font-medium font-sora text-[#242424]">
            {isLoading ? "..." : referralInfo?.totalBonusEarned.toFixed(2) || "0.00"}
            <span className="text-sm text-[#94938D] ml-2">pts</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Your Referral Code */}
        <div className="bg-[#006CFF] rounded-2xl p-6 lg:p-8 relative overflow-hidden">
          {/* Decorative background */}
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>

          <div className="relative z-10">
            <p className="text-white text-xs font-medium font-sora uppercase tracking-wider mb-2">
              Your Referral Code
            </p>
            <h2 className="text-white text-2xl font-medium font-sora leading-7 mb-6">
              Share your code
              <br />
              Earn rewards
            </h2>

            {referralInfo?.referralCode ? (
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <p className="text-white/70 text-xs font-medium font-sora mb-2">
                    Your code
                  </p>
                  <p className="text-white text-3xl font-mono font-bold tracking-wider">
                    {referralInfo.referralCode}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleCopy}
                    className="flex-1 bg-white hover:bg-white/90 text-[#006CFF] px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy Code
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleTwitterShare}
                    className="flex-1 bg-[#1DA1F2] hover:bg-[#1a8cd8] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    Share on Twitter
                  </Button>
                </div>

                <p className="text-white/70 text-xs font-sora leading-relaxed">
                  Share this code with friends and earn 15% of their points as bonus rewards!
                </p>
              </div>
            ) : (
              <Button
                onClick={generateCode}
                disabled={isGenerating}
                className="bg-white hover:bg-white/90 text-[#006CFF] px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium w-full sm:w-auto"
              >
                {isGenerating ? "Generating..." : "Generate Your Code"}
              </Button>
            )}
          </div>
        </div>

        {/* Apply Referral Code */}
        <div className="bg-white rounded-2xl p-6 lg:p-8">
          <p className="text-[#242424] text-xs font-medium font-sora uppercase tracking-wider mb-2">
            Have a Referral Code?
          </p>
          <h2 className="text-[#242424] text-2xl font-medium font-sora leading-7 mb-6">
            Enter a code to
            <br />
            unlock benefits
          </h2>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium font-sora text-[#94938D] mb-2 block">
                Referral Code
              </label>
              <Input
                placeholder="Enter code (e.g., ABC123X)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                maxLength={10}
                className="h-12 px-4 rounded-xl border-[#E5E5E5] font-mono text-base"
                disabled={isApplying}
              />
            </div>

            <Button
              onClick={handleApplyCode}
              disabled={isApplying || !inputCode.trim()}
              className="bg-[#006CFF] hover:bg-[#0056CC] text-white px-6 py-4 h-auto rounded-xl font-sora text-xs font-medium w-full"
            >
              {isApplying ? "Applying..." : "Apply Code"}
            </Button>

            <p className="text-[#94938D] text-xs font-sora leading-relaxed">
              You can only use one referral code per account. Once applied, it cannot be changed.
            </p>
          </div>
        </div>
      </div>

      {/* Your Referrals List */}
      <div className="bg-white rounded-2xl p-6 lg:p-8 mt-6">
        <div className="mb-6">
          <h2 className="text-xl font-medium font-sora text-[#242424] mb-2">
            Your Referrals
          </h2>
          <p className="text-sm text-[#94938D] font-sora">
            Track the performance of users you've referred
          </p>
        </div>

        {referralInfo?.referees && referralInfo.referees.length > 0 ? (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="hidden md:grid md:grid-cols-4 gap-4 pb-3 border-b border-[#E5E5E5]">
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider">
                User
              </p>
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider">
                Joined
              </p>
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider">
                Total Points
              </p>
              <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider text-right">
                Your Bonus
              </p>
            </div>

            {/* Table Rows */}
            {referralInfo.referees.map((referee, idx) => (
              <div
                key={idx}
                className="md:grid md:grid-cols-4 gap-4 py-4 border-b border-[#E5E5E5] last:border-0 space-y-2 md:space-y-0"
              >
                <div>
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    User
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[#006CFF]/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-[#006CFF]">
                        {referee.anonymousName.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm font-medium font-sora text-[#242424]">
                      {referee.anonymousName}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    Joined
                  </p>
                  <p className="text-sm font-sora text-[#242424]">
                    {new Date(referee.appliedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    Total Points
                  </p>
                  <p className="text-sm font-medium font-sora text-[#242424]">
                    {referee.totalPoints.toFixed(2)} pts
                  </p>
                </div>

                <div className="md:text-right">
                  <p className="text-xs font-medium font-sora text-[#AAA28E] uppercase tracking-wider md:hidden mb-1">
                    Your Bonus
                  </p>
                  <p className="text-sm font-bold font-sora text-[#00C853]">
                    +{(referee.totalPoints * 0.15).toFixed(2)} pts
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-[#94938D]" />
            </div>
            <p className="text-sm text-[#94938D] font-sora">
              No referrals yet. Share your code to start earning!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
