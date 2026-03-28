import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import { io } from "socket.io-client";
import T from "../constants/tokens";
import delhiGeoJson from "../data/delhi_districts.json";
import "leaflet/dist/leaflet.css";

/* ═══════════════════════════════════════════════════════════════
   DELHI HEAT MAP — Choropleth component for complaint density
   
   • Fetches /api/map-stats for location × department aggregation
   • Colors districts by dominant department
   • Scales opacity by complaint volume
   • Hover tooltips with detailed breakdowns
═══════════════════════════════════════════════════════════════ */

// ── Time filter options ─────────────────────────────────────────
const TIMEFRAME_OPTIONS = [
  { value: "24h", label: "24 Hours" },
  { value: "7d",  label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "all", label: "All Time" },
];

// ── Department → Color mapping ──────────────────────────────────
// Supports both naming conventions (official + CRM-internal)
const DEPARTMENT_COLORS = {
  // Primary departments (user-specified)
  DJB:       "#1565C0",
  MCD:       "#2E7D32",
  PWD:       "#EF6C00",
  CPGRAMS:   "#C62828",
  // CRM-internal names (mapped to same palette)
  Water:       "#1565C0",
  Sanitation:  "#2E7D32",
  Roads:       "#EF6C00",
  General:     "#C62828",
  // Extended departments
  Electricity: "#FBBF24",
  Transport:   "#6A1B9A",
  Police:      "#0097A7",
  Health:      "#E91E63",
  Education:   "#00897B",
};

const FALLBACK_COLORS = [
  "#5C6BC0", "#8D6E63", "#78909C", "#EC407A", "#AB47BC",
  "#26A69A", "#FFA726", "#42A5F5", "#66BB6A", "#EF5350",
];

const MIXED_COLOR = "#C62828";
const EMPTY_COLOR = "#CBD5E0";

let fallbackIndex = 0;
const getDepartmentColor = (dept) => {
  if (!dept) return EMPTY_COLOR;
  if (DEPARTMENT_COLORS[dept]) return DEPARTMENT_COLORS[dept];
  // Assign a stable fallback for unknown departments
  const color = FALLBACK_COLORS[fallbackIndex % FALLBACK_COLORS.length];
  DEPARTMENT_COLORS[dept] = color;
  fallbackIndex++;
  return color;
};

// ── Fuzzy location matching ─────────────────────────────────────
// Matches a free-text complaint location → GeoJSON district
const matchLocationToDistrict = (location, features) => {
  if (!location || typeof location !== "string") return null;
  const lower = location.toLowerCase().trim();

  for (const feature of features) {
    const props = feature.properties;
    const districtName = (props.name || "").toLowerCase();
    const aliases = Array.isArray(props.aliases) ? props.aliases : [];

    // Direct district name match
    if (lower.includes(districtName) || districtName.includes(lower)) {
      return props.name;
    }

    // Alias match (neighborhoods, landmarks)
    for (const alias of aliases) {
      if (lower.includes(alias) || alias.includes(lower)) {
        return props.name;
      }
    }
  }

  return null;
};

// ── Build per-district stats from API data ──────────────────────
const buildDistrictStats = (apiStats, features) => {
  const districtMap = {};

  // Initialize all districts with zero
  for (const feature of features) {
    const name = feature.properties.name;
    districtMap[name] = { total: 0, departments: {}, topDepartment: null };
  }

  // Map each API location to its district
  for (const entry of apiStats) {
    const district = matchLocationToDistrict(entry.location, features);
    if (!district) continue;

    districtMap[district].total += entry.total;

    for (const dept of entry.departments) {
      const existing = districtMap[district].departments[dept.name] || 0;
      districtMap[district].departments[dept.name] = existing + dept.count;
    }
  }

  // Compute topDepartment per district
  for (const name of Object.keys(districtMap)) {
    const depts = districtMap[name].departments;
    const entries = Object.entries(depts);
    if (entries.length > 0) {
      entries.sort((a, b) => b[1] - a[1]);
      districtMap[name].topDepartment = entries[0][0];
    }
  }

  return districtMap;
};

// ── Map auto-fit component ──────────────────────────────────────
function FitBounds({ geoJson }) {
  const map = useMap();
  useEffect(() => {
    if (!geoJson) return;
    const L = window.L || require("leaflet");
    const layer = L.geoJSON(geoJson);
    const bounds = layer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
    }
  }, [geoJson, map]);
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   COMPONENT
═══════════════════════════════════════════════════════════════ */

export default function DelhiHeatMap() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataSource, setDataSource] = useState(null); // "live" or "mock"
  const [timeframe, setTimeframe] = useState("all");
  const [hoveredDistrict, setHoveredDistrict] = useState(null);
  const [pulsingDistrict, setPulsingDistrict] = useState(null);
  const [liveEvent, setLiveEvent] = useState(null);
  const geoJsonRef = useRef(null);
  const pulseTimerRef = useRef(null);

  // ── Fetch map stats (re-fetches when timeframe changes) ─────
  useEffect(() => {
    let cancelled = false;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/map-stats?timeframe=${timeframe}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setStats(data.stats || []);
          setDataSource(data.source || "live");
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Failed to load map stats:", err);
          setError("Unable to load complaint data");
          setStats([]);
          setDataSource(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchStats();
    return () => { cancelled = true; };
  }, [timeframe]);

  // ── Socket.io: real-time complaint events ──────────────────
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:6000";
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
    });

    socket.on("connect", () => {
      console.log("[heatmap] Socket connected:", socket.id);
    });

    socket.on("new_complaint", (event) => {
      const { location, department } = event;
      if (!location || !department) return;

      // Find which GeoJSON district this location maps to
      const district = matchLocationToDistrict(location, delhiGeoJson.features);

      // Update the live event indicator
      setLiveEvent({ location, department, district, time: new Date() });

      // Update stats in-place (increment the matching location/department)
      setStats((prev) => {
        if (!prev) return prev;
        const updated = [...prev];
        const idx = updated.findIndex(
          (s) => s.location.toLowerCase() === location.toLowerCase()
        );

        if (idx >= 0) {
          // Location exists — increment
          const entry = { ...updated[idx] };
          entry.total += 1;
          const deptIdx = entry.departments.findIndex((d) => d.name === department);
          if (deptIdx >= 0) {
            entry.departments = [...entry.departments];
            entry.departments[deptIdx] = {
              ...entry.departments[deptIdx],
              count: entry.departments[deptIdx].count + 1,
            };
          } else {
            entry.departments = [...entry.departments, { name: department, count: 1 }];
          }
          // Recompute topDepartment
          const sorted = [...entry.departments].sort((a, b) => b.count - a.count);
          entry.topDepartment = sorted[0]?.name || "General";
          updated[idx] = entry;
        } else {
          // New location
          updated.push({
            location,
            total: 1,
            departments: [{ name: department, count: 1 }],
            topDepartment: department,
          });
        }

        return updated;
      });

      // Trigger pulse animation on the affected district
      if (district) {
        // Clear any existing pulse timer
        if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
        setPulsingDistrict(district);
        pulseTimerRef.current = setTimeout(() => setPulsingDistrict(null), 2000);
      }
    });

    socket.on("connect_error", (err) => {
      console.warn("[heatmap] Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      if (pulseTimerRef.current) clearTimeout(pulseTimerRef.current);
    };
  }, []);

  // ── Unique key to force GeoJSON re-render on data change ───
  const geoJsonKey = useMemo(
    () => `${timeframe}-${JSON.stringify(stats?.map((s) => s.total) || [])}`,
    [timeframe, stats]
  );

  // ── Compute district stats ────────────────────────────────
  const districtStats = useMemo(() => {
    if (!stats) return {};
    return buildDistrictStats(stats, delhiGeoJson.features);
  }, [stats]);

  // ── Compute max complaints for opacity scaling ────────────
  const maxComplaints = useMemo(() => {
    const values = Object.values(districtStats).map((d) => d.total);
    return Math.max(...values, 1);
  }, [districtStats]);

  // ── Collect all unique departments for legend ─────────────
  const allDepartments = useMemo(() => {
    const set = new Set();
    Object.values(districtStats).forEach((d) => {
      Object.keys(d.departments).forEach((dept) => set.add(dept));
    });
    return [...set].sort();
  }, [districtStats]);

  // ── Style function for GeoJSON polygons ───────────────────
  const getStyle = useCallback(
    (feature) => {
      const name = feature.properties.name;
      const data = districtStats[name];

      if (!data || data.total === 0) {
        return {
          fillColor: EMPTY_COLOR,
          fillOpacity: 0.15,
          color: "#94A3B8",
          weight: 1.5,
          dashArray: "4 4",
        };
      }

      // Determine color by dominant department
      const deptEntries = Object.entries(data.departments);
      let fillColor;
      if (deptEntries.length === 0) {
        fillColor = EMPTY_COLOR;
      } else if (deptEntries.length === 1) {
        fillColor = getDepartmentColor(deptEntries[0][0]);
      } else {
        // Check if there's a clear majority (>50%)
        deptEntries.sort((a, b) => b[1] - a[1]);
        const topRatio = deptEntries[0][1] / data.total;
        fillColor =
          topRatio > 0.5
            ? getDepartmentColor(deptEntries[0][0])
            : MIXED_COLOR;
      }

      // Opacity: linear scale 0.2 → 0.85 based on complaint volume
      const ratio = data.total / maxComplaints;
      const fillOpacity = 0.2 + ratio * 0.65;

      return {
        fillColor,
        fillOpacity,
        color: fillColor,
        weight: 2,
        opacity: 0.8,
      };
    },
    [districtStats, maxComplaints]
  );

  // ── Interaction handlers ──────────────────────────────────
  const onEachFeature = useCallback(
    (feature, layer) => {
      const name = feature.properties.name;

      // Store reference to layer element for pulse animation
      layer._districtName = name;

      layer.on({
        mouseover: (e) => {
          const target = e.target;
          target.setStyle({
            weight: 3,
            color: "#1A1A2E",
            fillOpacity: Math.min((target.options.fillOpacity || 0.3) + 0.15, 0.95),
          });
          target.bringToFront();
          setHoveredDistrict(name);
        },
        mouseout: (e) => {
          if (geoJsonRef.current) {
            geoJsonRef.current.resetStyle(e.target);
          }
          setHoveredDistrict(null);
        },
      });
    },
    []
  );

  // ── Apply pulse animation to the pulsing district ──────────
  useEffect(() => {
    if (!geoJsonRef.current || !pulsingDistrict) return;

    geoJsonRef.current.eachLayer((layer) => {
      const el = layer.getElement?.();
      if (!el) return;

      if (layer._districtName === pulsingDistrict) {
        el.classList.add("district-pulse");
      } else {
        el.classList.remove("district-pulse");
      }
    });

    return () => {
      if (!geoJsonRef.current) return;
      geoJsonRef.current.eachLayer((layer) => {
        layer.getElement?.()?.classList.remove("district-pulse");
      });
    };
  }, [pulsingDistrict]);

  // ── Tooltip content ───────────────────────────────────────
  const tooltipData = useMemo(() => {
    if (!hoveredDistrict || !districtStats[hoveredDistrict]) return null;
    const d = districtStats[hoveredDistrict];
    return {
      name: hoveredDistrict,
      total: d.total,
      topDepartment: d.topDepartment || "None",
      departments: Object.entries(d.departments)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
    };
  }, [hoveredDistrict, districtStats]);

  // ── Loading / error states ────────────────────────────────
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner} />
        <div style={{ color: T.sub, fontSize: 14, marginTop: 16 }}>
          Loading complaint heatmap…
        </div>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      {/* Time Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.filterLabel}>
          <span style={{ fontSize: 14 }}>⏱️</span>
          <span>Timeframe</span>
        </div>
        <div style={styles.filterToggle}>
          {TIMEFRAME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeframe(opt.value)}
              style={{
                ...styles.filterButton,
                ...(timeframe === opt.value ? styles.filterButtonActive : {}),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div style={styles.mapOuter}>
        <MapContainer
          center={[28.65, 77.1]}
          zoom={11}
          style={styles.mapInner}
          scrollWheelZoom={false}
          zoomControl={true}
          attributionControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          />
          <GeoJSON
            key={geoJsonKey}
            data={delhiGeoJson}
            style={getStyle}
            onEachFeature={onEachFeature}
            ref={geoJsonRef}
          />
          <FitBounds geoJson={delhiGeoJson} />
        </MapContainer>

        {/* Hover Tooltip */}
        {tooltipData && (
          <div style={styles.tooltip}>
            <div style={styles.tooltipHeader}>
              <span style={{ fontSize: 16 }}>📍</span>
              <span style={styles.tooltipTitle}>{tooltipData.name}</span>
            </div>
            <div style={styles.tooltipDivider} />
            <div style={styles.tooltipRow}>
              <span style={styles.tooltipLabel}>Active Complaints</span>
              <span style={styles.tooltipValue}>{tooltipData.total}</span>
            </div>
            <div style={styles.tooltipRow}>
              <span style={styles.tooltipLabel}>Top Issue</span>
              <span style={{
                ...styles.tooltipValue,
                color: getDepartmentColor(tooltipData.topDepartment),
                fontWeight: 800,
              }}>
                {tooltipData.topDepartment}
              </span>
            </div>
            {tooltipData.departments.length > 0 && (
              <>
                <div style={{ ...styles.tooltipDivider, margin: "8px 0" }} />
                <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                  Breakdown
                </div>
                {tooltipData.departments.map(([dept, count]) => (
                  <div key={dept} style={styles.tooltipBreakdownRow}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: getDepartmentColor(dept),
                        flexShrink: 0,
                      }} />
                      <span style={{ color: T.textSecondary, fontSize: 12 }}>{dept}</span>
                    </div>
                    <span style={{ color: T.text, fontSize: 12, fontWeight: 700 }}>{count}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* Mock data indicator */}
        {dataSource === "mock" && (
          <div style={styles.mockBadge}>
            <span style={{ fontSize: 14 }}>🧪</span>
            <span style={{ color: T.amber, fontSize: 12, fontWeight: 700 }}>Mock Data Mode</span>
            <span style={{ color: T.muted, fontSize: 10 }}>DB offline — showing sample data</span>
          </div>
        )}

        {/* Live data indicator */}
        {dataSource === "live" && (
          <div style={styles.liveBadge}>
            <span style={styles.liveDot} />
            <span style={{ color: T.green, fontSize: 12, fontWeight: 700 }}>Live</span>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div style={styles.errorOverlay}>
            <span style={{ fontSize: 20 }}>⚠️</span>
            <span style={{ color: T.amber, fontSize: 13, fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* Live event feed */}
        {liveEvent && (
          <div style={styles.liveEventBadge} key={liveEvent.time?.getTime()}>
            <span style={{ fontSize: 12 }}>🚨</span>
            <span style={{ color: T.text, fontSize: 11, fontWeight: 600 }}>
              New: {liveEvent.department} @ {liveEvent.location}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendTitle}>Department Legend</div>
        {allDepartments.length > 0 ? (
          allDepartments.map((dept) => (
            <div key={dept} style={styles.legendItem}>
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: getDepartmentColor(dept),
                flexShrink: 0,
              }} />
              <span style={styles.legendLabel}>{dept}</span>
            </div>
          ))
        ) : (
          /* Show default legend when no data */
          [
            ["DJB", "#1565C0"],
            ["MCD", "#2E7D32"],
            ["PWD", "#EF6C00"],
            ["CPGRAMS", "#C62828"],
          ].map(([dept, color]) => (
            <div key={dept} style={styles.legendItem}>
              <div style={{
                width: 12, height: 12, borderRadius: 3,
                background: color,
                flexShrink: 0,
              }} />
              <span style={styles.legendLabel}>{dept}</span>
            </div>
          ))
        )}
        <div style={{ ...styles.tooltipDivider, margin: "8px 0" }} />
        <div style={styles.legendItem}>
          <div style={{
            width: 12, height: 12, borderRadius: 3,
            background: MIXED_COLOR,
            flexShrink: 0,
          }} />
          <span style={styles.legendLabel}>Mixed / Overall</span>
        </div>
        <div style={styles.legendItem}>
          <div style={{
            width: 12, height: 12, borderRadius: 3,
            background: EMPTY_COLOR,
            flexShrink: 0,
            border: "1px solid #94A3B8",
          }} />
          <span style={styles.legendLabel}>No Data</span>
        </div>

        {/* Intensity guide */}
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, color: T.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Intensity
          </div>
          <div style={{
            height: 10, borderRadius: 5, width: "100%",
            background: `linear-gradient(to right, ${T.primary}33, ${T.primary})`,
          }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3 }}>
            <span style={{ fontSize: 10, color: T.muted }}>Low</span>
            <span style={{ fontSize: 10, color: T.muted }}>High</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   STYLES
═══════════════════════════════════════════════════════════════ */
const styles = {
  wrapper: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  filterBar: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: T.radius,
    padding: "10px 18px",
    boxShadow: T.shadow,
    marginBottom: 0,
    flexShrink: 0,
  },
  filterLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 700,
    color: T.textSecondary,
    fontFamily: "'Poppins', sans-serif",
  },
  filterToggle: {
    display: "flex",
    gap: 0,
    background: T.surf,
    borderRadius: 100,
    padding: 3,
    border: `1px solid ${T.border}`,
  },
  filterButton: {
    padding: "6px 16px",
    border: "none",
    borderRadius: 100,
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all .25s ease",
    background: "transparent",
    color: T.sub,
    fontFamily: "'Inter', sans-serif",
  },
  filterButtonActive: {
    background: T.primary,
    color: "#fff",
    boxShadow: `0 2px 8px ${T.primary}33`,
    fontWeight: 700,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 420,
    background: T.white,
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    boxShadow: T.shadow,
  },
  spinner: {
    width: 36,
    height: 36,
    border: `3px solid ${T.border}`,
    borderTopColor: T.primary,
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  mapOuter: {
    flex: "1 1 0%",
    minWidth: 0,
    position: "relative",
    borderRadius: T.radius,
    overflow: "hidden",
    border: `1px solid ${T.border}`,
    boxShadow: T.shadow,
    background: T.white,
  },
  mapInner: {
    width: "100%",
    height: 480,
    borderRadius: T.radius,
    zIndex: 1,
  },
  tooltip: {
    position: "absolute",
    top: 14,
    right: 14,
    zIndex: 1000,
    background: "rgba(255,255,255,0.97)",
    backdropFilter: "blur(12px)",
    borderRadius: T.radiusSm,
    padding: "14px 18px",
    minWidth: 200,
    maxWidth: 260,
    boxShadow: T.shadowLg,
    border: `1px solid ${T.border}`,
    pointerEvents: "none",
  },
  tooltipHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  tooltipTitle: {
    fontWeight: 800,
    fontSize: 15,
    color: T.text,
    fontFamily: "'Poppins', sans-serif",
  },
  tooltipDivider: {
    height: 1,
    background: T.border,
    margin: "10px 0",
  },
  tooltipRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tooltipLabel: {
    fontSize: 12,
    color: T.sub,
  },
  tooltipValue: {
    fontSize: 14,
    fontWeight: 700,
    color: T.text,
  },
  tooltipBreakdownRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 3,
  },
  legend: {
    flexShrink: 0,
    width: 180,
    background: T.white,
    borderRadius: T.radius,
    border: `1px solid ${T.border}`,
    boxShadow: T.shadow,
    padding: "18px 16px",
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: T.text,
    fontFamily: "'Poppins', sans-serif",
    marginBottom: 12,
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: T.textSecondary,
    fontWeight: 500,
  },
  errorOverlay: {
    position: "absolute",
    bottom: 14,
    left: 14,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: T.amberBg,
    border: `1px solid ${T.amber}44`,
    borderRadius: T.radiusSm,
    padding: "8px 14px",
  },
  mockBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    background: "rgba(255,243,224,0.95)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${T.amber}44`,
    borderRadius: T.radiusSm,
    padding: "10px 14px",
    pointerEvents: "none",
  },
  liveBadge: {
    position: "absolute",
    top: 14,
    left: 14,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(232,245,233,0.95)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${T.green}44`,
    borderRadius: T.radiusSm,
    padding: "6px 12px",
    pointerEvents: "none",
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: T.green,
    animation: "pulse 2s ease-in-out infinite",
  },
  liveEventBadge: {
    position: "absolute",
    bottom: 14,
    right: 14,
    zIndex: 1000,
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(8px)",
    border: `1px solid ${T.primary}44`,
    borderRadius: T.radiusSm,
    padding: "6px 12px",
    pointerEvents: "none",
    animation: "fadeIn 0.3s ease-out",
  },
};
