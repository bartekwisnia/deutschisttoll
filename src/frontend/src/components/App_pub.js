import React from "react";
import ReactDOM from "react-dom";
import { MenuPub } from "./Menu"
import Blog from "./Blog"
import Contact from "./Contact"

class AppPub extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      site : 0,
      loaded: false,
      placeholder: "Ładowanie...",
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

  componentDidMount() {
  }

  render(){
    const {placeholder, site} = this.state;
    const loaded = true;
    let disp_site = <p>Nothing to display</p>;
    const sel_site = site ? site : 1;
    switch(sel_site) {
      case 1:
          disp_site = <Contact/>;
          break;
      case 2:
          disp_site = <Blog/>;
          break;
      default:
          disp_site = <p>Nothing to display</p>;
        };


    return loaded ? (
      <React.Fragment>
        <MenuPub selectSite={this.selectSite}/>
        {disp_site}
      </React.Fragment>
    ) : <p>{placeholder}</p>;

  }
}




const wrapper = document.getElementById("app_pub");
wrapper ? ReactDOM.render(<AppPub />, wrapper) : null;
