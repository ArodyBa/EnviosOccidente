export const dataTableStylesDark = {
  table: {
    style: {
      backgroundColor: "transparent",
    },
  },
  header: {
    style: {
      backgroundColor: "transparent",
      color: "var(--eo-text)",
      minHeight: "0px",
      paddingLeft: "0px",
      paddingRight: "0px",
    },
  },
  headRow: {
    style: {
      backgroundColor: "rgba(255,255,255,0.03)",
      borderTopLeftRadius: 14,
      borderTopRightRadius: 14,
      border: "1px solid var(--eo-border)",
      borderBottom: "none",
    },
  },
  headCells: {
    style: {
      color: "var(--eo-muted)",
      fontWeight: 800,
      letterSpacing: 0.2,
      textTransform: "uppercase",
      fontSize: 12,
    },
  },
  rows: {
    style: {
      backgroundColor: "rgba(255,255,255,0.02)",
      color: "var(--eo-text)",
      borderLeft: "1px solid var(--eo-border)",
      borderRight: "1px solid var(--eo-border)",
      borderBottom: "1px solid var(--eo-border)",
    },
    highlightOnHoverStyle: {
      backgroundColor: "rgba(99, 102, 241, 0.10)",
      color: "var(--eo-text)",
      outline: "none",
    },
  },
  cells: {
    style: {
      color: "var(--eo-text)",
    },
  },
  pagination: {
    style: {
      backgroundColor: "rgba(255,255,255,0.02)",
      color: "var(--eo-muted)",
      borderLeft: "1px solid var(--eo-border)",
      borderRight: "1px solid var(--eo-border)",
      borderBottom: "1px solid var(--eo-border)",
      borderBottomLeftRadius: 14,
      borderBottomRightRadius: 14,
    },
    pageButtonsStyle: {
      fill: "var(--eo-muted)",
      "&:hover": { fill: "var(--eo-text)" },
    },
  },
};

