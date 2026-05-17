"use client";

const T = {
  bg: "#000000", panel: "#080808", border: "#1a1a1a",
  orange: "#ff6600", amber: "#ffaa00", dim: "#555555", white: "#e8e8e8",
};

export type ViewKey =
  | "overview" | "markets" | "macro" | "sectors"
  | "commodities" | "forex" | "risk" | "forecast"
  | "explorer" | "watchlist";

const ITEMS: { key: ViewKey; icon: string; label: string; shortcut: string }[] = [
  { key: "overview",    icon: "◉", label: "Overview",    shortcut: "1" },
  { key: "markets",     icon: "◆", label: "Markets",     shortcut: "2" },
  { key: "macro",       icon: "▣", label: "Macro",       shortcut: "3" },
  { key: "sectors",     icon: "◧", label: "Sectors",     shortcut: "4" },
  { key: "commodities", icon: "▲", label: "Commodities", shortcut: "5" },
  { key: "forex",       icon: "◎", label: "Forex",       shortcut: "6" },
  { key: "risk",        icon: "⬡", label: "Risk",        shortcut: "7" },
  { key: "forecast",    icon: "◈", label: "Forecast",    shortcut: "8" },
  { key: "explorer",    icon: "◇", label: "Explorer",    shortcut: "9" },
  { key: "watchlist",   icon: "★", label: "Watchlist",   shortcut: "0" },
];

interface Props {
  active: ViewKey;
  onChange: (key: ViewKey) => void;
  collapsed: boolean;
  onToggle: () => void;
}

export default function NavRail({ active, onChange, collapsed, onToggle }: Props) {
  return (
    <div style={{
      width: collapsed ? 38 : 120,
      background: T.panel,
      borderRight: `1px solid ${T.border}`,
      display: "flex",
      flexDirection: "column",
      flexShrink: 0,
      transition: "width 0.2s ease",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: collapsed ? "6px 4px" : "6px 8px",
        borderBottom: `1px solid ${T.orange}33`,
        display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "space-between",
        minHeight: 26,
      }}>
        {!collapsed && (
          <span style={{ color: T.orange, fontSize: 8, fontWeight: 700, letterSpacing: 1 }}>
            NAV
          </span>
        )}
        <button
          onClick={onToggle}
          style={{
            background: "transparent", border: `1px solid ${T.border}`, color: T.dim,
            cursor: "pointer", padding: "1px 4px", fontSize: 9, lineHeight: 1,
          }}
        >
          {collapsed ? "▸" : "◂"}
        </button>
      </div>

      {/* Items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "2px 0" }}>
        {ITEMS.map(item => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`nav-rail-item ${active === item.key ? "active" : ""}`}
            title={collapsed ? `${item.label} [${item.shortcut}]` : undefined}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: collapsed ? "7px 0" : "6px 8px",
              justifyContent: collapsed ? "center" : "flex-start",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: 10,
              color: active === item.key ? T.orange : T.dim,
              fontWeight: active === item.key ? 700 : 400,
              transition: "color 0.15s",
            }}
          >
            <span style={{
              fontSize: collapsed ? 13 : 11,
              width: collapsed ? "auto" : 14,
              textAlign: "center",
              flexShrink: 0,
            }}>
              {item.icon}
            </span>
            {!collapsed && (
              <>
                <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>
                  {item.label}
                </span>
                <span style={{ color: T.border, fontSize: 8 }}>{item.shortcut}</span>
              </>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div style={{
        padding: "4px 0",
        borderTop: `1px solid ${T.border}`,
        textAlign: "center",
      }}>
        <span style={{ color: T.border, fontSize: 7, letterSpacing: 1 }}>
          {collapsed ? "v2" : "GEO v2.0"}
        </span>
      </div>
    </div>
  );
}
