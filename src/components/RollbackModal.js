import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "react-notifications-component/dist/theme.css";
import LinearProgress from "@mui/material/LinearProgress";
import "../styles/MuiOverride.css";
import "../styles/Explorer.css";
import { useRecoilState } from "recoil";
import { JsonToTable } from "react-json-to-table";
import { LazyLog } from "react-lazylog";
import useFirstRender from "../main/useFirstRender";
import { JSONToHTMLTable } from '@kevincobain2000/json-to-html-table'
import axios from "axios";
import {
  openRollbackModalState,
  OrganizationSelectedState,
  loadingSubmitEnpointState,
  rollbackParametersState,
  ApiKeyState,
  openResultsModalState,
  notificationMessageState,
  notificationTypeState,
  triggerShowNotificationState,
} from "../main/GlobalState";

export default function RollbackModal(ac) {
  const firstRender = useFirstRender();
  const [triggerSubmit, settriggerSubmit] = useState(false);
  const [openRollbackModal, setopenRollbackModal] = useRecoilState(openRollbackModalState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [openResultsModal, setopenResultsModal] = useRecoilState(openResultsModalState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [rollbackParameters, setrollbackParameters] = useRecoilState(rollbackParametersState);

  let RollbackParameterTemplate = {
    apiKey: apiKey,
    dashboard: "dashboard",
    category: rollbackParameters.category,
    operationId: rollbackParameters.task_name,
    parameter: rollbackParameters.rollback_response,
    method: rollbackParameters.method,
    usefulParameter: rollbackParameters.usefulParameter,
    organization: OrganizationSelected.name ? OrganizationSelected.name : "N/A",
  };

  const handleCloseModal = () => {
    setopenRollbackModal(!openRollbackModal);
  };

  function SubmitEndpoint() {
    settriggerSubmit(!triggerSubmit);
  }

  // WEBSOCKET REAL-TIME LOG FROM ENDPOINT //
  var ws = null;
  useEffect(() => {
    if (firstRender) {
      return;
    }
    ws = new WebSocket("ws://localhost:8000/ws");
    ws.onopen = () => ws.send("Connected");
    ws.onmessage = (event) => {
      ac.dc.setwebSocketLogs(
        <LazyLog
          extraLines={1}
          enableSearch={true}
          text={event.data ? event.data : "log will be displayed only during first call (meraki bug)"}
          stream={true}
          caseInsensitive={true}
          selectableLines={true}
        />
      );
    };
  }, [triggerSubmit]);

  //function to convert boolean values to string, used by tables
  function replacer(key, value) {
    if (typeof value === "boolean") {
      if (value === true) {
        return "yes";
      } else if (value === false) {
        return "no";
      }
    }
    return value;
  }

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (firstRender) {
      return;
    }

    async function ApiCall() {
      setloadingSubmitEnpoint(true);

      await axios
        .post("http://localhost:8000/Rollback", { RollbackParameterTemplate })
        .then((data) => {
          if (data.data.error) {
            console.log("Error: ", data.data.error);
            setnotificationMessage(`Error: ${JSON.stringify(data.data.error)}`);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setloadingSubmitEnpoint(false);
            setopenRollbackModal(!openRollbackModal);
            setopenResultsModal(!openResultsModal);
            ac.dc.setJSONtoTable(<JSONToHTMLTable tableClassName="html-table table table-sm" data={{ temporary: data.data.error }} />);
            ac.dc.setlazyLog(
              <LazyLog
                extraLines={1}
                enableSearch={true}
                text={JSON.stringify(data.data.error, null, 4)}
                stream={true}
                caseInsensitive={true}
                selectableLines={true}
              />
            );
          } else {
            // if data.data return only 1 object (no loopMode)
            ac.dc.setJSONtoTable(<JSONToHTMLTable tableClassName="html-table table table-sm" data={JSON.parse(JSON.stringify({ temporary: data.data }, replacer))} />);
            ac.dc.setlazyLog(
              <LazyLog
                extraLines={1}
                enableSearch={true}
                text={JSON.stringify(data.data, null, 4)}
                stream={true}
                caseInsensitive={true}
                selectableLines={true}
              />
            );
          }
        })
        .then(() => {
          setloadingSubmitEnpoint(false);
          setopenRollbackModal(!openRollbackModal);
          setopenResultsModal(!openResultsModal);
        })
        .catch((error) => {
          setnotificationMessage(`Error: ${JSON.stringify(error)}`);
          setnotificationType("danger");
          settriggerShowNotification(!triggerShowNotification);
          setloadingSubmitEnpoint(false);
          setopenRollbackModal(!openRollbackModal);
        });
    }
    ApiCall();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingSubmitEnpoint(false);
    };
  }, [triggerSubmit]);

  return (
    <Dialog open={openRollbackModal} fullWidth maxWidth={"md"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Rollback Summary</h4>

        <DialogActions>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      {loadingSubmitEnpoint ? <LinearProgress style={{ width: "100%" }} /> : <div></div>}

      <div className="modal-body">
        <div className="content-header" style={{ padding: "0px" }}>
          <div className="card">
            <div className="card-body" style={{ padding: "10px" }}>
              <div className="row align-items-center">
                <div className="col-sm-6">
                  <h1 className="m-0">
                    <a href={ac.dc.documentationLink} target="_blank" className="m-0 ac-dashboard">
                      {rollbackParameters.task_name}
                    </a>
                  </h1>
                  {rollbackParameters.method === "get" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-green">
                      {rollbackParameters.method.toUpperCase()}
                    </span>
                  ) : rollbackParameters.method === "post" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-orange">
                      {rollbackParameters.method.toUpperCase()}
                    </span>
                  ) : rollbackParameters.method === "put" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-blue">
                      {rollbackParameters.method.toUpperCase()}
                    </span>
                  ) : rollbackParameters.method === "delete" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-danger">
                      {rollbackParameters.method.toUpperCase()}
                    </span>
                  ) : (
                    <div></div>
                  )}
                  {/* <span className="Endpointdescription">{ac.dc.props.prop.ExplorerProps.opt2.prefix}</span> */}
                  <div>
                    {/* <span className="Endpointdescription">{ac.dc.props.prop.ExplorerProps.opt2.description}</span> */}
                  </div>
                </div>
                {OrganizationSelected.id ? (
                  <div className="ml-auto mr-3">
                    <h1 className="m-0">
                      <a href={OrganizationSelected.url} target="_blank" className="m-0">
                        {OrganizationSelected.name}
                      </a>
                    </h1>
                    <span style={{ marginRight: "3px", backgroundColor: "#17a2b8" }} className="badge">
                      ID
                    </span>
                    <span className="Endpointdescription">{OrganizationSelected.id}</span>
                  </div>
                ) : (
                  <div></div>
                )}
              </div>
            </div>
          </div>
          <DialogContent dividers>
            <div>
              <h4 className="modal-title">Rollback Parameters</h4>
              <div className="modal-body">
                <div className="content-header" style={{ padding: "0px" }}>
                  {<JSONToHTMLTable tableClassName="html-table table table-sm" data={JSON.parse(JSON.stringify(rollbackParameters.rollback_response, replacer))} />}
                </div>
              </div>
            </div>
          </DialogContent>
        </div>
      </div>
      <div className="modal-footer">
        <DialogActions>
          {rollbackParameters.method === "get" ? (
            <button
              type="button"
              onClick={() => SubmitEndpoint()}
              style={{ marginRight: "3px" }}
              className="btn btn-default bg-green"
            >
              {rollbackParameters.method.toUpperCase()}
            </button>
          ) : rollbackParameters.method === "post" ? (
            <button
              type="button"
              onClick={() => SubmitEndpoint()}
              style={{ marginRight: "3px" }}
              className="btn btn-default bg-orange"
            >
              {rollbackParameters.method.toUpperCase()}
            </button>
          ) : rollbackParameters.method === "put" ? (
            <button
              type="button"
              onClick={() => SubmitEndpoint()}
              style={{ marginRight: "3px" }}
              className="btn btn-default bg-blue"
            >
              {rollbackParameters.method.toUpperCase()}
            </button>
          ) : rollbackParameters.method === "delete" ? (
            <button
              type="button"
              onClick={() => SubmitEndpoint()}
              style={{ marginRight: "3px" }}
              className="btn btn-default bg-danger"
            >
              {rollbackParameters.method.toUpperCase()}
            </button>
          ) : (
            <div></div>
          )}
        </DialogActions>
      </div>
    </Dialog>
  );
}
