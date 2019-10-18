import React, { Component } from "react";
import { getData, getCookie } from "./Utils";


class Icon extends Component {

  handleIconMouseOver = (e) => {
    const {active, hover_class, active_class, inactive_class} = this.props;
    const icon_class = active ? active_class: (inactive_class ? inactive_class : active_class + " icon-inactive")
    e.currentTarget.className = hover_class ? hover_class : icon_class + " icon-hover";
  };

  handleIconMouseLeave = (e) => {
    const {active, active_class, inactive_class} = this.props;
    e.currentTarget.className = active ? active_class: (inactive_class ? inactive_class : active_class + " icon-inactive");
  };

  render() {
    const {active, active_class, inactive_class, className} = this.props;
    const icon_class = active ? active_class: (inactive_class ? inactive_class : active_class + " icon-inactive");
    const span_class = className ? "img-icon" + " " + className : "img-icon";
    return (
      <span className={span_class}>
        <i className={icon_class} style={{cursor: 'pointer'}} onClick={this.props.handleClick} onMouseOver={this.handleIconMouseOver} onMouseLeave={this.handleIconMouseLeave}></i>
      </span>
    );
  }
};

class StatusIcon extends React.Component {

  render() {
    const {status, ...other} = this.props;

    switch(status) {
      case 3:
          return <Icon active={true} active_class="essentials16-success"  {...other}/>
      case 2:
          return <Icon active={true} active_class="essentials16-error"  {...other}/>
      case 1:
          return <Icon active={true} active_class="essentials16-edit"  {...other}/>
                  case 3:
      default:
          return <Icon active={true} active_class="essentials16-idea"  {...other}/>
        };
    };
};


class HomeworkTypeIcon extends React.Component {

  render() {
    const {type, ...other} = this.props;

    switch(type) {
      case 1:
          return <Icon active={true} active_class="essentials16-folder-13"  {...other}/>
                  case 3:
      default:
          return <Icon active={true} active_class="essentials16-file"  {...other}/>
        };
    };
};


class SearchBar extends Component {

  render() {
    const {name, value, handleChange, placeholder} = this.props;
    const _placeholder = placeholder ? placeholder : "Szukaj";
    return(
      <div className="level">
          <div className="level-item has-text-centered">
            <div className="field">
              <div className="control">
                <input
                  className="input"
                  type="text"
                  name={name}
                  autoFocus=""
                  placeholder={_placeholder}
                  onChange={handleChange}
                  value={value}
                  required
                />
              </div>
            </div>
          </div>
        </div>
    );
  };
};


class Tile extends React.Component {

  render() {
    const {tag, width, colour_class} = this.props;
    const width_class = width ? " is-" + width : "";
    const parent_class = "tile is-parent" + width_class;
    const child_class = colour_class ? "tile is-child notification " + colour_class : "tile is-child notification";

    return( <div className={parent_class}>
              <div className={child_class}>
                {tag}
              </div>
            </div>
    );
  };
};

class ContentList1 extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Ładuje...",
      refresh: false
      };
  }

  loadMore = () => {
    const data = this.state.data;
    const url = data.next;
    fetch(url)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Błąd ładowania" });
        }
        return response.json();
      })
      .then(new_data => {
        data.results = data.results.concat(new_data.results);
        data.previous = new_data.previous;
        data.next = new_data.next;
        this.setState({ data: data, loaded: true });
      }
      );
  }

  toggleData = (id, index, key) => {
    const {endpoint} = this.props;
    const {data} = this.state;
    const {results} = data;
    const el = results[index]
    el[key] = el[key] ? false : true;

    const formData = new FormData();
    const method =  "put";
    formData.append(key, el[key] ? 'true' : 'false');

    const url = endpoint+id;

    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: method,
      body: formData,
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    fetch(url, conf)
    .then(response => {
      console.log(response);
      if(response.status === 200){
        this.setState({data: data});
      }
    })
  };

  componentDidMount() {
    // For list with data given from parent
    if (!this.props.data)
      getData(this.props.endpoint, this.props.options, 'data', 'loaded', 'placeholder', this);
    else {
      this.setState({data: this.props.data, loaded: true});
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.refresh !== prevProps.refresh) {
      this.setState({refresh: this.props.refresh});
      if (!this.props.data)
        getData(this.props.endpoint, this.props.options, 'data', 'loaded', 'placeholder', this);
      else {
          this.setState({data: this.props.data, loaded: true});
        }
      }
  }

  render() {
    //// console.log(this.props);
    const loaded = this.props.data ? true : this.state.loaded;
    if(!loaded){
      const {placeholder} = this.state;
      return <p>{placeholder}</p>;
    }
    const {data} = this.props.data ? this.props : this.state;
    const {select_list, search_list, class_name, with_num, model_config, mapModel} = this.props;
    const results = data.results;
    const type_choices = model_config.type_choices;
    let table_class = select_list ? "table is-narrower is-hoverable" : "table is-striped is-fullwidth is-hoverable";
    table_class += " " + class_name;
    const elements = mapModel(results, model_config);

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const tr_style = select_list ? {cursor: 'pointer'} : {};

    const icons = (el, index) => {
      if (select_list)
          return <React.Fragment>
                 </React.Fragment>
      if (search_list)
          return <td style={icon_td_style} key={el.id+"-play"}>
                    <Icon active={true} active_class="essentials16-play-button-1"  handleClick = {() => this.props.handlePlay(el.id)}/>
                 </td>
      return <React.Fragment>
            <td style={icon_td_style} key={el.id+"-favourite"}>
              <Icon active={el.favourite} active_class="essentials16-like-1" inactive_class="essentials16-dislike-1" handleClick = {() => this.toggleData(el.id, index, 'favourite')}/>
            </td>
            <td style={icon_td_style} key={el.id+"-public"}>
              <Icon active={el.public} active_class="essentials16-worldwide" handleClick = {() => this.toggleData(el.id, index, 'public')}/>
            </td>
            <td style={icon_td_style} key={el.id+"-delete"}>
              <Icon active={true} active_class="essentials16-garbage-1"  handleClick = {() => this.props.handleDelete(el.id)}/>
            </td>
            <td style={icon_td_style} key={el.id+"-play"}>
              <Icon active={true} active_class="essentials16-play-button-1"  handleClick = {() => this.props.handlePlay(el.id)}/>
            </td>
          </React.Fragment>
      }

      const table_header = () => {
        if (select_list)
            return <thead>
                   </thead>;
        if (search_list)
            return <thead>
                      <tr>
                        <th></th>
                        <th></th>
                        <th></th>
                        <th></th>
                      </tr>
                    </thead>;

        return <thead>
                  <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>;
        }

    return <section>
              <table className={table_class}>
                {table_header()}
                <tbody>
                  {elements.map((el, index) => (
                      <tr key={el.id} style={tr_style} onClick={() => select_list ? this.props.handleSelect(el, index) : {}}>
                          {with_num && <td key={el.id+"-num"}>{index+1}</td>}
                          {Object.entries(el.fields).map((field, index) => (
                            <td key={el.id+field[0]}>
                              {(!select_list && field[0] == el.title_field) ?
                              <a onClick={() => this.props.handleSelect(el.id)}>{field[1]}</a>
                              : field[1]}
                            </td>
                          ))}
                          {icons(el, index)}
                      </tr>
                  ))}
                </tbody>
              </table>
              {(!select_list) && <div className="has-text-centered">
                <a className="button is-info" onClick={this.loadMore} >Więcej</a>
              </div>}
          </section>
  }
}


function HighlightedText(props){
  const {text} = props;
  const highlight_start = props.highlight_start !== undefined ? props.highlight_start : 0;
  const highlight_end = props.highlight_end !== undefined ? props.highlight_end : 0;

  const highlight = (highlight_start > 0 || highlight_end > 0) && text;
  const text_class = highlight ? "has-text-weight-bold" : "";
  let highlighted_text = text.slice(0);
  let highlighted_text_begin = '';
  let highlighted_text_end = '';


  if (highlight){
    if (highlight_start > 0) {
      highlighted_text_begin = highlighted_text.slice(0, highlight_start-1);
      highlighted_text = highlighted_text.slice(highlight_start-1);
    }
    if (highlight_end > 0){
      const end_position = highlight_start ? highlight_end-(highlight_start-1) : highlight_end;
      highlighted_text_end = highlighted_text.slice(end_position);
      highlighted_text = highlighted_text.slice(0, end_position);
    }

  }

  const space1 = highlight_start > 0 && (highlighted_text_begin.slice(-1) === ' ' || highlighted_text.slice(0,1) === ' ');
  const space2 = highlight_end > 0 && (highlighted_text.slice(-1) === ' ' || highlighted_text_end.slice(0,1) === ' ');


  return (
    <React.Fragment>
      <span>{highlighted_text_begin}</span>
      {space1 && <span>&nbsp;</span>}
      <span className={text_class}>{highlighted_text}</span>
      {space2 && <span>&nbsp;</span>}
      <span>{highlighted_text_end}</span>
    </React.Fragment>
  )
}


export {
  Icon,
  StatusIcon,
  SearchBar,
  ContentList1,
  Tile,
  HomeworkTypeIcon,
  HighlightedText,
}
