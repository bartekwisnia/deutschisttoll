import React, { Component } from "react";
import { Icon, SearchBar, Tile } from './Components';
import { getData, getCookie, dateToYMD } from "./Utils"

import { ExerciseList, ExercisePreview, ExercisePlay } from "./Exercises";
import { ContactSmall, ContactSmallAbout } from "./Contact";

class Blog extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      view: 0,  // 0 - tiles, 1 - form, 4 - read
      entry_id : 0,
      endpoint: "api/blog/",
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

  handleView = (view, id) => {
    this.setState({view: view, entry_id: id});
  }

  endEdit = () => {
    this.handleView(0, 0);
  };

  handleDelete = id => {
    var csrftoken = getCookie('csrftoken');
    const {refresh, endpoint} = this.state;
    const conf = {
      method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć ten wpis?"))
      fetch(endpoint+id , conf).then(response => console.log(response)).then(() => {this.setState({refresh: !refresh});});
  };

  forceRefresh = () => {
    // console.log("force refresh");
    const refresh = this.state.refresh;
    this.setState({ refresh: !refresh });
  };


  componentDidMount() {
  }

  componentDidUpdate(prevProps) {
}

  render(){
    // console.log("render Blogs site");
    const {view, entry_id, refresh} = this.state;
    const {teacher, user_data} = this.props;
    const loaded = true;

    if (!loaded)
      return <p>{placeholder}</p>;
    let layout = <p>Nothing to display</p>
    switch(view) {
      case 0:
          layout = <BlogTiles handleView={this.handleView} teacher={teacher} handleDelete={this.handleDelete} refresh={refresh} />;
          break;
      case 1:
          layout = <BlogForm id={entry_id} handleView={this.handleView} teacher={teacher}
                  endEdit={() => this.handleView(0,0)} handleDelete={this.handleDelete} refresh={refresh} />;
          break;
      case 4:
          layout = <BlogRead id={entry_id} handleView={this.handleView} teacher={teacher} user_data={user_data} handleDelete={this.handleDelete} refresh={refresh}/>;
          break;
      }

      return  <section className="section columns" style={{paddingTop: 20}}>
                {layout}
              </section>
  }
}


class BlogEntry extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      placeholder: "Błąd",
    };
  }

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  }

  render() {
    const {placeholder} = this.state;
    const {data, size, handleView, handleDelete, teacher} = this.props; // size - 0 full, 1 big, 2 medium, 3 small



    if (!data)
      return placeholder;
    let title_size = 4;
    let subtitle_size = 5;
    let content_size = "is-medium";
    let text = data.text;
    let garbage_icon = "essentials32-garbage-1";
    let edit_icon = "essentials32-edit";
    let img_style = {display: "block", marginLeft: "auto", marginRight: "auto", width: "70%", marginTop: 10, marginBottom: 20};
    const {picture} = data;
    let picture_url = "";
    let picture_name = "";
    if (picture) {
      if (typeof picture === 'string'){
        picture_url = picture;
        var res = picture.split("/");
        picture_name = res[res.length-1];
      }
      else {
        picture_url = URL.createObjectURL(picture);
        picture_name = picture.name;
      }
    };

    let exercise =  data.exercise_id ? <ExercisePlay id={data.exercise_id}/> : undefined;


    switch(size) {
      case 1:
        title_size = 4;
        subtitle_size = 5;
        content_size = "is-medium";
        garbage_icon = "essentials32-garbage-1";
        edit_icon = "essentials32-edit";
        exercise = data.exercise_id ? <ExercisePlay id={data.exercise_id}/> : undefined;
        //img_style = {maxWidth: 800};
        if (data.text.length > 270)
          text = data.text.substring(0, 270) + " ...";
        break;
      case 2:
        title_size = 5;
        subtitle_size = 6;
        content_size = "is-small";
        garbage_icon = "essentials16-garbage-1";
        edit_icon = "essentials16-edit";
        exercise = undefined;
        //img_style = {maxWidth: 200};
        text = data.text.substring(0, 180) + " ...";
        break;
      case 3:
        title_size = 6;
        subtitle_size = 7;
        content_size = "is-small";
        garbage_icon = "essentials16-garbage-1";
        edit_icon = "essentials16-edit";
        exercise = undefined;
        img_style = {display: "block", marginLeft: "auto", marginRight: "auto", width: "30%", marginTop: 10, marginBottom: 20};
        //img_style = {maxWidth: 100};
        text = data.text.substring(0, 90) + " ...";
        break;
      default:
          ;
        };

    const title = handleView ? <a onClick = {() => handleView(4, data.id)}>{data.title}</a> : data.title;


    return <React.Fragment>
              <div className="level">
                <div className="level-left">
                  <div className="level-item">
                    <h1 className={"title is-"+title_size+" has-text-centred"}>{title}</h1>
                  </div>
                </div>
                <div className="level-right">
                  <div className="level-item">
                  {teacher &&
                    <div className="field is-grouped">
                      <p className="control">
                        <Icon active={true} active_class={garbage_icon} handleClick = {() => handleDelete(data.id)}/>
                      </p>
                       <p className="control">
                        <Icon active={true} active_class={edit_icon}  handleClick = {() => handleView(1, data.id)}/>
                      </p>
                    </div>}
                  </div>
                </div>
              </div>
              {data.subtitle &&
              <div className="level">
                <div className="level-item">
                  <h2 className={"subtitle is-"+subtitle_size+" has-text-centred"}>{data.subtitle}</h2>
                </div>
              </div>
            }
            <div className={"content is-small"}>
                <p className="has-text-left">{this.getUserName(data.author) + " // " +  dateToYMD(data.updated)}</p>
            </div>
            <hr/>
              {picture_url &&
                  <figure className="image" style={img_style}>
                    <img src={picture_url} alt="Zdjęcie do wpisu"/>
                  </figure>
                }
            <div className={"content "+content_size+" has-text-justified"}>
              <p dangerouslySetInnerHTML={{__html: text}}></p>
            </div>
            {exercise &&
            <div>
              {exercise}
            </div>
            }

      </React.Fragment>
    };
}

class BlogMenu extends Component {

  render() {
    const {create, back} = this.props;
    return(
      <div className="field is-grouped">
        {create && <p className="control">
          <Icon active={true} active_class="essentials32-add-1" inactive_class="essentials32-add-1" handleClick = {() => this.props.handleView(1,0)}/>
        </p>}
        {back && <p className="control">
          <Icon active={true} active_class="essentials32-back" inactive_class="essentials32-back" handleClick = {() => this.props.handleView(0,0)}/>
        </p>}
      </div>
    );
  };
};


class BlogRead extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "/api/blog/",
      data : [],
      loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  getEntry = () => {
    //console.log("force refresh");
    const {endpoint} = this.state;
    const {query, id} = this.props;
    getData(endpoint+id, {}, 'data', 'loaded', 'placeholder', this, );
  };

  componentDidMount() {
    this.getEntry();
  }

  componentDidUpdate(prevProps) {
    if (this.props.id !== prevProps.id) {
        this.getEntry();
      }
  }

  render(){
    const { loaded, placeholder, endpoint, data} = this.state;
    const {teacher} =this.props;
    if (!loaded)
      return <p>{placeholder}</p>;

    return (<React.Fragment>
                <div className="column is-2 is-offset-2">
                    <BlogList handleView={this.props.handleView} teacher={teacher} handleDelete={this.props.handleDelete} />
                </div>
                <div className="column is-6">
                  <div className="tile is-ancestor">
                    <Tile tag={<BlogEntry data = {data} teacher={teacher} handleDelete={this.props.handleDelete} handleView={this.props.handleView}/>}/>
                  </div>
                </div>
                <div className="column is-1">
                    <BlogMenu handleView = {this.props.handleView} create={teacher} back={true}/>
                </div>
         </React.Fragment>);
  }
}


class BlogTiles extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "/api/blog/",
      data : [],
      loaded: false,
      placeholder: "Ładowanie...",
    };
  }


  loadMore = () => {
    const data = this.state.data;
    const url = data.next;
    fetch(url)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Brak wpisów" });
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

  getEntries = () => {
    //console.log("force refresh");
    const {endpoint} = this.state;
    const {query} = this.props;
    const options = query ? {query: query} : {};
    getData(endpoint, options, 'data', 'loaded', 'placeholder', this, );
  };

  componentDidMount() {
    this.getEntries();
  }

  componentDidUpdate(prevProps) {
    if (this.props.refresh !== prevProps.refresh) {
        this.getEntries();
  };
}


  render(){
    const { loaded, placeholder, endpoint, data} = this.state;
    const {teacher} =this.props;
    if (!loaded)
      return <p>{placeholder}</p>;

    let elements = [];
    let el1 = <p>brak wpisów</p>;
    if (data.results.length > 0){
      elements = [...data.results];
      const el1_data = elements.splice(0, 1)
      el1 = <BlogEntry size={1} data = {el1_data[0]} width = {6} handleView={this.props.handleView} teacher={teacher} handleDelete={this.props.handleDelete}/>;
    }

    // const el2 = elements.splice(0, 2);

    // {el2.map((el, index) => {
    //     const blog_entry = <BlogEntry size={2} data = {el} handleView={this.props.handleView} teacher={teacher} handleDelete={this.props.handleDelete}/>;
    //     return <Tile key={"blog_medium_"+index} tag={blog_entry}/>
    //     })}

    return (<React.Fragment>
              <div className="column is-8 is-offset-2">
                  <div className="tile is-ancestor">
                    <div className="tile is-vertical">
                      <div className="tile">
                        <Tile tag={el1}/>
                        <Tile width={3} tag={<ContactSmallAbout/>}/>
                      </div>
                      <div className="tile">
                        {elements.map((el, index) => {
                            const blog_entry = <BlogEntry size={3} data = {el} handleView={this.props.handleView} teacher={teacher} handleDelete={this.props.handleDelete}/>;
                            return <Tile key={"blog_small_"+index} tag={blog_entry}/>
                            })}
                        <Tile tag={<ContactSmall/>}/>
                      </div>
                    </div>
                  </div>
                </div>
              <div className="column is-1">
                  <BlogMenu handleView = {this.props.handleView} create={teacher} back={false}/>
              </div>
         </React.Fragment>);
  }
}


class BlogList extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "/api/blog/",
      data : [],
      loaded: false,
      placeholder: "Ładowanie...",
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

  getEntries = () => {
    //console.log("force refresh");
    const {endpoint} = this.state;
    const {query} = this.props;
    const options = query ? {query: query} : {};
    getData(endpoint, options, 'data', 'loaded', 'placeholder', this, );
  };

  componentDidMount() {
    this.getEntries();
  }

  componentDidUpdate(prevProps) {
    if (this.props.refresh !== prevProps.refresh) {
        this.getEntries();
  };
}



  render(){
    const { loaded, placeholder, endpoint, data} = this.state;
    const {teacher} = this.props;

    if (!loaded)
      return <p>{placeholder}</p>;

    const elements = data.results;

    return (<React.Fragment>
              <div>
                <ul>
                    {elements.map((el, index) => {
                        const blog_entry = <BlogEntry size={3} data = {el} handleView={this.props.handleView} teacher={teacher} handleDelete={this.props.handleDelete}/>;
                        return <li key={"blog_entry_"+index} className="box">{blog_entry}</li>
                        })}
                </ul>
              </div>
         </React.Fragment>);
  }
}


class BlogForm extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/blog/",
      data: {title: "", subtitle: "", picture: "", text: "", exercise_id: 0},
      data_loaded: false,
      imagePreviewUrl : "",
      placeholder: "Ładowanie danych...",
      refresh: false,
      exercise_query: "",
      };
  }

  handleDelete = () => {
    const {endpoint} = this.state;
    const {id} = this.props;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: "delete",
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć ten wpis?"))
      fetch(endpoint+id , conf)
      .then(response => console.log(response))
      .then(() =>{this.props.endEdit();});
  };

  handleChange = e => {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data: data });
  };

  fileChange = (e) => {
    const data = this.state.data;
    data[e.target.name] = e.target.files[0];
    this.setState({ data: data});
  };

  resetPicture = () => {
    const data = this.state.data;
    data.picture = "";
    this.setState({ data: data});
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

  setExercise = (exercise, index) => {
    // console.log(exercise)
    const {data} = this.state;
    data.exercise_id = exercise.id;
    this.setState({ data: data});
  };

  resetExercise = () => {
    // console.log(exercise)
    const {data} = this.state;
    data.exercise_id = 0;
    this.setState({ data: data});
  };

  removeExercise = () => {
    // console.log(index);
    const {data} = this.state;
    data.exercise_id = 0;
    this.setState({ data: data});
  };

  queryExercises = e => {
    this.setState({ exercise_query:  e.target.value });
  };

getData(){
  const {id} = this.props;
  const {endpoint} = this.state;
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
  const {id} = this.props;
  if (id){
    this.getData();
  }
  else {
    this.setState({data_loaded: true});
  }
}

  handleSubmit = e => {
    e.preventDefault();
    const {id} = this.props;
    const { data, refresh, endpoint } = this.state;
    const formData = new FormData();
    const method = id ? "put" : "post";
    formData.append('title', data.title);
    formData.append('subtitle', data.subtitle);
    formData.append('text', data.text);
    console.log(typeof data.picture);
    console.log(data.picture);
    if (data.picture && typeof data.picture !== 'string'){
      formData.append('picture', data.picture);
    };
    formData.append('exercise_id', data.exercise_id);

    const url = id ? endpoint+id : endpoint;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: method,
      body: formData,
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    fetch(url, conf)
    .then(response => console.log(response))
    .then(() => {
      this.props.endEdit();
    });
  };

  render() {
    // console.log("render Blogs form");
    const { data, placeholder, exercise_endpoint, exercise_query, data_loaded} = this.state;
    const loaded = data_loaded;

    if (!loaded)
      return <p>{placeholder}</p>;
    const { id } = this.props;

    let picture_url = "";
    let picture_name = "";
    let picture = data.picture;
    if (picture) {
      if (typeof picture === 'string'){
        picture_url = picture;
        var res = picture.split("/");
        picture_name = res[res.length-1];
      }
      else {
        picture_url = URL.createObjectURL(picture);
        picture_name = picture.name;
      }
    }
    else {
      picture_url = '../../static/frontend/upload-symbol_318-30030.jpg';
      picture_name = "Nie wybrano zdjęcia";
    };


    return (<React.Fragment>
      <div className="column is-6 is-offset-3">
          <form onSubmit={this.handleSubmit} className="box">
            <div className="field is-grouped">
              <div className="control is-expanded">
                <input
                  className="input title is-4 has-text-centred"
                  type="text"
                  name="title"
                  autoFocus=""
                  placeholder="Tytuł"
                  onChange={this.handleChange}
                  value={data.title}
                  required
                />
              </div>
              <div className="control">
                {id > 0 && <Icon active={true} active_class="essentials32-garbage-1"  handleClick = {this.handleDelete}/>}
              </div>
            </div>
            <div className="field is-grouped">
              <div className="control is-expanded">
                <input
                  className="input title is-6 has-text-centred"
                  type="text"
                  name="subtitle"
                  autoFocus=""
                  placeholder="Podtytuł"
                  onChange={this.handleChange}
                  value={data.subtitle}
                />
              </div>
              <div className="control">
                {/* Left empty for spacing */}
              </div>
            </div>
            <div className="field is-grouped is-grouped-centered">
              <div className="file has-name">
                <label className="file-label">
                  <figure className="image" style={{minHeight: 200}}>
                    <img src={picture_url} alt="Załaduj zdjęcie" className="exercise-picture"/>
                  </figure>
                  <input className="file-input"
                        type="file"
                        name="picture"
                        autoFocus=""
                        placeholder="Obrazek"
                        onChange={this.fileChange}
                  />
                </label>
              </div>
              {picture && picture !== "" && <div className="control">
                <Icon active={true} active_class="essentials16-garbage-1"  handleClick = {this.resetPicture}/>
              </div>}
            </div>


            <div className="field">
              <div className="control is-expanded">
                <textarea className="textarea has-text-justified"
                          name="text"
                          autoFocus=""
                          placeholder="Treść wpisu"
                          rows="10"
                          onChange={this.handleChange}
                          value={data.text}/>
              </div>
            </div>
            {(data.exercise_id>0) &&
            <div className="columns">
              <div className="column is-10">
                <ExercisePreview
                    endpoint={exercise_endpoint} id={data.exercise_id}
                    />
              </div>
              <div className="column is-1 is-offset-1">
                <Icon active={true} active_class="essentials16-garbage-1" handleClick = {this.resetExercise}/>
              </div>
            </div>
              }
            <div className="field is-grouped is-grouped-centered">
                <div className="control">
                    <button type="submit" className="button is-info">Gotowe!</button>
                </div>
            </div>

          </form>

          <div className="level">
            <div className="box">
              <SearchBar value={exercise_query} placeholder={"Szukaj ćwiczeń"} handleChange={this.queryExercises} name={"exercise_query"}/>
              <ExerciseList select_list={true}
                            query={exercise_query}
                            handleSelect={(el, index) => this.setExercise(el, index)}
                            />
              </div>
          </div>
        </div>
        <div className="column is-1">
          <div className="content">
            <BlogMenu handleView = {this.props.handleView} create={false} back={true}/>
          </div>
        </div>
    </React.Fragment>);
  }
}

export default Blog;

export {
  BlogList, BlogForm,
}
