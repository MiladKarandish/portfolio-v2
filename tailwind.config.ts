import type { Config } from "tailwindcss";

const dynamic = (key: string) => {
  return { [key]: `rgba(var(--${key}))` };
};

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
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
