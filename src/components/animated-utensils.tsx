"use client";

import { cn } from "@/lib/utils";

export function AnimatedUtensils({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-8 w-8 text-primary", className)}
    >
      {/* Fork */}
      <g className="origin-center transition-transform duration-300 ease-in-out group-hover:rotate-[-15deg] group-hover:translate-x-[-3px] group-hover:translate-y-[1px]">
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
      </g>
      {/* Knife */}
      <g className="origin-center transition-transform duration-300 ease-in-out group-hover:rotate-[15deg] group-hover:translate-x-[3px] group-hover:translate-y-[1px]">
        <path d="M16 2v20" />
        <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3z" />
      </g>
    </svg>
  );
}
