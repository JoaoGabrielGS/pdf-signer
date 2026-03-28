export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                primary: "hsl(var(--primary))",
                muted: "hsl(var(--muted))",
                border: "hsl(var(--border))",
            },
            borderRadius: {
                lg: "var(--radius)",
            },
        },
    },
}