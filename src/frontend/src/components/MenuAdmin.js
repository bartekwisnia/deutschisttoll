import React, { Component } from "react";
import PropTypes from "prop-types";

import DataProvider from "./DataProvider";

class Menu extends React.Component{
  // static propTypes = {
  //   endpoint: PropTypes.string.isRequired
  // };

getUserName(data){
  const first_name = data.user.first_name;
  const last_name = data.user.last_name;
  const username = data.user.username;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
}


  render(){
    return(
      <nav className="navbar is-transparent is-spaced">
        <div className="container">
        <div className="navbar-menu">

          <div className="navbar-brand">
            <div className="navbar-item">
              <a className="button is-warning" href="http://127.0.0.1:8000/">
                {/* <img src="" alt="START" width="112" height="28"/> */}
                START
              </a>
            </div>
          </div>

          <div className="navbar-start">
            <div className="navbar-item">
              <a className="button is-primary" onClick={() => this.props.onClick(0)}>
                Moje lekcje
              </a>
            </div>
            <div className="navbar-item">
              <a className="button is-info" onClick={() => this.props.onClick(1)}>
                Moje ćwiczenia
              </a>
            </div>
            <div className="navbar-item">
              <a className="button is-danger" onClick={() => this.props.onClick(2)}>
                Moi uczniowie
              </a>
            </div>
          </div>

          <div className="navbar-end">

            <div className="navbar-item">
              <DataProvider endpoint="/api/my_profile/"
                            render={(data) => this.getUserName(data)}
                            refresh={false}/>
            </div>
            <div className="navbar-item">
              <a className="button is-dark" href="http://127.0.0.1:8000/logout">
                Wyloguj
              </a>
            </div>
          </div>

        </div>
        </div>
      </nav>
      <aside class="menu">
        <p class="menu-label">
          Uczniowie
        </p>
        <ul class="menu-list">
          <li><a>Nowy uczeń</a></li>
          <li><a></a></li>
        </ul>
        <p class="menu-label">
          Kursy
        </p>
        <p class="menu-label">
          Lekcje
        </p>
        <p class="menu-label">
          Ćwiczenia
        </p>


        <li><a onClick={() => this.props.onClick(0)}>Nowa lekcja</a></li>
        <ul class="menu-list">
          <li><a>Team Settings</a></li>
          <li>
            <a class="is-active">Manage Your Team</a>
            <ul>
              <li><a>Members</a></li>
              <li><a>Plugins</a></li>
              <li><a>Add a member</a></li>
            </ul>
          </li>
          <li><a>Invitations</a></li>
          <li><a>Cloud Storage Environment Settings</a></li>
          <li><a>Authentication</a></li>
        </ul>
        <p class="menu-label">
          Transactions
        </p>
        <ul class="menu-list">
          <li><a>Payments</a></li>
          <li><a>Transfers</a></li>
          <li><a>Balance</a></li>
        </ul>
      </aside>



    );
  }
}

export default Menu;
