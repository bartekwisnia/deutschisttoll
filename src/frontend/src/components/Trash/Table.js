import React from "react";
import PropTypes from "prop-types";
import key from "weak-key";

const objectDelete = id => {
  const conf = {
    method: "delete"
  };
  fetch("api/exercise/"+id , conf).then(response => console.log(response));
};

const Table = ({ data }) =>
  !data.length ? (
    <p>Nothing to show</p>
  ) : (
    <div className="column">
      <h2 className="subtitle">
        <strong>{data.length} obiektów</strong>
      </h2>
      <table className="table is-striped">
        <thead>
          <tr>
            {Object.entries(data[0]).map(el => <th key={key(el)}>{el[0]}</th>)}
            <td>delete</td>
          </tr>
        </thead>
        <tbody>
          {data.map(el => (
            <tr key={el.id}>
              {Object.entries(el).map(el => <td key={key(el)}>{el[1]}</td>)}
              <td>
                <a class="button is-primary" onClick={() => this.props.objectDelete(el.id)}>
                  X
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
Table.propTypes = {
  data: PropTypes.array.isRequired
};
export default Table;
