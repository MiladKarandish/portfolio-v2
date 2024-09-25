import type { Config } from "tailwindcss";

const dynamic = (key: string) => {
  return { [key]: `rgba(var(--${key}))` };
};

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ...dynamic("backgorund"),
        ...dynamic("text"),
      },
    },
  },
  plugins: [],
};
export default config;
