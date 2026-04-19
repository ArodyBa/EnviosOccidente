import React, { useMemo } from "react";
import {
  BottomNavigation,
  BottomNavigationAction,
  Portal,
  Paper,
} from "@mui/material";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { resolveIcon } from "./Menu";

const pickFirstMatch = (menus, predicates) =>
  menus.find((m) => predicates.some((p) => p(m)));

export default function MobileBottomNav({ onOpenMore }) {
  const { menus = [] } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const quickItems = useMemo(() => {
    const safeMenus = Array.isArray(menus) ? menus : [];
    const sorted = [...safeMenus].sort(
      (a, b) =>
        (a?.orden ?? 0) - (b?.orden ?? 0) ||
        String(a?.nombre ?? "").localeCompare(String(b?.nombre ?? ""))
    );

    const byPath = (needle) => (m) =>
      String(m?.ruta ?? "").toLowerCase().includes(needle);

    const envios =
      pickFirstMatch(sorted, [byPath("/envios"), byPath("envio")]) || null;
    const clientes = pickFirstMatch(sorted, [byPath("/clientes")]) || null;
    const reportes =
      pickFirstMatch(sorted, [byPath("/reportes"), byPath("reporte")]) || null;

    const picked = [envios, clientes, reportes].filter(Boolean);
    const unique = [];
    const seen = new Set();
    for (const m of picked) {
      if (!m?.ruta || seen.has(m.ruta)) continue;
      unique.push(m);
      seen.add(m.ruta);
    }

    return unique.slice(0, 3);
  }, [menus]);

  const currentValue = useMemo(() => {
    const path = location.pathname;
    if (path === "/dashboard") return "/dashboard";
    const match = quickItems.find((m) => m.ruta === path);
    return match?.ruta || "";
  }, [location.pathname, quickItems]);

  return (
    <Portal>
      <Paper
        elevation={0}
        sx={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          overflow: "hidden",
          borderTop: "1px solid var(--eo-border)",
          backdropFilter: "blur(12px)",
          backgroundColor: "rgba(15, 23, 42, 0.86)",
          pb: "env(safe-area-inset-bottom)",
          zIndex: (theme) => theme.zIndex.modal + 1,
        }}
      >
        <BottomNavigation
          showLabels
          value={currentValue}
          onChange={(_, value) => {
            if (value === "__more__") return onOpenMore?.();
            if (!value) return;
            navigate(value);
          }}
          sx={{
            backgroundColor: "transparent",
            px: 1,
            "& .MuiBottomNavigationAction-root": { py: 1.2, minWidth: 64 },
            "& .MuiBottomNavigationAction-label": { fontWeight: 800 },
            "& .Mui-selected": { color: "primary.main" },
          }}
        >
          <BottomNavigationAction
            label="Panel"
            value="/dashboard"
            icon={<DashboardRoundedIcon />}
          />
          {quickItems.map((m) => {
            const Icon = resolveIcon(m.icono);
            return (
              <BottomNavigationAction
                key={m.id ?? m.ruta}
                label={String(m.nombre ?? "").slice(0, 12) || "Opción"}
                value={m.ruta}
                icon={<Icon />}
              />
            );
          })}
          <BottomNavigationAction
            label="Menú"
            value="__more__"
            icon={<MenuRoundedIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Portal>
  );
}
