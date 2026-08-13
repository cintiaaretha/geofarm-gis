import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Circle,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { renderToStaticMarkup } from "react-dom/server";
import { Plane } from "lucide-react";

import { useAppState } from "../../context/useAppState";
import { moistureColor } from "../../utils/geo";
import Legend from "../map/Legend";
import MapToolbar from "../map/MapToolbar";
import LayerControl from "../map/LayerControl";
import MapController from "../map/MapController";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const droneIconFor = (color) =>
  L.divIcon({
    html: renderToStaticMarkup(
      <div
        className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-white shadow-xl"
        style={{ backgroundColor: color }}
      >
        <Plane size={22} color="white" />
      </div>
    ),
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

const DEFAULT_CENTER = [-7.8014, 110.3647];
const DEFAULT_ZOOM = 16;

const TILE_URLS = {
  imagery: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
  },
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
};

const MapSection = () => {
  const {
    farmland,
    selectedArea,
    setSelectedArea,
    activeLayer,
    activePeriod,
    droneFlying,
  } = useAppState();

  const [focusToken, setFocusToken] = useState(0);

  // Animasi posisi drone berputar mengelilingi titik pusat saat "terbang"
  const [dronePos, setDronePos] = useState(DEFAULT_CENTER);

  useEffect(() => {
    if (!droneFlying) return;

    let angle = 0;
    const interval = setInterval(() => {
      angle += 0.12;
      const r = 0.003;
      setDronePos([
        DEFAULT_CENTER[0] + r * Math.sin(angle),
        DEFAULT_CENTER[1] + r * Math.cos(angle),
      ]);
    }, 400);
    return () => clearInterval(interval);
  }, [droneFlying]);

  const displayedDronePos = droneFlying ? dronePos : DEFAULT_CENTER;

  const tile = activeLayer === "Street" ? TILE_URLS.street : TILE_URLS.imagery;

  const droneIcon = useMemo(
    () => droneIconFor(droneFlying ? "#16A34A" : "#94A3B8"),
    [droneFlying]
  );

  return (
    <div className="relative h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <MapToolbar onResetView={() => { setSelectedArea(null); setFocusToken((t) => t + 1); }} />
      <LayerControl />
      <Legend />

      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer attribution={tile.attribution} url={tile.url} />

        <MapController
          selectedArea={selectedArea}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          focusToken={focusToken}
        />

        {/* Area jangkauan pemetaan drone */}
        <Circle
          center={DEFAULT_CENTER}
          radius={350}
          pathOptions={{
            color: "#22C55E",
            fillColor: "#22C55E",
            fillOpacity: 0.06,
            weight: 1,
            dashArray: "4 6",
          }}
        />

        {/* Drone */}
        <Marker position={displayedDronePos} icon={droneIcon}>
          <Popup>
            <div className="space-y-1">
              <h3 className="font-semibold">Drone DJI Phantom 4 RTK</h3>
              <p>Status : {droneFlying ? "Sedang Memetakan" : "Standby"}</p>
              <p>Ketinggian : 120 meter</p>
              <p>Baterai : 86%</p>
              <p>Kecepatan : {droneFlying ? "24 km/jam" : "0 km/jam"}</p>
            </div>
          </Popup>
        </Marker>

        {/* Farmland */}
        {farmland.map((field) => {
          const fillColor =
            activeLayer === "Kelembapan" ? moistureColor(field.moisture) : field.color;

          const isSelected = selectedArea?.id === field.id;

          return (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              pathOptions={{
                color: isSelected ? "#0F172A" : fillColor,
                fillColor,
                fillOpacity: isSelected ? 0.75 : 0.55,
                weight: isSelected ? 4 : 2,
              }}
              eventHandlers={{
                click: () => setSelectedArea(field),
                mouseover: (e) => e.target.setStyle({ fillOpacity: 0.8, weight: 3 }),
                mouseout: (e) =>
                  e.target.setStyle({
                    fillOpacity: isSelected ? 0.75 : 0.55,
                    weight: isSelected ? 4 : 2,
                  }),
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold">{field.name}</h3>
                  <p>Status : {field.status}</p>
                  <p>NDVI : {field.ndvi}</p>
                  <p>Kelembapan : {field.moisture}</p>
                  <p>Luas : {field.area}</p>
                  <p className="text-xs text-slate-400">
                    Periode: {activePeriod === "now" ? "Saat ini" : activePeriod === "w1" ? "7 hari lalu" : "30 hari lalu"}
                  </p>
                </div>
              </Popup>
            </Polygon>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapSection;
