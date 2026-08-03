import React, { useState, useEffect, useRef } from "react";
import { MapPin, Navigation, ArrowLeftRight, Globe, Search } from "lucide-react";

export interface LocationItem {
  id: string;
  name: string;
  area: string;
  lat: number;
  lng: number;
}

interface LocationSelectorProps {
  locations: LocationItem[];
  pickup: LocationItem;
  drop: LocationItem;
  apiKey: string;
  onSelectPickup: (loc: LocationItem) => void;
  onSelectDrop: (loc: LocationItem) => void;
  onSwap: () => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  locations,
  pickup,
  drop,
  apiKey,
  onSelectPickup,
  onSelectDrop,
  onSwap,
}) => {
  const [pickupSearch, setPickupSearch] = useState("");
  const [dropSearch, setDropSearch] = useState("");
  const [showPickupMenu, setShowPickupMenu] = useState(false);
  const [showDropMenu, setShowDropMenu] = useState(false);

  const [pickupSuggestions, setPickupSuggestions] = useState<any[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<any[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDrop, setIsSearchingDrop] = useState(false);

  const pickupContainerRef = useRef<HTMLDivElement>(null);
  const dropContainerRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickupContainerRef.current && !pickupContainerRef.current.contains(e.target as Node)) {
        setShowPickupMenu(false);
      }
      if (dropContainerRef.current && !dropContainerRef.current.contains(e.target as Node)) {
        setShowDropMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search for pickup
  useEffect(() => {
    if (!pickupSearch || pickupSearch.trim().length === 0) {
      setPickupSuggestions(
        locations.map((l) => ({
          placeId: l.id,
          mainText: l.name,
          secondaryText: l.area,
          lat: l.lat,
          lng: l.lng,
        }))
      );
      return;
    }

    setIsSearchingPickup(true);
    const timer = setTimeout(() => {
      fetch(`/api/places/autocomplete?query=${encodeURIComponent(pickupSearch)}&apiKey=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
          setPickupSuggestions(data.suggestions || []);
          setIsSearchingPickup(false);
        })
        .catch(() => setIsSearchingPickup(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [pickupSearch, apiKey, locations]);

  // Debounced search for drop
  useEffect(() => {
    if (!dropSearch || dropSearch.trim().length === 0) {
      setDropSuggestions(
        locations.map((l) => ({
          placeId: l.id,
          mainText: l.name,
          secondaryText: l.area,
          lat: l.lat,
          lng: l.lng,
        }))
      );
      return;
    }

    setIsSearchingDrop(true);
    const timer = setTimeout(() => {
      fetch(`/api/places/autocomplete?query=${encodeURIComponent(dropSearch)}&apiKey=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
          setDropSuggestions(data.suggestions || []);
          setIsSearchingDrop(false);
        })
        .catch(() => setIsSearchingDrop(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [dropSearch, apiKey, locations]);

  const handleSelectSuggestion = (sug: any, isPickup: boolean) => {
    if (sug.lat && sug.lng) {
      const locItem: LocationItem = {
        id: sug.placeId,
        name: sug.mainText,
        area: sug.secondaryText || "Bengaluru",
        lat: sug.lat,
        lng: sug.lng,
      };
      if (isPickup) {
        onSelectPickup(locItem);
        setShowPickupMenu(false);
        setPickupSearch(sug.mainText);
      } else {
        onSelectDrop(locItem);
        setShowDropMenu(false);
        setDropSearch(sug.mainText);
      }
    } else {
      fetch(`/api/places/details?placeId=${sug.placeId}&apiKey=${apiKey}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.details) {
            const locItem: LocationItem = {
              id: data.details.placeId,
              name: data.details.name,
              area: data.details.formattedAddress,
              lat: data.details.lat,
              lng: data.details.lng,
            };
            if (isPickup) {
              onSelectPickup(locItem);
              setShowPickupMenu(false);
              setPickupSearch(data.details.name);
            } else {
              onSelectDrop(locItem);
              setShowDropMenu(false);
              setDropSearch(data.details.name);
            }
          }
        });
    }
  };

  return (
    <div className="glass-panel location-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "var(--font-heading)", fontSize: "1.25rem", fontWeight: 700 }}>
          Select Route
        </h2>
        <span style={{ fontSize: "0.8rem", color: apiKey ? "#4ADE80" : "#60A5FA", display: "flex", alignItems: "center", gap: "4px" }}>
          <Globe size={13} /> {apiKey ? "Google Maps Active" : "Live Search Enabled"}
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Pickup Input */}
        <div ref={pickupContainerRef} style={{ position: "relative" }}>
          <label style={{ fontSize: "0.8rem", color: "#60A5FA", fontWeight: 600, display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
            <Navigation size={14} /> PICKUP LOCATION (Type any College, Street, Colony)
          </label>
          <div className="location-input-group">
            <MapPin size={18} color="#60A5FA" />
            <input
              type="text"
              placeholder="e.g. PES University, Indiranagar 100ft Rd..."
              value={showPickupMenu ? pickupSearch : pickup.name}
              onChange={(e) => {
                setPickupSearch(e.target.value);
                setShowPickupMenu(true);
              }}
              onFocus={() => {
                setPickupSearch(pickup.name);
                setShowPickupMenu(true);
              }}
            />
          </div>

          {showPickupMenu && (
            <div className="location-dropdown">
              {isSearchingPickup && (
                <div style={{ padding: "12px", fontSize: "0.85rem", color: "#60A5FA" }}>
                  Searching live locations...
                </div>
              )}
              {!isSearchingPickup && pickupSuggestions.length === 0 && (
                <div style={{ padding: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No locations found.
                </div>
              )}
              {pickupSuggestions.map((sug, idx) => (
                <div
                  key={`${sug.placeId}-${idx}`}
                  className="dropdown-item"
                  onClick={() => handleSelectSuggestion(sug, true)}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#FFF" }}>{sug.mainText}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{sug.secondaryText}</div>
                  </div>
                  <Navigation size={14} color="#60A5FA" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Swap Button */}
        <div style={{ display: "flex", justifyContent: "center", margin: "-6px 0", zIndex: 10 }}>
          <button
            onClick={onSwap}
            title="Swap Pickup & Drop"
            style={{
              background: "#1F2937",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#FFF",
              padding: "8px 14px",
              borderRadius: "20px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "0.8rem",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)"
            }}
          >
            <ArrowLeftRight size={14} /> Swap Route
          </button>
        </div>

        {/* Drop Input */}
        <div ref={dropContainerRef} style={{ position: "relative" }}>
          <label style={{ fontSize: "0.8rem", color: "#F43F5E", fontWeight: 600, display: "flex", gap: "6px", alignItems: "center", marginBottom: "6px" }}>
            <MapPin size={14} /> DROP LOCATION (Type any College, Street, Colony)
          </label>
          <div className="location-input-group">
            <MapPin size={18} color="#F43F5E" />
            <input
              type="text"
              placeholder="e.g. Koramangala, PES University, Airport..."
              value={showDropMenu ? dropSearch : drop.name}
              onChange={(e) => {
                setDropSearch(e.target.value);
                setShowDropMenu(true);
              }}
              onFocus={() => {
                setDropSearch(drop.name);
                setShowDropMenu(true);
              }}
            />
          </div>

          {showDropMenu && (
            <div className="location-dropdown">
              {isSearchingDrop && (
                <div style={{ padding: "12px", fontSize: "0.85rem", color: "#F43F5E" }}>
                  Searching live locations...
                </div>
              )}
              {!isSearchingDrop && dropSuggestions.length === 0 && (
                <div style={{ padding: "12px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  No locations found.
                </div>
              )}
              {dropSuggestions.map((sug, idx) => (
                <div
                  key={`${sug.placeId}-${idx}`}
                  className="dropdown-item"
                  onClick={() => handleSelectSuggestion(sug, false)}
                >
                  <div>
                    <div style={{ fontWeight: 600, color: "#FFF" }}>{sug.mainText}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{sug.secondaryText}</div>
                  </div>
                  <Navigation size={14} color="#F43F5E" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Popular Presets Chips */}
      <div style={{ marginTop: "8px" }}>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
          POPULAR BENGALURU LOCATIONS & UNIVERSITIES:
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {locations.slice(0, 10).map((loc) => (
            <button
              key={loc.id}
              className="preset-chip"
              onClick={() => onSelectPickup(loc)}
            >
              {loc.name.split("(")[0].trim()}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
