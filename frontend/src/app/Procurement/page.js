"use client";

import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import "./Procurement.css";
import DataGridComponent from "@/components/organisms/Header/DataGrid";

export default function ProcurementPage() {
  const [rows, setRows] = useState([]);
  const [columns, setColumns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [extraData, setExtraData] = useState({});

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setRows([]);
    setColumns([]);
    setExtraData({});
    setError(null);
    setIsLoading(true);

    const formData = new FormData();
    formData.append("bom_file", file);

    try {
      const response = await fetch("http://127.0.0.1:8000/supply/process", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed: ${response.statusText}`);
      }

      const data = await response.json();

      let items = [];
      if (Array.isArray(data.items)) {
        items = data.items;
        if (data.totalCarbonFootprint) {
          setExtraData({ totalCarbonFootprint: data.totalCarbonFootprint });
        }
      } else if (Array.isArray(data)) {
        items = data;
      }

      if (items.length > 0) {
        const firstItem = items[0];
        const generatedColumns = Object.keys(firstItem).map((key) => ({
          field: key,
          headerName: key,
          width: 150,
        }));

        const mappedRows = items.map((obj, idx) => ({
          id: idx + 1,
          ...obj,
        }));

        setRows(mappedRows);
        setColumns(generatedColumns);
      }
    } catch (err) {
      setError(`Error uploading file: ${err.message}`);
      console.error("Upload error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="procurementPage">
      {!isLoading && rows.length == 0 && (
        <div>
          <h1 className="procurementHeading">
            Upload a Bill of Material to fetch your inventory
          </h1>
          <p className="desc">Drop anywhere to upload a CSV file</p>
          <div className="fileUpload">
            <label htmlFor="fileInput">
              <img
                src="/assets/images/fileUpload.png"
                alt="Upload Icon"
                className="uploadIcon"
              />
            </label>
            <input
              type="file"
              id="fileInput"
              accept=".csv"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
          </div>
        </div>
      )}

      {/* Loader */}
      {isLoading && (
        <div className="loading-container">
          <CircularProgress />
          <p style={{ marginTop: "1em" }}>
            Processing your file. This may take up to 5 minutes...
          </p>
        </div>
      )}

      {/* Error */}
      {error && !isLoading && <div className="error-message">{error}</div>}

      {!isLoading && rows.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          {/* {extraData.totalCarbonFootprint && (
            <h2>Total Carbon Footprint: {extraData.totalCarbonFootprint}</h2>
          )} */}
          <div style={{ height: 500, width: "100%" }}>
            <DataGridComponent rows={rows} columns={columns} pageSize={5} />
          </div>
        </div>
      )}
    </div>
  );
}
