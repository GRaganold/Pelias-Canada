// FileUploadComponent.js
import { useState } from "react";
import PropTypes from "prop-types"; // Import PropTypes for prop validation
import * as ExcelJS from "exceljs";
import Loading from "../Loading";

function FileUploadComponent({ onJsonDataLoaded }) {
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    setLoading(true); // Set loading state to true during file processing

    const workbook = new ExcelJS.Workbook();
    const jsonData = [];

    try {
      await workbook.xlsx.load(file);

      const worksheet = workbook.worksheets[0]; // assuming we are working with the first sheet

      // Get the headers (first row) from the worksheet
      const headers = worksheet.getRow(1).values;

      // Iterate through each filled row starting from the second row (index 2)
      worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header row

        const rowData = {};

        // Iterate through each cell in the row and map to headers
        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
          const header = headers[colNumber]; // Adjust index to match zero-based array
          rowData[header] = cell.value;
        });

        jsonData.push(rowData);
      });

      console.log("JSON data:", jsonData);
      onJsonDataLoaded(jsonData); // Pass jsonData back to parent component
    } catch (error) {
      console.error("Error parsing Excel file:", error);
      // Handle error as per your application's requirements (e.g., show error message)
    } finally {
      setLoading(false); // Set loading state to false after processing
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {loading && <Loading />} {/* Show loading indicator while processing */}
    </div>
  );
}

// PropTypes validation
FileUploadComponent.propTypes = {
  onJsonDataLoaded: PropTypes.func.isRequired, // Ensure onJsonDataLoaded is a function and is required
};

export default FileUploadComponent;
