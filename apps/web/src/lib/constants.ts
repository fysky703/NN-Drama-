export const APP_NAME = "NN Drama";
export const APP_TAGLINE = "Turn any public webpage into editable code.";
export const APP_DESCRIPTION =
  "Scan, analyze and reconstruct any public website into clean, responsive frontend code.";

export const EXAMPLE_URLS = [
  "https://example.com",
  "https://vercel.com",
  "https://tailwindcss.com",
];

export const OUTPUT_FORMATS = [
  "Next.js + TypeScript + Tailwind",
  "React + TypeScript + Tailwind",
  "HTML + CSS + JavaScript",
];

export const LEGAL_NOTICE =
  "Only scan websites you own or have permission to reproduce. You are responsible for respecting copyright, trademarks and asset licenses. NN Drama does not copy protected logos or assets without permission.";

export const SCAN_STEPS: { key: string; label: string }[] = [
  { key: "url", label: "Validate URL" },
  { key: "browser", label: "Start browser" },
  { key: "capture-desktop", label: "Capture desktop" },
  { key: "capture-tablet", label: "Capture tablet" },
  { key: "capture-mobile", label: "Capture mobile" },
  { key: "dom", label: "Extract DOM" },
  { key: "css", label: "Analyze CSS" },
  { key: "colors", label: "Extract colors" },
  { key: "fonts", label: "Detect fonts" },
  { key: "components", label: "Detect components" },
  { key: "responsive", label: "Analyze responsive behavior" },
  { key: "report", label: "Assemble report" },
];
