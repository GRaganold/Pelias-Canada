import { useState } from "react"
import PropTypes from "prop-types" // Import PropTypes for prop validation
import * as ExcelJS from "exceljs"
import Papa from "papaparse"
import Loading from "../Loading"

function FileUploadComponent({ onJsonDataLoaded }) {
	const [loading, setLoading] = useState(false)

	const handleFileChange = async e => {
		const file = e.target.files[0]

		if (!file) {
			return
		}

		setLoading(true) // Set loading state to true during file processing

		const jsonData = []

		try {
			if (file.name.endsWith(".xlsx")) {
				const workbook = new ExcelJS.Workbook()
				await workbook.xlsx.load(file)
				const worksheet = workbook.worksheets[0] // assuming we are working with the first sheet

				// Get the headers (first row) from the worksheet
				const headers = worksheet.getRow(1).values

				// Iterate through each filled row starting from the second row (index 2)
				worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
					if (rowNumber === 1) return // Skip header row

					const rowData = {}

					// Iterate through each cell in the row and map to headers
					row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
						const header = headers[colNumber] // Adjust index to match zero-based array
						rowData[header] = cell.value
					})

					jsonData.push(rowData)
				})
			} else if (file.name.endsWith(".csv")) {
				const csvText = await file.text()
				const results = Papa.parse(csvText, { header: true })

				jsonData.push(...results.data)
			} else {
				throw new Error("Unsupported file type")
			}

			console.log("JSON data:", jsonData)
			onJsonDataLoaded(jsonData) // Pass jsonData back to parent component
		} catch (error) {
			console.error("Error parsing file:", error)
			// Handle error as per your application's requirements (e.g., show error message)
		} finally {
			setLoading(false) // Set loading state to false after processing
		}
	}

	return (
		<section aria-labelledby="input">
			<div id="BulkInput">
				<form>
					<label htmlFor="file">Upload Excel or CSV</label>
					<br />
					<input id="file" type="file" onChange={handleFileChange} />
				</form>
			</div>
			{loading && <Loading />} {/* Show loading indicator while processing */}
		</section>
	)
}

// PropTypes validation
FileUploadComponent.propTypes = {
	onJsonDataLoaded: PropTypes.func.isRequired, // Ensure onJsonDataLoaded is a function and is required
}

export default FileUploadComponent
