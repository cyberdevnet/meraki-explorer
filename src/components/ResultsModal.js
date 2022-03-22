import { useMemo } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import MaterialReactTable from "material-react-table";
import "../styles/MuiOverride.css";
import "react-notifications-component/dist/theme.css";
import { useRecoilState } from "recoil";
import {
  NetworksAndDevicesState,
  openResultsModalState,
  triggerShowNotificationState,
  notificationMessageState,
  notificationTypeState,
} from "../main/GlobalState";

export default function ResultsModal(ac) {
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [openResultsModal, setopenResultsModal] = useRecoilState(openResultsModalState);
  const [notificationMessage, setnotificationMessage] = useRecoilState(notificationMessageState);
  const [notificationType, setnotificationType] = useRecoilState(notificationTypeState);
  const [triggerShowNotification, settriggerShowNotification] = useRecoilState(
    triggerShowNotificationState
  );

  const handleCloseModal = () => {
    setopenResultsModal(!openResultsModal);
  };

  return (
    <Dialog open={openResultsModal} fullWidth maxWidth={"lg"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Results</h4>
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
        <div className="col-lg-12">
          <div className="card">
            <div className="card-header p-2">
              <ul className="nav nav-pills align-items-center">
                <li className="nav-item">
                  <a className="nav-link active" href="#table" data-toggle="tab">
                    Table
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#json" data-toggle="tab">
                    JSON
                  </a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="#logs" data-toggle="tab">
                    Logs
                  </a>
                </li>
              </ul>
            </div>
            <div className="card-body">
              <div className="tab-content">
                <div className="active tab-pane" id="table">
                  {ac.dc.JSONtoTable}
                </div>
                <div className="tab-pane" id="json">
                  <div className="ciccio" style={{ minHeight: "500px" }}>
                    {ac.dc.lazyLog}
                  </div>
                </div>
                <div className="tab-pane" id="logs">
                  <div className="ciccio" style={{ minHeight: "500px" }}>
                    Hier die logs
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
