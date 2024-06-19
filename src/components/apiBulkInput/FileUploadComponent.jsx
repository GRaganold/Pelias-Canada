/* eslint-disable react/prop-types */
// FileUploadComponent.js
import * as ExcelJS from "exceljs"

function FileUploadComponent({ onJsonDataLoaded }) {
	const handleFileChange = async e => {
		const file = e.target.files[0]

		if (!file) {
			return
		}

		const workbook = new ExcelJS.Workbook()
		const jsonData = []

		await workbook.xlsx.load(file).then(() => {
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
		})

		console.log("JSON data:", jsonData)
		onJsonDataLoaded(jsonData) // Pass jsonData back to parent component
	}

	return (
		<div>
			<input type="file" onChange={handleFileChange} />
		</div>
	)
}

export default FileUploadComponent
