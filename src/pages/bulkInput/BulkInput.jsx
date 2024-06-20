import BulkInputFetch from "../../components/apiBulkInput/BulkInputFetch"

export default function BulkInput() {
	return (
		<>
			<h1> Bulk Input</h1>
			<div style={{ textAlign: "justify" }}>
				<p>
					This tool allows users to input multiple addresses or locations at once to get geocoding results in bulk. Users can upload a CSV file containing the addresses or directly
					input multiple addresses into a text box. The tool then processes these inputs and provides the geocoded results, which can be downloaded or viewed on the page.
				</p>
				<h3> How to use Bulk Input</h3>
				<p>
					<i>File type must be excel or csv</i>
				</p>
				<ol>
					<li> Ensure the data sheets is the first sheet in the workbook </li>
					<li>
						For any data you wish to transform, ensure the column you wish to transform is called <strong> Physical Address </strong>
					</li>
					<li>The tool cleans and formats the addresses, preparing them for geocoding</li>
					<li> Once the data is prepared and ready, the data wil be sent to the Pelias Application Programming Interface (API)</li>
					<li>After the API receives the data, it will return the results, including confidence levels and additional data</li>
					<li>Users have the option to export the results to Excel or CSV files</li>
				</ol>
			</div>
			<div id="BulkInput">
				<BulkInputFetch />
			</div>
			
		</>
	)
}
