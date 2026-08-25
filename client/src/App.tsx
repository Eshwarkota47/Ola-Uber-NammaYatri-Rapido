import React, { useState, useEffect } from "react";
import { LocationSelector, LocationItem } from "./components/LocationSelector";
import { CategorySection } from "./components/CategorySection";
import { FareBreakdownModal } from "./components/FareBreakdownModal";
import { SimControls } from "./components/SimControls";
import { FareItem } from "./components/FareCard";
import { Route, Sparkles, RefreshCw, Key, Check, AlertCircle } from "lucide-react";

export function App() {
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [pickup, setPickup] = useState<LocationItem | null>(null);
  const [drop, setDrop] = useState<LocationItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Store Google Maps API key in localStorage
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("GOOGLE_MAPS_API_KEY") || "");
  const [showKeyInput, setShowKeyInput] = useState<boolean>(!apiKey);
  const [forceNight, setForceNight] = useState<boolean>(false);
  const [surge, setSurge] = useState<number>(1.0);

  const [compareData, setCompareData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItemForModal, setSelectedItemForModal] = useState<FareItem | null>(null);

  const [map, setMap] = useState<any>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<any>(null);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem("GOOGLE_MAPS_API_KEY", key);
  };

  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#cbd5e1" }],
    },
    {
      featureType: "poi",
      elementType: "labels.text.fill",
      stylers: [{ color: "#cbd5e1" }],
    },
    {
      featureType: "poi.park",
      elementType: "geometry",
      stylers: [{ color: "#0f172a" }],
    },
    {
      featureType: "poi.park",
      elementType: "labels.text.fill",
      stylers: [{ color: "#475569" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#334155" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1e293b" }],
    },
    {
      featureType: "road",
      elementType: "labels.text.fill",
      stylers: [{ color: "#64748b" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry",
      stylers: [{ color: "#475569" }],
    },
    {
      featureType: "road.highway",
      elementType: "geometry.stroke",
      stylers: [{ color: "#1e293b" }],
    },
    {
      featureType: "road.highway",
      elementType: "labels.text.fill",
      stylers: [{ color: "#94a3b8" }],
    },
    {
      featureType: "transit",
      elementType: "geometry",
      stylers: [{ color: "#1e293b" }],
    },
    {
      featureType: "transit.station",
      elementType: "labels.text.fill",
      stylers: [{ color: "#cbd5e1" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#0f172a" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.fill",
      stylers: [{ color: "#475569" }],
    },
    {
      featureType: "water",
      elementType: "labels.text.stroke",
      stylers: [{ color: "#0f172a" }],
    },
  ];

  const initMap = () => {
    const mapElement = document.getElementById("route-map");
    if (!mapElement || !(window as any).google) return;

    const newMap = new (window as any).google.maps.Map(mapElement, {
      center: { lat: 12.9716, lng: 77.5946 }, // Bengaluru center
      zoom: 12,
      styles: darkMapStyle,
      disableDefaultUI: true,
      zoomControl: true,
    });

    const newRenderer = new (window as any).google.maps.DirectionsRenderer({
      map: newMap,
      suppressMarkers: false,
    });

    setMap(newMap);
    setDirectionsRenderer(newRenderer);
  };

  // Load Google Maps JS Script dynamically if apiKey is available
  useEffect(() => {
    if (!apiKey || apiKey.trim().length <= 5) return;

    // Check if script is already loaded
    if ((window as any).google) {
      setTimeout(initMap, 500);
      return;
    }

    const existingScript = document.getElementById("google-maps-js");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-maps-js";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setTimeout(initMap, 500);
      };
      document.head.appendChild(script);
    }
  }, [apiKey]);

  // Re-trigger initMap when map container is mounted
  useEffect(() => {
    if (apiKey && (window as any).google && !map) {
      setTimeout(initMap, 500);
    }
  }, [apiKey, map, compareData]);

  // Update Route on the map when pickup, drop, or map changes
  useEffect(() => {
    if (!map || !directionsRenderer || !pickup || !drop || !(window as any).google) return;

    const directionsService = new (window as any).google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new (window as any).google.maps.LatLng(pickup.lat, pickup.lng),
        destination: new (window as any).google.maps.LatLng(drop.lat, drop.lng),
        travelMode: (window as any).google.maps.TravelMode.DRIVING,
      },
      (result: any, status: string) => {
        if (status === (window as any).google.maps.DirectionsStatus.OK) {
          directionsRenderer.setDirections(result);
        } else {
          console.error("Directions request failed due to " + status);
        }
      }
    );
  }, [pickup, drop, map, directionsRenderer]);

  // Fetch initial locations list
  useEffect(() => {
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => {
        if (data.locations && data.locations.length > 1) {
          setLocations(data.locations);
          setPickup(data.locations[0]); // PES University
          setDrop(data.locations[4]);   // Koramangala
        }
      })
      .catch((err) => console.error("Error fetching locations:", err));
  }, []);

  // Fetch comparison data when pickup, drop, forceNight, surge, or apiKey changes
  const fetchComparison = () => {
    if (!pickup || !drop) return;
    setLoading(true);

    const url = `/api/compare?pickupLat=${pickup.lat}&pickupLng=${pickup.lng}&dropLat=${drop.lat}&dropLng=${drop.lng}&forceNight=${forceNight}&surge=${surge}&apiKey=${encodeURIComponent(apiKey)}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setCompareData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching comparison:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchComparison();
  }, [pickup, drop, forceNight, surge, apiKey]);

  const handleSwap = () => {
    if (pickup && drop) {
      const temp = pickup;
      setPickup(drop);
      setDrop(temp);
    }
  };

  const displayedCategories = compareData?.categoryComparisons
    ? compareData.categoryComparisons.filter(
        (cat: any) => selectedCategory === "all" || cat.category === selectedCategory
      )
    : [];

  const totalSavings = compareData?.categoryComparisons
    ? compareData.categoryComparisons.reduce((acc: number, curr: any) => acc + (curr.savings || 0), 0)
    : 0;

  const isGoogleMapsActive = compareData?.route?.source === "google_maps" || apiKey.trim().length > 5;

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px 16px 60px" }}>
      {/* Top Navigation / Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div className="header-badge">
            <Sparkles size={13} /> Namma Yatri • Uber • Ola • Rapido
          </div>
          <h1 className="main-title" style={{ marginTop: "6px" }}>
            FarePulse <span style={{ fontSize: "1.5rem", color: "#6366F1" }}>4-Way Comparison</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            Compare live fares across Namma Yatri, Uber, Ola, and Rapido in Bengaluru
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Google Maps API Key Input */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              style={{
                background: isGoogleMapsActive ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.2)",
                border: isGoogleMapsActive ? "1px solid rgba(34, 197, 94, 0.5)" : "1px solid rgba(245, 158, 11, 0.5)",
                color: isGoogleMapsActive ? "#4ADE80" : "#FBBF24",
                padding: "10px 16px",
                borderRadius: "12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              <Key size={15} /> {isGoogleMapsActive ? "Google Maps Connected" : "Add Google Maps API Key"}
            </button>

            {showKeyInput && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "8px",
                  background: "#121826",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  borderRadius: "14px",
                  padding: "18px",
                  zIndex: 100,
                  width: "340px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.9)",
                }}
              >
                <label style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600, display: "block", marginBottom: "6px" }}>
                  ENTER YOUR GOOGLE MAPS API KEY:
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    style={{
                      background: "rgba(10, 13, 20, 0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      color: "#FFF",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      width: "100%",
                    }}
                  />
                  <button
                    onClick={() => setShowKeyInput(false)}
                    style={{
                      background: "#2563EB",
                      border: "none",
                      color: "#FFF",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    <Check size={16} />
                  </button>
                </div>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "8px", lineHeight: "1.4" }}>
                  Unlocks 100% exact Google Maps driving distance and traffic duration.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={fetchComparison}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#FFF",
              padding: "10px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontWeight: 600,
              fontSize: "0.9rem",
            }}
          >
            <RefreshCw size={15} className={loading ? "spin" : ""} /> Refresh Fares
          </button>
        </div>
      </header>

      {/* Notice Banner if Google Maps API key is not entered */}
      {!apiKey && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            borderRadius: "12px",
            padding: "12px 18px",
            marginBottom: "20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "0.88rem",
            color: "#FBBF24",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <AlertCircle size={18} />
            <span>
              <strong>Currently using Haversine Distance Estimator.</strong> To get exact Google Maps driving route & live traffic, click <strong>"Add Google Maps API Key"</strong> above!
            </span>
          </div>
          <button
            onClick={() => setShowKeyInput(true)}
            style={{
              background: "#F59E0B",
              color: "#000",
              border: "none",
              padding: "6px 14px",
              borderRadius: "8px",
              fontWeight: 700,
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Enter Key Now
          </button>
        </div>
      )}

      {/* Main Grid: Location Selector + Controls */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "20px", marginBottom: "24px" }}>
        {pickup && drop && (
          <LocationSelector
            locations={locations}
            pickup={pickup}
            drop={drop}
            apiKey={apiKey}
            onSelectPickup={setPickup}
            onSelectDrop={setDrop}
            onSwap={handleSwap}
          />
        )}

        {/* Route Summary & Simulation Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {compareData?.route && (
            <div className="glass-panel" style={{ padding: "20px" }}>
              <div style={{ fontSize: "0.8rem", color: isGoogleMapsActive ? "#4ADE80" : "#FBBF24", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Route size={15} color={isGoogleMapsActive ? "#4ADE80" : "#FBBF24"} />
                ROUTE METRICS ({compareData.route.source === "google_maps" ? "GOOGLE MAPS DRIVING ROUTE" : "BENGALURU ROAD ESTIMATOR"})
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Distance</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFF" }}>
                    {compareData.route.distanceKm} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-muted)" }}>km</span>
                  </div>
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", padding: "14px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Est. Duration</div>
                  <div style={{ fontSize: "1.75rem", fontWeight: 800, color: "#FFF" }}>
                    {compareData.route.durationMin} <span style={{ fontSize: "1rem", fontWeight: 500, color: "var(--text-muted)" }}>mins</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Google Maps Route Display Card */}
          {apiKey && (
            <div className="glass-panel" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ fontSize: "0.8rem", color: "#4ADE80", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: "6px" }}>
                <Route size={15} color="#4ADE80" />
                Live Driving Route Visualizer
              </div>
              <div 
                id="route-map" 
                style={{ 
                  width: "100%", 
                  height: "280px", 
                  borderRadius: "12px", 
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "#0f172a"
                }}
              ></div>
            </div>
          )}

          <SimControls
            forceNight={forceNight}
            onToggleNight={setForceNight}
            surge={surge}
            onChangeSurge={setSurge}
          />
        </div>
      </div>

      {/* Total Potential Savings Ribbon */}
      {totalSavings > 0 && (
        <div
          className="savings-banner"
          style={{
            marginBottom: "24px",
            padding: "16px 24px",
            borderRadius: "16px",
            fontSize: "1.05rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Sparkles size={22} color="#4ADE80" />
            <div>
              <div style={{ color: "#FFF", fontWeight: 700 }}>
                Smart Choice: Save up to <span style={{ color: "#4ADE80", fontSize: "1.2rem" }}>₹{totalSavings}</span> by comparing Namma Yatri, Uber, Ola, and Rapido!
              </div>
              <div style={{ fontSize: "0.82rem", color: "#A7F3D0" }}>
                Real-time fare calculation comparing rate-cards, surge factors, and booking fees across 4 providers.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Category Filter Tabs */}
      <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "12px", marginBottom: "20px" }}>
        {[
          { id: "all", label: "All Vehicles" },
          { id: "auto", label: "🛺 Auto" },
          { id: "hatchback", label: "🚗 Mini / Hatchback" },
          { id: "sedan", label: "🚘 Sedan" },
          { id: "suv", label: "🚙 SUV / XL" },
          { id: "bike", label: "🏍️ Bike" },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`category-tab ${selectedCategory === tab.id ? "active" : ""}`}
            onClick={() => setSelectedCategory(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Category Comparisons List */}
      {loading ? (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          <RefreshCw size={28} className="spin" style={{ margin: "0 auto 12px" }} />
          Calculating real-time distance and running 4-way rate formulas...
        </div>
      ) : displayedCategories.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {displayedCategories.map((cat: any) => (
            <CategorySection
              key={cat.category}
              data={cat}
              onOpenBreakdown={(item) => setSelectedItemForModal(item)}
            />
          ))}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          No vehicle options found for the selected category.
        </div>
      )}

      {/* Fare Breakdown Modal */}
      <FareBreakdownModal
        item={selectedItemForModal}
        onClose={() => setSelectedItemForModal(null)}
      />
    </div>
  );
}
