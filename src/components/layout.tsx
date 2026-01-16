import { Box } from "@mui/material";
import { useRef, useLayoutEffect, useState } from "react";

import ChatInterface from "./chat-interface";
import Navigation from "./bottom-navigation";

export default function Layout() {
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);

  // calculate nav height at runtime
  useLayoutEffect(() => {
    if (navRef.current) {
      setNavHeight(navRef.current.offsetHeight);
    }
  }, []);

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          pb: {xs: `${navHeight}px`, sm: `${navHeight + 16}px`,},
          display: "flex",
          width: "100%",
          px: { sm: 4 },
          pt: { sm: 2 },
          gap: { md: 10 },
          flexDirection: "column",
        }}
      >
        <ChatInterface />
      </Box>

      <Box
        ref={navRef}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          zIndex: 1300,
        }}
      >
        <Navigation />
      </Box>
    </>
  );
}
