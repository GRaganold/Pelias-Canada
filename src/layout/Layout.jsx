import { Outlet } from "react-router-dom"
import { GcdsHeader, GcdsFooter, GcdsContainer } from "@cdssnc/gcds-components-react"
import "@cdssnc/gcds-components-react/gcds.css"
import Breadcrumb from "../components/Breadcrumb"
import "./Layout.css"

import TopNav from "./TopNav"

export default function Layout() {
	return (
		<>
			<GcdsHeader skipToHref="#main-content" padding="150px" height="auto">
				<div slot="skip-to-nav">
					<a className="skip-to-content-link" href="#main-content">
						Skip to main content
					</a>
				</div>
				<nav slot="menu" style={{ backgroundColor: "#f1f2f3" }}>
					<GcdsContainer size="xl" centered color="black">
						<TopNav />
					</GcdsContainer>
				</nav>
			</GcdsHeader>

			<GcdsContainer
				size="xl"
				centered
				color="black"
				style={{
					flexGrow: "1",
				}}
				padding="400"
				id="main-content"
			>
				<Breadcrumb />
				<Outlet />
			</GcdsContainer>

			<GcdsFooter
				contextualHeading="Pelias Geocoder "
				contextualLinks='{ "Geocoding Results Explanation": "geocoding-explanation", "Frequently Asked Questions": "frequently-asked-questions" }'
			/>
		</>
	)
}
