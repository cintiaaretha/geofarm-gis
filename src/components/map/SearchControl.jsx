import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { GeoSearchControl, OpenStreetMapProvider } from "leaflet-geosearch";

const SearchControl = () => {
  const map = useMap();

  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    const searchControl = new GeoSearchControl({
      provider,
      style: "bar",
      showMarker: true,
      showPopup: false,
      retainZoomLevel: true,
      autoClose: true,
      searchLabel: "Cari lokasi...",
    });

    map.addControl(searchControl);

    return () => map.removeControl(searchControl);
  }, [map]);

  return null;
};

export default SearchControl;