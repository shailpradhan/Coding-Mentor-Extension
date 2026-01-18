import { Snackbar, Alert } from "@mui/material";

export type SnackbarSeverity =
  | "success"
  | "error"
  | "info"
  | "warning";

interface AppSnackbarProps {
  open: boolean;
  message: string | null;
  severity?: SnackbarSeverity;
  onClose: () => void;
  autoHideDuration?: number;
}

export default function AppSnackbar({
  open,
  message,
  severity = "info",
  onClose,
  autoHideDuration = 3000,
}: AppSnackbarProps) {
  if (!message) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
