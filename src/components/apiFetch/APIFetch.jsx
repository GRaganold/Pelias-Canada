import { useState } from "react"
import { GcdsButton, GcdsDetails } from "@cdssnc/gcds-components-react"
import "@cdssnc/gcds-components-react/gcds.css" // Import the CSS file if necessary
import Loading from "../Loading"
import PercentageCircle from "../PercentageCircle"
import { copyToClipboard } from "../../assets/copyToClipboard" // Adjust the path as necessary
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import MapComponentOL from "../MapComponent" // Adjust the path as necessary

export default function APIfetch() {
	const [address, setAddress] = useState("")
	const [city, setCity] = useState("")
	const [province, setProvince] = useState("")
	const [responseData, setResponseData] = useState(null)
	const [loading, setLoading] = useState(false)
	const [latitude, setLatitude] = useState(null)
	const [longitude, setLongitude] = useState(null)
	const [confidence, setConfidence] = useState(null)
	const [unitNumber, setUnitNumber] = useState(null)

	const handleSubmit = e => {
		e.preventDefault()
		const fullAddress = `${address}, ${city}, ${province}`

		if (!address || !city || !province) {
			toast.error("Please enter address, city, and province.")
			return
		}

		console.log("Form submitted with address:", fullAddress)
		sendRequest(fullAddress)
	}

	const extractApartmentNumber = address => {
		const aptPattern1 = /\b\d+\s*-\s*\d+\b/ // Matches patterns like 711 - 3100
		const aptPattern2 = /\b\d+\b/ // Matches standalone numbers like 120

		let match = address.match(aptPattern1)
		let apartmentNumber = ""
		let unitNumber = ""
		let mainAddress = address.trim()
		let streetAddress = ""

		if (match) {
			apartmentNumber = match[0]
			const parts = apartmentNumber.split("-").map(part => part.trim())
			mainAddress = mainAddress.replace(apartmentNumber, "").trim()
			streetAddress = `${parts[1]} ${mainAddress}`.trim()
			apartmentNumber = {
				firstPart: parts[0],
				secondPart: parts[1],
			}
			unitNumber = parts[0]
		} else {
			match = address.match(aptPattern2)
			if (match) {
				apartmentNumber = match[0]
				mainAddress = mainAddress.replace(apartmentNumber, "").trim()
				streetAddress = `${apartmentNumber} ${mainAddress}`.trim()
				apartmentNumber = {
					firstPart: apartmentNumber,
					secondPart: "",
				}
				unitNumber = apartmentNumber.secondPart
			}
		}

		return { streetAddress, apartmentNumber, unitNumber }
	}

	const sendRequest = fullAddress => {
		setLoading(true)

		const { streetAddress, apartmentNumber, unitNumber } = extractApartmentNumber(fullAddress)
		setUnitNumber(unitNumber)

		const url = `https://geocoder.alpha.phac.gc.ca/api/v1/search?text=${encodeURIComponent(streetAddress)}`

		console.log("Sending request to:", url)

		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`)
				}
				return response.json()
			})
			.then(data => {
				console.log("Received data:", data)
				setLoading(false)

				if (data.features && data.features.length > 0) {
					const coords = data.features[0].geometry.coordinates
					setLatitude(coords[1])
					setLongitude(coords[0])
					setConfidence(data.features[0].properties.confidence)

					const result = {
						...data,
						apartmentNumber,
						unitNumber,
					}
					setResponseData(result)
				} else {
					setResponseData({ ...data, apartmentNumber, unitNumber })
				}
			})
			.catch(error => {
				console.error("Error:", error)
				toast.error("An error occurred. Please try again later.")
				setLoading(false)
			})
	}

	//
	// Start Copy to Clipboard items
	//
	const handleCopyLatitude = () => {
		if (!responseData || !responseData.features || !responseData.features[0]) {
			toast.error("Latitude information is not available.")
			return
		}

		const latitude = responseData.features[0].geometry.coordinates[1]
		copyToClipboard(latitude.toString(), () => {
			toast.success("Latitude copied to clipboard!")
		})
	}

	const handleCopyLongitude = () => {
		if (!responseData || !responseData.features || !responseData.features[0]) {
			toast.error("Longitude information is not available.")
			return
		}

		copyToClipboard(responseData.features[0].geometry.coordinates[0].toString(), () => {
			toast.success("Longitude copied to clipboard!")
		})
	}

	const handleCopyLatitudeLongitude = () => {
		if (!responseData || !responseData.features || !responseData.features[0]) {
			toast.error("Latitude and Longitude information is not available.")
			return
		}

		const latitude = responseData.features[0].geometry.coordinates[1]
		const longitude = responseData.features[0].geometry.coordinates[0]
		const latLong = `${latitude}, ${longitude}`

		copyToClipboard(latLong, () => {
			toast.success("Latitude and Longitude copied to clipboard!")
		})
	}

	const handleCopyLongitudeLatitude = () => {
		if (!responseData || !responseData.features || !responseData.features[0]) {
			toast.error("Latitude and Longitude information is not available.")
			return
		}

		const latitude = responseData.features[0].geometry.coordinates[1]
		const longitude = responseData.features[0].geometry.coordinates[0]
		const longLat = `${longitude}, ${latitude}`
		copyToClipboard(longLat, () => {
			toast.success("Longitude and Latitude copied to clipboard!")
		})
	}
	//
	// End Copy to Clipboard items
	//
  
	return (
		<div style={{ padding: "40px" }}>
			<form
				onSubmit={handleSubmit}
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "10px",
					alignItems: "center",
				}}
			>
				<h4>Enter an address, city, and province</h4>
				<div
					style={{
						display: "flex",
						width: "300px",
						justifyContent: "space-between",
					}}
				>
					<label>Address:</label>
					<input required type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="110 Laurier Ave W" />
				</div>
				<div
					style={{
						display: "flex",
						width: "300px",
						justifyContent: "space-between",
					}}
				>
					<label>City:</label>
					<input required type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Ottawa" />
				</div>
				<div
					style={{
						display: "flex",
						width: "300px",
						justifyContent: "space-between",
					}}
				>
					<label>Province:</label>
					<input required type="text" value={province} onChange={e => setProvince(e.target.value)} placeholder="ON" />
				</div>
				<div
					style={{
						display: "flex",
						width: "300px",
						justifyContent: "space-around",
					}}
				>
					<GcdsButton type="submit" buttonId="submit" size="regular">
						Search
					</GcdsButton>
					<GcdsButton
						size="regular"
						type="reset"
						buttonRole="secondary"
						buttonId="reset"
						onClick={() => {
							setAddress("")
							setCity("")
							setProvince("")
							setResponseData(null)
						}}
					>
						Reset
					</GcdsButton>
				</div>
			</form>

			{loading && <Loading />}

			{responseData && responseData.features && responseData.features[0] && (
				<div>
					<h2>
						Information for{" "}
						<i>
							{unitNumber && <>{unitNumber} -</>} {responseData.geocoding.query.text}
						</i>{" "}
						returned:
					</h2>
					<div style={{ border: "1px solid black", padding: "4px" }}>
						<h3>Accuracy information</h3>
						<div style={{ display: "flex", justifyContent: "space-evenly" }}>
							<div>
								<p>Call Confidence</p>
								<PercentageCircle confidencePercentage={confidence} />
							</div>
							<div style={{ display: "flex", flexDirection: "column" }}>
								<p>
									<strong>Match Type:</strong> {responseData.features[0].properties.match_type}
								</p>
								<p>
									<strong>Accuracy:</strong> {responseData.features[0].properties.accuracy}
								</p>
								<p>
									<strong>Source:</strong> {responseData.features[0].properties.source}
								</p>
							</div>
						</div>
						<div style={{ display: "flex", justifyContent: "flex-end", fontSize: "10px" }}>
							<i>Information provided by Pelias Geocoder v{responseData.geocoding.version}</i>
						</div>
					</div>

					<p>
						Longitude: {responseData.features[0].geometry.coordinates[0]}
						<button style={{ marginLeft: "10px" }} onClick={handleCopyLongitude}>
							Copy
						</button>
					</p>

					<p>
						Latitude: {responseData.features[0].geometry.coordinates[1]}
						<button style={{ marginLeft: "10px" }} onClick={handleCopyLatitude}>
							Copy
						</button>
					</p>

					<GcdsDetails detailsTitle="See more options">
						<p>
							Longitude, Latitude : {responseData.features[0].geometry.coordinates[0]} , {responseData.features[0].geometry.coordinates[1]}
							<button style={{ marginLeft: "10px" }} onClick={handleCopyLongitudeLatitude}>
								Copy
							</button>
						</p>

						<p>
							Latitude, Longitude : {responseData.features[0].geometry.coordinates[1]} , {responseData.features[0].geometry.coordinates[0]}
							<button style={{ marginLeft: "10px" }} onClick={handleCopyLatitudeLongitude}>
								Copy
							</button>
						</p>
					</GcdsDetails>

					<div style={{ paddingTop: "40px", paddingBottom: "40px" }}>
						<GcdsDetails detailsTitle="View the Map">
							<MapComponentOL mapContentJSON={[`${longitude},${latitude},${responseData.features[0].properties.confidence * 100}`]} />
						</GcdsDetails>
					</div>
				</div>
			)}
			<ToastContainer />
		</div>
	)
}
