import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import parseGeoraster from "georaster";
import GeoRasterLayer from "georaster-layer-for-leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { Plane } from "lucide-react";

import { useAppState } from "../../context/useAppState";

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

const DEFAULT_CENTER = [0, 0];

const DEFAULT_ZOOM = 2;

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

    imageryBounds,
    setImageryBounds,

    imageryProjection,
    setImageryProjection,

    // -------------------------------------------------------
    // GEOJSON
    // -------------------------------------------------------

    geoJsonData,
    setGeoJsonData,
  } = useAppState();

  // =======================================================
  // LOCAL STATE
  // =======================================================

  const [geoRaster, setGeoRaster] = useState(null);

  const [mapCenter, setMapCenter] =
    useState(DEFAULT_CENTER);

  const [mapZoom, setMapZoom] =
    useState(DEFAULT_ZOOM);

  const [focusToken, setFocusToken] =
    useState(0);

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
  }, [
    droneImagery?.file,
    setDroneImagery,
    setGeoJsonData,
    setImageryReady,
    setImageryBounds,
    setImageryProjection,
  ]);

  // =======================================================
  // UPDATE DRONE POSITION
  // =======================================================

  const dronePosition = useMemo(() => {
    if (
      !droneFlying ||
      !imageryBounds
    ) {
      return null;
    }

    const {
      xmin,
      xmax,
      ymin,
      ymax,
    } = imageryBounds;

    if (
      typeof xmin !== "number" ||
      typeof xmax !== "number" ||
      typeof ymin !== "number" ||
      typeof ymax !== "number"
    ) {
      return null;
    }

    const centerLat =
      (ymin + ymax) / 2;

    const centerLng =
      (xmin + xmax) / 2;

    return [centerLat, centerLng];
  }, [
    droneFlying,
    imageryBounds,
  ]);

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
            GEOJSON
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
            DRONE MARKER
        ================================================= */}

        {dronePosition && (
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
                  Posisi visual mengikuti
                  area citra yang diunggah.
                </p>

              </div>
            </Popup>
          </Marker>
        )}

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