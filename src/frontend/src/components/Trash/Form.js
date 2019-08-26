import React, { Component } from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";


class Form extends Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };
  state = {
    // title: "",
    // type: "DES_PIC",
    categories: "słownictwo, A1, zwierzęta"
  };
  // handleChange = e => {
  //   this.setState({ [e.target.name]: e.target.value });
  // };
  //
  // handleSubmit = e => {
  //   e.preventDefault();
  //   const { title, type } = { this.state.title, this.state.type };
  //   const exercise = { title, type };
  //   const conf = {
  //     method: "post",
  //     body: JSON.stringify(exercise),
  //     headers: new Headers({ "Content-Type": "application/json" })
  //   };
  //   fetch(this.props.endpoint, conf).then(response => console.log(response));
  // };

  render() {
    const title = this.props.title;
    const type = this.props.type;
    const categories = this.state.categories;
    return (
      <div className="column">
        <form onSubmit={this.props.onSubmit}>
          <div className="field">
            <label className="label">Tytuł</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="title"
                onChange={this.props.onChange}
                value={title}
                required
              />
            </div>
          </div>
          <div className="field">
            <label className="label">Typ</label>
            <div className="control">
              <input
                className="input"
                type="text"
                name="type"
                onChange={this.props.onChange}
                value={type}
                required
              />
            </div>
          </div>
          <div className="control">
            <button type="submit" className="button is-info">
              Stworz
            </button>
          </div>
        </form>

        <DataProvider endpoint={this.props.endpoint}
                      render={data => <Table data={data} />}
                      refresh={this.state.refresh}/>

      </div>
    );
  }
}
export default Form;
