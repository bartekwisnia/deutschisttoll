import React, { Component } from "react";
import PropTypes from "prop-types";
import key from "weak-key";


class ExercisesDetail extends Component {
  // static propTypes = {
  //     data: PropTypes.array.isRequired
  //   };


  render() {
    const { data, model_config } = this.props;
    const type_choices = model_config.type_choices;

    const categories = data.categories ? data.categories.split(",") : [];
    const categories_items = categories.map((item, index) =>
      <span key={index} className="tag is-info">{item}</span>);


    console.log(data)
    return data ? (
        <div className="column is-3 is-fullheight is-grey-lighter">
          <h3 className="title is-5 is-spaced">
            <strong>Edytuj ćwiczenie:</strong>
          </h3>

          <div className="container">
            <h4 className="title is-2 has-text-centred">
              {data.title}
            </h4>
            <h5 className="subtitle is-4 has-text-centred">
              {type_choices[data.type]}
            </h5>
            <figure className="image is-128x128">
              <img src={data.picture} alt="Image to describe"/>
            </figure>
            <div className="tags">
              {categories_items}
            </div>
          </div>
        </div>
      ) : (
        <div className="column is-3 is-fullheight is-grey-lighter">
          <h3 className="title has-text-centred">
            Brak ćwiczenia o tym numerze
          </h3>
        </div>
        );
  }
}
export default ExercisesDetail;
