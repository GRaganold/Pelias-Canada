import { Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage/Landingpage';
import Layout from './layout/Layout';
import PythonAPIPage from "./pages/apiPages/PythonApiPage"
import RShinyAPIPage from "./pages/apiPages/RShinyAPIPage"
import BulkInput from './pages/bulkInput/BulkInput';

function AppRoutes() {
  return (
    <Routes> 
      <Route path="/" element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="/pythonapi" element={<PythonAPIPage />} />
        <Route path="/rshinyapi" element={<RShinyAPIPage />} />
        <Route path="/bulkinputs" element={<BulkInput />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
