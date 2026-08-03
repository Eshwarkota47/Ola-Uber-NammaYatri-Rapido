import React from "react";
import { Moon, Zap, Sliders } from "lucide-react";

interface SimControlsProps {
  forceNight: boolean;
  onToggleNight: (val: boolean) => void;
  surge: number;
  onChangeSurge: (val: number) => void;
}

export const SimControls: React.FC<SimControlsProps> = ({
  forceNight,
  onToggleNight,
  surge,
  onChangeSurge,
}) => {
  return (
    <div className="glass-panel" style={{ padding: "16px 20px", display: "flex", gap: "20px", alignItems: "center", flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 700, fontSize: "0.9rem", color: "#C084FC" }}>
        <Sliders size={18} /> Simulation Controls:
      </div>

      {/* Night Surcharge Switch */}
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          background: forceNight ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.05)",
          border: forceNight ? "1px solid rgba(168, 85, 247, 0.5)" : "1px solid rgba(255, 255, 255, 0.1)",
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "0.85rem",
          fontWeight: 600,
          color: forceNight ? "#C084FC" : "var(--text-secondary)",
          transition: "all 0.2s ease",
        }}
      >
        <input
          type="checkbox"
          checked={forceNight}
          onChange={(e) => onToggleNight(e.target.checked)}
          style={{ display: "none" }}
        />
        <Moon size={14} /> Force Night Time (10 PM - 5 AM IST)
      </label>

      {/* Surge Multiplier Slider */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.85rem" }}>
        <span style={{ color: surge > 1.0 ? "#F87171" : "var(--text-secondary)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
          <Zap size={14} /> Uber Surge: {surge.toFixed(1)}x
        </span>
        <input
          type="range"
          min="1.0"
          max="2.5"
          step="0.1"
          value={surge}
          onChange={(e) => onChangeSurge(parseFloat(e.target.value))}
          style={{ width: "120px", accentColor: "#EF4444" }}
        />
      </div>
    </div>
  );
};
