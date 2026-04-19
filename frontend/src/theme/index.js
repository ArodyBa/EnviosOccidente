import { alpha, createTheme } from "@mui/material/styles";

const tokens = {
  bg: "#0B1020",
  sidebar: "#0F172A",
  surface: "#111827",
  surface2: "#0F172A",
  border: "rgba(148, 163, 184, 0.16)",
  text: "#E5E7EB",
  muted: "#94A3B8",
  primary: "#6366F1",
  primary2: "#7C3AED",
  info: "#38BDF8",
  success: "#22C55E",
  warning: "#F59E0B",
  error: "#EF4444",
};

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: tokens.primary },
    secondary: { main: tokens.primary2 },
    info: { main: tokens.info },
    success: { main: tokens.success },
    warning: { main: tokens.warning },
    error: { main: tokens.error },
    background: {
      default: tokens.bg,
      paper: tokens.surface,
    },
    text: {
      primary: tokens.text,
      secondary: tokens.muted,
    },
    divider: tokens.border,
  },
  shape: { borderRadius: 14 },
  typography: {
    fontFamily: [
      "Inter",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    h4: { fontWeight: 800, letterSpacing: -0.3 },
    h5: { fontWeight: 800, letterSpacing: -0.2 },
    h6: { fontWeight: 750, letterSpacing: -0.1 },
    button: { textTransform: "none", fontWeight: 700 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ":root": {
          "--eo-bg": tokens.bg,
          "--eo-sidebar": tokens.sidebar,
          "--eo-surface": tokens.surface,
          "--eo-surface2": tokens.surface2,
          "--eo-border": tokens.border,
          "--eo-text": tokens.text,
          "--eo-muted": tokens.muted,
          "--eo-primary": tokens.primary,
          "--eo-primary2": tokens.primary2,
          "--eo-info": tokens.info,
          "--eo-success": tokens.success,
          "--eo-warning": tokens.warning,
          "--eo-error": tokens.error,
        },
        "html, body, #root": { height: "100%" },
        body: {
          background: `radial-gradient(1000px 600px at 20% 0%, ${alpha(
            tokens.primary,
            0.22
          )} 0%, rgba(0,0,0,0) 60%), radial-gradient(900px 500px at 80% 20%, ${alpha(
            tokens.info,
            0.18
          )} 0%, rgba(0,0,0,0) 62%), ${tokens.bg}`,
          color: tokens.text,
        },
        a: { color: tokens.info },
        "*": { boxSizing: "border-box" },
        "::-webkit-scrollbar": { width: 10, height: 10 },
        "::-webkit-scrollbar-thumb": {
          background: alpha(tokens.muted, 0.22),
          borderRadius: 10,
        },
        "::-webkit-scrollbar-thumb:hover": {
          background: alpha(tokens.muted, 0.3),
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${tokens.border}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          border: `1px solid ${tokens.border}`,
          backgroundImage: `linear-gradient(180deg, ${alpha(
            tokens.text,
            0.03
          )} 0%, rgba(0,0,0,0) 100%)`,
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          backgroundColor: alpha(tokens.sidebar, 0.86),
          borderBottom: `1px solid ${tokens.border}`,
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: "none",
          backgroundColor: alpha(tokens.sidebar, 0.92),
          borderRight: `1px solid ${tokens.border}`,
          backdropFilter: "blur(10px)",
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 12 },
        containedPrimary: {
          backgroundImage: `linear-gradient(135deg, ${tokens.primary} 0%, ${tokens.primary2} 100%)`,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: "small" },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: alpha(tokens.text, 0.03),
        },
        notchedOutline: { borderColor: tokens.border },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: "4px 10px",
          paddingTop: 10,
          paddingBottom: 10,
          "&.Mui-selected, &.Mui-selected:hover": {
            backgroundColor: alpha(tokens.primary, 0.16),
          },
          "&:hover": {
            backgroundColor: alpha(tokens.text, 0.05),
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${tokens.border}`,
          backgroundImage: "none",
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: alpha(tokens.surface, 0.96),
          border: `1px solid ${tokens.border}`,
        },
      },
    },
  },
});

export default theme;



