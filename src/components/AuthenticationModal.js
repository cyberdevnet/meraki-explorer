import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "../styles/MuiOverride.css";
import "react-notifications-component/dist/theme.css";
import { useRecoilState } from "recoil";
import { openAuthenticationModalState, ApiKeyState, triggerGetOrganizationsState } from "../main/GlobalState";

export default function AuthenticationModal(ac) {
  const [openAuthenticationModal, setopenAuthenticationModal] = useRecoilState(openAuthenticationModalState);
  const [apiKey, setapiKey] = useRecoilState(ApiKeyState);
  const [triggerGetOrganizations, settriggerGetOrganizations] = useRecoilState(triggerGetOrganizationsState);

  const handleCloseModal = () => {
    setopenAuthenticationModal(!openAuthenticationModal);
  };

  return (
    <Dialog open={openAuthenticationModal} fullWidth maxWidth={"sm"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Set API Key</h4>
        <DialogActions>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      <DialogContent dividers>
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
      </DialogContent>
    </Dialog>
  );
}
