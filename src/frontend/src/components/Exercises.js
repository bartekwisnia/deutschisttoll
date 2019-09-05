import React from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import { Icon, SearchBar, ContentList1, HighlightedText } from './Components';
import Word from './Words'
import {ContentList} from './Content';
import { getData, getCookie, shuffleArray, quasiRandomColour } from "./Utils";


function MapExercise(results, model_config) {
  const type_choices = model_config.type_choices;
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
        type: type_choices[el.type],
        tags: tags
      };
      el['title_field'] = "title";
      el['fields'] = fields;
      elements.push(el);
    }
  );
  return elements
}


class ExerciseList extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/exercise/",
      placeholder: "Ładuje...",
      model_config: [],
      config_loaded: false,
      refresh: false,
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

  componentDidUpdate(prevProps) {
    if (this.props.query!== prevProps.query) {
      const {refresh} = this.state;
      this.setState({refresh: !refresh});
  };
}

  render(){
    const {config_loaded, model_config, placeholder, endpoint, refresh} = this.state;
    const loaded = config_loaded;
    const {query, ...other} = this.props;

    if (!loaded)
      return <p>{placeholder}</p>;

    return <ContentList1 {...other}
              key="exercise-list"
              endpoint={endpoint}
              options={{query: query, limit: 10}}
              model_config={model_config}
              mapModel={MapExercise}
              refresh={refresh}
              />
  }
}


class Exercise extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/exercise/",
      placeholder: "Ładuje...",
      model_config: [],
      loaded: false,
      refresh: false,
      query: ""
    };
  }

  handleDelete = id => {
    var csrftoken = getCookie('csrftoken');
    const {refresh, endpoint} = this.state;
    //const confirm = this.props.confirm;
    const conf = {
      method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć to ćwiczenie?"))
      fetch(endpoint+id , conf).then(response => console.log(response)).then(() => {this.setState({refresh: !refresh});});
  };

  handleChange = e => {
    // const refresh = this.state.refresh;
    this.setState({ [e.target.name]: e.target.value});
    //console.log(e.target.name);
    this.forceRefresh();
    // this.setState({ [e.target.name]: e.target.value, refresh: !refresh });
  };

  endEdit = () => {
    this.props.selectSite(0, 0);
  };

  forceRefresh = () => {
    //console.log("force refresh");
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
      .then(data => this.setState({ model_config: data, loaded: true }));
  }

  componentDidMount() {
    this.getConfig();
  }

  componentDidUpdate(prevProps) {
    //console.log(this.props.query);
      // Typical usage (don't forget to compare props):
      const query = this.props.query;
      if (this.props.query !== prevProps.query) {
        this.setState({query: query}, this.forceRefresh);
      }
    }

  render(){
    // console.log("render exercises site");
    const {loaded, model_config, refresh, placeholder, query,
      colour, endpoint} = this.state;
    //console.log(model_config);

    const {detail_view, detail_id, ...other} = this.props;
    // console.log(detail_view);
    if (!loaded)
      return <p>{placeholder}</p>;

    switch(detail_view) {
      case 0:
          return      <div className="column is-4 is-offset-2">
                         <div className="level">
                             <div className="level-item has-text-centered">
                                 <a className="button is-info" onClick={() => this.props.selectSite(1, 0)} >Nowe ćwiczenie</a>
                             </div>
                         </div>
                         <SearchBar value={query} handleChange={this.handleChange} name={"query"}/>
                         <ContentList1
                                      key="list"
                                     endpoint={endpoint}
                                     options={{query: query, limit: 10}}
                                     model_config={model_config}
                                     mapModel={MapExercise}
                                     handleDelete={(id) => this.handleDelete(id)}
                                     handleSelect={(id) => this.props.selectSite(1, id)}
                                     handlePlay={(id) => this.props.selectSite(4, id)}
                                     refresh={refresh}
                                     />
                     </div>
      case 1:
          return <ExerciseForm
                      key={"lesson_form_"+detail_id}
                      endpoint={endpoint} id={detail_id}
                      loaded={true}
                      model_config={model_config}
                      object_delete={() => this.handleDelete(detail_id)}
                      endEdit={this.endEdit}
                      refresh={refresh}
                      handlePlay={() => this.props.selectSite(4, detail_id)}
                      />

      case 2:
          return      <div className="column is-4 is-offset-2">
                 <SearchBar value={query} handleChange={this.handleChange} name={"query"}/>
                 <ContentList1 search_list={true}
                             key="search"
                             endpoint={endpoint+"search"}
                             options={{query: query, limit: 10}}
                             model_config={model_config}
                             mapModel={MapExercise}
                             handleSelect={(id) => this.props.selectSite(3, id)}
                             handlePlay={(id) => this.props.selectSite(4, id)}
                             refresh={refresh}
                             />
              </div>
      case 3:
      return <ExercisePreview
          key={"exercise_preview_"+detail_id}
          endpoint={endpoint} id={detail_id}
          loaded={true}
          model_config={model_config}
          handlePlay={() => this.props.selectSite(4, detail_id)}
          />
      case 4:
          return  <ExercisePlay
                        key={"exercise_play_"+detail_id}
                        endpoint={endpoint} id={detail_id}
                        loaded={true}
                        model_config={model_config}
                        {...other}
                        />
      case 5:
      return <ExerciseFrontpage
          endpoint={endpoint} id={detail_id}
          loaded={true}
          model_config={model_config}
          onClickPlay={() => this.props.onClickPlay(detail_id)}
          />
      default:
          return <p>Nothing to display</p>;
        };


  }
}


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

function WordButton(props){
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


function ExerciseWordForm(props){
  const {number, word, translation, last, last_dict_input} = props;
  return <div className="field is-horizontal">
          <div className="field-body">
            <div className="field">
              <p className="control is-expanded">
                <input className="input" type="text" name={'w'+number} value={word} placeholder="Słowo po niemiecku" autoFocus={!last && last_dict_input===('w'+number)} onChange={(e) => props.onChange(e, number)}/>
              </p>
            </div>
            <TranslationField {...props}/>
            <WordButton {...props}/>
          </div>
        </div>;
};


function ExerciseWordPreview(props){
  const {number, word, translation, preview, play, result} = props;

    let button_class = "button is-static";

    if (result == true) {
      button_class = "button is-primary";
    }
    else if (result == false) {
      button_class = "button is-danger";
    };

  return  <div className="columns">
            <div className="column is-2 is-offset-4">
              <span className={button_class}>{word}</span>
            </div>
            <div className="column is-2 is-offset-1">
              <TranslationField {...props} version={1}/>
            </div>
          </div>;
};




function ExerciseWordPlay(props){
  const {number, word, play, result, puzzle, ...other} = props;
  // play - 0 - no game, 1 - confirm, 2 - input, 3 - puzzle

    let button_class = "button is-outlined";

    if (result == true) {
      button_class = "button is-primary";
    }
    else if (result == false) {
      button_class = "button is-danger";
    };

  const play_input =
        <div className="columns">
          <div className="column is-4 is-offset-1">
            <span className={button_class}>{word}</span>
          </div>
          <div className="column is-4 is-offset-1">
            <TranslationField {...other} number={number} version={play}/>
          </div>
        </div>;

  const play_puzzle =
        <div className="columns">
          <div className="column is-6 is-offset-1">
            <div className="columns">
              <div className="column">
                {puzzle.word.map((el, index) =>
                  <a onClick={() => props.wordPuzzleClick(el, number, index)}><span className={button_class}>{el}</span></a>)
                }
                </div>
                <div className="column">
                  <span className={button_class}>{props.input.word}</span>
                </div>
              </div>
            </div>
          <div className="column is-2 is-offset-1">
            <span className={button_class}>{props.translation}</span>
          </div>
        </div>;


  const play_confirm =
      <a className={button_class} onClick={() => props.onClick(number)}>{word}</a>

  switch(play) {
    case 1:
        return play_confirm
    case 2:
        return play_input
    case 3:
        return play_puzzle
      };
  return play_confirm;
};


function ExerciseDictForm(props) {
  const { dict} = props;
  const len = dict.length;
  return   <div className='field'>
            {dict.map((el, index) =>
              <ExerciseWordForm number={index}
                            last_dict_input={props.last_dict_input} key={index}
                            word={el.word} translation={el.translation}
                            onChange={props.onChange} onClick={props.onClick}/>)
            }
              <ExerciseWordForm number={len}
                            last_dict_input={props.last_dict_input}
                            key={len} word={''} translation={''} last={true}
                            onChange={props.onChange} onClick={props.onClick}/>
          </div>;
}


function ExerciseDictPreview(props) {
      const { dict, results} = props;
      return   <React.Fragment>
                  {dict.map((el, index) =>
                    <ExerciseWordPreview number={index}
                                  key={index} word={el.word}
                                  translation={el.translation}
                                  result={results ? results[index] : undefined}/>)
                    }
              </React.Fragment>;
    }


function ExerciseDictPlay(props){
  const { dict, play, results, inputs, puzzles} = props;
  const play_html = <div className='field'>
        {dict.map((el, index) => {
          if(index == results.length){
          return <ExerciseWordPlay number={index}
                        key={index}
                        result={results[index]}
                        input={inputs[index]}
                        puzzle = {puzzles[index]}
                        word={el.word}
                        translation={el.translation}
                        translationEnd={props.translationChange}
                        translationChange={props.translationChange}
                        translationPuzzleClick = {props.translationPuzzleClick}
                        wordPuzzleClick = {props.wordPuzzleClick}
                        onKeyDown={props.onKeyDown}
                        onFocus={props.onFocus}
                        play={play}/>
                      }
            else if (index < results.length) {
                return <ExerciseWordPreview number={index}
                            key={index} word={el.word}
                            translation={el.translation}
                            result={results[index]}
                        />
                          }
            else return "";
          })
        }
      </div>

  const play_confirm =
    <div className="level">
        <div className="level-item">
          <div className="buttons are-medium">
            {dict.map((el, index) =>
              <ExerciseWordPlay number={index} key={index} result={results[index]} word={el.word} translation={el.translation} puzzle = {puzzles[index]} onClick={props.onClick} play={1}/>)}
          </div>
        </div>
      </div>

  switch(play) {
    case 1:
        return play_confirm
    case 2:
        return play_html
    case 3:
        return play_html
    default:
        return play_confirm
      };
};


function makePuzzle(str_var){
  let puzzle = [];
  if (str_var.indexOf(' ') !== -1){
    puzzle = str_var.split(' ');
  }
  else {
    for (var i = 0, j = str_var.length; i < j; i++) {
       puzzle[i] = str_var.substring(i, i + 1);
    }
  }
  shuffleArray(puzzle);
  return puzzle;
}


class ExerciseDict extends React.Component {
    constructor(props){
      super(props);
      const {dict} = this.props;
      let empty_list = [];
      let puzzles = [];
      for(let i = 0; i < dict.length; i++) {
           empty_list.push({word: "", translation: ""});
           puzzles.push({word: makePuzzle(dict[i].word), translation: makePuzzle(dict[i].translation)});
      }

      this.state = {
        inputs: empty_list,
        puzzles: puzzles,
        focused: undefined,
        };
    }

    handleConfirm = (index) => {
      const {results} = this.props;
      results[index] = true;
      this.props.setResults(results);
    };

    handleCheck = (index) => {
      //console.log("checking");
      const {inputs} = this.state;
      const {dict, results} = this.props;
      if (inputs[index].translation === dict[index].translation && inputs[index].word === dict[index].word){
        results[index] = true;
      }
      else {
        results[index] = false;
      }
      this.props.setResults(results);
    };

    handleCheckTrueOnly = (index) => {
      const {inputs} = this.state;
      const {dict, results} = this.props;
      if (inputs[index].translation === dict[index].translation && inputs[index].word === dict[index].word){
        results[index] = true;
      }
      this.props.setResults(results);
    };

    translationChange = (e, index) => {
      const {inputs} = this.state;
      const {dict} = this.props;
      inputs[index].translation = e.target.value;
      inputs[index].word = dict[index].word;
      this.setState({ inputs: inputs });
      this.handleCheckTrueOnly(index);
    };

    translationPuzzleClick= (value, index) => {
      const {inputs} = this.state;
      const {dict} = this.props;

      if (dict[index].traslation.indexOf(' ') !== -1){ // single word
          inputs[index].translation += value;
      }
      else{
        if (inputs[index].translation !== "")
          inputs[index].translation += " ";
        inputs[index].translation += value;
      }

      inputs[index].word = dict[index].word;
      this.setState({ inputs: inputs });
      this.handleCheckTrueOnly(index);
    };

    wordPuzzleClick= (value, index, part) => {
      const {inputs} = this.state;
      let {puzzles} = this.state;
      const {dict} = this.props;
      console.log("click");
      console.log(value);
      if (dict[index].word.indexOf(' ') === -1){ // single word
          inputs[index].word += value;
      }
      else{
        if (inputs[index].word !== "")
          inputs[index].word += " ";
        inputs[index].word += value;
      }
      puzzles[index].word.splice(part, 1);
      inputs[index].translation = dict[index].translation;
      console.log(index);
      console.log(dict);
      console.log(inputs);
      if (inputs[index].word.length < dict[index].word.length)
        this.setState({ inputs: inputs, puzzles: puzzles }, this.handleCheckTrueOnly(index));
      else {
        this.setState({ inputs: inputs, puzzles: puzzles }, this.handleCheck(index));
      }
    };

    handleKeyDown = (e, index) => {
      if (e.keyCode === 13){
        this.handleCheck(index);
      }
    }

    handleOnFocus = (e, index) => {
      //console.log(index + " get focus");
      const focused = this.state.focused;
      if (index != focused){
        //console.log("new component get focus");
        if(typeof focused !=="undefined"){
          //console.log(index + " lost focus");
          this.handleCheck(focused);
        }
        this.setState({ focused: index });
      }

    }

    render() {
      const { inputs, puzzles } = this.state;
      const {preview, play, onChange, onClick, ...other} = this.props;
      if (preview)
        return (<ExerciseDictPreview {...other}/>);
      if (play)
        return (<ExerciseDictPlay {...other}
                                  play = {play}
                                  inputs = {inputs}
                                  puzzles = {puzzles}
                                  translationChange = {this.translationChange}
                                  translationPuzzleClick = {this.translationPuzzleClick}
                                  wordPuzzleClick = {this.wordPuzzleClick}
                                  onClick={this.handleConfirm}
                                  onKeyDown={this.handleKeyDown}
                                  onFocus={this.handleOnFocus}

                                  />);
      // Form
      return (<ExerciseDictForm {...other}
                                onChange = {onChange}
                                onClick = {onClick}
                                />);
     }
}


class DescribePicturePreview extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        };
    };

  render () {
    const {words, results, set_results, picture_url} = this.props;
    console.log("render describe picture play")
    console.log(words)

    if (words.length === 0){
      return <p>Brak słów</p>
    }

    const index = results.length
    let groups = words.length > 0 ? [[words[0]]] : [];
    for (var i = 1; i < words.length; i++) {
        let group_found = false;
        for (var j= 0; j < groups.length; j++) {
          if(words[i].comment === groups[j][0].comment){
            groups[j].push(words[i]);
            group_found = true;
            break;
          }
        }
        if (!group_found){
        groups.push([words[i]]);
        }
    }
    console.log(groups);
    const col_size = (11 / groups.length) - 1;

    return (
      <React.Fragment>
        <div className="columns is-centered">
          <div className="column is-2">
            <div className="file has-name">
              <label className="file-label">
                <figure className="image" style={{minHeight: 100}}>
                  <img src={picture_url} alt="Załaduj zdjęcie" className="exercise-picture"/>
                </figure>
              </label>
            </div>
          </div>
        </div>
        <div className="columns is-centered">
        {groups.map((group, index) =>
          <div className={"column is-"+col_size+" is-offset-1"}>
            {group.map((el, index) => <div className='level'>
                                      <Word
                                        view={4} // button
                                        id={el.word}
                                        translation={el.translation}
                                      />
                                    </div>)}
          </div>
        )}
        </div>
      </React.Fragment>
    );
  };
}



class DescribePicturePlay extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        };
    };

    handleCheck = (index) => {
      const {results} = this.props;
      results[index] = true;
      this.props.setResults(results);
    };

  render () {
    const {words, results, set_results, picture_url} = this.props;
    console.log("render describe picture preview")
    console.log(words)

    if (words.length === 0){
      return <p>Brak słów</p>
    }

    if (words.length === results.length){
      return <p>Brak słów</p>
    }

    const index = results.length
    const cpy_words = [...words];
    const done = cpy_words.splice(0, index);
    let groups = done.length > 0 ? [[done[0]]] : [];
    for (var i = 1; i < done.length; i++) {
        let group_found = false;
        for (var j= 0; j < groups.length; j++) {
          if(done[i].comment === groups[j][0].comment){
            groups[j].push(done[i]);
            group_found = true;
            break;
          }
        }
        if (!group_found){
        groups.push([done[i]]);
        }
    }
    console.log(groups);
    const col_size = (11 / groups.length) - 1;

    const word1 = cpy_words.length > 0 ? cpy_words.splice(0, 1)[0] : null;
    console.log(word1);

    return (
      <React.Fragment>
        <div className="columns is-vcentered">
          <div className="column is-2 is-offset-3">
            <div className="level">
              <div className="level-item">
                <div className="file has-name">
                  <label className="file-label">
                    <figure className="image" style={{minHeight: 200}}>
                      <img src={picture_url} alt="Załaduj zdjęcie" className="exercise-picture"/>
                    </figure>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="column is-2 is-offset-2">
                      <div className="level">
              {word1 && <a onClick={() => this.handleCheck(index)}>
                <Word
                   view={4} // button
                   id={word1.word}
                 />
              </a>}
                        </div>
          </div>
        </div>
        <div className="columns">
        {groups.map((group, index) =>
          <div className={"column is-"+col_size+" is-offset-1"}>
            {group.map((el, index) => <div className='level'>
                                      <Word
                                        view={4} // button
                                        id={el.word}
                                        translation={el.translation}
                                      />
                                    </div>)}
          </div>
        )}
        </div>
      </React.Fragment>
    );
  };
}




function DescribePicture(props){
  const {picture_url, fileChange, preview, play, ...other} = props;

  if (preview)
    return (<DescribePicturePreview picture_url={picture_url} {...other}/>);
  if (play)
    return (<DescribePicturePlay picture_url={picture_url} {...other}/>);
  return (<React.Fragment>
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
        <DictionaryForm {...other}/>
      </React.Fragment>);
};


class TranslateWords extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        game: 2,
        };
    };

    changeGame = (index) => {
      this.setState({ game: index });
    };

  render () {
    const {game} = this.state;
    const {preview, play, ...other} = this.props;
    //console.log("TranslateWords results" + results);
    if (preview)
      return (<ExerciseDict preview={true} {...other}/>);
    if (play)
      return (<React.Fragment>
                          <div className="level">
                              <div className="level-item">
                                <div className="buttons are-small">
                                  <a className="button" onClick={() => this.changeGame(0)}>Podpowiedź</a>
                                  <a className="button" onClick={() => this.changeGame(2)}>Tłumaczenie na polski</a>
                                  <a className="button" onClick={() => this.changeGame(3)}>Rozsypanka</a>
                                </div>
                              </div>
                            </div>
            <ExerciseDict play={game} preview={game ? false : true} {...other}/>
          </React.Fragment>);
    return (<ExerciseDict {...other}/>);
  };
}


class WordInExercise extends React.Component {
    constructor(props){
      super(props);
      this.state = {word: ''}
    };

  setWord = (word) => {
    console.log("set word:");
    console.log(word);
    this.setState({word: word});
  }

  render () {
    const {el, index, ...other} = this.props;
    const {word} = this.state;
    console.log("render Word in Exercise");
    console.log(word);
    console.log(el);
    const word_id = el ? el.word : null;
    const translation = el ? el.translation : '';
    const comment = el ? el.comment : '';
    const required = el ? true : false;
    const highlight_start = el ? el.highlight_start : 0;
    const highlight_end = el ? el.highlight_end : 0;
    // <mark>highlighted text</mark>
    const highlight = highlight_start > 0 || highlight_end > 0;

    return (


      <React.Fragment>
        <div className="columns">
          <div className="column is-11">
              <Word
                   initWord={(id, trans) => this.props.handleChangeWord([{atr: 'word', val: id}, {atr: 'translation', val: trans}], index)}
                   view={2} // subform
                   id={word_id}
                   required = {required}
                   setWord = {this.setWord}
                 />
          {el &&
            <React.Fragment>
            <div className="field is-horizontal">
              <div className="field is-grouped">
                 <p className="control">
                   <input className="input is-info" type="text" name="translation" size="10" value={translation} placeholder="tłumaczenie" onChange={(e) => this.props.handleChangeWord({atr: e.target.name, val: e.target.value}, index)} />
                 </p>
                 <p className="control">
                   <input className="input is-info" type="text" name="comment" size="10" value={comment} placeholder="komentarz/grupa" onChange={(e) => this.props.handleChangeWord({atr: e.target.name, val: e.target.value}, index)} />
                 </p>
                 <p className="control">
                   <input className="input" type="text" name="highlight_start" size="2" value={highlight_start} placeholder="podświetlenie od znaku" onChange={(e) => this.props.handleChangeWord({atr: e.target.name, val: e.target.value}, index)} />
                 </p>
                 {highlight &&
                  <p className="control">
                    <p className="button is-static">
                      <HighlightedText text={word} highlight_start={highlight_start} highlight_end={highlight_end}/>
                    </p>
                  </p>
                 }
                 <p className="control">
                   <input className="input" type="text" name="highlight_end" size="2" value={highlight_end} placeholder="podświetlenie do znaku" onChange={(e) => this.props.handleChangeWord({atr: e.target.name, val: e.target.value}, index)} />
                 </p>
              </div>
            </div>
            </React.Fragment>
            }
          </div>
          <div className="column">
              {el && <Icon active={true} active_class="essentials32-garbage-1"  handleClick = {() => this.props.deleteWord(index)}/>}
          </div>
        </div>
        <hr/>
      </React.Fragment>
);
  };
}

class ClickPreview extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        };
    };

  render () {
    const {words, results, set_results} = this.props;
    console.log("render click and learn preview")
    console.log(words)

    if (words.length === 0){
      return <p>Brak słów</p>
    }

    return (
      <React.Fragment>
        <div className="columns">
          <div className="column is-3">
          {words.map((el, index) => <React.Fragment>
                                    <Word
                                      view={3} // hero
                                      id={el.word}
                                      colour={quasiRandomColour(index)}
                                      size=""
                                      translation={el.translation}
                                    />
                                   <div className="level">
                                   </div>
                                  </React.Fragment>)}
          </div>
          <div className="column is-4 is-offset-1">
            <div className="level">
            </div>
            <div className="level>">
            </div>
          </div>
          <div className="column is-offset-1">
          </div>
        </div>
      </React.Fragment>
    );
  };
}


class ClickPlay extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        };
    };

    handleCheck = (index) => {
      const {results} = this.props;
      results[index] = true;
      this.props.setResults(results);
    };

  render () {
    const {words, results, set_results} = this.props;
    console.log("render click and learn play")
    console.log(words)

    if (words.length === 0){
      return <p>Brak słów</p>
    }

    if (words.length === results.length){
      return <p>Brak słów</p>
    }

    const index = results.length
    const cpy_words = [...words];
    const done = cpy_words.splice(0, index);
    const word1 = cpy_words.length > 0 ? cpy_words.splice(0, 1)[0] : null;
    const word1colour = quasiRandomColour(index);
    console.log(word1);

    return (
      <React.Fragment>
        <div className="columns">
          <div className="column is-3">
          {done.map((el, index) => <React.Fragment>
                                    <Word
                                      view={3} // hero
                                      id={el.word}
                                      colour={quasiRandomColour(index)}
                                      size=""
                                      translation={el.translation}
                                    />
                                   <div className="level">
                                   </div>
                                  </React.Fragment>)}
          </div>
          <div className="column is-4 is-offset-1">
            <div className="level">
            </div>
            {word1 && <a onClick={() => this.handleCheck(index)}>
              <Word
                 view={4} // hero
                 id={word1.word}
                 colour={word1colour}
                 size="is-medium"
               />
            </a>}
            <div className="level>">
            </div>
          </div>
          <div className="column is-offset-1">
          </div>
        </div>
      </React.Fragment>
    );
  };
}


class DictionaryForm extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        };
    };

  render () {
    const {words, ...other} = this.props;
    console.log("render dictionary form")
    console.log(words)
    return (
      <React.Fragment>
        {words.map((el, index) => {
          console.log("Word number "+index);
          return <WordInExercise key={"Word number "+index} el={el} index={index} {...other} />
        })}
        <WordInExercise key={"New word"+words.length} {...other}/>
      </React.Fragment>

    );
  };
}


class ClickAndLearn extends React.Component {
    constructor(props){
      super(props);
      this.state = {
        game: 2,
        };
    };

    changeGame = (index) => {
      this.setState({ game: index });
    };

  render () {
    const {game} = this.state;
    const {preview, play, ...other} = this.props;
    //console.log("TranslateWords results" + results);
    if (play)
      return (<ClickPlay {...other}/>);
    if (preview)
      return (<ClickPreview {...other}/>);
    return (<DictionaryForm {...other}/>);
  };
}



function TypeSpecificContent(props){
  const {exercise_type, ...other} = props;
  if (exercise_type === 'DES_PIC')
    {
    return <DescribePicture {...other}/>
  }
  if (exercise_type === 'SEL_TRANS')
    {
    return <TranslateWords {...other}/>
  }
  if (exercise_type === 'CLICK')
    {
    return <ClickAndLearn {...other}/>
  }
  return <div className="field"></div>
}


class ExerciseForm extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", type: "", categories: "", level: "", picture: "",
      favourite: false, public: false, words: []},
      imagePreviewUrl : "",
      loaded: false,
      last_dict_input: "",
      placeholder: "Ładowanie danych...",
      refresh: false,
      word_in_ex_endpoint: "api/word-in-exercise/",
      copy: false,
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
      fetch(this.props.endpoint+id , conf)
      .then(response => console.log(response))
      .then(() =>{this.props.endEdit();});
  };

  handleChange = e => {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data: data });
  };

  handleChangeWord = (param, index) => {
    const data = this.state.data;
    const words = data.words;
    console.log(param);
    console.log(index);
    if (param.length === undefined)
      param = [param];
    if (typeof(index) === 'number')
      for (var i = 0; i < param.length; i++) {
          words[index][param[i].atr] = param[i].val;
          }
    else {
      const new_word ={id: 0, exercise: 0, word: 0, translation: '', comment: '', highlight_start: 0, highlight_end: 0};
      for (var i = 0; i < param.length; i++) {
          new_word[param[i].atr] = param[i].val;
          }
      words.push(new_word);
    }
    data.words = words;
    this.setState({ data: data });
  };

  changeWordID = (id, index) => {
    const data = this.state.data;
    const words = data.words;
    if (index)
      words[index].word = id;
    else {
      const new_word ={exercise: this.props.id, word: id, translation: '', comment: '', highlight_start: 0, highlight_end: 0};
      words.push(new_word);
    }
    data.words = words;
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
  console.log("mount exercise form");
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


saveWord = (word_in_ex) => {
  const {word_in_ex_endpoint } = this.state;
  const endpoint = word_in_ex_endpoint;
  const formData = new FormData();
  const {id, exercise, word, translation, comment, highlight_start, highlight_end } = word_in_ex;
  const method = id ? "put" : "post";

  formData.append('exercise', exercise);
  formData.append('word', word);
  formData.append('translation', translation);
  formData.append('comment', comment);
  formData.append('highlight_start', highlight_start);
  formData.append('highlight_end', highlight_end);

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
  });
};

saveWords = (ex_id) => {
  const { data, word_in_ex_endpoint } = this.state;
  const { words } = data;

  for (var i = 0; i < words.length; i++) {
        const word = words[i];
        console.log(word);
        console.log(ex_id);
        word['exercise'] = ex_id;
        console.log(word);
        this.saveWord(word);
      }
  }

deleteWord = (index) => {
    const {data, word_in_ex_endpoint} = this.state;
    const endpoint = word_in_ex_endpoint;
    const { words } = data;
    const { id } = words[index];
    if (id){
      const csrftoken = getCookie('csrftoken');
      const conf = {
        method: "delete",
        headers: new Headers({'X-CSRFToken': csrftoken})
      };
      if (confirm("Czy na pewno chcesz usunąć to słówko z ćwiczenia?"))
        fetch(endpoint+id , conf)
        .then(
          response => {console.log(response)
                       if (response.status === 204){
                          words.splice(index, 1);
                          data.words = words;
                          this.setState({data: data})
                        }
                      }
        )
    }
    else{
      words.splice(index, 1);
      data.words = words;
      this.setState({data: data});
    }

  };

makeCopy = () => {
  const {data} = this.state;
  const {words} = data;
  words.map((el, index) => {el['id'] = 0})
  data.words = words;
  this.setState({data: data, copy: true});
}

handleSubmit = e => {
  e.preventDefault();
  const {id, endpoint} = this.props;
  const { data, refresh, copy } = this.state;
  const { title, type, categories, level, picture, favourite} = data;
  const is_public = data['public']
  const formData = new FormData();
  const method = (id && !copy) ? "put" : "post";
  formData.append('title', title);
  formData.append('type', type);
  formData.append('categories', categories);
  formData.append('level', level);
  formData.append('favourite', favourite);
  formData.append('public', is_public);

  if (typeof picture !== 'string'){
    formData.append('picture', picture);
  };

  const url = (id && !copy) ? endpoint+id : endpoint;
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
    this.saveWords(data.id);
    this.props.endEdit();
  });
};

  render() {
    console.log("render exercise form");
    const { data, dict, last_dict_input, imagePreviewUrl, placeholder, copy} = this.state;
    const { id, loaded, model_config } = this.props;
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, type, categories, level, picture, favourite, words } = data;
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
      <React.Fragment>
        <nav className="breadcrumb" aria-label="breadcrumbs">
          <ul>
            <li><a onClick={this.props.endEdit}>Ćwiczenia</a></li>
            <li className="is-active">{" "+title}</li>
          </ul>
        </nav>
            <form onSubmit={this.handleSubmit} className="box">
              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control is-expanded">
                      <input
                        className="input title is-6 has-text-centred"
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
                      <Icon active={favourite} active_class="essentials32-like-1" inactive_class="essentials32-dislike-1" handleClick = {this.favouriteChange}/>
                      <Icon active={is_public} active_class="essentials32-worldwide" handleClick = {this.publicChange}/>
                      {id > 0 && <Icon active={true} active_class="essentials32-play-button-1"  handleClick = {() => this.props.handlePlay(id)}/>}
                      {id > 0 && <Icon active={true} active_class="essentials32-garbage-1"  handleClick = {this.handleDelete}/>}
                      {id > 0 && !copy && <a className="button" onClick={this.makeCopy}>Stwórz kopię</a>}
                      {copy && <span className="button">Kopia</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="field">
                <div className="control">
                  <div className="select subtitle is-7 has-text-centred">
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

              <TypeSpecificContent exercise_type={type} words={words}
                                  picture_url={picture_url}
                                  fileChange={this.fileChange}
                                  dict={dict}
                                  handleChangeWord={this.handleChangeWord}
                                  deleteWord={this.deleteWord}
                                  last_dict_input={last_dict_input}
                                  onChange={this.dictChange}
                                  onClick={this.dictDelete}/>

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
          </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}


class ExercisePreview extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/exercise/",
      data: {title: "", type: "", categories: "", level: "", picture: "",
      favourite: false, public: false, words: []},
      imagePreviewUrl : "",
      loaded: false,
      config_loaded: false,
      last_dict_input: "",
      placeholder: "Ładowanie danych...",
      refresh: false
      };
  }


getData(){
  const {endpoint} = this.state;
  const {id} = this.props;
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

getConfig(){
  const {endpoint} = this.state;
  fetch(endpoint+'config')
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ placeholder: "Something went wrong" });
      }
      return response.json();
    })
    .then(data => this.setState({ model_config: data, config_loaded: true }));
}

componentDidMount() {
  if (!this.props.model_config){
      this.getConfig();
  }
  else {
    const {model_config} = this.props;
    this.setState({ model_config: model_config, config_loaded: true });
  }

  const {id, loaded, model_config} = this.props;
  if (id){
    this.getData();
  }
  else {
    const data = this.state.data;
    data.type = "";
    this.setState({ data: data, loaded: true});
  }
}

componentDidUpdate(prevProps) {
  if (this.props.id !== prevProps.id) {
    if (this.props.id){
      this.getData();
    }
    else {
      const data = this.state.data;
      data.type = "";
      this.setState({ data: data, loaded: true});
    }
    }
}

  render() {
    const {loaded, config_loaded} = this.state;
    if(!loaded || !config_loaded){
      const {placeholder} = this.state;
      return <p>{placeholder}</p>;
    }

    const { data, last_dict_input, imagePreviewUrl, placeholder, model_config} = this.state;
    const { id} = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, type, categories, level, picture, favourite, words } = data;
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
    //console.log(type_choices);
    return loaded ? (
      <React.Fragment>
              <div className="level">
                <div className="level-item">
                  <h3 className="title is-5 has-text-centred">{title}</h3>
                </div>
                {this.props.handlePlay && id &&
                <div className="level-right">
                  <Icon active={true} active_class="essentials32-play-button-1"  handleClick = {() => this.props.handlePlay(id)}/>
                </div>}
              </div>
              <div className="level">
                <div className="level-item">
                  <h3 className="subtitle is-7 has-text-centred">{type_choices[type]}</h3>
                </div>
              </div>

              <TypeSpecificContent exercise_type={type} picture_url={picture_url} words={words} preview={true}/>

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
      </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}


class ExercisePlay extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/exercise/",
      data: {title: "", type: "", categories: "", level: "", picture: "",
      favourite: false, public: false, words: []},
      results: [],
      status: 0, // 0 - not started, 3 - complete ok, 2 - complete with faults, 1 - in progress
      model_config: [],
      imagePreviewUrl : "",
      loaded: false,
      config_loaded: false,
      last_dict_input: "",
      placeholder: "Ładowanie danych...",
      refresh: false,
      play: 1,
      };
  }


loadData(callback){
  const {data} = this.props;
  this.setState({ data: data, loaded: true }, callback);
}


getData(callback){
  const {endpoint} = this.state;
  const {id} = this.props;
  //console.log(endpoint+id);
  fetch(endpoint+id)
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ placeholder: "Błąd w pobieraniu danych" });
      }
      return response.json();
    })
    .then(data => {
      this.setState({ data: data, loaded: true }, callback);
    }
    );
}

getConfig(){
  const {endpoint} = this.state;
  fetch(endpoint+'config')
    .then(response => {
      if (response.status !== 200) {
        return this.setState({ placeholder: "Something went wrong" });
      }
      return response.json();
    })
    .then(data => this.setState({ model_config: data, config_loaded: true }));
}

loadResults(){
  const {results, status} = this.props;
  console.log("Load exercise results");
  console.log(results);
  console.log(status);
  console.log(typeof(results));
  console.log(typeof(status));
  if(typeof(results) === "object" && results !==null && typeof(status) === "number"){
    console.log("Types are ok");
    this.setState({ results: results, status: status}, this.checkComplete);
  }
}

componentDidMount() {
  if(this.props.data){
      this.loadData(this.loadResults);
  }
  else {
        this.getData(this.loadResults);
  }

  if (!this.props.model_config){
      this.getConfig();
  }
  else {
    const {model_config} = this.props;
    this.setState({ model_config: model_config, config_loaded: true });
  }
}

componentDidUpdate(prevProps) {
  if(this.props.data){
    if(this.props.data.id !== prevProps.data.id){
      this.loadData(this.loadResults);
    }
  }
  else {
    if (this.props.id !== prevProps.id) {
        this.getData();
      }
  }
}

checkComplete = (callback) => {
  console.log("Check exercise complete");
  const { data, results } = this.state;
  const { words } = data;
  let status = 0;
  if (results.length > 0 && results.length < words.length){
    status = 1;
  }
  else if (results.length === words.length){
    status = 3;
    for (var i = 0; i < results.length; i++) {
        if (!results[i]){
          status = 2;
          break;
        }
    }
  }
  this.setState({ status: status});

  if(callback){
    callback(results, status);
  }

};

setResults = (results) => {
  const callback = this.props.setResult;
  this.setState({ results: results}, () => this.checkComplete(callback));
}

handleRestart = () => {
  const { setResult } = this.props;
  this.setState({ status: 0, results: []});
  if(setResult){
    this.props.setResult([], 0);
  }
}

  render() {
    const {loaded, config_loaded} = this.state;
    if(!loaded || !config_loaded){
      const {placeholder} = this.state;
      return <p>{placeholder}</p>;
    }
    const { data, status, last_dict_input, imagePreviewUrl, results,
      model_config} = this.state;
    const { id, in_lesson, onClickNext, onClickExit } = this.props;
    console.log("render exercise play");
    console.log(data);
    console.log("exercise results:");
    console.log(results);
    console.log("exercise status:");
    console.log(status);

    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, type, categories, level, picture, favourite, words } = data;
    const is_public = data['public']
    const finished = status >= 2;
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

    const type_choices = model_config.type_choices;

    const exercise_content = finished ?
    <TypeSpecificContent exercise_type={type} picture_url={picture_url} words={words} preview={true} results={results}/>
    :
    <TypeSpecificContent exercise_type={type} picture_url={picture_url} words={words} play={true} results={results} setResults={this.setResults}/> ;

    return in_lesson ?
    <React.Fragment>
            <div className="level">
              <div className="level-item">
                <h3 className="title is-5 has-text-centred">{title}</h3>
              </div>
            </div>
            <div className="level">
              <div className="level-item">
                <h3 className="subtitle is-7 has-text-centred">{type_choices[type]}</h3>
              </div>
            </div>
            {exercise_content}
    </React.Fragment>
     :
      <React.Fragment>
        <div className="box">
          <div className="level">
            <div className="level-item">
              <h3 className="title is-5 has-text-centred">{title}</h3>
            </div>
          </div>
          <div className="level">
            <div className="level-item">
              <h3 className="subtitle is-7 has-text-centred">{type_choices[type]}</h3>
            </div>
          </div>
          {exercise_content}
          {finished && <div className="level">
                        <div className="level-item">
                          <div className="buttons are-medium">
                            <a className="button" onClick={this.handleRestart}>Powtórz ćwiczenie</a>
                            {onClickNext && <a className="button" onClick={onClickNext}>Następne</a>}
                            {onClickExit && <a className="button" onClick={onClickExit}>Zamknij</a>}
                          </div>
                        </div>
                      </div>
          }
        </div>
      </React.Fragment>
  }
}


class ExerciseFrontpage extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {title: "", type: "", categories: "", level: "", picture: "",
      favourite: false, public: false, words: []},
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

  render() {
    const { data, placeholder} = this.state;
    const { id, loaded, model_config } = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const { title, type, categories, level, picture, favourite, words } = data;
    const type_choices = loaded ? model_config.type_choices : {};
    return loaded ? (
      <React.Fragment>
              <div className="level">
                <div className="level-item">
                  <h3 className="title is-5 has-text-centred">{title}</h3>
                </div>
              </div>
              <div className="level">
                <div className="level-item">
                  <h3 className="subtitle is-7 has-text-centred">{type_choices[type]}</h3>
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
  Exercise, ExerciseForm, ExercisePreview, ExercisePlay, MapExercise, ExerciseList,
}
