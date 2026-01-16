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
      primary: "#F9FAFB",   // white
      secondary: "#9CA3AF", // gray
    },

    divider: "#374151",

    background: {
      default: "#0F172A", // Slate-900 
      paper: "#111827",   // Slate-800 
    },
  },

  shape: {
    borderRadius: 10,
  },

  typography: {
    fontFamily: `"Inter", "Roboto", "Helvetica", "Arial", sans-serif`,
    button: {
      textTransform: "none",
      fontWeight: 500,
    },
  },
});