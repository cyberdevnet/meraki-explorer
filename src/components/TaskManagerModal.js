import { useMemo, useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import "react-notifications-component/dist/theme.css";
import LinearProgress from "@mui/material/LinearProgress";
import MaterialReactTable from "material-react-table";
import "../styles/MuiOverride.css";
import axios from "axios";
import "../styles/MuiOverride.css";
import "../styles/Explorer.css";
import { useRecoilState } from "recoil";
import { JsonToTable } from "react-json-to-table";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
import paginationFactory from "react-bootstrap-table2-paginator";
// import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
// import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
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
  const { SearchBar } = Search;

  const handleCloseModal = () => {
    setopenTaskManagerModal(!openTaskManagerModal);
  };

  function rankFormatterStatus(cell, row, rowIndex, formatExtraData) {
    if (row.status === false) {
      return <i className={"fa fa-check"} />;
    } else if (row.status === true) {
      return <i className={"fa fa-exclamation-circle"} />;
    }
  }

  function rankFormatterRollback(cell, row, rowIndex, formatExtraData) {
    if (row.rollback === false) {
      return <i className={"fa fa-undo"} />;
    } else if (row.rollback === true) {
      return <i className={"fa fa-undo"} />;
    }
  }

  const columns = [
    {
      label: "task_name",
      value: "task_name",
      dataField: "task_name",
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
      label: "start_time",
      value: "start_time",
      dataField: "start_time",
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
      label: "loop",
      value: "loop",
      dataField: "loop",
      sort: true,
      text: "loop",
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
    },
    {
      label: "response",
      value: "response",
      dataField: "response",
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
          <JsonToTable json={JSON.parse(row.parameter)} />
        </div>
        <p>Response</p>
        <div className="card">
          <JsonToTable json={JSON.parse(row.response)} />
        </div>
      </div>
    ),
    showExpandColumn: true,
  };

  useEffect(() => {
    async function getAllTasks() {
      await axios
        .post("http://localhost:8000/getAllTasks", { test: "test" })
        .then((data) => {
          if (data.data.error) {
            console.log(data.data.error);
          } else {
            settaskCollection(data.data);
            let dataMemo = [];

            data.data.map((opt) => {
              let RowsModel = {
                task_name: opt.task_name,
                start_time: opt.start_time,
                method: opt.method,
                loop: opt.loop.toString(),
                rollback: opt.rollback,
                rollback_response: opt.rollback_response,
                parameter: JSON.stringify(opt.parameter),
                response: JSON.stringify(opt.response),
                status: opt.error,
                category: opt.category,
                usefulParameter: opt.usefulParameter,
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
                    />
                  </div>
                )}
              </ToolkitProvider>
            );
          }
        })
        .catch((err) => {
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
    // eslint-disable-next-line
  }, [triggergetAllTasks]);

  return (
    <Dialog open={openTaskManagerModal} fullWidth maxWidth={"false"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">TaskManager</h4>
      </div>

      <div className="modal-body">{taskTable}</div>
      <div className="modal-footer">
        <DialogActions></DialogActions>
      </div>
    </Dialog>
  );
}
