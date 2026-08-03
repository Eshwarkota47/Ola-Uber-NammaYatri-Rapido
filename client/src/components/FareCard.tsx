import React from "react";
import { Clock, User, Info, CheckCircle2, Moon, Zap } from "lucide-react";

export interface FareItem {
  provider: "Namma Yatri" | "Uber" | "Ola" | "Rapido";
  vehicleType?: string;
  tier?: string;
  label: string;
  tierLabel?: string;
  tierDescription?: string;
  category: "bike" | "auto" | "hatchback" | "sedan" | "suv";
  capacity: number;
  estimatedFare: number;
  fareMin?: number;
  fareMax?: number;
  isNightFare?: boolean;
  surgeMultiplier?: number;
  etaMinutes: number;
  breakdown: any;
}

interface FareCardProps {
  item: FareItem;
  isCheapest: boolean;
  onOpenBreakdown: (item: FareItem) => void;
}

export const FareCard: React.FC<FareCardProps> = ({
  item,
  isCheapest,
  onOpenBreakdown,
}) => {
  const isNY = item.provider === "Namma Yatri";
  const isUber = item.provider === "Uber";
  const isOla = item.provider === "Ola";
  const isRapido = item.provider === "Rapido";

  const getBadgeColor = () => {
    if (isNY) return "#FBBF24";
    if (isUber) return "#38BDF8";
    if (isRapido) return "#FB923C";
    return "#34D399";
  };

  const getBadgeBg = () => {
    if (isNY) return "rgba(245, 158, 11, 0.2)";
    if (isUber) return "rgba(56, 189, 248, 0.2)";
    if (isRapido) return "rgba(251, 146, 60, 0.2)";
    return "rgba(16, 185, 129, 0.2)";
  };

  const getBadgeBorder = () => {
    if (isNY) return "1px solid rgba(245, 158, 11, 0.4)";
    if (isUber) return "1px solid rgba(56, 189, 248, 0.4)";
    if (isRapido) return "1px solid rgba(251, 146, 60, 0.4)";
    return "1px solid rgba(16, 185, 129, 0.4)";
  };

  const getCardClass = () => {
    if (isNY) return "namma-yatri";
    if (isUber) return "uber";
    if (isRapido) return "rapido";
    return "ola";
  };

  return (
    <div
      className={`provider-card ${getCardClass()} ${
        isCheapest ? "cheapest-glow" : ""
      }`}
    >
      {/* Header Badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "6px",
              background: getBadgeBg(),
              color: getBadgeColor(),
              border: getBadgeBorder(),
              letterSpacing: "0.03em"
            }}
          >
            {item.provider}
          </span>
          {isCheapest && (
            <span className="cheapest-badge">
              <CheckCircle2 size={12} /> Lowest Fare
            </span>
          )}
        </div>

        <button
          onClick={() => onOpenBreakdown(item)}
          title="View Fare Breakdown"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer",
            padding: "4px",
          }}
        >
          <Info size={16} />
        </button>
      </div>

      {/* Vehicle Info */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#FFF" }}>
            {item.label || item.tierLabel}
          </h3>
          <div style={{ textAlign: "right" }}>
            {item.fareMin && item.fareMax ? (
              <div style={{ fontSize: "1.25rem", fontWeight: 800, color: getBadgeColor() }}>
                ₹{item.fareMin} - ₹{item.fareMax}
              </div>
            ) : (
              <div style={{ fontSize: "1.35rem", fontWeight: 800, color: getBadgeColor() }}>
                ₹{item.estimatedFare}
              </div>
            )}
          </div>
        </div>

        {item.tierDescription && (
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "2px" }}>
            {item.tierDescription}
          </p>
        )}
      </div>

      {/* Footer Info: ETA, Capacity, Surcharge indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: "8px",
          borderTop: "1px solid rgba(255, 255, 255, 0.06)",
          fontSize: "0.8rem",
          color: "var(--text-secondary)",
        }}
      >
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={13} color="#9CA3AF" /> {item.etaMinutes} min away
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <User size={13} color="#9CA3AF" /> {item.capacity}
          </span>
        </div>

        <div>
          {item.isNightFare && (
            <span
              style={{
                fontSize: "0.7rem",
                background: "rgba(168, 85, 247, 0.2)",
                color: "#C084FC",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Moon size={10} /> Night 1.25-1.5x
            </span>
          )}
          {item.surgeMultiplier && item.surgeMultiplier > 1.0 && (
            <span
              style={{
                fontSize: "0.7rem",
                background: "rgba(239, 68, 68, 0.2)",
                color: "#F87171",
                padding: "2px 6px",
                borderRadius: "4px",
                display: "inline-flex",
                alignItems: "center",
                gap: "3px",
              }}
            >
              <Zap size={10} /> {item.surgeMultiplier}x Surge
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
