import React, { useState } from "react";
import { WalletConnector } from "./wallet";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "~/components/ui/drawer";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "~/components/ui/navigation-menu";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Menu as MenuIcon,
  BitcoinIcon,
  Percent,
  PiggyBank,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { TransactionHistoryButton } from "./transaction-history-button";
import { Banner1 } from "~/components/banner1";
import { useFeatureFlag } from "~/lib/use-feature-flag";

function Logo() {
  return (
    <svg
      width="121"
      height="25"
      viewBox="0 0 97 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M8.50803 19.0722C6.79749 19.0722 5.36005 18.7683 4.19442 18.1629C3.02879 17.5576 2.14804 16.7056 1.55215 15.6116C0.95627 14.5177 0.658325 13.245 0.658325 11.7948V1.3988H3.19736V12.0784C3.19736 13.04 3.39991 13.8861 3.80631 14.619C4.21141 15.3518 4.81252 15.9226 5.60703 16.3326C6.40154 16.7425 7.36854 16.9463 8.50934 16.9463C9.65014 16.9463 10.6119 16.7461 11.3986 16.3445C12.184 15.9429 12.7811 15.3757 13.1862 14.6428C13.5926 13.9099 13.7952 13.0567 13.7952 12.0796V1.3988H16.3342V11.7936C16.3342 13.2438 16.0402 14.5165 15.4535 15.6104C14.8654 16.7044 13.9938 17.5564 12.836 18.1617C11.6795 18.7671 10.2356 19.071 8.50934 19.071L8.50803 19.0722Z"
        fill="currentColor"
      />
      <path
        d="M23.8468 18.6467H21.4633V1.3988H25.6083L35.2208 16.5673H36.0506L35.5318 16.9927V1.3988H37.9676V18.6467H33.7703L24.1578 3.47823H23.328L23.8468 3.05281V18.6467Z"
        fill="currentColor"
      />
      <path
        d="M51.6729 19.072C49.9453 19.072 48.4726 18.7967 47.256 18.245C46.0381 17.6933 45.0581 16.9783 44.3145 16.0953C43.5723 15.2123 43.0273 14.2566 42.6824 13.2246C42.3361 12.1926 42.1636 11.1964 42.1636 10.2347V9.71518C42.1636 8.67487 42.34 7.63694 42.6941 6.59663C43.0483 5.55632 43.5971 4.61253 44.3393 3.76289C45.0816 2.91086 46.0499 2.22685 47.2416 1.70729C48.4334 1.18654 49.8591 0.926758 51.5174 0.926758C53.1756 0.926758 54.6614 1.19369 55.8702 1.72993C57.0789 2.26498 58.0381 3.01453 58.7464 3.97381C59.4546 4.93547 59.8859 6.06992 60.0414 7.37716H57.4501C57.3115 6.40001 56.9666 5.59326 56.4138 4.95454C55.861 4.31581 55.1658 3.84153 54.3282 3.52575C53.4906 3.20996 52.5536 3.05266 51.5174 3.05266C50.3949 3.05266 49.4096 3.22903 48.5641 3.58295C47.7173 3.93925 47.0143 4.43498 46.4524 5.0737C45.8905 5.71004 45.4671 6.44648 45.1835 7.28064C44.8986 8.11718 44.7562 9.02283 44.7562 9.99998C44.7562 10.9771 44.8986 11.8113 45.1835 12.6454C45.4684 13.4796 45.8996 14.2208 46.4785 14.8667C47.0574 15.5126 47.7787 16.0202 48.6425 16.3896C49.5063 16.7602 50.5164 16.9449 51.6742 16.9449C53.2972 16.9449 54.6627 16.5755 55.7683 15.8355C56.8738 15.0955 57.5468 14.0242 57.7898 12.6228H60.3811C60.2086 13.8037 59.7722 14.8822 59.0731 15.8593C58.3739 16.8365 57.4056 17.617 56.1707 18.1997C54.9358 18.7824 53.437 19.0732 51.6755 19.0732L51.6729 19.072Z"
        fill="currentColor"
      />
      <path
        d="M64.4217 18.6467H61.8827L68.6974 1.3988H72.998L80.0205 18.6467H77.4031L71.0548 2.91101L72.2989 3.47823H69.2411L70.5622 2.91101L64.4217 18.6467ZM75.8219 13.4952C73.1953 13.4941 70.5687 13.4917 67.9421 13.4905C68.2126 12.7957 68.4844 12.1022 68.7549 11.4075C70.8248 11.411 72.8961 11.4134 74.966 11.417C75.2508 12.1094 75.5357 12.8029 75.8206 13.4952H75.8219Z"
        fill="currentColor"
      />
      <path
        d="M86.0302 18.6467H83.4912V1.30466H86.0302V18.6467ZM89.2684 12.6456H85.5115V10.6126H89.7349C90.6327 10.6126 91.3749 10.4506 91.9629 10.1276C92.5497 9.8047 92.994 9.36856 93.2971 8.81682C93.599 8.26747 93.7506 7.65139 93.7506 6.97453C93.7506 6.29767 93.599 5.65895 93.2971 5.10722C92.994 4.55548 92.5497 4.12291 91.9629 3.80712C91.3749 3.49134 90.6327 3.33404 89.7349 3.33404H85.5115V1.30347H89.2684C90.8234 1.30347 92.1224 1.52631 93.1678 1.97675C94.2132 2.42481 95.0038 3.05877 95.5382 3.87862C96.0727 4.69729 96.3419 5.66729 96.3419 6.78387V7.16281C96.3419 8.26628 96.074 9.23032 95.5382 10.0561C95.0025 10.8831 94.2119 11.5219 93.1678 11.9711C92.1224 12.4192 90.8234 12.6444 89.2684 12.6444V12.6456Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Dashboard Icon
function DashboardIcon() {
  return (
    <svg
      width="13"
      height="12"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.70605 8.36035C5.29657 8.36062 5.777 8.84019 5.77734 9.43066V10.9277C5.77732 11.5185 5.29677 11.9997 4.70605 12H1.07129C0.480442 11.9999 1.88885e-05 11.5186 0 10.9277V9.43066C0.000346573 8.84009 0.480643 8.36046 1.07129 8.36035H4.70605ZM11.3271 4.50977C11.905 4.51021 12.3975 4.95544 12.3975 5.53027V10.9561C12.3975 11.5309 11.905 11.9761 11.3271 11.9766H7.69141C7.11347 11.9763 6.62109 11.531 6.62109 10.9561V5.53027C6.62109 4.95534 7.11347 4.51005 7.69141 4.50977H11.3271ZM7.69141 5.34375C7.5628 5.34403 7.48145 5.44073 7.48145 5.53027V10.9561C7.48145 11.0456 7.56279 11.1423 7.69141 11.1426H11.3271C11.4556 11.1422 11.5371 11.0455 11.5371 10.9561V5.53027C11.5371 5.4408 11.4556 5.34418 11.3271 5.34375H7.69141ZM1.07129 9.2207C0.955435 9.22081 0.860698 9.31487 0.860352 9.43066V10.9277C0.86037 11.0438 0.955233 11.1386 1.07129 11.1387H4.70605C4.82198 11.1384 4.916 11.0437 4.91602 10.9277V9.43066C4.91567 9.31497 4.82178 9.22097 4.70605 9.2207H1.07129ZM4.70605 0.0224609C5.28469 0.0227119 5.77734 0.470153 5.77734 1.0459V6.48926C5.7772 7.06488 5.28461 7.51147 4.70605 7.51172H1.07129C0.492612 7.51162 0.000146782 7.06498 0 6.48926V1.0459C0 0.470057 0.492526 0.0225633 1.07129 0.0224609H4.70605ZM1.07129 0.858398C0.943143 0.858498 0.860352 0.954932 0.860352 1.0459V6.48926C0.860507 6.58015 0.943264 6.67568 1.07129 6.67578H4.70605C4.83391 6.67554 4.91586 6.58008 4.91602 6.48926V1.0459C4.91602 0.955 4.83404 0.858641 4.70605 0.858398H1.07129ZM11.3271 0C11.9176 0.000465847 12.3974 0.480734 12.3975 1.07129V2.56738C12.3975 3.15803 11.9177 3.63918 11.3271 3.63965H7.69141C7.10071 3.63935 6.62109 3.15813 6.62109 2.56738V1.07129C6.6212 0.480632 7.10078 0.000300565 7.69141 0H11.3271ZM7.69141 0.860352C7.57557 0.860652 7.48155 0.95541 7.48145 1.07129V2.56738C7.48145 2.68335 7.5755 2.779 7.69141 2.7793H11.3271C11.4429 2.77883 11.5371 2.68325 11.5371 2.56738V1.07129C11.537 0.955512 11.4428 0.860817 11.3271 0.860352H7.69141Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Borrow Icon
function BorrowIcon() {
  return (
    <svg
      width="13"
      height="12"
      viewBox="0 0 13 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.3823 5.99954C12.3823 9.16419 9.93499 11.7561 6.83361 11.9834C6.68694 11.9945 6.53934 12 6.3899 12C6.24046 12 6.09194 11.9945 5.94526 11.9834V9.18728C5.61317 9.15126 5.31982 9.07551 5.06706 8.95913C4.70545 8.79286 4.43055 8.55639 4.24421 8.24879C4.05694 7.94211 3.96377 7.57817 3.96377 7.15695H4.92684C4.92684 7.34447 4.97389 7.53014 5.06706 7.71395C5.16023 7.8987 5.31521 8.05019 5.53107 8.17027C5.74785 8.29035 6.03659 8.3504 6.3982 8.3504C6.87697 8.3504 7.23766 8.25341 7.48027 8.06035C7.72196 7.86729 7.84373 7.63636 7.84373 7.36756C7.84373 7.09876 7.73672 6.89739 7.52363 6.72743C7.31054 6.55839 6.99412 6.45585 6.57347 6.42075L6.03936 6.3681C5.46188 6.31545 5.00064 6.13994 4.65564 5.84158C4.31155 5.54322 4.13905 5.12016 4.13905 4.57055C4.13905 4.18998 4.2276 3.86852 4.40657 3.60527C4.5846 3.34201 4.83829 3.14064 5.16853 3.00023C5.39823 2.90232 5.65653 2.83858 5.94526 2.80995V0.908937C3.33464 1.13432 1.28581 3.32723 1.28581 5.99954C1.28581 8.35779 2.88078 10.3438 5.05046 10.9331V11.8494C2.38541 11.2407 0.397461 8.8529 0.397461 5.99954C0.397461 2.83581 2.84296 0.243861 5.94526 0.0166269C6.09194 0.00554233 6.24046 0 6.3899 0C6.53934 0 6.68694 0.00554233 6.83361 0.0166269V2.8238C7.08822 2.86167 7.31699 2.9291 7.51994 3.02702C7.8465 3.18497 8.09741 3.41128 8.27268 3.70687C8.44796 4.00154 8.53559 4.35717 8.53559 4.77192H7.58082C7.58082 4.57886 7.53562 4.39597 7.44522 4.22415C7.35482 4.05142 7.21921 3.91102 7.03748 3.80294C6.85668 3.69487 6.62329 3.64037 6.33732 3.64037C6.07441 3.64037 5.85302 3.68193 5.67129 3.76322C5.49048 3.84543 5.35026 3.95628 5.25156 4.09668C5.15193 4.23709 5.10212 4.39504 5.10212 4.57055C5.10212 4.79778 5.18514 4.99731 5.35211 5.16635C5.51815 5.33631 5.77645 5.43884 6.12699 5.47394L6.66111 5.52567C7.31515 5.58479 7.8382 5.76861 8.22933 6.07898C8.62046 6.38842 8.81603 6.81795 8.81603 7.36756C8.81603 7.74167 8.71824 8.06682 8.52268 8.34116C8.32711 8.61643 8.04944 8.8298 7.6906 8.98129C7.43968 9.08752 7.15464 9.1568 6.83361 9.18821V11.0911C9.44423 10.8666 11.494 8.67277 11.494 5.99954C11.494 3.64037 9.89625 1.65438 7.72473 1.06597V0.150566C10.3916 0.757448 12.3823 3.14525 12.3823 5.99954Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Earn Icon (Wallet)
function EarnIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10.0376 0.224609C11.049 0.224691 11.8704 1.04621 11.8706 2.05762V2.28906C11.8706 2.54332 11.6639 2.75082 11.4097 2.75098C11.1553 2.75098 10.9487 2.54342 10.9487 2.28906V2.05762C10.9486 1.55492 10.5403 1.14657 10.0376 1.14648H2.55908C1.8784 1.1575 1.32681 1.69924 1.30518 2.38086L1.3042 2.3877L1.30518 2.39551C1.32733 3.04318 1.85959 3.55273 2.50537 3.55273H10.0376C11.0491 3.55282 11.8706 4.3742 11.8706 5.38574V10.2852C11.8706 11.1096 11.2049 11.7754 10.3804 11.7754H2.90186C1.51164 11.7754 0.382324 10.6461 0.382324 9.25586V2.34766C0.382324 1.17571 1.33342 0.224609 2.50537 0.224609H10.0376ZM1.3042 9.25586C1.3042 10.1374 2.02035 10.8535 2.90186 10.8535H10.3853C10.7009 10.8533 10.9526 10.6008 10.9526 10.2852V9.25781H8.35498C7.53723 9.25394 6.8715 8.59525 6.86377 7.7793V7.36719C6.86393 6.54205 7.53035 5.87305 8.354 5.87305H10.9487V5.38574C10.9487 4.88291 10.5404 4.47469 10.0376 4.47461H2.50537C2.19894 4.47461 1.9016 4.40973 1.62451 4.28125L1.3042 4.13281V9.25586ZM8.354 6.7998C8.0383 6.7998 7.7858 7.05153 7.78564 7.36719V7.77344C7.79284 8.07574 8.03793 8.33594 8.354 8.33594H10.9526V6.7998H8.354Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Referral Icon (Multiple Users)
function ReferralIcon() {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="4" cy="3" r="2" fill="currentColor" />
      <path
        d="M0.5 11.5C0.5 9.567 2.067 8 4 8C5.933 8 7.5 9.567 7.5 11.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <circle cx="10.5" cy="2.5" r="1.5" fill="currentColor" />
      <path
        d="M7.5 9.5C7.5 8.119 8.619 7 10 7C11.381 7 12.5 8.119 12.5 9.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Points Icon (Trophy)
function PointsIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 0.5L7 2.5H9L10 3L9.5 4.5L8 6C7.5 6.5 7 7 6.5 7.5L6 8L5.5 7.5C5 7 4.5 6.5 4 6L2.5 4.5L2 3L3 2.5H5L6 0.5Z"
        fill="currentColor"
      />
      <path d="M4 9H8V10H7.5V11.5H4.5V10H4V9Z" fill="currentColor" />
    </svg>
  );
}

// Leaderboard Icon (Podium)
function LeaderboardIcon() {
  return (
    <svg
      width="14"
      height="12"
      viewBox="0 0 14 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M5 5H9V11H5V5Z" fill="currentColor" />
      <path d="M0 7H4V11H0V7Z" fill="currentColor" opacity="0.7" />
      <path d="M10 8H14V11H10V8Z" fill="currentColor" opacity="0.5" />
      <circle cx="7" cy="2" r="1.5" fill="currentColor" />
    </svg>
  );
}

// STRK Rewards Icon (Starknet-style logo)
function StrkRewardsIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 0L7.236 4.764L12 6L7.236 7.236L6 12L4.764 7.236L0 6L4.764 4.764L6 0Z"
        fill="currentColor"
      />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  );
}

function NavLink({
  children,
  href = "#",
  isActive = false,
  isMobile = false,
  icon,
  onClick,
}: {
  children: React.ReactNode;
  href?: string;
  isActive?: boolean;
  isMobile?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className="relative group">
      <Link
        to={href}
        onClick={onClick}
        className={`font-sora font-medium flex items-center gap-1.5
        ${
          isMobile
            ? `block px-4 py-4 text-lg leading-6 rounded-lg ${
                isActive
                  ? "bg-gray-100 text-amber-500"
                  : "text-gray-800 hover:bg-gray-50 hover:text-amber-500"
              }`
            : `text-sm leading-4 ${
                isActive
                  ? "text-amber-500 [&_path]:fill-[#FF9300]"
                  : "text-gray-800 group-hover:text-amber-500 [&_path]:fill-[#242424] group-hover:[&_path]:fill-[#FF9300]"
              }`
        }`}
      >
        {icon && <span>{icon}</span>}
        {children}
      </Link>
      {/* Active underline */}
      {isActive && !isMobile && (
        <div className="absolute -bottom-3.5 left-0 right-0 flex justify-center pointer-events-none">
          <div className="w-7 h-0.5 bg-amber-500"></div>
        </div>
      )}
      {/* Hover underline */}
      {!isActive && !isMobile && (
        <div className="absolute -bottom-3.5 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          <div className="w-7 h-0.5 bg-amber-500/30"></div>
        </div>
      )}
    </div>
  );
}

function Header() {
  const mainNavItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: <DashboardIcon />,
    },
    { name: "Borrow", href: "/borrow", icon: <BorrowIcon /> },
    {
      name: "Earn",
      href: "/earn",
      icon: <EarnIcon />,
    },
  ];

  const howToItems = [
    {
      name: "How to borrow?",
      href: "https://uncap.finance/resources/blog/launch-guide-borrow-bitcoin-cheapest-rates",
      icon: <BitcoinIcon className="h-4 w-4 lg:text-white" />,
      description: "Learn how to borrow USDU against your Bitcoin collateral.",
    },
    {
      name: "How to set your interest rate?",
      href: "https://uncap.finance/resources/docs/how-to/borrowing-liquidations#what-are-user-set-rates",
      icon: <Percent className="h-4 w-4" />,
      description: "Understand how to manage and optimize your interest rate.",
    },
    {
      name: "How to earn yield?",
      href: "https://uncap.finance/resources/docs/how-to/usdu-and-earn#how-can-i-earn-with-uncap",
      icon: <PiggyBank className="h-4 w-4" />,
      description: "Discover ways to earn yield on your USDU deposits.",
    },
    {
      name: "How to bridge bitcoin?",
      href: "https://uncap.finance/resources/blog/bridge-btc-to-starknet",
      icon: <BitcoinIcon className="h-4 w-4" />,
      description: "Learn how to bridge your Bitcoin to Starknet.",
    },
  ];

  const moreNavItems = [
    {
      name: "STRK Rewards",
      href: "/claim",
      icon: <StrkRewardsIcon />,
    },
    {
      name: "Points",
      href: "/points",
      icon: <PointsIcon />,
    },
    {
      name: "Referrals",
      href: "/referrals",
      icon: <ReferralIcon />,
    },
    // {
    //   name: "Leaderboard",
    //   href: "/leaderboard",
    //   icon: <LeaderboardIcon />,
    // },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { data: outageBannerFlag } = useFeatureFlag("show_outage_banner");

  const isMoreActive = moreNavItems.some(
    (item) => item.href === location.pathname
  );

  return (
    <header className="bg-[#F5F3EE]/80 sticky top-0 z-50 backdrop-blur-lg backdrop-saturate-150">
      {outageBannerFlag?.enabled && (
        <Banner1
          title="Service Update"
          description="We're currently experiencing technical difficulties."
          linkText="Check our Twitter for updates"
          linkUrl="https://x.com/uncapfinance"
          defaultVisible={true}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          {/* Left side: Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-7 flex-1">
            {mainNavItems.map((item) => (
              <NavLink
                key={item.name}
                href={item.href}
                isActive={location.pathname === item.href}
                icon={item.icon}
              >
                {item.name}
              </NavLink>
            ))}

            {/* More Flyout Menu - Contains everything else */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger
                    className={`font-sora font-medium text-sm leading-4 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent h-auto px-0 focus:bg-transparent ${
                      isMoreActive
                        ? "text-amber-500"
                        : "text-gray-800 hover:text-amber-500 focus:text-amber-500 data-[state=open]:text-amber-500"
                    }`}
                  >
                    More
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="w-[200px] p-3">
                      <ul className="grid gap-2">
                        <li>
                          {moreNavItems.map((item) => (
                            <NavigationMenuLink key={item.name} asChild>
                              <Link
                                to={item.href}
                                className={`flex-row items-center gap-2 transition-colors hover:text-amber-500 ${
                                  location.pathname === item.href
                                    ? "text-amber-500 [&_path]:fill-[#FF9300] [&_circle]:fill-[#FF9300]"
                                    : "text-gray-800 [&_path]:fill-[#242424] [&_circle]:fill-[#242424] hover:[&_path]:fill-[#FF9300] hover:[&_circle]:fill-[#FF9300]"
                                }`}
                              >
                                {item.icon}
                                {item.name}
                              </Link>
                            </NavigationMenuLink>
                          ))}
                        </li>
                      </ul>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* How To's Flyout Menu */}
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="font-sora font-medium text-sm leading-4 text-gray-800 hover:text-amber-500 bg-transparent hover:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-amber-500 h-auto px-0 focus:bg-transparent focus:text-amber-500">
                    How To's
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-2 p-3 sm:w-[400px] md:w-[500px] lg:w-[600px] lg:grid-cols-[.75fr_1fr]">
                      <div className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="relative flex h-full w-full select-none flex-col justify-end rounded-lg bg-[#0051bf] hover:!bg-[#0051bf] focus:!bg-[#0051bf] p-4 no-underline outline-none overflow-hidden transition-shadow hover:shadow-lg focus:shadow-md hover:!text-white focus:!text-white"
                            href={howToItems[0].href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {/* Decorative coin */}
                            <div className="absolute inset-0 pointer-events-none">
                              <img
                                src="/coin_02.png"
                                alt=""
                                className="absolute w-40 h-40 top-0 right-0 -translate-y-1/4 translate-x-1/4 object-contain opacity-20"
                              />
                            </div>

                            <div className="relative z-10">
                              <div className="[&_svg]:h-6 [&_svg]:w-6">
                                {howToItems[0].icon}
                              </div>
                              <div className="mb-2 mt-3 text-lg font-medium text-white">
                                {howToItems[0].name}
                              </div>
                              <p className="text-sm leading-tight text-white/90">
                                {howToItems[0].description}
                              </p>
                            </div>
                          </a>
                        </NavigationMenuLink>
                      </div>
                      {howToItems.slice(1).map((item) => (
                        <NavigationMenuLink key={item.name} asChild>
                          <a
                            className="block select-none space-y-1 rounded-md p-2 leading-none no-underline outline-none transition-colors hover:bg-gray-50 hover:text-amber-500 focus:bg-gray-50 focus:text-amber-500 [&:hover_svg]:text-amber-500 [&:focus_svg]:text-amber-500"
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <div className="flex items-center gap-1.5 mb-1">
                              {item.icon}
                              <div className="text-sm font-medium leading-none">
                                {item.name}
                              </div>
                            </div>
                            <p className="line-clamp-2 text-sm leading-snug text-gray-600">
                              {item.description}
                            </p>
                          </a>
                        </NavigationMenuLink>
                      ))}
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Mobile: Logo and Hamburger Menu */}
          <div className="md:hidden flex items-center gap-3">
            <img src="/uncap.png" alt="UNCAP" className="h-5 w-5" />
            <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                >
                  <MenuIcon className="size-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DrawerTrigger>
              <DrawerContent className="bg-white dark:bg-gray-900">
                <nav className="mt-4 flex flex-col p-4">
                  {/* Main Navigation - First 3 items without header */}
                  <div className="mb-6">
                    <div className="space-y-1">
                      {mainNavItems.map((item) => (
                        <DrawerClose asChild key={item.name}>
                          <Link
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-sora font-medium text-sm transition-colors ${
                              location.pathname === item.href
                                ? "bg-amber-50 text-amber-500 [&_path]:fill-[#FF9300]"
                                : "text-gray-800 hover:bg-gray-50 hover:text-amber-500 [&_path]:fill-[#242424]"
                            }`}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        </DrawerClose>
                      ))}
                    </div>
                  </div>

                  {/* More Section - Contains everything else */}
                  <div className="mb-6">
                    <h3 className="px-4 mb-3 text-xs font-semibold font-sora text-gray-500 uppercase tracking-wider">
                      More
                    </h3>
                    <div className="space-y-1">
                      {moreNavItems.map((item) => (
                        <DrawerClose asChild key={item.name}>
                          <Link
                            to={item.href}
                            className={`flex items-center gap-3 px-4 py-2.5 rounded-lg font-sora font-medium text-sm transition-colors ${
                              location.pathname === item.href
                                ? "bg-amber-50 text-amber-500 [&_path]:fill-[#FF9300] [&_circle]:fill-[#FF9300]"
                                : "text-gray-800 hover:bg-gray-50 hover:text-amber-500 [&_path]:fill-[#242424] [&_circle]:fill-[#242424]"
                            }`}
                          >
                            {item.icon}
                            {item.name}
                          </Link>
                        </DrawerClose>
                      ))}
                    </div>
                  </div>

                  {/* How To's Section */}
                  <div>
                    <h3 className="px-4 mb-3 text-xs font-semibold font-sora text-gray-500 uppercase tracking-wider">
                      How To's
                    </h3>
                    <div className="space-y-1">
                      {howToItems.map((item) => (
                        <DrawerClose asChild key={item.name}>
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-800 hover:bg-gray-50 hover:text-amber-500 font-sora font-medium text-sm transition-colors"
                          >
                            {item.icon}
                            {item.name}
                          </a>
                        </DrawerClose>
                      ))}
                    </div>
                  </div>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Center: Logo - hidden on screens smaller than lg */}
          <div className="hidden lg:flex justify-center flex-1 lg:flex-initial">
            <Link
              to="/"
              className="text-neutral-800 hover:opacity-80 transition-opacity"
            >
              <Logo />
            </Link>
          </div>

          {/* Right side: Transaction History and Wallet Connector */}
          <div className="flex items-center justify-end gap-1 flex-1">
            <TransactionHistoryButton />
            <Separator orientation="vertical" className="h-8" />
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
