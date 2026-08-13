export const polygonCentroid = (coordinates) => {
  const total = coordinates.reduce(
    (acc, [lat, lng]) => {
      acc[0] += lat;
      acc[1] += lng;
      return acc;
    },
    [0, 0]
  );

  return [total[0] / coordinates.length, total[1] / coordinates.length];
};

// Tentukan warna petak berdasarkan tingkat kelembapan (%) untuk layer "Kelembapan"
export const moistureColor = (moistureStr) => {
  const value = parseInt(moistureStr, 10) || 0;
  if (value >= 60) return "#3B82F6"; // biru = lembap cukup
  if (value >= 40) return "#FACC15"; // kuning = sedang
  return "#EF4444"; // merah = kering
};
