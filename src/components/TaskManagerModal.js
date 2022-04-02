import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import "react-notifications-component/dist/theme.css";
import LinearProgress from "@mui/material/LinearProgress";
import "../styles/MuiOverride.css";
import "../styles/Explorer.css";
import { useRecoilState } from "recoil";
import { JsonToTable } from "react-json-to-table";
import { openTaskManagerModalState, OrganizationSelectedState, loadingSubmitEnpointState } from "../main/GlobalState";

export default function TaskManagerModal(ac) {
  const [openTaskManagerModal, setopenTaskManagerModal] = useRecoilState(openTaskManagerModalState);

  const handleCloseModal = () => {
    setopenTaskManagerModal(!openTaskManagerModal);
  };

  return (
    <Dialog open={openTaskManagerModal} fullWidth maxWidth={"md"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">TaskManager</h4>

        <DialogActions></DialogActions>
      </div>

      <div className="modal-body">
        <div className="content-header" style={{ padding: "0px" }}>
          <div className="card">
            <div className="card-body" style={{ padding: "10px" }}>
              <div className="row align-items-center">
                <div className="col-sm-6">
                  <h1 className="m-0"></h1>

                  <div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-footer">
        <DialogActions></DialogActions>
      </div>
    </Dialog>
  );
}
