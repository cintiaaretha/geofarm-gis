import { useMemo, useState, useCallback } from "react";

import { farmland as baseFarmland } from "../data/farmland";
import { buildFarmlandForPeriod, periods } from "../data/farmlandHistory";
import { AppStateContext } from "./appStateContext.js";

export const AppStateProvider = ({ children }) => {
  // Halaman aktif (sinkron dengan Sidebar)
  const [activePage, setActivePage] = useState("Dashboard");

  // Layer peta aktif: Satelit | Street | NDVI | Kelembapan
  const [activeLayer, setActiveLayer] = useState("Satelit");

  // Periode monitoring perubahan: now | w1 | m1
  const [activePeriod, setActivePeriod] = useState("now");

  const [selectedArea, setSelectedArea] = useState(null);

  // Status drone
  const [droneFlying, setDroneFlying] = useState(true);
  const [droneBattery, setDroneBattery] = useState(86);

  // Daftar misi terjadwal
  const [missions, setMissions] = useState([]);

  // Notifikasi
  const [notifications, setNotifications] = useState([
    {
      id: "n1",
      title: "Blok C terindikasi kekeringan",
      time: "10 menit lalu",
      type: "alert",
      read: false,
    },
    {
      id: "n2",
      title: "Drone selesai memetakan Blok A",
      time: "1 jam lalu",
      type: "info",
      read: false,
    },
  ]);

  const farmland = useMemo(
    () => buildFarmlandForPeriod(baseFarmland, activePeriod),
    [activePeriod]
  );

  const addNotification = useCallback((title, type = "info") => {
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
  }, []);

  const addMission = useCallback(
    (mission) => {
      setMissions((prev) => [
        { ...mission, id: `M-${Date.now()}` },
        ...prev,
      ]);
      addNotification(`Misi baru dijadwalkan: ${mission.blockName}`, "info");
    },
    [addNotification]
  );

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

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const value = {
    activePage,
    setActivePage,
    activeLayer,
    setActiveLayer,
    activePeriod,
    setActivePeriod,
    periods,
    selectedArea,
    setSelectedArea,
    farmland,
    droneFlying,
    droneBattery,
    setDroneBattery,
    toggleDroneFlying,
    missions,
    addMission,
    notifications,
    addNotification,
    markAllNotificationsRead,
  };

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};
