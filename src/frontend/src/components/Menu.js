import React, { Component } from "react";
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
                            <a className="button is-primary" onClick={() => this.props.selectSite(1)}>
                              Zaplanuj zajęcia
                            </a>
                          </div>

                          <div className="navbar-item">
                            <a className="button is-info" onClick={() => this.props.selectSite(2)}>
                              Przygotuj materiały
                            </a>
                          </div>
                          <div className="navbar-item">
                            <a className="button is-danger" onClick={() => this.props.selectSite(3)}>
                              Uczniowie
                            </a>
                          </div>
                          <div className="navbar-item">
                            <a className="button is-success" onClick={() => this.props.selectSite(4)}>
                              Blog
                            </a>
                          </div>
                        </div>

    const student_menu = <div className="navbar-start">
                          <div className="navbar-item">
                            <a className="button is-primary" onClick={() => this.props.selectSite(11)}>
                              Zajęcia z nauczycielem
                            </a>
                          </div>
                          <div className="navbar-item">
                            <a className="button is-info" onClick={() => this.props.selectSite(12)}>
                              Dla samouków
                            </a>
                          </div>
                          <div className="navbar-item">
                            <a className="button is-danger" onClick={() => this.props.selectSite(13)}>
                              Powtórz słownictwo
                            </a>
                          </div>
                        </div>

    const navbar_start = teacher ? teacher_menu : student_menu;

    return(
      <nav className="navbar is-transparent is-spaced">
        <div className="container">
        <div className="navbar-menu">
          <div className="navbar-brand">
            <a className="navbar-item" onClick={() => this.props.selectSite(0)}>
                <img src="../../../static/logo/LogoWhiteBanner3_1.png" width="84" height="28" alt="Deutsch ist toll!"/>
            </a>
          </div>
          {navbar_start}
          <div className="navbar-end">
            <div className="navbar-item">
              {teacher_button}
            </div>
            <div className="navbar-item">
              <a className="button" onClick={() => this.props.selectSite(99)}>
                {this.getUserName()}
              </a>
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
            <a className="navbar-item" onClick={() => this.props.selectSite(0)}>
              <img src="../../../static/logo/LogoWhiteBanner3_1.png" width="84" height="28" alt="Deutsch ist toll!"/>
            </a>
          </div>
          <div className="navbar-start">
            <div className="navbar-item">
              <a className="button is-success" onClick={() => this.props.selectSite(2)}>
                Blog
              </a>
            </div>
            <div className="navbar-item">
              <a className="button is-danger" onClick={() => this.props.selectSite(1)}>
                Kontakt
              </a>
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
