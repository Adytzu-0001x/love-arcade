import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: { 900: "#1a0f1f" },
        candy: "#ff6b9f",
        honey: "#ffd166"
      }
    }
  },
  plugins: []
};
export default config;



