export const statusFromNdvi = (ndvi) => {
  if (ndvi >= 0.6) {
    return {
      status: "Baik",
      color: "#22C55E",
    };
  }

  if (ndvi >= 0.3) {
    return {
      status: "Perlu Perhatian",
      color: "#FACC15",
    };
  }

  return {
    status: "Prioritas",
    color: "#EF4444",
  };
};