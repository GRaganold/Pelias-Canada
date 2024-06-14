import { useState } from "react";
import ExcelJS from "exceljs";
import { GcdsButton } from "@cdssnc/gcds-components-react";

export default function BulkInputFetch() {
  const [addresses, setAddresses] = useState([]);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportTitle, setExportTitle] = useState(""); // State for export title
  const [inputCount, setInputCount] = useState(0); // State for input count
  const [returnedCount, setReturnedCount] = useState(0); // State for returned count

  const handleFileUpload = async (event) => {
    console.log("File uploaded");
    const file = event.target.files[0];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
    const worksheet = workbook.getWorksheet(1);
    const jsonData = [];

    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        jsonData.push({ Address: row.getCell(1).value });
      }
    });

    console.log("Extracted addresses:", jsonData);
    setAddresses(jsonData);
    setInputCount(jsonData.length); // Set input count
    setProgress(0);
    setIsProcessing(false);
  };

  // eslint-disable-next-line no-unused-vars
  const fetchAddressData = async (address) => {
    const maxRetries = 3;
    let attempt = 0;
    let success = false;
    let data = null;

    while (attempt < maxRetries && !success) {
      try {
        const fullAddress = address.Address;

        // Remove "#" characters from the address
        const cleanedAddress = fullAddress.replace(/#/g, "");

        console.log("Sending address to API:", cleanedAddress);

        const response = await fetch(
          `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(
            cleanedAddress
          )}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        data = await response.json();
        success = true;
      } catch (error) {
        console.error(`Error (attempt ${attempt + 1}):`, error);
        attempt++;
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before retrying
      }
    }

    if (!success) {
      console.error("Failed to fetch address after multiple attempts:", address.Address);
    }

    return data ? { address: address.Address, data } : null;
  };

  const sendAddressesToApi = async () => {
    setIsProcessing(true);
    const totalAddresses = addresses.length;
    let completedAddresses = 0;

    const fetchWithRetry = async (url, retries = 3, delay = 2000) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          if (retries > 0 && response.status >= 500 && response.status < 600) {
            // Retry for server errors (5xx)
            console.warn(`Retrying ${url}, ${retries} retries left`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return fetchWithRetry(url, retries - 1, delay);
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
        return response.json();
      } catch (error) {
        console.error("Error:", error);
        return null;
      }
    };

    const results = [];

    for (const address of addresses) {
      if (!address || !address.Address) {
        continue; // Skip if address is null or undefined
      }

      const fullAddress = address.Address;

      // Remove "#" characters from the address
      const cleanedAddress = fullAddress.replace(/#/g, "");

      console.log("Sending address to API:", cleanedAddress);
      try {
        const data = await fetchWithRetry(
          `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(
            cleanedAddress
          )}`
        );

        console.log("Received response for address:", cleanedAddress, data);
        if (data) {
          results.push({ address: fullAddress, data });
          setReturnedCount((prev) => prev + 1); // Increment returned count
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        completedAddresses++;
        setProgress((completedAddresses / totalAddresses) * 100);

        // Throttle requests to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000)); // Increased delay to 1000ms
      }
    }

    console.log("Final results:", results);
    const filteredResults = results.filter((result) => result !== null);
    setResults(filteredResults);
    setIsProcessing(false);
  };

  const resetProgressBar = () => {
    setProgress(0);
    setResults([]);
    setReturnedCount(0); // Reset returned count
  };

  const exportToCSV = () => {
    const csvContent = results
      .map((result) => {
        const inputAddress = result.address;
        const feature = result.data.features[0];
        const confidence = feature.properties.confidence.toFixed(2);
        const matchType = feature.properties.match_type;
        const accuracy = feature.properties.accuracy;
        const source = feature.properties.source;
        const longitude = feature.geometry.coordinates[0];
        const latitude = feature.geometry.coordinates[1];

        return `${inputAddress},${confidence}%,${matchType},${accuracy},${source},${longitude},${latitude}`;
      })
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${exportTitle}_geocoding_results.csv`; // Use exportTitle for file name
    link.click();
  };

  const exportToExcel = () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Geocoding Results");

    worksheet.addRow([
      "Address",
      "Confidence",
      "Match Type",
      "Accuracy",
      "Source",
      "Longitude",
      "Latitude",
    ]);

    results.forEach((result) => {
      const inputAddress = result.address;
      const feature = result.data.features[0];
      const confidence = feature.properties.confidence.toFixed(2);
      const matchType = feature.properties.match_type;
      const accuracy = feature.properties.accuracy;
      const source = feature.properties.source;
      const longitude = feature.geometry.coordinates[0];
      const latitude = feature.geometry.coordinates[1];

      worksheet.addRow([
        inputAddress,
        `${confidence}%`,
        matchType,
        accuracy,
        source,
        longitude,
        latitude,
      ]);
    });

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `${exportTitle}_geocoding_results.xlsx`; // Use exportTitle for file name
      link.click();
    });
  };

  const count_85_to_100 = results.filter(
    (result) =>
      result.data?.features?.[0]?.properties?.confidence >= 0.85
  ).length;
  const count_84_to_51 = results.filter(
    (result) =>
      result.data?.features?.[0]?.properties?.confidence >= 0.51 &&
      result.data?.features?.[0]?.properties?.confidence < 0.85
  ).length;
  const count_0_to_50 = results.filter(
    (result) =>
      result.data?.features?.[0]?.properties?.confidence >= 0 &&
      result.data?.features?.[0]?.properties?.confidence < 0.51
  ).length;

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <GcdsButton
        size="small"
        onClick={() => {
          resetProgressBar();
          sendAddressesToApi();
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
          <div style={{ padding: "20px 0px" }}>
            {/* Input field for export title */}
            <input
              type="text"
              value={exportTitle}
              onChange={(e) => setExportTitle(e.target.value)}
              placeholder="Enter export title"
              style={{ marginRight: "10px" }}
            />
            <span style={{ marginLeft: "5px", fontStyle: "italic" }}>
              _geocoding_results.xlsx
            </span>
            <br/>
            <div style={{marginTop: "10px" }}>
            <GcdsButton size="small" onClick={exportToCSV} >
              Export to CSV
            </GcdsButton>{" "}
            <GcdsButton size="small" onClick={exportToExcel}>
              Export to Excel
            </GcdsButton>{" "} </div>
          </div>

          <div>
            <h2>Results Count:</h2>           
       <p> <strong>Lines Inputted / Lines Returned:</strong> {inputCount} / {returnedCount}
      </p> 
            <div>85+%: {count_85_to_100}</div>
            <div>51-84%: {count_84_to_51}</div>
            <div>0-50%: {count_0_to_50}</div>
          </div>
          <h2>Results preview:</h2>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <ul>
              {results.map((result, index) => (
                <li key={index}>
                  {result.address && <strong>Address:</strong>} {result.address}{" "}
                  <br />
                  {result.data &&
                    result.data.features &&
                    result.data.features.length > 0 &&
                    result.data.features[0].properties && (
                      <>
                        <strong>Confidence:</strong>{" "}
                        {result.data.features[0].properties.confidence.toFixed(2)}
                        % <br />
                        <strong>Match Type:</strong>{" "}
                        {result.data.features[0].properties.match_type} <br />
                        <strong>Accuracy:</strong>{" "}
                        {result.data.features[0].properties.accuracy} <br />
                        <strong>Source:</strong>{" "}
                        {result.data.features[0].properties.source} <br />
                        <strong>Longitude:</strong>{" "}
                        {result.data.features[0].geometry.coordinates[0]} <br />
                        <strong>Latitude:</strong>{" "}
                        {result.data.features[0].geometry.coordinates[1]} <br />
                      </>
                    )}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

    </div>
  );
}
