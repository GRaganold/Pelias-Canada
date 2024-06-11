import { Outlet } from "react-router-dom";
import {
  GcdsHeader,
  GcdsFooter,
  GcdsContainer,
  GcdsTopNav,
  GcdsNavGroup,
  GcdsNavLink,
} from "@cdssnc/gcds-components-react";
import "@cdssnc/gcds-components-react/gcds.css";
import "./Layout.css";

const baseURL = "/Pelias-Canada/";
const links = {
  home: baseURL,
  bulkInputs: `${baseURL}bulkinputs`,
  pythonApi: `${baseURL}pythonapi`,
  rshinyApi: `${baseURL}rshinyapi`,
};

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
            <GcdsNavLink href={links.home} slot="home">
              Pelias Geocoder
            </GcdsNavLink>
            <GcdsNavLink href={links.home}>Home</GcdsNavLink>            
            <GcdsNavLink href={links.bulkInputs}>Bulk Inputs</GcdsNavLink>            
            <GcdsNavGroup openTrigger="Features" menuLabel="Features">
              <GcdsNavLink href="#" current>
                Developers
              </GcdsNavLink>
              <GcdsNavLink href={links.rshinyApi}>RShiny Api</GcdsNavLink>
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
        <Outlet />
      </GcdsContainer>
      <GcdsFooter contextualHeading="Contextual navigation"></GcdsFooter>
    </>
  );
}

export default Layout;
