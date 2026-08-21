import { useState, useCallback, useMemo } from "react";

import { AppStateContext } from "./appStateContext.js";
import { farmland as defaultFarmland } from "../data/farmland.js";
import {
  periods as historyPeriods,
  buildFarmlandForPeriod,
} from "../data/farmlandHistory.js";

export const AppStateProvider = ({ children }) => {
  // =========================================================
  // HALAMAN AKTIF
  // =========================================================

  const [activePage, setActivePage] =
    useState("Dashboard");

  // =========================================================
  // LAYER PETA
  //
  // Satelit
  // Street
  // Drone Imagery
  // NDVI
  // Kelembapan
  // =========================================================

  const [activeLayer, setActiveLayer] =
    useState("Satelit");

  // =========================================================
  // PERIODE MONITORING
  //
  // Dipakai PeriodSelector untuk membandingkan data
  // antar rentang waktu, sesuai snapshot di
  // data/farmlandHistory.js.
  // =========================================================

  const [periods] = useState(historyPeriods);

  const [activePeriod, setActivePeriod] = useState("now");

  // =========================================================
  // AREA LAHAN TERPILIH
  //
  // Berasal dari hasil data GeoJSON / hasil analisis,
  // bukan dari koordinat hardcode.
  // =========================================================

  const [selectedArea, setSelectedArea] =
    useState(null);

  // =========================================================
  // DATA LAHAN HASIL PEMROSESAN
  // =========================================================
  //
  // Awalnya kosong.
  //
  // Setelah user upload data:
  //
  // GeoJSON / GeoTIFF
  //        ↓
  // pemrosesan
  //        ↓
  // farmland
  //
  // Data ini nantinya dapat berisi:
  //
  // - geometry
  // - luas
  // - NDVI
  // - kelembapan
  // - status
  // - rekomendasi
  // - dan informasi lainnya
  //
  // =========================================================

  const [farmland, setFarmland] =
    useState(defaultFarmland);

  // =========================================================
  // FARMLAND SESUAI PERIODE AKTIF
  // =========================================================
  //
  // Menggabungkan `farmland` (data dasar / hasil pemrosesan)
  // dengan delta NDVI & kelembapan dari data/farmlandHistory.js
  // sesuai periode yang dipilih di PeriodSelector.
  //
  // Inilah yang dipakai di seluruh app (peta, statistik, chart)
  // supaya semua ikut berubah saat periode diganti.
  // =========================================================

  const farmlandForPeriod = useMemo(
    () => buildFarmlandForPeriod(farmland, activePeriod),
    [farmland, activePeriod]
  );

  // =========================================================
  // STATUS DRONE
  // =========================================================

  const [droneFlying, setDroneFlying] =
    useState(false);

  const [droneBattery, setDroneBattery] =
    useState(86);

  // =========================================================
  // FILE CITRA DRONE
  // =========================================================
  //
  // File:
  //
  // .tif
  // .tiff
  //
  // =========================================================

  const [imageryFile, setImageryFile] =
    useState(null);

  // =========================================================
  // HASIL PARSING GEOTIFF
  // =========================================================
  //
  // Berisi object GeoRaster hasil pembacaan
  // file GeoTIFF.
  //
  // =========================================================

  const [droneImagery, setDroneImagery] =
    useState(null);

  // =========================================================
  // STATUS CITRA
  // =========================================================

  const [imageryReady, setImageryReady] =
    useState(false);

  // =========================================================
  // BOUNDS CITRA
  // =========================================================
  //
  // Berasal dari metadata GeoTIFF.
  //
  // Tidak ada koordinat hardcode.
  //
  // {
  //   xmin,
  //   xmax,
  //   ymin,
  //   ymax
  // }
  //
  // =========================================================

  const [imageryBounds, setImageryBounds] =
    useState(null);

  // =========================================================
  // CRS / PROJECTION
  // =========================================================
  //
  // Berasal dari metadata file.
  //
  // =========================================================

  const [imageryProjection, setImageryProjection] =
    useState(null);

  // =========================================================
  // GEOJSON
  // =========================================================
  //
  // User dapat meng-upload GeoJSON sebagai:
  //
  // - batas lahan
  // - polygon area
  // - hasil pemetaan
  //
  // =========================================================

  const [geoJsonFile, setGeoJsonFile] =
    useState(null);

  const [geoJsonData, setGeoJsonData] =
    useState(null);

  // =========================================================
  // HASIL ANALISIS
  // =========================================================
  //
  // Menyimpan hasil processing citra.
  //
  // Contoh struktur nantinya:
  //
  // {
  //   ndvi: ...,
  //   moisture: ...,
  //   status: ...,
  //   recommendation: ...,
  //   statistics: ...
  // }
  //
  // =========================================================

  const [analysisResult, setAnalysisResult] =
    useState(null);

  // =========================================================
  // STATUS ANALISIS
  // =========================================================

  const [analysisReady, setAnalysisReady] =
    useState(false);

  // =========================================================
  // MISI DRONE
  // =========================================================

  const [missions, setMissions] =
    useState([]);

  // =========================================================
  // NOTIFIKASI
  // =========================================================

  const [notifications, setNotifications] =
    useState([
      {
        id: "n1",
        title: "Menunggu data citra lahan",
        time: "Sekarang",
        type: "info",
        read: false,
      },
    ]);

  // =========================================================
  // NOTIFICATION FUNCTIONS
  // =========================================================

  const addNotification = useCallback(
    (title, type = "info") => {
      setNotifications((prev) => [
        {
          id: `n-${Date.now()}`,
          title,
          time: "Baru saja",
          type,
          read: false,
        },
        ...prev,
      ]);
    },
    []
  );

  // =========================================================
  // MISSION FUNCTIONS
  // =========================================================

  const addMission = useCallback(
    (mission) => {
      setMissions((prev) => [
        {
          ...mission,
          id: `M-${Date.now()}`,
        },
        ...prev,
      ]);

      addNotification(
        `Misi baru dijadwalkan: ${mission.blockName}`,
        "info"
      );
    },
    [addNotification]
  );

  // =========================================================
  // DRONE FUNCTIONS
  // =========================================================

  const toggleDroneFlying = useCallback(() => {
    setDroneFlying((prev) => {
      const next = !prev;

      addNotification(
        next
          ? "Drone diberangkatkan untuk memetakan lahan"
          : "Drone dihentikan / kembali ke home point",
        "info"
      );

      return next;
    });
  }, [addNotification]);

  // =========================================================
  // RESET HASIL ANALISIS
  // =========================================================
  //
  // Dipakai ketika user mengganti file citra.
  //
  // =========================================================

  const resetAnalysis = useCallback(() => {
    setFarmland([]);
    setSelectedArea(null);
    setAnalysisResult(null);
    setAnalysisReady(false);
  }, []);

  // =========================================================
  // NOTIFICATION READ
  // =========================================================

  const markAllNotificationsRead =
    useCallback(() => {
      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          read: true,
        }))
      );
    }, []);

  // =========================================================
  // GLOBAL APP STATE
  // =========================================================

  const value = {
    // -------------------------------------------------------
    // HALAMAN
    // -------------------------------------------------------

    activePage,
    setActivePage,

    // -------------------------------------------------------
    // LAYER
    // -------------------------------------------------------

    activeLayer,
    setActiveLayer,

    // -------------------------------------------------------
    // PERIODE
    // -------------------------------------------------------

    periods,
    activePeriod,
    setActivePeriod,

    // -------------------------------------------------------
    // AREA
    // -------------------------------------------------------

    selectedArea,
    setSelectedArea,

    // -------------------------------------------------------
    // DATA LAHAN
    // -------------------------------------------------------
    //
    // `farmland` yang diekspos ke seluruh app sudah disesuaikan
    // dengan periode aktif (lihat farmlandForPeriod di atas).
    // `setFarmland` tetap mengubah data dasar (periode "now").
    // -------------------------------------------------------

    farmland: farmlandForPeriod,
    setFarmland,

    // -------------------------------------------------------
    // DRONE
    // -------------------------------------------------------

    droneFlying,
    droneBattery,
    setDroneBattery,
    toggleDroneFlying,

    // -------------------------------------------------------
    // CITRA DRONE
    // -------------------------------------------------------

    imageryFile,
    setImageryFile,

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

    geoJsonFile,
    setGeoJsonFile,

    geoJsonData,
    setGeoJsonData,

    // -------------------------------------------------------
    // ANALISIS
    // -------------------------------------------------------

    analysisResult,
    setAnalysisResult,

    analysisReady,
    setAnalysisReady,

    resetAnalysis,

    // -------------------------------------------------------
    // MISI
    // -------------------------------------------------------

    missions,
    addMission,

    // -------------------------------------------------------
    // NOTIFIKASI
    // -------------------------------------------------------

    notifications,
    addNotification,
    markAllNotificationsRead,
  };

  // =========================================================
  // PROVIDER
  // =========================================================

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};