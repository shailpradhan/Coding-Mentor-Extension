import { Box } from "@mui/material";
import { lazy, Suspense, useRef, useLayoutEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import Navigation from "./bottom-navigation";

const ChatInterface = lazy(() => import("./chat-interface"));
const SavedChats = lazy(() => import("./saved-chats"));

export default function Layout() {
  const navRef = useRef<HTMLDivElement>(null);
  const [navHeight, setNavHeight] = useState(0);
  const { pathname } = useLocation();
  const isSavedPage = pathname === "/saved";

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
          pb: {
            xs: `${navHeight}px`,
            sm: `${navHeight + 16}px`,
          },
          display: "flex",
          width: "100%",
          px: { sm: 4 },
          pt: { sm: 2 },
          gap: { md: 10 },
          flexDirection: "column",
        }}
      >
        {/* Routed page content */}
        <Box
          sx={{
            height: "100%",
            display: isSavedPage ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <Suspense fallback={null}>
            <ChatInterface />
          </Suspense>
        </Box>
        {isSavedPage && (
          <Suspense fallback={null}>
            <Box sx={{ height: "100%" }}>
              <SavedChats />
            </Box>
          </Suspense>
        )}
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
