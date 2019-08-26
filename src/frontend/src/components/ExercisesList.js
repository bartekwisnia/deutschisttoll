import React, { Component } from "react";
import Icon from "./Icon";
import PropTypes from "prop-types";
import key from "weak-key";


class ExercisesList extends Component {
  // static propTypes = {
  //     data: PropTypes.array.isRequired
  //   };

  constructor(props){
    super(props);
    this.state = {
      refresh: false
      };
  }

componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    const refresh = !this.state.refresh;
    if (this.props.data !== prevProps.data) {
      this.setState({refresh: refresh});
    }
  }

  render() {
    const { data, model_config, read_only, loadMore, className, with_num } = this.props;
    // console.log(model_config);
    const results = data.results;
    const type_choices = model_config.type_choices;

    if (results.length) {
        if (read_only){
          return (
            <div className="Content">
              <table className={"table is-narrower is-hoverable "}>
                <tbody>
                  {results.map((el, index) => (
                      <tr key={el.id} onClick={() => this.props.handleSelect(el, index)}>
                          {with_num && <td key={el.id+"-num"}>{index+1}</td>}
                          <td key={el.id+"-title"}>{el.title}</td>
                          <td key={el.id+"-type"}>{type_choices[el.type]}</td>
                          {/* <td key={el.id+"-categories"}>{el.categories}</td> */}
                          <td key={el.id+"-tags"}>
                            <div className="tags">
                              {el.categories ? (el.categories.split(",").map((item, index) =>
                              <span key={el.id+"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                              {el.level ? (el.level.split(",").map((item, index) =>
                              <span key={el.id+"-level-"+index} className="tag is-info">{item}</span>)) : ""}
                            </div>
                          </td>
                      </tr>
                  ))}
                </tbody>
              </table>
              {loadMore && <div className="has-text-centered">
                <a className="button is-info" onClick={loadMore} >Więcej</a>
              </div>}
            </div>
          );
        }
        else {
          return (
            <div className="column is-3 is-fullheight is-grey-lighter">
              <h3 className="title is-5 is-spaced">
                <strong>Moje ćwiczenia:</strong>
              </h3>
              <table className="table is-striped is-fullwidth">
                <thead>
                  <tr>
                    <th>Tytuł</th>
                    <th>Typ</th>
                    <th>Kategorie</th>
                    <th></th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((el, index) => (
                    <tr key={el.id}>
                        <td key={el.id+"-title"}><a onClick={() => this.props.handleSelect(el.id)}>{el.title}</a></td>
                        <td key={el.id+"-type"}>{type_choices[el.type]}</td>
                        {/* <td key={el.id+"-categories"}>{el.categories}</td> */}
                        <td key={el.id+"-categories"}>
                          <div className="tags">
                            {el.categories ? (el.categories.split(",").map((item, index) =>
                            <span key={el.id+"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                            {el.level ? (el.level.split(",").map((item, index) =>
                            <span key={el.id+"-level-"+index} className="tag is-info">{item}</span>)) : ""}
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
            </div>
          );
        }
      }
    else
      return(<h1>Brak ćwiczeń</h1>);
  }
}
export default ExercisesList;
