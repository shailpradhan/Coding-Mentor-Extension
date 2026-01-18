import type { Theme } from "@mui/material/styles";
import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",

    primary: {
      main: "#818CF8", // Indigo
    },

    secondary: {
      main: "#22D3EE",
    },

    text: {
      primary: "#F9FAFB", // white
      secondary: "#9CA3AF", // gray
    },

    divider: "#374151",

    background: {
      default: "#0F172A", // Slate-900
      paper: "#111827", // Slate-800
    },
    action: {
      hover: "#1F2937",
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: `
    monospace,
    Consolas,
    Monaco,
    SFMono-Regular,
    ui-monospace,
    Menlo,
    "Liberation Mono",
    "Courier New",
    `,
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
});

export const themedScrollbar = (theme: Theme) => ({
  scrollbarWidth: "thin", // Firefox
  scrollbarColor: `${theme.palette.primary.main} transparent`,

  "&::-webkit-scrollbar": {
    width: 8,
  },

  "&::-webkit-scrollbar-track": {
    background: "transparent",
  },

  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 8,
    border: `2px solid transparent`,
    backgroundClip: "content-box",
  },

  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
});
