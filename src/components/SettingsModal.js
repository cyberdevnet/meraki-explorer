import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "../styles/MuiOverride.css";
import "react-notifications-component/dist/theme.css";
import { useRecoilState } from "recoil";
import { openSettingsModalState } from "../main/GlobalState";
import Form from "@rjsf/bootstrap-4";





export default function SettingsModal(ac) {
    const [openSettingsModal, setopenSettingsModal] = useRecoilState(openSettingsModalState);


    const handleCloseModal = () => {
        setopenSettingsModal(!openSettingsModal);
    };

    const schema = {

        "type": "object",
        "properties": {
            "single_request_timeout": {
                "type": "integer",
                "title": "single_request_timeout",
                "description": "Maximum number of seconds for each API call",
                default: 60
            },
            "wait_on_rate_limit": {
                "type": "boolean",
                "title": "wait_on_rate_limit",
                "description": "Retry if 429 rate limit error encountered?",
                default: true
            },
            "retry_4xx_error": {
                "type": "boolean",
                "title": "retry_4xx_error",
                "description": "Retry if encountering other 4XX error (besides 429)?",
                default: true
            },
            "retry_4xx_error_wait_time": {
                "type": "integer",
                "title": "retry_4xx_error_wait_time",
                "description": "Other 4XX error retry wait time",
                default: 5
            },
            "maximum_retries": {
                "type": "integer",
                "title": "maximum_retries",
                "description": "Retry up to this many times when encountering 429s or other server-side errors",
                default: 2
            },

        }

    }
    const uiSchema = {
        "radio": {
            "ui:widget": "radio"
        },
        "wait_on_rate_limit": {
            "ui:widget": "select"
        },
        "retry_4xx_error": {
            "ui:widget": "select"
        }

    }

    const getFormData = ({ formData }, e) => {
        ac.dc.setSettingsTemplate(formData);
        ac.dc.setsettingsFormData(formData);
    }

    return (
        <Dialog open={openSettingsModal} fullWidth maxWidth={"sm"} onClose={handleCloseModal}>
            <div className="modal-header">
                <h4 className="modal-title">Settings</h4>
                <DialogActions>
                    <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
                        <span aria-hidden="true">&times;</span>
                    </button>
                </DialogActions>
            </div>
            <DialogContent dividers>
                <div>
                    <Form schema={schema}
                        uiSchema={uiSchema}
                        formData={ac.dc.settingsFormData}
                        onChange={getFormData} >
                        <div>
                            {/* workaround to hide sumbit button */}
                            <button
                                type="button"
                                style={{ display: "none" }}
                                className="btn btn-sm btn-outline-info"
                                data-toggle="tooltip"
                                data-placement="bottom"
                            >
                                Submit Hided
                            </button>
                        </div>

                    </Form>
                </div>
            </DialogContent>
            <DialogActions>
                <button type="button" className="btn btn-default" data-dismiss="modal" onClick={handleCloseModal}>
                    Close
                </button>
            </DialogActions>
        </Dialog>
    );
}
