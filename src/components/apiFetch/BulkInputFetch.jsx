import  { useState,  useCallback } from "react";
import ExcelJS from "exceljs";
import { GcdsButton } from "@cdssnc/gcds-components-react";

export default function BulkInputFetch() {
  const [addresses, setAddresses] = useState([]);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exportTitle, setExportTitle] = useState("");
  const [inputCount, setInputCount] = useState(0);
  const [returnedCount, setReturnedCount] = useState(0);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(file);
      const worksheet = workbook.getWorksheet(1);
      const jsonData = [];

      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber > 1) {
          const street = row.getCell(1).value;
          const cityProvince = row.getCell(2).value;
          const postalCode = row.getCell(3).value;
          const country = row.getCell(4).value;
          const fullAddress = `${street}, ${cityProvince}, ${postalCode}, ${country}`;
          jsonData.push({ FullAddress: fullAddress });
        }
      });

      console.log("Extracted addresses:", jsonData);
      setAddresses(jsonData);
      setInputCount(jsonData.length);
      setProgress(0);
      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const fetchWithRetry = async (url, retries = 3, delay = 200) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        if (retries > 0 && response.status >= 500 && response.status < 600) {
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

  const sendAddressesToApi = async () => {
    setIsProcessing(true);
    const totalAddresses = addresses.length;
    let completedAddresses = 0;
    const results = [];

    for (const address of addresses) {
      if (!address || !address.FullAddress) {
        continue;
      }

      const fullAddress = address.FullAddress;
      const cleanedAddress = fullAddress.replace(/#/g, "");

      try {
        const url = `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(cleanedAddress)}`;
        const data = await fetchWithRetry(url);

        if (data) {
          results.push({ address: fullAddress, data });
          setReturnedCount((prev) => prev + 1);
        }
      } catch (error) {
        console.error("Error fetching address:", fullAddress, error);
      } finally {
        completedAddresses++;
        setProgress((completedAddresses / totalAddresses) * 100);
        await new Promise((resolve) => setTimeout(resolve, 50)); // Adjust for faster API calls
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
    setReturnedCount(0);
  };

  const exportToCSV = useCallback(() => {
    const csvContent = results
      .map((result) => {
        if (!result.data || !result.data.features || !result.data.features[0] || !result.data.features[0].properties) {
          return `${result.address},,,,,"",""`;
        }

        const inputAddress = result.address;
        const feature = result.data.features[0];
        const confidence = feature.properties.confidence ? feature.properties.confidence.toFixed(2) : "";
        const matchType = feature.properties.match_type || "";
        const accuracy = feature.properties.accuracy || "";
        const source = feature.properties.source || "";
        const longitude = feature.geometry.coordinates ? feature.geometry.coordinates[0] : "";
        const latitude = feature.geometry.coordinates ? feature.geometry.coordinates[1] : "";

        return `${inputAddress},${confidence}%,${matchType},${accuracy},${source},${longitude},${latitude}`;
      })
      .join("\n");

    downloadCSV(csvContent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results,]);

  const downloadCSV = (csvContent) => {
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${exportTitle}_geocoding_results.csv`;
    link.click();
  };

  const exportToExcel = useCallback(async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Geocoding Results");

    worksheet.addRow(["Address", "Confidence", "Match Type", "Accuracy", "Source", "Longitude", "Latitude"]);

    for (const result of results) {
      if (!result.data || !result.data.features || !result.data.features[0] || !result.data.features[0].properties) {
        worksheet.addRow([result.address, "", "", "", "", "", ""]);
        continue;
      }

      const inputAddress = result.address;
      const feature = result.data.features[0];
      const confidence = feature.properties.confidence ? feature.properties.confidence.toFixed(2) : "";
      const matchType = feature.properties.match_type || "";
      const accuracy = feature.properties.accuracy || "";
      const source = feature.properties.source || "";
      const longitude = feature.geometry.coordinates ? feature.geometry.coordinates[0] : "";
      const latitude = feature.geometry.coordinates ? feature.geometry.coordinates[1] : "";

      worksheet.addRow([inputAddress, `${confidence}%`, matchType, accuracy, source, longitude, latitude]);
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = `${exportTitle}_geocoding_results.xlsx`;
    link.click();
  }, [results, exportTitle]);

  const count_85_to_100 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.85).length;
  const count_84_to_51 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0.51 && result.data?.features?.[0]?.properties?.confidence < 0.85).length;
  const count_0_to_50 = results.filter(result => result.data?.features?.[0]?.properties?.confidence >= 0 && result.data?.features?.[0]?.properties?.confidence < 0.51).length;

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
        <div
          style={{
            width: "100%",
            backgroundColor: "#ddd",
            marginTop: "10px",
          }}
        >
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
            <input type="text" value={exportTitle} onChange={(e) => setExportTitle(e.target.value)} placeholder="Enter export title" style={{ marginRight: "10px" }} />
            <span style={{ marginLeft: "5px", fontStyle: "italic" }}>{exportTitle}_geocoding_results.xlsx</span>
            <br />
            <div style={{ marginTop: "10px" }}>
              <GcdsButton size="small" onClick={exportToCSV}>
                Export to CSV
              </GcdsButton>
              <GcdsButton size="small" onClick={exportToExcel}>
                Export to Excel
              </GcdsButton>{" "}
            </div>
          </div>

          <div>
            <h2>Results Count:</h2>
            <p>
              <strong>Lines Inputted / Lines Returned:</strong> {inputCount} / {returnedCount}
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
                  {result.address && <strong>Address:</strong>} {result.address} <br />
                  {result.data && result.data.features && result.data.features.length > 0 && result.data.features[0].properties && (
                    <>
                      <strong>Confidence:</strong>{" "}
                      {result.data.features[0].properties.confidence ? result.data.features[0].properties.confidence.toFixed(2) : "N/A"}
                      % <br />
                      <strong>Match Type:</strong> {result.data.features[0].properties.match_type || "Unknown"} <br />
                      <strong>Accuracy:</strong> {result.data.features[0].properties.accuracy || "Unknown"} <br />
                      <strong>Source:</strong> {result.data.features[0].properties.source || "Unknown"} <br />
                      <strong>Longitude:</strong>{" "}
                      {result.data.features[0].geometry.coordinates ? result.data.features[0].geometry.coordinates[0] : "N/A"} <br />
                      <strong>Latitude:</strong>{" "}
                      {result.data.features[0].geometry.coordinates ? result.data.features[0].geometry.coordinates[1] : "N/A"} <br />
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

