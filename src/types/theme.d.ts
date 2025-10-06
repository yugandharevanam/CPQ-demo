export type Theme = "dark" | "light" | "system"

// Red and Black theme configuration for Emperor Lifts
export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    border: string;
    input: string;
    ring: string;
    destructive: string;
    muted: string;
    popover: string;
  };
}

export const emperorTheme: ThemeConfig = {
  name: "emperor",
  colors: {
    primary: "#dc2626", // Red-600
    secondary: "#171717", // Black/Neutral-900
    accent: "#fef2f2", // Red-50
    background: "#000000", // Pure black for dark mode
    foreground: "#ffffff", // White text
    card: "#1a1a1a", // Dark gray for cards
    border: "#404040", // Gray border
    input: "#262626", // Dark input background
    ring: "#dc2626", // Red focus ring
    destructive: "#ef4444", // Red-500
    muted: "#737373", // Gray-500
    popover: "#1a1a1a", // Dark popover
  }
};