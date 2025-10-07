import { Link } from "react-router";

export default function Footer() {
  return (
    <footer className="w-full bg-[#242424] text-white py-8 sm:py-3">
      <div className="w-full px-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-0">
        {/* Left side - Logo (bottom on mobile, left on desktop) */}
        <div className="flex items-center order-3 md:order-1 w-full md:w-auto justify-start">
          <span className="text-xs text-white">© 2025 UNCAP</span>
        </div>

        {/* Center - Links (top on mobile, center on desktop) */}
        <nav className="flex flex-col md:flex-row md:flex-wrap items-start md:items-center md:justify-center gap-2 md:gap-6 text-sm md:text-xs text-sora text-white transition-colors order-1 md:order-2 w-full md:w-auto">
          <a
            className="hover:text-white/90"
            href="https://t.me/UncapSupport_bot"
            target="_blank"
            rel="noopener noreferrer"
          >
            Support
          </a>
          <Link className="hover:text-white/90" to="/docs/">
            Docs
          </Link>
          <Link className="hover:text-white/90" to="/terms-and-conditions">
            Terms & conditions
          </Link>
          <Link className="hover:text-white/90" to="/privacy-policy">
            Privacy policy
          </Link>
          <a
            className="hover:text-white/90"
            href="https://www.chainsecurity.com/security-audit/uncap-finance"
            target="_blank"
            rel="noopener noreferrer"
          >
            Security Audit
          </a>
        </nav>

        {/* Right side - Social Links (middle on mobile, right on desktop) */}
        <div className="flex items-center gap-4 order-2 md:order-3 w-full md:w-auto justify-start md:justify-end">
          <a
            href="https://x.com/uncapfinance"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/90 transition-colors"
            aria-label="Twitter"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.601 0.749695H15.0547L9.69469 6.89141L16.001 15.2503H11.0638L7.19412 10.1817L2.77126 15.2503H0.315262L6.04783 8.67884L0.000976562 0.750838H5.06383L8.55641 5.38284L12.601 0.749695ZM11.7381 13.7783H13.0981L4.32098 2.14512H2.86269L11.7381 13.7783Z"
                fill="currentColor"
              />
            </svg>
          </a>
          <a
            href="https://github.com/UncapLabs"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white hover:text-white/90 transition-colors"
            aria-label="GitHub"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8.00098 0.197571C3.58098 0.197571 0.000979537 3.77757 0.000979537 8.19757C-0.000468975 9.87701 0.527184 11.5142 1.50902 12.8768C2.49086 14.2393 3.87698 15.2579 5.47058 15.788C5.87058 15.8576 6.02098 15.6176 6.02098 15.4072C6.02098 15.2176 6.01058 14.588 6.01058 13.9176C4.00098 14.288 3.48098 13.428 3.32098 12.9776C3.23058 12.7472 2.84098 12.0376 2.50098 11.8472C2.22098 11.6976 1.82098 11.3272 2.49058 11.3176C3.12098 11.3072 3.57058 11.8976 3.72098 12.1376C4.44098 13.3472 5.59058 13.0072 6.05058 12.7976C6.12098 12.2776 6.33058 11.928 6.56098 11.728C4.78098 11.528 2.92098 10.8376 2.92098 7.77757C2.92098 6.90717 3.23058 6.18797 3.74098 5.62797C3.66098 5.42797 3.38098 4.60797 3.82098 3.50797C3.82098 3.50797 4.49058 3.29757 6.02098 4.32717C6.67231 4.14689 7.34516 4.05618 8.02098 4.05757C8.70098 4.05757 9.38098 4.14717 10.021 4.32717C11.5514 3.28717 12.221 3.50797 12.221 3.50797C12.661 4.60797 12.381 5.42797 12.301 5.62797C12.8106 6.18797 13.121 6.89757 13.121 7.77757C13.121 10.848 11.2514 11.528 9.47138 11.728C9.76098 11.9776 10.0114 12.4576 10.0114 13.208C10.0114 14.2776 10.001 15.1376 10.001 15.408C10.001 15.6176 10.1514 15.8672 10.5514 15.7872C12.139 15.2505 13.5185 14.2296 14.4958 12.8683C15.4732 11.5069 15.9993 9.87345 16.0002 8.19757C16.0002 3.77757 12.4202 0.197571 8.00018 0.197571"
                fill="currentColor"
              />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
