import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NavBarSx.css";

export default function PageNotFound() {
  const navigate = useNavigate();

  function TakeMeHome() {
    navigate("/", { replace: true });
  }
  return (
    <div>
      <div className="container text-center not-found">
        <div className="display-1 text-muted mb-5">
          <i className="si si-exclamation"></i> 404
        </div>

        <h1 className="h2 mb-3">Oops.. You just found an error page..</h1>
        <p className="h4 text-muted font-weight-normal mb-7">
          We are sorry but the page you are looking for was not found &hellip;
        </p>

        <button className="btn btn-primary" onClick={TakeMeHome}>
          <i className="fe fe-arrow-left mr-2"></i>Take me home
        </button>
      </div>
    </div>
  );
}
