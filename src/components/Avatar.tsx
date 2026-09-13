"use client";

import { useId } from "react";

/**
 * The site's avatar — a die-cut sticker of Alex in a doctoral tam.
 * Pure SVG so it stays crisp at any size; the CSS in globals.css animates it:
 *   .av-eyes blinks on its own, `talking` moves the mouth, `wave` nods the head and swings the tassel.
 */
export type AvatarProps = {
  size?: number;
  talking?: boolean;
  wave?: boolean;
  className?: string;
};

export default function Avatar({ size = 64, talking = false, wave = false, className = "" }: AvatarProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const cut = `av-cut-${uid}`;
  const clip = `av-clip-${uid}`;
  return (
    <svg
      className={`av${talking ? " talking" : ""}${wave ? " wave" : ""}${className ? ` ${className}` : ""}`}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
      <filter id={cut} x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="3.2" result="d"/><feFlood floodColor="#ffffff"/><feComposite in2="d" operator="in" result="border"/><feDropShadow in="border" dx="0.6" dy="1.6" stdDeviation="1.2" floodColor="#161513" floodOpacity="0.35" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="border"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <clipPath id={clip}><path d="M8 -4 H112 V96 Q60 112 8 96 Z"/></clipPath>
      </defs>
      <g className="av-sticker" filter={`url(#${cut})`}>
      <g clipPath={`url(#${clip})`}>
      <g transform="translate(60 62) scale(0.92) translate(-60 -60)">
      <g className="av-body"><path d="M51 64 h18 v24 a9 9 0 0 1 -18 0 Z" fill="#dfae88" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M4 126 C8 98 28 90 46 86 L60 98 L74 86 C92 90 112 98 116 126 Z" fill="#37322f" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M47 86 L60 102 L73 86 Q60 92 47 86 Z" fill="#98663f" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M50 84 L60 95 L53 92 Z" fill="#b07a52" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M70 84 L60 95 L67 92 Z" fill="#b07a52" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M56 90 L64 90 L65 95 L60 98 L55 95 Z" fill="#5a3120" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M60 93 L65 98 L63 120 L60 126 L57 120 L55 98 Z" fill="#6d3d26" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></g>
      <g className="av-head">
      <ellipse cx="39" cy="55" rx="3.6" ry="5.2" fill="#f2c8a2" stroke="#161513" strokeWidth="2"/><ellipse cx="81" cy="55" rx="3.6" ry="5.2" fill="#f2c8a2" stroke="#161513" strokeWidth="2"/><path d="M60 27 C46 27 38 38 38 54 C38 68 48 78 60 78 C72 78 82 68 82 54 C82 38 74 27 60 27 Z" fill="#f2c8a2" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M38 46 C36 52 37 58 40 64 L44 63 C42 57 42 51 44 46 Z" fill="#3f3733" /><path d="M82 46 C84 52 83 58 80 64 L76 63 C78 57 78 51 76 46 Z" fill="#3f3733" /><path d="M39 46 C44 39 76 39 81 46 L81 50 C75 45 45 45 39 50 Z" fill="#1c1715" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <g className="av-cap"><path d="M25 43 C22 20 44 9 60 11 C76 9 98 20 95 43 C86 35 74 32 60 33 C46 32 34 35 25 43 Z" fill="#1b1917" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M34 41 C44 35 76 35 86 41 L86 47 C76 43 44 43 34 47 Z" fill="#0f0e0d" stroke="#161513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="60" cy="11" r="1.8" fill="#d9ad3c" /><g className="av-tassel"><path d="M60 11 C76 9 90 18 91 36" fill="none" stroke="#d9ad3c" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M88 35 L94 35 L95 47 L91 49 L87 47 Z" fill="#d9ad3c" stroke="#b88a22" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" /></g></g>
      <path d="M47 45.5 Q52 42.5 57 44.5" fill="none" stroke="#161513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /><path d="M63 44.5 Q68 42.5 73 45.5" fill="none" stroke="#161513" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <g className="av-eyes"><circle cx="52" cy="51.5" r="2.7" fill="#161513" /><circle cx="68" cy="51.5" r="2.7" fill="#161513" /><circle cx="53" cy="50.6" r="0.9" fill="#fff" /><circle cx="69" cy="50.6" r="0.9" fill="#fff" /></g>
      <path d="M60.5 55 Q57.5 61 60.5 62.5" fill="none" stroke="#161513" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <g className="av-mouth"><g className="av-smile"><path d="M53 67 Q60 73 67 67" fill="none" stroke="#161513" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></g><g className="av-open"><ellipse cx="60" cy="68.6" rx="4.4" ry="3.2" fill="#4a221b" stroke="#161513" strokeWidth="1.6"/><rect x="56.6" y="66.2" width="6.8" height="1.7" rx="0.8" fill="#fff"/></g></g>
      </g>
      </g>
      </g>
      </g>
    </svg>
  );
}
