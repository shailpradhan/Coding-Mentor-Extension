export const actionSx = {
  color: "text.secondary",
  minWidth: 0,
  padding: "8px 0",
  transition: "color 0.3s ease",

  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",

  "& svg": {
    transition: "transform 0.25s ease",
  },

  "& .MuiBottomNavigationAction-label": {
    fontSize: "0.7rem",
    marginTop: "4px",
    transition: "opacity 0.25s ease, transform 0.25s ease",
  },

  "&.Mui-selected": {
    color: "primary.main",

    "& svg": {
      transform: "translateY(-3px) scale(1.05)",
    },

    "& .MuiBottomNavigationAction-label": {
      transform: "scale(1.05)",
    },
  },

  "&:focus": {
    outline: "none",
  },
};