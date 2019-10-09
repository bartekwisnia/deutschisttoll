import React, { Component } from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import PropTypes from "prop-types";

import DataProvider from "./DataProvider";

class Menu extends React.Component{
  // static propTypes = {
  //   endpoint: PropTypes.string.isRequired
  // };

getUserName(){
  const { first_name, last_name, username } = this.props.user_data.user;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
}


  render(){
    const { teacher, user_data } = this.props;
    const teacher_button = user_data.teacher ?
      <a className="button" onClick={() => this.props.updateState('teacher', !teacher)}>
        {teacher ? 'nauczyciel' : 'uczeń'}
      </a> :'uczeń'

    const teacher_menu = <div className="navbar-start">
                          <div className="navbar-item">
                            <Link to="/teaching" className="button is-primary">Zaplanuj zajęcia</Link>
                          </div>
                          <div className="navbar-item">
                            <Link to="/content" className="button is-info">Przygotuj materiały</Link>
                          </div>
                          <div className="navbar-item">
                            <Link to="/students" className="button is-danger">Uczniowie</Link>
                          </div>
                          <div className="navbar-item">
                            <Link to="/blog" className="button is-success">Blog</Link>
                          </div>
                        </div>

    const student_menu = <div className="navbar-start">
                          <div className="navbar-item">
                            <Link to="/learning" className="button is-primary">
                              Zajęcia z nauczycielem
                            </Link>
                          </div>
                          <div className="navbar-item">
                            <Link to="/self-learning" className="button is-info">
                              Dla samouków
                            </Link>
                          </div>
                          <div className="navbar-item">
                            <Link to="/blog" className="button is-success">Blog</Link>
                          </div>
                        </div>

    const navbar_start = teacher ? teacher_menu : student_menu;

    return(
      <nav className="navbar is-transparent is-spaced">
        <div className="container">
        <div className="navbar-menu">
          <div className="navbar-brand">
            <div className="navbar-item">
              <Link to="/"><img src="../../../static/logo/LogoWhiteBanner3_1.png" width="84" height="28" alt="Deutsch ist toll!"/></Link>
            </div>
            <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false">
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
              <span aria-hidden="true"></span>
            </a>
          </div>
          {navbar_start}
          <div className="navbar-end">
            <div className="navbar-item">
              {teacher_button}
            </div>
            <div className="navbar-item">
              <Link to="/user" className="button">
                {this.getUserName()}
              </Link>
            </div>
            <div className="navbar-item">
              <a className="button is-dark" href="/logout">
                Wyloguj
              </a>
            </div>
          </div>

        </div>
        </div>
      </nav>
    );
  }
}

class MenuPub extends React.Component{
  // static propTypes = {
  //   endpoint: PropTypes.string.isRequired
  // };

  render(){
    return(
      <nav className="navbar is-transparent is-spaced">
        <div className="container">
          <div className="navbar-menu">
            <div className="navbar-brand">
              <div className="navbar-item">
                <Link to="/"><img src="../../../static/logo/LogoWhiteBanner3_1.png" width="84" height="28" alt="Deutsch ist toll!"/></Link>
              </div>
              <a role="button" class="navbar-burger" aria-label="menu" aria-expanded="false">
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
              </a>
            </div>
            <div className="navbar-start">
              <div className="navbar-item">
                <Link className="button is-primary" to="/blog">Blog</Link>
              </div>
              <div className="navbar-item">
                <Link className="button is-warning" to="/kontakt">Kontakt</Link>
              </div>
            </div>
            <div className="navbar-end">
              <div className="navbar-item">
                <a className="button is-dark" href="/login">
                  Zaloguj
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Menu;

export {
  MenuPub,
}
