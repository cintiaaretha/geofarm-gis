import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Monitoring from "./pages/Monitoring";
import Drone from "./pages/Drone";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import { useAppState } from "./context/useAppState";

const pageMap = {
  Dashboard: Dashboard,
  Monitoring: Monitoring,
  Drone: Drone,
  Analytics: Analytics,
  Settings: Settings,
};

function App() {
  const { activePage } = useAppState();
  const PageComponent = pageMap[activePage] || Dashboard;

  return (
    <MainLayout>
      <PageComponent />
    </MainLayout>
  );
}

export default App;