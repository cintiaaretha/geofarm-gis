import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

// =========================================================
// MAP CONTROLLER
// =========================================================
// Tugas:
// 1. Fokus ke GeoJSON yang dipilih
// 2. Fokus ke posisi/bounds saat data baru diproses
// 3. Tidak menggunakan koordinat lahan hardcode
// =========================================================

const MapController = ({
  selectedArea,
  center,
  zoom,
  focusToken,
}) => {
  const map = useMap();

  // =======================================================
  // FOKUS KE AREA GEOJSON YANG DIPILIH
  // =======================================================

  useEffect(() => {
    if (!selectedArea) return;

    if (selectedArea.geometry) {
      try {
        const layer = L.geoJSON(selectedArea);
        const bounds = layer.getBounds();

        if (bounds.isValid()) {
          map.flyToBounds(bounds, {
            padding: [40, 40],
            duration: 1,
          });
        }
      } catch (error) {
        console.error(
          "Gagal memfokuskan GeoJSON:",
          error
        );
      }
    }
  }, [selectedArea, map]);

  // =======================================================
  // FOKUS SAAT DATA BARU SELESAI DIPROSES
  // =======================================================

  useEffect(() => {
    if (!focusToken) return;
    if (selectedArea) return;

    if (
      Array.isArray(center) &&
      center.length === 2 &&
      typeof zoom === "number"
    ) {
      map.flyTo(center, zoom, {
        duration: 1,
      });
    }
  }, [
    focusToken,
    selectedArea,
    center,
    zoom,
    map,
  ]);

  return null;
};

export default MapController;