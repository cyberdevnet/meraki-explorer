// @ts-nocheck
import "../styles/Explorer.css";
import { useEffect, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import LinearProgress from "@mui/material/LinearProgress";
import { useRecoilValue, useRecoilState } from "recoil";
import {
  ApiKeyState,
  OrganizationsListState,
  OrganizationSelectedState,
  OrganizationSelectedInfoState,
  NetworksAndDevicesState,
  notificationMessageState,
  notificationTypeState,
  triggerShowNotificationState,
} from "../main/GlobalState";
import useFirstRender from "../main/useFirstRender";
import makeAnimated from "react-select/animated";
import axios from "axios";

function Authentication(props) {
  const firstRender = useFirstRender();
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [organizationsList, setorganizationsList] = useRecoilState(OrganizationsListState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [OrganizationIDSelected, setOrganizationIDSelected] = useState("");
  const [OrganizationSelectedInfo, setOrganizationSelectedInfo] = useRecoilState(
    OrganizationSelectedInfoState
  );
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(
    triggerShowNotificationState
  );

  const [triggerGetOrganizations, settriggerGetOrganizations] = useState(false);
  const [loadingSelectOrg, setloadingSelectOrg] = useState(false);
  // demo read-only API key
  let API_KEY = "6bec40cf957de430a6f1f2baa056b99a4fac9ea0";
  let cMirronText = "{\n" + "    'X-Cisco-Meraki-API-Key'" + ":" + " <Meraki_API_Key>" + "\n}";

  const animatedComponents = makeAnimated();

  const ORG_LIST_OPTION = organizationsList.map((opt, index) => ({
    label: opt.name,
    value: opt.name,
    index: index,
    api: opt.api,
    cloud: opt.cloud,
    id: opt.id,
    licensing: opt.licensing,
    name: opt.name,
    url: opt.url,
  }));

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (firstRender) {
      return;
    }

    async function GetOrganizations() {
      setloadingSelectOrg(true);
      await axios
        .post("http://localhost:8000/GetOrganizations", {
          apiKey: apiKey,
        })
        .then((data) => {
          if (data.data.error) {
            console.log(data.data.error);
            setnotificationMessage(data.data.error[0]);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
          } else {
            let OrgList = [];
            data.data.map((opt) => {
              let Model = {
                api: opt.api,
                cloud: opt.cloud,
                id: opt.id,
                licensing: opt.licensing,
                name: opt.name,
                url: opt.url,
              };
              OrgList.push(Model);
            });
            setorganizationsList(OrgList);
          }
        })
        .then(() => {
          setloadingSelectOrg(false);
          setnotificationMessage("Successfully authenticated");
          setnotificationType("success");
          settriggerShowNotification(!triggerShowNotification);
        });
    }
    GetOrganizations();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingSelectOrg(false);
    };
  }, [triggerGetOrganizations]);

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (firstRender) {
      return;
    }

    async function GetNetworksAndDevices() {
      await axios
        .post("http://localhost:8000/GetNetworksAndDevices", {
          apiKey: apiKey,
          organizationId: OrganizationSelected.id,
        })
        .then((data) => {
          if (data.data.error) {
            console.log(data.data.error);
          } else {
            setNetworksAndDevices(data.data);
          }
        });
    }
    GetNetworksAndDevices();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
    };
  }, [OrganizationSelected]);

  return (
    <div className="post">
      <h3 className="timeline-header">
        <p href="#">Authentication</p>
      </h3>
      <p>
        The Meraki Dashboard API requires a header parameter of X-Cisco-Meraki-API-Key to provide
        authorization for each request.
      </p>
      <CodeMirror value={cMirronText} theme={oneDark} />
      <br></br>
      <span className="username">
        <p className="timeline-header">
          <a
            href={`https://developer.cisco.com/meraki/api-v1/#!authorization/authorization`}
            target="_blank"
          >
            Documentation
          </a>
        </p>
      </span>
      <div className="col-md-6">
        <div className="form-group">
          <label>API key</label>
          <div className="input-group">
            <input
              type="password"
              aria-label="Sizing example input"
              aria-describedby="inputGroup-sizing-sm"
              placeholder="api key"
              className="form-control"
              onChange={(e) => setapiKey(e.target.value)}
              value={apiKey}
            />
            <span className="input-group-btn">
              <button
                data-toggle="tooltip"
                data-placement="right"
                title="List the organizations that the user has privileges on"
                className="btn btn-block btn-outline-success"
                data-loading-text="<i class='fa fa-spinner fa-spin '></i> Processing"
                type="button"
                onClick={() => settriggerGetOrganizations(!triggerGetOrganizations)}
              >
                Get Organization
              </button>
            </span>
          </div>
        </div>
      </div>
      {loadingSelectOrg ? <LinearProgress style={{ width: "100%" }} /> : <div></div>}
    </div>
  );
}

export default Authentication;
