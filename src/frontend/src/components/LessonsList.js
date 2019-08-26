import React, { Component } from "react";
import Icon from "./Icon";
import PropTypes from "prop-types";
import key from "weak-key";


class LessonsList extends Component {
  // static propTypes = {
  //     data: PropTypes.array.isRequired
  //   };

  render() {
    const {data, read_only} = this.props;
    const results = data.results;

    if (results.length) {
      return (
        <section>
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th>Nazwa</th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!read_only &&
              <tr key={"new"}>
                <td key={"new-title"}><a onClick={() => this.props.handleSelect(0)}><b>Stwórz lekcję</b></a></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>}

              {results.map((el, index) => (
                <tr key={el.id}>
                    <td key={el.id+"-title"}><a onClick={() => this.props.handleSelect(el.id)}>{el.title}</a></td>
                    <td key={el.id+"-categories"}>
                      <div className="tags">
                        {el.categories ? (el.categories.split(",").map((item, index) =>
                        <span key={el.id+"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                      </div>
                    </td>
                    <td key={el.id+"-favourite"}>
                      <Icon active={el.favourite} active_class="essentials16-like-1" inactive_class="essentials16-dislike-1" handleClick = {() => this.props.handleUpdate(el.id, index, {'favourite': !el.favourite})}/>
                    </td>
                    <td key={el.id+"-public"}>
                      <Icon active={el.public} active_class="essentials16-worldwide" handleClick = {() => this.props.handleUpdate(el.id, index, {'public': !el.public})}/>
                    </td>
                    <td key={el.id+"-delete"}>
                      <Icon active={true} active_class="essentials16-garbage-1"  handleClick = {() => this.props.handleDelete(el.id)}/>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="has-text-centered">
            <a className="button is-info" onClick={this.props.loadMore} >Więcej</a>
          </div>


        </section>
      );
    }
    else
      return(<h1>Brak ćwiczeń</h1>);
  }
}
export default LessonsList;
