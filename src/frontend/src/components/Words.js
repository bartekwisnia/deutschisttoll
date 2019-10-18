import React, { Component } from "react";
import PropTypes from "prop-types";
import { getData, getCookie } from "./Utils"
import { HighlightedText } from './Components';
import { Exercise } from "./Exercises";


class Translations extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      endpoint :   "api/translation/",
      endpoint_word : "api/word/",
      data : undefined,
      words: undefined,
      word_id : 0,
      query: '',
      loaded_trans: true,
      loaded_word: false,
      placeholder: "Ładowanie...",
    };
  }

  setWord = (word) => {
    // console.log("set word:");
    // console.log(word);
    this.setState({word_id: word}, this.getTranslations);
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value, loaded_trans: false}, this.getTranslations);
  };

  getTranslations = () => {
    const {endpoint, word_id} = this.state;
    if(word_id){
      let options = {word: word_id};
      getData(endpoint, options, 'data', 'loaded_trans', 'placeholder', this);
    }
  };

  getWords = () => {
    const {endpoint_word, query} = this.state;
    const options = query ? {query: query} : {};
    getData(endpoint_word, options, 'words', 'loaded_word', 'placeholder', this,);
  };

  loadNext = () => {
    const {data} = this.state;
    const endpoint = data.next;
    getData(endpoint, {}, 'data', '', 'placeholder', this, this.handleData);
  }

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
    this.getWords();
  }

  render(){
    const { loaded_trans, loaded_word, placeholder, data, words, word_id} = this.state;
    const loaded = loaded_word && loaded_trans;

    //// console.log("render classes list");
    if (!loaded)
      return <p>{placeholder}</p>;

    if (!words)
      return <p>Brak słów w słowniku</p>;

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const elements = data ? data.results : [];
    const words_el = words ? words.results : [];

    // console.log(elements);

    return (<React.Fragment>
            <div className="columns">
              <div className="column is-4">
                <table className="table is-striped is-fullwidth is-hoverable">
                <thead><tr><th>Wybierz słowo</th></tr></thead>
                {words_el.map((el, index) => {
                      return <tr key={"word"+index}>
                                <td>
                                  <a onClick={() => this.setWord(el.id)}>{el.text}</a>
                                </td>
                              </tr>
                               })}
                </table>
              </div>
              {word_id &&
                <div className="column is-4 is-offset-1">
                  <Word
                     view={2} // setform
                     id={word_id}
                   />
                  <table className="table is-striped is-fullwidth is-hoverable">
                    <thead><tr><th>Tłumaczenie</th></tr></thead>
                    <tbody>
                      {elements.map((el, index) => {
                                return <tr>
                                          <td key={"translation"+index}>
                                            {el.text}
                                          </td>
                                        </tr>
                              })}
                    </tbody>
                  </table>
                  {data && data.next && <div className="has-text-centered">
                    <a className="button is-info" onClick={this.loadNext}>Następna strona</a>
                  </div>}
                </div>
              }
            </div>
            </React.Fragment>);
  }
}


class WordLearnList extends React.Component{
  constructor(props){
    super(props);

    this.state = {
      endpoint :   "api/word-learn/",
      data : [],
      loaded: false,
      placeholder: "Ładowanie...",
      page : 0,

    };
  }

  handleData = () => {
      this.setState({loaded: true});
  }

  handleChange = e => {
    this.setState({ [e.target.name]: e.target.value}, this.getLessons);
  };

  getWords = () => {
    const {endpoint} = this.state;
    const {learn, student} = this.props;
    let options = learn ? {learn: true} : {};
    if (student) {
      options['student'] = student.id;
    }
    getData(endpoint, options, 'data', '', 'placeholder', this, this.handleData);
  };

  loadNext = () => {
    const {data} = this.state;
    const endpoint = data.next;
    getData(endpoint, {}, 'data', '', 'placeholder', this, this.handleData);
  }

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  componentDidMount() {
    this.getWords();
  }

  componentDidUpdate(prevProps) {
    const {refresh} = this.props;
    const refresh_old = prevProps.refresh;
    if (refresh !== refresh_old)
        this.getWords();
    }

  render(){
    const { loaded, placeholder, data} = this.state;
    const { learn } = this.props;
    //// console.log("render classes list");
    if (!loaded)
      return <p>{placeholder}</p>;

    if (!data)
      return <p>Nie nauczyłeś się jeszcze żadnych słów. Wykonaj jakieś ćwiczenie, aby dodać słowa do twojego słownika</p>;

    const icon_td_style = {
        paddingRight: '0.0em',
        paddingLeft: '0.0em'
      };

    const elements = data ? data.results : [];

    return (<React.Fragment>
                {elements.length > 0 && <table className="table is-striped is-fullwidth is-hoverable">
                  <thead><tr><th>Słowo</th><th>Tłumaczenie</th><th>Poziom</th></tr></thead>
                  <tbody>
                    {elements.map((el, index) => {
                        return <tr key={el.id}>
                                <td key={index+"-word"}>
                                  {el.word.text.split(" ").length === 1 &&
                                    <React.Fragment>
                                      {el.word.preposition === 'pl' ? 'die' : el.word.preposition} &nbsp;
                                    </React.Fragment>}
                                  {el.word.text}
                                </td>
                                <td key={index+"-translation"}>
                                  {el.word.translations[0].text}
                                </td>
                                <td key={index+"-level"}>
                                  {el.level}
                                </td>

                              </tr>
                            })}
                  </tbody>
                </table>}
                {data.next && <div className="has-text-centered">
                  <a className="button is-info" onClick={this.loadNext}>Następna strona</a>
                </div>}
                {elements.length === 0 && <div className="level"><h3 className="level-item subtitle is-6">Brak nowych słów do nauczenia</h3></div>}
            </React.Fragment>);
  }
}


// function TranslationInput(props){
//   const {number, translation, last, last_dict_input} = props;
//   return (
//   <div className="field">
//     <p className="control is-expanded">
//       <input className="input" type="text" name={'t'+number}
//             value={translation}
//             id = {"translation"+number}
//             placeholder="Tłumaczenie"
//             autoFocus={!last && last_dict_input===('t'+number)}
//             onChange={(e) => props.translationChange(e, number)}
//             onKeyDown={props.onKeyDown ? (e) => props.onKeyDown(e, number) : (e) => {}}
//             onFocus={props.onFocus ? (e) => props.onFocus(e, number) : (e) => {}}
//             tabIndex="0"
//       />
//     </p>
//   </div>
// );
// }


// function TranslationDisplay(props){
//   const {translation, result} = props;
//   let button_class = "button is-static";
//
//   if (result == true) {
//     button_class = "button is-primary";
//   }
//   else if (result == false) {
//     button_class = "button is-danger";
//   };
//
//   return (<span className={button_class}>{translation}</span>);
// }
//
//
// function TranslationField(props){
//   const {version, translation, input, ...other} = props;
//   // play - 0 - form (input), 1 - display, 2 - input, 3 - puzzle (display)
//   switch(version) {
//     case 1:
//         return <TranslationDisplay {...other} translation={translation}/>
//     case 2:
//         return <TranslationInput {...other} translation={input.translation}/>
//     case 3:
//         return ""
//     default:
//         return <TranslationInput {...other} translation={translation}/>
//       };
// }
//
//
// function DeleteButton(props){
//   const {last, number} = props;
//   return(
//   <div className="field">
//     <p className="control">
//       <a className="button is-dark" disabled={last} onClick={() => props.onClick(number)}>x</a>
//     </p>
//   </div>
// );
// }
//
// function ConfirmButton(props){
//   const {success, number} = props;
//   return(
//     <div className="field">
//       <p className="control">
//         <a className={"button " + success ? "is-success" : "is-outlined"} disabled={success} onClick={() => props.onClick(number)}>Użyte</a>
//       </p>
//     </div>
// );
// }

// function WordButtonOld(props){
//   const {version, ...other} = props;
//   // version: 0 - form/delete, 1 - display (confirm), 2 - input (confirm), 3 - puzzle
//   switch(version) {
//     case 1:
//         return <ConfirmButton {...other}/>
//     case 2:
//         return <ConfirmButton {...other}/>
//     default:
//         return <DeleteButton {...other}/>
//       };
// }

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
    const icon = data.icon !== null ? data.icon : {id: 0, picture: '', description: ''};
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
    // console.log(icon);
    if (icon){
      if (icon.id)
        formData.append('icon_id', icon.id);
      else{
        formData.append('icon_picture', icon.picture);
      }
      formData.append('icon_description', icon.description);
    }
    // console.log(formData);
    const url = id ? endpoint+id : endpoint;
    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: method,
      body: formData,
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    fetch(url, conf)
    .then(response => {
      // console.log(response)
      return response.json();
    })
    .then((data) => {
      // console.log(data);
      this.setState({found_icons: null});
      const new_id = data.id;
      const translation = data.translations && data.translations.length > 0 ? data.translations[0].text : '';
      const text = data.text;
      if (this.props.initWord)
        this.props.initWord(new_id, translation, text);
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
      case 5:
        return (
          <WordInputPL data={data} {...other}/>)
      case 6:
        return (
          <WordPicture data={data} {...other}/>)
      default:
        return (
          <WordResult data={data} {...other}/>)
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
              <input className="input is-primary" type="text" name="preposition" size="3" value={preposition} placeholder="przyimek" onChange={props.handleChange} />
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


function WordInputPL(props){
  const {data, id, translation, icons, required} = props;
  const {text, translations, icon} = data;
  const text_as_array = text.split(" ");
  const sentence = text_as_array.length > 1;
  let preposition = sentence ? "" : data.preposition+" ";
  if (preposition === 'pl ')
    preposition = 'die ';

  const picture = icon ? icon.picture: "";
  const description = icon ? icon.description: "";

  const picture_url = getPictureUrl(picture);
  const icons_urls = icons ? icons.map((el, index) => {return getPictureUrl(el.picture)}) : [];
  const translations_texts = translations ? translations.map((el, index) => {return el.text}) : [];

  return (
    <React.Fragment>
          <div className="field is-grouped">
            <p className="control">
              {preposition}<HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
            </p>
            <div className="control">
              <div className="file has-name">
                <label className="file-label">
                  <figure className="image is-32x32">
                    <img src={picture_url} alt="Ikonka" className="exercise-picture"/>
                  </figure>
                </label>
              </div>
            </div>
            <p className="control is-expanded">
              <input className="input is-primary" type="text"
                    name="translation_input"
                    value={translation}
                    placeholder="Słowo po niemiecku"
                    onChange={(e) => props.handleChange(e, translations_texts)}
                    onKeyDown={props.onKeyDown ? (e) => props.onKeyDown(e) : (e) => {}}/>
            </p>
          </div>
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
      <div className={"hero" +" "+props.colour+" "+props.size}>
        <div className="hero-body">
          <div className="level">
            <div className="level-item has-text-centered">
              <h1 className="title">
                {preposition}<HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
              </h1>
            </div>
          </div>
          {translation &&
            <div className="level">
              <div className="level-item has-text-centered">
                <h2 className="subtitle">
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


function WordPicture(props){
  const {data, translation, exercise_icon} = props;
  const {text} = data;
  const icon = exercise_icon ? exercise_icon : data.icon;
  const picture = icon ? icon.picture: "";
  const picture_url = getPictureUrl(picture);

  const text_as_array = text.split(" ");
  const sentence = text_as_array.length > 1;
  let preposition = sentence ? "" : data.preposition+" ";
  if (preposition === 'pl ')
    preposition = 'die ';

  return (
    <React.Fragment>
    {picture_url &&
    <div>
      <div className="level">
        <div className={"level-item button" +" "+props.colour}>
          {preposition} &nbsp; <HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
        </div>
      </div>
      <figure className="image" style={{minHeight: 100}}>
        <img src={picture_url} alt="Załaduj zdjęcie" className="exercise-picture"/>
      </figure>
    </div>

    }
    {!picture_url &&
      <div className={"hero" +" "+props.colour+" "+props.size}>
        <div className="hero-body">
          <div className="level">
            <div className="level-item has-text-centered">
              <h1 className="title">
                {preposition}<HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
              </h1>
            </div>
          </div>
          {translation &&
            <div className="level">
              <div className="level-item has-text-centered">
                <h2 className="subtitle">
                  {translation}
                </h2>
              </div>
            </div>
          }
        </div>
      </div>
    }
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


function WordResult(props){
  const {data, translation, result, size} = props;
  const {text } = data;
  const text_as_array = text.split(" ");
  const sentence = text_as_array.length > 1;
  const prepositions = ['der', 'die', 'das', 'pl'];

  const colour = typeof(result) === 'undefined' ? '' : (result ? 'is-primary' : 'is-danger')

  let preposition = sentence ? "" : data.preposition;

  if (preposition === 'pl')
    preposition = 'die';

  return (
    <React.Fragment>
    <div className="level">
      <div className="level-item">
        <p className={"button" +" "+colour+" "+size}>
          {preposition} &nbsp; <HighlightedText text={text} highlight_start={props.highlight_start} highlight_end={props.highlight_end}/>
        </p>
      </div>
      <div className="level-item">
        <p className={"button" +" "+colour+" "+size}>
          {translation}
        </p>
      </div>
  </div>
    </React.Fragment>
  )
}


class WordsLearn extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/word-learn/exercise",
      data: {},
      results: [],
      status: 0,
      loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false,
      };
  }

  getExercise = () => {
    const {endpoint} = this.state;
    getData(endpoint, "", 'data', 'loaded', 'placeholder', this,);
  };

  componentDidMount() {
    this.getExercise();
  }

  setResult = (results, status) => {
    const {data, endpoint} = this.state;
    this.setState({ results: results, status: status});

    const method = "put";
    const url = endpoint;
    const csrftoken = getCookie('csrftoken');
    let send_data ={};
    send_data['result'] = JSON.stringify(results);
    send_data['status'] = JSON.stringify(status);
    send_data['words'] = JSON.stringify(data.words);
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
  };


  render(){
    const { loaded, placeholder, data, refresh} = this.state;
    if(!loaded){
      return <p>{placeholder}</p>;
    }
    const {onClickExit} = this.props;
    return <WordsLearnPlay data={data} refresh={refresh} setResult={this.setResult} onClickExit={onClickExit}/>;
  }
}

class WordsLearnPlay extends React.Component{
  static propTypes = {
    data: PropTypes.object.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      refresh: false,
      results: [],
      status: 0, // 0 - not started, 3 - complete ok, 2 - complete with faults, 1 - in progress
      finished: false,
      loaded: true,
      placeholder: "Ładowanie danych...",
      };
  }

  componentDidMount() {
  }

  checkComplete = (callback) => {
    const { results, status} = this.state;
    const { data } = this.props;
    let finished = false;
    // console.log("Check exercise complete");
    if (status >= 2 && !finished){
      finished = true;
      this.setState({ finished: finished});
    }

  if(callback){
    callback();
  }
};

setResults = (ex_results, ex_status) => {
  // console.log("call setResults word learn play");
  let {results, status} = this.state;
  results = ex_results;
  status = ex_status;
  const callback = this.props.setResult ? () => this.props.setResult(results, status) : () => {};
  this.setState({ results: results, status: status}, () => this.checkComplete(callback));
}

render() {
  const { loaded, placeholder} = this.state;
  if(!loaded){
    return <p>{placeholder}</p>;
  }
  const { results, status, finished} = this.state;
  const { data, onClickNext, onClickExit } = this.props;

  return loaded ? (
    <React.Fragment>
          <div className="box">
            <Exercise
              detail_view={4}
              results = {results}
              status = {status}
              data = {data}
              setResult = {this.setResults} />
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

export default Word;

export {
  WordLearnList, WordsLearn, Translations
}
