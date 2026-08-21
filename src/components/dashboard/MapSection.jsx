import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polygon,
  Polyline,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Plane } from "lucide-react";

import { useAppState } from "../../context/useAppState";
import {
  farmlandToFeature,
  farmlandDefaultView,
  polygonCentroid,
} from "../../utils/geo";

import Legend from "../map/Legend";
import MapToolbar from "../map/MapToolbar";
import LayerControl from "../map/LayerControl";
import MapController from "../map/MapController";

// =========================================================
// LEAFLET DEFAULT ICON SETUP
// =========================================================

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// =========================================================
// ICON DRONE
// =========================================================

const createDroneIcon = (color) =>
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

// =========================================================
// CONSTANTS
// =========================================================

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

// Lama waktu terbang antar titik (ms). Jalur dibangun dinamis dari
// titik tengah tiap blok lahan (lihat droneWaypoints di bawah),
// bukan koordinat hardcode -- supaya drone selalu menyusuri semua
// blok yang ada di data/farmland.js.
const DRONE_SEGMENT_DURATION_MS = 2200;

// =========================================================
// COMPONENT
// =========================================================

const MapSection = () => {
  const {
    // -------------------------------------------------------
    // AREA
    // -------------------------------------------------------

    selectedArea,
    setSelectedArea,

    // -------------------------------------------------------
    // LAYER
    // -------------------------------------------------------

    activeLayer,

    // -------------------------------------------------------
    // DRONE
    // -------------------------------------------------------

    droneFlying,

    // -------------------------------------------------------
    // DRONE IMAGERY
    // -------------------------------------------------------

    droneImagery,
    setDroneImagery,

    imageryReady,
    setImageryReady,

    setImageryBounds,

    imageryProjection,
    setImageryProjection,

    // -------------------------------------------------------
    // GEOJSON
    // -------------------------------------------------------

    geoJsonData,
    setGeoJsonData,

    // -------------------------------------------------------
    // FARMLAND (default)
    // -------------------------------------------------------

    farmland,
  } = useAppState();

  // =======================================================
  // DEFAULT VIEW
  // =======================================================
  // Dihitung dari titik tengah seluruh petak di data/farmland.js
  // supaya peta langsung fokus ke area lahan, bukan [0, 0].
  // =======================================================

  const DEFAULT_VIEW = useMemo(
    () => farmlandDefaultView(farmland),
    [farmland]
  );

  const DEFAULT_CENTER = DEFAULT_VIEW.center;

  const DEFAULT_ZOOM = DEFAULT_VIEW.zoom;

  // =======================================================
  // LOCAL STATE
  // =======================================================

  const [geoRaster, setGeoRaster] = useState(null);

  const [mapCenter, setMapCenter] =
    useState(DEFAULT_VIEW.center);

  const [mapZoom, setMapZoom] =
    useState(DEFAULT_VIEW.zoom);

  const [focusToken, setFocusToken] =
    useState(0);

  // =======================================================
  // BATAS LAHAN DEFAULT (public/map.geojson)
  // =======================================================
  // Dipakai sebagai garis batas keseluruhan area GeoFarm saat
  // user belum mengunggah GeoJSON sendiri.
  // =======================================================

  const [defaultBoundary, setDefaultBoundary] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch("/map.geojson")
      .then((response) => response.json())
      .then((data) => {
        if (!cancelled) {
          setDefaultBoundary(data);
        }
      })
      .catch((error) => {
        console.error("Gagal memuat batas lahan default:", error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // =======================================================
  // LOAD FILE
  // =======================================================

  useEffect(() => {
    const file = droneImagery?.file;

    // -------------------------------------------------------
    // TIDAK ADA FILE
    // -------------------------------------------------------

    if (!file) {
      queueMicrotask(() => {
        setGeoRaster(null);
        setGeoJsonData(null);

        setImageryReady(false);
        setImageryBounds(null);
        setImageryProjection(null);

        setMapCenter(DEFAULT_CENTER);
        setMapZoom(DEFAULT_ZOOM);
      });

      return;
    }

    let cancelled = false;

    const fileName = file.name.toLowerCase();

    // =====================================================
    // READ GEOJSON
    // =====================================================

    const readGeoJSON = async () => {
      try {
        const text = await file.text();

        if (cancelled) return;

        const data = JSON.parse(text);

        // Validasi sederhana GeoJSON
        if (
          data.type !== "FeatureCollection" &&
          data.type !== "Feature"
        ) {
          throw new Error(
            "File bukan GeoJSON yang valid."
          );
        }

        // Simpan GeoJSON
        setGeoJsonData(data);

        // GeoJSON bukan raster
        setGeoRaster(null);

        // Status siap
        setImageryReady(true);

        // Ambil projection jika tersedia
        const projection =
          data?.crs?.properties?.name ?? null;

        setImageryProjection(projection);

        // Simpan metadata
        setDroneImagery((prev) => ({
          ...prev,

          file,
          fileName: file.name,
          type:
            file.type ||
            "application/geo+json",
          size: file.size,

          raster: null,
          geojson: data,

          projection,
        }));

        // Trigger MapController
        setFocusToken(
          (token) => token + 1
        );
      } catch (error) {
        console.error(
          "Gagal membaca GeoJSON:",
          error
        );

        setGeoJsonData(null);
        setGeoRaster(null);

        setImageryReady(false);
        setImageryBounds(null);
        setImageryProjection(null);
      }
    };

    // =====================================================
    // READ GEOTIFF
    // =====================================================

    const readGeoTIFF = async () => {
      try {
        const arrayBuffer =
          await file.arrayBuffer();

        if (cancelled) return;

        const raster =
          await parseGeoraster(arrayBuffer);

        if (cancelled) return;

        // Simpan raster
        setGeoRaster(raster);

        // GeoTIFF bukan GeoJSON
        setGeoJsonData(null);

        // ---------------------------------------------------
        // BOUNDS
        // ---------------------------------------------------

        const bounds = {
          xmin: raster.xmin,
          xmax: raster.xmax,
          ymin: raster.ymin,
          ymax: raster.ymax,
        };

        setImageryBounds(bounds);

        // ---------------------------------------------------
        // PROJECTION
        // ---------------------------------------------------

        const projection =
          raster.projection ?? null;

        setImageryProjection(
          projection
        );

        // ---------------------------------------------------
        // SIMPAN KE GLOBAL STATE
        // ---------------------------------------------------

        setDroneImagery((prev) => ({
          ...prev,

          raster,
          geojson: null,

          file,
          fileName: file.name,

          type:
            file.type ||
            "image/tiff",

          size: file.size,

          bounds,

          projection,
        }));

        setImageryReady(true);

        // ---------------------------------------------------
        // CENTER MAP
        // ---------------------------------------------------

        if (
          typeof raster.xmin === "number" &&
          typeof raster.xmax === "number" &&
          typeof raster.ymin === "number" &&
          typeof raster.ymax === "number"
        ) {
          const centerLat =
            (raster.ymin + raster.ymax) / 2;

          const centerLng =
            (raster.xmin + raster.xmax) / 2;

          setMapCenter([
            centerLat,
            centerLng,
          ]);

          setMapZoom(17);

          setFocusToken(
            (token) => token + 1
          );
        }
      } catch (error) {
        console.error(
          "Gagal membaca GeoTIFF:",
          error
        );

        setGeoRaster(null);

        setImageryReady(false);

        setImageryBounds(null);

        setImageryProjection(null);
      }
    };

    // =====================================================
    // FILE ROUTER
    // =====================================================

    const loadUploadedFile = async () => {
      try {
        // GeoJSON
        if (
          fileName.endsWith(".geojson") ||
          fileName.endsWith(".json")
        ) {
          await readGeoJSON();
          return;
        }

        // GeoTIFF
        if (
          fileName.endsWith(".tif") ||
          fileName.endsWith(".tiff")
        ) {
          await readGeoTIFF();
          return;
        }

        throw new Error(
          "Format file tidak didukung."
        );
      } catch (error) {
        console.error(
          "Gagal memproses file:",
          error
        );

        setGeoRaster(null);
        setGeoJsonData(null);

        setImageryReady(false);

        setImageryBounds(null);

        setImageryProjection(null);
      }
    };

    loadUploadedFile();

    return () => {
      cancelled = true;
    };
    // DEFAULT_CENTER/DEFAULT_ZOOM sengaja tidak dimasukkan ke deps supaya
    // efek ini cuma jalan saat file citra berganti, bukan tiap kali
    // periode/farmland berubah.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    droneImagery?.file,
    setDroneImagery,
    setGeoJsonData,
    setImageryReady,
    setImageryBounds,
    setImageryProjection,
  ]);

  // =======================================================
  // JALUR TERBANG DRONE
  // =======================================================
  //
  // Dibangun dari titik tengah (centroid) tiap blok lahan di
  // data/farmland.js, mengikuti urutan blok (Blok A -> F),
  // lalu kembali ke titik awal. Dengan ini drone selalu
  // menyusuri SEMUA blok yang ada dan otomatis menyesuaikan
  // kalau data blok berubah -- bukan koordinat hardcode.
  // =======================================================

  const droneWaypoints = useMemo(() => {
    const centroids = farmland
      .filter(
        (field) =>
          field.coordinates &&
          field.coordinates.length >= 3
      )
      .map((field) =>
        polygonCentroid(field.coordinates)
      );

    if (centroids.length === 0) {
      return [DEFAULT_CENTER, DEFAULT_CENTER];
    }

    if (centroids.length === 1) {
      return [centroids[0], centroids[0]];
    }

    // Tutup jalurnya: balik lagi ke titik awal
    return [...centroids, centroids[0]];
  }, [farmland, DEFAULT_CENTER]);

  const [dronePosition, setDronePosition] = useState(
    droneWaypoints[0]
  );

  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!droneFlying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
        animationFrameRef.current = null;
      }

      // Drone berhenti -> kembali ke home point
      queueMicrotask(() =>
        setDronePosition(droneWaypoints[0])
      );

      return;
    }

    let segmentIndex = 0;
    let segmentStart = performance.now();

    const step = (now) => {
      const from =
        droneWaypoints[segmentIndex];
      const to =
        droneWaypoints[
          (segmentIndex + 1) %
            droneWaypoints.length
        ];

      const elapsed = now - segmentStart;
      const progress = Math.min(
        elapsed / DRONE_SEGMENT_DURATION_MS,
        1
      );

      setDronePosition([
        from[0] + (to[0] - from[0]) * progress,
        from[1] + (to[1] - from[1]) * progress,
      ]);

      if (progress >= 1) {
        segmentIndex =
          (segmentIndex + 1) %
          droneWaypoints.length;
        segmentStart = now;
      }

      animationFrameRef.current =
        requestAnimationFrame(step);
    };

    animationFrameRef.current =
      requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(
          animationFrameRef.current
        );
        animationFrameRef.current = null;
      }
    };
  }, [droneFlying, droneWaypoints]);

  // =======================================================
  // TILE
  // =======================================================

  const tile =
    activeLayer === "Street"
      ? TILE_URLS.street
      : TILE_URLS.imagery;

  // =======================================================
  // DRONE ICON
  // =======================================================

  const droneIcon = useMemo(
    () =>
      createDroneIcon(
        droneFlying
          ? "#16A34A"
          : "#94A3B8"
      ),
    [droneFlying]
  );

  // =======================================================
  // GEOJSON STYLE
  // =======================================================

  const geoJsonStyle = {
    color: "#16A34A",
    weight: 2,
    fillColor: "transparent",
    fillOpacity: 0,
  };

  // =======================================================
  // STYLE BATAS LAHAN DEFAULT (map.geojson)
  // =======================================================

  const boundaryStyle = {
    color: "#0F766E",
    weight: 2,
    dashArray: "6 5",
    fillOpacity: 0,
  };

  // =======================================================
  // STYLE POLYGON PETAK LAHAN (data/farmland.js)
  // =======================================================

  const fillOpacityByLayer =
    activeLayer === "NDVI" ||
    activeLayer === "Kelembapan"
      ? 0.55
      : 0.28;

  const farmlandStyle = (field) => ({
    color: field.color,
    weight: 2,
    fillColor: field.color,
    fillOpacity: fillOpacityByLayer,
  });

  // =======================================================
  // GEOJSON INTERACTION
  // =======================================================

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

      click: () => {
        // Simpan Feature lengkap
        //
        // AreaDetail membaca:
        // selectedArea.properties
        //
        // MapController membaca:
        // selectedArea.geometry

        setSelectedArea(feature);
      },
    });
  };

  // =======================================================
  // RESET MAP
  // =======================================================

  const handleResetView = () => {
    setSelectedArea(null);

    setMapCenter(DEFAULT_CENTER);

    setMapZoom(DEFAULT_ZOOM);

    setFocusToken(
      (token) => token + 1
    );
  };

  // =======================================================
  // RENDER
  // =======================================================

  return (
    <div className="relative h-[500px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      {/* ===================================================
          TOOLBAR
      =================================================== */}

      <MapToolbar
        onResetView={
          handleResetView
        }
      />

      {/* ===================================================
          LAYER CONTROL
      =================================================== */}

      <LayerControl />

      {/* ===================================================
          LEGEND
      =================================================== */}

      <Legend />

      {/* ===================================================
          MAP
      =================================================== */}

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        className="h-full w-full"
      >

        {/* =================================================
            BASE MAP
        ================================================= */}

        <TileLayer
          attribution={
            tile.attribution
          }
          url={tile.url}
        />

        {/* =================================================
            DRONE IMAGERY / GEOTIFF
        ================================================= */}

        {activeLayer ===
          "Drone Imagery" &&
          geoRaster &&
          imageryReady && (
            <GeoRasterLayer
              key={
                droneImagery?.fileName
              }
              georaster={geoRaster}
              opacity={0.85}
              resolution={256}
              pixelValuesToColorFn={(
                values
              ) => {
                if (!values) {
                  return null;
                }

                const r =
                  values[0] ?? 0;

                const g =
                  values[1] ?? 0;

                const b =
                  values[2] ?? 0;

                return `rgb(${r}, ${g}, ${b})`;
              }}
            />
          )}

        {/* =================================================
            GEOJSON HASIL UPLOAD USER
        ================================================= */}

        {geoJsonData && (
          <GeoJSON
            key={
              droneImagery?.fileName
            }
            data={geoJsonData}
            style={geoJsonStyle}
            onEachFeature={
              onEachGeoJSONFeature
            }
          />
        )}

        {/* =================================================
            BATAS LAHAN DEFAULT (public/map.geojson)
            Hanya tampil selama user belum upload GeoJSON sendiri.
        ================================================= */}

        {!geoJsonData && defaultBoundary && (
          <GeoJSON
            key="default-boundary"
            data={defaultBoundary}
            style={boundaryStyle}
          />
        )}

        {/* =================================================
            PETAK LAHAN DEFAULT (data/farmland.js)
            Hanya tampil selama user belum upload GeoJSON sendiri.
        ================================================= */}

        {!geoJsonData &&
          farmland.map((field) => (
            <Polygon
              key={field.id}
              positions={field.coordinates}
              pathOptions={farmlandStyle(field)}
              eventHandlers={{
                mouseover: (event) => {
                  event.target.setStyle({ weight: 3 });
                },
                mouseout: (event) => {
                  event.target.setStyle({ weight: 2 });
                },
                click: () => {
                  setSelectedArea(farmlandToFeature(field));
                },
              }}
            >
              <Popup>
                <div className="space-y-1">
                  <h3 className="font-semibold">{field.name}</h3>
                  <p>Status: {field.status}</p>
                  <p>Komoditas: {field.crop}</p>
                  <p>Luas: {field.area}</p>
                  <p>NDVI: {field.ndvi}</p>
                  <p>Kelembapan: {field.moisture}</p>
                </div>
              </Popup>
            </Polygon>
          ))}

        {/* =================================================
            MAP CONTROLLER
        ================================================= */}

        <MapController
          selectedArea={
            selectedArea
          }
          center={mapCenter}
          zoom={mapZoom}
          focusToken={
            focusToken
          }
          geoJSON={
            geoJsonData
          }
        />

        {/* =================================================
            JALUR TERBANG DRONE
        ================================================= */}

        {droneFlying && (
          <Polyline
            positions={droneWaypoints}
            pathOptions={{
              color: "#16A34A",
              weight: 2,
              opacity: 0.75,
              dashArray: "6 6",
            }}
          />
        )}

        {/* =================================================
            DRONE MARKER
        ================================================= */}

        <Marker
          position={
            dronePosition
          }
          icon={droneIcon}
        >
          <Popup>
            <div className="space-y-1">

              <h3 className="font-semibold">
                Drone DJI Phantom 4 RTK
              </h3>

              <p>
                Status:{" "}
                {droneFlying
                  ? "Sedang Memetakan"
                  : "Standby"}
              </p>

              <p>
                Ketinggian: 120 meter
              </p>

              <p>
                Baterai: 86%
              </p>

              <p>
                Kecepatan:{" "}
                {droneFlying
                  ? "24 km/jam"
                  : "0 km/jam"}
              </p>

              <p className="text-xs text-slate-400">
                Jalur mengikuti titik tengah
                tiap blok lahan (Blok A-F).
              </p>

            </div>
          </Popup>
        </Marker>

      </MapContainer>

      {/* ===================================================
          IMAGERY STATUS
      =================================================== */}

      {activeLayer ===
        "Drone Imagery" &&
        droneImagery?.file && (
          <div className="absolute bottom-4 left-4 z-[1000] rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">

            <div className="flex items-center gap-2">

              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  imageryReady
                    ? "bg-green-500"
                    : "bg-amber-500"
                }`}
              />

              <div>

                <p className="text-sm font-semibold text-slate-800">
                  {imageryReady
                    ? "Data citra berhasil dibaca"
                    : "Membaca data citra..."}
                </p>

                <p className="max-w-[240px] truncate text-xs text-slate-500">
                  {
                    droneImagery.fileName
                  }
                </p>

                {imageryProjection && (
                  <p className="mt-1 text-xs text-slate-400">
                    CRS:{" "}
                    {
                      imageryProjection
                    }
                  </p>
                )}

              </div>

            </div>

          </div>
        )}

    </div>
  );
};

export default MapSection;