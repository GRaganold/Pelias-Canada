import { useState, useEffect, useCallback } from "react"
import PropTypes from "prop-types"
import ExcelJS from "exceljs"
import { GcdsButton, GcdsDetails } from "@cdssnc/gcds-components-react"
import MapComponentOL from "../MapComponent"

const FileProcessorComponent = ({ jsonData }) => {
	const [processedData, setProcessedData] = useState([])
	const [physicalAddressArray, setPhysicalAddressArray] = useState([])
	const [apiResponses, setApiResponses] = useState({})
	const [isProcessing, setIsProcessing] = useState(false)
	const [progress, setProgress] = useState(0)
	const [results, setResults] = useState([])
	const [returnedCount, setReturnedCount] = useState(0)
	const [exportTitle, setExportTitle] = useState("")

	const inputCount = jsonData.length

	const replaceSpecialCharacters = str => {
		if (typeof str !== "string") return ""
		return str.replace(/[^\w\s-]/gi, "")
	}

	const processJsonData = useCallback(() => {
		if (!jsonData || jsonData.length === 0) return []

		const allHeaders = new Set()
		const processedLines = jsonData.map(row => {
			const processedRow = {}

			Object.keys(row).forEach(key => {
				if (key === "Physical Address" && Object.keys(row).includes("Physical Address")) {
					processedRow[key] = replaceSpecialCharacters(row[key].replace(/\n/g, " "))
				} else {
					processedRow[key] = row[key] || ""
				}
				allHeaders.add(key)
			})

			return processedRow
		})

		const physicalAddresses = processedLines.map(row => row["Physical Address"])
		setProcessedData(processedLines)
		setPhysicalAddressArray(physicalAddresses)

		return processedLines
	}, [jsonData])

	useEffect(() => {
		if (jsonData && jsonData.length > 0) {
			const processedDataToSend = processJsonData()
			if (processedDataToSend.length > 0) {
				sendAddressesToApi()
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [jsonData, processJsonData])

	const sendAddressesToApi = useCallback(async () => {
		setIsProcessing(true)
		const totalAddresses = physicalAddressArray.length
		let completedAddresses = 0
		const results = []

		const MAX_RETRY = 3

		const fetchWithRetry = async (url, retries = MAX_RETRY, delay = 200) => {
			try {
				const response = await fetch(url)
				if (!response.ok) {
					if (retries > 0 && response.status >= 500 && response.status < 600) {
						console.warn(`Retrying ${url}, ${retries} retries left`)
						await new Promise(resolve => setTimeout(resolve, delay))
						return fetchWithRetry(url, retries - 1, delay)
					} else {
						throw new Error(`HTTP error! status: ${response.status}`)
					}
				}
				return response.json()
			} catch (error) {
				console.error("Error:", error)
				return null
			}
		}

		const processAddress = async address => {
			try {
				const apiUrl = `https://geocoder.alpha.phac.gc.ca/api/v1/search?text=${encodeURIComponent(address)}`
				const responseData = await fetchWithRetry(apiUrl)

				if (responseData) {
					console.log(`API call response for address ${address}:`, responseData)
					setApiResponses(prevResponses => ({
						...prevResponses,
						[address]: responseData,
					}))
					results.push({ address, data: responseData })
				} else {
					console.error(`Failed to make API call for address ${address} after ${MAX_RETRY} attempts`)
					results.push({ address, error: `Failed to fetch after ${MAX_RETRY} retries` })
				}
			} catch (error) {
				console.error(`Error making API call for address ${address}:`, error)
				results.push({ address, error: error.message })
			} finally {
				completedAddresses++
				const currentProgress = (completedAddresses / totalAddresses) * 100
				setProgress(currentProgress)
			}
		}

		for (const address of physicalAddressArray) {
			await processAddress(address)
		}

		console.log("Final results:", results)
		setIsProcessing(false)
		setReturnedCount(results.length)
		setResults(results)
	}, [physicalAddressArray])

	useEffect(() => {
		if (processedData.length > 0) {
			sendAddressesToApi()
		}
	}, [processedData, sendAddressesToApi])

	const count_85_to_100 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.85).length
	const count_84_to_51 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.51 && result.data?.features?.[0]?.properties?.confidence < 0.85).length
	const count_0_to_50 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0 && result.data?.features?.[0]?.properties?.confidence < 0.51).length

	const display_0_to_50 = useCallback(() => {
		const filteredResults = results.filter(result => {
			const confidence = result.data?.features?.[0]?.properties?.confidence
			return confidence !== undefined && confidence >= 0 && confidence < 0.51
		})

		if (filteredResults.length !== 0)
			return (
				<div>
					<h2>Addresses below 50% confidence</h2>
					<ul>
						{filteredResults.map((result, index) => (
							<li key={index}>
								<strong>Address:</strong> {result.address} <br />
							</li>
						))}
					</ul>
				</div>
			)
		return null
	}, [results])

	const exportToExcel = useCallback(async () => {
		const workbook = new ExcelJS.Workbook()
		const worksheet = workbook.addWorksheet("Geocoding Results")

		worksheet.addRow(["Address", "Confidence", "Match Type", "Accuracy", "Source", "Longitude", "Latitude"])

		for (const result of results) {
			if (!result.data || !result.data.features || !result.data.features[0] || !result.data.features[0].properties) {
				worksheet.addRow([result.address, "", "", "", "", "", ""])
				continue
			}

			const inputAddress = result.address
			const feature = result.data.features[0]
			const confidence = feature.properties.confidence ? feature.properties.confidence.toFixed(2) : ""
			const matchType = feature.properties.match_type || ""
			const accuracy = feature.properties.accuracy || ""
			const source = feature.properties.source || ""
			const longitude = feature.geometry.coordinates ? feature.geometry.coordinates[0] : ""
			const latitude = feature.geometry.coordinates ? feature.geometry.coordinates[1] : ""

			worksheet.addRow([inputAddress, `${confidence}%`, matchType, accuracy, source, longitude, latitude])
		}

		const buffer = await workbook.xlsx.writeBuffer()
		const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
		const link = document.createElement("a")
		link.href = window.URL.createObjectURL(blob)
		link.download = `${exportTitle || "export"}_geocoding_results.xlsx`
		link.click()
	}, [results, exportTitle])

	const exportToCSV = useCallback(() => {
		const headers = ["Address", "Confidence", "Match Type", "Accuracy", "Source", "Longitude", "Latitude"]
		const csvContent = [
			headers.join(","),
			...results.map(result => {
				if (!result.data || !result.data.features || !result.data.features[0] || !result.data.features[0].properties) {
					return `${result.address},,,,,"",""`
				}

				const inputAddress = result.address
				const feature = result.data.features[0]
				const confidence = feature.properties.confidence ? feature.properties.confidence.toFixed(2) : ""
				const matchType = feature.properties.match_type || ""
				const accuracy = feature.properties.accuracy || ""
				const source = feature.properties.source || ""
				const longitude = feature.geometry.coordinates ? feature.geometry.coordinates[0] : ""
				const latitude = feature.geometry.coordinates ? feature.geometry.coordinates[1] : ""

				return `${inputAddress},${confidence}%,${matchType},${accuracy},${source},${longitude},${latitude}`
			}),
		].join("\n")

		downloadCSV(csvContent)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [results])

	const downloadCSV = useCallback(
		csvContent => {
			const blob = new Blob([csvContent], { type: "text/csv" })
			const link = document.createElement("a")
			link.href = window.URL.createObjectURL(blob)
			link.download = `${exportTitle || "export"}_geocoding_results.csv`
			link.click()
		},
		[exportTitle]
	)

	const mapContentJSON = Object.keys(apiResponses).map(address => {
		const result = apiResponses[address]
		const feature = result?.features?.[0] ?? {}
		const properties = feature?.properties ?? {}
		const geometry = feature?.geometry ?? {}

		const longitude = geometry.coordinates ? geometry.coordinates[0] : "N/A"
		const latitude = geometry.coordinates ? geometry.coordinates[1] : "N/A"
		const confidence = properties.confidence !== undefined ? (properties.confidence * 100).toFixed(2) : "N/A"

		return `${longitude},${latitude},${confidence}`
	})

	return (
		<div>
			{isProcessing && (
				<div style={{ marginTop: 20 }}>
					<progress value={progress} max={100} />
					<span>{`${Math.round(progress)}%`}</span>
				</div>
			)}

			{Object.keys(apiResponses).length > 0 && !isProcessing && (
				<>
					<div style={{ paddingTop: "20px" }}>
						<label>
							Export Title:
							<input type="text" value={exportTitle} onChange={e => setExportTitle(e.target.value)} />
						</label>
					</div>
					<br />
					
					<GcdsButton size="small" onClick={exportToExcel}>
						Export to Excel
					</GcdsButton>
					<GcdsButton size="small" onClick={exportToCSV} style={{ marginLeft: 10 }}>
						Export to CSV
					</GcdsButton>
					<div>
						<h2>Results Count:</h2>
						<p>
							<strong>Lines Inputted / Lines Returned:</strong> {inputCount} / {returnedCount}
						</p>
						<div>85+%: {count_85_to_100}</div>
						<div>51-84%: {count_84_to_51}</div>
						<div>0-50%: {count_0_to_50}</div>
					</div>
					<div>
						<ul>{display_0_to_50()}</ul>
					</div>
					<div style={{ height: "500px", overflow: "auto" }}>
						<h2>Results</h2>
						<ul>
							{Object.keys(apiResponses).map((address, index) => {
								const result = apiResponses[address]
								const feature = result?.features?.[0] ?? {}
								const properties = feature?.properties ?? {}
								const geometry = feature?.geometry ?? {}

								return (
									<li key={index}>
										<strong>Address:</strong> {address} <br />
										<strong>Confidence:</strong> {properties.confidence !== undefined ? (properties.confidence * 100).toFixed(2) : "N/A"} % <br />
										<strong>Match Type:</strong> {properties.match_type || "Unknown"} <br />
										<strong>Accuracy:</strong> {properties.accuracy || "Unknown"} <br />
										<strong>Source:</strong> {properties.source || "Unknown"} <br />
										<strong>Longitude:</strong> {geometry.coordinates ? geometry.coordinates[0] : "N/A"} <br />
										<strong>Latitude:</strong> {geometry.coordinates ? geometry.coordinates[1] : "N/A"} <br />
										<br />
									</li>
								)
							})}
						</ul>
					</div>
				</>
			)}
			{!isProcessing && (
				<div style={{ paddingTop: "40px", paddingBottom: "40px" }}>
					<GcdsDetails detailsTitle="View the Map">
						<MapComponentOL mapContentJSON={mapContentJSON} />
					</GcdsDetails>
				</div>
			)}
		</div>
	)
}

FileProcessorComponent.propTypes = {
	jsonData: PropTypes.array.isRequired,
}

export default FileProcessorComponent
