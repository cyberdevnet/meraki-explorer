// @ts-nocheck
import { useRecoilState } from "recoil";
import {
  openOrganizationsModalState,
  openDevicesModalState,
  openNetworksModalState,
  OrganizationsListState,
  NetworksAndDevicesState,
  usefulParameterState,
} from "../main/GlobalState";

export default function ExplorerNavbar() {
  const [openOrganizationsModal, setopenOrganizationsModal] = useRecoilState(
    openOrganizationsModalState
  );
  const [openNetworksModal, setopenNetworksModal] = useRecoilState(openNetworksModalState);
  const [openDevicesModal, setopenDevicesModal] = useRecoilState(openDevicesModalState);
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

  return (
    <nav className="navbar navbar-expand navbar-white navbar-light">
      <ul className="navbar-nav">
        <div className="input-group">
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

          {usefulParameter === "networkId" ? (
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
          ) : (
            <div></div>
          )}
          {usefulParameter === "serial" ? (
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
          ) : (
            <div></div>
          )}
        </div>
      </ul>
    </nav>
  );
}
