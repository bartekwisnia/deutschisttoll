import React, { Component } from "react";
import PropTypes from "prop-types";
import Icon from "./Icon";
import key from "weak-key";

import DataProvider from "./DataProvider";
import ExercisesList from "./ExercisesList";


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


class LessonForm extends Component {
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
      config_loaded: false,
      exercises_loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false,
      exercise_query: "",
      exercise_endpoint: "api/exercise/",
      exercise_config: [],
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
      fetch(this.props.endpoint+id , conf).then(response => console.log(response)).then(() =>{
        this.props.endEdit();
      });
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
    console.log(exercise)
    const {data, exercises} = this.state;
    data['exercises'].push(exercise)
    exercises.results.splice(index, 1);
    this.setState({ data: data, exercises: exercises });
  };

  removeExercise = (exercise, index) => {
    console.log(index);
    const {data, exercises} = this.state;
    data['exercises'].splice(index, 1);
    exercises.results.push(exercise)
    this.setState({ data: data, exercises: exercises });
  };

  queryExercises = e => {
    this.setState({ exercise_query:  e.target.value }, this.getExercises);
  };


getExerciseConfig(){
    fetch(this.state.exercise_endpoint+'config')
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(data => this.setState({ exercise_config: data, config_loaded: true }));
  }



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
      console.log(data);
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
  this.getExerciseConfig();
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
    console.log(exercises);
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
    const { data, exercises, placeholder, exercise_endpoint, exercise_query,
      exercise_config, config_loaded, data_loaded, exercises_loaded} = this.state;
    const loaded = config_loaded && data_loaded && exercises_loaded;
    const { id, model_config } = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const {title, categories, favourite } = data;
    const is_public = data['public']

    const exercises_data = {results: data.exercises}

    return loaded ? (
      <section>
        <form onSubmit={this.handleSubmit} className="box">
          <div className="level">
              <div className="column is-8">
                <div className="field is-horizontal">
                  <div className="field-body">
                    <div className="field">
                      <div className="control is-expanded">
                        <input
                          className="input title is-4 has-text-centred"
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
              <div className="column is-2 is-offset-1">
                <div className="field">
                  <div className="control is-expanded">
                    <Icon active={favourite} active_class="essentials64-like-1" inactive_class="essentials64-dislike-1" handleClick = {this.favouriteChange}/>
                    <Icon active={is_public} active_class="essentials64-worldwide" handleClick = {this.publicChange}/>
                    {id && <Icon active={true} active_class="essentials64-garbage-1"  handleClick = {this.handleDelete}/>}
                  </div>
                </div>
              </div>
          </div>
          <div className="columns">
            <div className="column is-7 is-fullheight">
              <div style={{paddingTop: 5, paddingLeft: 40, paddingBottom: 5, paddingRight: 40}}>
                <h3 className="title is-7 is-spaced">
                  <strong>Wybrane ćwiczenia</strong>
                </h3>
              </div>

              <ExercisesList data={exercises_data}
                read_only = {true}
                model_config={exercise_config}
                handleSelect={this.removeExercise}
              />


            </div>
            <div className="column is-4 is-offset-1 is-fullheight ">

              <div style={{paddingTop: 5, paddingLeft: 40, paddingBottom: 5, paddingRight: 40}}>
                <div className="field">
                  <div className="control">
                    <input
                      className="input"
                      type="text"
                      name="exercise_query"
                      autoFocus=""
                      placeholder="Szukaj ćwiczeń"
                      onChange={this.queryExercises}
                      value={exercise_query}
                    />
                  </div>
                </div>
              </div>

                <ExercisesList data={exercises}
                  read_only = {true}
                  model_config={exercise_config}
                  handleSelect={this.addExercise}
                  className={"has-background-grey-light is-size-6"}
                />
            </div>
          </div>

          <div className="field">
            <div className="control">
              <input
                className="input"
                type="text"
                name="categories"
                autoFocus=""
                placeholder="Kategorie"
                onChange={this.handleChange}
                value={categories}
              />
            </div>
          </div>

          <div className="control">
            <button type="submit" className="button is-info">
              Gotowe!
            </button>
          </div>
        </form>
      </section>
    ) : <p>{placeholder}</p>;
  }
}
export default LessonForm;

// <DataProvider endpoint={exercise_endpoint}
//               options={{query: exercise_query, limit: 10, lesson: id }}
//               render={(data, loadMore, handleUpdate) => <ExercisesList data={data}
//                 loadMore = {loadMore}
//                 read_only = {true}
//                 model_config={exercise_config}
//                 handleSelect={this.addExercise}
//               />}
//               refresh={false}/>
