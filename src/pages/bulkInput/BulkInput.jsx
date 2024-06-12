import { Breadcrumb } from "../../components/Breadcrum"
import GeocodeAddresses from "../../components/apiFetch/GeocodeAddresses"

export default function BulkInput() {
	return (
		<>
			<Breadcrumb page="bulkinput" pageName="Bulk Input" />
			<h1> Bulk Input</h1>
			<GeocodeAddresses />
		</>
	)
}
