import Box from "@mui/material/Box";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import { FaBookmark, FaCodepen } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

import { actionSx } from "./styles/navbar-styles";

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const handlePageChange = (_: unknown, newValue: string) => {
    if (newValue !== location.pathname) {
      navigate(newValue);
    }
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <BottomNavigation
        showLabels
        value={location.pathname}
        onChange={handlePageChange}
        sx={{
          width: "100%",
          px: { xs: 3, sm: 4 },
          gap: { xs: 3, sm: 4 },
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "rgba(2,6,23,0.95)",
          borderTop: "1px solid rgba(129,140,248,0.25)",
          borderRadius: "16px",
        }}
      >
        <BottomNavigationAction
          label="Hints"
          value="/"
          disableRipple
          icon={<FaCodepen size={20} />}
          sx={actionSx}
        />

        <BottomNavigationAction
          label="Saved"
          value="/saved"
          disableRipple
          icon={<FaBookmark size={20} />}
          sx={actionSx}
        />
      </BottomNavigation>
    </Box>
  );
}
