import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { polygonCentroid } from "../../utils/geo";

// Fokus otomatis (flyTo) tiap kali selectedArea berubah, mis. dari hasil pencarian
const MapController = ({ selectedArea, center, zoom, focusToken }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedArea) {
      const centroid = polygonCentroid(selectedArea.coordinates);
      map.flyTo(centroid, 17, { duration: 1 });
    }
  }, [selectedArea, focusToken, map]);

  useEffect(() => {
    if (!selectedArea) {
      map.flyTo(center, zoom, { duration: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusToken]);

  return null;
};

export default MapController;
