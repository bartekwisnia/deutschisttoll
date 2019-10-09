import React from "react";
import PropTypes from "prop-types";
import DataProvider from "./DataProvider";
import key from "weak-key";
import { Icon, SearchBar } from './Components';

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}


class Students extends React.Component{

  constructor(props){
    super(props);
    this.state = {
      endpoint: "api/student/",
      title: "",
      type: "",
      categories: "",
      placeholder: "Ładuje...",
      model_config: [],
      detail_view: 0, // 0-no, 1-detail, 2-create
      detail_id: 0,
      loaded: true,
      refresh: false,
      query: "",
      colour: "is-danger",
    };
  }

  handleDelete = id => {
    var csrftoken = getCookie('csrftoken');
    const refresh = this.state.refresh;
    const conf = {
      method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
    };
    if (confirm("Czy na pewno chcesz usunąć tego ucznia?"))
      fetch(this.state.endpoint+id , conf).then(response => console.log(response)).then(() => {this.setState({refresh: !refresh});});
  };

  handleDisplay = (id) => {
    // // console.log("change display:" + view + ',' + id)
    let view = id ? 1 : 2;
    this.setState({detail_id: id, detail_view: view});
  };

  handleChange = e => {
    // const refresh = this.state.refresh;
    this.setState({ [e.target.name]: e.target.value});
    // console.log(e.target.name);
    this.forceRefresh();
    // this.setState({ [e.target.name]: e.target.value, refresh: !refresh });
  };

  endEdit = () => {
    this.setState({detail_view: 0});
  };

  forceRefresh = () => {
    // console.log("force refresh");
    const refresh = this.state.refresh;
    this.setState({ refresh: !refresh });
  };

  render(){
    // console.log("render");
    const { endpoint, loaded, model_config, refresh, placeholder, query,
      colour, detail_view, detail_id} = this.state;
    // // console.log("render:" + detail_view + ',' + detail_id)

    const student_form =
    <div className="column is-8 is-offset-2">
      <StudentForm key={"student_form"}
        endpoint={endpoint}
        loaded={loaded}
        model_config={model_config}
        endEdit={this.endEdit}
      />;
    </div>

    const student_list =
     <div className="column is-4 is-offset-4">
       <div className="level">
           <div className="level-item has-text-centered">
               <a className="button is-info" onClick={() => this.handleDisplay(0)} >Nowy uczeń</a>
           </div>
       </div>
       <DataProvider endpoint={endpoint}
                   options={{query: query, limit: 10}}
                   render={(data, loadMore, handleUpdate) => <StudentsList data={data}
                   loadMore = {loadMore}
                   handleUpdate = {handleUpdate}
                   handleDelete={(id) => this.handleDelete(id)}
                   handleSelect={(id) => this.handleDisplay(id)}
                   />}
                   refresh={refresh}
                   />
    </div>


    let disp_detail_site = <p>Nothing to display</p>;
    switch(detail_view) {
      case 0:
          disp_detail_site = student_list;
          break;
      case 2:
          disp_detail_site = student_form;
          break;
      default:
          disp_detail_site = student_list;
        };

    return loaded ? (
        <React.Fragment>
          <section className={"hero hero-bg-img is-primary"}>
            <div className="hero-body">
              <div className="container">
                <h1 className="title">Moi uczniowie</h1>
                <div className="button is-static">Lista i dodawanie uczniów</div>
              </div>
            </div>
          </section>
          {/* <hr className="hr"/> */}
          <section className="level" style={{paddingTop: 6}}>
              {disp_detail_site}
          </section>
        </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}

class StudentsList extends React.Component {
  // static propTypes = {
  //     data: PropTypes.array.isRequired
  //   };

  render() {
    const {data, read_only} = this.props;
    const results = data.results;
    // console.log(results);
    if (results.length) {
      return (
        <section>
          <table className="table is-striped is-fullwidth">
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map((el, index) => (
                <tr key={el.id}>
                    <td key={el.id+"-username"}><a onClick={() => this.props.handleSelect(el.id)}>{el.user.username}</a></td>
                    <td key={el.id+"-first_name"}>{el.user.first_name}</td>
                    <td key={el.id+"-last_name"}>{el.user.last_name}</td>
                    <td key={el.id+"-email"}>{el.user.email}</td>
                    <td key={el.id+"-delete"}>
                      <Icon active={true} active_class="essentials16-garbage-1"  handleClick = {() => this.props.handleDelete(el.id)}/>
                    </td>
                </tr>
              )
              )}
            </tbody>
          </table>
          <div className="has-text-centered">
            <a className="button is-info" onClick={this.props.loadMore} >Więcej</a>
          </div>


        </section>
      );
    }
    else
      return(<h1>Nie masz jeszcze uczniów</h1>);
  }
}


class StudentForm extends React.Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: {username: "", first_name: "", last_name: "", email: ""},
      data_loaded: false,
      config_loaded: false,
      exercises_loaded: false,
      placeholder: "Ładowanie danych...",
      refresh: false,
      };
  }

  handleChange = e => {
    const data = this.state.data;
    data[e.target.name] = e.target.value;
    this.setState({ data: data });
  };

  handleSubmit = e => {

// <QueryDict: {'user.username': ['test59'], 'user.password': [''], 'user.first_name': ['test1'], 'user.last_name': ['test2'], 'user.email': ['test@user2.pl'], 'teacher_id': ['']}>

    e.preventDefault();
    const {endpoint} = this.props;
    const {data} = this.state;
    const {username, first_name, last_name, email} = data;

    const method = "post";
    const url = endpoint;
    const csrftoken = getCookie('csrftoken');
    const send_data = {'user': {'username': username, 'first_name': first_name, 'last_name': last_name, 'email': email}, 'teacher': false, 'students': []};
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
    .then(() => {
      this.props.endEdit();
    });
  };

  render() {
    const {data, placeholder} = this.state;
    const loaded = true;
    const {id, model_config } = this.props
    Object.keys(data).map(function(key, index) {
      data[key] = data[key] ? data[key] : "";
    });
    const {username, first_name, last_name, email} = data;

    return loaded ? (
    <React.Fragment>
      <nav class="breadcrumb" aria-label="breadcrumbs">
        <ul>
          <li><a onClick={this.props.endEdit}>Uczniowie</a></li>
          <li class="is-active">Nowy uczeń</li>
        </ul>
      </nav>
      <section className="container">
          <form onSubmit={this.handleSubmit} className="box">
            <div className="level">
              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control is-expanded">
                      <input
                        className="input title is-4 has-text-centred"
                        type="text"
                        name="username"
                        autoFocus=""
                        placeholder="Nazwa użytkownika"
                        onChange={this.handleChange}
                        value={username}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="level">
              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control is-expanded">
                      <input
                        className="input title is-4 has-text-centred"
                        type="text"
                        name="first_name"
                        autoFocus=""
                        placeholder="Imię"
                        onChange={this.handleChange}
                        value={first_name}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="level">
              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control is-expanded">
                      <input
                        className="input title is-4 has-text-centred"
                        type="text"
                        name="last_name"
                        autoFocus=""
                        placeholder="Nazwisko"
                        onChange={this.handleChange}
                        value={last_name}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="level">
              <div className="field is-horizontal">
                <div className="field-body">
                  <div className="field">
                    <div className="control is-expanded">
                      <input
                        className="input title is-4 has-text-centred"
                        type="text"
                        name="email"
                        autoFocus=""
                        placeholder="Email"
                        onChange={this.handleChange}
                        value={email}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="level">
                <div className="level-item has-text-centered">
                    <button type="submit" className="button is-info">Gotowe!</button>
                </div>
            </div>
          </form>
      </section>
    </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}

export default Students;

// <div className="column is-7 is-fullheight is-grey-lighter">
//   {disp_detail_site}
// </div>
