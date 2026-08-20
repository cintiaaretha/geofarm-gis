// =========================================================
// CONTOH DATA LAHAN (SAMPLE / SEED DATA)
// =========================================================
//
// Dipakai sebagai data awal untuk `farmland` di AppStateContext
// supaya Dashboard, StatusChart, Analytics, dan export CSV
// langsung punya isi tanpa perlu upload data dulu.
//
// Field yang dipakai di berbagai komponen:
// - id            -> QuickActions (pilih blok misi)
// - name          -> AreaDetail, StatusChart, Analytics, CSV
// - status        -> "Baik" | "Perlu Perhatian" | "Prioritas"
// - area          -> string "xx.x Ha" (di-parseFloat di beberapa tempat)
// - crop          -> AreaDetail (komoditas)
// - ndvi          -> number 0-1, AreaDetail & Analytics
// - moisture      -> string "xx%", AreaDetail & CSV
// - temperature   -> string "xx°C", AreaDetail
// - recommendation-> AreaDetail & CSV
// - lastScan      -> AreaDetail
// =========================================================

export const sampleFarmland = [
  {
    id: 1,
    name: "Blok A1",
    status: "Baik",
    area: "12.5 Ha",
    crop: "Padi (Ciherang)",
    ndvi: 0.78,
    moisture: "68%",
    temperature: "29°C",
    recommendation:
      "Kondisi tanaman baik. Lanjutkan jadwal irigasi rutin dan pantau setiap minggu.",
    lastScan: "20 Agu 2026, 09.15",
  },
  {
    id: 2,
    name: "Blok A2",
    status: "Perlu Perhatian",
    area: "9.8 Ha",
    crop: "Padi (IR64)",
    ndvi: 0.52,
    moisture: "41%",
    temperature: "31°C",
    recommendation:
      "Kelembapan tanah mulai menurun. Pertimbangkan penambahan irigasi dalam 2-3 hari ke depan.",
    lastScan: "20 Agu 2026, 09.20",
  },
  {
    id: 3,
    name: "Blok B1",
    status: "Prioritas",
    area: "7.2 Ha",
    crop: "Jagung",
    ndvi: 0.29,
    moisture: "22%",
    temperature: "33°C",
    recommendation:
      "NDVI dan kelembapan rendah, indikasi kekeringan. Segera jadwalkan irigasi dan cek hama.",
    lastScan: "20 Agu 2026, 09.32",
  },
  {
    id: 4,
    name: "Blok B2",
    status: "Baik",
    area: "15.3 Ha",
    crop: "Padi (Ciherang)",
    ndvi: 0.81,
    moisture: "72%",
    temperature: "28°C",
    recommendation:
      "Pertumbuhan optimal. Tidak ada tindakan mendesak, lanjutkan monitoring rutin.",
    lastScan: "20 Agu 2026, 09.40",
  },
  {
    id: 5,
    name: "Blok C1",
    status: "Perlu Perhatian",
    area: "10.6 Ha",
    crop: "Kedelai",
    ndvi: 0.48,
    moisture: "38%",
    temperature: "30°C",
    recommendation:
      "Tren NDVI menurun dibanding minggu lalu. Cek kondisi lapangan dan kebutuhan pupuk.",
    lastScan: "20 Agu 2026, 09.48",
  },
];
