import { Link } from "react-router";
import { AboutVersionDialog } from "~/components/about-version-dialog";
import { FRONTEND_COMMIT_HASH } from "~/lib/version";

export default function Footer() {
  return (
    <footer className="w-full bg-[#242424] text-white font-sora">
      <div className="px-6 lg:px-8 py-8 md:py-10">
        <div className="mx-auto max-w-7xl">
          {/* Top Section: Logo & Links */}
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-16">
            {/* Brand / Logo & CTA */}
            <div className="flex flex-col gap-6 md:w-1/3">
              <img
                src="/uncap_long.png"
                alt="Uncap"
                className="h-8 w-auto object-contain self-start"
              />

              <div className="flex flex-col gap-4">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  Borrow against your Bitcoin
                </h2>
                <Link
                  to="/borrow"
                  className="inline-flex items-center justify-center px-6 py-2.5 text-sm font-normal text-black bg-white rounded-full hover:bg-gray-100 transition-colors w-fit"
                >
                  Get started
                  <svg
                    className="ml-2 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>

              <AboutVersionDialog>
                <button className="text-white/40 hover:text-white/70 transition-colors text-xs font-mono mt-auto self-start">
                  Version {FRONTEND_COMMIT_HASH}
                </button>
              </AboutVersionDialog>
            </div>

            {/* Navigation Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:w-2/3">
              {/* Column 1: Resources */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-white uppercase">Resources</h3>
                <Link
                  to="/stats"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  All Positions
                </Link>
                <a
                  href="https://uncap.finance/resources/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Docs
                </a>
                <a
                  href="https://uncap.finance/resources/blog"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Blog
                </a>
                <a
                  href="https://dune.com/pscott/uncap-protocol"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Dune
                </a>
                <a
                  href="https://defillama.com/protocol/uncap-finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  DefiLlama
                </a>
              </div>

              {/* Column 2: Community */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-white uppercase">Community</h3>
                <a
                  href="https://x.com/uncapfinance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Twitter
                </a>
                <a
                  href="https://github.com/UncapLabs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  GitHub
                </a>
                <a
                  href="https://uncap.substack.com/embed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Newsletter
                </a>
                <a
                  href="https://t.me/UncapSupport_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Support
                </a>
              </div>

              {/* Column 3: Legal */}
              <div className="flex flex-col gap-4">
                <h3 className="font-bold text-white uppercase">Legal</h3>
                <Link
                  to="/terms-and-conditions"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Terms & conditions
                </Link>
                <Link
                  to="/privacy-policy"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Privacy policy
                </Link>
                <a
                  href="https://www.chainsecurity.com/security-audit/uncap-finance"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors text-sm"
                >
                  Security Audit
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
