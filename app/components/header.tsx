import React, { useState } from "react";
import { WalletConnector } from "./wallet";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerTitle,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";
import {
  Menu as MenuIcon,
  X as XIcon,
  DollarSign as DollarIcon,
  Layers as LayersIcon,
} from "lucide-react";
import { Link, useLocation } from "react-router";
import { GetTestBtc } from "./get-test-btc";
import { TransactionHistoryButton } from "./transaction-history-button";

function Logo() {
  return (
    <span className="text-xl font-bold text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
      UNCAP
    </span>
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
    <Link
      to={href}
      onClick={onClick}
      className={`font-medium transition-all duration-200 ease-in-out flex items-center gap-2
      ${
        isMobile
          ? `block px-4 py-3 text-base rounded-lg ${
              isActive
                ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            }`
          : `px-4 py-2 rounded-full text-sm ${
              isActive
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 shadow-sm"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            }`
      }`}
    >
      {icon && <span className="text-blue-500 dark:text-blue-400">{icon}</span>}
      {children}
    </Link>
  );
}

function Header() {
  const navItems = [
    { name: "Dashboard", href: "/", icon: <DollarIcon size={16} /> },
    { name: "Borrow", href: "/borrow", icon: <DollarIcon size={16} /> },
    { name: "Stake", href: "/stake", icon: <LayersIcon size={16} /> },
    // { name: "Analytics", href: "/analytics", icon: <ChartIcon size={16} /> },
  ];
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="bg-white dark:bg-gray-900/90 sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left Group: Hamburger (mobile) + Logo */}
          <div className="flex items-center flex-shrink-0">
            {/* Mobile Menu Trigger - Shown only on mobile, to the left of Logo */}
            <div className="md:hidden mr-2">
              <Drawer
                open={isMobileMenuOpen}
                onOpenChange={setIsMobileMenuOpen}
              >
                <DrawerTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <MenuIcon className="h-5 w-5" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="bg-white dark:bg-gray-900">
                  <DrawerHeader className="text-left pb-2 pt-4 border-b border-gray-100 dark:border-gray-800">
                    <DrawerTitle className="flex justify-between items-center text-gray-900 dark:text-gray-100">
                      <Logo />
                      <DrawerClose asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                        >
                          <XIcon className="h-5 w-5" />
                          <span className="sr-only">Close menu</span>
                        </Button>
                      </DrawerClose>
                    </DrawerTitle>
                  </DrawerHeader>
                  <nav className="mt-4 flex flex-col space-y-2 p-4">
                    {navItems.map((item) => (
                      <DrawerClose asChild key={item.name}>
                        <NavLink
                          href={item.href}
                          isActive={location.pathname === item.href}
                          isMobile
                          icon={item.icon}
                        >
                          {item.name}
                        </NavLink>
                      </DrawerClose>
                    ))}
                  </nav>
                </DrawerContent>
              </Drawer>
            </div>
            <Logo />
          </div>

          {/* Desktop Navigation Links - Centered */}
          <nav className="hidden md:flex flex-grow justify-center items-center space-x-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                href={item.href}
                isActive={location.pathname === item.href}
                icon={item.icon}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* Right side: History, Test BTC, and Wallet Connector */}
          <div className="flex items-center justify-end">
            <TransactionHistoryButton />
            <Separator orientation="vertical" className="h-8 mx-1" />
            <GetTestBtc />
            <Separator orientation="vertical" className="h-8 mx-1" />
            <WalletConnector />
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
