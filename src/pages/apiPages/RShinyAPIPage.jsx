import { GcdsHeading } from "@cdssnc/gcds-components-react"
import "@cdssnc/gcds-components-react/gcds.css" // Import the CSS file if necessary
import { Breadcrumb } from "../../components/Breadcrum"

export default function RShinyAPIPage() {
	return (
		<>
        <Breadcrumb page="rshinyapi" pageName="R Shiny API"/>
			<GcdsHeading tag="h2" marginTop="50">R Shiny API</GcdsHeading>
			<div style={{ textAlign: "justify" }}>
				<p>
					{" "}
					Developing in-house geolocation services within PHAC to improve accuracy, precision, cost-effectiveness, security, and transparency. Phases include tech exploration,
					prototyping, refining based on user interaction, and expanding coverage. Advantages include enhanced privacy, cost savings, traceability, independence from external
					resources, flexibility, and modularity. Avoids reliance on third-party services, ensuring data stays within PHAC`s network and reducing costs associated with external
					queries.
				</p>
			</div>
			{/* RShiny code will go here
      <div>
      </div>
       */}
		</>
	)
}
