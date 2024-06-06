/* eslint-disable no-unused-vars */
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

import {
  GcdsHeader,
  GcdsFooter,
  GcdsContainer,
  GcdsTopNav,
  GcdsNavGroup,
  GcdsNavLink,
} from '@cdssnc/gcds-components-react';
import '@cdssnc/gcds-components-react/gcds.css'; // Import the CSS file if necessary
import './Layout.css';

function Layout() {
  return (
    <>
      <GcdsHeader skipToHref="main-content" padding="150px">
        <div slot="skip-to-nav">
          <a href="#main-content" className="skip-to-content-link">
            Skip to main content
          </a>{' '}
        </div>
        <nav slot="menu">
          <GcdsTopNav label="Top navigation" alignment="right">
            <GcdsNavLink href="Pelias-Canada/" slot="home">
              Pelias Geocoder
            </GcdsNavLink>
            <GcdsNavLink href="/">Home</GcdsNavLink>
            <GcdsNavLink href="/">Bulk Inputs</GcdsNavLink>
            <GcdsNavGroup openTrigger="Features" menuLabel="Features">
              <GcdsNavLink href="#" current>
                Developers
              </GcdsNavLink>
              <GcdsNavLink href="/python-api">Python Api</GcdsNavLink>
              <GcdsNavLink href="/rshiny-api">RShiny Api</GcdsNavLink>
            </GcdsNavGroup>
          </GcdsTopNav>
        </nav>
      </GcdsHeader>

      <GcdsContainer
        size="xl"
        centered
        color="black"
        style={{
          flexGrow: '1',
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
