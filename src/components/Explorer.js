// @ts-nocheck
import { useRef, useEffect, useState, DetailedHTMLProps, HTMLAttributes, SVGProps } from "react";
import axios from "axios";
import { useRecoilValue, useRecoilState } from "recoil";
import Split from "react-split";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";
import Authentication from "./Authentication";
import ExplorerNavbar from "./ExplorerNavbar";
import NetworksModal from "./NetworksModal";
import OrganizationsModal from "./OrganizationsModal";
import DevicesModal from "./DevicesModal";
import ResultsModal from "./ResultsModal";
import SummaryModal from "./SummaryModal";
import useFirstRender from "../main/useFirstRender";
import { LazyLog } from "react-lazylog";
import { JsonToTable } from "react-json-to-table";
import {
  ApiKeyState,
  openNetworksModalState,
  openOrganizationsModalState,
  openDevicesModalState,
  OrganizationSelectedState,
  usefulParameterState,
  openSummaryModalState,
  openResultsModalState,
  loadingSubmitEnpointState,
  notificationMessageState,
  notificationTypeState,
  triggerShowNotificationState,
} from "../main/GlobalState";
import "../styles/Explorer.css";

function Explorer(props) {
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const firstRender = useFirstRender();
  const [ParameterTemplate, setParameterTemplate] = useState({});
  const [triggerSubmit, settriggerSubmit] = useState(false);
  const [openNetworksModal, setopenNetworksModal] = useRecoilState(openNetworksModalState);
  const [openOrganizationsModal, setopenOrganizationsModal] = useRecoilState(
    openOrganizationsModalState
  );
  const [openResultsModal, setopenResultsModal] = useRecoilState(openResultsModalState);
  const [openSummaryModal, setopenSummaryModal] = useRecoilState(openSummaryModalState);
  const [openDevicesModal, setopenDevicesModal] = useRecoilState(openDevicesModalState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [networksSelected, setnetworksSelected] = useState([]);
  const [networksIDSelected, setnetworksIDSelected] = useState([]);
  const [devicesSelected, setdevicesSelected] = useState([]);
  const [devicesIDSelected, setdevicesIDSelected] = useState([]);
  const [lazyLog, setlazyLog] = useState([]);
  const [JSONtoTable, setJSONtoTable] = useState([]);
  const [JSONresults, setJSONresults] = useState({});
  const [isLoopModeActive, setisLoopModeActive] = useState(false);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(
    triggerShowNotificationState
  );
  //=================== GET NETWORKs AND DEVICES IDs =====================

  let NetIDModel = [];
  let DeviceIDModel = [];
  useEffect(() => {
    if (firstRender) {
      return;
    }
    networksSelected.map((opt) => {
      NetIDModel.push(opt.id);
    });
    setnetworksIDSelected(NetIDModel);

    devicesSelected.map((opt) => {
      DeviceIDModel.push(opt.serial);
    });
    setdevicesIDSelected(DeviceIDModel);
  }, [networksSelected, devicesSelected]);

  //=============================================================

  //=================== GET USEFUL PARAMETERS =====================

  const [usefulParameter, setusefulParameter] = useRecoilState(usefulParameterState);

  let parametersArray = ["serial", "organizationId", "networkId"];

  useEffect(() => {
    props.prop.opt2.parameters.map((opt) => {
      if (parametersArray.includes(opt.name)) {
        setusefulParameter(opt.name);
      }
    });
  }, [props]);

  // =================== RESET input & ParameterTemplate and loopMode =====================
  // every time endpoint change, reset input value & ParameterTemplate
  useEffect(() => {
    let inputtt = Array.from(
      document.getElementsByClassName("form-control form-control-sm parameter-input")
    );
    inputtt.map((opt) => {
      opt.value = "";
    });
    setParameterTemplate({});

    let loopMode = document.getElementById("loopMode");
    loopMode.checked = false;
    setisLoopModeActive(false);

    if (document.getElementById(usefulParameter) !== null) {
      document.getElementById(usefulParameter).removeAttribute("disabled");
    }
  }, [props]);

  // ==============================================================

  //================= DOCUMENTATION LINK //=================
  const operationIdlink = props.prop.opt2.operationId
    .match(/([A-Z]?[^A-Z]*)/g)
    .slice(0, -1)
    .join(" ")
    .replace(/\s+/g, "-")
    .toLowerCase();

  let documentationLink = `https://developer.cisco.com/meraki/api-v1/#!${operationIdlink}`;
  //=================//=================//=================

  let responseString = `dashboard.${props.prop.opt2.category}.${
    props.prop.opt2.operationId
  }(${Object.keys(ParameterTemplate)})`;
  let responsePrefixes = {
    dashboard: "dashboard",
    category: props.prop.opt2.category,
    operationId: props.prop.opt2.operationId,
  };

  let responseCode = Object.keys(props.prop.opt2.responses);

  let jsonExample = "";

  if (responseCode[0] === "204") {
    jsonExample = JSON.stringify(
      props.prop.opt2.responses[Object.keys(props.prop.opt2.responses)].description,
      null,
      2
    );
  } else {
    jsonExample = JSON.stringify(
      props.prop.opt2.responses[Object.keys(props.prop.opt2.responses)].examples,
      null,
      2
    );
  }

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (firstRender) {
      return;
    }

    async function ApiCall() {
      setloadingSubmitEnpoint(true);
      await axios
        .post("http://localhost:8000/ApiCall", {
          apiKey: apiKey,
          ParameterTemplate: ParameterTemplate,
          responsePrefixes: responsePrefixes,
          responseString: responseString,
          isLoopModeActive: isLoopModeActive,
          networksIDSelected: networksIDSelected,
          devicesIDSelected: devicesIDSelected,
          usefulParameter: usefulParameter,
        })
        .then((data) => {
          if (data.data.error) {
            console.log(data.data.error);
            setnotificationMessage(`Error: ${data.data.error}`);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setloadingSubmitEnpoint(false);
            setopenSummaryModal(!openSummaryModal);
          } else {
            if (isLoopModeActive === false) {
              // if data.data return only 1 object (no loopMode)
              setJSONtoTable(<JsonToTable json={{ [data.data[usefulParameter]]: data.data }} />);
              setlazyLog(
                <LazyLog
                  extraLines={1}
                  enableSearch={true}
                  text={JSON.stringify(data.data, null, 4)}
                  stream={true}
                  caseInsensitive={true}
                  selectableLines={true}
                  // height="450px"
                />
              );
            } else {
              // if data.data returns more objects (loopMode active)
              if (usefulParameter === "networkId") {
                let NewjsonToModify = {};
                data.data.map((opt, index) => {
                  NewjsonToModify[networksIDSelected[index]] = opt;
                  // NewjsonToModify[opt[usefulParameter]] = opt;
                });

                setJSONtoTable(<JsonToTable json={NewjsonToModify} />);
                setlazyLog(
                  <LazyLog
                    extraLines={1}
                    enableSearch={true}
                    text={JSON.stringify(data.data, null, 4)}
                    stream={true}
                    caseInsensitive={true}
                    selectableLines={true}
                    // height="450px"
                  />
                );
              } else if (usefulParameter === "serial") {
                let NewjsonToModify = {};
                data.data.map((opt, index) => {
                  NewjsonToModify[devicesIDSelected[index]] = opt;
                  // NewjsonToModify[opt[usefulParameter]] = opt;
                });

                setJSONtoTable(<JsonToTable json={NewjsonToModify} />);
                setlazyLog(
                  <LazyLog
                    extraLines={1}
                    enableSearch={true}
                    text={JSON.stringify(data.data, null, 4)}
                    stream={true}
                    caseInsensitive={true}
                    selectableLines={true}
                    // height="450px"
                  />
                );
              }
            }
          }
        })
        .then(() => {
          setloadingSubmitEnpoint(false);
          setopenSummaryModal(!openSummaryModal);
          setopenResultsModal(!openResultsModal);
        });
    }
    ApiCall();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingSubmitEnpoint(false);
    };
  }, [triggerSubmit]);

  const HandleParameters = async (e, opt, props, index) => {
    ParameterTemplate[opt.name] = e.target.value;
    setParameterTemplate({ ...ParameterTemplate });

    if (ParameterTemplate[opt.name] === "") {
      // remove parameter if input is cleared or emptied

      delete ParameterTemplate[opt.name];
      setParameterTemplate({ ...ParameterTemplate });
    }
  };

  function onLoopMode(e) {
    setisLoopModeActive(e.target.checked);
    let inputtt = document.getElementById(usefulParameter);

    if (usefulParameter === "networkId") {
      if (e.target.checked) {
        document.getElementById(usefulParameter).setAttribute("disabled", "disabled");
        let IDList = networksIDSelected.join(", ");
        inputtt.value = IDList;
      } else {
        inputtt.value = "";
        document.getElementById(usefulParameter).removeAttribute("disabled");
        setParameterTemplate({});
      }
    } else if (usefulParameter === "serial") {
      if (e.target.checked) {
        document.getElementById(usefulParameter).setAttribute("disabled", "disabled");
        let IDList = devicesIDSelected.join(", ");
        inputtt.value = IDList;
      } else {
        inputtt.value = "";
        document.getElementById(usefulParameter).removeAttribute("disabled");
        setParameterTemplate({});
      }
    }
  }

  let ac = {
    networksSelected,
    setnetworksSelected,
    devicesSelected,
    setdevicesSelected,
    props,
    documentationLink,
    ParameterTemplate,
    networksIDSelected,
    devicesIDSelected,
    isLoopModeActive,
    triggerSubmit,
    settriggerSubmit,
    JSONtoTable,
    lazyLog,
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        {openOrganizationsModal ? <OrganizationsModal dc={ac} /> : <div></div>}
        {openNetworksModal ? <NetworksModal dc={ac} /> : <div></div>}
        {openDevicesModal ? <DevicesModal dc={ac} /> : <div></div>}
        {openSummaryModal ? <SummaryModal dc={ac} /> : <div></div>}
        {openResultsModal ? <ResultsModal dc={ac} /> : <div></div>}

        <div className="content-header" style={{ padding: "20px 0.5rem 5px 5px" }}>
          <div className="card">
            <div className="card-body" style={{ padding: "10px" }}>
              <div className="row align-items-center">
                <div className="col-sm-6">
                  <h1 className="m-0">
                    <a href={documentationLink} target="_blank" className="m-0">
                      {props.prop.opt2.operationId}
                    </a>
                  </h1>
                  {props.prop.opt2.type === "get" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-green">
                      {props.prop.opt2.type.toUpperCase()}
                    </span>
                  ) : props.prop.opt2.type === "post" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-orange">
                      {props.prop.opt2.type.toUpperCase()}
                    </span>
                  ) : props.prop.opt2.type === "put" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-blue">
                      {props.prop.opt2.type.toUpperCase()}
                    </span>
                  ) : props.prop.opt2.type === "delete" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-danger">
                      {props.prop.opt2.type.toUpperCase()}
                    </span>
                  ) : (
                    <div></div>
                  )}
                  <span className="Endpointdescription">{props.prop.opt2.prefix}</span>
                  <div>
                    <span className="Endpointdescription">{props.prop.opt2.description}</span>
                  </div>
                </div>
                {OrganizationSelected.id ? (
                  <div className="ml-auto mr-3">
                    <h1 className="m-0">
                      <a href={OrganizationSelected.url} target="_blank" className="m-0">
                        {OrganizationSelected.name}
                      </a>
                    </h1>
                    <span
                      style={{ marginRight: "3px", backgroundColor: "#17a2b8" }}
                      className="badge"
                    >
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
        </div>
        <div className="col-lg-12">
          <div className="card">{<ExplorerNavbar />}</div>
        </div>

        <Split className="split">
          <div>
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header p-2">
                  <ul className="nav nav-pills align-items-center">
                    <li className="nav-item">
                      <a className="nav-link active" href="#activity" data-toggle="tab">
                        Explorer
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#timeline" data-toggle="tab">
                        Parameters
                      </a>
                    </li>
                    <li className="nav-item">
                      <a className="nav-link" href="#authentication" data-toggle="tab">
                        Authentication
                      </a>
                    </li>
                    <li className="nav-item ml-auto">
                      <div className="custom-control custom-switch custom-switch-on-success">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="loopMode"
                          onClick={(e) => onLoopMode(e)}
                          disabled={
                            networksSelected.length === 0 && devicesSelected.length === 0
                              ? true
                              : false
                          }
                        />
                        <label className="custom-control-label" htmlFor="loopMode">
                          {`Loop ${usefulParameter}`}
                        </label>
                      </div>
                    </li>
                  </ul>
                </div>
                <div className="card-body">
                  <div className="tab-content">
                    <div className="active tab-pane" id="activity">
                      <div className="post">
                        <span className="username">
                          <h5 href="#">Parameters</h5>
                        </span>
                        <div>
                          <form>
                            <div className="form-group">
                              {props.prop.opt2.parameters.map((opt, index) => {
                                return (
                                  <div key={index}>
                                    <label>{opt.name}</label>
                                    <p style={{ fontSize: "13px" }}>{opt.description}</p>
                                    <input
                                      id={opt.name}
                                      type="text"
                                      placeholder={opt.required ? "required" : "optional"}
                                      className="form-control form-control-sm parameter-input"
                                      required={opt.required}
                                      onChange={(e) =>
                                        HandleParameters(e, opt, props.prop.opt2, index)
                                      }
                                    />
                                    <div></div>
                                  </div>
                                );
                              })}
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane" id="authentication">
                      {<Authentication prop={props.prop} />}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setopenSummaryModal(!openSummaryModal)}
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className="col-lg-12">
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-header p-2">
                      <ul className="nav nav-pills">
                        <li className="nav-item">
                          <a className="nav-link active" href="#activity" data-toggle="tab">
                            Explorer
                          </a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#timeline" data-toggle="tab">
                            Parameters
                          </a>
                        </li>
                        <li className="nav-item">
                          <a className="nav-link" href="#settings" data-toggle="tab">
                            Settings
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="card-body">
                      <div className="tab-content">
                        <div className="active tab-pane" id="activity">
                          <div className="post">
                            <span className="username">
                              <h5 href="#">Example Response (as JSON)</h5>
                              <p href="#">{`Response Code: ${responseCode[0]}`} </p>
                            </span>
                            <CodeMirror
                              value={jsonExample}
                              // minHeight="700px"
                              extensions={[javascript({ jsx: true })]}
                              theme={oneDark}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Split>
      </div>
    </div>
  );
}

export default Explorer;
