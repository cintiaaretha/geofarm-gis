export const polygonCentroid = (coordinates) => {
  const total = coordinates.reduce(
    (acc, [lat, lng]) => {
      acc[0] += lat;
      acc[1] += lng;
      return acc;
    },
    [0, 0]
  );

  return [
    total[0] / coordinates.length,
    total[1] / coordinates.length,
  ];
};


// Warna berdasarkan tingkat kelembapan tanah
export const moistureColor = (moistureStr) => {
  const value = parseInt(moistureStr, 10) || 0;
  if (value >= 60) {
    return "#22C55E"; // hijau = kelembapan baik
  }
  if (value >= 40) {
    return "#FACC15"; // kuning = perlu perhatian
  }
  return "#EF4444"; // merah = terlalu kering
};

// =========================================================
// FARMLAND -> GEOJSON FEATURE
// =========================================================
//
// data/farmland.js menyimpan `coordinates` sebagai [lat, lng]
// (format yang dipakai Leaflet <Polygon positions={...} />).
//
// GeoJSON butuh urutan [lng, lat], jadi perlu dibalik dulu
// supaya MapController (yang pakai L.geoJSON(...).getBounds())
// bisa fokus/flyTo dengan benar, dan AreaDetail bisa baca
// selectedArea.properties secara konsisten baik untuk field
// default maupun feature hasil upload GeoJSON user.
// =========================================================
export const farmlandToFeature = (field) => ({
  type: "Feature",
  properties: field,
  geometry: {
    type: "Polygon",
    coordinates: [field.coordinates.map(([lat, lng]) => [lng, lat])],
  },
});

// =========================================================
// TITIK TENGAH DEFAULT PETA
// =========================================================
//
// Dipakai sebagai center/zoom awal MapContainer supaya peta
// langsung fokus ke area lahan (data/farmland.js), bukan ke
// [0, 0] (tengah lautan) seperti sebelumnya.
// =========================================================
export const farmlandDefaultView = (farmland, fallbackZoom = 15) => {
  const points = farmland.flatMap((field) => field.coordinates);

  if (!points.length) {
    return { center: [0, 0], zoom: 2 };
  }

  const center = points.reduce(
    (acc, [lat, lng]) => [acc[0] + lat / points.length, acc[1] + lng / points.length],
    [0, 0]
  );

  return { center, zoom: fallbackZoom };
};