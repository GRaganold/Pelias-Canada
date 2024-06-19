import { Outlet, Link } from "react-router-dom"
import { GcdsHeader, GcdsFooter, GcdsContainer, GcdsTopNav, GcdsNavGroup, GcdsNavLink } from "@cdssnc/gcds-components-react"
import "@cdssnc/gcds-components-react/gcds.css"

import "./Layout.css"
import Breadcrumb from "../components/Breadcrum"

function Layout() {
	return (
		<>
			<GcdsHeader skipToHref="main-content" padding="150px">
				<div slot="skip-to-nav">
					<a href="#main-content" className="skip-to-content-link">
						Skip to main content
					</a>
				</div>
				<nav slot="menu">
					<GcdsTopNav label="Top navigation" alignment="right">
						<GcdsNavLink slot="home">
							<Link to="home" className="nav-link" style={{ fontWeight: "bold" }}>
								Pelias Geocoder
							</Link>
						</GcdsNavLink>
						<GcdsNavLink>
							<Link to="home" className="nav-link">
								Home
							</Link>
						</GcdsNavLink>
						<GcdsNavLink>
							<Link to="bulkinput" className="nav-link">
								Bulk Input
							</Link>
						</GcdsNavLink>
						<GcdsNavGroup openTrigger="Features" menuLabel="Features">
							<GcdsNavLink href="#" current>
								Developers
							</GcdsNavLink>
							<GcdsNavLink>
								<Link to="rshinyapi" className="nav-link">
									RShiny Api
								</Link>
							</GcdsNavLink>
							<GcdsNavLink>
								<Link to="pythonapi" className="nav-link">
									Python Api
								</Link>
							</GcdsNavLink>
						</GcdsNavGroup>
					</GcdsTopNav>
				</nav>
			</GcdsHeader>

			<GcdsContainer
				size="xl"
				centered
				color="black"
				style={{
					flexGrow: "1",
				}}
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
