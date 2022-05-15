import React from "react";
import exportFromJSON from "export-from-json";
import _, { isArray } from "lodash";
import "../styles/Explorer.css";

export default function Exporter(ac) {
  let isError = false;
  let dataResults = ac.dc.dc.dataResults;

  let dataArray = [];

  if (dataResults.data.length > 0) {
    dataArray = dataResults.data;
  }

  if (dataArray.error) {
    isError = true;
  }

  // if data.data return only 1 object (no loopMode)
  if (isArray(dataResults.data) === false) {
    dataArray = [dataResults.data];
  }

  function ExportTxt(e) {
    e.preventDefault();
    const fileName = "meraki-explorer";
    const exportType = "txt";
    const data = dataArray;
    exportFromJSON({ data, fileName, exportType });
  }
  function ExportJson(e) {
    e.preventDefault();
    const fileName = "meraki-explorer";
    const exportType = "json";
    const data = dataArray;
    exportFromJSON({ data, fileName, exportType });
  }
  function ExportCsv(e) {
    e.preventDefault();
    const fileName = "meraki-explorer";
    const exportType = "csv";
    const data = dataArray;
    exportFromJSON({ data, fileName, exportType });
  }

  function ExportXls(e) {
    e.preventDefault();
    const fileName = "meraki-explorer";
    const exportType = "xls";
    const data = dataArray;
    exportFromJSON({ data, fileName, exportType });
  }
  function ExportXml(e) {
    e.preventDefault();
    const fileName = "meraki-explorer";
    const exportType = "xml";
    const data = dataArray;
    exportFromJSON({ data, fileName, exportType });
  }

  return (
    <div>
      <div className="dropdown">
        <button
          className="btn btn-sm btn-outline-info dropdown-toggle"
          type="button"
          id="dropdownMenuButton"
          data-toggle="dropdown"
          aria-haspopup="true"
          aria-expanded="false"
        >
          Export
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button className="dropdown-item" type="button" onClick={ExportCsv} href="/#" disabled={isError}>
            CSV
          </button>
          <button className="dropdown-item" type="button" onClick={ExportXls} href="/#" disabled={isError}>
            XLS
          </button>
          <button className="dropdown-item" type="button" onClick={ExportTxt} href="/#" disabled={isError}>
            TXT
          </button>
          <button className="dropdown-item" type="button" onClick={ExportJson} href="/#" disabled={isError}>
            JSON
          </button>
          <button className="dropdown-item" type="button" onClick={ExportXml} href="/#" disabled={isError}>
            XML
          </button>
        </div>
      </div>
    </div>
  );
}
