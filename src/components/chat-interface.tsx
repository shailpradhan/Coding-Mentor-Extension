import { useEffect, useRef, useState } from "react";
import lodash from "lodash";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  useTheme,
} from "@mui/material";
import AppSnackbar from "./atom/snackbar";
import SendIcon from "@mui/icons-material/Send";
import StopCircleIcon from "@mui/icons-material/StopCircle";
import SaveIcon from "@mui/icons-material/Save";

import { Message } from "../types/types";
import type { ChatMessage, ScrapedPageData } from "../types/types";
import { languages } from "../content_scripts/content-resource";
import { themedScrollbar } from "../theme/theme";

const ChatInterface = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [problemData, setProblemData] = useState<ScrapedPageData | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [language, setLanguage] = useState("Python");
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    message: string;
    severity: "success" | "error" | "info";
  } | null>(null);

  const theme = useTheme();

  const isDownloading = downloadProgress !== null;
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    chrome.runtime.sendMessage(
      { type: Message.GET_DATA },
      (response: ScrapedPageData | null) => {
        if (response) {
          setProblemData(response);
        }
      },
    );
  }, []);

  // background listener
  useEffect(() => {
    const listener = (msg: any) => {
      if (msg.type === Message.STREAM_AI_TOKEN) {
        setMessages((prev) => {
          const last = prev[prev.length - 1];

          if (last && last.id === "initilizing-session") {
            return [
              ...prev.slice(0, -1),
              {
                id: crypto.randomUUID(),
                role: "bot",
                content: msg.token,
                createdAt: Date.now(),
              },
            ];
          }

          if (!last || last.role !== "bot") {
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                role: "bot",
                content: msg.token,
                createdAt: Date.now(),
              },
            ];
          }

          return [
            ...prev.slice(0, -1),
            {
              ...last,
              content: last.content + msg.token,
            },
          ];
        });
      }

      if (msg.type === Message.STREAM_AI_DONE) {
        setIsStreaming(false);
      }

      if (msg.type === Message.DATA_UPDATED) {
        setProblemData(msg.data);
      }

      if (msg.type === Message.MODEL_DOWNLOAD_PROGRESS) {
        setDownloadProgress(msg.progress);

        if (msg.progress >= 100) {
          lodash.delay(() => {
            setDownloadProgress(null);
            setSnackbar({
              message: "Model ready",
              severity: "success",
            });
          }, 500);
        }
      }

      if (msg.type === Message.SUMMARY_DONE) {
        setIsSaving(false);

        if (msg.error) {
          setSnackbar({
            message: "Failed to save conversation",
            severity: "error",
          });
          return;
        }

        setSnackbar({
          message: "Conversation saved successfully",
          severity: "success",
        });
      }
    };

    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const handleChangelanguage = (event: SelectChangeEvent) => {
    setLanguage(event.target.value);
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    setIsStreaming(true);

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: input,
      createdAt: Date.now(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: "initilizing-session",
        role: "bot",
        content: "Initializing Session",
        createdAt: Date.now() + 1,
      },
    ]);
    setInput("");

    chrome.runtime.sendMessage(
      {
        type: Message.ASK_AI,
        userPrompt: userMessage.content,
        language: language,
      },
      (response) => {
        // Handle connection errors
        if (chrome.runtime.lastError) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "bot",
              content: `Something went wrong.`,
              createdAt: Date.now(),
            },
          ]);
          return;
        }

        // Handle application errors
        if (response && !response.success) {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "bot",
              content: `Error: ${response.error}`,
              createdAt: Date.now(),
            },
          ]);
        }
      },
    );
  };

  const handleSaveConversation = () => {
    if (!messages.length) return;

    setIsSaving(true);

    chrome.runtime.sendMessage({
      type: Message.SUMMARIZE_CONVERSATION,
      messages,
      metadata: {
        title:
          problemData?.leetcodeProblem?.title ??
          problemData?.title ??
          "AI Mentor Session",
      },
    });
  };

  const handleStop = () => {
    chrome.runtime.sendMessage({ type: Message.STOP_ASK_AI });
    setIsStreaming(false);
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="body2" fontWeight={600} noWrap>
          {problemData?.leetcodeProblem?.title ??
            problemData?.title ??
            "AI Mentor"}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl
            size="small"
            variant="outlined"
            sx={{
              width: 96,

              "& .MuiOutlinedInput-root": {
                height: 28, // ⬅ smaller overall height
                fontSize: 12,
                paddingRight: "28px", // space for dropdown icon
              },

              "& .MuiSelect-select": {
                padding: "4px 8px", // ⬅ tight vertical padding
                display: "flex",
                alignItems: "center",
              },

              "& .MuiInputLabel-root": {
                fontSize: 11,
                transform: "translate(14px, 7px) scale(1)", // default position
              },

              "& .MuiInputLabel-shrink": {
                transform: "translate(14px, -6px) scale(0.75)",
              },
            }}
          >
            <InputLabel id="language-select">Language</InputLabel>
            <Select
              labelId="language-select"
              value={language}
              label="Language"
              onChange={handleChangelanguage}
              MenuProps={{
                PaperProps: {
                  sx: {
                    height: 180,
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    "&::-webkit-scrollbar": {
                      display: "none",
                    },
                  },
                },
              }}
            >
              {languages.map((lang, id) => (
                <MenuItem key={id} value={lang}>
                  {lang}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <IconButton
            size="small"
            title="Save summary"
            onClick={() => handleSaveConversation()}
            disabled={isSaving || messages.length === 0}
          >
            <SaveIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, ...themedScrollbar(theme) }}>
        {messages.map((msg) => (
          <Box
            key={msg.id}
            sx={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              mb: 1,
            }}
          >
            <Paper
              elevation={1}
              sx={{
                p: 1.2,
                maxWidth: "75%",
                bgcolor: msg.role === "user" ? "primary.main" : "grey.100",
                color: msg.role === "user" ? "white" : "black",
                borderRadius:
                  msg.role === "user"
                    ? "16px 16px 4px 16px"
                    : "16px 16px 16px 4px",
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {msg.content.trim()}
              </Typography>
            </Paper>
          </Box>
        ))}
        <Box ref={bottomRef} />
      </Box>

      {/* Input */}
      <Box sx={{ p: 1, display: "flex", gap: 1 }}>
        <TextField
          label="Ask for hints"
          fullWidth
          size="small"
          value={input}
          disabled={isDownloading}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <IconButton
          onClick={isStreaming ? handleStop : sendMessage}
          title={isStreaming ? "Stop" : "Send"}
          disabled={!isStreaming && !input.trim()}
        >
          {isStreaming ? (
            <StopCircleIcon sx={{ color: "error.main" }} />
          ) : (
            <SendIcon />
          )}
        </IconButton>
      </Box>
      <AppSnackbar
        open={!!snackbar}
        message={snackbar?.message ?? null}
        severity={snackbar?.severity}
        onClose={() => setSnackbar(null)}
      />
    </Box>
  );
};

export default ChatInterface;
