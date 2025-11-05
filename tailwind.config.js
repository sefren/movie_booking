/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
                display: ["Inter", "system-ui", "sans-serif"],
            },

            colors: {
                // Core background & surface system
                base: {
                    50: "#F8F9FA",
                    100: "#F1F3F5",
                    200: "#E9ECEF",
                    900: "#0A0B0D",
                },

                surface: {
                    DEFAULT: "#12141A",
                    light: "#1A1D25",
                    lighter: "#252930",
                    border: "#2A2D35",
                },

                text: {
                    DEFAULT: "#F8F9FA",
                    muted: "#B8BCC4",
                    dim: "#6C7280",
                },

                // Brand colors - Cinema theme
                cinema: {
                    red: "#E63946",
                    "red-dark": "#D62828",
                    gold: "#FFB703",
                    "gold-dark": "#FB8500",
                    blue: "#457B9D",
                    "blue-light": "#A8DADC",
                },

                // Accent colors
                accent: {
                    purple: "#8B5CF6",
                    pink: "#EC4899",
                    emerald: "#10B981",
                    amber: "#F59E0B",
                    cyan: "#06B6D4",
                },

                // Semantic colors
                success: "#10B981",
                warning: "#F59E0B",
                danger: "#EF4444",
                info: "#3B82F6",
            },

            spacing: {
                18: "4.5rem",
                88: "22rem",
                128: "32rem",
            },

            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "slide-down": "slideDown 0.5s ease-out",
                "scale-in": "scaleIn 0.3s ease-out",
                "shimmer": "shimmer 2s linear infinite",
                "float": "float 3s ease-in-out infinite",
                "glow": "glow 2s ease-in-out infinite alternate",
            },

            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideDown: {
                    "0%": { transform: "translateY(-20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                scaleIn: {
                    "0%": { transform: "scale(0.95)", opacity: "0" },
                    "100%": { transform: "scale(1)", opacity: "1" },
                },
                shimmer: {
                    "0%": { backgroundPosition: "-1000px 0" },
                    "100%": { backgroundPosition: "1000px 0" },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0px)" },
                    "50%": { transform: "translateY(-10px)" },
                },
                glow: {
                    "0%": { boxShadow: "0 0 5px rgba(230, 57, 70, 0.5)" },
                    "100%": { boxShadow: "0 0 20px rgba(230, 57, 70, 0.8)" },
                },
            },

            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },

            boxShadow: {
                'glow-sm': '0 0 10px rgba(230, 57, 70, 0.3)',
                'glow-md': '0 0 20px rgba(230, 57, 70, 0.4)',
                'glow-lg': '0 0 30px rgba(230, 57, 70, 0.5)',
                'inner-glow': 'inset 0 0 20px rgba(230, 57, 70, 0.2)',
            },
        },
    },
    plugins: [],
};
