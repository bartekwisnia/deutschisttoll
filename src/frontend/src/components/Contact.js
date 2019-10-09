import React, { Component } from "react";
import { Icon, SearchBar, Tile } from './Components';
import { getData, getCookie } from "./Utils"

import { ExerciseList } from "./Exercises";

class Contact extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){
    // console.log("render Blogs site");

      const logo = <figure className="image is-4by3">
                          <img src="../../../static/logo/LogoBig4_3.png" alt="Deutsch ist toll!"/>
                        </figure>


      const photo = <figure className="image is-3by4">
                          <img src="../../../static/Kamila2_34.jpg" alt="Moja fotografia"/>
                        </figure>


      const address = <article className="message is-dark">
                        <div className="message-header">
                          <p>Adres</p>
                        </div>
                        <div className="message-body has-text-centered">
                          al. Rzeczypospolitej 24B/3
                          <br/>
                          02-972 Warszawa
                        </div>
                      </article>

      const phone = <article className="message is-danger">
                        <div className="message-header">
                          <p>Telefon</p>
                        </div>
                        <div className="message-body has-text-centered">
                          +48 606 317 350
                        </div>
                      </article>

      const email = <article className="message is-warning">
                        <div className="message-header">
                          <p>e-mail</p>
                        </div>
                        <div className="message-body has-text-centered">
                          kamila-s@go2.pl
                        </div>
                      </article>

      const about = <React.Fragment>
                      <div className="level" style={{paddingTop: 20}}>
                        <div className="level-item">
                          <h1 className="title is-3 has-text-centered">
                            Herzlich Willkommen!
                          </h1>
                        </div>
                      </div>
                      <div className="columns" style={{paddingTop: 20}}>
                        <div className="column is-4 is-offset-4">
                          <figure className="image is-3by4">
                              <img className="is-rounded" src="../../../static/Kamila2_34.jpg" alt="Moja fotografia"/>
                          </figure>
                        </div>
                      </div>
                      <div className="level" style={{paddingTop: 20, marginBottom: 5}}>
                        <div className="level-item">
                          <h1 className="title is-4">Kamila Wiśniewska</h1>

                        </div>
                      </div>
                      <div className="level" style={{paddingTop: 0}}>
                        <div className="level-item">
                          <h2 className="subtitle is-6">lektorka i autorka strony</h2>
                        </div>
                      </div>
                      <div className="content" style={{paddingLeft: 40, paddingRight: 40}}>
                          <p>
                          Jestem absolwentką wydziału neofilologii Uniwersytetu Warszawskiego. Od blisko 5 lat uczę języka niemieckiego prywatnie oraz dla szkół językowych.
                          Spędziłam 4 lata pracując oraz ucząc się w Niemczech, wiedzę którą tam zdobyłam chętnie wykorzystuję na lekcjach.
                          Prowadzę zajęcia dla osób w każdym wieku i na każdym poziomie zaawansowania.
                          Program dopasowuję indywidualnie dla każdego ucznia.
                          Lekcje odbywają się na żywo lub online!
                          </p>
                          <p>Serdecznie zapraszam!<br/>Kamila</p>
                      </div>
                    </React.Fragment>



      return  <React.Fragment>
      <section className="section columns" style={{paddingTop: 20}}>
      <div className="column is-8 is-offset-2">
        <div className="tile is-ancestor is-vertical">
          <div className="tile">

            <div className="tile is-6 has-background-yellow" style={{paddingTop: 100}}>
              <div className="tile is-parent">
                <div className="tile is-child">
                  {logo}
                </div>
              </div>
            </div>

            <div className="tile">
              <div className="tile is-parent">
                <div className="tile is-child">
                  {about}
                </div>
              </div>
            </div>

          </div>
        <div className="tile">

          <div className="tile is-parent">
            <div className="tile is-child">
              {address}
            </div>
          </div>

          <div className="tile is-parent">
            <div className="tile is-child">
              {phone}
            </div>
          </div>

          <div className="tile is-parent">
            <div className="tile is-child">
              {email}
            </div>
          </div>

        </div>

      </div>
    </div>
  </section>
  </React.Fragment>
  }
}



class ContactSmallAbout extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){
      return  <React.Fragment>
                      <div className="columns" style={{marginBottom: "0.5rem"}}>
                        <div className="column is-4 is-offset-4">
                          <figure className="image is-3by4">
                              <img className="is-rounded" src="../../../static/Kamila2_34.jpg" alt="Moja fotografia"/>
                          </figure>
                        </div>
                      </div>
                      <div className="level" style={{paddingTop: "0.5rem", marginBottom: "0.5rem"}}>
                        <div className="level-item">
                          <h1 className="title is-4">Kamila Wiśniewska</h1>

                        </div>
                      </div>
                      <div className="level" style={{paddingTop: "0.0rem"}}>
                        <div className="level-item">
                          <h2 className="subtitle is-6">lektorka i autorka strony</h2>
                        </div>
                      </div>
                      <div className="content" style={{paddingLeft: "0.5rem", paddingRight: "0.5rem"}}>
                          <p>
                          Absolwentka wydziału neofilologii Uniwersytetu Warszawskiego. Od blisko 5 lat uczę języka niemieckiego prywatnie oraz dla szkół językowych.
                          </p>
                          <p>Serdecznie zapraszam na moje lekcje!<br/>Kamila</p>
                      </div>
                    </React.Fragment>
  }
}


class ContactSmall extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){

    const my_email = "kamila-s";
    const my_domain = "go2.pl";

    return  <article className="message is-primary" style={{margin: "0.75rem"}}>
                      <div className="message-header">
                        <p>Dane kontaktowe</p>
                      </div>
                      <div className="message-body has-text-centered">
                        <p>al. Rzeczypospolitej 24B/3 02-972 Warszawa</p>
                        <p>+48 606 317 350</p>
                        <a href={"mailto:"+my_email+"@"+my_domain}>{my_email+"@"+my_domain}</a>
                      </div>
                    </article>
}
}


export default Contact;

export {
  ContactSmallAbout, ContactSmall
}
