// Snapshot kondisi tiap petak lahan pada beberapa periode waktu.
// Dipakai untuk fitur "Monitoring Perubahan" -> membandingkan kondisi
// lahan dari waktu ke waktu (sesuai fitur di infografis GeoFarm GIS).

export const periods = [
  { id: "now", label: "Saat Ini", date: "11 Agustus 2026" },
  { id: "w1", label: "7 Hari Lalu", date: "4 Agustus 2026" },
  { id: "m1", label: "30 Hari Lalu", date: "12 Juli 2026" },
];

// statusFromNdvi -> tetapkan status + warna otomatis dari nilai NDVI,
// mengikuti kategori di infografis: 0-0.3 Buruk, 0.3-0.6 Sedang, 0.6-1.0 Baik
export const statusFromNdvi = (ndvi) => {
  if (ndvi >= 0.6) return { status: "Baik", color: "#22C55E" };
  if (ndvi >= 0.3) return { status: "Perlu Perhatian", color: "#FACC15" };
  return { status: "Prioritas", color: "#EF4444" };
};

// Delta NDVI relatif per periode untuk tiap blok (id blok -> { w1, m1 })
// Nilai positif = NDVI period tsb lebih rendah dari sekarang (artinya
// kondisi *membaik* menuju sekarang), nilai negatif = lebih tinggi dulu
// (kondisi memburuk menuju sekarang).
export const ndviDelta = {
  1: { w1: -0.03, m1: -0.09 }, // Blok A: terus membaik
  2: { w1: 0.05, m1: 0.14 },   // Blok B: sempat baik, sekarang menurun
  3: { w1: 0.08, m1: 0.21 },   // Blok C: menurun tajam -> kekeringan
  4: { w1: -0.02, m1: -0.05 }, // Blok D: stabil membaik
  5: { w1: 0.04, m1: 0.1 },    // Blok E: menurun perlahan
  6: { w1: 0.1, m1: 0.24 },    // Blok F: menurun tajam -> kekeringan
};

export const moistureDelta = {
  1: { w1: -3, m1: -6 },
  2: { w1: 6, m1: 15 },
  3: { w1: 9, m1: 20 },
  4: { w1: -2, m1: -4 },
  5: { w1: 5, m1: 12 },
  6: { w1: 11, m1: 22 },
};

export const buildFarmlandForPeriod = (farmland, periodId) => {
  if (periodId === "now") return farmland;

  return farmland.map((field) => {
    const dNdvi = ndviDelta[field.id]?.[periodId] ?? 0;
    const dMoist = moistureDelta[field.id]?.[periodId] ?? 0;

    const ndvi = Math.min(0.95, Math.max(0.1, +(field.ndvi + dNdvi).toFixed(2)));
    const moisture = Math.min(95, Math.max(10, parseInt(field.moisture) + dMoist));
    const { status, color } = statusFromNdvi(ndvi);

    return {
      ...field,
      ndvi,
      moisture: `${moisture}%`,
      status,
      color,
    };
  });
};
