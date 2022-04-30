import React from "react";
import exportFromJSON from "export-from-json";
import _, { isArray } from "lodash";
import "../styles/Explorer.css";

export default function TaskManagerExporter(ac) {
  let dataArray = ac.dc;

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
          Export response
        </button>
        <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <button className="dropdown-item" type="button" onClick={ExportCsv} href="/#">
            CSV
          </button>
          <button className="dropdown-item" type="button" onClick={ExportXls} href="/#">
            XLS
          </button>
          <button className="dropdown-item" type="button" onClick={ExportTxt} href="/#">
            TXT
          </button>
          <button className="dropdown-item" type="button" onClick={ExportJson} href="/#">
            JSON
          </button>
          <button className="dropdown-item" type="button" onClick={ExportXml} href="/#">
            XML
          </button>
        </div>
      </div>
    </div>
  );
}
