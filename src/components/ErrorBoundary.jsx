import { Component } from "react";
import { AlertTriangle } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("GeoFarm GIS crash:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
          <div className="max-w-lg rounded-2xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={24} />
            </div>

            <h1 className="mb-2 text-lg font-semibold text-slate-800">
              Terjadi kesalahan pada aplikasi
            </h1>

            <p className="mb-4 text-sm text-slate-500">
              {this.state.error?.message || "Error tidak diketahui."}
            </p>

            <p className="mb-4 text-xs text-slate-400">
              Cek console browser (F12) untuk detail lengkap, lalu periksa
              data / komponen terkait.
            </p>

            <button
              onClick={() => this.setState({ error: null })}
              className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
