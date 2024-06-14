// APIfetch.js

import  { useState } from "react";
import { GcdsButton } from "@cdssnc/gcds-components-react";
import "@cdssnc/gcds-components-react/gcds.css"; // Import the CSS file if necessary
import Loading from "../Loading";
import PercentageCircle from "../PercentageCircle";
import { copyToClipboard } from '../../assets/copyToClipboard'; // Adjust the path as necessary
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function APIfetch() {
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullAddress = `${address}, ${city}, ${province}`;

    // Check if required fields are empty
    if (!address || !city || !province) {
      toast.error("Please enter address, city, and province.");
      return;
    }

    console.log("Form submitted with address:", fullAddress);
    sendRequest(fullAddress);
  };

  const sendRequest = (fullAddress) => {
    setLoading(true); // Set loading state to true when request is initiated

    // Remove "#" characters from the address
    const cleanedAddress = fullAddress.replace(/#/g, "");

    const url = `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(
      cleanedAddress
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
        setLoading(false); // Set loading state to false when request is completed
      })
      .catch((error) => {
        console.error("Error:", error);
        toast.error("An error occurred. Please try again later.");
        setLoading(false); // Set loading state to false when request encounters an error
      });
  };

  const handleCopyLatitude = () => {
    if (!responseData || !responseData.features || !responseData.features[0]) {
      toast.error("Latitude information is not available.");
      return;
    }

    const latitude = responseData.features[0].geometry.coordinates[1];
    copyToClipboard(latitude.toString(), () => {
      toast.success("Latitude copied to clipboard!");
    });
  };

  const handleCopyLongitude = () => {
    if (!responseData || !responseData.features || !responseData.features[0]) {
      toast.error("Longitude information is not available.");
      return;
    }

    copyToClipboard(responseData.features[0].geometry.coordinates[0].toString(), () => {
      toast.success("Longitude copied to clipboard!");
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
            placeholder="ON"
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
              setResponseData(null);
            }}
          >
            Reset
          </GcdsButton>
        </div>
      </form>

      {/* Display loading state if waiting for response */}
      {loading && <Loading />}

      {/* Display response data if available */}
      {responseData && responseData.features && responseData.features[0] && (
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
            <button style={{marginLeft: "10px"}} onClick={handleCopyLongitude}>Copy</button>
          </p>

          <p>
            Latitude: {responseData.features[0].geometry.coordinates[1]}
            <button style={{marginLeft: "10px"}} onClick={handleCopyLatitude}>Copy</button>
          </p>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
