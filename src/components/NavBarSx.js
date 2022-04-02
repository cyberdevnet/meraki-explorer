// @ts-nocheck
import { useRef, useEffect, useState, DetailedHTMLProps, HTMLAttributes, SVGProps } from "react";
import adminLTELogo from "../dist/img/mlogo.png";
import HomePage from "./HomePage";
// import Explorer from "./Explorer";
import ExplorerForm from "./ExplorerForm";
import Notifications from "./Notifications";
import { useRecoilValue, useRecoilState } from "recoil";
import { triggerState, OrganizationSelectedState, OrganizationSelectedInfoState } from "../main/GlobalState";
import _ from "lodash";
import "../styles/NavBarSx.css";
import OpenAPIswaggerFile from "./spec2.json";

function App() {
  const [trigger, setTrigger] = useRecoilState(triggerState);
  const [tagsComponent, settagsComponent] = useState(<div></div>);
  const [openExplorer, setOpenExplorer] = useState(false);
  const [openHomePage, setOpenHomePage] = useState(true);
  const [ExplorerProps, setExplorerProps] = useState(false);

  const [openMenu, setopenMenu] = useState("");
  const [allEndpointsList, setallEndpointsList] = useState([]);

  useEffect(() => {
    let Array_OpenAPIswaggerFile = [];
    Array_OpenAPIswaggerFile.push(OpenAPIswaggerFile);
    CreateTreeView(Array_OpenAPIswaggerFile);
  }, [trigger]);

  const categories = [
    "devices",
    "appliance",
    "camera",
    "cellularGateway",
    "switch",
    "wireless",
    "networks",
    "insight",
    "sm",
    "organizations",
    "sensor",
  ];

  function CreateTreeView(ApiData) {
    // group endpoints by Tag and create treeview component

    let newExtractModel = [];
    let mixedPathPrefix = [];

    ApiData.map((opt) => {
      let Model = {
        pathPrefixes: Object.keys(opt.paths),
        pathValues: Object.values(opt.paths),
      };

      newExtractModel.push(Model);
    });

    //merge path with prefixes
    newExtractModel.map((opt, index) => {
      opt.pathValues.map((opt2, index2) => {
        //
        let newModel = { ...opt2, prefix: opt.pathPrefixes[index2] };
        mixedPathPrefix.push(newModel);
      });
    });

    let mixedPathPrefixModel = [];
    mixedPathPrefix.map((opt) => {
      let Model = {
        data: Object.fromEntries(Object.entries(opt).filter(([key]) => !key.includes("prefix"))),
      };

      Object.entries(Model.data).map((opt2, index2) => {
        let id = opt2[1].operationId.replace(/^./, (str) => str.toUpperCase());
        Model.data[opt2[0]].prefix = opt.prefix;
        Model.data[opt2[0]].type = Object.keys(Model.data)[index2];
        Model.data[opt2[0]].id = id.match(/[A-Z][a-z]+|[0-9]+/g).join(" ");

        // set rollbackid on every PUT operation
        // rollback ID is just a get operationId of the update
        if (opt2[0] === "put") {
          let opId = opt2[1].operationId.replace("update", "get");
          opt2[1].rollbackId = opId;
        }
      });

      mixedPathPrefixModel.push(Model);
    });

    let groupedModel = [];

    mixedPathPrefixModel.map((opt) => {
      const grouped = _.groupBy(opt.data, "tags");

      groupedModel.push(grouped);
    });

    let pathSplitted = [];
    let t = "";
    groupedModel.map((opt) => {
      Object.keys(opt).map((opt2) => {
        let Model = opt2.split(",");
        pathSplitted.push(Model);
      });
    });

    let filteredpathSplitted = pathSplitted.filter(((t = {}), (a) => !(t[a] = a in t)));

    const binned = filteredpathSplitted.reduce((result, word) => {
      // get the first letter. (this assumes no empty words in the list)
      const letter = word[0];

      // ensure the result has an entry for this letter
      result[letter] = result[letter] || [];

      // add the word to the letter index
      result[letter].push(word);

      // return the updated result
      return result;
    }, {});

    let Submenus = [];

    Object.entries(binned).map((opt) => {
      let Model = {
        submenu1: opt[0],
        submenu2: opt[1],
      };
      Submenus.push(Model);
    });

    categories.map((opt) => {
      groupedModel.map((opt2) => {
        const grouped = _.groupBy(opt2, "tags");
      });
    });

    let devicesCategory = [];
    let applianceCategory = [];
    let cameraCategory = [];
    let cellularGatewayCategory = [];
    let switchCategory = [];
    let wirelessCategory = [];
    let networksCategory = [];
    let insightsCategory = [];
    let smCategory = [];
    let organizationsCategory = [];
    let sensorCategory = [];

    groupedModel.map((opt) => {
      var keys = Object.keys(opt);
      keys.forEach(function (key) {
        var values = opt[key];

        let Itemtags = "";
        for (let i = 0; i < categories.length; i++) {
          var filtered = values.filter(function (item) {
            Itemtags = item.tags[0];
            // return item.tags[1] === "liveTools";
            return item.tags[0] === categories[i];
          });

          if (Object.keys(filtered).length > 0 && Itemtags === "devices") {
            devicesCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "appliance") {
            applianceCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "camera") {
            cameraCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "cellularGateway") {
            cellularGatewayCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "switch") {
            switchCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "wireless") {
            wirelessCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "networks") {
            networksCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "insight") {
            insightsCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "sm") {
            smCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "organizations") {
            organizationsCategory.push(filtered);
          } else if (Object.keys(filtered).length > 0 && Itemtags === "sensor") {
            sensorCategory.push(filtered);
          }
        }
      });
    });

    let CategoriesPath = {
      devices: devicesCategory,
      appliance: applianceCategory,
      camera: cameraCategory,
      cellularGateway: cellularGatewayCategory,
      switch: switchCategory,
      wireless: wirelessCategory,
      networks: networksCategory,
      insight: insightsCategory,
      sm: smCategory,
      organizations: organizationsCategory,
      sensor: sensorCategory,
    };

    Object.entries(CategoriesPath).filter(function (item) {
      let Itemtags = "";
      Itemtags = item[1].map((opt) => opt[0].tags);
    });

    // ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''
    // ''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

    let allTags = [];
    let allEndpoints = [];

    Object.entries(CategoriesPath).map((opt, index) => {
      opt[1].map((opt1) => {
        opt1.map((opt2) => {
          opt2.category = opt[0];
          allEndpoints.push(opt2);
          allTags.push(opt2.tags);
        });
      });
    });

    setallEndpointsList(allEndpoints);

    LoadTreeView();
  }

  function LoadTreeView() {
    //===========================RELOAD allEndpointsList if still empty ======================//
    if (allEndpointsList.length === 0) {
      setTrigger(!trigger);
    }
    //======================================================================================//
    let FilteredCategories = [];
    for (let i = 0; i < categories.length; i++) {
      let filtered = allEndpointsList.filter(function (item) {
        return item.tags[0] === categories[i];
      });

      let Model = {
        [categories[i]]: filtered,
      };

      FilteredCategories.push(Model);
    }

    // let updateOperations = [];
    // let updateOperationsID = [];
    // let getOperations = [];
    // let getOperationsID = [];

    // FilteredCategories.map((opt, index) => {
    //   Object.values(opt).map((opt2, index2) => {
    //     let update = Object.values(opt2).filter((opt3) => opt3.operationId.startsWith("update"));
    //     let get = Object.values(opt2).filter((opt3) => opt3.operationId.startsWith("get"));
    //     updateOperations.push(update);
    //     getOperations.push(get);

    //     update.map((opt4) => {
    //       updateOperationsID.push(opt4.operationId.replace("update", ""));
    //     });
    //     get.map((opt4) => {
    //       getOperationsID.push(opt4.operationId.replace("get", ""));
    //     });
    //   });
    // });

    // console.log("🚀 ~ file: NavBarSx.js ~ line 254 ~ LoadTreeView ~ updateOperations", updateOperations);

    let tagComponentList = [];

    FilteredCategories.map((opt, index) => {
      if (Object.values(opt)[0].length !== 0) {
        tagComponentList.push(
          <li key={index} className={`nav-item has-treeview ${openMenu}`}>
            <a href="#" className="nav-link ">
              {/* <i className="nav-icon fas fa-building green"></i> */}
              <p className="apiEndpoints">
                {Object.keys(opt)}
                <i className="right fas fa-angle-left"></i>
              </p>
            </a>
            <ul className="nav nav-treeview">
              {Object.values(opt).map((opt1) => {
                return opt1.map((opt2, index3) => (
                  <li key={index3} className="nav-item">
                    <div data-toggle="tab" className="nav-link">
                      <a href="#" className="apiEndpoints" onClick={(e) => OpenExplorer(e, opt2, index3)}>
                        {opt2.id}
                      </a>
                    </div>
                  </li>
                ));
              })}
            </ul>
          </li>
        );
      }
    });

    settagsComponent(tagComponentList);
  }

  // ============================= SEARCH FUNCTION =======================================

  const SearchFunction = (searchText) => {
    let filtered = allEndpointsList.filter(function (item) {
      return (
        item.description.toLowerCase().includes(searchText.target.value.toLowerCase()) ||
        item.id.toLowerCase().includes(searchText.target.value.toLowerCase()) ||
        item.operationId.toLowerCase().includes(searchText.target.value.toLowerCase())
      );
    });
    setallEndpointsList(filtered);

    if (searchText.target.value === "") {
      setopenMenu("");
    } else if (filtered.length === 0) {
      setopenMenu("");
    } else {
      setopenMenu("menu-open");
    }
  };

  // ============================= SEARCH FUNCTION =======================================

  function OpenHomePage(e) {
    // e.preventDefault();
    setOpenHomePage(true);
    setOpenExplorer(false);
  }
  function OpenExplorer(e, opt2, index3) {
    // e.preventDefault();
    setOpenHomePage(false);
    setOpenExplorer(true);
    let propsModel = {
      opt2: opt2,
      index: index3,
    };
    setExplorerProps(propsModel);
  }

  const props = { ExplorerProps };

  return (
    <div className="wrapper">
      <Notifications />
      <nav className="main-header navbar navbar-expand navbar-white navbar-light">
        <ul className="navbar-nav ">
          <li className="nav-item d-none d-sm-inline-block">
            <a href="#" className="nav-link" onClick={(e) => OpenHomePage(e)}>
              Home
            </a>
          </li>
        </ul>
      </nav>

      {/* <!-- Main Sidebar Container --> */}

      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <div className="brand-link">
          <h4 className="text-logo">Meraki Explorer</h4>
          {/* <span className="brand-text font-weight-light">Meraki Explorer</span> */}
        </div>

        <div className="sidebar navbar-nav-scroll">
          <div className="user-panel mt-3 pb-3 mb-3">
            <div className="form-inline ">
              <div className="input-group">
                <input
                  className="form-control form-control-sidebar"
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                  onChange={(text) => {
                    SearchFunction(text), setTrigger(!trigger);
                  }}
                />
              </div>
            </div>
          </div>

          <nav className="mt-2 ">
            <ul
              className="nav nav-pills nav-sidebar flex-column "
              data-widget="treeview"
              role="menu"
              data-accordion="false"
            >
              <li className="nav-header">API ENDPOINTS</li>

              {tagsComponent}
            </ul>
          </nav>
        </div>
      </aside>
      {openHomePage ? <HomePage prop={OpenAPIswaggerFile} /> : <div></div>}
      {openExplorer ? <ExplorerForm prop={props} /> : <div></div>}
      {/* {openExplorer ? <Explorer prop={ExplorerProps} /> : <div></div>} */}
    </div>
  );
}

export default App;
