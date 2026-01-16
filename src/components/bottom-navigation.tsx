import * as React from "react";
import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

import FavoriteIcon from "@mui/icons-material/Favorite";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { FaCodepen } from "react-icons/fa";

const actionSx = {
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

export default function Navigation() {
  const [value, setValue] = React.useState(0);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <BottomNavigation
        showLabels
        value={value}
        onChange={(_, newValue) => setValue(newValue)}
        sx={{
          width: "100%",
          px: { xs: 3, sm: 4 },
          gap: { xs: 3, sm: 4 },
          background: "rgba(2,6,23,0.95)",
          borderTop: "1px solid rgba(129,140,248,0.25)",
          borderRadius: "16px",
        }}
      >
        <BottomNavigationAction
          label="Hints"
          disableRipple
          icon={<FaCodepen size={20} />}
          sx={actionSx}
        />

        <BottomNavigationAction
          label="Favorites"
          disableRipple
          icon={<FavoriteIcon />}
          sx={actionSx}
        />

        <BottomNavigationAction
          label="Nearby"
          disableRipple
          icon={<LocationOnIcon />}
          sx={actionSx}
        />
      </BottomNavigation>
    </Box>
  );
}
