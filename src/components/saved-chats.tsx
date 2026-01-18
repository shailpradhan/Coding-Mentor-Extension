import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme, themedScrollbar } from "../theme/theme";

type SavedChat = {
  id: string;
  title: string;
  summary: string;
  createdAt: number;
};

function isExtensionContext(): boolean {
  return (
    typeof chrome !== "undefined" &&
    !!chrome.runtime?.id &&
    !!chrome.storage?.local
  );
}

const SavedChats = () => {
  const [savedChats, setSavedChats] = useState<SavedChat[]>([]);
  const [selectedChat, setSelectedChat] = useState<SavedChat | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isExtension = isExtensionContext();

  useEffect(() => {
    if (!isExtension) return;

    chrome.storage.local.get({ savedSummaries: [] }, (result) => {
      if (Array.isArray(result.savedSummaries)) {
        setSavedChats(
          [...result.savedSummaries].sort((a, b) => b.createdAt - a.createdAt),
        );
      }
    });
  }, [isExtension]);

  const handleOpenChat = (chat: SavedChat) => {
    setSelectedChat(chat);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedChat(null);
  };

  const handleDeleteChat = (id: string) => {
    const updated = savedChats.filter((chat) => chat.id !== id);
    setSavedChats(updated);

    chrome.storage.local.set({
      savedSummaries: updated,
    });
  };

  if (!isExtension) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Saved chats are available only inside the extension.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box sx={{ px: 2, py: 1, borderBottom: "1px solid #ddd" }}>
        <Typography variant="body2" fontWeight={600}>
          Saved Chats
        </Typography>
      </Box>

      {/* List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
        {savedChats.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ px: 1, py: 2 }}
          >
            No saved chats yet.
          </Typography>
        ) : (
          savedChats.map((chat) => (
            <Paper
              key={chat.id}
              elevation={1}
              sx={{
                p: 1.2,
                mb: 1,
                display: "flex",
                alignItems: "flex-start",
                gap: 1,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
              onClick={() => handleOpenChat(chat)}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  noWrap
                  title={chat.title}
                >
                  {chat.title}
                </Typography>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {chat.summary}
                </Typography>
              </Box>

              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation(); // prevent dialog open
                  handleDeleteChat(chat.id);
                }}
                title="Delete chat"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Paper>
          ))
        )}
      </Box>

      {/* Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedChat?.title}
          <Typography variant="caption" color="text.secondary" display="block">
            {selectedChat && new Date(selectedChat.createdAt).toLocaleString()}
          </Typography>
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            maxHeight: 360,
            whiteSpace: "pre-wrap",
            ...themedScrollbar(theme),
          }}
        >
          <Typography variant="body2">{selectedChat?.summary}</Typography>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SavedChats;
