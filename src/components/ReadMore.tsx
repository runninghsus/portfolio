"use client";

import { useState } from "react";

/** Phone-only toggle for a row's secondary paragraphs (CSS hides it on wider screens). */
export default function ReadMore() {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      className="readmore"
      aria-expanded={open}
      onClick={(e) => {
        const row = e.currentTarget.closest(".feature");
        const next = !row?.classList.contains("open");
        row?.classList.toggle("open", next);
        setOpen(next);
      }}
    >
      {open ? "Less ↑" : "More ↓"}
    </button>
  );
}
