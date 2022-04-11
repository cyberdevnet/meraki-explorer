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

import {
  openSummaryModalState,
  OrganizationSelectedState,
  loadingSubmitEnpointState,
  SingleOrganizationSelectedState,
} from "../main/GlobalState";

export default function SummaryModal(ac) {
  const [openSummaryModal, setopenSummaryModal] = useRecoilState(openSummaryModalState);
  const [OrganizationSelected, setOrganizationSelected] = useRecoilState(OrganizationSelectedState);
  const [loadingSubmitEnpoint, setloadingSubmitEnpoint] = useRecoilState(loadingSubmitEnpointState);
  const [SingleOrganizationSelected, setSingleOrganizationSelected] = useRecoilState(SingleOrganizationSelectedState);

  let SummaryTemplate = [...Object.entries(ac.dc.ParameterTemplate)];

  // if (ac.dc.isLoopModeActive) {
  //   if (ac.dc.networksIDSelected.length > 0) {
  //     SummaryTemplate.push(["networkId", ac.dc.networksIDSelected.join(", ")]);
  //   }

  //   if (ac.dc.devicesIDSelected.length > 0) {
  //     SummaryTemplate.push(["serial", ac.dc.devicesIDSelected.join(", ")]);
  //   }
  // }

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
  };

  function SubmitEndpoint() {
    ac.dc.settriggerSubmit(!ac.dc.triggerSubmit);
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
  // function replacer(key, value) {
  //   if (typeof value === "boolean") {
  //     return String(value);
  //   }
  //   return value;
  // }

  return (
    <Dialog open={openSummaryModal} fullWidth maxWidth={"md"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Endpoint Summary</h4>

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
              <div>
                <h4 className="modal-title">Parameters</h4>
                <div className="modal-body">
                  <div className="content-header" style={{ padding: "0px" }}>
                    {<HtmlJsonTable data={JSON.parse(JSON.stringify(ac.dc.ParameterTemplate, replacer))} />}
                  </div>
                </div>
                <h4 className="modal-title">Body</h4>
                <div className="modal-body">
                  <div className="content-header" style={{ padding: "0px" }}>
                    {<HtmlJsonTable data={JSON.parse(JSON.stringify(ac.dc.ParameterTemplateJSON, replacer))} />}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <h4 className="modal-title">Parameters</h4>
                <div className="modal-body">
                  <div className="content-header" style={{ padding: "0px" }}>
                    {<HtmlJsonTable data={JSON.parse(JSON.stringify(ac.dc.ParameterTemplate, replacer))} />}
                  </div>
                </div>
              </div>
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
      </DialogActions>
    </Dialog>
  );
}
