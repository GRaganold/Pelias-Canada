
import PropTypes from 'prop-types';
import { GcdsBreadcrumbs, GcdsBreadcrumbsItem } from "@cdssnc/gcds-components-react";
import "@cdssnc/gcds-components-react/gcds.css"; // Import the CSS file if necessary

export function Breadcrumb({ page, pageName }) {
    return (
        <div style = {{padding: 0, margin:0 }}>

        <GcdsBreadcrumbs hideCanadaLink fontSize="12px">
            <GcdsBreadcrumbsItem href="/">Home</GcdsBreadcrumbsItem>
            <GcdsBreadcrumbsItem href={page} >{pageName}</GcdsBreadcrumbsItem>
        </GcdsBreadcrumbs>
        </div>
    );
}

Breadcrumb.propTypes = {
    page: PropTypes.string.isRequired,
    pageName: PropTypes.string.isRequired
};
