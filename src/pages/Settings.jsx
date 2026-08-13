import { useState } from "react";
import { Bell, Ruler, Globe2, Save } from "lucide-react";

const Settings = () => {
  const [notifOn, setNotifOn] = useState(true);
  const [unit, setUnit] = useState("Ha");
  const [language, setLanguage] = useState("id");
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-6 text-lg font-semibold">Preferensi Sistem</h2>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-slate-700">Notifikasi</p>
                <p className="text-sm text-slate-400">
                  Terima peringatan area prioritas & status drone.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setNotifOn((v) => !v)}
              className={`h-7 w-12 rounded-full transition ${
                notifOn ? "bg-green-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`h-5 w-5 rounded-full bg-white transition ${
                  notifOn ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Ruler size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-slate-700">Satuan Luas</p>
                <p className="text-sm text-slate-400">Tampilan luas lahan.</p>
              </div>
            </div>

            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 outline-none focus:border-green-500"
            >
              <option value="Ha">Hektare (Ha)</option>
              <option value="m2">Meter persegi (m&sup2;)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe2 size={20} className="text-green-600" />
              <div>
                <p className="font-medium text-slate-700">Bahasa</p>
                <p className="text-sm text-slate-400">Bahasa antarmuka sistem.</p>
              </div>
            </div>

            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 outline-none focus:border-green-500"
            >
              <option value="id">Bahasa Indonesia</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 py-2.5 font-medium text-white transition hover:bg-green-700"
        >
          <Save size={18} />
          {saved ? "Tersimpan!" : "Simpan Perubahan"}
        </button>
      </form>
    </div>
  );
};

export default Settings;
