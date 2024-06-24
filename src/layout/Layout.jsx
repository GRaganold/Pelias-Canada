import { Outlet } from "react-router-dom"
import {
	GcdsHeader,
	GcdsFooter,
	GcdsContainer,
} from "@cdssnc/gcds-components-react"
import "@cdssnc/gcds-components-react/gcds.css"

import "./Layout.css"
import Breadcrumb from "../components/Breadcrum"
import TopNav from "./TopNav"

function Layout() {
	return (
		<>
			<GcdsHeader skipToHref="main-content" padding="150px">
				<div slot="skip-to-nav">
					<a href="#main-content" className="skip-to-content-link">
						Skip to main content
					</a>
				</div>
				<nav slot="menu" style={{backgroundColor:"#f1f2f3", }}>				
					<GcdsContainer size="xl" centered color="black"  >
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

			<GcdsFooter contextualHeading="Contextual navigation"></GcdsFooter>
		</>
	)
}

export default Layout
