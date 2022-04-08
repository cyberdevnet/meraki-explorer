// @ts-nocheck
import { useRecoilState } from "recoil";
import {
  openOrganizationsModalState,
  openDevicesModalState,
  openNetworksModalState,
  OrganizationsListState,
  NetworksAndDevicesState,
  usefulParameterState,
  openTaskManagerModalState,
  triggergetAllTasksState,
  openLogsModalState,
} from "../main/GlobalState";

export default function ExplorerNavbar(ac) {
  const [openOrganizationsModal, setopenOrganizationsModal] = useRecoilState(openOrganizationsModalState);
  const [openNetworksModal, setopenNetworksModal] = useRecoilState(openNetworksModalState);
  const [openDevicesModal, setopenDevicesModal] = useRecoilState(openDevicesModalState);
  const [openTaskManagerModal, setopenTaskManagerModal] = useRecoilState(openTaskManagerModalState);
  const [triggergetAllTasks, settriggergetAllTasks] = useRecoilState(triggergetAllTasksState);
  const [openLogsModal, setopenLogsModal] = useRecoilState(openLogsModalState);
  const [organizationsList, setorganizationsList] = useRecoilState(OrganizationsListState);
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [usefulParameter, setusefulParameter] = useRecoilState(usefulParameterState);

  function OpenOrganizationsModal() {
    setopenOrganizationsModal(!openOrganizationsModal);
  }
  function OpenNetworksModal() {
    setopenNetworksModal(!openNetworksModal);
  }
  function OpenDevicesModal() {
    setopenDevicesModal(!openDevicesModal);
  }
  function OpenTaskManagerModal() {
    setopenTaskManagerModal(!openTaskManagerModal);
    settriggergetAllTasks(!triggergetAllTasks);
  }
  function OpenLogsModal() {
    setopenLogsModal(!openLogsModal);
    ac.dc.settriggerLogFile(!ac.dc.triggerLogFile);
  }

  return (
    <nav className="navbar navbar-expand navbar-white navbar-light">
      <div className="col-lg-12">
        <ul className="nav nav-pills align-items-center">
          <li className="nav-item">
            <button
              data-toggle="tooltip"
              data-placement="right"
              title="List the organizations"
              className="btn btn-sm btn-outline-info"
              type="button"
              onClick={() => OpenOrganizationsModal()}
              style={{ width: "100px", margin: "3px" }}
              disabled={organizationsList.length > 0 ? false : true}
            >
              Organizations
            </button>
          </li>

          {usefulParameter === "networkId" ? (
            <li className="nav-item">
              <button
                data-toggle="tooltip"
                data-placement="right"
                title="List the organization networks"
                className="btn btn-sm btn-outline-info"
                type="button"
                onClick={() => OpenNetworksModal()}
                style={{ width: "78px", margin: "3px" }}
                disabled={NetworksAndDevices.networks ? false : true}
              >
                Networks
              </button>
            </li>
          ) : (
            <div></div>
          )}
          {usefulParameter === "serial" ? (
            <li className="nav-item">
              <button
                data-toggle="tooltip"
                data-placement="right"
                title="List the organization devices"
                className="btn btn-sm btn-outline-info"
                type="button"
                style={{ width: "78px", margin: "3px" }}
                onClick={() => OpenDevicesModal()}
                disabled={NetworksAndDevices.devices ? false : true}
              >
                Devices
              </button>
            </li>
          ) : (
            <div></div>
          )}
          <li className="nav-item ml-auto">
            <button
              data-toggle="tooltip"
              data-placement="right"
              title="List the organizations"
              className="btn btn-sm btn-outline-info"
              type="button"
              onClick={() => OpenTaskManagerModal()}
              style={{ width: "100px", margin: "3px" }}
              // disabled={organizationsList.length > 0 ? false : true}
            >
              Task Manager
            </button>
          </li>
          <li className="nav-item">
            <button
              data-toggle="tooltip"
              data-placement="right"
              title="List the organizations"
              className="btn btn-sm btn-outline-info"
              type="button"
              onClick={() => OpenLogsModal()}
              style={{ width: "100px", margin: "3px" }}
              // disabled={organizationsList.length > 0 ? false : true}
            >
              Logs
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
