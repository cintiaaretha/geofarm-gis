import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Circle,
  GeoJSON,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { Plane } from "lucide-react";
import { useAppState } from "../../context/useAppState";
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
        style={{
          backgroundColor: color,
        }}
      >
        <Plane size={22} color="white" />
      </div>
    ),
    className: "",
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });

const DEFAULT_CENTER = [-6.3255, 108.3145];
const DEFAULT_ZOOM = 16;
const TILE_URLS = {
  imagery: {
    url:
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles © Esri",
  },
  street: {
    url:
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap contributors",
  },
};

const DRONE_PATH = [
  [-6.32210, 108.31250],
  [-6.32255, 108.31320],
  [-6.32320, 108.31385],
  [-6.32400, 108.31420],
  [-6.32480, 108.31455],
  [-6.32560, 108.31480],
  [-6.32640, 108.31510],
  [-6.32720, 108.31540],
  [-6.32800, 108.31580],
  [-6.32865, 108.31630],
  // kembali menyusuri area
  [-6.32800, 108.31580],
  [-6.32720, 108.31540],
  [-6.32640, 108.31510],
  [-6.32560, 108.31480],
  [-6.32480, 108.31455],
  [-6.32400, 108.31420],
  [-6.32320, 108.31385],
  [-6.32255, 108.31320],
  [-6.32210, 108.31250],
];

const MapSection = () => {
  const {
    farmland,
    selectedArea,
    setSelectedArea,
    activeLayer,
    activePeriod,
    droneFlying,
  } = useAppState();
  const [farmlandGeoJSON, setFarmlandGeoJSON] =
    useState(null);
  const [focusToken, setFocusToken] = useState(0);
  const [dronePathIndex, setDronePathIndex] =
    useState(0);

  useEffect(() => {
    fetch("/map.geojson")
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Gagal mengambil GeoJSON: ${response.status}`
          );
        }
        return response.json();
      })
      .then((data) => {
        setFarmlandGeoJSON(data);
      })
      .catch((error) => {
        console.error(
          "Gagal memuat map.geojson:",
          error
        );
      });
  }, []);

  useEffect(() => {
    if (!droneFlying) {
      setDronePathIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setDronePathIndex((previous) => {
        if (
          previous >=
          DRONE_PATH.length - 1
        ) {
          return 0;
        }
        return previous + 1;
      });
    }, 700);
    return () => {
      clearInterval(interval);
    };
  }, [droneFlying]);

  const displayedDronePos =
    DRONE_PATH[dronePathIndex];

  const tile =
    activeLayer === "Street"
      ? TILE_URLS.street
      : TILE_URLS.imagery;

  const droneIcon = useMemo(
    () =>
      droneIconFor(
        droneFlying
          ? "#16A34A"
          : "#94A3B8"
      ),
    [droneFlying]
  );

  const geoJsonStyle = {
    color: "#16A34A",
    weight: 2,
    // GeoJSON hanya menjadi batas area.
    // Warna blok A-F akan berasal dari farmland.js.
    fillColor: "transparent",
    fillOpacity: 0,
  };

  const onEachGeoJSONFeature = (
    feature,
    layer
  ) => {
    layer.on({
      mouseover: (event) => {
        event.target.setStyle({
          weight: 3,
        });
      },
      mouseout: (event) => {
        event.target.setStyle({
          weight: 2,
        });
      },
    });
  };

  return (
    <div className="relative h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <MapToolbar
        onResetView={() => {
          setSelectedArea(null);

          setFocusToken(
            (token) => token + 1
          );
        }}
      />
      <LayerControl />
      <Legend />
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution={tile.attribution}
          url={tile.url}
        />
        {farmlandGeoJSON && (
          <GeoJSON
            data={farmlandGeoJSON}
            style={geoJsonStyle}
            onEachFeature={
              onEachGeoJSONFeature
            }
          />
        )}
        <MapController
          selectedArea={selectedArea}
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          focusToken={focusToken}
        />
        <Circle
          center={DEFAULT_CENTER}
          radius={350}
          pathOptions={{
            color: "#22C55E",
            fillColor: "#22C55E",
            fillOpacity: 0.04,
            weight: 1,
            dashArray: "4 6",
          }}
        />
        {droneFlying && (
          <Polyline
            positions={DRONE_PATH}
            pathOptions={{
              color: "#16A34A",
              weight: 2,
              opacity: 0.75,
              dashArray: "6 6",
            }}
          />
        )}
        <Marker
          position={displayedDronePos}
          icon={droneIcon}
        >
          <Popup>
            <div className="space-y-1">
              <h3 className="font-semibold">
                Drone DJI Phantom 4 RTK
              </h3>
              <p>
                Status :{" "}
                {droneFlying
                  ? "Sedang Memetakan"
                  : "Standby"}
              </p>
              <p>Ketinggian : 120 meter</p>
              <p>Baterai : 86%</p>
              <p>
                Kecepatan :{" "}
                {droneFlying
                  ? "24 km/jam"
                  : "0 km/jam"}
              </p>
            </div>
          </Popup>
        </Marker>

        {farmland.map((field) => {
          if (
            !field.coordinates ||
            field.coordinates.length < 3
          ) {
            console.warn(
              `Blok "${field.name}" tidak memiliki koordinat polygon.`
            );
            return null;
          }

         const getFieldColor = () => {
            if (activeLayer === "NDVI") {
              if (field.ndvi >= 0.6) return "#22C55E";
              if (field.ndvi >= 0.3) return "#FACC15";
              return "#EF4444";
            }

            if (activeLayer === "Kelembapan") {
              const moisture = parseInt(field.moisture, 10);

              if (moisture >= 60) return "#22C55E";
              if (moisture >= 40) return "#FACC15";
              return "#EF4444";
            }

            return field.color;
          };

          const fillColor = getFieldColor();
          const isSelected =
            selectedArea?.id === field.id;
          return (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              pathOptions={{
                color: isSelected
                  ? "#0F172A"
                  : fillColor,
                fillColor:
                  fillColor,
                fillOpacity:
                  isSelected
                    ? 0.75
                    : 0.55,
                weight:
                  isSelected
                    ? 4
                    : 2,
              }}

              eventHandlers={{
                click: () => {
                  setSelectedArea(field);
                },
                mouseover: (event) => {
                  event.target.setStyle({
                    fillOpacity: 0.8,
                    weight: 3,
                  });
                },
                mouseout: (event) => {
                  event.target.setStyle({
                    fillOpacity:
                      isSelected
                        ? 0.75
                        : 0.55,
                    weight:
                      isSelected
                        ? 4
                        : 2,
                  });
                },
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold">
                    {field.name}
                  </h3>
                  <p>Status : {field.status}</p>
                  <p>NDVI : {field.ndvi}</p>
                  <p>Kelembapan : {field.moisture}</p>
                  <p>Suhu : {field.temperature}</p>
                  <p>Luas : {field.area}</p>
                  <p>Komoditas : {field.crop}</p>
                  <p className="text-xs text-slate-400">
                    Periode :{" "}
                    {activePeriod === "now"
                      ? "Saat ini"
                      : activePeriod === "w1"
                      ? "7 hari lalu"
                      : "30 hari lalu"}
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