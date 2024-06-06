import  { useState } from "react";
import { GcdsButton } from "@cdssnc/gcds-components-react";
import "@cdssnc/gcds-components-react/gcds.css"; // Import the CSS file if necessary
import Loading from "../components/Loading";
import PercentageCircle from "../components/PercentageCircle";

export default function APIfetch() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [responseData, setResponseData] = useState(null);

  const sendRequest = (fullAddress) => {
    const FetchUrl = `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(
      fullAddress
    )}`;
    setLoading(true); // Set loading state to true when request is initiated

    fetch(FetchUrl) // Use FetchUrl directly here
      .then((response) => response.json())
      .then((data) => {
        setResponseData(data); // Update state with response data
        setLoading(false); // Set loading state to false when request is completed
      })
      .catch((error) => {
        console.error("Error:", error);
        setLoading(false); // Set loading state to false when request encounters an error
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendRequest(address);
    setAddress("");
  };

  return (
    <>
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
          <label> Please enter an address, city, and province </label>
          <input
            required
            width="400px"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="110 Laurier Ave W, Ottawa, On"
          />
          <GcdsButton type="submit" buttonId="submit">
            Search
          </GcdsButton>
        </form>
      </div>

      {/* Display loading state if waiting for response */}
      {loading && <Loading />}
      {responseData && (
        <div>
          <h2>
            Information for <i>{responseData.geocoding.query.text}</i> returned:
          </h2>
          <div style={{ border: '1px solid black', padding: "4px" }}>
            <h3>Accuracy information</h3>
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <div>
                <p>Call Confidence</p>
                <PercentageCircle
                  confidencePercentage={
                    responseData.features[0].properties.confidence
                  }
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <p>
                  <strong>Match Type:</strong>{' '}
                  {responseData.features[0].properties.match_type}
                </p>
                <p>
                  <strong>Accuracy:</strong>{' '}
                  {responseData.features[0].properties.accuracy}
                </p>
                <p>
                  <strong>Source:</strong>{' '}
                  {responseData.features[0].properties.source}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent:"flex-end", fontSize:"10px" }}> 
            <i> 
              Information provided by Pelias Geocoder v{responseData.geocoding.version} 
              </i>
            </div>
          </div>

          <p>
            Longitude: {responseData.features[0].geometry.coordinates[0]}
            <button
             
            >
              Copy
            </button>
          </p>

          <p>
            Latitude: {responseData.features[0].geometry.coordinates[1]}
            <button
             
            >
              Copy
            </button>
          </p>
        </div>
      )}
    </>
  );
}
