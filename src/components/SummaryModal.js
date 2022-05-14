import { useMemo, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "react-notifications-component/dist/theme.css";
import LinearProgress from "@mui/material/LinearProgress";
import "../styles/MuiOverride.css";
import "../styles/Explorer.css";
import { useRecoilState } from "recoil";
import HtmlJsonTable from "./HtmlJsonTable";
import { LazyLog } from "react-lazylog";
import {
  openSummaryModalState,
  loadingSubmitEnpointState,
  SingleOrganizationSelectedState,
  openResultsModalState,
} from "../main/GlobalState";

export default function SummaryModal(ac) {
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [SingleOrganizationSelected, setSingleOrganizationSelected] = useRecoilState(SingleOrganizationSelectedState);
  const [openResultsModal, setopenResultsModal] = useRecoilState(openResultsModalState);
  const [openSummaryModal, setopenSummaryModal] = useRecoilState(openSummaryModalState);
  const [showAccordion, setshowAccordion] = useState("");
  const [showLogConsole, setshowLogConsole] = useState(false);

  let SummaryTemplate = [...Object.entries(ac.dc.ParameterTemplate)];

  let columnMemo = [
    { Header: "Parameters", accessor: "Parameters" },
    { Header: "Value", accessor: "Value" },
  ];
  const columns = useMemo(() => columnMemo, []);

  let dataMemo = [];
  const data = useMemo(() => dataMemo, []);

  SummaryTemplate.map((opt) => {
    let RowsModel = {
      ["Parameters"]: opt[0],
      ["Value"]: opt[1],
    };

    dataMemo.push(RowsModel);
  });

  const handleCloseModal = () => {
    setopenSummaryModal(!openSummaryModal);
    ac.dc.setshowNextButton(false);
  };

  function SubmitEndpoint() {
    ac.dc.settriggerSubmit(!ac.dc.triggerSubmit);
    setshowAccordion("show");
    setshowLogConsole(true);
  }

  //function to convert boolean values to string, used by tables
  function replacer(key, value) {
    if (typeof value === "boolean") {
      if (value === true) {
        return "yes";
      } else if (value === false) {
        return "no";
      }
    }
    return value;
  }

  function logFormatter(e) {
    let parsed = JSON.parse(e);
    let logFormatted = `${parsed.asctime}    ${parsed.name}    ${parsed.levelname}  >  ${parsed.message}`;
    return logFormatted;
  }

  let modalTitleStyle = {
    paddingLeft: "1rem",
    paddingTop: "0.5rem",
  };

  function HandleNext() {
    setopenSummaryModal(!openSummaryModal);
    setopenResultsModal(!openResultsModal);
    ac.dc.setshowNextButton(false);
  }

  return (
    <Dialog open={openSummaryModal} fullWidth maxWidth={"md"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h5 className="modal-title">Endpoint Summary</h5>

        <DialogActions>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      {loadingSubmitEnpoint ? <LinearProgress style={{ width: "100%" }} /> : <div></div>}
      <DialogContent dividers>
        <div className="modal-body">
          <div className="content-header" style={{ padding: "0px" }}>
            <div className="card">
              <div className="card-body" style={{ padding: "10px" }}>
                <div className="row align-items-center">
                  <div className="col-sm-6">
                    <h1 className="m-0">
                      <a href={ac.dc.documentationLink} target="_blank" className="m-0 ac-dashboard">
                        {ac.dc.props.prop.ExplorerProps.opt2.operationId}
                      </a>
                    </h1>
                    {ac.dc.props.prop.ExplorerProps.opt2.type === "get" ? (
                      <span style={{ marginRight: "3px" }} className="badge bg-green">
                        {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
                      </span>
                    ) : ac.dc.props.prop.ExplorerProps.opt2.type === "post" ? (
                      <span style={{ marginRight: "3px" }} className="badge bg-orange">
                        {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
                      </span>
                    ) : ac.dc.props.prop.ExplorerProps.opt2.type === "put" ? (
                      <span style={{ marginRight: "3px" }} className="badge bg-blue">
                        {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
                      </span>
                    ) : ac.dc.props.prop.ExplorerProps.opt2.type === "delete" ? (
                      <span style={{ marginRight: "3px" }} className="badge bg-danger">
                        {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
                      </span>
                    ) : (
                      <div></div>
                    )}
                    <span className="Endpointdescription">{ac.dc.props.prop.ExplorerProps.opt2.prefix}</span>
                    <div>
                      <span className="Endpointdescription">{ac.dc.props.prop.ExplorerProps.opt2.description}</span>
                    </div>
                  </div>
                  {SingleOrganizationSelected.id ? (
                    <div className="ml-auto mr-3">
                      <h1 className="m-0">
                        <a href={SingleOrganizationSelected.url} target="_blank" className="m-0">
                          {SingleOrganizationSelected.name}
                        </a>
                      </h1>
                      <span style={{ marginRight: "3px", backgroundColor: "#17a2b8" }} className="badge">
                        ID
                      </span>
                      <span className="Endpointdescription">{SingleOrganizationSelected.id}</span>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </div>
              </div>
            </div>
            {ac.dc.useJsonBody ? (
              <div className="accordion" id="accordion1">
                <div className="card">
                  <div className="card-header" id="headingOne">
                    <button
                      className="btn"
                      data-toggle="collapse"
                      data-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      <i className="fa" aria-hidden="true"></i>
                    </button>
                  </div>
                  <div
                    id="collapseOne"
                    className="collapse show"
                    aria-labelledby="headingOne"
                    data-parent="#accordion1"
                  >
                    <div>
                      <h5 style={modalTitleStyle} className="modal-title">
                        Parameters
                      </h5>
                      <div className="modal-body">
                        <div className="content-header" style={{ padding: "0px" }}>
                          {<HtmlJsonTable data={JSON.parse(JSON.stringify(ac.dc.ParameterTemplate, replacer))} />}
                        </div>
                      </div>
                      <h5 style={modalTitleStyle} className="modal-title">
                        Body
                      </h5>
                      <div className="modal-body">
                        <div className="content-header" style={{ padding: "0px" }}>
                          {<HtmlJsonTable data={JSON.parse(JSON.stringify(ac.dc.ParameterTemplateJSON, replacer))} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="accordion" id="accordion1">
                <div className="card">
                  <div className="card-header" id="headingOne">
                    <button
                      className="btn"
                      data-toggle="collapse"
                      data-target="#collapseOne"
                      aria-expanded="true"
                      aria-controls="collapseOne"
                    >
                      <i className="fa" aria-hidden="true"></i>
                    </button>
                  </div>

                  <div
                    id="collapseOne"
                    className="collapse show"
                    aria-labelledby="headingOne"
                    data-parent="#accordion1"
                  >
                    <div>
                      <h5 style={modalTitleStyle} className="modal-title">
                        Parameters
                      </h5>
                      <div className="modal-body">
                        <div className="content-header" style={{ padding: "0px" }}>
                          {<HtmlJsonTable data={JSON.parse(JSON.stringify(ac.dc.ParameterTemplate, replacer))} />}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {showLogConsole ? (
              <div className="accordion" id="accordion2">
                <div className="card">
                  <div className="card-header" id="headingTwo">
                    <button
                      className="btn"
                      data-toggle="collapse"
                      data-target="#collapseTwo"
                      aria-expanded="true"
                      aria-controls="collapseTwo"
                    >
                      <i className="fa collapseTwo" aria-hidden="true"></i>
                    </button>
                  </div>

                  <div
                    id="collapseTwo"
                    className={`collapse ${showAccordion}`}
                    aria-labelledby="headingTwo"
                    data-parent="#accordion2"
                  >
                    <div>
                      <div className="modal-body">
                        <div className="content-header" style={{ padding: "0px" }}>
                          <div style={{ minHeight: "500px" }}>
                            <LazyLog
                              enableSearch
                              url="ws://localhost:5000/live_logs"
                              websocket
                              stream
                              follow
                              websocketOptions={{
                                formatMessage: (e) => logFormatter(e),
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        {ac.dc.props.prop.ExplorerProps.opt2.type === "get" ? (
          <button
            type="button"
            onClick={() => SubmitEndpoint()}
            style={{ marginRight: "3px" }}
            className="btn btn-default bg-green"
          >
            {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
          </button>
        ) : ac.dc.props.prop.ExplorerProps.opt2.type === "post" ? (
          <button
            type="button"
            onClick={() => SubmitEndpoint()}
            style={{ marginRight: "3px" }}
            className="btn btn-default bg-orange"
          >
            {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
          </button>
        ) : ac.dc.props.prop.ExplorerProps.opt2.type === "put" ? (
          <button
            type="button"
            onClick={() => SubmitEndpoint()}
            style={{ marginRight: "3px" }}
            className="btn btn-default bg-blue"
          >
            {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
          </button>
        ) : ac.dc.props.prop.ExplorerProps.opt2.type === "delete" ? (
          <button
            type="button"
            onClick={() => SubmitEndpoint()}
            style={{ marginRight: "3px" }}
            className="btn btn-default bg-danger"
          >
            {ac.dc.props.prop.ExplorerProps.opt2.type.toUpperCase()}
          </button>
        ) : (
          <div></div>
        )}
        {ac.dc.showNextButton ? (
          <button type="button" className="btn btn-default" style={{ marginRight: "3px" }} onClick={() => HandleNext()}>
            Next <i style={{ marginLeft: "3px" }} className="fa fa-arrow-circle-right" aria-hidden="true"></i>
          </button>
        ) : (
          <></>
        )}
      </DialogActions>
    </Dialog>
  );
}
