"use client";

import Link from "next/link";

/**
 * Screen-only chrome around the sheet. Printing is the export path: the page
 * is already laid out for A4 in `custom.css`, so "Save as PDF" in the print
 * dialog produces the file that gets attached to applications.
 */
const ResumeToolbar = () => {
  return (
    <div className={`no-print mx-auto mb-4 flex w-full max-w-[210mm] flex-wrap items-center justify-between gap-3`}>
      <Link href="/" className={`btn btn-ghost text-sm`}>
        ← Back to site
      </Link>

      <div className={`flex items-center gap-3`}>
        <p className={`hidden text-sm opacity-70 sm:block`}>Print → Save as PDF · A4 · margins “Default”</p>
        <button type="button" onClick={() => window.print()} className={`btn btn-primary text-sm`}>
          Print / Save as PDF
        </button>
      </div>
    </div>
  );
};

export default ResumeToolbar;
