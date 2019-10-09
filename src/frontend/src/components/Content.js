import React from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import { Exercise, ExerciseForm, ExercisePreview, ExercisePlay, MapExercise } from "./Exercises";
import Word from "./Words";
import { Translations} from "./Words";
import { ExerciseSet, ExerciseSetForm, ExerciseSetPreview, MapExerciseSet } from "./ExerciseSet";
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
      material_type: 3, // 1 - courses, 2 - sets, 3 - exercises, 4 - words
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
    // console.log(type);
    // console.log(view);
    // console.log(id);
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

    const exercise_set_site = <ExerciseSet
      key = "exercise_set_site"
      selectSite={(view, id) => this.selectSite(2, view, id)}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
    />;

    const exercises_site =
        <div className="column is-7 is-offset-1">
          <Exercise
               key = "exercise_site"
               selectSite={(view, id) => this.selectSite(3, view, id)}
               detail_view={detail_view}
               detail_id={detail_id}
               query={query}
             />
        </div>
     const words_site = <div className="column is-7 is-offset-1">
       <Word
            key = "words_site"
            selectSite={(view, id) => this.selectSite(4, view, id)}
            setID={(id) => this.selectSite(4, 1, id)}
            view={detail_view}
            id={detail_id}
            query={query}
          />
        </div>

    const translations_site = <div className="column is-7 is-offset-1">
      <Translations
           key = "words_site"
         />
       </div>

    let content_site = <p>Nothing to display</p>;
    switch(material_type) {
      case 0:
          content_site = exercises_site;
          break;
      case 1:
          content_site = exercise_set_site;
          break;
      case 2:
          content_site = exercise_set_site;
          break;
      case 3:
          content_site = exercises_site;
          break;
      case 4:
          content_site = words_site;
          break;
      case 5:
          content_site = translations_site;
          break;
      default:
          content_site = exercises_site;
        };

    return <React.Fragment>
            <section className={"hero hero-bg-img is-primary"}>
              <div className="hero-body">
                <div className="container">
                  <h1 className="title">Moje materiały</h1>
                  <div className="button is-static">przeglądaj, edytuj, twórz</div>
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

    const exercise_set_menu = <ContentMenu
      selectSite={(view, query) => this.props.selectSite(2, view, query)}
      selected={material_type == 2}
      detail_view={detail_view}
      detail_id={detail_id}
      query={query}
      tags={_tags}
      title="Zestawy ćwiczeń" list_title="Moje zestawy" edit_title="Edytuj zestaw" new_title="Nowy zestaw" search_title="Szukaj"
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
          {exercise_menu}
          {exercise_set_menu}
          <p className="menu-label">
            Słownik
          </p>
          <ul className="menu-list">
            <li><a onClick={() => this.props.selectSite(4, 1, '')}>Nowe słówko</a></li>
          </ul>
          <ul className="menu-list">
            <li><a onClick={() => this.props.selectSite(5, 0, '')}>Tłumaczenia</a></li>
          </ul>
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

export default Content;

// <div className="column is-7 is-fullheight is-grey-lighter">
//   {disp_detail_site}
// </div>
