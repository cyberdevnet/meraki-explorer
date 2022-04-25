// @ts-nocheck
import "../styles/Explorer.css";

function Overview(props) {
  let description = props.prop.info.description.split("\n\n>")[0];
  let date = props.prop.info.description.split("\n\n>")[1].split("\n>\n> ")[0];
  let Recent_Updates = props.prop.info.description.split("\n\n>")[1].split("\n>\n> ")[1].split("\n\n---\n\n")[0];
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
                          <a className="ac-dashboard" href="#">
                            {props.prop.info.title}
                          </a>{" "}
                          {props.prop.info.version}
                        </h3>

                        <span className="username">
                          <p className="timeline-header">
                            URL:{" "}
                            <a className="ac-dashboard" href={hrefTag2} target="_blank">
                              {props.prop.info.contact.url}
                            </a>
                          </p>
                        </span>
                        <p className="apiEndpoints">{description}</p>
                        <p className="apiEndpoints">{date}</p>
                        <p>
                          <a href={hrefTag1} target="_blank" className="apiEndpoints ac-dashboard">
                            {aTag1}
                          </a>
                        </p>
                        <p>
                          <a href={hrefTag2} target="_blank" className="apiEndpoints ac-dashboard">
                            {aTag2}
                          </a>
                        </p>
                        <p>
                          <a href={hrefTag3} target="_blank" className="apiEndpoints ac-dashboard">
                            {aTag3}
                          </a>
                        </p>
                        <p>
                          <a href={hrefTag4} target="_blank" className="apiEndpoints ac-dashboard">
                            {aTag4}
                          </a>
                        </p>
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

export default Overview;
