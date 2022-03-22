// @ts-nocheck
import { useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import "react-notifications-component/dist/theme.css";
import MaterialReactTable from "material-react-table";
import "../styles/MuiOverride.css";
import { useRecoilState } from "recoil";
import {
  NetworksAndDevicesState,
  openDevicesModalState,
  triggerShowNotificationState,
  notificationMessageState,
  notificationTypeState,
} from "../main/GlobalState";

export default function DevicesModel(ac) {
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [openDevicesModal, setopenDevicesModal] = useRecoilState(openDevicesModalState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(
    triggerShowNotificationState
  );

  let columnMemo = [];
  const columns = useMemo(() => columnMemo, []);

  let dataMemo = [];
  const data = useMemo(() => dataMemo, []);

  if (NetworksAndDevices.devices.length > 0) {
    NetworksAndDevices.devices.map((opt, index) => {
      let RowsModel = {};
      Object.entries(opt).map((opt1) => {
        if (opt1[1] === null) {
          RowsModel[opt1[0]] = "";
        } else {
          RowsModel[opt1[0]] = opt1[1];
        }
      });

      dataMemo.push(RowsModel);
    });

    Object.entries(NetworksAndDevices.devices[0]).map((opt) => {
      let ColumnModel = {
        Header: opt[0],
        accessor: opt[0],
      };

      columnMemo.push(ColumnModel);
    });
  }

  const handleCloseModal = () => {
    setopenDevicesModal(!openDevicesModal);
  };

  function handleSelectChange(event, row, selectedRows) {
    let rows = [];

    selectedRows.map((opt, index) => {
      rows.push(opt.original);
    });

    ac.dc.setdevicesSelected(rows);
    setnotificationMessage(`${selectedRows.length} devices selected`);
    setnotificationType("info");
    settriggerShowNotification(!triggerShowNotification);
  }

  function handleSelectAllChange(event, selectedRows) {
    let rows = [];

    selectedRows.map((opt, index) => {
      rows.push(opt.original);
    });

    ac.dc.setdevicesSelected(rows);
    setnotificationMessage(`${selectedRows.length} devices selected`);
    setnotificationType("info");
    settriggerShowNotification(!triggerShowNotification);
  }

  return (
    <Dialog open={openDevicesModal} fullWidth maxWidth={"lg"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Devices</h4>

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
          enableSelection
          initialState={{ densePadding: true }}
          onSelectChange={(event, row, selectedRows) => {
            handleSelectChange(event, row, selectedRows);
          }}
          onSelectAllChange={(event, selectedRows) => {
            handleSelectAllChange(event, selectedRows);
          }}
          muiTableBodyRowProps={(row) => ({
            style: {
              backgroundColor: row.index % 2 === 0 ? "rgb(238, 238, 238)" : "",
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
