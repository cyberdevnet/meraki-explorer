// @ts-nocheck
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import "react-notifications-component/dist/theme.css";
import { produce, current } from "immer";
import "../styles/MuiOverride.css";
import { useRecoilState } from "recoil";
import BootstrapTable from "react-bootstrap-table-next";
import ToolkitProvider, { Search } from "react-bootstrap-table2-toolkit";
// import "react-bootstrap-table2-paginator/dist/react-bootstrap-table2-paginator.min.css";
// import "react-bootstrap-table2-toolkit/dist/react-bootstrap-table2-toolkit.min.css";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";
import { NetworksAndDevicesState, openDevicesModalState } from "../main/GlobalState";

export default function DevicesModel(ac) {
  const [NetworksAndDevices, setNetworksAndDevices] = useRecoilState(NetworksAndDevicesState);
  const [openDevicesModal, setopenDevicesModal] = useRecoilState(openDevicesModalState);
  const { SearchBar } = Search;

  const handleCloseModal = () => {
    setopenDevicesModal(!openDevicesModal);
  };

  // ----------------------------------------------------------------------------------------
  // ----------------------------------------------------------------------------------------

  let newData = [];
  let newColumn = [];
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

      newData.push(RowsModel);
    });

    Object.entries(NetworksAndDevices.devices[0]).map((opt) => {
      let ColumnModel = {};
      if (opt[0] === "licenseExpirationDate" || opt[0] === "tags" || opt[0] === "claimedAt") {
        ColumnModel = {
          label: opt[0],
          value: opt[0],
          dataField: opt[0],
          text: opt[0],
          hidden: true,
        };
      } else {
        ColumnModel = {
          label: opt[0],
          value: opt[0],
          dataField: opt[0],
          sort: true,
          text: opt[0],
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
        };
      }

      newColumn.push(ColumnModel);
    });
  }

  const selectRow = {
    mode: "checkbox",
    selected: ac.dc.devicesIDSelected,
    clickToSelect: true,
    style: { backgroundColor: "#17a2b80f" },
    onSelect: (row, isSelect) => {
      if (isSelect === true) {
        ac.dc.setdevicesSelected([...ac.dc.devicesSelected, row]);
      } else if (isSelect === false) {
        const index = ac.dc.devicesSelected.findIndex((i) => i.serial === row.serial);
        const removeRow = produce(ac.dc.devicesSelected, (draft) => {
          draft = draft.splice(index, 1);
        });
        ac.dc.setdevicesSelected(removeRow);
      }
    },
    onSelectAll: (isSelect, rows, e) => {
      if (isSelect === true) {
        ac.dc.setdevicesSelected(rows);
      } else if (isSelect === false) {
        ac.dc.setdevicesSelected([]);
      }
    },
  };

  return (
    <Dialog open={openDevicesModal} fullWidth maxWidth={"lg"} onClose={handleCloseModal}>
      <div className="modal-header">
        <h4 className="modal-title">Devices</h4>

        <DialogActions>
          <button type="button" className="close" data-dismiss="modal" aria-label="Close" onClick={handleCloseModal}>
            <span aria-hidden="true">&times;</span>
          </button>
        </DialogActions>
      </div>
      <div className="modal-body">
        {NetworksAndDevices.devices.length > 0 ? (
          <ToolkitProvider search keyField="serial" data={newData} columns={newColumn}>
            {(props) => (
              <div>
                <SearchBar style={{ width: "299px" }} {...props.searchProps} />
                <BootstrapTable
                  // eslint-disable-next-line
                  {...props.baseProps}
                  bootstrap4
                  striped
                  hover
                  selectRow={selectRow}
                  noDataIndication={"no results found"}
                />
              </div>
            )}
          </ToolkitProvider>
        ) : (
          <div className="page-content empty-table" style={{ position: "relative" }}>
            <div className="container text-center">
              <div className="display-1 text-muted mb-5">
                <i className="fa fa-database" aria-hidden="true"></i>
              </div>
              <h1 className="h2 mb-3">Oops.. We did not find any device..</h1>
            </div>
          </div>
        )}
      </div>
      <div className="modal-footer">
        <DialogActions>
          <button type="button" className="btn btn-default" data-dismiss="modal" onClick={handleCloseModal}>
            Close
          </button>
        </DialogActions>
      </div>
    </Dialog>
  );
}
