import React from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import key from "weak-key";
import { Icon, StatusIcon, SearchBar, Tile, HomeworkTypeIcon } from './Components';
import { getData, getCookie, handleDate, dateToYMD, dateToYMDHm, calcEnd, dateToHm, dateWithEnd, overalStatus } from "./Utils"
import { ExerciseSetList } from "./ExerciseSet";
import { ExercisePlay, Exercise } from "./Exercises";
import { LessonsList, LessonsCalendar, Lesson } from "./Teaching";
import { WordLearnList, WordsLearn } from "./Words";


class Learning extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      view : 0, // 0 - review words, 1 - do class, 2 - do homework
      id : 0,
      overview: 0, // 0 - overview, 1 - lesson preview, 2 - lesson search
      overview_id :0,
      placeholder: "Ładowanie...",
      homework_endpoint: "api/student/homework/",
      lessons_endpoint: "api/student/lesson/",
      homework_instance : [],
      homework_instance_loaded : true,
      homework_list : [],
      homework_list_loaded: false,
    };
  }

  handleView = (view, id, overview, overview_id) => {
    //view - 0 - overview, 2 - do exercise, 3 - do class
    //id - id of  object
    if (view === 2){
      const parseResults = () => this.parseResults(this.getHomeworkList)
      const getInstance = () => this.getHomeworkInstance(parseResults);
      this.setState({view: 2, id: id, homework_list_loaded: false, homework_instance_loaded : false}, getInstance);
    }
    else
      {
      const updateHomeworkList = this.getHomeworkList;
      this.setState({view: view, id: id, overview: overview, overview_id: overview_id, homework_list_loaded: false, homework_instance_loaded : true}, updateHomeworkList);
    }
  };


  parseResults = (callback) => {
    const {homework_instance} = this.state;
    const result = homework_instance.result ? JSON.parse(homework_instance.result) : [];
    homework_instance.result = result;
    this.setState({homework_instance: homework_instance}, callback)
  }

  getHomeworkInstance = (callback) => {
    // console.log("loading exercise instance");
    const {homework_endpoint, id} = this.state;
    const endpoint = homework_endpoint;
    const {student} = this.props;
    getData(endpoint+id, {}, 'homework_instance', 'homework_instance_loaded', 'placeholder', this, callback);
  };

  handleHomeworkList = () => {
    const {homework_list} = this.state;
    homework_list.results = handleDate(homework_list.results);
    this.setState({homework_list: homework_list, homework_list_loaded: true});
  }

  getHomeworkList = () => {
    const {homework_endpoint } = this.state;
    getData(homework_endpoint,  {limit: 2}, 'homework_list', '', 'placeholder', this, this.handleHomeworkList);
  };

  setLessonResult = (result, status) => {
    // console.log("Set Lesson Result");
    const { lesson_endpoint, id } = this.state;
    const endpoint = lesson_endpoint;
    const method = "put";
    const url = endpoint+id;
    const csrftoken = getCookie('csrftoken');

    let send_data ={};
    send_data['act_status'] = JSON.stringify(status);
    send_data['result'] = JSON.stringify(result);
    send_data['status'] = overalStatus(status);
    // console.log("Data to send:")
    // console.log(send_data);
    const conf = {
      method: method,
      body: JSON.stringify(send_data),
      headers: new Headers({'X-CSRFToken': csrftoken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                            })
    };
    fetch(url, conf)
    .then(response => {
      // console.log(response);
    });
  }

  setHomeworkResult = (result, status) => {
    const {homework_instance, homework_endpoint, id} = this.state;
    const endpoint = homework_endpoint;
    homework_instance.result = result;
    homework_instance.status = status;
    this.setState({homework_instance: homework_instance});
    const method = "put";
    const url = endpoint+id;
    const csrftoken = getCookie('csrftoken');
    //
    // // console.log(typeof(status));
    let send_data ={};
    send_data['result'] = JSON.stringify(result);
    send_data['status'] = overalStatus(status);
    // // console.log("Data to send:")
    // // console.log(send_data);
    const conf = {
      method: method,
      body: JSON.stringify(send_data),
      headers: new Headers({'X-CSRFToken': csrftoken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                            })
    };
    fetch(url, conf)
    .then(response => {
      // console.log(response);
    });
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
};

  componentDidMount() {
    this.getHomeworkList();
  }

  render(){
    const {placeholder, id, view, overview, overview_id, homework_instance,
      homework_list, homework_list_loaded, homework_instance_loaded} = this.state;
    const loaded = homework_list_loaded && homework_instance_loaded;

    if (!loaded)
      return <p>{placeholder}</p>;
    let next_instance = undefined;

    if (homework_list.results.length >= 2)
        next_instance = (id === homework_list.results[0].id) ? homework_list.results[1] : homework_list.results[0];
    else if (homework_list.results.length === 1)
      next_instance = id === homework_list.results[0].id ? undefined : homework_list.results[0];

    if(next_instance && next_instance.status >= 3)
        next_instance = undefined;

    // console.log(next_instance);
    // console.log(typeof(next_instance));
    const onClickNext = typeof(next_instance) !== "undefined" ? () => {this.handleView(2, next_instance.id)} : undefined;
    let layout = <p>Nothing to display</p>;
    switch(view) {
      case 0:
        layout = <React.Fragment>
                <section className="section columns" style={{paddingTop: 20}}>
                  <div className="column is-8 is-offset-2">
                    <LearningOverview handleView={this.handleView} next_instance={next_instance} view={overview} id={overview_id}/>
                  </div>
                </section>
              </React.Fragment>
              break;
      case 2:
        layout = <section className="section columns" style={{paddingTop: 20}}>
                  <div className="column is-8 is-offset-2 notification">
                    <div className="level">
                      <div className="level-right">
                        <a className="level-item button" onClick={() => this.handleView(0)}>Zamknij</a>
                      </div>
                    </div>
                    <Exercise
                        key = {"exercise_instance"+homework_instance.id+"play"}
                        detail_view={4}
                        detail_id={homework_instance.exercise}
                        onClickNext = {onClickNext}
                        onClickExit = {() => this.handleView(0)}
                        results = {homework_instance.result}
                        status = {homework_instance.status}
                        setResult = {this.setHomeworkResult}
                      />
                    </div>
                  </section>;
          break;
    case 3:
        layout =
                <section className="section columns" style={{paddingTop: 20}}>
                  <div className="column is-8 is-offset-2 notification">
                    <div className="level">
                      <div className="level-right">
                        <a className="level-item button" onClick={() => this.handleView(0, 0, 1, id)}>Zamknij</a>
                      </div>
                    </div>
                    <Lesson
                      key = {"lesson_"+id+"_play"}
                      view={4}
                      id={id}
                      onClickExit = {() => this.handleView(0, 0, 1, id)}
                      setResult = {this.setLessonResult}
                      student_view={true}
                    />
                  </div>
                </section>
          break;
    case 4:
          layout = <React.Fragment>
                  <section className="section columns" style={{paddingTop: 20}}>
                    <div className="column is-8 is-offset-2 notification">
                      <div className="level">
                        <div className="level-right">
                          <a className="level-item button" onClick={() => this.handleView(0)}>Zamknij</a>
                        </div>
                      </div>
                      <WordsLearn
                        onClickExit = {() => this.handleView(0, 0, 0, 0)}
                      />
                    </div>
                  </section>
                </React.Fragment>
            break;
      default:
          layout = <p>Nothing to display</p>;
          break;
        };
// <h2 className="subtitle is-5 has-text-weight-bold">Lekcje, praca domowa, powtarzanie słownictwa</h2>
      return <React.Fragment>
            <section className={"hero hero-bg-img is-primary"}>
              <div className="hero-head">
                <div className="container">
                </div>
              </div>
              <div className="hero-body">
                <div className="container">
                    <h1 className="title has-text-weight-bold" style={{marginBottom: "0.5rem"}}>Moja strona</h1>
                    <div className="button is-static">Lekcje, praca domowa, powtarzanie słownictwa
                    </div>

                </div>
              </div>
            </section>
              {layout}
            </React.Fragment>

  }
}


class HomeworkList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "/api/student/homework/",
      data : [],
      loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  handleData = () => {
    const {data} = this.state;
    if (data && data.count > 0){
      data.results = handleDate(data.results);
      this.setState({data: data, loaded: true});
    }
    else {
      this.setState({loaded: true});
    }

  }

  getInstances = () => {
    //// console.log("force refresh");
    const {endpoint} = this.state;
    getData(endpoint,{limit: 10}, 'data', '', 'placeholder', this, this.handleData);
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  makeUserName(first_name, last_name, username){
  return((first_name || last_name) ? first_name + " " + last_name : username);
  }

  componentDidMount() {
    this.getInstances();
  }

  componentDidUpdate(prevProps) {
    const {student, refresh} = this.props;
    const student_old = prevProps.student;
    const refresh_old = prevProps.refresh;

    if (refresh !== refresh_old)
      this.getInstances();
    else if (student)
      if (!student_old){
        this.getInstances();
      }
      else if (student.id !== student_old.id)
      {
        this.getInstances();
      }

    }

  render(){
    const { loaded, placeholder, endpoint, data} = this.state;
    const { student, onPlay } = this.props;

    if (!loaded)
      return <p>{placeholder}</p>;

    //const user_info = <h2 className="subtitle">{this.getUserName(student.user)}</h2>

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };
    const elements = data ? data.results : [];

    const startExercise = (el, index) => {
    }

    return (<React.Fragment>
              <div>
                <table className="table is-striped is-fullwidth is-hoverable">
                  <tbody>
                    {elements.map((el, index) => {
                        return <tr key={'homework'+index}>
                                <td key={'homework'+index+"-date"}>{dateToYMD(el.timestamp)}</td>
                                <td key={'homework'+index+"-title"}>{el.name}</td>
                                <td key={'homework'+index+"-status"}>
                                  <StatusIcon className="table-icon" status={el.status} handleClick = {() => {startExercise(el, index)}}/>
                                  <Icon className="table-icon" active={true} active_class="essentials16-play-button-1" handleClick = {() => onPlay(el.id)}/>
                                </td>
                              </tr>
                            })}
                  </tbody>
                </table>
              </div>
         </React.Fragment>);
  }
}


class LearningOverview extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      refresh: false,
      query: "",
      view: props.view, // 0 - overview, 1 - lesson preview, 2 - lesson search
      id: props.id, // object ID
    };
  }

  handleView = (view, id) => {
    this.setState({view: view, id: id});
  }

  render(){
    const {refresh, view, id} = this.state;
    const {next_instance} = this.props;
    const loaded = true;

    if (!loaded)
      return <p>{placeholder}</p>;

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const next_lessons = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">Najbliższe zajęcia</h2>
                              </div>
                            </div>
                            <LessonsList refresh={refresh} student_view={true} incoming={true} onPlay = {(id) => this.props.handleView(3, id)} onEdit = {(id) => this.handleView(1, id)}/>
                          </div>;
    const lessons_list = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">
                                  <a onClick={() => this.handleView(2, 0)}>Poprzednie zajęcia</a>
                                </h2>
                              </div>
                            </div>
                            <LessonsList refresh={refresh} student_view={true} old={true} onPlay = {(id) => this.props.handleView(3, id)} onEdit = {(id) => this.handleView(1, id)} search_view = {view === 2} />
                          </div>;

    const calendar = <div>
                      <div className="level">
                        <div className="level-left">
                          <h2 className="level-item subtitle">Kalendarz</h2>
                        </div>
                      </div>
                      <LessonsCalendar refresh={refresh} student_view={true} onPlay = {(id) => this.props.handleView(3, id)} onEdit = {(id) => this.handleView(1, id)}/>
                    </div>;

    const exercises_list = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">Prace domowe</h2>
                              </div>
                            </div>
                            <HomeworkList refresh={refresh} onPlay = {(id) => this.props.handleView(2, id)}/>
                          </div>

  const words_to_train = <div>
                          <div className="level">
                            <div className="level-left">
                              <h2 className="level-item subtitle">
                                <a onClick={() => this.handleView(0, 0)}>Słówka do powtórzenia</a>
                              </h2>
                            </div>
                            <div className="level-right">
                              <Icon active={true} active_class="essentials32-play-button-1" handleClick = {() => this.props.handleView(4, 0, 0, 0)}/>
                            </div>
                          </div>
                          <WordLearnList refresh={refresh} learn={true}/>
                        </div>
  const words_list = <div>
                          <div className="level">
                            <div className="level-left">
                              <h2 className="level-item subtitle">Słownik</h2>
                            </div>
                          </div>
                          <WordLearnList refresh={refresh}/>
                        </div>

  let new_activity_title = "Gratuluję, jesteś na bieżąco!";
  if (next_instance){
    switch(next_instance.status) {
      case 1:
          new_activity_title = "Dokończ ćwiczenie:";
          break;
      case 2:
          new_activity_title = "Popraw ćwiczenie:";
          break;
      case 3:
          new_activity_title = "Twoje ostatnie ćwiczenie:";
          break;
      default:
          new_activity_title = "Nowe zadanie:";
        };
    }


  const next_homework = next_instance ? <Exercise
          key = "next_exercise"
          detail_view={5}
          detail_id={next_instance.exercise}
          onClickPlay = {() => this.props.handleView(2, next_instance.id)}/> : <React.Fragment></React.Fragment>;


  const next_activity = <React.Fragment>
                          <div className="level">
                            <div className="level-left">
                              <h4 className="level-item subtitle is-6">{new_activity_title}</h4>
                            </div>
                            {next_instance &&
                            <div className="level-right">
                              <div className="level-item">
                                <StatusIcon status={next_instance.status}  handleClick = {() => this.props.handleView(2, next_instance.id)}/>
                              </div>
                            </div>
                            }
                          </div>
                        {next_homework}
                        </React.Fragment>

    const lesson_preview = <Lesson id={id} student_view={true} view={3} onPlay = {(id) => this.props.handleView(3, id)}/>;

    switch(view) {
      case 1:
        return (  <div className="tile is-ancestor">
                    <div className="tile is-vertical">
                        <Tile tag={next_activity} witdth="6" colour_class="is-dark"/>
                        <Tile tag={exercises_list} colour_class="is-danger"/>
                        <Tile tag={words_to_train} colour_class="is-warning"/>
                    </div>
                    <div className="tile is-vertical">
                        <Tile tag={calendar} colour_class="is-primary"/>
                        <Tile tag={next_lessons} colour_class="is-link"/>
                        <Tile tag={lessons_list}/>
                    </div>
                    <Tile tag={lesson_preview} colour_class="is-info"/>
                  </div>
                )
      case 2:
        return (  <div className="tile is-ancestor">
                    <div className="tile is-vertical">
                        <Tile tag={next_activity} witdth="6" colour_class="is-dark"/>
                        <Tile tag={exercises_list} colour_class="is-danger"/>
                        <Tile tag={words_to_train} colour_class="is-warning"/>
                    </div>
                    <div className="tile is-vertical">
                        <Tile tag={calendar} colour_class="is-primary"/>
                        <Tile tag={next_lessons}/>
                    </div>
                    <Tile tag={lessons_list} colour_class="is-info"/>
                  </div>
                )
      default:
          return (  <div className="tile is-ancestor">
                      <div className="tile is-vertical">
                          <Tile tag={next_activity} witdth="6" colour_class="is-primary"/>
                          <Tile tag={exercises_list} colour_class="is-link"/>
                      </div>
                      <div className="tile is-vertical">
                          <Tile tag={calendar} colour_class="is-dark"/>
                          <Tile tag={next_lessons} colour_class="is-danger"/>
                          <Tile tag={lessons_list} colour_class="is-warning"/>
                      </div>
                      <div className="tile is-vertical">
                        <Tile tag={words_to_train} colour_class="is-info"/>
                        <Tile tag={words_list}/>
                      </div>
                    </div>
                  )
        };
  }
}


class SideMenu extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      homework_endpoint :   "api/student/homework",
      homework_instances : [],
      homework_loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  getUserName(user_profile){
    const { first_name, last_name, username } = user_profile;
    return((first_name || last_name) ? first_name + " " + last_name : username);
    // return("user");
  }

  componentDidMount() {
    const {homework_endpoint} = this.state;
    getData(homework_endpoint, '', 'homework_instances', 'homework_loaded', 'placeholder', this);
  }

  render(){
    const { homework_loaded, homework_instances, placeholder } = this.state;
    const loaded = homework_loaded;
    if (!loaded)
      return <p>placeholder</p>;

    const homeworks = homework_instances ? homework_instances.results : [];
    return (
      <React.Fragment>
        <aside className="menu">
          <p className="menu-label">
            Zajęcia
          </p>
          <ul className="menu-list">
            <li><a className="is-active">28.05.2019</a></li>
            <li><a>21.05.2019</a></li>
            <li><a>14.05.2019</a></li>
            <li><a>07.05.2019</a></li>
            <li><a>...</a></li>
          </ul>
          <p className="menu-label">
            Praca domowa
          </p>
          <ul className="menu-list">
            {homeworks.map((el, index) => (
              <li key={index}>
                <a onClick={() => this.props.onClick(1, el.exercise)}>{el.name}</a>
              </li>
            ))}
            <li><a>...</a></li>
          </ul>
        </aside>
      </React.Fragment>
    );
  }
}

export default Learning;
// <div className="column is-7 is-fullheight is-grey-lighter">
//   {disp_detail_site}
// </div>
