// @ts-nocheck
import "../styles/Explorer.css";
import { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";
import { useRecoilState } from "recoil";
import "react-notifications-component/dist/theme.css";
import AuthenticationModal from "./AuthenticationModal";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min";
import paginationFactory from "react-bootstrap-table2-paginator";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import {
  ApiKeyState,
  OrganizationsListState,
  NetworksAndDevicesState,
  notificationMessageState,
  notificationTypeState,
  triggerShowNotificationState,
  authenticatedState,
  SingleOrganizationSelectedState,
  openAuthenticationModalState,
  triggerGetOrganizationsState,
} from "../main/GlobalState";
import useFirstRender from "../main/useFirstRender";
import axios from "axios";

function Authentication(props) {
  const firstRender = useFirstRender();
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [organizationsList, setorganizationsList] = useRecoilState(OrganizationsListState);
  const [SingleOrganizationSelected, setSingleOrganizationSelected] = useRecoilState(SingleOrganizationSelectedState);
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(triggerShowNotificationState);
  const [authenticated, setauthenticated] = useRecoilState(authenticatedState);
  const [triggerGetOrganizations, settriggerGetOrganizations] = useRecoilState(triggerGetOrganizationsState);
  const [loadingSelectOrg, setloadingSelectOrg] = useState(false);
  const [openAuthenticationModal, setopenAuthenticationModal] = useRecoilState(openAuthenticationModalState);
  const { SearchBar } = Search;
  // demo read-only API key

  var ws = null;
  useEffect(() => {
    if (firstRender) {
      return;
    }
    ws = new WebSocket("ws://localhost:8000/ws");
    ws.onopen = () => ws.send("Connected");
    //nothing to be sent to frontend
  }, [triggerGetOrganizations, SingleOrganizationSelected]);

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
            setnotificationMessage([data.data.error[0]]);
            setnotificationType("danger");
            settriggerShowNotification(!triggerShowNotification);
            setauthenticated(false);
          } else {
            if (data.status === 200) {
              setauthenticated(true);
              setnotificationMessage(["Successfully authenticated"]);
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

  useEffect(() => {
    const cancelTokenSource = axios.CancelToken.source();
    if (firstRender) {
      return;
    }

    async function GetNetworksAndDevices() {
      await axios
        .post("http://localhost:8000/GetNetworksAndDevices", {
          apiKey: apiKey,
          organizationId: SingleOrganizationSelected.id,
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
  }, [SingleOrganizationSelected]);

  let newData = [];
  let newColumn = [];
  if (organizationsList.length > 0) {
    organizationsList.map((opt, index) => {
      let RowsModel = {
        id: opt.id,
        name: opt.name,
        url: opt.url,
        api: opt.api.enabled === true ? "enabled" : "disabled",
        cloud: opt.cloud.region.name,
        licensing: opt.licensing.model,
      };

      newData.push(RowsModel);
    });

    let ColumnList = ["id", "name", "url", "api", "cloud", "licensing"];

    ColumnList.map((opt) => {
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
    });
  }

  const selectRow = {
    mode: "radio",
    clickToSelect: true,
    hideSelectAll: true,
    selected: [SingleOrganizationSelected.id],
    style: { backgroundColor: "#17a2b80f" },
    onSelect: (row, isSelect) => {
      if (isSelect === true) {
        setSingleOrganizationSelected(row);
        setnotificationMessage(["Organization selected", `ID: ${row.id}`, `Name: ${row.name}`]);
        setnotificationType("info");
        settriggerShowNotification(!triggerShowNotification);
      } else if (isSelect === false) {
        setSingleOrganizationSelected([]);
      }
    },
  };

  const Paginationoptions = {
    paginationSize: 4,
    pageStartIndex: 0,
    hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    firstPageText: "First",
    prePageText: "Back",
    nextPageText: "Next",
    lastPageText: "Last",
    nextPageTitle: "First page",
    prePageTitle: "Pre page",
    firstPageTitle: "Next page",
    lastPageTitle: "Last page",
    showTotal: true,
    disablePageTitle: true,
    sizePerPageList: [
      {
        text: "10",
        value: 10,
      },
      {
        text: "50",
        value: 50,
      },
      {
        text: "100",
        value: 100,
      },
      {
        text: "250",
        value: 250,
      },
    ],
  };

  return (
    <div className="wrapper">
      {authenticated === false ? <AuthenticationModal dc={props} /> : <div></div>}
      <div className="content-wrapper">
        <div className="content-header" />
        <div>
          <div className="col-lg-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <div className="tab-content">
                      <div className="post">
                        <h3 className="timeline-header">
                          <p href="#">Authentication</p>
                        </h3>
                        <p>
                          The Meraki Dashboard API requires a header parameter of X-Cisco-Meraki-API-Key to provide
                          authorization for each request.
                        </p>

                        <p>Your API key won't be saved and will be deleted on browser refresh.</p>

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
                          <form>
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
                                  name="password"
                                  autoComplete="on"
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
                                    Authenticate
                                  </button>
                                </span>
                              </div>
                            </div>
                          </form>
                        </div>
                        {loadingSelectOrg ? <LinearProgress style={{ width: "100%" }} /> : <div></div>}
                        <div className="modal-body">
                          {authenticated ? (
                            organizationsList.length > 0 ? (
                              <ToolkitProvider search keyField="id" data={newData} columns={newColumn}>
                                {(props) => (
                                  <div>
                                    <SearchBar style={{ width: "299px" }} {...props.searchProps} />
                                    <BootstrapTable
                                      // eslint-disable-next-line
                                      {...props.baseProps}
                                      bootstrap4
                                      striped
                                      hover
                                      pagination={paginationFactory(Paginationoptions)}
                                      selectRow={selectRow}
                                    />
                                  </div>
                                )}
                              </ToolkitProvider>
                            ) : (
                              <div className="page-content empty-table" style={{ position: "relative" }}>
                                <div className="container text-center">
                                  <div className="display-1 text-muted mb-5">
                                    <i className="fa fa-database" aria-hidden="true"></i>
                                  </div>
                                  <h1 className="h2 mb-3">Oops.. We did not find any Organization..</h1>
                                </div>
                              </div>
                            )
                          ) : (
                            <div></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
