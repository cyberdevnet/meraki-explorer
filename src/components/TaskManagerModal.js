import { useMemo, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import "react-notifications-component/dist/theme.css";
import axios from "axios";
import "../styles/Explorer.css";
import LinearProgress from "@mui/material/LinearProgress";
import { useRecoilState } from "recoil";
import { JsonToTable } from "react-json-to-table";
import { JSONToHTMLTable } from "@kevincobain2000/json-to-html-table";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min";
import paginationFactory from "react-bootstrap-table2-paginator";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import {
  openTaskManagerModalState,
  OrganizationSelectedState,
  loadingSubmitEnpointState,
  triggergetAllTasksState,
  openRollbackModalState,
  rollbackParametersState,
} from "../main/GlobalState";

export default function TaskManagerModal(ac) {
  const [openTaskManagerModal, setopenTaskManagerModal] = useRecoilState(openTaskManagerModalState);
  const [triggergetAllTasks, settriggergetAllTasks] = useRecoilState(triggergetAllTasksState);
  const [openRollbackModal, setopenRollbackModal] = useRecoilState(openRollbackModalState);
  const [rollbackParameters, setrollbackParameters] = useRecoilState(rollbackParametersState);
  const [taskCollection, settaskCollection] = useState([]);
  const [taskTable, settaskTable] = useState([]);
  const [loadingLoadTasks, setloadingLoadTasks] = useState(false);
  const { SearchBar } = Search;

  const handleCloseModal = () => {
    setopenTaskManagerModal(!openTaskManagerModal);
  };

  function rankFormatterStatus(cell, row, rowIndex, formatExtraData) {
    if (row.status === false) {
      return <i className={"fa fa-check"} style={{ color: "#28a745" }} />;
    } else if (row.status === true) {
      return <i className={"fa fa-exclamation-circle"} style={{ color: "red" }} />;
    }
  }

  function rankFormatterRollback(cell, row, rowIndex, formatExtraData) {
    if (row.rollback === false) {
      return <i className={"fa fa-undo"} />;
    } else if (row.rollback === true) {
      return <i className={"fa fa-undo"} />;
    }
  }

  function rankFormatterMethod(cell, row, rowIndex, formatExtraData) {
    if (row.method === "get") {
      return (
        <span style={{ marginRight: "3px" }} className="badge bg-green">
          {row.method.toUpperCase()}
        </span>
      );
    } else if (row.method === "post") {
      return (
        <span style={{ marginRight: "3px" }} className="badge bg-orange">
          {row.method.toUpperCase()}
        </span>
      );
    } else if (row.method === "put") {
      return (
        <span style={{ marginRight: "3px" }} className="badge bg-blue">
          {row.method.toUpperCase()}
        </span>
      );
    } else if (row.method === "delete") {
      return (
        <span style={{ marginRight: "3px" }} className="badge bg-danger">
          {row.method.toUpperCase()}
        </span>
      );
    }
  }

  const defaultSorted = [
    {
      dataField: "start_time",
      order: "desc",
    },
  ];

  const columns = [
    {
      label: "task_name",
      value: "task_name",
      dataField: "task_name",
      title: (cell) => cell,
      sort: true,
      text: "task_name",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
          fontSite: "13px",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "50px", textAlign: "center" };
      },
    },
    {
      label: "organization",
      value: "organization",
      dataField: "organization",
      title: (cell) => cell,
      sort: true,
      text: "organization",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
          fontSite: "13px",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "50px", textAlign: "center" };
      },
    },
    {
      label: "start_time",
      value: "start_time",
      dataField: "start_time",
      title: (cell) => cell,
      sort: true,
      text: "start_time",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "50px", textAlign: "center" };
      },
    },
    {
      label: "method",
      value: "method",
      dataField: "method",
      sort: true,
      text: "method",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "30px", textAlign: "center" };
      },
      formatter: rankFormatterMethod,
    },
    {
      label: "rollback",
      value: "rollback",
      dataField: "rollback",
      sort: true,
      text: "rollback",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "30px", textAlign: "center" };
      },
      formatter: rankFormatterRollback,
    },
    {
      label: "parameter",
      value: "parameter",
      dataField: "parameter",
      title: (cell) => cell,
      sort: true,
      text: "parameter",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "70px", textAlign: "center" };
      },
    },
    {
      label: "response",
      value: "response",
      dataField: "response",
      title: (cell) => cell,
      sort: true,
      text: "response",
      editable: false,
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        };
      },
      headerStyle: (colum, colIndex) => {
        return { width: "70px", textAlign: "center" };
      },
    },
    {
      label: "status",
      value: "status",
      dataField: "status",
      sort: true,
      text: "status",
      editable: false,
      headerStyle: (colum, colIndex) => {
        return { width: "30px", textAlign: "center" };
      },
      style: () => {
        return {
          textOverflow: "ellipsis",
          overflow: "hidden",
          whiteSpace: "nowrap",
          textAlign: "center",
        };
      },
      formatter: rankFormatterStatus,
    },
    {
      label: "category",
      value: "category",
      dataField: "category",
      sort: true,
      text: "category",
      hidden: true,
    },
    {
      label: "usefulParameter",
      value: "usefulParameter",
      dataField: "usefulParameter",
      sort: true,
      text: "usefulParameter",
      hidden: true,
    },
  ];

  const Paginationoptions = {
    paginationSize: 4,
    pageStartIndex: 0,
    hidePageListOnlyOnePage: true, // Hide the pagination list when only one page
    firstPageText: "First",
    prePageText: "Back",
    nextPageText: "Next",
    lastPageText: "Last",
    nextPageTitle: "First page",
    prePageTitle: "Pre page",
    firstPageTitle: "Next page",
    lastPageTitle: "Last page",
    showTotal: true,
    disablePageTitle: true,
    sizePerPageList: [
      {
        text: "10",
        value: 10,
      },
      {
        text: "50",
        value: 50,
      },
      {
        text: "100",
        value: 100,
      },
      {
        text: "250",
        value: 250,
      },
    ],
  };

  function HandleRollback(row) {
    setopenRollbackModal(!openRollbackModal);
    setrollbackParameters(row);
  }

  const expandRow = {
    onlyOneExpanding: true,
    renderer: (row) => (
      <div>
        <p>Rollback</p>
        <div className="card">
          <button
            data-toggle="tooltip"
            data-placement="right"
            title={!row.rollback_response ? "Rollback not available" : "Rollback available"}
            className="btn btn-sm btn-outline-info"
            type="button"
            onClick={() => {
              HandleRollback(row);
            }}
            style={{ width: "100px", margin: "10px" }}
            disabled={!row.rollback_response}
          >
            Rollback
          </button>
        </div>
        <p>Parameter</p>
        <div className="card">
          <JSONToHTMLTable data={JSON.parse(row.parameter)} tableClassName="html-table table table-sm" />
          {/* <JsonToTable json={JSON.parse(row.parameter)} /> */}
        </div>
        <p>Response</p>
        <div className="card">
          <JSONToHTMLTable data={JSON.parse(row.response)} tableClassName="html-table table table-sm" />
          {/* <JsonToTable json={JSON.parse(row.response)} /> */}
        </div>
      </div>
    ),
    showExpandColumn: true,
  };

  useEffect(() => {
    async function getAllTasks() {
      setloadingLoadTasks(true);
      await axios
        .post("http://localhost:8000/getAllTasks", { test: "test" })
        .then((data) => {
          if (data.data.error) {
            console.log(data.data.error);
            setloadingLoadTasks(false);
          } else {
            settaskCollection(data.data);
            let dataMemo = [];

            data.data.map((opt) => {
              let RowsModel = {
                task_name: opt.task_name,
                start_time: opt.start_time,
                method: opt.method,
                rollback: opt.rollback,
                rollback_response: opt.rollback_response,
                parameter: JSON.stringify(opt.parameter),
                response: JSON.stringify(opt.response),
                status: opt.error,
                category: opt.category,
                usefulParameter: opt.usefulParameter,
                organization: opt.organization,
              };
              dataMemo.push(RowsModel);
            });

            settaskTable(
              <ToolkitProvider search keyField="start_time" data={dataMemo} columns={columns}>
                {(props) => (
                  <div>
                    <SearchBar style={{ width: "299px" }} {...props.searchProps} />
                    <BootstrapTable
                      // eslint-disable-next-line
                      {...props.baseProps}
                      bootstrap4
                      striped
                      hover
                      pagination={paginationFactory(Paginationoptions)}
                      expandRow={expandRow}
                      defaultSorted={defaultSorted}
                    />
                  </div>
                )}
              </ToolkitProvider>
            );
          }
        })
        .then(() => {
          setloadingLoadTasks(false);
        })
        .catch((err) => {
          setloadingLoadTasks(false);
          if (err.response) {
            console.log(err.response);
          } else if (err.request) {
            console.log(err.request);
          } else {
            console.log(err);
          }
        });
    }
    getAllTasks();
    return () => {};
    setloadingLoadTasks(false);
    // eslint-disable-next-line
  }, [triggergetAllTasks]);

  return (
    <Dialog
      open={openTaskManagerModal}
      fullWidth
      maxWidth={"false"}
      onClose={handleCloseModal}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
    >
      <div className="modal-header">
        <h4 className="modal-title">TaskManager</h4>
        <DialogActions>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      {loadingLoadTasks ? <LinearProgress style={{ width: "100%" }} /> : <div></div>}
      <DialogContent dividers>
        <div className="modal-body">{taskTable}</div>
      </DialogContent>
    </Dialog>
  );
}
