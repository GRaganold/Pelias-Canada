import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
// import 'leaflet/dist/leaflet.css'

function App() {
  return (
    <Router basename="/Pelias-Canada">
      <AppRoutes />
    </Router>
  );
}

export default App;
