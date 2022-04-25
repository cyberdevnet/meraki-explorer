// @ts-nocheck
import "../styles/Explorer.css";

function ApiServers(props) {
  let ApiServer = props.prop.host;
  let BasePath = props.prop.host + props.prop.basePath;

  return (
    <div className="wrapper">
      <div className="content-wrapper">
        <div className="content-header" />
        <div>
          <div className="col-lg-12">
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    <div className="tab-content">
                      <div className="post">
                        <h3 className="timeline-header">
                          <p href="#">API Server</p>
                        </h3>

                        <span className="username">
                          <p className="timeline-header">
                            URL:{" "}
                            <a className="ac-dashboard" href={`https://${ApiServer}`} target="_blank">
                              {`https://${ApiServer}`}
                            </a>
                          </p>
                          <p className="timeline-header">
                            Base Path:{" "}
                            <a className="ac-dashboard" href={`https://${BasePath}`} target="_blank">
                              {`https://${BasePath}`}
                            </a>
                          </p>
                        </span>
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

export default ApiServers;
