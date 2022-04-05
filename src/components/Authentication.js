// @ts-nocheck
import "../styles/Explorer.css";
import { useEffect, useState } from "react";
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
  authenticatedState,
} from "../main/GlobalState";
import useFirstRender from "../main/useFirstRender";
import axios from "axios";

function Authentication(props) {
  const firstRender = useFirstRender();
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [organizationsList, setorganizationsList] = useRecoilState(OrganizationsListState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [OrganizationSelectedInfo, setOrganizationSelectedInfo] = useRecoilState(OrganizationSelectedInfoState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [authenticated, setauthenticated] = useRecoilState(authenticatedState);
  const [triggerGetOrganizations, settriggerGetOrganizations] = useState(false);
  const [loadingSelectOrg, setloadingSelectOrg] = useState(false);
  // demo read-only API key

  var ws = null;
  useEffect(() => {
    if (firstRender) {
      return;
    }
    ws = new WebSocket("ws://localhost:8000/ws");
    ws.onopen = () => ws.send("Connected");
    //nothing to be sent to frontend
  }, [triggerGetOrganizations, OrganizationSelected]);

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
            setauthenticated(false);
          } else {
            if (data.status === 200) {
              setauthenticated(true);
              setnotificationMessage("Successfully authenticated");
              setnotificationType("success");
              settriggerShowNotification(!triggerShowNotification);
            }
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
        });
    }
    GetOrganizations();
    return () => {
      cancelTokenSource.cancel("axios request cancelled");
      setloadingSelectOrg(false);
    };
  }, [triggerGetOrganizations]);

  return (
    <div className="post">
      <h3 className="timeline-header">
        <p href="#">Authentication</p>
      </h3>
      <p>
        The Meraki Dashboard API requires a header parameter of X-Cisco-Meraki-API-Key to provide authorization for each
        request.
      </p>

      <p>Your API key won't be saved and will be deleted after browser refresh.</p>

      <span className="username">
        <p className="timeline-header">
          <a href={`https://developer.cisco.com/meraki/api-v1/#!authorization/authorization`} target="_blank">
            Documentation
          </a>
        </p>
      </span>
      <div className="col-md-3">
        <div className="form-group">
          <label>API key</label>
          <div className="input-group input-group-sm">
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
                className="btn btn-sm btn-outline-info"
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
