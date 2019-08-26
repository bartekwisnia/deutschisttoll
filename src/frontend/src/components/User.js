import React, { Component } from "react";
import { getData, getCookie } from "./Utils"

class UserProfile extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      endpoint :   "/api/my_profile/",
      data : {},
      loaded: false,
      placeholder: "Ładowanie...",
    };
  }

  handleChange = e => {
    const { data } = this.state;
    const { user } = data;
    user[e.target.name] = e.target.value;
    data['user'] = user;
    this.setState({ data: data });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { data, endpoint } = this.state;
    const { teacher, user} = data;
    const formData = new FormData();
    const method = "put";
    formData.append('teacher', teacher);
    formData.append('user', user);
    const url = endpoint;
    const csrftoken = getCookie('csrftoken');
    const send_data = {'teacher': teacher, 'user': user};
    const conf = {
      method: method,
      body: JSON.stringify(send_data),
      headers: new Headers({'X-CSRFToken': csrftoken,
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                            })
    };
    fetch(url, conf)
    .then(response => console.log(response))
    .then(() =>{this.props.endEdit();});
  };

  getUserName(user_profile){
  const { first_name, last_name, username } = user_profile;
  return((first_name || last_name) ? first_name + " " + last_name : username);
  // return("user");
  }

  makeUserName(first_name, last_name, username){
  return((first_name || last_name) ? first_name + " " + last_name : username);
  }

  componentDidMount() {
    const {endpoint} = this.state;
    getData(endpoint, '', 'data', 'loaded', 'placeholder', this,);
  }

  render(){
    const { loaded, placeholder} = this.state;
    console.log("My profile render")
    if (!loaded)
      return <p>{placeholder}</p>;

    const { data} = this.state;
    console.log("My profile loaded");
    console.log(data);
    const {user} = data;

    return (<React.Fragment>
            <div className="column is-8 is-offset-2">
              <form onSubmit={this.handleSubmit} className="box">
                <div className="column is-6 is-offset-3">
                  <div className="level">
                    <h2 className="level-item subtitle">Edytuj profil</h2>
                  </div>
                  <div className="field">
                    <div className="control">
                      <input
                        className="input title is-6 has-text-centred"
                        type="text"
                        name="username"
                        autoFocus=""
                        placeholder="Nazwa użytkownika"
                        onChange={this.handleChange}
                        value={user.username}
                        required
                      />
                    </div>
                  </div>
                  <div className="field is-horizontal">
                    <div className="field-body">
                      <div className="field">
                        <div className="control">
                          <input
                            className="input title is-6 has-text-centred"
                            type="text"
                            name="first_name"
                            autoFocus=""
                            placeholder="Imię"
                            onChange={this.handleChange}
                            value={user.first_name}
                            required
                          />
                        </div>
                      </div>
                      <div className="field">
                        <div className="control">
                          <input
                            className="input title is-6 has-text-centred"
                            type="text"
                            name="last_name"
                            autoFocus=""
                            placeholder="Nazwisko"
                            onChange={this.handleChange}
                            value={user.last_name}
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control">
                      <input
                        className="input title is-6 has-text-centred"
                        type="text"
                        name="email"
                        autoFocus=""
                        placeholder="email"
                        onChange={this.handleChange}
                        value={user.email}
                        required
                      />
                    </div>
                  </div>
                  <div className="level">
                    <div className="level-item has-text-centered">
                      <a className="button is-warning" href="/change-password/">Zmień hasło</a>
                    </div>
                  </div>
                  <div className="level">
                      <div className="level-item has-text-centered">
                          <button type="submit" className="button is-info" onClick={this.handleSubmit}>Gotowe!</button>
                      </div>
                  </div>
                </div>
              </form>
            </div>
         </React.Fragment>);
  }
}

export default UserProfile;
