import { Routes, Route, HashRouter } from "react-router-dom";
import Layout from "./layout/Layout";
import BulkInput from "./pages/bulkInput/BulkInput";
import LandingPage from "./pages/landingPage/Landingpage";
import RShinyAPIPage from "./pages/apiPages/RShinyAPIPage"
import PythonAPIPage from "./pages/apiPages/PythonApiPage";
import FAQ from "./pages/FAQ/FAQ";

function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    {/* Render LandingPage component for both index and "/home" routes */}
                    <Route index element={<LandingPage />} />
                    <Route path="home" element={<LandingPage />} />
                    {/* Render BulkInput component for the "/bulkinput" route */}
                    <Route path="bulkinput" element={<BulkInput />} />
                    <Route path="rshinyapi" element={<RShinyAPIPage />} />
                    <Route path="pythonapi" element={<PythonAPIPage />} />
                    <Route path="frequentlyaskedquestions" element={<FAQ />} />

                    
                </Route>
            </Routes>
        </HashRouter>
    );
}

export default App;
