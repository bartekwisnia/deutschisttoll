import React, { Component } from "react";
import PropTypes from "prop-types";
import { getData, getCookie } from "./Utils"
import { HighlightedText } from './Components';

function TranslationInput(props){
  const {number, translation, last, last_dict_input} = props;
  return (
  <div className="field">
    <p className="control is-expanded">
      <input className="input" type="text" name={'t'+number}
            value={translation}
            id = {"translation"+number}
            placeholder="Tłumaczenie"
            autoFocus={!last && last_dict_input===('t'+number)}
            onChange={(e) => props.translationChange(e, number)}
            onKeyDown={props.onKeyDown ? (e) => props.onKeyDown(e, number) : (e) => {}}
            onFocus={props.onFocus ? (e) => props.onFocus(e, number) : (e) => {}}
            tabIndex="0"
      />
    </p>
  </div>
);
}


function TranslationDisplay(props){
  const {translation, result} = props;
  let button_class = "button is-static";

  if (result == true) {
    button_class = "button is-primary";
  }
  else if (result == false) {
    button_class = "button is-danger";
  };

  return (<span className={button_class}>{translation}</span>);
}


function TranslationField(props){
  const {version, translation, input, ...other} = props;
  // play - 0 - form (input), 1 - display, 2 - input, 3 - puzzle (display)
  switch(version) {
    case 1:
        return <TranslationDisplay {...other} translation={translation}/>
    case 2:
        return <TranslationInput {...other} translation={input.translation}/>
    case 3:
        return ""
    default:
        return <TranslationInput {...other} translation={translation}/>
      };
}


function DeleteButton(props){
  const {last, number} = props;
  return(
  <div className="field">
    <p className="control">
      <a className="button is-dark" disabled={last} onClick={() => props.onClick(number)}>x</a>
    </p>
  </div>
);
}

function ConfirmButton(props){
  const {success, number} = props;
  return(
    <div className="field">
      <p className="control">
        <a className={"button " + success ? "is-success" : "is-outlined"} disabled={success} onClick={() => props.onClick(number)}>Użyte</a>
      </p>
    </div>
);
}

function WordButtonOld(props){
  const {version, ...other} = props;
  // version: 0 - form/delete, 1 - display (confirm), 2 - input (confirm), 3 - puzzle
  switch(version) {
    case 1:
        return <ConfirmButton {...other}/>
    case 2:
        return <ConfirmButton {...other}/>
    default:
        return <DeleteButton {...other}/>
      };
}

class Word extends React.Component{
  // props:       view: 1, // 1 - form, 4 - play
  // props:       student_view: false/true

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/word/",
      endpoint_icon: "api/word-icon/",
      endpoint_translation :   "api/translation/",
      init_data: {text: '', preposition: '', translations: [], icon: {id: 0, picture: '', description: ''}},
      data: {text: '', preposition: '', translations: [], icon: {id: 0, picture: '', description: ''}},
      add_translation: '',
      found_icons: null,
      loaded: false,
      placeholder: "Ładowanie danych...",
      };
  }

  addTranslation = e => {
    this.setState({ add_translation: e.target.value});
  };

  descriptionChange = e => {
    const { data } = this.state;
    const {icon} = data;
    icon['description'] = e.target.value;
    data.icon = icon;
    this.setState({ data: data});
  };

  changeTranslation = (e, index) => {
    const { data } = this.state;
    const {translations} = data;
    translations[index] = e.target.value;
    data['translations'] = translations;
    this.setState({ data: data });
  };

  handleChange = e => {
  const data = this.state.data;
  data[e.target.name] = e.target.value;
  if(e.target.name === 'text'){
    if (this.props.setWord)
      this.props.setWord(e.target.value);
    if( e.target.value.length >=3)
      this.findPicture(e.target.value)
  };
  this.setState({ data: data });
  };


  findPicture = (text) => {
    const {id} = this.props;
    const {endpoint_icon} = this.state;
    const options = {query: text, limit: 3}
    getData(endpoint_icon, options, 'found_icons', '', 'placeholder', this);
  };

  fileChange = (e) => {
    const {data} = this.state;
    const {icon} = data;
    icon.picture = e.target.files[0];
    data.icon = icon;
    this.setState({ data: data});
  };

  pictureSelect = (index) => {
    const {data, found_icons} = this.state;
    const {icon} = data;
    icon.id = found_icons.results[index].id;
    icon.picture = found_icons.results[index].picture;
    icon.description = found_icons.results[index].description;
    data.icon = icon;
    this.setState({ data: data, found_icons: null});
  };

  handleWord = () => {
    const {data} = this.state;
    const setWord = this.props.setWord ? () => this.props.setWord(data.text) : () => {};
    this.setState({loaded: true}, setWord);
  }

  getWord = () => {
    const {id} = this.props;
    const {endpoint} = this.state;
    if (id){
      getData(endpoint+id, "", 'data', '', 'placeholder', this, this.handleWord);
    }
    else {
      const {init_data} = this.state;
      this.setState({loaded: true, data: init_data});
      };
  };

  componentDidMount() {
    this.getWord();
  }

  componentDidUpdate(prevProps) {
    const {id} = this.props;
    const id_old = prevProps.id;
    if (id !== id_old)
      {
        this.setState({loaded: false}, this.getWord);
      }
    }

  handleSubmit = e => {
    e.preventDefault();
    const { id } = this.props;
    const { data, endpoint, add_translation} = this.state;
    const { text, preposition, translations, icon} = data;

    const formData = new FormData();
    const method = id ? "put" : "post";
    formData.append('text', text);
    formData.append('preposition', preposition);
    if (add_translation)
      formData.append('add_translation', add_translation);
    console.log(icon);
    if (icon){
      if (icon.id)
        formData.append('icon_id', icon.id);
      else{
        formData.append('icon_picture', icon.picture);
      }
      formData.append('icon_description', icon.description);
    }
    console.log(formData);
    const url = id ? endpoint+id : endpoint;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: method,
      body: formData,
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    fetch(url, conf)
    .then(response => {
      console.log(response)
      return response.json();
    })
    .then((data) => {
      console.log(data);
      this.setState({found_icons: null});
      const new_id = data.id;
      const translation = data.translations && data.translations.length > 0 ? data.translations[0].text : '';
      if (this.props.initWord)
        this.props.initWord(new_id, translation);
    });
  };


  render(){
    const { loaded, placeholder, data, found_icons, add_translation} = this.state;
    if(!loaded){
      return <p>{placeholder}</p>;
    }
    const {id, view, required, ...other} = this.props;
    const icons = found_icons ? found_icons.results : null;

    switch(view) {
      case 1:
        return (
          <WordForm data={data} id={id} add_translation={add_translation}
            icons={icons} required={required}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            changeTranslation={this.changeTranslation}
            addTranslation={this.addTranslation}
            fileChange={this.fileChange}
            pictureSelect={this.pictureSelect}
            descriptionChange={this.descriptionChange}

          />)
      case 2:
        return (
          <WordSubForm data={data} id={id} add_translation={add_translation}
            icons={icons} required={required}
            handleSubmit={this.handleSubmit}
            handleChange={this.handleChange}
            changeTranslation={this.changeTranslation}
            addTranslation={this.addTranslation}
            fileChange={this.fileChange}
            pictureSelect={this.pictureSelect}
            descriptionChange={this.descriptionChange}
          />)
      case 3:
        return (
          <WordHero data={data} {...other}/>)
      case 4:
        return (
          <WordButton data={data} {...other}/>)
      default:
          return <p>Błąd</p>;
        };
  }
}


function getPictureUrl(picture){
  let picture_url = "";
  if (picture) {
    if (typeof picture === 'string'){
      picture_url = picture;
    }
    else {
      picture_url = URL.createObjectURL(picture);
    }
  }
  else {
    picture_url = '../../static/frontend/upload-symbol_318-30030.jpg';
  };
  return picture_url;
}


function WordForm(props){
  const {data, id, add_translation, icons} = props;
  const {text, preposition, translations, icon} = data;
  const picture = icon ? icon.picture: "";
  const description = icon ? icon.description: "";

  const picture_url = getPictureUrl(picture);
  const icons_urls = icons ? icons.map((el, index) => {return getPictureUrl(el.picture)}) : [];

  return (
    <React.Fragment>
    {id}
    <form onSubmit={props.handleSubmit}>
      <div className="field is-horizontal">
            <p className="control">
              <input className="input is-primary" type="text" name="preposition" size="10" value={preposition} placeholder="przyimek" onChange={props.handleChange} />
            </p>
            <p className="control is-expanded">
              <input className="input is-primary" type="text" name="text" value={text} placeholder="Słowo po niemiecku" onChange={props.handleChange}  required />
            </p>
            <div className="field is-horizontal">
              <div className="file has-name">
                <label className="file-label">
                  <figure className="image is-32x32">
                    <img src={picture_url} alt="Załaduj zdjęcie" className="exercise-picture"/>
                  </figure>
                  <input className="file-input"
                        type="file"
                        name="picture"
                        autoFocus=""
                        placeholder="Obrazek"
                        onChange={props.fileChange}
                  />
                </label>
              </div>
              <p className="control">
                <input className="input is-primary" type="text" name="description" value={description} placeholder="opis zdjęcia" onChange={props.descriptionChange} />
              </p>
            </div>
      </div>
      {icons && <div className="field">
                  {icons.map((el, index) =>
                    <div className="file has-name" key={"picture_hit_"+index}>
                      <label className="file-label">
                        <a onClick={() => props.pictureSelect(index)}>
                          <figure className="image is-32x32">
                            <img src={icons_urls[index]} alt="Załaduj zdjęcie" className="exercise-picture"/>
                          </figure>
                        </a>
                      </label>
                    </div>
                  )}
                  </div>
                }
      <div className="level">
          <div className="level-item has-text-centered">
              <button type="submit" className="button is-info">Gotowe!</button>
          </div>
      </div>
    </form>
    </React.Fragment>
  )
}


function WordSubForm(props){
  const {data, id, add_translation, icons, required} = props;
  const {text, preposition, translations, icon} = data;
  const picture = icon ? icon.picture: "";
  const description = icon ? icon.description: "";

  const picture_url = getPictureUrl(picture);
  const icons_urls = icons ? icons.map((el, index) => {return getPictureUrl(el.picture)}) : [];

  return (
    <React.Fragment>
          <div className="field is-grouped">
            <p className="control">
              <input className="input is-primary" type="text" name="preposition" size="10" value={preposition} placeholder="przyimek" onChange={props.handleChange} />
            </p>
            <p className="control is-expanded">
              <input className="input is-primary" type="text" name="text" value={text} placeholder="Słowo po niemiecku" onChange={props.handleChange}  required={required} />
            </p>
            <p className="control">
              <div className="file has-name">
                <label className="file-label">
                  <figure className="image is-32x32">
                    <img src={picture_url} alt="Załaduj zdjęcie" className="exercise-picture"/>
                  </figure>
                  <input className="file-input"
                        type="file"
                        name="picture"
                        autoFocus=""
                        placeholder="Obrazek"
                        onChange={props.fileChange}
                  />
                </label>
              </div>
            </p>
            <p className="control">
              <input className="input" type="text" name="description" value={description} placeholder="opis zdjęcia" onChange={props.descriptionChange} />
            </p>
            <p className="control">
              <a className="button" onClick={props.handleSubmit}>Zapisz słowo</a>
            </p>
          </div>
      {icons && <div className="field has-addons has-addons-centered">
                  {icons.map((el, index) =>
                    <div className="file has-name" key={"picture_hit_"+index}>
                      <label className="file-label">
                        <a onClick={() => props.pictureSelect(index)}>
                          <figure className="image is-32x32">
                            <img src={icons_urls[index]} alt="Załaduj zdjęcie" className="exercise-picture"/>
                          </figure>
                        </a>
                      </label>
                    </div>
                  )}
                  </div>
                }

    </React.Fragment>
  )
}

function WordHero(props){
  const {data, translation} = props;
  const {text } = data;
  const text_as_array = text.split(" ");
  const sentence = text_as_array.length > 1;
  let preposition = sentence ? "" : data.preposition+" ";
  if (preposition === 'pl ')
    preposition = 'die ';

  return (
    <React.Fragment>
      <div class={"hero" +" "+props.colour+" "+props.size}>
        <div class="hero-body">
          <div class="level">
            <div class="level-item has-text-centered">
              <h1 class="title">
                {preposition}<HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
              </h1>
            </div>
          </div>
          {translation &&
            <div class="level">
              <div class="level-item has-text-centered">
                <h2 class="subtitle">
                  {translation}
                </h2>
              </div>
            </div>
          }
        </div>
      </div>

    </React.Fragment>
  )
}


function WordButton(props){
  const {data, translation} = props;
  const {text } = data;
  const text_as_array = text.split(" ");
  const sentence = text_as_array.length > 1;
  const prepositions = ['der', 'die', 'das', 'pl'];
  const prep_colours = ['is-info', 'is-danger', 'is-warning', 'is-primary', '']
  const prep_index = prepositions.indexOf(data.preposition);

  // props.colour ? props.colour :
  const colour = (prep_index != -1 ? prep_colours[prep_index] : '')

  let preposition = sentence ? "" : data.preposition;

  if (preposition === 'pl')
    preposition = 'die';

  return (
    <React.Fragment>
    <p className={"button" +" "+colour+" "+props.size}>
      {preposition} &nbsp; <HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
    </p>
    </React.Fragment>
  )
}


export default Word;
