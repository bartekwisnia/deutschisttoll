import React from "react";
import ReactDOM from "react-dom";
import Content from "./Content";
import Teaching from "./Teaching";
import Students from "./Students";
import Learning from "./Learning";
import Blog from "./Blog"
import UserProfile from "./User";
import Menu from "./Menu";
import { getData } from "./Utils"

class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      site : 0,
      user : null,
      loaded: false,
      placeholder: "Ładowanie...",
      user_data: [],
      teacher: true
    };
  }

  selectSite = (i) => {
    this.setState({site: i});
  }

  updateState = (state_var, value) => {
    let state = this.state;
    state[state_var] = value;
    this.setState(state);
  }

  initWebsite= () => {
    const {teacher} = this.state.user_data;
    const start_site = teacher ? 1 : 11;
    this.setState({teacher: teacher, site: start_site});
  }

  endEditProfile = () => {
    getData('/api/my_profile/','', 'user_data', 'loaded', 'placeholder', this, this.initWebsite);
  }

  componentDidMount() {
    getData('/api/my_profile/','', 'user_data', 'loaded', 'placeholder', this, this.initWebsite);
  }

  render(){
    const endpoints = ["api/project/", "api/ta/"]

    const { loaded, placeholder} = this.state;
    if (!loaded)
      return <p>{placeholder}</p>;

    const { user_data, teacher } = this.state;
    const start_site = teacher ? 1 : 11;
    const sel_site = this.state.site ? this.state.site : start_site;
    const refresh_text = this.state.refresh ?
      'Refresh True' :
      'Refresh False';
    const content = <Content/>;
    const teaching = <Teaching selectSite={this.selectSite}/>;
    const students = <Students/>;
    const class_learning = <Learning/>;
    const blog = <Blog teacher={teacher} user_data={user_data}/>;
    const self_learning = <p>W przygotowaniu</p>;
    const repeat = <p>W przygotowaniu</p>;
    const user_profile = <UserProfile endEdit={this.endEditProfile}/>;

    let disp_site = <p>Nothing to display</p>;

    switch(sel_site) {
      case 1:
          disp_site = teaching;
          break;
      case 2:
          disp_site = content;
          break;
      case 3:
          disp_site = students;
          break;
      case 4:
          disp_site = blog;
          break;
      case 11:
          disp_site = class_learning;
          break;
      case 12:
          disp_site = self_learning;
          break;
      case 13:
          disp_site = repeat;
          break;
      case 99:
          disp_site = user_profile;
          break;
      default:
          disp_site = <p>Nic do wyswietlenie</p>;
        };

    return (
      <React.Fragment>
        <Menu selectSite={this.selectSite} updateState={this.updateState} teacher={teacher} user_data={user_data}/>
        {disp_site}
        <svg viewBox="0 0 8 8" className="icon"><use xlinkHref="#heart"></use></svg>
      </React.Fragment>
    );

  }
}


const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;
