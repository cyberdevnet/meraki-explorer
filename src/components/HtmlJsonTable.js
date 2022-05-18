import React from "react";
import "react-bootstrap-table-next/dist/react-bootstrap-table2.min.css";

function HtmlJsonTable(props) {
  const { data } = props;
  return (
    <div>
      <table className="table table-striped table-bordered">
        <tbody>
          {Object.keys(data).map((k) => (
            <tr key={k}>
              {!Array.isArray(data) && (
                <td
                  style={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    // whiteSpace: "nowrap",
                    fontSize: "13px",
                    fontWeight: "bold",
                    padding: "5px",
                  }}
                >
                  {k.replace(/_/g, " ")}
                </td>
              )}
              {(() => {
                if (data[k] && typeof data[k] === "object") {
                  return (
                    <td>
                      <HtmlJsonTable data={data[k]} className="table table-striped table-bordered" />
                    </td>
                  );
                }
                return (
                  <td
                    style={{
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      // whiteSpace: "nowrap",
                      fontSize: "13px",
                      padding: "4px",
                    }}
                  >
                    <span dangerouslySetInnerHTML={{ __html: data[k] }} />
                  </td>
                );
              })()}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default HtmlJsonTable;
