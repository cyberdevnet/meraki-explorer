import { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "react-notifications-component/dist/theme.css";
import LinearProgress from "@mui/material/LinearProgress";
import "../styles/MuiOverride.css";
import "../styles/Explorer.css";
import { useRecoilState } from "recoil";
import { LazyLog } from "react-lazylog";
import useFirstRender from "../main/useFirstRender";
import HtmlJsonTable from "./HtmlJsonTable";

import axios from "axios";
import {
  openRollbackModalState,
  loadingSubmitEnpointState,
  rollbackParametersState,
  ApiKeyState,
  openResultsModalState,
  notificationMessageState,
  notificationTypeState,
  triggerShowNotificationState,
  SingleOrganizationSelectedState,
  requiredParametersState,
} from "../main/GlobalState";

export default function RollbackModal(ac) {
  const firstRender = useFirstRender();
  const [triggerSubmit, settriggerSubmit] = useState(false);
  const [openRollbackModal, setopenRollbackModal] = useRecoilState(openRollbackModalState);
  const [openResultsModal, setopenResultsModal] = useRecoilState(openResultsModalState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [rollbackParameters, setrollbackParameters] = useRecoilState(rollbackParametersState);
  const [SingleOrganizationSelected, setSingleOrganizationSelected] = useRecoilState(SingleOrganizationSelectedState);
  const [requiredParameters, setrequiredParameters] = useRecoilState(requiredParametersState);
  const [showAccordion, setshowAccordion] = useState("");
  const [showLogConsole, setshowLogConsole] = useState(false);
  const [showNextButton, setshowNextButton] = useState(false);

  let RollbackParameterTemplate = {
    apiKey: apiKey,
    dashboard: "dashboard",
    category: rollbackParameters.category,
    operationId: rollbackParameters.task_name,
    parameter: rollbackParameters.rollback_response,
    method: rollbackParameters.method,
    usefulParameter: rollbackParameters.usefulParameter,
    organization: SingleOrganizationSelected.name ? SingleOrganizationSelected.name : "N/A",
    requiredParameters: requiredParameters,
  };

  const handleCloseModal = () => {
    setopenRollbackModal(!openRollbackModal);
    setshowNextButton(false);
  };

  function SubmitEndpoint() {
    settriggerSubmit(!triggerSubmit);
    setshowAccordion("show");
    setshowLogConsole(true);
  }

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
          ac.dc.setdataResults(data);
          if (data.data.error) {
            console.log("Error: ", data.data.error);
            setnotificationMessage([`Error: ${JSON.stringify(data.data.error)}`]);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setloadingSubmitEnpoint(false);
            ac.dc.setJSONtoTable(<HtmlJsonTable data={data.data.error} />);
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
            RollbackParameterTemplate.parameter.map((opt) => opt.name);
            ac.dc.setJSONtoTable(<HtmlJsonTable data={JSON.parse(JSON.stringify(data.data, replacer))} />);
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
          setshowNextButton(true);
        })
        .catch((error) => {
          console.log(error);
          setnotificationMessage([`Error: ${JSON.stringify(error)}`]);
          setnotificationType("danger");
          settriggerShowNotification(!triggerShowNotification);
          setloadingSubmitEnpoint(false);
        });
    }
    ApiCall();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingSubmitEnpoint(false);
    };
  }, [triggerSubmit]);

  function logFormatter(e) {
    let parsed = JSON.parse(e);
    let logFormatted = `${parsed.asctime}    ${parsed.name}    ${parsed.levelname}  >  ${parsed.message}`;
    return logFormatted;
  }

  let modalTitleStyle = {
    paddingLeft: "1rem",
    paddingTop: "0.5rem",
  };

  function HandleNext() {
    setopenRollbackModal(!openRollbackModal);
    setopenResultsModal(!openResultsModal);
    setshowNextButton(false);
  }

  return (
    <div>
      <Dialog
        open={openRollbackModal}
        fullWidth
        maxWidth={"xl"}
        onClose={handleCloseModal}
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
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
                    <div></div>
                  </div>
                  {SingleOrganizationSelected.id ? (
                    <div className="ml-auto mr-3">
                      <h1 className="m-0">
                        <a href={SingleOrganizationSelected.url} target="_blank" className="m-0">
                          {SingleOrganizationSelected.name}
                        </a>
                      </h1>
                      <span style={{ marginRight: "3px", backgroundColor: "#17a2b8" }} className="badge">
                        ID
                      </span>
                      <span className="Endpointdescription">{SingleOrganizationSelected.id}</span>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <DialogContent dividers>
          <div className="accordion" id="accordion1">
            <div className="card">
              <div className="card-header" id="headingOne">
                <button
                  className="btn"
                  data-toggle="collapse"
                  data-target="#collapseOne"
                  aria-expanded="true"
                  aria-controls="collapseOne"
                >
                  <i className="fa" aria-hidden="true"></i>
                </button>
              </div>

              <div id="collapseOne" className="collapse show" aria-labelledby="headingOne" data-parent="#accordion1">
                <div>
                  <h5 style={modalTitleStyle} className="modal-title">
                    Parameters
                  </h5>
                  <div className="modal-body">
                    <div className="content-header" style={{ padding: "0px" }}>
                      {
                        <HtmlJsonTable
                          data={JSON.parse(JSON.stringify(rollbackParameters.rollback_response, replacer))}
                        />
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {showLogConsole ? (
            <div className="accordion" id="accordion2">
              <div className="card">
                <div className="card-header" id="headingTwo">
                  <button
                    className="btn"
                    data-toggle="collapse"
                    data-target="#collapseTwo"
                    aria-expanded="true"
                    aria-controls="collapseTwo"
                  >
                    <i className="fa collapseTwo" aria-hidden="true"></i>
                  </button>
                </div>

                <div
                  id="collapseTwo"
                  className={`collapse ${showAccordion}`}
                  aria-labelledby="headingTwo"
                  data-parent="#accordion2"
                >
                  <div>
                    <div className="modal-body">
                      <div className="content-header" style={{ padding: "0px" }}>
                        <div style={{ minHeight: "500px" }}>
                          <LazyLog
                            enableSearch
                            url="ws://localhost:5000/live_logs"
                            websocket
                            stream
                            follow
                            websocketOptions={{
                              formatMessage: (e) => logFormatter(e),
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <></>
          )}
        </DialogContent>
        <DialogActions>
          <div>
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
            {showNextButton ? (
              <button
                type="button"
                className="btn btn-default"
                style={{ marginRight: "3px" }}
                onClick={() => HandleNext()}
              >
                Next <i style={{ marginLeft: "3px" }} className="fa fa-arrow-circle-right" aria-hidden="true"></i>
              </button>
            ) : (
              <></>
            )}
          </div>
        </DialogActions>
      </Dialog>
    </div>
  );
}
