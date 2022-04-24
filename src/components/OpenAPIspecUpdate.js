// @ts-nocheck
import "../styles/Explorer.css";
import { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { useRecoilState } from "recoil";
import "react-notifications-component/dist/theme.css";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

import {
  ApiKeyState,
  notificationMessageState,
  notificationTypeState,
  triggerShowNotificationState,
  SingleOrganizationSelectedState,
  openAPIspecVersionState,
} from "../main/GlobalState";
import useFirstRender from "../main/useFirstRender";
import axios from "axios";

function OpenAPIspecUpdate(props) {
  const firstRender = useFirstRender();
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [SingleOrganizationSelected, setSingleOrganizationSelected] = useRecoilState(SingleOrganizationSelectedState);
  const [triggerOpenAPIupdate, settriggerOpenAPIupdate] = useState(false);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [loadingOpenAPIspec, setloadingOpenAPIspec] = useState(false);
  const [allOpenAPIinfo, setallOpenAPIinfo] = useState([]);
  const [openAPIspecVersion, setopenAPIspecVersion] = useRecoilState(openAPIspecVersionState);

  // demo read-only API key

  useEffect(() => {
    setloadingOpenAPIspec(true);
    axios
      .get("http://localhost:8000/GetAllOpenAPI")
      .then((data) => {
        if (data.data.error) {
          console.log(data.data.error);
          setnotificationMessage([`Error: ${JSON.stringify(data.data.error)}`]);
          setnotificationType("danger");
          settriggerShowNotification(!triggerShowNotification);
          setloadingOpenAPIspec(false);
        } else {
          setloadingOpenAPIspec(false);
          setallOpenAPIinfo(data.data.allOpenAPIinfo);
        }
      })
      .catch((error) => {
        console.error(error);
        setloadingOpenAPIspec(false);
      });
  }, []);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (firstRender) {
      return;
    }

    async function GetOpenAPIupdate() {
      setloadingOpenAPIspec(true);
      await axios
        .post("http://localhost:8000/GetOpenAPIupdate", {
          apiKey: apiKey,
          organizationId: SingleOrganizationSelected.id,
        })
        .then((data) => {
          if (data.data.error) {
            console.log(data.data.error);
            setnotificationMessage([`Error: ${JSON.stringify(data.data.error)}`]);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setloadingOpenAPIspec(false);
          } else if (data.data.no_update) {
            setnotificationMessage([`Info: ${JSON.stringify(data.data.no_update)}`]);
            setnotificationType("info");
            settriggerShowNotification(!triggerShowNotification);
            setloadingOpenAPIspec(false);
          } else {
            if (data.status === 200) {
              setnotificationMessage([`Info: ${JSON.stringify(data.data.info)}`]);
              setnotificationType("success");
              settriggerShowNotification(!triggerShowNotification);
              setloadingOpenAPIspec(false);
              setallOpenAPIinfo(data.data.allOpenAPIinfo);
            }
          }
        })
        .catch((error) => {
          console.log("catch; ", error);
          setnotificationMessage([`Error: ${JSON.stringify(error)}`]);
          setnotificationType("danger");
          settriggerShowNotification(!triggerShowNotification);
          setloadingOpenAPIspec(false);
        });
    }
    GetOpenAPIupdate();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingOpenAPIspec(false);
    };
  }, [triggerOpenAPIupdate]);

  function UpdateOpenApiSpec(cell) {
    setopenAPIspecVersion(cell.version);
  }

  let newData = [];
  let newColumn = [];
  if (allOpenAPIinfo.length > 0) {
    allOpenAPIinfo.map((opt, index) => {
      let RowsModel = {
        download_date: opt.download_date,
        release_date: opt.json_file["info"]["description"].split("\n\n>")[1].split("\n>\n> ")[0].replace("Date: ", ""),
        version: opt.version,
        json_file: JSON.stringify(opt.json_file),
        file: opt.file,
      };

      newData.push(RowsModel);
    });

    let ColumnList = ["download_date", "release_date", "version", "json_file", "file"];

    ColumnList.map((opt) => {
      if (opt === "json_file") {
        let ColumnModel = {
          label: opt,
          value: opt,
          dataField: opt,
          hidden: true,
          text: opt,
          sort: false,
          editable: false,
          style: () => {
            return {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textAlign: "center",
              fontSite: "13px",
            };
          },
        };
        newColumn.push(ColumnModel);
      } else if (opt === "file") {
        let ColumnModel = {
          label: opt,
          value: opt,
          dataField: opt,
          text: opt,
          editable: false,
          formatter: (cell, row) => (
            <a type="button" onClick={() => UpdateOpenApiSpec({ version: cell })} href="#/">
              use this file
            </a>
          ),
          style: () => {
            return {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textAlign: "center",
              fontSite: "13px",
            };
          },
        };

        newColumn.push(ColumnModel);
      } else if (opt === "download_date") {
        let ColumnModel = {
          label: opt,
          value: opt,
          dataField: opt,
          text: opt,
          sort: true,
          editable: false,
          style: () => {
            return {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textAlign: "center",
              fontSite: "13px",
            };
          },
        };

        newColumn.push(ColumnModel);
      } else {
        let ColumnModel = {
          label: opt,
          value: opt,
          dataField: opt,
          text: opt,
          sort: false,
          editable: false,
          style: () => {
            return {
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textAlign: "center",
              fontSite: "13px",
            };
          },
        };

        newColumn.push(ColumnModel);
      }
    });
  }

  const defaultSorted = [
    {
      dataField: "download_date",
      order: "desc",
    },
  ];

  return (
    <div>
      {loadingOpenAPIspec ? <LinearProgress style={{ width: "100%" }} /> : <div></div>}
      <br />
      <div className="post">
        <span className="input-group-btn">
          <button
            data-toggle="tooltip"
            data-placement="right"
            title={SingleOrganizationSelected.id > 0 ? "Get Open API update" : "Select an organization"}
            className="btn btn-sm btn-outline-info"
            type="button"
            disabled={SingleOrganizationSelected.id > 0 ? false : true}
            onClick={() => settriggerOpenAPIupdate(!triggerOpenAPIupdate)}
          >
            Check for Update
          </button>
        </span>
      </div>
      <div className="modal-body">
        {allOpenAPIinfo.length > 0 ? (
          <ToolkitProvider keyField="download_date" data={newData} columns={newColumn}>
            {(props) => (
              <div>
                <BootstrapTable
                  // eslint-disable-next-line
                  {...props.baseProps}
                  bootstrap4
                  striped
                  hover
                  defaultSorted={defaultSorted}
                />
              </div>
            )}
          </ToolkitProvider>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
}

export default OpenAPIspecUpdate;
