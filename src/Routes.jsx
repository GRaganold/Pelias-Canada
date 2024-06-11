import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage/Landingpage';
import Layout from './layout/Layout';
import PythonAPIPage from "./pages/apiPages/PythonApiPage"
import RShinyAPIPage from "./pages/apiPages/RShinyAPIPage"
import BulkInput from './pages/bulkInput/BulkInput';

function AppRoutes() {
  return (
    <Routes> 
      <Route path="/Pelias-Canada/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/Pelias-Canada/pythonapi" element={<PythonAPIPage />} />
        <Route path="/Pelias-Canada/rshinyapi" element={<RShinyAPIPage />} />
        <Route path="/Pelias-Canada/bulkinputs" element={<BulkInput />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;

