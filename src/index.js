import React from "react";
import ReactDOM from "react-dom";
import NavBarSx from "../src/components/NavBarSx";
import { RecoilRoot } from "recoil";
import "./dist/css/adminlte.min.css";
import "./plugins/bootstrap/js/bootstrap.bundle.min.js";
import "./plugins/fontawesome-free/css/all.min.css";
import "./plugins/jquery/jquery.min.js";
import "./plugins/bootstrap/js/bootstrap.bundle.min.js";
import "./plugins/overlayScrollbars/js/jquery.overlayScrollbars.min.js";
import "./dist/js/adminlte.js";
import "./plugins/chart.js/Chart.min.js";

ReactDOM.render(
  <RecoilRoot>
    <NavBarSx />
  </RecoilRoot>,

  document.getElementById("root")
);
