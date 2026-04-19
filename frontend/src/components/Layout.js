import React, { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Divider,
  Drawer,
  IconButton,
  InputBase,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import SearchIcon from "@mui/icons-material/Search";
import { useLocation } from "react-router-dom";
import { drawerWidth, MenuContent } from "./Menu";
import MobileBottomNav from "./MobileBottomNav";

export default function Layout({ children }) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [moreOpen, setMoreOpen] = useState(false);
  const location = useLocation();

  const closeMore = () => setMoreOpen(false);

  useEffect(() => {
    // Evita quedar en un scroll “raro” al cambiar de módulo (suele notarse en móvil)
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  const drawerInner = useMemo(
    () => (
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Toolbar sx={{ px: 2.25 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 34,
                height: 34,
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, var(--eo-primary), var(--eo-primary2))",
              }}
            />
            <Box>
              <Typography fontWeight={900} lineHeight={1.1}>
                Envios Occidente
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administración
              </Typography>
            </Box>
          </Box>
        </Toolbar>
        <Divider sx={{ mx: 2, my: 1 }} />
        <Box sx={{ flex: 1, overflow: "auto" }}>
          <MenuContent />
        </Box>
      </Box>
    ),
    []
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <AppBar position="fixed" color="default" elevation={0}>
        <Toolbar sx={{ gap: 1.5 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              letterSpacing: -0.2,
              display: { xs: "none", sm: "block" },
            }}
          >
            Panel
          </Typography>

          <Box sx={{ flex: 1 }} />

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flex: { xs: 1, sm: "unset" },
              width: { xs: "auto", sm: 420 },
              maxWidth: "100%",
              px: 1.25,
              py: 0.6,
              borderRadius: 12,
              border: "1px solid var(--eo-border)",
              backgroundColor: alpha("#FFFFFF", 0.03),
            }}
          >
            <SearchIcon sx={{ color: "text.secondary" }} fontSize="small" />
            <InputBase
              placeholder="Buscar…"
              sx={{
                color: "text.primary",
                width: "100%",
                fontSize: 14,
                "& input::placeholder": { color: "text.secondary", opacity: 1 },
              }}
            />
          </Box>

          <Box sx={{ flex: 1, display: { xs: "none", sm: "block" } }} />

          <Tooltip title="Notificaciones">
            <IconButton sx={{ display: { xs: "none", sm: "inline-flex" } }}>
              <Badge badgeContent={2} color="error">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          <Tooltip title="Perfil">
            <IconButton sx={{ p: 0.5 }}>
              <Avatar
                sx={{
                  width: 34,
                  height: 34,
                  bgcolor: alpha(theme.palette.primary.main, 0.25),
                  border: "1px solid var(--eo-border)",
                }}
              >
                EO
              </Avatar>
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: drawerWidth },
          flexShrink: { md: 0 },
        }}
        aria-label="navegación"
      >
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": { width: drawerWidth, boxSizing: "border-box" },
          }}
        >
          {drawerInner}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 },
          pb: { xs: 12, sm: 3 },
        }}
      >
        <Toolbar />
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>{children}</Box>
      </Box>

      {!mdUp && (
        <>
          <MobileBottomNav onOpenMore={() => setMoreOpen(true)} />
          <Drawer
            anchor="bottom"
            open={moreOpen}
            onClose={closeMore}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                borderTopLeftRadius: 22,
                borderTopRightRadius: 22,
                maxHeight: "86vh",
              },
            }}
          >
            <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 2,
                }}
              >
                <Typography fontWeight={900}>Menú</Typography>
                <IconButton onClick={closeMore} aria-label="cerrar">
                  <CloseRoundedIcon />
                </IconButton>
              </Box>
            </Box>
            <Divider sx={{ mx: 2 }} />
            <Box sx={{ overflow: "auto", pb: 2 }}>
              <MenuContent onNavigate={closeMore} />
            </Box>
          </Drawer>
        </>
      )}
    </Box>
  );
}
