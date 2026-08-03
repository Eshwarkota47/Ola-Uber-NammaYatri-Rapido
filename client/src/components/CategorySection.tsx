import React from "react";
import { FareCard, FareItem } from "./FareCard";
import { Sparkles } from "lucide-react";

interface CategoryComparison {
  category: string;
  categoryName: string;
  icon: string;
  nammaYatri: FareItem[];
  uber: FareItem[];
  ola?: FareItem[];
  rapido?: FareItem[];
  cheapest: FareItem | null;
  savingsWinner: "Namma Yatri" | "Uber" | "Ola" | "Rapido" | "Equal";
  savings: number;
}

interface CategorySectionProps {
  data: CategoryComparison;
  onOpenBreakdown: (item: FareItem) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  data,
  onOpenBreakdown,
}) => {
  const allCards = [
    ...(data.nammaYatri || []),
    ...(data.uber || []),
    ...(data.ola || []),
    ...(data.rapido || []),
  ];
  if (allCards.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Category Title & Savings Summary */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "1.5rem" }}>{data.icon}</span>
          <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700, color: "#FFF" }}>
            {data.categoryName}
          </h2>
          <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.06)", padding: "2px 8px", borderRadius: "12px" }}>
            {allCards.length} options
          </span>
        </div>

        {data.savings > 0 && data.savingsWinner !== "Equal" && (
          <div className="savings-banner" style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.85rem" }}>
            <Sparkles size={15} style={{ marginRight: "4px" }} />
            Save <strong style={{ color: "#FFF", margin: "0 4px" }}>₹{data.savings}</strong> with {data.savingsWinner}!
          </div>
        )}
      </div>

      {/* Grid of Fare Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "14px",
        }}
      >
        {allCards.map((item, index) => {
          const isCheapest =
            data.cheapest != null &&
            (item.estimatedFare === data.cheapest.estimatedFare ||
              item.label === data.cheapest.label ||
              item.tierLabel === data.cheapest.tierLabel);

          return (
            <FareCard
              key={`${item.provider}-${item.vehicleType || item.tier || index}`}
              item={item}
              isCheapest={isCheapest}
              onOpenBreakdown={onOpenBreakdown}
            />
          );
        })}
      </div>
    </div>
  );
};
