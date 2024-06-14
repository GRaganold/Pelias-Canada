import React from 'react';
import ReactDOM from 'react-dom/client'; // Correct import
import App from './App.jsx';

import './index.css';
import "@cdssnc/gcds-components-react/gcds.css";

ReactDOM.createRoot(document.getElementById('react-root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
