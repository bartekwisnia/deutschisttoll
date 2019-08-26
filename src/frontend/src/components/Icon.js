import React, { Component } from "react";


class Icon extends Component {

  handleIconMouseOver = (e) => {
    const {active, hover_class, active_class, inactive_class} = this.props;
    const icon_class = active ? active_class: (inactive_class ? inactive_class : active_class + " icon-inactive")
    e.currentTarget.className = hover_class ? hover_class : icon_class + " icon-hover";
  };

  handleIconMouseLeave = (e) => {
    const {active, active_class, inactive_class} = this.props;
    e.currentTarget.className = active ? active_class: (inactive_class ? inactive_class : active_class + " icon-inactive");
  };

  render() {
    const {active, active_class, inactive_class} = this.props;
    const icon_class = active ? active_class: (inactive_class ? inactive_class : active_class + " icon-inactive")
    return (
      <span className="img-icon">
        <i className={icon_class} onClick={this.props.handleClick} onMouseOver={this.handleIconMouseOver} onMouseLeave={this.handleIconMouseLeave}></i>
      </span>
    );
  }
};

export default Icon;
