// @ts-nocheck
import { useEffect, useState } from "react";
import axios from "axios";
import { produce, current } from "immer";
import _, { isArray } from "lodash";
import { useRecoilState } from "recoil";
import Split from "react-split";
import ExplorerNavbar from "./ExplorerNavbar";
import NetworksModal from "./NetworksModal";
import OrganizationsModal from "./OrganizationsModal";
import DevicesModal from "./DevicesModal";
import ResultsModal from "./ResultsModal";
import SummaryModal from "./SummaryModal";
import RollbackModal from "./RollbackModal";
import TaskManagerModal from "./TaskManagerModal";
import LogsModal from "./LogsModal";
import useFirstRender from "../main/useFirstRender";
import { LazyLog } from "react-lazylog";
import { JSONToHTMLTable } from "@kevincobain2000/json-to-html-table";
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
  openTaskManagerModalState,
  openRollbackModalState,
  openLogsModalState,
  authenticatedState,
  SingleOrganizationSelectedState,
  operationIdSelectedState,
} from "../main/GlobalState";
import "../styles/Explorer.css";

function ExplorerForm(props) {
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const firstRender = useFirstRender();
  const [ParameterTemplate, setParameterTemplate] = useState({});
  const [ParameterTemplateJSON, setParameterTemplateJSON] = useState({});
  const [onLoopFormData, setonLoopFormData] = useState({});
  const [usefulInputDisabled, setusefulInputDisabled] = useState(false);
  const [triggerSubmit, settriggerSubmit] = useState(false);
  const [openNetworksModal, setopenNetworksModal] = useRecoilState(openNetworksModalState);
  const [authenticated, setauthenticated] = useRecoilState(authenticatedState);
  const [openOrganizationsModal, setopenOrganizationsModal] = useRecoilState(openOrganizationsModalState);
  const [openLogsModal, setopenLogsModal] = useRecoilState(openLogsModalState);
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
  const [useJsonBody, setuseJsonBody] = useState(false);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [openTaskManagerModal, setopenTaskManagerModal] = useRecoilState(openTaskManagerModalState);
  const [usefulParameter, setusefulParameter] = useRecoilState(usefulParameterState);
  const [showRollbackCheckBox, setshowRollbackCheckBox] = useState(false);
  const [isRollbackActive, setisRollbackActive] = useState(false);
  const [triggerselectRowOrganizations, settriggerselectRowOrganizations] = useState(false);
  const [triggerselectRowNetworks, settriggerselectRowNetworks] = useState(false);
  const [triggerselectRowDevices, settriggerselectRowDevices] = useState(false);
  const [openRollbackModal, setopenRollbackModal] = useRecoilState(openRollbackModalState);
  const [SingleOrganizationSelected, setSingleOrganizationSelected] = useRecoilState(SingleOrganizationSelectedState);
  const [operationIdSelected, setoperationIdSelected] = useRecoilState(operationIdSelectedState);

  //=================== GET NETWORKs AND DEVICES IDs =====================
  let OrgIDModel = [];
  let NetIDModel = [];
  let DeviceIDModel = [];

  // get Organization IDs
  useEffect(() => {
    if (firstRender) {
      return;
    }
    OrganizationSelected.map((opt) => {
      OrgIDModel.push(opt.id);
    });
    setorganizationIDSelected(OrgIDModel);

    let IDList = OrgIDModel.join(", ");
    setonLoopFormData({ [usefulParameter]: IDList });
    setParameterTemplate({ [usefulParameter]: IDList });
    if (OrganizationSelected.length > 0) {
      setusefulInputDisabled(true);
    } else {
      setusefulInputDisabled(false);
      setonLoopFormData({});
      setParameterTemplate({});
    }
  }, [triggerselectRowOrganizations]);

  // get Networks IDs
  useEffect(() => {
    if (firstRender) {
      return;
    }

    networksSelected.map((opt) => {
      NetIDModel.push(opt.id);
    });
    setnetworksIDSelected(NetIDModel);

    let IDList = NetIDModel.join(", ");
    setonLoopFormData({ [usefulParameter]: IDList });
    setParameterTemplate({ [usefulParameter]: IDList });
    setdevicesSelected([]);
    if (networksSelected.length > 0) {
      setusefulInputDisabled(true);
    } else {
      setusefulInputDisabled(false);
      setonLoopFormData({});
      setParameterTemplate({});

      setdevicesSelected([]);
    }
  }, [triggerselectRowNetworks]);

  // get Devices IDs
  useEffect(() => {
    if (firstRender) {
      return;
    }
    devicesSelected.map((opt) => {
      DeviceIDModel.push(opt.serial);
    });
    setdevicesIDSelected(DeviceIDModel);

    let IDList = DeviceIDModel.join(", ");
    setonLoopFormData({ [usefulParameter]: IDList });
    setParameterTemplate({ [usefulParameter]: IDList });
    setnetworksSelected([]);
    if (devicesSelected.length > 0) {
      setusefulInputDisabled(true);
    } else {
      setusefulInputDisabled(false);
      setonLoopFormData({});
      setParameterTemplate({});
      setnetworksSelected([]);
    }
  }, [triggerselectRowDevices]);

  //Used In OgranizationsModal
  const selectRowOrganizations = {
    mode: "checkbox",
    selected: organizationIDSelected,
    clickToSelect: true,
    style: { backgroundColor: "#17a2b80f" },
    onSelect: (row, isSelect) => {
      if (isSelect === true) {
        setOrganizationSelected([...OrganizationSelected, row]);
        setnotificationMessage(["Organization selected", `ID: ${row.id}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowOrganizations(!triggerselectRowOrganizations);
      } else if (isSelect === false) {
        const index = OrganizationSelected.findIndex((i) => i.id === row.id);
        const removeRow = produce(OrganizationSelected, (draft) => {
          draft = draft.splice(index, 1);
        });
        setOrganizationSelected(removeRow);
        setnotificationMessage(["Organization removed", `ID: ${row.id}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowOrganizations(!triggerselectRowOrganizations);
      }
    },
    onSelectAll: (isSelect, rows, e) => {
      if (isSelect === true) {
        setOrganizationSelected(rows);
        setnotificationMessage([`${rows.length} organizations selected`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowOrganizations(!triggerselectRowOrganizations);
      } else if (isSelect === false) {
        setOrganizationSelected([]);
        setnotificationMessage([`${rows.length} organizations removed`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowOrganizations(!triggerselectRowOrganizations);
      }
    },
  };

  //Used In NetworksModal
  const selectRowNetworks = {
    mode: "checkbox",
    selected: networksIDSelected,
    clickToSelect: true,
    style: { backgroundColor: "#17a2b80f" },
    onSelect: (row, isSelect) => {
      if (isSelect === true) {
        setnetworksSelected([...networksSelected, row]);
        setnotificationMessage(["Network selected", `ID: ${row.id}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowNetworks(!triggerselectRowNetworks);
      } else if (isSelect === false) {
        const index = networksSelected.findIndex((i) => i.id === row.id);
        const removeRow = produce(networksSelected, (draft) => {
          draft = draft.splice(index, 1);
        });
        setnetworksSelected(removeRow);
        setnotificationMessage(["Network removed", `ID: ${row.id}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowNetworks(!triggerselectRowNetworks);
      }
    },
    onSelectAll: (isSelect, rows, e) => {
      if (isSelect === true) {
        setnetworksSelected(rows);
        setnotificationMessage([`${rows.length} networks selected`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowNetworks(!triggerselectRowNetworks);
      } else if (isSelect === false) {
        setnetworksSelected([]);
        setnotificationMessage([`${rows.length} networks removed`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowNetworks(!triggerselectRowNetworks);
      }
    },
  };

  //Used In DevicesModal
  const selectRowDevices = {
    mode: "checkbox",
    selected: devicesIDSelected,
    clickToSelect: true,
    style: { backgroundColor: "#17a2b80f" },

    onSelect: (row, isSelect) => {
      if (isSelect === true) {
        setdevicesSelected([...devicesSelected, row]);
        setnotificationMessage(["Device selected", `Serial: ${row.serial}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowDevices(!triggerselectRowDevices);
      } else if (isSelect === false) {
        const index = devicesSelected.findIndex((i) => i.serial === row.serial);
        const removeRow = produce(devicesSelected, (draft) => {
          draft = draft.splice(index, 1);
        });
        setdevicesSelected(removeRow);
        setnotificationMessage(["Device removed", `Serial: ${row.serial}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowDevices(!triggerselectRowDevices);
      }
    },
    onSelectAll: (isSelect, rows, e) => {
      if (isSelect === true) {
        setdevicesSelected(rows);
        setnotificationMessage([`${rows.length} devices selected`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowDevices(!triggerselectRowDevices);
      } else if (isSelect === false) {
        setdevicesSelected([]);
        setnotificationMessage([`${rows.length} devices removed`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
        settriggerselectRowDevices(!triggerselectRowDevices);
      }
    },
  };

  function UnselectAll() {
    if (usefulParameter === "organizationId") {
      setusefulInputDisabled(false);
      setonLoopFormData({});
      setParameterTemplate({});
      setdevicesSelected([]);
      setOrganizationSelected([]);

      //
      setnetworksSelected([]);
      setnotificationMessage([`${networksSelected.length} organizations removed`]);
      setnotificationType("info");
      settriggerShowNotification(!triggerShowNotification);
      settriggerselectRowOrganizations(!triggerselectRowOrganizations);
    } else if (usefulParameter === "networkId") {
      setusefulInputDisabled(false);
      setonLoopFormData({});
      setParameterTemplate({});
      setdevicesSelected([]);
      setOrganizationSelected([]);

      //
      setnetworksSelected([]);
      setnotificationMessage([`${networksSelected.length} networks removed`]);
      setnotificationType("info");
      settriggerShowNotification(!triggerShowNotification);
      settriggerselectRowNetworks(!triggerselectRowNetworks);
    } else if (usefulParameter === "serial") {
      setusefulInputDisabled(false);
      setonLoopFormData({});
      setParameterTemplate({});
      setnetworksSelected([]);
      setOrganizationSelected([]);

      //
      setdevicesSelected([]);
      setnotificationMessage([`${devicesSelected.length} devices removed`]);
      setnotificationType("info");
      settriggerShowNotification(!triggerShowNotification);
      settriggerselectRowDevices(!triggerselectRowDevices);
    }
  }

  //=============================================================

  //=================== GET USEFUL PARAMETERS =====================

  let parametersArray = ["serial", "organizationId", "networkId"];

  useEffect(() => {
    setoperationIdSelected(props.prop.ExplorerProps.opt2.operationId);
    if (props.prop.ExplorerProps.opt2.parameters) {
      props.prop.ExplorerProps.opt2.parameters.map((opt) => {
        if (parametersArray.includes(opt.name)) {
          setusefulParameter(opt.name);
        } else if (opt.name === "createOrganization") {
          setusefulParameter("organizationId");
        }
      });
    } else if (props.prop.ExplorerProps.opt2.operationId === "getOrganizations") {
      setusefulParameter("organizationId");
    }
  }, [props]);

  // =================== RESET input & ParameterTemplate and loopMode =====================
  // every time endpoint change, reset  ParameterTemplate and LoopMode
  useEffect(() => {
    setParameterTemplate({});
    setParameterTemplateJSON({});
    setonLoopFormData({});
    setusefulInputDisabled(false);

    setcheckedBox(false);
    setOrganizationSelected([]);
    setorganizationIDSelected([]);
    setdevicesSelected([]);
    setnetworksSelected([]);
    setdevicesIDSelected([]);
    setnetworksIDSelected([]);
  }, [props.prop.ExplorerProps, useJsonBody]);

  // ==============================================================

  //================= DOCUMENTATION LINK //=================
  const operationIdlink = props.prop.ExplorerProps.opt2.operationId
    .match(/([A-Z]?[^A-Z]*)/g)
    .slice(0, -1)
    .join(" ")
    .replace(/\s+/g, "-")
    .toLowerCase();

  let documentationLink = `https://developer.cisco.com/meraki/api-v1/#!${operationIdlink}`;
  //=================//=================//=================

  let responseString = `dashboard.${props.prop.ExplorerProps.opt2.category}.${
    props.prop.ExplorerProps.opt2.operationId
  }(${Object.keys(ParameterTemplate)})`;
  let responsePrefixes = {
    dashboard: "dashboard",
    category: props.prop.ExplorerProps.opt2.category,
    operationId: props.prop.ExplorerProps.opt2.operationId,
  };

  if (props.prop.ExplorerProps.opt2.type === "put") {
    responsePrefixes.rollbackId = props.prop.ExplorerProps.opt2.rollbackId;
  }

  useEffect(() => {
    if (props.prop.ExplorerProps.opt2.type === "put") {
      setshowRollbackCheckBox(true);
    } else {
      setshowRollbackCheckBox(false);
      setisRollbackActive(false);
    }
  }, [props.prop.ExplorerProps]);

  let responseCode = Object.keys(props.prop.ExplorerProps.opt2.responses);

  let jsonExample = "";

  if (responseCode[0] === "204") {
    jsonExample = {
      response:
        props.prop.ExplorerProps.opt2.responses[Object.keys(props.prop.ExplorerProps.opt2.responses)].description,
    };
  } else {
    if (
      props.prop.ExplorerProps.opt2.responses[Object.keys(props.prop.ExplorerProps.opt2.responses)].examples !==
      undefined
    ) {
      jsonExample = JSON.stringify(
        Object.values(
          props.prop.ExplorerProps.opt2.responses[Object.keys(props.prop.ExplorerProps.opt2.responses)].examples
        ),
        null,
        2
      );
    } else {
      jsonExample = JSON.stringify({
        response:
          props.prop.ExplorerProps.opt2.responses[Object.keys(props.prop.ExplorerProps.opt2.responses)].description,
      });
    }
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
        .post("http://localhost:8000/ApiCall", {
          apiKey: apiKey,
          ParameterTemplate: ParameterTemplate,
          useJsonBody,
          ParameterTemplateJSON,
          responsePrefixes: responsePrefixes,
          responseString: responseString,
          organizationIDSelected: organizationIDSelected,
          networksIDSelected: networksIDSelected,
          devicesIDSelected: devicesIDSelected,
          usefulParameter: usefulParameter,
          isRollbackActive,
          method: props.prop.ExplorerProps.opt2.type,
          organization: OrganizationSelected.name ? OrganizationSelected.name : "N/A",
        })
        .then((data) => {
          if (data.data.error) {
            console.log("Error: ", data.data.error);
            setnotificationMessage([`Error: ${JSON.stringify(data.data.error)}`]);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setloadingSubmitEnpoint(false);
            setopenSummaryModal(!openSummaryModal);
            setJSONtoTable(
              <JSONToHTMLTable
                tableClassName="html-table table table-sm"
                data={{ [ParameterTemplate[usefulParameter]]: data.data.error }}
              />
            );
            setlazyLog(
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
            let dataArray = data.data;
            // if data.data return only 1 object (no loopMode)
            if (isArray(data.data) === false) {
              dataArray = [data.data];
              setJSONtoTable(
                <JSONToHTMLTable
                  tableClassName="html-table table table-sm"
                  data={JSON.parse(JSON.stringify({ [ParameterTemplate[usefulParameter]]: dataArray }, replacer))}
                />
              );
              setlazyLog(
                <LazyLog
                  extraLines={1}
                  enableSearch={true}
                  text={JSON.stringify(dataArray, null, 4)}
                  stream={true}
                  caseInsensitive={true}
                  selectableLines={true}
                />
              );
            } else {
              // if data.data returns more objects (loopMode active)
              if (usefulParameter === "organizationId") {
                let NewjsonToModify = {};
                if (organizationIDSelected.length === 0) {
                  dataArray.map((opt, index) => {
                    NewjsonToModify[opt.name ? opt.name : opt.id] = opt;
                  });
                } else {
                  dataArray.map((opt, index) => {
                    NewjsonToModify[opt.name ? opt.name : opt.id] = opt;
                  });
                }
                setJSONtoTable(
                  <JSONToHTMLTable
                    tableClassName="html-table table table-sm"
                    data={JSON.parse(JSON.stringify(NewjsonToModify, replacer))}
                  />
                );
                setlazyLog(
                  <LazyLog
                    extraLines={1}
                    enableSearch={true}
                    text={JSON.stringify(dataArray, null, 4)}
                    stream={true}
                    caseInsensitive={true}
                    selectableLines={true}
                  />
                );
              } else if (usefulParameter === "networkId") {
                let NewjsonToModify = {};
                if (networksIDSelected.length === 0) {
                  dataArray.map((opt, index) => {
                    NewjsonToModify[opt.name ? opt.name : opt.networkId] = opt;
                  });
                } else {
                  dataArray.map((opt, index) => {
                    NewjsonToModify[networksSelected[index].name] = opt;
                  });
                }
                setJSONtoTable(
                  <JSONToHTMLTable
                    tableClassName="html-table table table-sm"
                    data={JSON.parse(JSON.stringify(NewjsonToModify, replacer))}
                  />
                );
                setlazyLog(
                  <LazyLog
                    extraLines={1}
                    enableSearch={true}
                    text={JSON.stringify(dataArray, null, 4)}
                    stream={true}
                    caseInsensitive={true}
                    selectableLines={true}
                  />
                );
              } else if (usefulParameter === "serial") {
                let NewjsonToModify = {};
                if (devicesIDSelected.length === 0) {
                  dataArray.map((opt, index) => {
                    NewjsonToModify[opt.name ? opt.name : opt.serial] = opt;
                  });
                } else {
                  dataArray.map((opt, index) => {
                    NewjsonToModify[
                      devicesSelected[index].name === "" ? devicesIDSelected[index] : devicesSelected[index].name
                    ] = opt;
                  });
                }

                setJSONtoTable(
                  <JSONToHTMLTable
                    tableClassName="html-table table table-sm"
                    data={JSON.parse(JSON.stringify(NewjsonToModify, replacer))}
                  />
                );
                setlazyLog(
                  <LazyLog
                    extraLines={1}
                    enableSearch={true}
                    text={JSON.stringify(dataArray, null, 4)}
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
        })
        .catch((error) => {
          console.log(error);
          setnotificationMessage([`Error: ${JSON.stringify(error)}`]);
          setnotificationType("danger");
          settriggerShowNotification(!triggerShowNotification);
          setloadingSubmitEnpoint(false);
          setopenSummaryModal(!openSummaryModal);
        });
    }
    ApiCall();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingSubmitEnpoint(false);
    };
  }, [triggerSubmit]);

  function updateJSONBody(e) {
    setParameterTemplateJSON(e.jsObject);
  }

  let schema = {};
  let bools = [];
  let schemaJsonBody = {};

  if (props.prop.ExplorerProps.opt2.parameters) {
    props.prop.ExplorerProps.opt2.parameters.map((opt, index) => {
      if (opt.in === "path" || opt.in === "query") {
        if (opt.required) {
          if (typeof schema.required === "undefined") {
            schema.required = [opt.name];
          } else {
            schema.required.push(opt.name);
          }
        }

        if (typeof schema.properties === "undefined") {
          schema.properties = { [props.prop.ExplorerProps.opt2.parameters[index].name]: opt };
        } else {
          schema.properties[props.prop.ExplorerProps.opt2.parameters[index].name] = opt;
        }
      }

      if (opt.in === "body") {
        schema.properties = { ...schema.properties, ...opt.schema.properties };
        // opt.schema.properties.map((opt2) => {})

        Object.entries(opt.schema.properties).map((key, index) => {
          if (key[1].type === "boolean") {
            bools.push(key[0]);
          }
        });
      }
    });
  }

  if (props.prop.ExplorerProps.opt2.parameters) {
    props.prop.ExplorerProps.opt2.parameters.map((opt, index) => {
      if (opt.in === "path") {
        if (opt.required) {
          if (typeof schemaJsonBody.required === "undefined") {
            schemaJsonBody.required = [opt.name];
          } else {
            schemaJsonBody.required.push(opt.name);
          }
        }

        if (typeof schemaJsonBody.properties === "undefined") {
          schemaJsonBody.properties = { [props.prop.ExplorerProps.opt2.parameters[index].name]: opt };
        } else {
          schemaJsonBody.properties[props.prop.ExplorerProps.opt2.parameters[index].name] = opt;
        }
      }
    });
  }

  const uiSchema = {
    [usefulParameter]: {
      "ui:disabled": usefulInputDisabled,
    },
  };

  //change boolean to select yes/no
  bools.map((opt) => {
    uiSchema[opt] = { "ui:widget": "select" };
  });

  // workaround for bug  React 17 submit event not bubbling
  // https://github.com/rjsf-team/react-jsonschema-form/issues/2104

  const getFormData = ({ formData }, e) => {
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
    triggerSubmit,
    settriggerSubmit,
    setJSONtoTable,
    JSONtoTable,
    setlazyLog,
    lazyLog,
    webSocketLogs,
    setwebSocketLogs,
    useJsonBody,
    ParameterTemplateJSON,
    setonLoopFormData,
    setusefulInputDisabled,
    setcheckedBox,
    checkedBox,
    networksIDSelected,
    setnetworksIDSelected,
    devicesIDSelected,
    setdevicesIDSelected,
    triggerLogFile,
    settriggerLogFile,
    globalLog,
    selectRowDevices,
    selectRowNetworks,
    selectRowOrganizations,
    triggerselectRowOrganizations,
  };

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        {openOrganizationsModal ? <OrganizationsModal dc={ac} /> : <div></div>}
        {openNetworksModal ? <NetworksModal dc={ac} /> : <div></div>}
        {openDevicesModal ? <DevicesModal dc={ac} /> : <div></div>}
        {openSummaryModal ? <SummaryModal dc={ac} /> : <div></div>}
        {openResultsModal ? <ResultsModal dc={ac} /> : <div></div>}
        {openTaskManagerModal ? <TaskManagerModal dc={ac} /> : <div></div>}
        {openRollbackModal ? <RollbackModal dc={ac} /> : <div></div>}
        {openLogsModal ? <LogsModal dc={ac} /> : <div></div>}
        <div className="col-lg-12">{/* <div className="card">{<ExplorerNavbar dc={ac} />}</div> */}</div>
        <div className="content-header" style={{ padding: "20px 0.5rem 5px 5px" }}>
          <div className="card">{<ExplorerNavbar dc={ac} />}</div>
          <div className="card">
            <div className="card-body" style={{ padding: "10px" }}>
              <div className="row align-items-center">
                <div className="col-sm-6">
                  <h1 className="m-0">
                    <a href={documentationLink} target="_blank" className="m-0 ac-dashboard">
                      {props.prop.ExplorerProps.opt2.operationId}
                    </a>
                  </h1>
                  {props.prop.ExplorerProps.opt2.type === "get" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-green">
                      {props.prop.ExplorerProps.opt2.type.toUpperCase()}
                    </span>
                  ) : props.prop.ExplorerProps.opt2.type === "post" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-orange">
                      {props.prop.ExplorerProps.opt2.type.toUpperCase()}
                    </span>
                  ) : props.prop.ExplorerProps.opt2.type === "put" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-blue">
                      {props.prop.ExplorerProps.opt2.type.toUpperCase()}
                    </span>
                  ) : props.prop.ExplorerProps.opt2.type === "delete" ? (
                    <span style={{ marginRight: "3px" }} className="badge bg-danger">
                      {props.prop.ExplorerProps.opt2.type.toUpperCase()}
                    </span>
                  ) : (
                    <div></div>
                  )}
                  <span className="Endpointdescription">{props.prop.ExplorerProps.opt2.prefix}</span>
                  <div>
                    <span className="Endpointdescription">{props.prop.ExplorerProps.opt2.description}</span>
                  </div>
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
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-info"
                                onClick={UnselectAll}
                                disabled={
                                  networksSelected.length === 0 &&
                                  devicesSelected.length === 0 &&
                                  OrganizationSelected.length === 0
                                    ? true
                                    : false
                                }
                                data-toggle="tooltip"
                                data-placement="bottom"
                                title={`Remove all ${usefulParameter} selected`}
                              >
                                Unselect all
                              </button>
                              <br />
                              <br />
                              <div className="form-check">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  value=""
                                  id="JSONBody"
                                  onClick={() => setuseJsonBody(!useJsonBody)}
                                />
                                <label className="form-check-label Endpointdescription" htmlFor="JSONBody">
                                  JSON Body
                                </label>
                              </div>
                              {showRollbackCheckBox ? (
                                <div>
                                  <div className="form-check">
                                    <input
                                      className="form-check-input"
                                      type="checkbox"
                                      value=""
                                      id="Rollback"
                                      onClick={() => setisRollbackActive(!isRollbackActive)}
                                    />
                                    <label className="form-check-label Endpointdescription" htmlFor="Rollback">
                                      Rollback
                                    </label>
                                  </div>
                                </div>
                              ) : (
                                <div></div>
                              )}
                            </div>
                          </li>
                        </ul>
                        <div>
                          <div>
                            <div className="form-group">
                              {useJsonBody ? (
                                <div className="">
                                  <Form
                                    schema={schemaJsonBody}
                                    onChange={getFormData}
                                    formData={onLoopFormData}
                                    uiSchema={uiSchema}
                                    noValidate={true}
                                  >
                                    <div>
                                      <button
                                        type="button"
                                        style={{ display: "none" }}
                                        className="btn btn-sm btn-outline-info"
                                        onClick={OpenModal}
                                        disabled={!authenticated}
                                        data-toggle="tooltip"
                                        data-placement="bottom"
                                        title={authenticated ? "Submit" : "Please authenticate"}
                                      >
                                        Submit
                                      </button>
                                    </div>
                                  </Form>
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
                                  noValidate={true}
                                >
                                  <div>
                                    <button
                                      type="button"
                                      className="btn btn-sm btn-outline-info"
                                      onClick={OpenModal}
                                      disabled={!authenticated}
                                      data-toggle="tooltip"
                                      data-placement="bottom"
                                      title={authenticated ? "Submit" : "Please authenticate"}
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </Form>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {useJsonBody ? (
                  <div className="card-footer">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-info"
                      onClick={OpenModal}
                      disabled={!authenticated}
                      data-toggle="tooltip"
                      data-placement="bottom"
                      title={authenticated ? "Submit" : "Please authenticate"}
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <div></div>
                )}
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
