"use client";

import { X } from "lucide-react";
import { useState } from "react";

interface Banner1Props {
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  defaultVisible?: boolean;
}

const Banner1 = ({
  title = "Version 2.0 is now available!",
  description = "Read the full release notes",
  linkText = "here",
  linkUrl = "#",
  defaultVisible = true,
}: Banner1Props) => {
  const [isVisible, setIsVisible] = useState(defaultVisible);

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <section className="bg-white w-full border-b border-neutral-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 text-center">
            <span className="text-xs sm:text-sm font-sora">
              <span className="font-medium text-[#242424]">{title}</span>{" "}
              <span className="text-[#94938D]">
                {description}{" "}
                <a
                  href={linkUrl}
                  className="text-[#FF9300] hover:text-[#e88500] underline underline-offset-2 font-medium transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {linkText}
                </a>
                .
              </span>
            </span>
          </div>

          <button
            onClick={handleClose}
            className="h-8 w-8 flex-none rounded-md hover:bg-neutral-200/50 transition-colors inline-flex items-center justify-center text-[#242424] hover:text-[#FF9300]"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close banner</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export { Banner1 };
