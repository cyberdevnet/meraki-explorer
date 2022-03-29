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
  console.log(
    "🚀 ~ file: Explorer.js ~ line 40 ~ Explorer ~ ParameterTemplate",
    JSON.stringify(ParameterTemplate, null, 2)
  );
  const [ParameterTemplateJSON, setParameterTemplateJSON] = useState({});
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
  const [triggerLogFile, settriggerLogFile] = useState(false);
  const [isLoopModeActive, setisLoopModeActive] = useState(false);
  const [useJsonBody, setuseJsonBody] = useState(false);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);

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
    let inputtt = Array.from(document.getElementsByClassName("form-control form-control-sm parameter-input"));
    inputtt.map((opt) => {
      opt.value = "";
    });
    setParameterTemplate({});
    setParameterTemplateJSON({});

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

  const HandleParameters = async (e, opt, isMultiParameters, parameterTitle, parameterKey, nestedParameterKey) => {
    if (isMultiParameters === false) {
      const newParam = produce(ParameterTemplate, (draft) => {
        draft[opt] = e.target.value;
        let currentParam = current(draft);
        if (currentParam[opt] === "") {
          // remove object if input is cleared or emptied
          delete draft[opt];
        }
      });
      setParameterTemplate(newParam);
    } else if (isMultiParameters === true) {
      if (nestedParameterKey !== undefined) {
        // handle nested object like createNetworkSwitchAccessPolicy
        const nestedParam = produce(ParameterTemplate, (draft) => {
          if (!draft[parameterTitle]) {
            //if nestedParam does not exist we add it
            draft[parameterTitle] = { [parameterKey]: { [nestedParameterKey]: e.target.value } };
          } else {
            // if nestedParam exists we modyfy it
            if (draft[parameterTitle][parameterKey]) {
              // at least one parameterKey already exist and we modify it
              draft[parameterTitle][parameterKey][nestedParameterKey] = e.target.value;
            } else {
              //one parameterKey already exist and we others
              draft[parameterTitle][parameterKey] = { [nestedParameterKey]: e.target.value };
            }
            let currentParam = current(draft);

            if (currentParam[parameterTitle][parameterKey][nestedParameterKey] === "") {
              delete draft[parameterTitle][parameterKey][nestedParameterKey];
            }
            let currentAfterDelete = current(draft);
            if (_.isEmpty(currentAfterDelete[parameterTitle][parameterKey])) {
              // remove parameterTitle if input is cleared or emptied

              delete draft[parameterTitle][parameterKey];
            }
          }
        });

        setParameterTemplate(nestedParam);
      } else {
        const newParam = produce(ParameterTemplate, (draft) => {
          if (!draft[parameterTitle]) {
            //if newParam does not exist we add it
            draft[parameterTitle] = { [parameterKey]: e.target.value };
          } else {
            // if newParam exists we modyfy it
            draft[parameterTitle][parameterKey] = e.target.value;
            let currentParam = current(draft);

            if (currentParam[parameterTitle][parameterKey] === "") {
              // remove object if input is cleared or emptied
              delete draft[parameterTitle][parameterKey];
            }
            let currentAfterDelete = current(draft);

            if (_.isEmpty(currentAfterDelete[parameterTitle])) {
              // remove parameterTitle if input is cleared or emptied
              delete draft[parameterTitle];
            }
          }
        });

        setParameterTemplate(newParam);
      }
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
        setParameterTemplate({});
        setdevicesSelected([]);
      } else {
        inputtt.value = "";
        document.getElementById(usefulParameter).removeAttribute("disabled");
        setParameterTemplate({});
        setdevicesSelected([]);
      }
    } else if (usefulParameter === "serial") {
      if (e.target.checked) {
        document.getElementById(usefulParameter).setAttribute("disabled", "disabled");
        let IDList = devicesIDSelected.join(", ");
        inputtt.value = IDList;
        setParameterTemplate({});
        setnetworksSelected([]);
      } else {
        inputtt.value = "";
        document.getElementById(usefulParameter).removeAttribute("disabled");
        setParameterTemplate({});
        setnetworksSelected([]);
      }
    }
  }

  function updateJSONBody(e) {
    setParameterTemplateJSON(e.jsObject);
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
    webSocketLogs,
    useJsonBody,
    ParameterTemplateJSON,
  };

  // console.log(JSON.stringify(props.prop.opt2.parameters, null, 2));

  let properties = {};
  props.prop.opt2.parameters.map((opt, index) => {
    console.log("🚀 ~ file: Explorer.js ~ line 437 ~ props.prop.opt2.parameters.map ~ opt", opt);

    console.log("param: ", props.prop.opt2.parameters[0].name);

    if (opt.in === "path") {
      Object.assign(properties, { [props.prop.opt2.parameters[0].name]: opt });
    }

    if (opt.in === "body") {
      // console.log(
      //   "🚀 ~ file: Explorer.js ~ line 431 ~ props.prop.opt2.parameters.map ~ opt",
      //   JSON.stringify(opt.schema.properties, null, 2)
      // );
      Object.assign(properties, { ...opt.schema.properties });
    }
  });

  console.log("🚀 ~ file: Explorer.js ~ line 429 ~ Explorer ~ properties", JSON.stringify(properties, null, 2));

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
          <div className="card">{<ExplorerNavbar />}</div>
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
                                // disabled={
                                //   networksSelected.length === 0 && devicesSelected.length === 0
                                //     ? true
                                //     : false
                                // }
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
                              {props.prop.opt2.parameters.map((opt, index) => {
                                let opt_name = opt.name;
                                let isMultiParameters = false;
                                return (
                                  <div>
                                    {useJsonBody ? (
                                      opt.in === "path" ? (
                                        <div key={index}>
                                          <label>{opt.name}</label>
                                          <p style={{ fontSize: "13px", marginBottom: "0px" }}>{opt.description}</p>
                                          <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt.type}</p>
                                          <input
                                            id={opt.name}
                                            type="text"
                                            placeholder={opt.required ? "required" : "optional"}
                                            className="form-control form-control-sm parameter-input"
                                            required={opt.required}
                                            onChange={(e) => HandleParameters(e, opt_name, isMultiParameters)}
                                          />
                                          <hr className="solid"></hr>
                                        </div>
                                      ) : (
                                        <div className="">
                                          <JSONInput
                                            placeholder={ParameterTemplateJSON} // data to display
                                            theme="dark_vscode_tribute"
                                            locale={locale}
                                            colors={{
                                              string: "#DAA520", // overrides theme colors with whatever color value you want
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
                                      )
                                    ) : opt.in === "path" ? (
                                      <div key={index}>
                                        <label>{opt.name}</label>
                                        <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                          {opt.description}
                                          <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt.type}</p>
                                        </p>
                                        <input
                                          id={opt.name}
                                          type="text"
                                          placeholder={opt.required ? "required" : "optional"}
                                          className="form-control form-control-sm parameter-input"
                                          required={opt.required}
                                          onChange={(e) => HandleParameters(e, opt_name, isMultiParameters)}
                                        />
                                      </div>
                                    ) : opt.in === "query" ? (
                                      <div key={index}>
                                        <label>{opt.name}</label>
                                        <p style={{ fontSize: "13px", marginBottom: "10px", marginBottom: "10px" }}>
                                          {opt.description}
                                          <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt.type}</p>
                                        </p>
                                        <input
                                          id={opt.name}
                                          type="text"
                                          placeholder={opt.required ? "required" : "optional"}
                                          className="form-control form-control-sm parameter-input"
                                          required={opt.required}
                                          onChange={(e) => HandleParameters(e, opt_name, isMultiParameters)}
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        {Object.values(opt.schema.properties).map((opt2, index2) => {
                                          let opt_name1 = Object.keys(opt.schema.properties)[index2];
                                          return opt2.type === "string" ? (
                                            <div key={Object.keys(opt.schema.properties)[index2]}>
                                              <label>{Object.keys(opt.schema.properties)[index2]}</label>
                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                {opt2.description}
                                                <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt2.type}</p>
                                              </p>
                                              <input
                                                id={opt2.description}
                                                type="text"
                                                placeholder={opt2.enum ? opt2.enum : ""}
                                                className="form-control form-control-sm parameter-input"
                                                // required={opt.required}
                                                onChange={(e) => HandleParameters(e, opt_name1, isMultiParameters)}
                                              />
                                            </div>
                                          ) : opt2.type === "number" ? (
                                            <div key={Object.keys(opt.schema.properties)[index2]}>
                                              <label>{Object.keys(opt.schema.properties)[index2]}</label>
                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                {opt2.description}
                                                <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt2.type}</p>
                                              </p>
                                              <input
                                                id={opt2.description}
                                                type="text"
                                                placeholder={opt2.enum ? opt2.enum : ""}
                                                className="form-control form-control-sm parameter-input"
                                                // required={opt.required}
                                                onChange={(e) => HandleParameters(e, opt_name1, isMultiParameters)}
                                              />
                                            </div>
                                          ) : opt2.type === "boolean" ? (
                                            <div key={Object.keys(opt.schema.properties)[index2]}>
                                              <label>{Object.keys(opt.schema.properties)[index2]}</label>
                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                {opt2.description}
                                                <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt2.type}</p>
                                              </p>
                                              <input
                                                id={opt2.description}
                                                type="text"
                                                placeholder={opt2.enum ? opt2.enum : ""}
                                                className="form-control form-control-sm parameter-input"
                                                // required={opt.required}
                                                onChange={(e) => HandleParameters(e, opt_name1, isMultiParameters)}
                                              />
                                            </div>
                                          ) : opt2.type === "integer" ? (
                                            <div key={Object.keys(opt.schema.properties)[index2]}>
                                              <label>{Object.keys(opt.schema.properties)[index2]}</label>
                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                {opt2.description}
                                                <p style={{ fontSize: "10px", fontStyle: "italic" }}>{opt2.type}</p>
                                              </p>
                                              <input
                                                id={opt2.description}
                                                type="text"
                                                placeholder={opt2.enum ? opt2.enum : ""}
                                                className="form-control form-control-sm parameter-input"
                                                // required={opt.required}
                                                onChange={(e) => HandleParameters(e, opt_name1, isMultiParameters)}
                                              />
                                            </div>
                                          ) : opt2.type === "object" ? (
                                            <div key={Object.keys(opt.schema.properties)[index2]}>
                                              <hr className="solid"></hr>
                                              <label>{Object.keys(opt.schema.properties)[index2]}</label>
                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                {opt2.description}
                                              </p>
                                              {opt2.properties ? (
                                                Object.values(opt2.properties).map((opt4, index4) => {
                                                  let isMultiParameters = true;
                                                  let parameterTitle = Object.keys(opt.schema.properties)[index2];
                                                  let parameterKey = Object.keys(opt2.properties)[index4];

                                                  let opt_name2 = Object.keys(opt2.properties)[index4];
                                                  return opt4.type === "object" ? (
                                                    <div key={opt4.description}>
                                                      <label>{Object.keys(opt2.properties)[index4]}</label>
                                                      <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                        {opt4.description}
                                                      </p>
                                                      {Object.values(opt4.properties).map((opt8, index8) => {
                                                        let opt_name9 = Object.keys(opt4.properties)[index8];
                                                        let nestedParameterKey = Object.keys(opt4.properties)[index8];
                                                        return (
                                                          <div key={opt8.description}>
                                                            <label>{Object.keys(opt4.properties)[index8]}</label>
                                                            <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                              {opt8.description}
                                                              <p style={{ fontSize: "10px", fontStyle: "italic" }}>
                                                                {opt8.type}
                                                              </p>
                                                            </p>
                                                            <input
                                                              id={opt4.description}
                                                              type="text"
                                                              placeholder={opt4.enum ? opt4.enum : ""}
                                                              className="form-control form-control-sm parameter-input"
                                                              // required={opt.required}
                                                              onChange={(e) =>
                                                                HandleParameters(
                                                                  e,
                                                                  opt_name9,
                                                                  isMultiParameters,
                                                                  parameterTitle,
                                                                  parameterKey,
                                                                  nestedParameterKey
                                                                )
                                                              }
                                                            />
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  ) : (
                                                    <div key={opt4.description}>
                                                      <label>{Object.keys(opt2.properties)[index4]}</label>

                                                      <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                        {opt4.description}
                                                        <p style={{ fontSize: "10px", fontStyle: "italic" }}>
                                                          {opt4.type}
                                                        </p>
                                                      </p>
                                                      <input
                                                        id={opt4.description}
                                                        type="text"
                                                        placeholder={opt4.enum ? opt4.enum : ""}
                                                        className="form-control form-control-sm parameter-input"
                                                        // required={opt.required}
                                                        onChange={(e) =>
                                                          HandleParameters(
                                                            e,
                                                            opt_name2,
                                                            isMultiParameters,
                                                            parameterTitle,
                                                            parameterKey
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  );
                                                })
                                              ) : (
                                                <div key={Object.keys(opt.schema.properties)[index2]}>
                                                  <hr className="solid"></hr>
                                                  <label>{Object.keys(opt.schema.properties)[index2]}</label>

                                                  <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                    {opt2.description}
                                                  </p>
                                                  {Object.values(opt2.properties).map((opt7, index7) => {
                                                    return (
                                                      <div key={Object.keys(opt2.properties)[index7]}>
                                                        <hr className="solid"></hr>
                                                        <label>{Object.keys(opt2.properties)[index7]}</label>

                                                        <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                          {opt7.description}
                                                        </p>
                                                        {Object.values(opt7.properties).map((opt8, index8) => {
                                                          let opt_name8 = Object.keys(opt7.properties)[index8];
                                                          return (
                                                            <div key={Object.keys(opt7.properties)[index8]}>
                                                              <label>{Object.keys(opt7.properties)[index8]}</label>

                                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                                {opt8.description}
                                                              </p>
                                                              <input
                                                                id={opt8.description}
                                                                type="text"
                                                                placeholder={opt8.enum ? opt8.enum : ""}
                                                                className="form-control form-control-sm parameter-input"
                                                                // required={opt.required}
                                                                onChange={(e) =>
                                                                  HandleParameters(e, opt_name8, isMultiParameters)
                                                                }
                                                              />
                                                            </div>
                                                          );
                                                        })}
                                                      </div>
                                                    );
                                                  })}
                                                </div>
                                              )}
                                            </div>
                                          ) : (
                                            <div key={Object.keys(opt.schema.properties)[index2]}>
                                              <hr className="solid"></hr>
                                              <label>{Object.keys(opt.schema.properties)[index2]}</label>

                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                {opt2.description}
                                              </p>

                                              {opt2.properties ? (
                                                Object.values(opt2.properties).map((opt4, index4) => {
                                                  let isMultiParameters = true;
                                                  let parameterTitle = Object.keys(opt.schema.properties)[index2];
                                                  let parameterKey = Object.keys(opt2.properties)[index4];
                                                  let opt_name2 = Object.keys(opt2.properties)[index4];
                                                  return (
                                                    <div key={opt4.description}>
                                                      <label>{Object.keys(opt2.properties)[index4]}</label>

                                                      <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                        {opt4.description}
                                                        <p style={{ fontSize: "10px", fontStyle: "italic" }}>
                                                          {opt4.type}
                                                        </p>
                                                      </p>
                                                      <input
                                                        id={opt4.description}
                                                        type="text"
                                                        placeholder={opt4.enum ? opt4.enum : ""}
                                                        className="form-control form-control-sm parameter-input"
                                                        // required={opt.required}
                                                        onChange={(e) =>
                                                          HandleParameters(
                                                            e,
                                                            opt_name2,
                                                            isMultiParameters,
                                                            parameterTitle,
                                                            parameterKey
                                                          )
                                                        }
                                                      />
                                                    </div>
                                                  );
                                                })
                                              ) : opt2.items.properties !== undefined ? (
                                                Object.values(opt2.items.properties).map((opt3, index3) => {
                                                  {
                                                    console.log("check");
                                                  }
                                                  let isMultiParameters = true;
                                                  let parameterTitle = Object.keys(opt.schema.properties)[index2];
                                                  let parameterKey = Object.keys(opt2.items.properties)[index3];
                                                  let opt_name3 = Object.keys(opt2.items.properties)[index3];
                                                  return (
                                                    <div key={Object.keys(opt2.items.properties)[index3]}>
                                                      <label>{Object.keys(opt2.items.properties)[index3]}</label>

                                                      <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                        {opt3.description}
                                                      </p>

                                                      {opt3.properties ? (
                                                        Object.values(opt3.properties).map((opt5, index5) => {
                                                          let isMultiParameters = true;
                                                          let parameterTitle = Object.keys(opt.schema.properties)[
                                                            index2
                                                          ];
                                                          let parameterKey = Object.keys(opt3.properties)[index5];
                                                          return (
                                                            <div key={Object.keys(opt3.properties)[index5]}>
                                                              <label>{Object.keys(opt3.properties)[index5]}</label>
                                                              <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                                {opt5.description}
                                                                <p style={{ fontSize: "10px", fontStyle: "italic" }}>
                                                                  {opt5.type}
                                                                </p>
                                                              </p>
                                                              <input
                                                                id={opt5.description}
                                                                type="text"
                                                                placeholder={opt5.enum ? opt5.enum : ""}
                                                                className="form-control form-control-sm parameter-input"
                                                                // required={opt.required}
                                                                onChange={(e) =>
                                                                  HandleParameters(
                                                                    e,
                                                                    Object.keys(opt3.properties)[index5],
                                                                    isMultiParameters,
                                                                    parameterTitle,
                                                                    parameterKey
                                                                  )
                                                                }
                                                              />
                                                            </div>
                                                          );
                                                        })
                                                      ) : opt3.items ? (
                                                        opt3.items.properties ? (
                                                          Object.values(opt3.items.properties).map((opt6, index6) => {
                                                            let isMultiParameters = true;
                                                            let parameterTitle = Object.keys(opt3properties)[index5];
                                                            let parameterKey = Object.keys(opt3.items.properties)[
                                                              index6
                                                            ];
                                                            return (
                                                              <div key={Object.keys(opt3.items.properties)[index6]}>
                                                                <label>
                                                                  {Object.keys(opt3.items.properties)[index6]}
                                                                </label>
                                                                <p style={{ fontSize: "13px", marginBottom: "10px" }}>
                                                                  {opt6.description}
                                                                  <p style={{ fontSize: "10px", fontStyle: "italic" }}>
                                                                    {opt6.type}
                                                                  </p>
                                                                </p>
                                                                <input
                                                                  id={opt6.description}
                                                                  type="text"
                                                                  placeholder={opt6.enum ? opt6.enum : ""}
                                                                  className="form-control form-control-sm parameter-input"
                                                                  // required={opt.required}
                                                                  onChange={(e) =>
                                                                    HandleParameters(
                                                                      e,
                                                                      Object.keys(opt3.items.properties)[index6],
                                                                      isMultiParameters,
                                                                      parameterTitle,
                                                                      parameterKey
                                                                    )
                                                                  }
                                                                />
                                                              </div>
                                                            );
                                                          })
                                                        ) : (
                                                          <input
                                                            id={opt3.description}
                                                            type="text"
                                                            placeholder={opt3.enum ? opt3.enum : ""}
                                                            className="form-control form-control-sm parameter-input"
                                                            // required={opt.required}
                                                            onChange={(e) =>
                                                              HandleParameters(
                                                                e,
                                                                opt_name3,
                                                                isMultiParameters,
                                                                parameterTitle,
                                                                parameterKey
                                                              )
                                                            }
                                                          />
                                                        )
                                                      ) : (
                                                        <input
                                                          id={opt3.description}
                                                          type="text"
                                                          placeholder={opt3.enum ? opt3.enum : ""}
                                                          className="form-control form-control-sm parameter-input"
                                                          // required={opt.required}
                                                          onChange={(e) =>
                                                            HandleParameters(
                                                              e,
                                                              opt_name3,
                                                              isMultiParameters,
                                                              parameterTitle,
                                                              parameterKey
                                                            )
                                                          }
                                                        />
                                                      )}
                                                    </div>
                                                  );
                                                })
                                              ) : (
                                                <input
                                                  id={opt2.description}
                                                  type="text"
                                                  placeholder={opt2.enum ? opt2.enum : ""}
                                                  className="form-control form-control-sm parameter-input"
                                                  // required={opt.required}
                                                  onChange={(e) => HandleParameters(e, opt_name1, isMultiParameters)}
                                                />
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
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
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-info"
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

export default Explorer;
