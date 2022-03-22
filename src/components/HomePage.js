// @ts-nocheck
import "../styles/Explorer.css";
import Authentication from "./Authentication";
import CodeMirror from "@uiw/react-codemirror";
import { oneDark } from "@codemirror/theme-one-dark";
import { javascript } from "@codemirror/lang-javascript";

function HomePage(props) {
  let description = props.prop.info.description.split("\n\n>")[0];
  let date = props.prop.info.description.split("\n\n>")[1].split("\n>\n> ")[0];
  let Recent_Updates = props.prop.info.description
    .split("\n\n>")[1]
    .split("\n>\n> ")[1]
    .split("\n\n---\n\n")[0];
  let API_Documentation = props.prop.info.description
    .split("\n\n>")[1]
    .split("\n>\n> ")[1]
    .split("\n\n---\n\n")[1]
    .split("\n\n");
  let aTag1 = Recent_Updates.match(/([^[]+(?=]))/g)[0];
  let aTag2 = API_Documentation[0].match(/([^[]+(?=]))/g)[0];
  let aTag3 = API_Documentation[1].match(/([^[]+(?=]))/g)[0];
  let aTag4 = API_Documentation[2].match(/([^[]+(?=]))/g)[0];

  let hrefTag1 = Recent_Updates.match(/\(([^)]+)\)/)[1];
  let hrefTag2 = API_Documentation[0].match(/\(([^)]+)\)/)[1];
  let hrefTag3 = API_Documentation[1].match(/\(([^)]+)\)/)[1];
  let hrefTag4 = API_Documentation[2].match(/\(([^)]+)\)/)[1];
  let ApiServer = props.prop.host;
  let BasePath = props.prop.host + props.prop.basePath;

  let cMirronText = "{\n" + "    'X-Cisco-Meraki-API-Key'" + ":" + " <Meraki_API_Key>" + "\n}";

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <div className="content-header" />
        <div>
          <div className="col-lg-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-header p-2">
                    <ul className="nav nav-pills">
                      <li className="nav-item">
                        <a className="nav-link active" href="#overview" data-toggle="tab">
                          Overview
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#api_servers" data-toggle="tab">
                          API Servers
                        </a>
                      </li>
                      <li className="nav-item">
                        <a className="nav-link" href="#authentication" data-toggle="tab">
                          Authentication
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div className="card-body">
                    <div className="tab-content">
                      <div className="active tab-pane" id="overview">
                        <div className="post">
                          <h3 className="timeline-header">
                            <a href="#">{props.prop.info.title}</a> {props.prop.info.version}
                          </h3>

                          <span className="username">
                            <p className="timeline-header">
                              URL:{" "}
                              <a href={hrefTag2} target="_blank">
                                {props.prop.info.contact.url}
                              </a>
                            </p>
                          </span>
                          <p className="apiEndpoints">{description}</p>
                          <p className="apiEndpoints">{date}</p>
                          <p>
                            <a href={hrefTag1} target="_blank" className="apiEndpoints">
                              {aTag1}
                            </a>
                          </p>
                          <p>
                            <a href={hrefTag2} target="_blank" className="apiEndpoints">
                              {aTag2}
                            </a>
                          </p>
                          <p>
                            <a href={hrefTag3} target="_blank" className="apiEndpoints">
                              {aTag3}
                            </a>
                          </p>
                          <p>
                            <a href={hrefTag4} target="_blank" className="apiEndpoints">
                              {aTag4}
                            </a>
                          </p>
                        </div>
                      </div>
                      <div className="tab-pane" id="api_servers">
                        <div className="post">
                          <h3 className="timeline-header">
                            <p href="#">API Server</p>
                          </h3>

                          <span className="username">
                            <p className="timeline-header">
                              URL:{" "}
                              <a href={`https://${ApiServer}`} target="_blank">
                                {`https://${ApiServer}`}
                              </a>
                            </p>
                            <p className="timeline-header">
                              Base Path:{" "}
                              <a href={`https://${BasePath}`} target="_blank">
                                {`https://${BasePath}`}
                              </a>
                            </p>
                          </span>
                        </div>
                      </div>

                      <div className="tab-pane" id="authentication">
                        {<Authentication prop={props.prop} />}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
