import Sidebar from "../components/layout/Sidebar";
import Topbar from "../components/layout/Topbar";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <div className="flex flex-col flex-1">
        <Topbar />

        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;