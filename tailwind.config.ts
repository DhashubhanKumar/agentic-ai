import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#0A1929",
                    gradient: "linear-gradient(to right, #0A1929, #112240)",
                },
                secondary: {
                    gold: "#D4AF37",
                    silver: "#E5E4E2",
                },
                accent: "#00D4FF",
                glass: {
                    light: "rgba(255, 255, 255, 0.1)",
                    dark: "rgba(0, 0, 0, 0.3)",
                    border: "rgba(255, 255, 255, 0.2)",
                },
                text: {
                    primary: "#FFFFFF",
                    secondary: "#B0B0B0",
                },
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
                "hero-gradient": "linear-gradient(135deg, #0A1929 0%, #000000 100%)",
                "glass-gradient": "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)",
            },
            fontFamily: {
                sans: ["ui-sans-serif", "system-ui", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
                serif: ["ui-serif", "Georgia", "Cambria", "Times New Roman", "Times", "serif"],
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    plugins: [],
};
export default config;
