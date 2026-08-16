import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { polygonCentroid } from "../../utils/geo";

const MapController = ({
  selectedArea,
  center,
  zoom,
  focusToken,
}) => {
  
  const map = useMap();
  // Fokus ke area yang dipilih
  useEffect(() => {
    if (!selectedArea?.coordinates) {
      return;
    }
    const centroid = polygonCentroid(
      selectedArea.coordinates
    );
    map.flyTo(centroid, 17, {
      duration: 1,
    });
  }, [selectedArea, map]);
  // Reset kembali ke posisi awal
  useEffect(() => {
    if (!focusToken) {
      return;
    }
    if (!selectedArea) {
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