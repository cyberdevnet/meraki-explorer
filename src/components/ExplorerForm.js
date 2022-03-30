// @ts-nocheck
import { useEffect, useState } from "react";
import axios from "axios";
import { produce, current } from "immer";
import _ from "lodash";
import { useRecoilState } from "recoil";
import Split from "react-split";
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
import JSONInput from "react-json-editor-ajrm/index";
import locale from "react-json-editor-ajrm/locale/en";
import Form from "@rjsf/bootstrap-4";
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

function ExplorerForm(props) {
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const firstRender = useFirstRender();
  const [ParameterTemplate, setParameterTemplate] = useState({});
  console.log("🚀 ~ file: ExplorerForm.js ~ line 41 ~ ExplorerForm ~ ParameterTemplate", ParameterTemplate);
  const [ParameterTemplateJSON, setParameterTemplateJSON] = useState({});
  const [onLoopFormData, setonLoopFormData] = useState({});
  const [usefulInputDisabled, setusefulInputDisabled] = useState(false);
  const [triggerSubmit, settriggerSubmit] = useState(false);
  const [openNetworksModal, setopenNetworksModal] = useRecoilState(openNetworksModalState);
  const [openOrganizationsModal, setopenOrganizationsModal] = useRecoilState(openOrganizationsModalState);
  const [openResultsModal, setopenResultsModal] = useRecoilState(openResultsModalState);
  const [openSummaryModal, setopenSummaryModal] = useRecoilState(openSummaryModalState);
  const [openDevicesModal, setopenDevicesModal] = useRecoilState(openDevicesModalState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [organizationIDSelected, setorganizationIDSelected] = useState([]);
  const [networksSelected, setnetworksSelected] = useState([]);
  const [networksIDSelected, setnetworksIDSelected] = useState([]);
  const [devicesSelected, setdevicesSelected] = useState([]);
  const [devicesIDSelected, setdevicesIDSelected] = useState([]);
  const [lazyLog, setlazyLog] = useState([]);
  const [JSONtoTable, setJSONtoTable] = useState([]);
  const [webSocketLogs, setwebSocketLogs] = useState([]);
  const [JSONresults, setJSONresults] = useState({});
  const [textLogFile, settextLogFile] = useState("");
  const [globalLog, setglobalLog] = useState("");
  const [checkedBox, setcheckedBox] = useState(false);
  const [triggerLogFile, settriggerLogFile] = useState(false);
  const [isLoopModeActive, setisLoopModeActive] = useState(false);
  const [useJsonBody, setuseJsonBody] = useState(false);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [usefulParameter, setusefulParameter] = useRecoilState(usefulParameterState);

  //=================== GET NETWORKs AND DEVICES IDs =====================
  let NetIDModel = [];
  let DeviceIDModel = [];
  useEffect(() => {
    if (firstRender) {
      return;
    }

    setorganizationIDSelected(OrganizationSelected.id);

    networksSelected.map((opt) => {
      NetIDModel.push(opt.id);
    });
    setnetworksIDSelected(NetIDModel);

    devicesSelected.map((opt) => {
      DeviceIDModel.push(opt.serial);
    });
    setdevicesIDSelected(DeviceIDModel);
  }, [OrganizationSelected, networksSelected, devicesSelected]);

  //=============================================================

  //=================== GET USEFUL PARAMETERS =====================

  let parametersArray = ["serial", "organizationId", "networkId"];

  useEffect(() => {
    props.prop.opt2.parameters.map((opt) => {
      if (parametersArray.includes(opt.name)) {
        setusefulParameter(opt.name);
      }
    });
  }, [props]);

  // =================== RESET input & ParameterTemplate and loopMode =====================
  // every time endpoint change, reset  ParameterTemplate and LoopMode
  useEffect(() => {
    setParameterTemplate({});
    setParameterTemplateJSON({});
    setonLoopFormData({});
    setusefulInputDisabled(false);

    setisLoopModeActive(false);
    setcheckedBox(false);
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

  let responseString = `dashboard.${props.prop.opt2.category}.${props.prop.opt2.operationId}(${Object.keys(
    ParameterTemplate
  )})`;
  let responsePrefixes = {
    dashboard: "dashboard",
    category: props.prop.opt2.category,
    operationId: props.prop.opt2.operationId,
  };

  let responseCode = Object.keys(props.prop.opt2.responses);

  let jsonExample = "";

  if (responseCode[0] === "204") {
    jsonExample = { response: props.prop.opt2.responses[Object.keys(props.prop.opt2.responses)].description };
  } else {
    jsonExample = JSON.stringify(
      Object.values(props.prop.opt2.responses[Object.keys(props.prop.opt2.responses)].examples),
      null,
      2
    );
  }

  // WEBSOCKET LOG COLLECTION //
  var ws_global = null;
  useEffect(() => {
    if (firstRender) {
      return;
    }

    ws_global = new WebSocket("ws://localhost:8000/ws_global");
    ws_global.onopen = () => ws_global.send("Connected");
    ws_global.onmessage = (event) => {
      setglobalLog(event.data);
    };
  }, [triggerLogFile]);

  // WEBSOCKET REAL-TIME LOG FROM ENDPOINT //
  var ws = null;
  useEffect(() => {
    if (firstRender) {
      return;
    }
    ws = new WebSocket("ws://localhost:8000/ws");
    ws.onopen = () => ws.send("Connected");
    ws.onmessage = (event) => {
      setwebSocketLogs(
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
          useJsonBody,
          ParameterTemplateJSON,
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
            setnotificationMessage(`Error: ${JSON.stringify(data.data.error)}`);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setloadingSubmitEnpoint(false);
            setopenSummaryModal(!openSummaryModal);
          } else {
            if (isLoopModeActive === false) {
              // if data.data return only 1 object (no loopMode)
              setJSONtoTable(<JsonToTable json={{ [ParameterTemplate[usefulParameter]]: data.data }} />);
              setlazyLog(
                <LazyLog
                  extraLines={1}
                  enableSearch={true}
                  text={JSON.stringify(data.data, null, 4)}
                  stream={true}
                  caseInsensitive={true}
                  selectableLines={true}
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

  function onLoopMode(e) {
    setisLoopModeActive(e.target.checked);
    setcheckedBox(!checkedBox);

    if (usefulParameter === "networkId") {
      if (e.target.checked) {
        let IDList = networksIDSelected.join(", ");
        setonLoopFormData({ [usefulParameter]: IDList });
        setusefulInputDisabled(true);
        setParameterTemplate({ [usefulParameter]: IDList });
        setdevicesSelected([]);
      } else {
        setonLoopFormData({});
        setusefulInputDisabled(false);
        setParameterTemplate({});
        setdevicesSelected([]);
      }
    } else if (usefulParameter === "serial") {
      if (e.target.checked) {
        let IDList = devicesIDSelected.join(", ");
        setonLoopFormData({ [usefulParameter]: IDList });
        setusefulInputDisabled(true);
        setParameterTemplate({ [usefulParameter]: IDList });
        setnetworksSelected([]);
      } else {
        setonLoopFormData({});
        setusefulInputDisabled(false);
        setParameterTemplate({});
        setnetworksSelected([]);
      }
    }
  }

  function updateJSONBody(e) {
    setParameterTemplateJSON(e.jsObject);
  }

  let properties = {};
  props.prop.opt2.parameters.map((opt, index) => {
    if (opt.in === "path" || opt.in === "query") {
      Object.assign(properties, { [props.prop.opt2.parameters[index].name]: opt });
    }

    if (opt.in === "body") {
      Object.assign(properties, { ...opt.schema.properties });
    }
  });

  const schema = {
    properties: properties,
  };

  const uiSchema = {
    [usefulParameter]: {
      "ui:disabled": usefulInputDisabled,
    },
  };

  // workaround for bug  React 17 submit event not bubbling
  // https://github.com/rjsf-team/react-jsonschema-form/issues/2104

  const getFormData = ({ formData }, e) => {
    console.log("🚀 ~ file: ExplorerForm.js ~ line 356 ~ getFormData ~ formData", formData);
    const data = produce(ParameterTemplate, (draft) => {
      draft.ParameterTemplate = formData;
    });
    setParameterTemplate(data.ParameterTemplate);
    setonLoopFormData(formData);
  };

  const OpenModal = () => {
    setopenSummaryModal(!openSummaryModal);
  };

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
    webSocketLogs,
    useJsonBody,
    ParameterTemplateJSON,
    setonLoopFormData,
    setusefulInputDisabled,
    setisLoopModeActive,
    setcheckedBox,
    checkedBox,
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
                    <a href={documentationLink} target="_blank" className="m-0 ac-dashboard">
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
        </div>
        <div className="col-lg-12">
          <div className="card">{<ExplorerNavbar dc={ac} />}</div>
        </div>

        <Split className="split" sizes={[70, 33]} minSize={[500, 520]}>
          <div>
            <div className="col-lg-12">
              <div className="card">
                <div className="card-header p-2">
                  <ul className="nav nav-pills align-items-center">
                    <li className="nav-item">
                      <a
                        style={{ margin: "3px" }}
                        className="btn btn-sm btn-outline-info active"
                        href="#explorer"
                        data-toggle="tab"
                      >
                        Explorer
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        onClick={() => settriggerLogFile(!triggerLogFile)}
                        style={{ margin: "3px" }}
                        className="btn btn-sm btn-outline-info"
                        href="#logs"
                        data-toggle="tab"
                      >
                        Logs
                      </a>
                    </li>
                    <li className="nav-item">
                      <a
                        style={{ margin: "3px" }}
                        className="btn btn-sm btn-outline-info"
                        href="#authentication"
                        data-toggle="tab"
                      >
                        Authentication
                      </a>
                    </li>
                    <li className="nav-item ml-auto">
                      <div className="custom-control custom-switch custom-switch-on-success">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="loopMode"
                          checked={checkedBox}
                          onClick={(e) => onLoopMode(e)}
                          disabled={networksSelected.length === 0 && devicesSelected.length === 0 ? true : false}
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
                    <div className="active tab-pane" id="explorer">
                      <div className="post">
                        <ul className="nav nav-pills align-items-center">
                          <span className="username">
                            <h5 href="#">Parameters</h5>
                          </span>
                          <li className="nav-item ml-auto">
                            <div className="custom-control custom-switch custom-switch-on-success">
                              <input
                                type="checkbox"
                                className="custom-control-input"
                                id="JSONBody"
                                onClick={() => setuseJsonBody(!useJsonBody)}
                              />
                              <label className="custom-control-label" htmlFor="JSONBody">
                                JSON Body
                              </label>
                            </div>
                          </li>
                        </ul>
                        <div>
                          <form>
                            <div className="form-group">
                              {useJsonBody ? (
                                <div className="">
                                  <JSONInput
                                    placeholder={ParameterTemplateJSON}
                                    theme="dark_vscode_tribute"
                                    locale={locale}
                                    colors={{
                                      string: "#DAA520",
                                      background: "#343a40",
                                    }}
                                    height="420px"
                                    style={{
                                      body: { fontSize: "13px" },
                                      outerBox: { width: "100%" },
                                      container: { width: "100%" },
                                    }}
                                    onChange={(e) => updateJSONBody(e)}
                                  />
                                </div>
                              ) : (
                                <Form
                                  schema={schema}
                                  onChange={getFormData}
                                  formData={onLoopFormData}
                                  uiSchema={uiSchema}
                                  // onSubmit={() => console.log("ciao")}
                                  noValidate={true}
                                >
                                  <div>
                                    <button type="button" className="btn btn-sm btn-outline-info" onClick={OpenModal}>
                                      Submit
                                    </button>
                                  </div>
                                </Form>
                              )}
                            </div>
                          </form>
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane" id="logs">
                      <div className="post">
                        <span className="username">
                          <h5 href="#">Logs</h5>
                        </span>
                        <div style={{ minHeight: "500px" }}>
                          <LazyLog
                            extraLines={1}
                            enableSearch={true}
                            text={globalLog ? globalLog : "no global_logs"}
                            stream={true}
                            caseInsensitive={true}
                            selectableLines={true}
                            follow
                          />
                        </div>
                      </div>
                    </div>
                    <div className="tab-pane" id="authentication">
                      {<Authentication prop={props.prop} />}
                    </div>
                  </div>
                </div>
                <div className="card-footer">
                  {/* <button
                    type="button"
                    className="btn btn-sm btn-outline-info"
                    onClick={() => setopenSummaryModal(!openSummaryModal)}
                  >
                    Submit
                  </button> */}
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
                          <a className="btn btn-sm btn-outline-info active" href="#Example" data-toggle="tab">
                            Example
                          </a>
                        </li>
                      </ul>
                    </div>
                    <div className="card-body">
                      <div className="tab-content">
                        <div className="active tab-pane" id="Example">
                          <div className="post">
                            <span className="username">
                              <h5 href="#">Example Response (as JSON)</h5>
                              <p href="#">{`Response Code: ${responseCode[0]}`} </p>
                            </span>
                            <JSONInput
                              // placeholder={jsonExample === "" ? {} : JSON.parse(jsonExample)} // data to display: ;
                              placeholder={
                                jsonExample === ""
                                  ? {}
                                  : responseCode[0] === "204"
                                  ? jsonExample
                                  : JSON.parse(jsonExample)
                              } // data to display: ;
                              theme="dark_vscode_tribute"
                              locale={locale}
                              viewOnly={true}
                              colors={{
                                string: "#DAA520", // overrides theme colors with whatever color value you want
                                background: "#343a40",
                              }}
                              height="545px"
                              style={{
                                body: { fontSize: "13px" },
                                outerBox: { width: "100%" },
                                container: { width: "100%" },
                              }}
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

export default ExplorerForm;
