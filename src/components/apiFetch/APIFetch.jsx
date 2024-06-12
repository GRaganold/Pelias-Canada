import { useState } from "react";
import { GcdsButton } from "@cdssnc/gcds-components-react";
import "@cdssnc/gcds-components-react/gcds.css"; // Import the CSS file if necessary
import Loading from "../Loading";
import PercentageCircle from "../PercentageCircle";

export default function APIfetch() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [setLastResponse] = useState("");
  const [loading, setLoading] = useState(false); // State for loading

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullAddress = `${address}, ${city}, ${province}`;
    console.log("Form submitted with address:", fullAddress);
    sendRequest(fullAddress);
    setAddress("");
    setCity("");
    setProvince("");
  };
  const sendRequest = (fullAddress) => {
    setLoading(true); // Set loading state to true when request is initiated
    const url = `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(
      fullAddress
    )}`;

    console.log("Sending request to:", url);

    fetch(url)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Received data:", data);
        setResponseData(data); // Update state with response data
        setLastResponse(fullAddress);
        setLoading(false); // Set loading state to false when request is completed
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false); // Set loading state to false when request encounters an error
      });
  };

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
        <h4> Please enter an address, a city, and the province </h4>
        <div
          style={{
            display: "flex",
            width: "300px",
            justifyContent: "space-between",
          }}
        >
          <label>Address: </label>
          <input
            required
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="110 Laurier Ave W"
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "300px",
            justifyContent: "space-between",
          }}
        >
          <label>City: </label>
          <input
            required
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Ottawa"
          />
        </div>
        <div
          style={{
            display: "flex",
            width: "300px",
            justifyContent: "space-between",
          }}
        >
          <label>Province: </label>
          <input
            required
            type="text"
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            placeholder="On"
          />
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
              setAddress("");
              setCity("");
              setProvince("");
              setLastResponse("");
              setResponseData("");
            }}
          >
            Reset
          </GcdsButton>
        </div>
      </form>

      {/* Display loading state if waiting for response */}
      {loading && <Loading />}

      {/* Display response data if available */}
      {responseData && (
        <div>
          <h2>
            Information for <i>{responseData.geocoding.query.text}</i> returned:
          </h2>
          <div style={{ border: "1px solid black", padding: "4px" }}>
            <h3>Accuracy information</h3>
            <div style={{ display: "flex", justifyContent: "space-evenly" }}>
              <div>
                <p>Call Confidence</p>
                <PercentageCircle
                  confidencePercentage={
                    responseData.features[0].properties.confidence
                  }
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <p>
                  <strong>Match Type:</strong>{" "}
                  {responseData.features[0].properties.match_type}
                </p>
                <p>
                  <strong>Accuracy:</strong>{" "}
                  {responseData.features[0].properties.accuracy}
                </p>
                <p>
                  <strong>Source:</strong>{" "}
                  {responseData.features[0].properties.source}
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                fontSize: "10px",
              }}
            >
              <i>
                Information provided by Pelias Geocoder v
                {responseData.geocoding.version}
              </i>
            </div>
          </div>

          <p>
            Longitude: {responseData.features[0].geometry.coordinates[0]}
            <button>Copy</button>
          </p>

          <p>
            Latitude: {responseData.features[0].geometry.coordinates[1]}
            <button>Copy</button>
          </p>
        </div>
      )}
    </div>
  );
}
