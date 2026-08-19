import React from "react";
import { X, Receipt, AlertCircle } from "lucide-react";
import { FareItem } from "./FareCard";

interface FareBreakdownModalProps {
  item: FareItem | null;
  onClose: () => void;
}

export const FareBreakdownModal: React.FC<FareBreakdownModalProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const isNY = item.provider === "Namma Yatri";
  const isUber = item.provider === "Uber";
  const isOla = item.provider === "Ola";
  const isRapido = item.provider === "Rapido";
  const b = item.breakdown || {};

  const getThemeColor = () => {
    if (isNY) return "#FBBF24";
    if (isUber) return "#38BDF8";
    if (isRapido) return "#FB923C";
    return "#34D399";
  };

  const getThemeBg = () => {
    if (isNY) return "rgba(245, 158, 11, 0.1)";
    if (isUber) return "rgba(56, 189, 248, 0.1)";
    if (isRapido) return "rgba(251, 146, 60, 0.1)";
    return "rgba(16, 185, 129, 0.1)";
  };

  const getThemeBorder = () => {
    if (isNY) return "1px solid rgba(245, 158, 11, 0.3)";
    if (isUber) return "1px solid rgba(56, 189, 248, 0.3)";
    if (isRapido) return "1px solid rgba(251, 146, 60, 0.3)";
    return "1px solid rgba(16, 185, 129, 0.3)";
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Receipt size={22} color={getThemeColor()} />
            <div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontSize: "1.2rem", fontWeight: 700, color: "#FFF" }}>
                {item.label || item.tierLabel}
              </h3>
              <span style={{ fontSize: "0.8rem", color: getThemeColor(), fontWeight: 600 }}>
                {item.provider} Rate Breakdown
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Total Price Banner */}
        <div
          style={{
            background: getThemeBg(),
            border: getThemeBorder(),
            borderRadius: "12px",
            padding: "16px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Estimated Total
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color: "#FFF", margin: "4px 0" }}>
            {item.fareMin && item.fareMax ? `₹${item.fareMin} - ₹${item.fareMax}` : `₹${item.estimatedFare}`}
          </div>
          {isNY && (
            <div style={{ fontSize: "0.8rem", color: "#FBBF24", fontWeight: 600 }}>
              Official Rate-Card Calibrated
            </div>
          )}
          {isOla && (
            <div style={{ fontSize: "0.8rem", color: "#34D399", fontWeight: 600 }}>
              Ola Fare Model (Taxes Included)
            </div>
          )}
          {isRapido && (
            <div style={{ fontSize: "0.8rem", color: "#FB923C", fontWeight: 600 }}>
              Rapido Fare Engine (Base + Per-km + Per-min)
            </div>
          )}
        </div>

        {/* Itemized Table */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "0.9rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span>Base Fare</span>
            <strong style={{ color: "#FFF" }}>₹{b.baseFare ?? 0}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span>Distance Slab Charges</span>
            <strong style={{ color: "#FFF" }}>₹{b.distanceFare ?? 0}</strong>
          </div>

          {b.pickupCharge != null && b.pickupCharge > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Pickup Charges</span>
              <strong style={{ color: "#FFF" }}>₹{b.pickupCharge}</strong>
            </div>
          )}

          {b.driverAdditions != null && b.driverAdditions > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Driver Additions</span>
              <strong style={{ color: "#FFF" }}>₹{b.driverAdditions}</strong>
            </div>
          )}

          {b.priorityTip != null && b.priorityTip > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#FBBF24" }}>
              <span>Priority Faster Pickup Tip</span>
              <strong>+₹{b.priorityTip}</strong>
            </div>
          )}

          {b.congestionCharge != null && b.congestionCharge > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#FBBF24" }}>
              <span>Congestion Charge ({b.congestionPercentage ?? 10}%)</span>
              <strong>+₹{b.congestionCharge}</strong>
            </div>
          )}

          {b.timeFare != null && b.timeFare > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Time Fare</span>
              <strong style={{ color: "#FFF" }}>₹{b.timeFare}</strong>
            </div>
          )}

          {b.taxes != null && b.taxes > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>GST / Taxes (5%)</span>
              <strong style={{ color: "#FFF" }}>₹{b.taxes}</strong>
            </div>
          )}

          {b.nightSurcharge != null && b.nightSurcharge > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#C084FC" }}>
              <span>Night Surcharge</span>
              <strong>+₹{b.nightSurcharge}</strong>
            </div>
          )}

          {b.bookingFee != null && b.bookingFee > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
              <span>Booking Fee</span>
              <strong style={{ color: "#FFF" }}>₹{b.bookingFee}</strong>
            </div>
          )}

          {b.surgeAmount != null && b.surgeAmount > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", color: "#F87171" }}>
              <span>Surge Charge ({item.surgeMultiplier}x)</span>
              <strong>+₹{b.surgeAmount}</strong>
            </div>
          )}
        </div>

        {/* Engine Note */}
        <div
          style={{
            marginTop: "20px",
            padding: "12px",
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            display: "flex",
            gap: "8px",
            alignItems: "flex-start",
          }}
        >
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: "2px" }} />
          <div>
            {isNY
              ? "Calculated using official Namma Yatri rate card: ₹36 min fare (2km) + ₹18/km + ₹10 Driver Additions + optional ₹30 Tip."
              : isOla
              ? "Calculated using Ola India pricing engine: Base fare + per-km distance rate + 5% GST taxes."
              : isRapido
              ? "Calculated using Rapido India fare engine: Base fare + per-km distance charge + per-minute time charge + surge multiplier."
              : "Uber pricing includes booking fees and dynamic surge based on peak time demand."}
          </div>
        </div>
      </div>
    </div>
  );
};
