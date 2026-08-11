
import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  FaCloudUploadAlt,
  FaFileExcel,
  FaDownload,
  FaCheckCircle,
  FaTimesCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { ALL_FIELD_KEYS, validateVehicle } from "../data/motorFormFields";
import "./ExcelUploadPanel.css";

function normalizeHeader(h) {
  return String(h || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_");
}

// Download Excel template with ONLY the header row.
// No example/sample vehicle row is included.
function downloadTemplate() {
  const headerRow = ALL_FIELD_KEYS;

  const ws = XLSX.utils.aoa_to_sheet([headerRow]);

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Vehicles");

  XLSX.writeFile(wb, "motor_proposal_template.xlsx");
}

function ExcelUploadPanel({ onImport }) {
  const inputRef = useRef(null);

  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleFile = (file) => {
    if (!file) return;

    setParseError("");
    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target.result, {
          type: "array",
        });

        const sheet = wb.Sheets[wb.SheetNames[0]];

        const rawRows = XLSX.utils.sheet_to_json(sheet, {
          defval: "",
        });

        if (rawRows.length === 0) {
          setParseError(
            "That sheet looks empty. Use the template below and fill in at least one row."
          );
          setRows([]);
          return;
        }

        const parsed = rawRows.map((raw) => {
          const normalized = {};

          Object.keys(raw).forEach((key) => {
            normalized[normalizeHeader(key)] = String(raw[key]).trim();
          });

          const data = ALL_FIELD_KEYS.reduce(
            (o, key) => ({
              ...o,
              [key]: normalized[key] ?? "",
            }),
            {}
          );

          const errors = validateVehicle(data);

          return {
            data,
            errors,
          };
        });

        setRows(parsed);
      } catch {
        setParseError(
          "Couldn't read that file. Make sure it's a valid .xlsx or .csv export."
        );
        setRows([]);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    handleFile(e.dataTransfer.files?.[0]);
  };

  const validRows = rows.filter(
    (r) => Object.keys(r.errors).length === 0
  );

  const invalidCount = rows.length - validRows.length;

  const clearFile = () => {
    setFileName("");
    setRows([]);
    setParseError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="eup">
      <div className="eup-toolbar">
        <p className="eup-hint">
          Upload one row per vehicle using the columns below. We'll validate
          every row before you submit.
        </p>

        <button
          type="button"
          className="eup-template-btn"
          onClick={downloadTemplate}
        >
          <FaDownload /> Download Template
        </button>
      </div>

      {!fileName ? (
        <div
          className={`eup-dropzone ${
            dragActive ? "eup-dropzone-active" : ""
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
        >
          <FaCloudUploadAlt className="eup-dropzone-icon" />

          <p className="eup-dropzone-title">
            Drag & drop your Excel file here
          </p>

          <p className="eup-dropzone-sub">
            or click to browse — .xlsx, .xls, .csv supported
          </p>

          <input
            ref={inputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            hidden
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </div>
      ) : (
        <div className="eup-file-bar">
          <div className="eup-file-info">
            <FaFileExcel className="eup-file-icon" />

            <span>{fileName}</span>

            <span className="eup-file-count">
              {rows.length} row{rows.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <button
            type="button"
            className="eup-clear-btn"
            onClick={clearFile}
          >
            <FaTrashAlt /> Remove
          </button>
        </div>
      )}

      {parseError && (
        <p className="eup-error-text">
          {parseError}
        </p>
      )}

      {rows.length > 0 && (
        <>
          <div className="eup-summary">
            <span className="eup-summary-pill eup-summary-valid">
              <FaCheckCircle /> {validRows.length} valid
            </span>

            {invalidCount > 0 && (
              <span className="eup-summary-pill eup-summary-invalid">
                <FaTimesCircle /> {invalidCount} need attention
              </span>
            )}
          </div>

          <div className="eup-preview-wrap">
            <table className="eup-preview-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Make</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Type</th>
                  <th>City</th>
                  <th>Driver Age</th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => {
                  const hasErrors =
                    Object.keys(row.errors).length > 0;

                  return (
                    <tr
                      key={i}
                      className={
                        hasErrors ? "eup-row-invalid" : ""
                      }
                    >
                      <td>{i + 1}</td>

                      <td>
                        {hasErrors ? (
                          <span
                            className="eup-row-status eup-row-status-bad"
                            title={Object.entries(row.errors)
                              .map(
                                ([k, v]) => `${k}: ${v}`
                              )
                              .join(", ")}
                          >
                            <FaTimesCircle />{" "}
                            {Object.keys(row.errors).length}{" "}
                            issue
                            {Object.keys(row.errors).length > 1
                              ? "s"
                              : ""}
                          </span>
                        ) : (
                          <span className="eup-row-status eup-row-status-ok">
                            <FaCheckCircle /> Ready
                          </span>
                        )}
                      </td>

                      <td>{row.data.make || "—"}</td>

                      <td>{row.data.model || "—"}</td>

                      <td>{row.data.year || "—"}</td>

                      <td>{row.data.vehicle_type || "—"}</td>

                      <td>{row.data.city || "—"}</td>

                      <td>{row.data.driver_age || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="eup-actions">
            {invalidCount > 0 && (
              <p className="eup-invalid-note">
                {invalidCount} row
                {invalidCount > 1 ? "s" : ""} will be skipped until
                fixed in the sheet and re-uploaded.
              </p>
            )}

            <button
              type="button"
              className="eup-import-btn"
              disabled={validRows.length === 0}
              onClick={() =>
                onImport(validRows.map((r) => r.data))
              }
            >
              Use {validRows.length} Vehicle
              {validRows.length !== 1 ? "s" : ""}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default ExcelUploadPanel;

