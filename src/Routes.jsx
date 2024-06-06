import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage/Landingpage';
import Layout from './layout/Layout';
import PythonAPIPage from "./pages/apiPages/PythonApiPage"
import RShinyAPIPage from "./pages/apiPages/RShinyAPIPage"

function AppRoutes() {
  return (
    <Routes> 
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="python-api" element={<PythonAPIPage />} />
        <Route path="rshiny-api" element={<RShinyAPIPage />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
