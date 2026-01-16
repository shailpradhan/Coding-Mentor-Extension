import { Box, Typography, TextField, IconButton, Paper } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useState, useEffect } from "react";
import { Message } from "../types/types";
import type { ScrapedPageData } from "../types/types";

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [problemData, setProblemData] = useState<ScrapedPageData | null>(null);

  useEffect(() => {
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.sendMessage
    ) {
      // Initial fetch
      chrome.runtime.sendMessage(
        { type: Message.GET_DATA },
        (response: ScrapedPageData | null) => {
          if (response) {
            setProblemData(response);
          }
        }
      );

      // Listen for updates
      const listener = (message: any) => {
        if (message.type === Message.DATA_UPDATED) {
          setProblemData(message.data);
        }
      };

      chrome.runtime.onMessage.addListener(listener);
      return () => chrome.runtime.onMessage.removeListener(listener);
    }
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: 0,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: "16px",
        backgroundColor: "background.default",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          flexShrink: 0,
          px: 2,
          py: 1,
          width: "100%",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Typography
          variant="body2"
          fontWeight={600}
          color="primary"
          sx={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {problemData?.leetcodeProblem?.title ||
            problemData?.title ||
            "AI Mentor"}
        </Typography>
      </Box>

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          px: 2,
          py: 1.5,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "100%",
          scrollBehavior: "smooth",
        }}
      >
        {/* User message */}
        <Paper
          sx={{
            alignSelf: "flex-end",
            p: 1.2,
            maxWidth: "80%",
            backgroundColor: "primary.main",
            color: "primary.contrastText",
            borderRadius: "12px 12px 2px 12px",
          }}
        >
          <Typography variant="body2">
            How should I approach this problem?
          </Typography>
        </Paper>

        {/* Assistant message */}
        <Paper
          sx={{
            alignSelf: "flex-start",
            p: 1.2,
            maxWidth: "80%",
            backgroundColor: "background.paper",
            borderRadius: "12px 12px 12px 2px",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Start by identifying whether the problem involves a pattern like
            sliding window or recursion.
          </Typography>
        </Paper>
      </Box>

      {/* Input */}
      <Box
        sx={{
          flexShrink: 0,
          px: 1.5,
          width: "100%",
          py: 1,
          borderTop: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          gap: 2,
          justifyContent: "center",
          backgroundColor: "background.paper",
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Ask for a hint..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{
            maxWidth: { sm: 600 },
            borderRadius: 2,
          }}
        />
        <IconButton color="primary" disabled={!message.trim()}>
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatInterface;
