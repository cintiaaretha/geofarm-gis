import { useContext } from "react";
import { AppStateContext } from "./appStateContext.js";

export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) throw new Error("useAppState harus dipakai di dalam AppStateProvider");
  return ctx;
};
