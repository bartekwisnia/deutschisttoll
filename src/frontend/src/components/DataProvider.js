import React, { Component } from "react";
import PropTypes from "prop-types";
import { getData } from "./Utils"

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

class DataProvider extends Component {
  static propTypes = {
    endpoint: PropTypes.string.isRequired,
    render: PropTypes.func.isRequired
  };

  constructor(props){
    super(props);
    this.state = {
      data: [],
      loaded: false,
      placeholder: "Ładuje...",
      refresh: false
      };
  }

  loadMore = () => {
    const data = this.state.data;
    const url = data.next;
    fetch(url)
      .then(response => {
        if (response.status !== 200) {
          return this.setState({ placeholder: "Something went wrong" });
        }
        return response.json();
      })
      .then(new_data => {
        data.results = data.results.concat(new_data.results);
        data.previous = new_data.previous;
        data.next = new_data.next;
        this.setState({ data: data, loaded: true });
      }
      );
  }

  handleDelete = id => {
    var csrftoken = getCookie('csrftoken');
    const refresh = this.state.refresh;
    const conf = {
      method: "delete", headers: new Headers({ "Content-Type": "application/json", 'X-CSRFToken': csrftoken})
    };
    fetch(this.props.endpoint+id , conf).then(response => console.log(response)).then(() => {this.setState({refresh: !refresh});});
  };

  handleUpdate = (id, idx, fields) => {
    console.log(fields);
    const{endpoint} = this.props;
    const formData = new FormData();
    Object.keys(fields).map((key, index) => {
        formData.append(key, fields[key])
    });

    const csrftoken = getCookie('csrftoken');
    const conf = {
      method: "put",
      body: formData,
      headers: new Headers({'X-CSRFToken': csrftoken})
    };
    console.log(formData);
    fetch(endpoint+id, conf)
    .then(response => console.log(response))
    .then(() => {
      let {data} = this.state;
      Object.keys(fields).map((key, index) => {
          // console.log(data.results[idx][key]);
          data.results[idx][key]=fields[key];
          this.setState({'data': data})
      });
    });
  };

  componentDidMount() {
    getData(this.props.endpoint, this.props.options, 'data', 'loaded', 'placeholder', this);
  }

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):

    if (this.props.refresh !== prevProps.refresh) {
      console.log("update data provider");
      this.setState({refresh: this.props.refresh});
      getData(this.props.endpoint, this.props.options, 'data', 'loaded', 'placeholder', this);
    }
  }

  render() {
    const { data, loaded, placeholder } = this.state;
    return loaded ? (
      <React.Fragment>
        {this.props.render(data, this.loadMore, this.handleUpdate)}
      </React.Fragment>
    ) : <p>{placeholder}</p>;
  }
}
export default DataProvider;
