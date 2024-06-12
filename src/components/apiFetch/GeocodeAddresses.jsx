import { useState } from "react"
import ExcelJS from "exceljs"
import { GcdsButton } from "@cdssnc/gcds-components-react"
import "@cdssnc/gcds-components-react/gcds.css" // Import the CSS file if necessary

const GeocodeAddresses = () => {
	const [addresses, setAddresses] = useState([])
	const [results, setResults] = useState([])
	const [progress, setProgress] = useState(0)
	const [isProcessing, setIsProcessing] = useState(false)

	const handleFileUpload = async event => {
		console.log("File uploaded")
		const file = event.target.files[0]
		const workbook = new ExcelJS.Workbook()
		await workbook.xlsx.load(file)
		const worksheet = workbook.getWorksheet(1)
		const jsonData = []

		worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
			if (rowNumber > 1) {
				jsonData.push({ Address: row.getCell(1).value })
			}
		})

		console.log("Extracted addresses:", jsonData)
		setAddresses(jsonData)
		setProgress(0)
		setIsProcessing(false)
	}

	const sendAddressesToApi = async () => {
		setIsProcessing(true)
		const totalAddresses = addresses.length
		let completedAddresses = 0

		const results = await Promise.all(
			addresses.map(async address => {
				const fullAddress = address.Address
				console.log("Sending address to API:", fullAddress)
				try {
					const response = await fetch(`https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(fullAddress)}`)
					if (!response.ok) {
						throw new Error(`HTTP error! status: ${response.status}`)
					}
					const data = await response.json()
					console.log("Received response for address:", fullAddress, data)

					return { address: fullAddress, data }
				} catch (error) {
					console.error("Error:", error)
					return null
				} finally {
					completedAddresses++
					setProgress((completedAddresses / totalAddresses) * 100)
				}
			})
		)

		console.log("Final results:", results)
		const filteredResults = results.filter(result => result !== null)
		setResults(filteredResults)
		setIsProcessing(false)
	}

	const resetProgressBar = () => {
		setProgress(0)
		setResults([])
	}

	const exportToCSV = () => {
		const csvContent = results
			.map(result => {
				const inputAddress = result.address
				const feature = result.data.features[0]
				const confidence = feature.properties.confidence.toFixed(2)
				const matchType = feature.properties.match_type
				const accuracy = feature.properties.accuracy
				const source = feature.properties.source
				const longitude = feature.geometry.coordinates[0]
				const latitude = feature.geometry.coordinates[1]

				return `${inputAddress} ,${confidence}%, ${matchType}, ${accuracy}, ${source}, ${longitude}, ${latitude}`
			})
			.join("\n")

		const blob = new Blob([csvContent], { type: "text/csv" })
		const link = document.createElement("a")
		link.href = window.URL.createObjectURL(blob)
		link.download = "geocoding_results.csv"
		link.click()
	}

	const exportToExcel = () => {
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Geocoding Results")

		worksheet.addRow(["Address", "Confidence", "Match Type", "Accuracy", "Source", "Longitude", "Latitude"])

		results.forEach(result => {
			const inputAddress = result.address
			const feature = result.data.features[0]
			const confidence = feature.properties.confidence.toFixed(2)
			const matchType = feature.properties.match_type
			const accuracy = feature.properties.accuracy
			const source = feature.properties.source
			const longitude = feature.geometry.coordinates[0]
			const latitude = feature.geometry.coordinates[1]

			worksheet.addRow([inputAddress, `${confidence}%`, matchType, accuracy, source, longitude, latitude])
		})

		workbook.xlsx.writeBuffer().then(buffer => {
			const blob = new Blob([buffer], {
				type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
			})
			const link = document.createElement("a")
			link.href = window.URL.createObjectURL(blob)
			link.download = "geocoding_results.xlsx"
			link.click()
		})
	}

	const count_85_to_100 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.85).length
	const count_84_to_51 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.51 && result.data?.features?.[0]?.properties?.confidence < 0.84).length
	const count_0_to_50 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0 && result.data?.features?.[0]?.properties?.confidence <= 0.5).length

	return (
		<div>
			<input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
			<GcdsButton
				size="small"
				onClick={() => {
					resetProgressBar()
					sendAddressesToApi()
				}}
			>
				Send Addresses to API
			</GcdsButton>
			{isProcessing && (
				<div style={{ width: "100%", backgroundColor: "#ddd", marginTop: "10px" }}>
					<div
						style={{
							width: `${progress}%`,
							height: "24px",
							backgroundColor: progress === 100 ? "green" : "blue",
							textAlign: "center",
							lineHeight: "24px",
							color: "white",
						}}
					>
						{Math.round(progress)}%
					</div>
				</div>
			)}
			<br />
			{results.length > 0 && (
				<>
					<div style={{ padding: "20px 0" }}>
						{" "}
						{/* Added vertical padding of 20px */}
						<GcdsButton size="small" onClick={exportToCSV}>
							Export to CSV
						</GcdsButton>
						
							{" "}
							{/* Added top padding of 20px */}
							<GcdsButton size="small" onClick={exportToExcel}>
								Export to Excel
							</GcdsButton>
						
					</div>

					<div>
						<strong>Results Count:</strong>
						<div>85+%: {count_85_to_100}</div>
						<div>51-84%: {count_84_to_51}</div>
						<div>0-50%: {count_0_to_50}</div>
					</div>
					<h2>Results preview:</h2>
					<div style={{ maxHeight: "300px", overflowY: "auto" }}>
						<ul>
							{results.map((result, index) => (
								<li key={index}>
									{result.address && <strong>Address:</strong>} {result.address} <br />
									{result.data && result.data.features && result.data.features.length > 0 && result.data.features[0].properties && (
										<>
											<strong>Confidence:</strong> {result.data.features[0].properties.confidence.toFixed(2)}% <br />
											<strong>Match Type:</strong> {result.data.features[0].properties.match_type} <br />
											<strong>Accuracy:</strong> {result.data.features[0].properties.accuracy} <br />
											<strong>Source:</strong> {result.data.features[0].properties.source} <br />
											<strong>Longitude:</strong> {result.data.features[0].geometry.coordinates[0]} <br />
											<strong>Latitude:</strong> {result.data.features[0].geometry.coordinates[1]} <br />
										</>
									)}
								</li>
							))}
						</ul>
					</div>
				</>
			)}
		</div>
	)
}

export default GeocodeAddresses
