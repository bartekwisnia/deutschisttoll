import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter as Router, Switch, Route, Link, Redirect, withRouter} from "react-router-dom";
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
      user : null,
      loaded: false,
      placeholder: "Ładowanie...",
      user_data: [],
      teacher: true,
      redirect: false,
    };
  }

  updateState = (state_var, value) => {
    let state = this.state;
    state[state_var] = value;
    this.setState(state);
  }

  initWebsite= () => {
    const {teacher} = this.state.user_data;
    this.setState({teacher: teacher, loaded: true});
  }

  redirectHome = (history) => {
     history.push('/');
  }

  endEditProfile = (history) => {
    getData('/api/my_profile/','', 'user_data', 'loaded', 'placeholder', this, () => this.redirectHome(history));
  }

  componentDidMount() {
    getData('/api/my_profile/','', 'user_data', '', 'placeholder', this, this.initWebsite);
  }

  render(){
    const { loaded, placeholder} = this.state;
    if (!loaded)
      return <p>{placeholder}</p>;

    const { user_data, teacher, redirect } = this.state;
    const refresh_text = this.state.refresh ?
      'Refresh True' :
      'Refresh False';
    const start = teacher ? '/teaching' : '/learning';
    const content = teacher ? ({ match }) => <Content match={match}/> : <Redirect to={start} />;
    const teaching = teacher ? ({ match }) => <Teaching match={match}/> : <Redirect to={start} />;
    const students = teacher ? ({ match }) => <Students match={match}/> : <Redirect to={start} />;
    const learning = !teacher ? ({ match }) => <Learning match={match}/> : <Redirect to={start} />;
    const blog = ({ match }) => <Blog match={match} teacher={teacher} user_data={user_data}/>;
    const self_learning = !teacher ?({ match }) => <p>W przygotowaniu</p> : <Redirect to={start} />;
    const repeat = !teacher ?({ match }) => <p>W przygotowaniu</p> : <Redirect to={start} />;
    const user_edit = withRouter(({ history, match }) => <UserProfile endEdit={()=>this.endEditProfile(history)} match={match}/>);


    return (
      <Router>
        <div>
        <Menu selectSite={this.selectSite} updateState={this.updateState} teacher={teacher} user_data={user_data}/>

        <Switch>
          <Route path="/teaching">
            {teaching}
          </Route>
          <Route path="/content">
            {content}
          </Route>
          <Route path="/students">
            {students}
          </Route>
          <Route path="/blog">
            {blog}
          </Route>
          <Route path="/learning">
            {learning}
          </Route>
          <Route path="/self-learning">
            {self_learning}
          </Route>
          <Route path="/user">
            {user_edit}
          </Route>
          <Route path="/">
            <Redirect to={start} />
          </Route>
        </Switch>
        <svg viewBox="0 0 8 8" className="icon"><use xlinkHref="#heart"></use></svg>
        </div>
      </Router>
    );

  }
}


const wrapper = document.getElementById("app");
wrapper ? ReactDOM.render(<App />, wrapper) : null;
