// @ts-nocheck
import { useState, useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import MaterialReactTable from "material-react-table";
import "../styles/MuiOverride.css";
import "react-notifications-component/dist/theme.css";
import { useRecoilState } from "recoil";
import {
  NetworksAndDevicesState,
  openOrganizationsModalState,
  triggerShowNotificationState,
  notificationMessageState,
  notificationTypeState,
  OrganizationsListState,
  OrganizationSelectedState,
} from "../main/GlobalState";

export default function OrganizationsModal(ac) {
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [organizationsList, setorganizationsList] = useRecoilState(OrganizationsListState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [openOrganizationsModal, setopenOrganizationsModal] = useRecoilState(
    openOrganizationsModalState
  );
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(
    triggerShowNotificationState
  );

  const [selectedRow, setSelectedRow] = useState("");

  let columnMemo = [];
  const columns = useMemo(() => columnMemo, []);

  let dataMemo = [];
  const data = useMemo(() => dataMemo, []);

  organizationsList.map((opt, index) => {
    let RowsModel = {
      id: opt.id,
      name: opt.name,
      url: opt.url,
      api: opt.api.enabled === true ? "enabled" : "disabled",
      cloud: opt.cloud.region.name,
      licensing: opt.licensing.model,
    };

    dataMemo.push(RowsModel);
  });

  let ColumnList = ["id", "name", "url", "api", "cloud", "licensing"];

  ColumnList.map((opt) => {
    let ColumnModel = {
      Header: opt,
      accessor: opt,
    };

    columnMemo.push(ColumnModel);
  });

  const handleCloseModal = () => {
    setopenOrganizationsModal(!openOrganizationsModal);
  };

  function onRowClicked(event, row) {
    setOrganizationSelected(row.original);
    setSelectedRow(row.id);
    setnotificationMessage(`Organization ${row.original.name} selected`);
    setnotificationType("info");
    settriggerShowNotification(!triggerShowNotification);
  }

  return (
    <Dialog open={openOrganizationsModal} fullWidth maxWidth={"lg"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Organizations</h4>
        <DialogActions>
          <button
            type="button"
            className="close"
            data-dismiss="modal"
            aria-label="Close"
            onClick={handleCloseModal}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      <div className="modal-body">
        <MaterialReactTable
          columns={columns}
          data={data}
          initialState={{ densePadding: true }}
          onRowClick={(event, row) => {
            onRowClicked(event, row);
          }}
          muiTableBodyRowProps={(row) => ({
            style: {
              backgroundColor: row.index % 2 === 0 ? "rgb(238, 238, 238)" : "",
              border: selectedRow === row.id ? "2px solid rgb(23, 162, 184)" : "#FFF",
            },
          })}
          muiTableBodyCellProps={{ style: { border: "none" } }}
        />
      </div>
      <div className="modal-footer">
        <DialogActions>
          <button
            type="button"
            className="btn btn-default"
            data-dismiss="modal"
            onClick={handleCloseModal}
          >
            Close
          </button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
