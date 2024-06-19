import  { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import ExcelJS from "exceljs"; // Import ExcelJS library for Excel operations
import { GcdsButton } from "@cdssnc/gcds-components-react";

const FileProcessorComponent = ({ jsonData }) => {
  // State declarations using useState hook
  const [processedData, setProcessedData] = useState([]); // Holds processed JSON data
  const [physicalAddressArray, setPhysicalAddressArray] = useState([]); // Stores physical addresses extracted from JSON
  const [apiResponses, setApiResponses] = useState({}); // Stores responses from API calls
  const [isProcessing, setIsProcessing] = useState(false); // Flag indicating whether API calls are in progress
  const [progress, setProgress] = useState(0); // Tracks progress of API calls
  const [results, setResults] = useState([]); // Stores final results from API calls
  const [returnedCount, setReturnedCount] = useState(0); // Counts number of API responses returned
  const [exportTitle, setExportTitle] = useState(""); // State to hold export title

  const inputCount = jsonData.length; // Number of entries in the JSON data

  // Function to replace special characters in a string, excluding hyphen
  const replaceSpecialCharacters = (str) => {
    if (typeof str !== "string") return ""; // Return empty string if str is not a string
    return str.replace(/[^\w\s-]/gi, ""); // Replace special characters except hyphen with empty string
  };

  // Function to process JSON data and format "Physical Address" column
  const processJsonData = () => {
    if (!jsonData || jsonData.length === 0) return; // Return if jsonData is empty or undefined
  
    // Extract all headers from jsonData objects
    const allHeaders = new Set();
    jsonData.forEach((row) => {
      Object.keys(row).forEach((key) => {
        allHeaders.add(key);
      });
    });
  
    // Convert Set to Array and sort headers alphabetically
    const headers = Array.from(allHeaders);
  
    // Process each row in jsonData
    const processedLines = jsonData.map((row) => {
      const processedRow = {};
  
      headers.forEach((header) => {
        // Replace special characters only in "Physical Address" column
        if (header === "Physical Address" && Object.keys(row).includes("Physical Address")) {
          processedRow[header] = replaceSpecialCharacters(row[header].replace(/\n/g, " "));
          // Replace '\n' with space in Physical Address
        } else {
          processedRow[header] = row[header] || ""; // Keep other headers unchanged or set to empty string
        }
      });
  
      return processedRow; // Return processed row
    });
  
    // Extract all "Physical Address" entries into a new array
    const physicalAddresses = processedLines.map((row) => row["Physical Address"]);
  
    setProcessedData(processedLines); // Update processed data state
    setPhysicalAddressArray(physicalAddresses); // Update physical addresses state
  
    return processedLines; // Return processed data for further use
  };
  
  // Call processJsonData when component mounts or when jsonData changes
  useEffect(() => {
    if (jsonData && jsonData.length > 0) {
      const processedDataToSend = processJsonData(); // Process JSON data
      if (processedDataToSend.length > 0) {
        // Start sending addresses to API
        sendAddressesToApi();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jsonData]);

  // Function to handle individual API call for each physical address
  const sendAddressesToApi = async () => {
    setIsProcessing(true); // Set processing flag to true
    const totalAddresses = physicalAddressArray.length; // Total number of physical addresses
    let completedAddresses = 0; // Counter for completed API calls
    const results = []; // Array to store API call results

    const MAX_RETRY = 3; // Maximum number of retries for failed API calls

    // Function to fetch data with retry mechanism
    const fetchWithRetry = async (url, retries = MAX_RETRY, delay = 200) => {
      try {
        const response = await fetch(url); // Fetch data from API
        if (!response.ok) {
          // Retry logic for server errors
          if (retries > 0 && response.status >= 500 && response.status < 600) {
            console.warn(`Retrying ${url}, ${retries} retries left`);
            await new Promise((resolve) => setTimeout(resolve, delay)); // Delay before retrying
            return fetchWithRetry(url, retries - 1, delay); // Recursive call for retry
          } else {
            throw new Error(`HTTP error! status: ${response.status}`); // Throw error for non-retryable responses
          }
        }
        return response.json(); // Return JSON data from successful response
      } catch (error) {
        console.error("Error:", error); // Log error to console
        return null; // Return null for failed fetch attempts
      }
    };

    // Function to process each physical address and make API call
    const processAddress = async (address) => {
      try {
        const apiUrl = `https://geocoder.alpha.phac.gc.ca/api/v1/search?text=${encodeURIComponent(address)}`;
        const responseData = await fetchWithRetry(apiUrl); // Fetch API data with retry

        if (responseData) {
          // Handle successful API response
          console.log(`API call response for address ${address}:`, responseData);
          setApiResponses((prevResponses) => ({
            ...prevResponses,
            [address]: responseData,
          }));
          results.push({ address, data: responseData }); // Store address and response data in results array
        } else {
          // Retry logic failed after MAX_RETRY attempts
          console.error(`Failed to make API call for address ${address} after ${MAX_RETRY} attempts`);
          results.push({ address, error: `Failed to fetch after ${MAX_RETRY} retries` }); // Store error in results array
        }
      } catch (error) {
        console.error(`Error making API call for address ${address}:`, error); // Log error for failed API call
        results.push({ address, error: error.message }); // Optionally handle errors in results
      } finally {
        completedAddresses++; // Increment completed addresses counter
        const currentProgress = (completedAddresses / totalAddresses) * 100; // Calculate current progress percentage
        setProgress(currentProgress); // Update progress state
      }
    };

    // Loop through each physical address and call processAddress function
    for (const address of physicalAddressArray) {
      await processAddress(address);
    }

    console.log("Final results:", results); // Log final results after all API calls
    setIsProcessing(false); // Set processing flag to false after API calls complete
    setReturnedCount(results.length); // Count API responses
    setResults(results); // Store results for further processing if needed
  };

  // Automatically start API calls on component mount or when jsonData changes
  useEffect(() => {
    if (processedData.length > 0) {
      sendAddressesToApi();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processedData]);

  // Calculate counts of confidence levels based on API response data
  const count_85_to_100 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.85).length;
  const count_84_to_51 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.51 && result.data?.features?.[0]?.properties?.confidence < 0.85).length;
  const count_0_to_50 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0 && result.data?.features?.[0]?.properties?.confidence < 0.51).length;

  // Function to display addresses with confidence between 0 and 50%
  const display_0_to_50 = () => {
    const filteredResults = results.filter(result => {
      const confidence = result.data?.features?.[0]?.properties?.confidence;
      return confidence !== undefined && confidence >= 0 && confidence < 0.51; // Filter results based on confidence level
    });
  
    // Render list of addresses below 50% confidence if any exist
    if (filteredResults.length !== 0) return (
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
    );
    return null; // Return null if no addresses below 50% confidence
  };

  // Function to export results to Excel format
  const exportToExcel = useCallback(async () => {
    const workbook = new ExcelJS.Workbook(); // Create new Excel workbook instance
    const worksheet = workbook.addWorksheet("Geocoding Results"); // Add worksheet for results

    worksheet.addRow(["Address", "Confidence", "Match Type", "Accuracy", "Source", "Longitude", "Latitude"]); // Add headers to worksheet

    // Iterate through results and add data rows to worksheet
    for (const result of results) {
      if (!result.data || !result.data.features || !result.data.features[0] || !result.data.features[0].properties) {
        worksheet.addRow([result.address, "", "", "", "", "", ""]); // Add empty row if result data is missing
        continue;
      }

      // Extract properties from API response for each result
      const inputAddress = result.address;
      const feature = result.data.features[0];
      const confidence = feature.properties.confidence ? feature.properties.confidence.toFixed(2) : "";
      const matchType = feature.properties.match_type || "";
      const accuracy = feature.properties.accuracy || "";
      const source = feature.properties.source || "";
      const longitude = feature.geometry.coordinates ? feature.geometry.coordinates[0] : "";
      const latitude = feature.geometry.coordinates ? feature.geometry.coordinates[1] : "";

      // Add row with extracted data to worksheet
      worksheet.addRow([inputAddress, `${confidence}%`, matchType, accuracy, source, longitude, latitude]);
    }

    const buffer = await workbook.xlsx.writeBuffer(); // Write workbook to buffer
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }); // Create blob with Excel data
    const link = document.createElement("a"); // Create <a> element for download link
    link.href = window.URL.createObjectURL(blob); // Set URL for download link
    link.download = `${exportTitle || "export"}_geocoding_results.xlsx`; // Set download filename using exportTitle state
    link.click(); // Simulate click on download link
  }, [results, exportTitle]);

  // Function to export results to CSV format
  const exportToCSV = useCallback(() => {
    const headers = ["Address", "Confidence", "Match Type", "Accuracy", "Source", "Longitude", "Latitude"]; // Define CSV headers
    const csvContent = [
      headers.join(","), // Join headers with comma for CSV format
      ...results.map((result) => {
        if (!result.data || !result.data.features || !result.data.features[0] || !result.data.features[0].properties) {
          return `${result.address},,,,,"",""`; // Return empty row if result data is missing
        }

        // Extract properties from API response for each result
        const inputAddress = result.address;
        const feature = result.data.features[0];
        const confidence = feature.properties.confidence ? feature.properties.confidence.toFixed(2) : "";
        const matchType = feature.properties.match_type || "";
        const accuracy = feature.properties.accuracy || "";
        const source = feature.properties.source || "";
        const longitude = feature.geometry.coordinates ? feature.geometry.coordinates[0] : "";
        const latitude = feature.geometry.coordinates ? feature.geometry.coordinates[1] : "";

        // Format data row for CSV
        return `${inputAddress},${confidence}%,${matchType},${accuracy},${source},${longitude},${latitude}`;
      })
    ].join("\n"); // Join data rows with newline for CSV format

    downloadCSV(csvContent); // Call function to initiate CSV download
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Function to initiate download of CSV file
  const downloadCSV = (csvContent) => {
    const blob = new Blob([csvContent], { type: "text/csv" }); // Create blob with CSV content
    const link = document.createElement("a"); // Create <a> element for download link
    link.href = window.URL.createObjectURL(blob); // Set URL for download link
    link.download = `${exportTitle || "export"}_geocoding_results.csv`; // Set download filename using exportTitle state
    link.click(); // Simulate click on download link
  };

  // Render different components based on processing state and API responses
  return (
    <div>
      {isProcessing && (
        <div style={{ marginTop: 20 }}>
          <progress value={progress} max={100} /> {/* Progress bar for API call progress */}
          <span>{`${Math.round(progress)}%`}</span> {/* Display progress percentage */}
        </div>
      )}

      {Object.keys(apiResponses).length > 0 && !isProcessing && (
        <>
          <div style={{paddingTop: "20px"}}>
            <label>
              Export Title:
              <input
                type="text"
                value={exportTitle}
                onChange={(e) => setExportTitle(e.target.value)} // Input field to set export title
              />
            </label>
          </div>
          <br/>
          <GcdsButton size="small" onClick={exportToExcel}>Export to Excel</GcdsButton> {/* Button to export results to Excel */}
          <GcdsButton size="small" onClick={exportToCSV}>Export to CSV</GcdsButton> {/* Button to export results to CSV */}
          <div>
            <h2>Results Count:</h2>
            <p>
              <strong>Lines Inputted / Lines Returned:</strong> {inputCount} / {returnedCount} {/* Display input and returned line counts */}
            </p>
            <div>85+%: {count_85_to_100}</div> {/* Display count of results with confidence 85% and above */}
            <div>51-84%: {count_84_to_51}</div> {/* Display count of results with confidence between 51% and 84% */}
            <div>0-50%: {count_0_to_50}</div> {/* Display count of results with confidence between 0% and 50% */}
          </div>
          <div>
            <ul>{display_0_to_50()}</ul> {/* Display addresses below 50% confidence */}
          </div>
          <div style={{ height: "500px", overflow: "auto" }}>
            <h2>Results</h2>
            <ul>
              {Object.keys(apiResponses).map((address, index) => {
                const result = apiResponses[address];
                const feature = result?.features?.[0] ?? {};
                const properties = feature?.properties ?? {};
                const geometry = feature?.geometry ?? {};

                return (
                  <li key={index}>
                    <strong>Address:</strong> {address} <br /> {/* Display address */}
                    <strong>Confidence:</strong>{" "}
                    {properties.confidence !== undefined ? properties.confidence.toFixed(2) * 100 : "N/A"} % <br /> {/* Display confidence percentage */}
                    <strong>Match Type:</strong> {properties.match_type || "Unknown"} <br /> {/* Display match type */}
                    <strong>Accuracy:</strong> {properties.accuracy || "Unknown"} <br /> {/* Display accuracy */}
                    <strong>Source:</strong> {properties.source || "Unknown"} <br /> {/* Display source */}
                    <strong>Longitude:</strong>{" "}
                    {geometry.coordinates ? geometry.coordinates[0] : "N/A"} <br /> {/* Display longitude */}
                    <strong>Latitude:</strong>{" "}
                    {geometry.coordinates ? geometry.coordinates[1] : "N/A"} <br /> {/* Display latitude */}
                    <br /> {/* Add line break */}
                  </li>
                );
              })}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

// PropTypes validation for jsonData prop
FileProcessorComponent.propTypes = {
  jsonData: PropTypes.array.isRequired, // Validate that jsonData is an array and is required
};

export default FileProcessorComponent; // Export FileProcessorComponent as default
