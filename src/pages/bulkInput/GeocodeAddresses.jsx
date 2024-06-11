import { useState } from 'react';
import ExcelJS from 'exceljs';

const GeocodeAddresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [results, setResults] = useState([]); // New state to store API results
  const [progress, setProgress] = useState(0); // State to track progress
  const [isProcessing, setIsProcessing] = useState(false); // State to control the visibility of the progress bar

  const handleFileUpload = async (event) => {
    console.log("File uploaded");
    const file = event.target.files[0];
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(file);
    const worksheet = workbook.getWorksheet(1); // Assuming the first sheet
    const jsonData = [];
    
    // Start from row 2 to skip the header
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) { // Skip the header row
        jsonData.push({ Address: row.getCell(1).value }); // Assuming address is in the first column
      }
    });
    
    console.log("Extracted addresses:", jsonData);
    setAddresses(jsonData);
    setProgress(0); // Reset progress when a new file is uploaded
    setIsProcessing(false); // Hide progress bar when a new file is uploaded
  };

  const sendAddressesToApi = async () => {
    setIsProcessing(true); // Show progress bar when sending addresses
    const totalAddresses = addresses.length;
    let completedAddresses = 0;

    const results = await Promise.all(
      addresses.map(async (address) => {
        const fullAddress = address.Address; // Assuming the address column is named 'Address'
        console.log("Sending address to API:", fullAddress);
        const response = await fetch(
          `https://geocoder.alpha.phac.gc.ca/api/search?text=${encodeURIComponent(fullAddress)}`,
        );
        const data = await response.json();
        console.log("Received response for address:", fullAddress, data);
        
        // Update progress
        completedAddresses++;
        setProgress((completedAddresses / totalAddresses) * 100);

        return { address: fullAddress, data }; // Store both address and its result
      })
    );
    console.log("Final results:", results);
    setResults(results); // Store results in state
    setIsProcessing(false); // Hide progress bar when processing is complete
  };

  const resetProgressBar = () => {
    setProgress(0); // Reset progress bar
    setResults([]); // Reset results
  };

  const exportToCSV = () => {
    // Convert results to CSV format
    const csvContent = results.map(result => `${result.address},${JSON.stringify(result.data)}`).join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    // Create a temporary anchor element to download the CSV file
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'geocoding_results.csv';
    
    // Trigger the download
    link.click();
  };

  const exportToExcel = () => {
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Geocoding Results');
    
    // Add headers
    worksheet.addRow(['Address', 'Result']);
    
    // Add data
    results.forEach(result => {
      worksheet.addRow([result.address, JSON.stringify(result.data)]);
    });
    
    // Generate Excel file
    workbook.xlsx.writeBuffer().then(buffer => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'geocoding_results.xlsx';
      link.click();
    });
  };

  return (
    <div>
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
      <button onClick={() => {
        resetProgressBar(); // Reset progress bar
        sendAddressesToApi(); // Call sendAddressesToApi function
      }}>Send Addresses to API</button>
      {isProcessing && (
        <div style={{ width: '100%', backgroundColor: '#ddd', marginTop: '10px' }}>
          <div
            style={{
              width: `${progress}%`,
              height: '24px',
              backgroundColor: progress === 100 ? 'green' : 'blue',
              textAlign: 'center',
              lineHeight: '24px',
              color: 'white',
            }}
          >
            {Math.round(progress)}%
          </div>
        </div>
      )}
      {results.length > 0 && (
        <div>
          <h2>Results</h2>
          <ul>
            {results.map((result, index) => (
              <li key={index}>
                <strong>Address:</strong> {result.address}
                <br />
                <strong>Result:</strong> {JSON.stringify(result.data)}
              </li>
            ))}
          </ul>
          <button onClick={exportToCSV}>Export to CSV</button>
          <button onClick={exportToExcel}>Export to Excel</button>
        </div>
      )}
    </div>
  );
};

export default GeocodeAddresses;
