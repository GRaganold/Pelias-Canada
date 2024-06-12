/* eslint-disable no-unused-vars */

import React from "react"
import { Routes, Route, HashRouter } from "react-router-dom" // Import Routes, Route, and HashRouter
import LandingPage from "./pages/landingPage/Landingpage"
import Layout from "./layout/Layout"
import BulkInput from "./pages/bulkInput/BulkInput" // Import the BulkInput component

function App() {
	return (
		<HashRouter> {/* Wrap your entire app with HashRouter */}
			<Routes> {/* Use Routes component to define routes */}
				<Route path="/" element={<Layout />}> {/* Define a route for the root path */}
					<Route index element={<LandingPage />} /> {/* Nested route for the LandingPage inside Layout */}
					<Route path="bulkinput" element={<BulkInput />} /> {/* Nested route for BulkInput page */}
				</Route>
			</Routes>
		</HashRouter>
	)
}

export default App
