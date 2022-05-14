import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import "react-notifications-component/dist/theme.css";
import "../styles/MuiOverride.css";
import { LazyLog } from "react-lazylog";
import "../styles/MuiOverride.css";
import "../styles/Explorer.css";

import { useRecoilState } from "recoil";

import { openLogsModalState } from "../main/GlobalState";

export default function LogsModal() {
  const [openLogsModal, setopenLogsModal] = useRecoilState(openLogsModalState);

  const handleCloseModal = () => {
    setopenLogsModal(!openLogsModal);
  };

  return (
    <Dialog open={openLogsModal} fullWidth maxWidth={"xl"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Logs</h4>
        <DialogActions>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      {/* {loadingLoadTasks ? <LinearProgress style={{ width: "100%" }} /> : <div></div>} */}

      <div className="modal-body">
        {" "}
        <div style={{ minHeight: "500px" }}>
          <LazyLog extraLines={1} enableSearch url="ws://localhost:5000/global_logs" websocket stream follow />
        </div>
      </div>
      <div className="modal-footer">
        <DialogActions></DialogActions>
      </div>
    </Dialog>
  );
}
