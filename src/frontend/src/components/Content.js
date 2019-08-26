import React from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import { Exercise, ExerciseForm, ExercisePreview, ExercisePlay, MapExercise } from "./Exercises";
import { Lesson, LessonForm, LessonPreview, MapLesson } from "./Lessons";
import key from "weak-key";
import { Icon, SearchBar } from './Components';
import { getData } from "./Utils"


function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


class Content extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      material_type: 2, // 1 - courses, 2 - lessons, 3 - exercises
      detail_view: 0, // 0 - list, 1 - form, 2 - search list, 3 - preview, 4 - play
      detail_id: 0, // id of edited object
      query: "",
      colour: "is-primary",
    };
  }

  selectSite(type, view, id, query){
    //type - 1 courses, 2 lessons, 3 exercises
    //view - 0 - list, 1 - form, 2 - search list, 3 - preview, 4 - play
    //id - id of edited object
    console.log(type);
    console.log(view);
    console.log(id);
    const _id = (view==0) ? 0 : id;
    const _query = (view==0) ? query : "";
    this.setState({detail_id: _id, detail_view: view, material_type: type, query: _query});
  };

  render(){
    const { material_type, detail_view, detail_id, query, colour } = this.state;

    const aside_menu = <SideMenu
      selectSite={(type, view, query) => this.selectSite(type, view, 0, query)}
      material_type={material_type}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
    />;

    const lessons_site = <Lesson
      key = "lesson_site"
      selectSite={(view, id) => this.selectSite(2, view, id)}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
    />;

    const exercises_site =
      <div className="column is-7 is-offset-1">
        <div className="box">
        <Exercise
         key = "exercise_site"
         selectSite={(view, id) => this.selectSite(3, view, id)}
         detail_view={detail_view}
         detail_id={detail_id}
         query={query}
       />;
        </div>


          </div>;


    let content_site = <p>Nothing to display</p>;
    switch(material_type) {
      case 0:
          content_site = lessons_site;
          break;
      case 1:
          content_site = lessons_site;
          break;
      case 2:
          content_site = lessons_site;
          break;
      case 3:
          content_site = exercises_site;
          break;
      default:
          content_site = lessons_site;
        };

    return <React.Fragment>
            <section className={"hero " + colour}>
              <div className="hero-body">
                <div className="containter">
                  <h1 className="title">Moje materiały</h1>
                  <h2 className="subtitle is-5">przeglądaj, edytuj, twórz</h2>
                </div>
              </div>
            </section>
            {/* <hr className="hr"/> */}
            <section className="section columns" style={{paddingTop: 6}}>
              {aside_menu}
              {content_site}
            </section>
          </React.Fragment>
  }
}


class ContentSite extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      title: "",
      type: "",
      categories: "",
      placeholder: "Ładuje...",
      model_config: [],
      loaded: false,
      refresh: false,
      query: ""
    };
  }

  getConfig(){
    fetch(this.props.endpoint+'config')
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => this.setState({ model_config: data, loaded: true }));
  }

  handleDelete = id => {
    var csrftoken = getCookie('csrftoken');
    const refresh = this.state.refresh;
    const confirm = this.props.confirm;
    const conf = {
      method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
    };
    if (confirm())
      fetch(this.props.endpoint+id , conf).then(response => console.log(response)).then(() => {this.setState({refresh: !refresh});});
  };

  handleChange = e => {
    // const refresh = this.state.refresh;
    this.setState({ [e.target.name]: e.target.value});
    console.log(e.target.name);
    this.forceRefresh();
    // this.setState({ [e.target.name]: e.target.value, refresh: !refresh });
  };

  endEdit = () => {
    this.props.selectSite(0, 0);
  };

  forceRefresh = () => {
    console.log("force refresh");
    const refresh = this.state.refresh;
    this.setState({ refresh: !refresh });
  };

  componentDidMount() {
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    console.log(this.props.query);
      // Typical usage (don't forget to compare props):
      const query = this.props.query;
      if (this.props.query !== prevProps.query) {
        this.setState({query: query}, this.forceRefresh);
      }
    }

  render(){
    console.log("render content site");
    const {loaded, model_config, refresh, placeholder, query,
      colour} = this.state;
    const {endpoint, content_form, content_preview, new_text, detail_view, detail_id, empty_list, MapModel} = this.props;
    // console.log("render"+endpoint);
    // console.log(query);
    // console.log("render:" + detail_view + ',' + detail_id)

    const display_form =
    <div className="column is-7 is-offset-1">
      {this.props.content_form(endpoint, detail_id, loaded, model_config, refresh, this.endEdit, this.handleDelete)}
    </div>;

    const display_preview =
    <div className="column is-7 is-offset-1">
      {this.props.content_preview(endpoint, detail_id, loaded, model_config)}
    </div>;

    const display_play =
    <div className="column is-7 is-offset-1">
      {this.props.content_play(endpoint, detail_id, loaded, model_config)}
    </div>;

    const display_list =
     <div className="column is-4 is-offset-2">
       <div className="level">
           <div className="level-item has-text-centered">
               <a className="button is-info" onClick={() => this.props.selectSite(1, 0)} >{new_text}</a>
           </div>
       </div>
       <SearchBar value={query} handleChange={this.handleChange} name={"query"}/>
       <DataProvider key="list"
                   endpoint={endpoint}
                   options={{query: query, limit: 10}}
                   render={(data, loadMore, handleUpdate) => <ContentList data={data}
                   model_config={model_config}
                   placeholder={empty_list}
                   MapModel={MapModel}
                   loadMore = {loadMore}
                   handleUpdate = {handleUpdate}
                   handleDelete={(id) => this.handleDelete(id)}
                   handleSelect={(id) => this.props.selectSite(1, id)}
                   handlePlay={(id) => this.props.selectSite(4, id)}
                   />}
                   refresh={refresh}
                   />
    </div>

    const display_search =
     <div className="column is-4 is-offset-2">
       <SearchBar value={query} handleChange={this.handleChange} name={"query"}/>
       <DataProvider key="search"
                   endpoint={endpoint+"search"}
                   options={{query: query, limit: 10}}
                   render={(data, loadMore, handleUpdate) => <ContentList data={data}
                   model_config={model_config}
                   placeholder={empty_list}
                   MapModel={MapModel}
                   loadMore = {loadMore}
                   handleUpdate = {handleUpdate}
                   handleSelect={(id) => this.props.selectSite(3, id)}
                   handlePlay={(id) => this.props.selectSite(4, id)}
                   search_list={true}
                   />}
                   refresh={refresh}
                   />
    </div>


    let disp_detail_site = <p>Nothing to display</p>;
    switch(detail_view) {
      case 0:
          disp_detail_site = display_list;
          break;
      case 1:
          disp_detail_site = display_form;
          break;
      case 2:
          disp_detail_site = display_search;
          break;
      case 3:
          disp_detail_site = display_preview;
          break;
      case 4:
          disp_detail_site = display_play;
          break;
      default:
          disp_detail_site = display_list;
        };

    return loaded ? disp_detail_site : <p>{placeholder}</p>;
    // return "loading";
  }
}


class SideMenu extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint : "/api/exercise/tags",
      tags : [],
      loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  componentDidMount() {
    const {endpoint} = this.state;
    getData(endpoint,'', 'tags', 'loaded', 'placeholder', this);
  }

  render(){
    const { loaded, placeholder, tags } = this.state;
    const { detail_view, detail_id, material_type, query} = this.props;

    const _tags = loaded ? tags : {categories : [], levels : []};

    const course_menu = <ContentMenu
      selectSite={(view, query) => this.props.selectSite(1, view, query)}
      selected={material_type == 1}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
      tags={_tags}
      title="Kursy" list_title="Moje kursy" edit_title="Edytuj kurs" new_title="Nowy kurs" search_title="Szukaj kursów"
    />;

    const lesson_menu = <ContentMenu
      selectSite={(view, query) => this.props.selectSite(2, view, query)}
      selected={material_type == 2}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
      tags={_tags}
      title="Lekcje" list_title="Moje lekcje" edit_title="Edytuj lekcję" new_title="Nowa lekcja" search_title="Szukaj lekcji"
    />;

    const exercise_menu = <ContentMenu
      selectSite={(view, query) => this.props.selectSite(3, view, query)}
      selected={material_type == 3}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
      tags={_tags}
      title="Ćwiczenia" list_title="Moje ćwiczenia" edit_title="Edytuj ćwiczenie" new_title="Nowe ćwiczenie" search_title="Szukaj ćwiczeń"
    />;

    return loaded ? (
      <div className="column is-2 is-offset-0">
        <aside className="menu">
          {course_menu}
          {lesson_menu}
          {exercise_menu}
        </aside>
      </div>
    ) : <p>{placeholder}</p>;
  }
}


class ContentMenu extends React.Component{

  render(){
    const { detail_view, detail_id, selected, query, tags, title,
      list_title, edit_title, new_title, search_title} = this.props;
    const { categories, levels } = tags;

    const cat_menu =
        <ul>
          {categories.map((el, index) => (
            <li key={index}>
              {query == el ? <a className="is-active">{el}</a>
                : <a onClick={() => this.props.selectSite(0, el)}>{el}</a>}
            </li>
          ))}
        </ul>;

    const lev_menu =
      <ul>
        {levels.map((el, index) => (
          <li key={index}>
            {query == el ? <a className="is-active">{el}</a>
              : <a onClick={() => this.props.selectSite(0, el)}>{el}</a>}
          </li>
        ))}
      </ul>;

    const list_menu = (selected && detail_view==0) ?
    <li>
      {query == "" ? <a className="is-active">{list_title}</a> :
        <a onClick={() => this.props.selectSite(0, "")}>{list_title}</a>
      }
        <ul>
        <li>
          {cat_menu}
        </li>
        <li>
          {lev_menu}
        </li>
      </ul>
    </li>
    : <li><a onClick={() => this.props.selectSite(0, "")}>{list_title}</a></li>;

    const new_menu = (selected && detail_view==1 && detail_id==0) ?
    <li><a className="is-active">{new_title}</a></li>
    : <li><a onClick={() => this.props.selectSite(1, "")}>{new_title}</a></li>;

    const edit_menu = (selected && detail_view==1 && detail_id!=0) ?
    <li><a className="is-active">{edit_title}</a></li>
    : "";

    const search_menu = (selected && detail_view==2) ?
    <li><a className="is-active">{search_title}</a></li>
    : <li><a onClick={() => this.props.selectSite(2, "")}>{search_title}</a></li>;



    return (
     <React.Fragment>
        <p className="menu-label">
          {title}
        </p>
        <ul className="menu-list">
          {list_menu}
          {edit_menu}
          {new_menu}
          {search_menu}
        </ul>
      </React.Fragment>
    );
  }
}


class ContentList extends React.Component {

  render() {
    const { data, model_config, MapModel, read_only, search_list, loadMore, className, with_num, placeholder } = this.props;
    const results = data.results;
    const type_choices = model_config.type_choices;
    const table_class = read_only ? "table is-narrower is-hoverable" : "table is-striped is-fullwidth is-hoverable";
    const tr_click = read_only ? () => this.props.handleSelect(el, index) : "";
    const elements = MapModel(results, model_config);

    const table_header = () => {
      if (read_only)
          return ""
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

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const icons = (el, index) => {
    if (read_only)
        return ""
    if (search_list)
        return <td style={icon_td_style} key={el.id+"-play"}>
                  <Icon active={true} active_class="essentials16-play-button-1"  handleClick = {() => this.props.handlePlay(el.id)}/>
               </td>
    return <React.Fragment>
          <td style={icon_td_style} key={el.id+"-favourite"}>
            <Icon active={el.favourite} active_class="essentials16-like-1" inactive_class="essentials16-dislike-1" handleClick = {() => this.props.handleUpdate(el.id, index, {'favourite': !el.favourite})}/>
          </td>
          <td style={icon_td_style} key={el.id+"-public"}>
            <Icon active={el.public} active_class="essentials16-worldwide" handleClick = {() => this.props.handleUpdate(el.id, index, {'public': !el.public})}/>
          </td>
          <td style={icon_td_style} key={el.id+"-delete"}>
            <Icon active={true} active_class="essentials16-garbage-1"  handleClick = {() => this.props.handleDelete(el.id)}/>
          </td>
          <td style={icon_td_style} key={el.id+"-play"}>
            <Icon active={true} active_class="essentials16-play-button-1"  handleClick = {() => this.props.handlePlay(el.id)}/>
          </td>
        </React.Fragment>
    }

    const list_content = <React.Fragment>
                        <table className={table_class}>
                        {table_header()}
                          <tbody>
                            {elements.map((el, index) => (
                                <tr key={el.id} onClick={() => read_only ? this.props.handleSelect(el, index) : {}}>
                                    {with_num && <td key={el.id+"-num"}>{index+1}</td>}
                                    {Object.entries(el.fields).map((field, index) => (
                                      <td key={el.id+field[0]}>
                                        {(!read_only && field[0] == el.title_field) ?
                                        <a onClick={() => this.props.handleSelect(el.id)}>{field[1]}</a>
                                        : field[1]}
                                      </td>
                                    ))}
                                    {icons(el, index)}
                                </tr>
                            ))}
                          </tbody>
                        </table>
                        {(loadMore || !read_only) && <div className="has-text-centered">
                          <a className="button is-info" onClick={loadMore} >Więcej</a>
                        </div>}
                      </React.Fragment>

    const list_html = read_only ? <div className='Content'>{list_content}</div>
    : <section>{list_content}</section>;

    if (results.length) {
          return (
            list_html
          );
        }
    else
      return(placeholder);
  }
}



export default Content;
export {
  ContentList,
}
// <div className="column is-7 is-fullheight is-grey-lighter">
//   {disp_detail_site}
// </div>
