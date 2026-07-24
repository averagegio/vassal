"use client";

import { useId } from "react";

export function VassalLogo({
  className = "",
  size = 88,
}: {
  className?: string;
  size?: number;
}) {
  const uid = useId().replace(/:/g, "");
  const fillId = `vassal-shield-${uid}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 96 96"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M48 6
           C62 10 78 12 86 14
           V42
           C86 62 70 78 48 90
           C26 78 10 62 10 42
           V14
           C18 12 34 10 48 6Z"
        fill={`url(#${fillId})`}
        stroke="rgba(201,162,39,0.75)"
        strokeWidth="1.75"
      />
      <path
        d="M28 28 L48 72 L68 28"
        stroke="rgba(243,230,216,0.95)"
        strokeWidth="5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M34 28 L48 58 L62 28"
        stroke="rgba(176,16,32,0.9)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id={fillId} x1="48" y1="6" x2="48" y2="90">
          <stop stopColor="#7a0c16" />
          <stop offset="0.55" stopColor="#3a0610" />
          <stop offset="1" stopColor="#120306" />
        </linearGradient>
      </defs>
    </svg>
  );
}
