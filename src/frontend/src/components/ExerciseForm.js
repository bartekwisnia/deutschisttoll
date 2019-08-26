import React, { Component } from "react";
import PropTypes from "prop-types";
import Icon from "./Icon";
import key from "weak-key";


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


function ExerciseWord(props){
  const {number, word, translation, last, last_dict_input} = props;

  return(
    <div className="field is-horizontal">
      <div className="field-body">
        <div className="field">
          <p className="control is-expanded">
            <input className="input" type="text" name={'w'+number} value={word} placeholder="Słowo po niemiecku" autoFocus={!last && last_dict_input===('w'+number)} onChange={(e) => props.onChange(e, number)}/>
          </p>
        </div>
        <div className="field">
          <p className="control is-expanded">
            <input className="input" type="text" name={'t'+number} value={translation} placeholder="Tłumaczenie" autoFocus={!last && last_dict_input===('t'+number)} onChange={(e) => props.onChange(e, number)}/>
          </p>
        </div>
        <div className="field">
          <p className="control">
            <a className="button is-dark" disabled={last} onClick={() => props.onDelete(number)}>x</a>
          </p>
        </div>
      </div>
    </div>
  );
}

function ExerciseDict(props){
  const dict = props.dict;
  // dict['Der Löwe'] = 'lew';
  // dict['Der Elefant'] = 'słoń';
  const len = dict.length;
  return(
    <div className='field' >
      {dict.map((el, index) => <ExerciseWord number={index} last_dict_input={props.last_dict_input} key={index} word={el.word} translation={el.translation} onChange={props.onChange} onDelete={props.onDelete}/>)}
      <ExerciseWord number={len} last_dict_input={props.last_dict_input} key={len} word={''} translation={''} last={true} onChange={props.onChange} onDelete={props.onDelete}/>
    </div>
  );
  // return(<ExerciseWord number={1} word={'der Löwe'} translation={'lew'}/>);
};


function DescribePicture(props){
  const {picture_url, dict, last_dict_input, fileChange, dictChange, dictDelete} = props
  return(
    <React.Fragment>
      <div className="field">
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
                  onChange={fileChange}
            />
          </label>
        </div>
      </div>
      <ExerciseDict dict={dict} last_dict_input={last_dict_input} onChange={dictChange} onDelete={dictDelete}/>
    </React.Fragment>
    );
  };

function SelectTranslation(props){
  const {dict, last_dict_input, dictChange, dictDelete} = props
  return(
    <ExerciseDict dict={dict} last_dict_input={last_dict_input} onChange={dictChange} onDelete={dictDelete}/>
      );
    };

function TypeSpecificContent(props){
  const {exercise_type, ...other} = props
  if (exercise_type === 'DES_PIC')
    {
    return <DescribePicture {...other}/>
  }
  if (exercise_type === 'SEL_TRANS')
    {
    return <SelectTranslation {...other}/>
  }
  return <div className="field"></div>
}


class ExerciseForm extends Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", type: "", categories: "", level: "", picture: "",
      favourite: false, public: false},
      dict: [],
      imagePreviewUrl : "",
      loaded: false,
      last_dict_input: "",
      placeholder: "Ładowanie danych...",
      refresh: false
      };
  }

  handleDelete = () => {
    const {id, endpoint} = this.props;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: "delete",
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć to ćwiczenie?"))
      fetch(this.props.endpoint+id , conf).then(response => console.log(response)).then(() =>{
        this.props.parent_refresh();
        this.props.handleDisplay(0, 0);
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

  fileChange = (e) => {
    const data = this.state.data;
    data[e.target.name] = e.target.files[0];
    this.setState({ data: data});
  };

  dictChange = (e, id) => {
      const dict = this.state.dict;
      const this_key = (e.target.name.substr(0,1) === 'w') ? 'word' : 'translation';
      const other_key = (e.target.name.substr(0,1) === 'w') ? 'translation' : 'word';
      if (dict.length <= id){
        let entry = {};
        entry[this_key] = e.target.value;
        entry[other_key] = '';
        dict.push(entry);
      }
      else{
        dict[id][this_key] = e.target.value;
      }
      this.setState({ dict: dict, last_dict_input: e.target.name});
    };

  dictDelete = (id) => {
    const dict = this.state.dict;
    if (dict.length > id){
      dict.splice(id, 1);
      this.setState({ dict: dict});
    }
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
      let dict = [];
      if(data.content){
        let content = JSON.parse(data.content);
        let words = content.words
        if(words){
          Object.keys(words).map(
            (key, index) => {
              dict.push({'word': key, 'translation': words[key]});
            }
          );
        }
      }
      // console.log(dict);
      this.setState({ data: data, dict: dict, loaded: true });
    }
    );
}

componentDidMount() {
  const {id, loaded, model_config} = this.props;
  if (id){
    this.getData();
  }
  else {
    const data = this.state.data;
    data.type = loaded ? Object.keys(model_config.type_choices)[0] : "";
    this.setState({ data: data, loaded: true});
  }
}

  handleSubmit = e => {
    e.preventDefault();
    const {id, endpoint} = this.props;
    const { data, dict, refresh } = this.state;
    const { title, type, categories, level, picture, favourite} = data;
    const is_public = data['public']
    const formData = new FormData();
    const method = id ? "put" : "post";
    formData.append('title', title);
    formData.append('type', type);
    formData.append('categories', categories);
    formData.append('level', level);
    formData.append('favourite', favourite);
    formData.append('public', is_public);

    if (typeof picture !== 'string'){
      formData.append('picture', picture);
    };

    let content = {}

    if(dict)
      content.words = {};
      for (let i = 0; i < dict.length; i++) {
          content.words[dict[i]['word']] = dict[i]['translation'];
      };

    if (content){
      formData.append('content', JSON.stringify(content));
      // console.log(JSON.stringify(content));
    };

    const url = id ? endpoint+id : endpoint;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: method,
      body: formData,
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    fetch(url, conf).then(response => console.log(response)).then(this.props.parent_refresh);
  };

  render() {
    const { data, dict, last_dict_input, imagePreviewUrl, placeholder} = this.state;
    const { id, loaded, model_config } = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, type, categories, level, picture, favourite } = data;
    const is_public = data['public']
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
    }
    else {
      picture_url = '../../static/frontend/upload-symbol_318-30030.jpg';
      picture_name = "Nie wybrano zdjęcia";
    };
    const type_choices = loaded ? model_config.type_choices : {};
    return loaded ? (
      <div className="column is-5 is-fullheight">
        <h3 className="title is-5 is-spaced">
          <strong>{id ? 'Edytuj ćwiczenie:' : 'Nowe ćwiczenie:'}</strong>
        </h3>

        <form onSubmit={this.handleSubmit} className="box">
          <div className="field is-horizontal">
            <div className="field-body">
              <div className="field">
                <div className="control is-expanded">
                  <input
                    className="input title is-4 has-text-centred"
                    type="text"
                    name="title"
                    autoFocus=""
                    placeholder="Tytuł ćwiczenia"
                    onChange={this.handleChange}
                    value={title}
                    required
                  />
                </div>
              </div>
              <div className="field">
                <div className="control is-expanded">
                  <Icon active={favourite} active_class="essentials64-like-1" inactive_class="essentials64-dislike-1" handleClick = {this.favouriteChange}/>
                  <Icon active={is_public} active_class="essentials64-worldwide" handleClick = {this.publicChange}/>
                  {id && <Icon active={true} active_class="essentials64-garbage-1"  handleClick = {this.handleDelete}/>}
                </div>
              </div>
            </div>
          </div>

          <div className="field">
            <div className="control">
              <div className="select subtitle is-5 has-text-centred">
                <select name="type"
                        autoFocus=""
                        placeholder="Typ ćwiczenia"
                        onChange={this.handleChange}
                        value={type}
                        required>
                  {Object.keys(type_choices).map((key, index) => <option value={key} key={index}>{type_choices[key]}</option>)}
                </select>
              </div>
            </div>
          </div>

          <TypeSpecificContent exercise_type={type} picture_url={picture_url} fileChange={this.fileChange} dict={dict} last_dict_input={last_dict_input} dictChange={this.dictChange} dictDelete={this.dictDelete}/>

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

          <div className="field">
            <div className="control">
              <input
                className="input"
                type="text"
                name="level"
                autoFocus=""
                placeholder="Poziom"
                onChange={this.handleChange}
                value={level}
              />
            </div>
          </div>

          <div className="control">
            <button type="submit" className="button is-info">
              Gotowe!
            </button>
          </div>
        </form>
      </div>
    ) : <p>{placeholder}</p>;
  }
}
export default ExerciseForm;
