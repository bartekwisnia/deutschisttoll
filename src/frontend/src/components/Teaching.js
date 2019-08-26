import React, { Component } from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import key from "weak-key";
import { Icon, StatusIcon, SearchBar, Tile, HomeworkTypeIcon } from './Components';
import { getData, getCookie, handleDate, dateToYMD, dateToYMDHm, calcEnd, dateToHm, dateWithEnd, overalStatus, addDays } from "./Utils"
import { Lesson, LessonForm, LessonPreview, MapLesson, LessonList } from "./Lessons";
import { Exercise, ExerciseList } from "./Exercises";
import { Blog, BlogList } from "./Blog";
import DateTimePicker from 'react-datetime-picker';
//import DateTimePicker from 'react-datetime-picker/dist/entry.nostyle'

class Teaching extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      view: 0, // 0 - overview, 1 - student view
      detail_id: 0, // id of edited object
      student_id: 0, // id of tought student
      student_index: 0,
      students: [], // list of students
      query: "",
      colour: "is-info",
      students_loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  handleView = (index, id) => {
    this.setState({student_index: index, student_id: id});
  };

  selectSite(type, view, id, student_id, query){
    //type - 1 courses, 2 lessons, 3 exercises
    //view - 0 - list, 1 - form, 2 - search list, 3 - preview, 4 - play
    //id - id of edited object
    //console.log(type);
    //console.log(view);
    //console.log(id);
    const _id = (view==0) ? 0 : id;
    const _query = (view==0) ? query : "";
    this.setState({detail_id: _id, detail_view: view,
      material_type: type, query: _query});
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  };

  StudentsList = (props) => {
    const {students} = props;
    if (!students)
      return <p>no students</p>;

    return <div className="tile is-ancestor">
            <div className="tile is-4">
            </div>
            <div className="tile is-4 is-vertical">
              {students.map((el, index) => (
                <div className="tile is-parent" key={index}>
                  <div className="tile is-child box">
                    <a onClick={() => this.showStudentView(index, el.id)}>{this.getUserName(el.user)}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>;
  };

  componentDidMount() {
  getData("api/student/", '', 'students', 'students_loaded', 'placeholder', this);
  }

  render(){
    const {students_loaded, placeholder} = this.state;

    if (!students_loaded)
      return <p>{placeholder}</p>;

    const { view, student_index, student_id, students, colour } = this.state;

    const layout = student_id ?
    <React.Fragment>
      <div className="column is-1">
        <SideMenu showStudentView={this.handleView} students={students}/>
      </div>
      <div className="column is-8 is-offset-1">
        <TeachingStudentView key={"lessons_of_"+student_id} student={students.results[student_index]}/>
      </div>
    </React.Fragment>
    :
    <React.Fragment>
      <div className="column is-1">
        <SideMenu showStudentView={this.handleView} students={students}/>
      </div>
      <div className="column is-8 is-offset-1">
        <TeachingOverview showStudentView={this.handleView} selectSite={this.props.selectSite} students={students}/>
      </div>
    </React.Fragment>


    return <React.Fragment>
           {/*  <section className={"hero " + colour}>
              <div className="hero-body">
                <div className="containter">
                  <h1 className="title">Moje zajęcia</h1>
                  <h2 className="subtitle is-5">Planuj, zadawaj, sprawdzaj</h2>
                </div>
              </div>
            </section>*/}
            <section className="section columns" style={{paddingTop: 20}}>
              {layout}
            </section>
          </React.Fragment>

  }
}


class ExerciseInstancesList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "api/teacher/exercise/",
      exercise_instances : [],
      exercises_loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  handleExercises = () => {
    const {exercise_instances} = this.state;
    exercise_instances.results = handleDate(exercise_instances.results);
    //console.log(exercise_instances);
    this.setState({exercise_instances: exercise_instances, exercises_loaded: true});
  }

  getExercises = () => {
    //console.log("force refresh");
    const {endpoint} = this.state;
    const {student} = this.props;
    const options = student ? {student: student.id} : {};
    getData(endpoint, options, 'exercise_instances', 'exercises_loaded_fake', 'placeholder', this, this.handleExercises);
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
    this.getExercises();
  }

  componentDidUpdate(prevProps) {
    const student = this.props.student_;
    const student_old = prevProps.student;
    if (student)
      if (!student_old){
        this.getExercises();
      }
      else if (student.id !== student_old.id)
      {
        this.getExercises();
      }
    }

  render(){
    const { exercises_loaded, placeholder, endpoint, exercise_instances} = this.state;
    const { student } = this.props;
    const loaded = exercises_loaded;

    if (!loaded)
      return <p>{placeholder}</p>;

    //const user_info = <h2 className="subtitle">{this.getUserName(student.user)}</h2>

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const elements = exercise_instances.results;
    const startExercise = (el, index) => {
    }
    const exercises_list = <div>
                              <table className="table is-striped is-fullwidth is-hoverable">
                                <thead><tr><th></th><th></th><th></th><th></th><th></th></tr></thead>
                                <tbody>
                                  {elements.map((el, index) => {
                                      return <tr key={el.id}>
                                              <td key={el.id+"-num"}>{index+1}</td>
                                              {!student && <td key={el.id+"-student_name"}>{el.student_name}</td>}
                                              {student && <td key={el.id+"-date"}>{dateToYMD(el.timestamp)}</td>}
                                              {!student && <td key={el.id+"-date"}>{dateToYMD(el.updated)}</td>}
                                              <td key={el.id+"-name"}>{el.name}</td>
                                              <td key={el.id+"-status"}>
                                                <StatusIcon status={el.status} handleClick = {() => {startExercise(el, index)}}/>
                                              </td>
                                              <td style={icon_td_style} key={el.id+"-play"}>
                                                <Icon active={true} active_class="essentials16-play-button-1" handleClick = {() => {startExercise(el, index)}}/>
                                              </td>
                                            </tr>
                                          })}
                                </tbody>
                              </table>
                            </div>

    return (<React.Fragment>
            {exercises_list}
         </React.Fragment>);
  }
}


class HomeworkList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "/api/teacher/homework/",
      instances : [],
      loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  handleInstances = () => {
    const {instances} = this.state;
    instances.results = handleDate(instances.results);
    //console.log(exercise_instances);
    this.setState({instances: instances, loaded: true});
  }

  getInstances = () => {
    //console.log("force refresh");
    const {endpoint} = this.state;
    const {student} = this.props;
    const options = student ? {student: student.id} : {};
    getData(endpoint, options, 'instances', '', 'placeholder', this, this.handleInstances);
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
    const { loaded, placeholder, endpoint, instances} = this.state;
    const { student, overview } = this.props;

    if (!loaded)
      return <p>{placeholder}</p>;

    //const user_info = <h2 className="subtitle">{this.getUserName(student.user)}</h2>

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };
      // <td key={'homework'+index+"-type"}>
      //   <HomeworkTypeIcon type={el.type} handleClick = {() => {startExercise(el, index)}}/>
      // </td>
    const elements = instances.results;
    const startExercise = (el, index) => {
    }
    const instances_list = <div>
                              <table className="table is-striped is-fullwidth is-hoverable">
                                <thead><tr><th></th>
                                {!student && <th></th>}
                                <th></th><th></th><th></th><th></th>{!overview && <th></th>}</tr></thead>
                                <tbody>
                                  {elements.map((el, index) => {
                                      return <tr key={'homework'+index}>
                                              <td key={'homework'+index+"-num"}>{index+1}</td>
                                              {!student && <td key={'homework'+index+"-student"}>{this.makeUserName(el.student__first_name, el.student__last_name, el.student__username)}</td>}
                                              {student && <td key={'homework'+index+"-date"}>{dateToYMD(el.timestamp)}</td>}
                                              {!student && <td key={'homework'+index+"-date"}>{dateToYMD(el.updated)}</td>}
                                              <td key={'homework'+index+"-title"}>{el.lesson__title + (el.type ? " (L)" : "")}</td>

                                              <td key={'homework'+index+"-status"}>
                                                <StatusIcon status={el.status} handleClick = {() => {startExercise(el, index)}}/>
                                              </td>
                                              <td style={icon_td_style} key={'homework'+index+"-play"}>
                                                <Icon active={true} active_class="essentials16-play-button-1" handleClick = {() => {startExercise(el, index)}}/>
                                              </td>
                                              {!overview && <td style={icon_td_style} key={'homework'+index+"-delete"}>
                                                              <Icon active={true} active_class="essentials16-garbage-1"  handleClick = {() => this.props.onDelete(el.type, el.id)}/>
                                                            </td>}
                                            </tr>
                                          })}
                                </tbody>
                              </table>
                            </div>

    return (<React.Fragment>
            {instances_list}
         </React.Fragment>);
  }
}



class LearningClassesList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint_teacher :   "api/teacher/learning-class/",
      endpoint_student : "api/student/learning-class/",
      learning_classes : [],
      classes_loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  handleClasses = () => {
    const {learning_classes} = this.state;
    if (learning_classes){
      learning_classes.results = handleDate(learning_classes.results);
      //console.log(exercise_instances);
      this.setState({learning_classes: learning_classes, classes_loaded: true});
    }
    else {
      this.setState({classes_loaded: true});
    }
  }

  getLearningClasses = () => {
    //console.log("force refresh");
    const {student, student_view, incoming, old} = this.props;
    const endpoint = student_view ? this.state.endpoint_student : this.state.endpoint_teacher;

    let options = student ? {student: student.id} : {};
    if (incoming) {
      options['incoming'] = true;
    }
    else if (old) {
      options['old'] = true;
    }
    getData(endpoint, options, 'learning_classes', '', 'placeholder', this, this.handleClasses);
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
    this.getLearningClasses();
  }

  componentDidUpdate(prevProps) {
    const {student, refresh} = this.props;
    const student_old = prevProps.student;
    const refresh_old = prevProps.refresh;
    if (refresh !== refresh_old)
        this.getLearningClasses();
    else if (student)
      if (!student_old){
        this.getLearningClasses();
      }
      else if (student.id !== student_old.id)
      {
        this.getLearningClasses();
      }
    }

  render(){
    const { classes_loaded, placeholder, learning_classes} = this.state;
    const { student, onEdit } = this.props;
    const loaded = classes_loaded;
    //console.log("render classes list");
    if (!loaded)
      return <p>{placeholder}</p>;

    if (!learning_classes)
      return <p>Nie masz żadnych zaplanowanych zajęć</p>;

    //const user_info = <h2 className="subtitle">{this.getUserName(student.user)}</h2>

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const elements = learning_classes.results;
    const startClass = (el, index) => {this.props.onPlay(el.id)};

    const classes_list = <div>
                              <table className="table is-striped is-fullwidth is-hoverable">
                                <thead><tr><th></th><th></th><th></th><th></th><th></th></tr></thead>
                                <tbody>
                                  {elements.map((el, index) => {
                                      return <tr key={el.id}>
                                              <td key={"learning_class"+el.id+"-num"}>{index+1}</td>
                                              {!student && <td key={"learning_class"+el.id+"-student_name"}>{el.student_name}</td>}
                                              <td key={"learning_class"+el.id+"-date"}>
                                                {onEdit && <a onClick={() => onEdit(el.id)}>{dateWithEnd(el.start, el.length)}</a>}
                                                {!onEdit && dateWithEnd(el.start, el.length)}
                                              </td>
                                              <td key={"learning_class"+el.id+"-status"}>
                                                <StatusIcon status={el.status} handleClick = {() => {startClass(el, index)}}/>
                                              </td>
                                              <td style={icon_td_style} key={"learning_class"+el.id+"-start"}>
                                                <Icon active={true} active_class="essentials16-play-button-1" handleClick = {() => {startClass(el, index)}}/>
                                              </td>
                                            </tr>
                                          })}
                                </tbody>
                              </table>
                            </div>
    return (<React.Fragment>
            {classes_list}
         </React.Fragment>);
  }
}


class LearningClassesCalendar extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint_teacher :   "api/teacher/learning-class/",
      endpoint_student : "api/student/learning-class/",
      learning_classes : [],
      start_date : new Date(),
      end_date : new Date(),
      sel_date : new Date(),
      classes_loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  calcDates = (callback) => {
    const {sel_date} = this.state;
    const day_of_week = sel_date.getDay();
    if (day_of_week === 0)
      day_of_week = 7;
    const start_date = addDays(sel_date, -1*(day_of_week-1));
    start_date.setHours(0, 0, 0, 0);
    const end_date = addDays(sel_date, 8-day_of_week);
    end_date.setHours(0, 0, 0, 0);
    console.log("Week start and end:");
    console.log(start_date);
    console.log(end_date);
    this.setState({start_date: start_date, end_date: end_date}, callback);
  }


  handleClasses = () => {
    const {learning_classes} = this.state;
    if (learning_classes){
      learning_classes.results = handleDate(learning_classes.results);
      //console.log(exercise_instances);
      this.setState({learning_classes: learning_classes, classes_loaded: true});
    }
    else {
      this.setState({classes_loaded: true});
    }
  }

  getLearningClasses = () => {
    //console.log("force refresh");
    const {student, student_view} = this.props;
    const {start_date, end_date} = this.state;
    const endpoint = student_view ? this.state.endpoint_student : this.state.endpoint_teacher;

    let options = student ? {student: student.id} : {};
    if (start_date)
      options['start_date'] = start_date;
    if (end_date)
      options['end_date'] = end_date;
    options['limit'] = 50;
    getData(endpoint, options, 'learning_classes', '', 'placeholder', this, this.handleClasses);
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
    this.calcDates(this.getLearningClasses);
  }

  componentDidUpdate(prevProps) {
    const {student, refresh} = this.props;
    const student_old = prevProps.student;
    const refresh_old = prevProps.refresh;
    if (refresh !== refresh_old)
        this.getLearningClasses();
    else if (student)
      if (!student_old){
        this.getLearningClasses();
      }
      else if (student.id !== student_old.id)
      {
        this.getLearningClasses();
      }
    }

  render(){
    const { classes_loaded, placeholder, learning_classes, start_date, end_date} = this.state;
    const { student, onEdit } = this.props;
    const loaded = classes_loaded;
    //console.log("render classes list");
    if (!loaded)
      return <p>{placeholder}</p>;

    if (!learning_classes)
      return <p>Nie masz żadnych zaplanowanych zajęć</p>;

    //const user_info = <h2 className="subtitle">{this.geitUserName(student.user)}</h2>

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const elements = learning_classes.results;
    const startClass = (el, index) => {this.props.onPlay(el.id)};

    let cal = {day_short: new Array(7), day: new Array(7), hours: {}} ;

    for (var i = 0; i < cal.day.length; i++) {
      cal.day[i] = addDays(start_date, i);
      console.log(cal.day[i]);
    };

    cal.day_short[0] = 'pn';
    cal.day_short[1] = 'wt';
    cal.day_short[2] = 'śr';
    cal.day_short[3] = 'cz';
    cal.day_short[4] = 'pt';
    cal.day_short[5] = 'so';
    cal.day_short[6] = 'nd';

    for (var i = 0; i < elements.length; i++) {
      const start = elements[i].start;
      if (start >= start_date && start <= end_date){
        let day_of_week = start.getDay();
        if (day_of_week === 0)
          day_of_week = 7;
        day_of_week -= 1;
        const hour = start.getHours();
        const minute = start.getMinutes() >= 30 ? 30 : 0;
        const tod_id = (hour*60+minute).toString();
        var tod = new Date(cal.day[0]);
        tod.setHours(hour);
        tod.setMinutes(minute);
        if (typeof(cal.hours[tod_id]) === "undefined"){
          cal.hours[tod_id] = {tod: tod, entries: new Array(7)};
          for (var j = 0; j < 7; j++) {
            cal.hours[tod_id].entries[j] = "";
          }
        }
        cal.hours[tod_id].entries[day_of_week] = elements[i].student_name;
      }
    };

    const classes_calendar = <div>
                              <p>{dateToYMD(start_date)} - {dateToYMD(end_date)}</p>
                              <table className="table is-striped is-fullwidth is-hoverable">
                                <thead><tr>
                                  {cal.day_short.map((el, index) => {
                                    return <th key={"calendar_head_"+index}>{el}</th>
                                  })}
                                </tr></thead>
                                <tbody>
                                  {Object.entries(cal.hours).map((h, h_id) => {
                                    return <tr key={"calendar_hour_"+h_id}>
                                      <td>{dateToHm(h[1].tod)}</td>
                                      {h[1].entries.map((entry, entry_id) => {
                                        return <td key={"calendar_entry_"+h_id+"_"+entry_id}>{entry}</td>
                                      })}
                                    </tr>
                                  })}
                                </tbody>
                              </table>
                            </div>
    return (<React.Fragment>
            {classes_calendar}
         </React.Fragment>);
  }
}


class TeachingOverview extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      view: 0, // 0 - overview (add words), 1 - plan lesson, 2 - add exercise, 3 - blog
      endpoint_lesson :   "api/teacher/lesson/",
      endpoint_exercise :   "api/teacher/exercise/",
      lesson_instances : [],
      exercise_instances : [],
      loaded_lesson: false,
      exercises_loaded: false,
      placeholder: "Ładowanie...",
      refresh: false,
      query: "",
    };
  }


  forceRefresh(){
      const {refresh} = this.state;
      this.setState({refresh: !refresh});
  }

  handleView = (view) => {
    this.setState({view: view});
  };

  getLessons = (callback) => {
    //console.log("force refresh");
    const {endpoint_lesson, endpoint_exercise, refresh} = this.state;
    const {student} = this.props;
    getData(endpoint_lesson, {}, 'lesson_instances', 'loaded_lesson', 'placeholder', this, callback);
  };

  handleExercises = () => {
    const {exercise_instances} = this.state;
    exercise_instances.results = handleDate(exercise_instances.results);
    //console.log(exercise_instances);
    this.setState({exercise_instances: exercise_instances, exercises_loaded: true});
  }

  getExercises = (callback) => {
    //console.log("force refresh");
    const {endpoint_exercise, refresh} = this.state;
    const {student} = this.props;
    getData(endpoint_exercise, {}, 'exercise_instances', 'loaded_exercise_fake', 'placeholder', this, callback);
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value});
    //console.log(e.target.name);
    this.forceRefresh();
  };

  assignContent = (content_type, endpoint, element, index, callback) => {
    const {student} = this.props;

    const method = "post";

    const url = endpoint;
    const csrftoken = getCookie('csrftoken');
    let send_data = {'result': '', 'student': student.id};
    send_data[content_type] = element.id;

    //console.log(send_data);
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
      console.log(response)
      if (response.status == 201) {
        callback();
      }
    });
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
      this.getExercises(this.handleExercises);
  }

  render(){
      const { placeholder, exercises_loaded, refresh } = this.state;
      const loaded = true;

      if (!loaded)
        return <p>{placeholder}</p>;

      const { students, showStudentView } = this.props;
      const my_students = students ? students.results : [];
      const icon_td_style = {
          paddingRight: '0.0em',
          paddingLeft: '0.0em'
        };
      const students_list = <div>
                              <div className="level">
                                <div className="level-left">
                                  <h2 className="level-item subtitle">Moi uczniowie</h2>
                                </div>
                              </div>
                              <table className="table is-striped is-fullwidth is-hoverable">
                                <thead>
                                  <tr><th></th><th></th><th></th><th></th></tr>
                                </thead>
                                <tbody>
                                  {my_students.map((el, index) => {
                                      return <tr key={el.id}>
                                              <td key={el.id+"-num"}>{index+1}</td>
                                              <td key={el.id+"-name"}>
                                                <a onClick={() => showStudentView(index, el.id)}>{this.getUserName(el.user)}</a>
                                              </td>
                                              <td style={icon_td_style} key={"student"+el.id+"-add-homework"}>
                                                <Icon active={true} active_class="essentials16-home-2"/>
                                              </td>
                                              <td style={icon_td_style} key={"student"+el.id+"-add-class"}>
                                                <Icon active={true} active_class="essentials16-calendar"/>
                                              </td>
                                            </tr>
                                          })}
                                </tbody>
                              </table>
                            </div>

    const calendar = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">Kalendarz</h2>
                              </div>
                            </div>
                            <LearningClassesCalendar refresh={refresh} onPlay = {(id) => {}}/>
                          </div>;
    const next_classes = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">Najbliższe zajęcia</h2>
                              </div>
                            </div>
                            <LearningClassesList refresh={refresh} incoming={true} onPlay = {(id) => {}}/>
                          </div>;

    const classes_list = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">Poprzednie zajęcia</h2>
                              </div>
                            </div>
                            <LearningClassesList refresh={refresh} old={true} onPlay = {(id) => {}}/>
                          </div>;

    const exercises_list = <div>
                            <div className="level">
                              <div className="level-left">
                                <h2 className="level-item subtitle">Prace domowe:</h2>
                              </div>
                            </div>
                            <HomeworkList refresh={refresh} overview={true}/>
                          </div>

    const blog_list = <div>
                        <div className="level">
                          <div className="level-left">
                            <h2 className="level-item subtitle"><a onClick={() => this.props.selectSite(4)}>Moje wpisy:</a></h2>
                          </div>
                        </div>
                        <BlogList />
                      </div>

    return (<React.Fragment>
          <div className="tile is-ancestor">
            <div className="tile is-vertical is-4">
                <Tile tag={calendar}/>
                <Tile tag={students_list}/>
            </div>
            <div className="tile is-vertical is-4">
              <Tile tag={next_classes}/>
              <Tile tag={exercises_list}/>
            </div>
          <Tile tag={blog_list}/>
          </div>
         </React.Fragment>);
  }
}


class AddContent extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      content_type: 0, // 0 - exercise, 1 - lesson
      placeholder: "Ładowanie...",
      query: "",
      refresh: false,
    };
  }

  handleView = (content_type) => {
    this.setState({content_type: content_type});
  };


  forceRefresh = () => {
    const{refresh} = this.state;
    this.setState({refresh: !refresh});
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value}, this.forceRefresh);
  };

  componentDidUpdate(prevProps) {
    if (this.props.refresh !== prevProps.refresh) {
      this.setState({refresh: this.props.refresh});
      }
    };


  render(){
    const {query, refresh, content_type} = this.state;
    const loaded = true;

    if (!loaded)
      return <p>{placeholder}</p>;

    const exercise_add = <ExerciseList select_list={true}
                                        query={query}
                                        refresh={refresh}
                                        handleSelect={(el, index) => this.props.addExercise(el, index)}
                                        />
    const lesson_add =  <LessonList select_list={true}
                                        query={query}
                                        refresh={refresh}
                                        handleSelect={(el, index) => this.props.addLesson(el, index)}
                                        />
    return (<React.Fragment>
                          <div className="level">
                            <div className="level-item has-text-centered">
                                <div className="buttons are-middle">
                                   <a className="button" onClick={() => this.handleView(0)}>Ćwiczenia</a>
                                   <a className="button" onClick={() => this.handleView(1)}>Lekcje</a>
                                </div>
                              </div>
                            </div>
                            <SearchBar value={query}
                                       handleChange={this.handleChange}
                                       name={"query"}/>
                            {content_type ? lesson_add : exercise_add}
            </React.Fragment>
          );
    }
}

class TeachingStudentView extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      view: 0, // 0 - overview (add words), 1 - plan lesson, 2 - add homework
      content_type: 0, // 0 - exercise, 1 - lesson
      learning_class_id: 0,
      endpoint_lesson :   "api/teacher/lesson/",
      endpoint_exercise :   "api/teacher/exercise/",
      endpoint_learning_class: "api/teacher/learning-class/",
      lesson_instances : [],
      exercise_instances : [],
      learning_classes : [],
      lessons_loaded: false,
      exercises_loaded: false,
      classes_loaded: false,
      placeholder: "Ładowanie...",
      refresh: false,
      query: "",
    };
  }

  forceRefresh = () => {
      //console.log("Forced refresh");
      const {refresh} = this.state;
      this.setState({refresh: !refresh});
  }

  handleView = (view, learning_class_id, content_type) => {
    this.setState({view: view, learning_class_id: learning_class_id, content_type: content_type});
  };

  handleExercises = () => {
    const {exercise_instances} = this.state;
    exercise_instances.results = handleDate(exercise_instances.results);
    this.setState({exercise_instances: exercise_instances, exercises_loaded: true});
  }


  handleClasses = () => {
    const {learning_classes} = this.state;
    learning_classes.results = handleDate(learning_classes.results);
    this.setState({learning_classes: learning_classes, classes_loaded: true});
  }

  getLessons = (callback) => {
    //console.log("force refresh");
    const {endpoint_lesson, endpoint_exercise, refresh} = this.state;
    const {student} = this.props;
    getData(endpoint_lesson, {student: student.id}, 'lesson_instances', 'lessons_loaded', 'placeholder', this, callback);
  };

  getExercises = () => {
    //console.log("force refresh");
    const {endpoint_exercise, refresh} = this.state;
    const {student} = this.props;
    getData(endpoint_exercise, {student: student.id}, 'exercise_instances', '', 'placeholder', this, this.handleExercises);
  };

  getClasses = () => {
    console.log("getClasses");
    const {endpoint_learning_class, refresh} = this.state;
    const {student} = this.props;
    getData(endpoint_learning_class, {student: student.id}, 'learning_classes', '', 'placeholder', this, this.handleClasses);
  };

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value});
    //console.log(e.target.name);
    this.forceRefresh();
  };

  assignContent = (content_type, endpoint, element, index, callback) => {
    const {student} = this.props;

    const method = "post";

    const url = endpoint;
    const csrftoken = getCookie('csrftoken');
    let send_data = {'result': '', 'student': student.id};
    send_data[content_type] = element.id;

    //console.log(send_data);
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
      console.log(response)
      if (response.status == 201) {
        callback();
      }
    });
  };

  handleDelete = (type, id) => {  // type: 0 - exercise, 1 - lesson
    const {endpoint_lesson, endpoint_exercise} = this.state;
    const confirm_text = type ?
    "Czy na pewno chcesz odwołać tę lekcję?" :
    "Czy na pewno chcesz odwołać to ćwiczenie?";
    const endpoint = type ? endpoint_lesson : endpoint_exercise;

    if (confirm(confirm_text))
      var csrftoken = getCookie('csrftoken');
      const conf = {
        method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
      };
      fetch(endpoint+id , conf).then(response => console.log(response)).then(this.forceRefresh);
  };



  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
    this.getLessons();
    this.getExercises();
    this.getClasses();
  }

  componentDidUpdate(prevProps) {
    const student = this.props.student;
    const student_old = prevProps.student;
    if (student)
      if (!student_old){
        this.getLessons();
        this.getExercises();
        this.forceRefresh();
      }
      else if (student.id !== student_old.id)
      {
        this.getLessons();
        this.getExercises();
        this.forceRefresh();
      }
    }

  render(){
    //console.log("render student view");
    const { lessons_loaded, exercises_loaded, classes_loaded, placeholder,
       endpoint_lesson, endpoint_exercise, endpoint_learning_class,
       lesson_instances, exercise_instances, learning_classes, query, refresh,
      view, learning_class_id, content_type} = this.state;
    const { student } = this.props;
    const loaded = lessons_loaded && exercises_loaded && classes_loaded;

    if (!loaded)
      return <p>{placeholder}</p>;

    const user_info = <h2 className="subtitle">{this.getUserName(student.user)}</h2>

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const calendar = <p>Kalendarz</p>;
    const classes_list = <div>
                              <div className="level">
                                <div className="level-left">
                                  <h2 className="level-item subtitle">Zajęcia</h2>
                                </div>
                                <div className="level-right">
                                  <a className="level-item button is-info" onClick={() => this.handleView(1, 0)}>+</a>
                                </div>
                              </div>
                              <LearningClassesList student={student} refresh={refresh} student_view={false} onEdit={(id) => this.handleView(1, id)} />
                            </div>

    const elements = exercise_instances.results;
    const startExercise = (el, index) => {
    }
    const homework_list = <div>
                              <div className="level">
                                <div className="level-left">
                                  <h2 className="level-item subtitle">Praca domowa</h2>
                                </div>
                                {view != 2 &&
                                <div className="level-right">
                                  <a className="level-item button is-info" onClick={() => this.handleView(2)}>+</a>
                                </div>
                                }
                              </div>
                              <HomeworkList student={student} refresh={refresh} onDelete={this.handleDelete}/>
                            </div>

  const words_list = <p>Lista słówek</p>;
  const class_add = <LearningClass id={learning_class_id} student={student} endEdit={this.forceRefresh} view={1} student_view={false}/>;

  const add_content = <AddContent refresh={refresh}
                                  addExercise={(el, index) => this.assignContent('exercise', endpoint_exercise, el, index, this.forceRefresh)}
                                  addLesson={(el, index) => this.assignContent('lesson', endpoint_lesson, el, index, this.forceRefresh)} />

  let right_tile, middle_tile, left_tile;

  switch(view) {
    case 1:
        left_tile = <div className="tile is-vertical">
                      <Tile tag={user_info}/>
                      <Tile tag={calendar}/>
                      <Tile tag={homework_list}/>
                    </div>;
        middle_tile = <Tile tag={classes_list}/>;
        right_tile = <Tile tag={class_add} width="4"/>;
        break;
    case 2:
        left_tile = <div className="tile is-vertical">
                      <Tile tag={user_info}/>
                      <Tile tag={calendar}/>
                      <Tile tag={classes_list}/>
                    </div>;
        middle_tile = <Tile tag={homework_list}/>;
        right_tile = <Tile tag={add_content} width="4"/>;
        break;
    default:
        left_tile = <div className="tile is-vertical">
                      <div className="tile">
                        <Tile tag={user_info}/>
                        <Tile tag={calendar}/>
                      </div>
                      <div className="tile">
                        <Tile tag={homework_list}/>
                        <Tile tag={classes_list}/>
                      </div>
                    </div>

        middle_tile = <></>
        right_tile = <Tile tag={words_list} width="4"/>
      };

    return (<React.Fragment>
          <div className="tile is-ancestor">
            {left_tile}
            {middle_tile}
            {right_tile}
          </div>
         </React.Fragment>);

  }
}

class LearningClass extends React.Component{
  // props:       view: 1, // 1 - form, 4 - play
  // props:       student_view: false/true
  constructor(props){
    super(props);
    this.state = {
      endpoint_teacher: "api/teacher/learning-class/",
      endpoint_student: "api/student/learning-class/",
      endpoint_lesson :   "api/teacher/lesson/",
      endpoint_exercise :   "api/teacher/exercise/",
      data: {start: new Date(), length: 0, teacher: 0, student: 0, lessons: [],
      exercises: [], status:0, result: '', activities: []},
      loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false,
      query: "",
      };
  }

  handleDelete = () => {
    const {id, student_view} = this.props;
    const endpoint = student_view ? this.state.endpoint_teacher : this.state.endpoint_student;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: "delete",
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz anulować zajęcia?"))
      fetch(endpoint+id , conf)
      .then(response => console.log(response))
      .then(() =>{this.props.endEdit();});
  };

  handleChange = e => {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data: data });
  };

  dateTimeChange = datetime => {
    const data = this.state.data;
    data["start"] = datetime;
    this.setState({ data: data });
  };

  setLength = length => {
    const data = this.state.data;
    data["length"] = length;
    this.setState({ data: data });
  }

  addActivity = (activity, index, type) => {
    //console.log(exercise)
    const {data} = this.state;
    const new_activity = {lesson: type, id: activity.id, title: activity.title, type: activity.type, categories: activity.categories, level: activity.level}
    data['activities'].push(new_activity);
    this.setState({ data: data});
  };

  removeActivity = (index) => {
    //console.log(exercise)
    const {data} = this.state;
    data['activities'].splice(index, 1);
    this.setState({ data: data});
  };

  allowDrop = (ev) => {
    ev.preventDefault();
  }

  drag = (ev) => {
    ev.dataTransfer.setData("idx", ev.target.rowIndex-1);
  }

  drop = (ev) => {
    ev.preventDefault();
    var drag_index = parseInt(ev.dataTransfer.getData("idx"));
    if (ev.target.tagName === "TD")
      ev.target = ev.target.parentNode;
    var drop_index = ev.target.rowIndex-1;
    const {data} = this.state;
    data.activities.splice(drop_index,0, data.activities.splice(drag_index, 1)[0]);
    this.setState({data: data});
  }

  handleLearningClass = () => {
    let {data} = this.state;
    if(typeof(data) !== "undefined"){
      data = handleDate(data);
      this.setState({data: data , loaded: true});
    }

  }

  getLearningClass = () => {
    const {id, student_view} = this.props;
    const {refresh} = this.state;
    const endpoint = student_view ? this.state.endpoint_student : this.state.endpoint_teacher;
    if (id){
      getData(endpoint+id, "", 'data', '', 'placeholder', this, this.handleLearningClass);
    }
    else {
      this.setState({loaded: true,
                    data: {start: new Date(), length: 0, teacher: 0, student: 0, lessons: [],
                           exercises: [], activities: []}
                         });
      };
  };

  componentDidMount() {
    this.getLearningClass();
  }

  componentDidUpdate(prevProps) {
    const {id} = this.props;
    const id_old = prevProps.id;
    if (id !== id_old)
      {
        //console.log("update");
        this.setState({loaded: false}, this.getLearningClass);
      }
    }

  handleSubmit = e => {
    e.preventDefault();
    const { student, id, student_view} = this.props;
    const { data, endpoint_teacher } = this.state;
    const endpoint = endpoint_teacher;
    const { start, lenth, exercises, lessons, result, status, activities} = data;
    // const formData = new FormData();
    const method = id ? "put" : "post";
    // formData.append('start', start);
    // formData.append('length', length);
    // formData.append('student', student.id);

    var lessons_id = []
    var exercises_id = []

    for (var i = 0; i < activities.length; i++) {
      activities[i].order = i;
      if (activities[i].lesson)
        lessons_id.push({id: activities[i].id, order: i})
      else
        exercises_id.push({id: activities[i].id, order: i})
    };

    var send_data = data;
    send_data['exercises'] = exercises_id;
    send_data['lessons'] = lessons_id;
    send_data['student'] = student.id;
    console.log(send_data);
    const url = id ? endpoint+id : endpoint;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: method,
      body: JSON.stringify(send_data),
      headers: new Headers({'X-CSRFToken': csrftoken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                            })
    };
    fetch(url, conf)
    .then(response => {console.log(response);})
    .then(() => {this.props.endEdit();});
  };

  render(){
    const { loaded, placeholder, data, refresh} = this.state;
    if(!loaded){
      return <p>{placeholder}</p>;
    }
    const {id, view} = this.props;

    switch(view) {
      case 1:
        return (
          <LearningClassForm data={data} refresh={refresh} id={id}
            handleSubmit={this.handleSubmit}
            handleDelete={this.handleDelete}
            handleChange={this.handleChange}
            addActivity={this.addActivity}
            removeActivity={this.removeActivity}
            dateTimeChange={this.dateTimeChange}
            setLength={this.setLength}
          />);
      case 4:
        return (
          <LearningClassPlay data={data} refresh={refresh} id={id}
            setResult={this.props.setResult}
          />);
      default:
          return <p>Błąd</p>;
        };
  }
}


function LearningClassForm(props){
  console.log("2");
  const {data, refresh, id} = props;
  const {start, length, activities} = data;
  const calendar_style = {
      border: 0
    };

  const add_content = <AddContent refresh={refresh}
                                  addExercise={(el, index) => props.addActivity(el, index, 0)}
                                  addLesson={(el, index) => props.addActivity(el, index, 1)} />

  const button_class = {len30: "button",
                        len45: "button",
                        len60: "button",
                        len90: "button",
                        len120: "button"}

  function activity_type(type){
    return type ? "lek." : "ćw.";
  }

  Object.keys(button_class).map((button, index) => {
      const class_length = parseInt(button.split("len").pop());
      if (class_length === length){
          button_class[button] += " is-primary";
        }
  })

  return (
    <React.Fragment>
      <form onSubmit={props.handleSubmit}>
        <div className="level columns">
            <div className="column is-8">
              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control is-expanded">
                      <DateTimePicker
                        style={calendar_style}
                        name="start"
                        autoFocus=""
                        onChange={props.dateTimeChange}
                        value={start}
                        format="y-MM-dd HH:mm"
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
                  {id > 0 && <Icon active={true} active_class="essentials32-garbage-1"  handleClick = {props.handleDelete}/>}
                </div>
              </div>
            </div>
        </div>
        <div className="buttons are-small">
          <a className={button_class['len30']} onClick={() => props.setLength(30)}>30 min</a>
          <a className={button_class['len45']} onClick={() => props.setLength(45)}>45 min</a>
          <a className={button_class['len60']} onClick={() => props.setLength(60)}>60 min</a>
          <a className={button_class['len90']} onClick={() => props.setLength(90)}>90 min</a>
          <a className={button_class['len120']} onClick={() => props.setLength(120)}>120 min</a>
        </div>
        <div className="field">
          <div className="control">
            <input className="input is-primary" type="text" name="length" value={length} placeholder="Długość zajęć" onChange={props.handleChange}  required />
          </div>
        </div>
        <table className="table is-narrower is-hoverable">
          <thead>
            <tr>
              <th></th>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {
//   {lesson: 1, id: lessons[i].id, title: lessons[i].title, type: '', categories: lessons[i].categories, level: lessons[i].level};
              activities.map((el, index) => (
                <tr key={index} style={{cursor: 'pointer'}} draggable="true" onDragStart={props.drag}
                onDrop={props.drop} onDragOver={props.allowDrop}>
                  <td>{activity_type(el.lesson)}</td>
                  <td>{el.title}</td>
                  <td>
                    <div className="tags">
                      {el.categories ? (el.categories.split(",").map((tag, tag_idx) =>
                        <span key={index+"-category-"+tag_idx} className="tag is-info">{tag}</span>)) : ""}
                      {el.level ? (el.level.split(",").map((tag, tag_idx) =>
                       <span key={index+"-level-"+tag_idx} className="tag is-info">{tag}</span>)) : ""}
                    </div>
                  </td>
                  <td><Icon active={true} active_class="essentials16-garbage-1" handleClick = {() => props.removeActivity(index)}/></td>

                </tr>
            ))}
          </tbody>
        </table>
        <div className="level">
            <div className="level-item has-text-centered">
                <button type="submit" className="button is-info">Gotowe!</button>
            </div>
        </div>
      </form>
        {add_content}
    </React.Fragment>
  );
}



class LearningClassPlay extends React.Component {
  static propTypes = {
    data: PropTypes.object.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      refresh: false,
      activity: 0,
      results: [],
      status: [], // 0 - not started, 3 - complete ok, 2 - complete with faults, 1 - in progress
      finished: false,
      loaded: false,
      placeholder: "Ładowanie danych...",
      };

  }

  loadResults(){
    const { data } = this.props;
    const { activities } = data;
    let results = [];
    let status = [];
    for (var i = 0; i < activities.length; i++) {
      results[i] = activities[i].result ;
      if (activities[i].lesson){
        status[i] = activities[i].ex_status ? activities[i].ex_status : [];
      }
      else {
        status[i] = activities[i].status;
      }
    }
    this.setState({ results: results, status: status}, this.checkComplete);
  }

  componentDidMount() {
      this.loadResults();
  }

checkComplete = (callback) => {
  const { results, status} = this.state;
  const { data } = this.props;
  let { activity } = this.state;
  let finished = false;
  console.log("Check class complete");
  //console.log(data.activities.length)

  while (overalStatus(status[activity]) >= 2 && !finished)
    if (activity >= (data.activities.length-1))
      finished = true;
    else
      activity += 1;

  this.setState({ finished: finished, activity: activity, loaded: true});

  if(callback){
    callback();
  }
};

setResults = (activity_results, activity_status) => {
  const {activity} = this.state;
  let {results, status} = this.state;
  results[activity] = activity_results;
  status[activity] = activity_status;
  const callback = () => this.props.setResult(results, status);
  this.setState({ results: results, status: status}, () => this.checkComplete(callback));
}

setActivity = (activity) => {
  this.setState({ activity: activity});
}

handleRestart = () => {
  this.setState({ finished: false, results: [], status: [], activity: 0});
}

getActivityButtonClass(activity_no){
  // console.log("Activity result class is:")
  const {activity} = this.state;
  // console.log(activity);
  // console.log(activity_no);
  const status = overalStatus(this.state.status[activity_no]);

  let button_class;
  switch(status) {
    case 2:
        button_class = "button is-danger";
        break;
    case 3:
        button_class = "button is-primary";
        break;
    default:
        button_class = (activity_no === activity) ? "button is-outlined is-primary" : "button is-outlined";
        break;
      };

  return button_class;
}


render() {
  const { loaded, placeholder } = this.state;
  if(!loaded){
    return <p>{placeholder}</p>;
  }
  const { results, status, activity, finished} = this.state;
  const { data, onClickNext, onClickExit } = this.props;
  const activities = data.activities;
  console.log("render Learning Class:");
  console.log(data)
  console.log("current activity:");
  console.log(activity);
  console.log("results:");
  console.log(results);
  console.log("status");
  console.log(status);
  const activity_instance = activities[activity];
  let activity_results = [];
  if (activity < results.length){
    activity_results = results[activity];
  }
  let activity_status = [];
  if (activity < status.length){
    activity_status = status[activity];
  }

  const activity_render = activity_instance.lesson ?
      <Lesson
        detail_view={4}
        detail_id={activity_instance.id}
        results = {activity_results}
        status = {activity_status}
        setResult = {this.setResults}
      />
      :
      <Exercise
        detail_view={4}
        detail_id={activity_instance.id}
        results = {activity_results}
        status = {activity_status}
        setResult = {this.setResults}
      />
  // console.log(exercise);
  // console.log(results.length);



  return loaded ? (
    <React.Fragment>
          <div className="box">
            <div className="level">
              <div className="level-item">
                <h3 className="title is-5 has-text-centred">Title</h3>
              </div>
            </div>
            <div className="buttons are-small">
              {activities.map((item, index) => <a key={"activity_select_no"+index} className={this.getActivityButtonClass(index)} onClick={() => this.setActivity(index)}>{index}</a>)}
            </div>

              {activity_render}

              {finished && <div className="level">
                            <div className="level-item">
                              <a className="button" onClick={this.handleRestart}>Od początku</a>
                              {onClickNext && <a className="button" onClick={onClickNext}>Następne</a>}
                              {onClickExit && <a className="button" onClick={onClickExit}>Zamknij</a>}
                            </div>
                          </div>
              }
          </div>
    </React.Fragment>
  ) : <p>{placeholder}</p>;
}
}


class SideMenu extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      loaded: true,
      placeholder: "Ładowanie...",
    };
  }

  getUserName(user_profile){
    const { first_name, last_name, username } = user_profile;
    return((first_name || last_name) ? first_name + " " + last_name : username);
    // return("user");
  }

  render(){
    const { loaded, placeholder } = this.state;
    const { students } = this.props;
    const my_students = loaded ? students.results : [];
    return loaded ? (

      <React.Fragment>
        <aside className="menu">
          <p className="menu-label">
            <a onClick={() => this.props.showStudentView(0, 0)}>Uczniowie</a>
          </p>
          <ul className="menu-list">
            {my_students.map((el, index) => (
              <li key={index}>
                <a onClick={() => this.props.showStudentView(index, el.id)}>{this.getUserName(el.user)}</a>
              </li>
            ))}
          </ul>
        </aside>
      </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}

export default Teaching;

export {
  LearningClassesList, LearningClass,
}
// <div className="column is-7 is-fullheight is-grey-lighter">
//   {disp_detail_site}
// </div>
