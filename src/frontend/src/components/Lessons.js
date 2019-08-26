import React from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import { ContentList } from "./Content";
import { MapExercise, ExercisePlay } from "./Exercises";
import key from "weak-key";
import { Icon, SearchBar, ContentList1 } from './Components';
import { getData, overalStatus, getCookie  } from "./Utils";


function MapLesson(results, model_config) {
  let elements = [];
  results.map((el, index) => {
      const tags =  <div className="tags">
                      {el.categories ? (el.categories.split(",").map((item, index) =>
                      <span key={el.id+"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                      {el.level ? (el.level.split(",").map((item, index) =>
                      <span key={el.id+"-level-"+index} className="tag is-info">{item}</span>)) : ""}
                    </div>
      const fields = {
        title: el.title,
        tags: tags
      };
      el['title_field'] = "title";
      el['fields'] = fields;
      elements.push(el);
    }
  );
  return elements
}


class LessonList extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/lesson/",
      placeholder: "Ładuje...",
      model_config: [],
      config_loaded: false,
    };
  }

  getConfig(){
    const {endpoint} = this.state;
    fetch(this.state.endpoint+'config')
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => this.setState({ model_config: data, config_loaded: true }));
  }

  componentDidMount() {
    this.getConfig();
  }

  render(){
    // console.log("render lessons site");
    const {config_loaded, model_config, placeholder, endpoint} = this.state;
    const loaded = config_loaded;
    const {query, ...other} = this.props;

    if (!loaded)
      return <p>{placeholder}</p>;

    return <ContentList1 {...other}
              key="lesson-list"
              endpoint={endpoint}
              options={{query: query, limit: 10}}
              model_config={model_config}
              mapModel={MapLesson}
              />
  }
}


class Lesson extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/lesson/",
      placeholder: "Ładuje...",
      model_config: [],
      exercise_endpoint: "api/exercise/",
      exercise_config: [],
      config_loaded: false,
      exercise_config_loaded: false,
      refresh: false,
      query: ""
    };
  }

  handleDelete = id => {
    var csrftoken = getCookie('csrftoken');
    const {refresh, endpoint} = this.state;
    const conf = {
      method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć tę lekcję?"))
      fetch(endpoint+id , conf).then(response => console.log(response)).then(() => {this.setState({refresh: !refresh});});
  };

  handleChange = e => {
    // const refresh = this.state.refresh;
    this.setState({ [e.target.name]: e.target.value});
    // console.log(e.target.name);
    this.forceRefresh();
    // this.setState({ [e.target.name]: e.target.value, refresh: !refresh });
  };

  endEdit = () => {
    this.props.selectSite(0, 0);
  };

  forceRefresh = () => {
    // console.log("force refresh");
    const refresh = this.state.refresh;
    this.setState({ refresh: !refresh });

  };

  getConfig(){
    const {endpoint} = this.state;
    fetch(this.state.endpoint+'config')
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => this.setState({ model_config: data, config_loaded: true }));
  }

  getExerciseConfig(){
      fetch(this.state.exercise_endpoint+'config')
        .then(response => {
          if (response.status !== 200) {
            return this.setState({ placeholder: "Something went wrong" });
          }
          return response.json();
        })
        .then(data => this.setState({ exercise_config: data, exercise_config_loaded: true }));
    }

  componentDidMount() {
    this.getConfig();
    this.getExerciseConfig();
  }

  componentDidUpdate(prevProps) {
    // console.log(this.props.query);
      // Typical usage (don't forget to compare props):
      const query = this.props.query;
      if (this.props.query !== prevProps.query) {
        this.setState({query: query}, this.forceRefresh);
      }

    }

  render(){
    // console.log("render lessons site");
    const {config_loaded, exercise_config_loaded, model_config, exercise_config, refresh, placeholder, query,
      colour, endpoint} = this.state;
    const loaded = config_loaded && exercise_config_loaded;
    const {detail_view, detail_id, ...other} = this.props;

    if (!loaded)
      return <p>{placeholder}</p>;

    switch(detail_view) {
      case 0:
          return      <div className="column is-4 is-offset-2">
                         <div className="level">
                             <div className="level-item has-text-centered">
                                 <a className="button is-info" onClick={() => this.props.selectSite(1, 0)} >Nowa lekcja</a>
                             </div>
                         </div>
                         <SearchBar value={query} handleChange={this.handleChange} name={"query"}/>
                         <ContentList1
                                     key="list"
                                     endpoint={endpoint}
                                     options={{query: query, limit: 10}}
                                     model_config={model_config}
                                     mapModel={MapLesson}
                                     handleDelete={(id) => this.handleDelete(id)}
                                     handleSelect={(id) => this.props.selectSite(1, id)}
                                     handlePlay={(id) => this.props.selectSite(4, id)}
                                     refresh={refresh}
                                     />
                     </div>
      case 1:
          return     <div className="column is-7 is-offset-1">
                <LessonForm
                  key={"form_"+detail_id}
                  endpoint={endpoint} id={detail_id}
                  loaded={true}
                  model_config={model_config}
                  exercise_config={exercise_config}
                  object_delete={() => this.handleDelete(detail_id)}
                  endEdit={this.endEdit}
                  refresh={refresh}
                  handlePlay={() => this.props.selectSite(4, detail_id)}
                  />
              </div>;
      case 2:
          return      <div className="column is-4 is-offset-2">
                 <SearchBar value={query} handleChange={this.handleChange} name={"query"}/>
                 <ContentList1 search_list={true}
                             key="search"
                             endpoint={endpoint+"search"}
                             options={{query: query, limit: 10}}
                             model_config={model_config}
                             mapModel={MapLesson}
                             handleSelect={(id) => this.props.selectSite(3, id)}
                             handlePlay={(id) => this.props.selectSite(4, id)}
                             refresh={refresh}
                             />
              </div>
      case 3:
        return <div className="column is-7 is-offset-1">
                  <LessonPreview
                    key={"preview_"+detail_id}
                    endpoint={endpoint} id={detail_id}
                    loaded={true}
                    model_config={model_config}
                    exercise_config={exercise_config}
                    handlePlay={() => this.selectSite(4, detail_id)}
                    />
                </div>;
      case 4:
          return   <LessonPlay
                        key={"exercise_play_"+detail_id}
                        endpoint={endpoint} id={detail_id}
                        loaded={true}
                        model_config={model_config}
                        exercise_config={exercise_config}
                        {...other}
                        />
      case 5:
        return <LessonFrontpage
                    endpoint={endpoint} id={detail_id}
                    loaded={true}
                    model_config={model_config}
                    exercise_config={exercise_config}
                    onClickPlay={() => this.props.onClickPlay(detail_id)}
                    />
      default:
          return <p>Nothing to display</p>;
        };


  }
}


class LessonForm extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", categories: "", exercises: [],
      favourite: false, public: false},
      exercises: [],
      data_loaded: false,
      exercises_loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false,
      exercise_query: "",
      exercise_endpoint: "api/exercise/",
      };
  }

  handleDelete = () => {
    const {id, endpoint} = this.props;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: "delete",
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć lekcję?"))
      fetch(this.props.endpoint+id , conf)
      .then(response => console.log(response))
      .then(() =>{this.props.endEdit();});
  };

  handleChange = e => {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data: data });
  };

  favouriteChange = () => {
    const data = this.state.data;
    data['favourite'] = !data['favourite'];
    this.setState({ data: data });
  };

  publicChange = () => {
    const data = this.state.data;
    data['public'] = !data['public'];
    this.setState({ data: data });
  };

  addExercise = (exercise, index) => {
    // console.log(exercise)
    const {data, exercises} = this.state;
    data['exercises'].push(exercise)
    exercises.results.splice(index, 1);
    this.setState({ data: data, exercises: exercises });
  };

  removeExercise = (exercise, index) => {
    // console.log(index);
    const {data, exercises} = this.state;
    data['exercises'].splice(index, 1);
    exercises.results.push(exercise)
    this.setState({ data: data, exercises: exercises });
  };

  queryExercises = e => {
    this.setState({ exercise_query:  e.target.value }, this.getExercises);
  };

getExercises() {
      const exercise_query = this.state.exercise_query;
      const id = this.props.id;
      const opt = id ? {query: exercise_query, limit: 10, lesson: id}
                     : {query: exercise_query, limit: 10}
      let url = this.state.exercise_endpoint;
      const opt_str = opt ? Object.keys(opt).filter(key => {return opt[key];})
      .map(key => key + '=' + opt[key]).join("&") : '';
      // console.log(opt_str);
      if(opt_str)
        url += '?' + opt_str;
      fetch(url)
        .then(response => {
          if (response.status !== 200) {
            return this.setState({ placeholder: "Something went wrong" });
          }
          return response.json();
        })
        .then(data => this.setState({ exercises: data, exercises_loaded: true }));
    };


getData(){
  const {id, endpoint} = this.props;
  fetch(endpoint+id)
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ placeholder: "Błąd w pobieraniu danych" });
      }
      return response.json();
    })
    .then(data => {
      // console.log(data);
      // console.log(data.exercises);
      this.setState({ data: data, data_loaded: true});
    }
    );
}


componentDidMount() {
  this.setState({loaded: this.props.loaded });
  const {id} = this.props;
  if (id){
    this.getData();
  }
  else {
    this.setState({data_loaded: true});
  }
  this.getExercises();
}

  handleSubmit = e => {
    e.preventDefault();
    const {id, endpoint} = this.props;
    const { data, refresh } = this.state;
    const { title, favourite} = data;
    const is_public = data['public']
    const formData = new FormData();

    const method = id ? "put" : "post";
    formData.append('title', title);
    formData.append('favourite', favourite);
    formData.append('public', is_public);
    let {exercises} = data;
    const exercises_id = exercises.map((e) => {return e.id});
    // exercises = exercises.join("','");
    // exercises = "['"+exercises+"']";
    // console.log(exercises);
    formData.append('exercises_id', exercises);
    const url = id ? endpoint+id : endpoint;
    const csrftoken = getCookie('csrftoken');
    const send_data = {'title': title, 'favourite': favourite, 'public': is_public, 'exercises_id': exercises_id};
    const conf = {
      method: method,
      body: JSON.stringify(send_data),
      headers: new Headers({'X-CSRFToken': csrftoken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                            })
    };
    fetch(url, conf)
    .then(response => console.log(response))
    .then(() => {
      this.props.endEdit();
    });
  };

  render() {
    // console.log("render lessons form");
    const { data, exercises, placeholder, exercise_endpoint, exercise_query, config_loaded, data_loaded, exercises_loaded} = this.state;
    const loaded = data_loaded && exercises_loaded;
    const { id, model_config, exercise_config} = this.props;
    // console.log(id);
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const {title, categories, favourite } = data;
    const is_public = data['public']

    const exercises_data = {results: data.exercises}

    return loaded ? (
    <React.Fragment>
      <nav className="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><a onClick={this.props.endEdit}>Lekcje</a></li>
          <li className="is-active">{" "+title}</li>
        </ul>
      </nav>
      <section className="columns">
        <div className="column is-7">
          <form onSubmit={this.handleSubmit} className="box">
            <div className="level columns">
                <div className="column is-8">
                  <div className="field is-horizontal">
                    <div className="field-body">
                      <div className="field">
                        <div className="control is-expanded">
                          <input
                            className="input title is-6 has-text-centred"
                            type="text"
                            name="title"
                            autoFocus=""
                            placeholder="Tytuł lekcji"
                            onChange={this.handleChange}
                            value={title}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="column is-3 is-offset-1">
                  <div className="field">
                    <div className="control is-expanded">
                      <Icon active={favourite} active_class="essentials32-like-1" inactive_class="essentials32-dislike-1" handleClick = {this.favouriteChange}/>
                      <Icon active={is_public} active_class="essentials32-worldwide" handleClick = {this.publicChange}/>
                      {id > 0 && <Icon active={true} active_class="essentials32-garbage-1"  handleClick = {this.handleDelete}/>}
                    </div>
                  </div>
                </div>
            </div>
            <div className="level">
                <ContentList1 select_list={true} with_num = {true}
                            data={exercises_data}
                            model_config={exercise_config}
                            mapModel={MapExercise}
                            handleSelect={this.removeExercise}
                            />
            </div>
            <div className="level">
                <div className="level-item has-text-centered">
                    <button type="submit" className="button is-info">Gotowe!</button>
                </div>
            </div>
          </form>
        </div>
        <div className="column is-5 is-fullheight">
          <div className="box">
              <SearchBar value={exercise_query} placeholder={"Szukaj ćwiczeń"} handleChange={this.queryExercises} name={"exercise_query"}/>
              <ContentList1 select_list={true}
                          data={exercises}
                          class_name={"is-size-7"}
                          model_config={exercise_config}
                          mapModel={MapExercise}
                          handleSelect={this.addExercise}
                          />
          </div>
        </div>
      </section>
    </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}


class LessonPreview extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", categories: "", exercises: [],
      favourite: false, public: false},
      loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false
      };
  }

getData(){
  const {id, endpoint} = this.props;
  fetch(endpoint+id)
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ placeholder: "Błąd w pobieraniu danych" });
      }
      return response.json();
    })
    .then(data => {
      this.setState({ data: data, loaded: true });
    }
    );
}

componentDidMount() {
  this.getData();
}

  render() {
    const { data, loaded, placeholder} = this.state;
    const exercises_data = {results: data.exercises};

    const { id, exercise_config} = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, categories, level, favourite } = data;
    const is_public = data['public']

    return loaded ? (
      <React.Fragment>
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a onClick={this.props.endEdit}>Lekcje</a></li>
            <li className="is-active">{" "+title}</li>
          </ul>
        </nav>
        <section className="columns">
          <div className="column is-8">
            <div className="box">
              <div className="level">
                <div className="level-item">
                  <h3 className="title is-5 has-text-centred">{title}</h3>
                </div>
                <div className="level-right">
                  {id > 0 && <Icon active={true} active_class="essentials32-play-button-1"  handleClick = {() => this.props.handlePlay(id)}/>}
                </div>
              </div>
              <div className="level">
                  <ContentList1 search_list={true}
                              data={exercises_data}
                              model_config={exercise_config}
                              mapModel={MapExercise}
                              />
              </div>

              <div className="level">
                <div className="level-item">
                  <div className="tags">
                    {categories ? (categories.split(",").map((item, index) =>
                    <span key={"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                    {level ? (level.split(",").map((item, index) =>
                    <span key={"-level-"+index} className="tag is-info">{item}</span>)) : ""}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}


class LessonPlay extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", categories: "", exercises: [],
      favourite: false, public: false},
      loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false,
      exercise: 0,
      results: [],
      status: [], // 0 - not started, 3 - complete ok, 2 - complete with faults, 1 - in progress
      finished: false,
      };
  }

  loadResults(){
    const {results, status} = this.props;
    console.log("Load lesson results");
    console.log(results);
    console.log(status);
    if(typeof(results) === "object" && results !==null && typeof(status) === "object"){
      this.setState({ results: results, status: status}, this.checkComplete);
    }
  }

  getData(callback){
    const {id, endpoint} = this.props;
    fetch(endpoint+id)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Błąd w pobieraniu danych" });
        }
        return response.json();
      })
      .then(data => {
        this.setState({ data: data}, this.loadResults);
      }
      );
  }

  loadData(callback){
      const {data} = this.props;
      this.setState({ data: data}, this.loadResults);
    }

  componentDidMount() {
    if(this.props.data){
      this.loadData();
    }
    else {
      this.getData();
    }
  }

  componentDidUpdate(prevProps) {
    if(this.props.data){
      if(this.props.data.id !== prevProps.data.id){
        this.loadData();
        }
      }
    else {
      if (this.props.id !== prevProps.id) {
        this.getData();
        }
      }
    }

checkComplete = (callback) => {
  console.log("Check lesson complete");
  const { data, results, status } = this.state;
  console.log(results);
  console.log(status);
  let { exercise } = this.state;
  let finished = false;

  while (status[exercise] >= 2 && !finished)
    if (exercise >= (data.exercises.length-1))
      finished = true;
    else
      {
        exercise += 1;
      }

  this.setState({ finished: finished, exercise: exercise, loaded: true });

  if(callback){
    callback();
  }
};

setResults = (exercise_results, exercise_status) => {
  // console.log("Set lesson results");
  const {data, exercise} = this.state;
  let {results, status} = this.state;
  if (results.length < data.exercises.length)
    for (var i = results.length; i < data.exercises.length; i++) {
        results[i] = [];
    }

  if (status.length < data.exercises.length)
    for (var i = status.length; i < data.exercises.length; i++) {
        status[i] = 0;
    }

  // console.log(results);
  // console.log(status);
  // console.log(exercise);
  // console.log(exercise_results);
  // console.log(exercise_status);
  results[exercise] = exercise_results;
  status[exercise] = exercise_status;
  // console.log("Results and status new:");
  // console.log(results);
  // console.log(status);
  const callback = () => this.props.setResult(results, status);
  this.setState({ results: results, status: status}, () => this.checkComplete(callback));
}

setExercise = (exercise) => {
  this.setState({ exercise: exercise});
}

handleRestart = () => {
  this.setState({ finished: false, results: [], exercise: 0});
}

getExerciseButtonClass(exercise_no){
  // console.log("Exercise result class is:")
  const { exercise } = this.state;
  const status = overalStatus(this.state.status[exercise_no]);
  let button_class;
  switch(status) {
    case 2:
        button_class = "button is-danger";
        break;
    case 3:
        button_class = "button is-primary";
        break;
    default:
        button_class = (exercise_no === exercise) ? "button is-outlined is-primary" : "button is-outlined";
        break;
      };

  return button_class;
}


render() {
  const { loaded, placeholder } = this.state;
  if(!loaded){
    return <p>{placeholder}</p>;
  }
  const { data, results, status, exercise, finished } = this.state;
  console.log("render lesson play");
  console.log(data);
  console.log("current exercise:");
  console.log(exercise);
  console.log("lesson results:");
  console.log(results);
  console.log("lesson status:");
  console.log(status);
  console.log(status[0]);
  console.log(status[1]);
  const exercises_data = {results: data.exercises};
  let exercise_results = [];
  console.log(exercise);
  // console.log(results.length);
  if (exercise < results.length){
    exercise_results = results[exercise];
  }
  // console.log("Lesson results of this exercise:");
  // console.log(exercise_results);
  const exercise_data = exercises_data.results[exercise];
  const { id, exercise_config, onClickNext, onClickExit} = this.props;
  Object.keys(data).map(function(key, index) {
    data[key] = data[key] ? data[key] : "";
  });
  const { title, categories, level, favourite } = data;
  const is_public = data['public'];
  const Test = this.ExerciseButton;
//                            key={"exercise_play_"+exercise_data.id}
  return loaded ? (
    <React.Fragment>
          <div className="box">
            <div className="level">
              <div className="level-item">
                <h3 className="title is-5 has-text-centred">{title}</h3>
              </div>
            </div>
            <div className="buttons are-small">
              {exercises_data.results.map((item, index) => <a key={"exercise_no"+index} className={this.getExerciseButtonClass(index)} onClick={() => this.setExercise(index)}>{index}</a>)}
            </div>

            <ExercisePlay
                            in_lesson={true}
                            setResult={this.setResults}
                            results={exercise_results}
                            data={exercise_data}
                            model_config={exercise_config}
                            />

            {finished && <div className="level">
                          <div className="level-item">
                            <a className="button" onClick={this.handleRestart}>Powtórz lekcję</a>
                            {onClickNext && <a className="button" onClick={onClickNext}>Następne</a>}
                            {onClickExit && <a className="button" onClick={onClickExit}>Zamknij</a>}
                          </div>
                        </div>
            }

            <div className="level">
              <div className="level-item">
                <div className="tags">
                  {categories ? (categories.split(",").map((item, index) =>
                  <span key={"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                  {level ? (level.split(",").map((item, index) =>
                  <span key={"-level-"+index} className="tag is-info">{item}</span>)) : ""}
                </div>
              </div>
            </div>
          </div>
    </React.Fragment>
  ) : <p>{placeholder}</p>;
}
}


class LessonFrontpage extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", categories: "", exercises: [],
      favourite: false, public: false},
      loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false
      };
  }

getData(){
  const {id, endpoint} = this.props;
  fetch(endpoint+id)
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ placeholder: "Błąd w pobieraniu danych" });
      }
      return response.json();
    })
    .then(data => {
      this.setState({ data: data, loaded: true });
    }
    );
}

componentDidMount() {
  this.getData();
}

  render() {
    const { data, loaded, placeholder} = this.state;
    const exercises_data = {results: data.exercises};

    const { id, exercise_config} = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, categories, level} = data;

    return loaded ? (
      <React.Fragment>
              <div className="level">
                <div className="level-item">
                  <h3 className="title is-5 has-text-centred">{title}</h3>
                </div>
              </div>
              <div className="level">
                <div className="level-item">
                  <div className="tags">
                    {categories ? (categories.split(",").map((item, index) =>
                    <span key={"-category-"+index} className="tag is-info">{item}</span>)) : ""}
                    {level ? (level.split(",").map((item, index) =>
                    <span key={"-level-"+index} className="tag is-info">{item}</span>)) : ""}
                  </div>
                </div>
              </div>
              <div className="level">
                <div className="level-item">
                  {id > 0 && <Icon active={true} active_class="essentials64-play-button-1"  handleClick = {this.props.onClickPlay}/>}
                </div>
              </div>
      </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}


export {
  Lesson, LessonForm, LessonPreview, MapLesson, LessonList,
}
