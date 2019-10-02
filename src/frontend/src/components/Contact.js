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

      const logo = <figure class="image is-4by3">
                          <img src="../../../static/logo/LogoBig4_3.png" alt="Deutsch ist toll!"/>
                        </figure>


      const photo = <figure class="image is-3by4">
                          <img src="../../../static/Kamila2_34.jpg" alt="Moja fotografia"/>
                        </figure>


      const address = <article class="message is-dark">
                        <div class="message-header">
                          <p>Adres</p>
                        </div>
                        <div class="message-body has-text-centered">
                          al. Rzeczypospolitej 24B/3
                          <br/>
                          02-972 Warszawa
                        </div>
                      </article>

      const phone = <article class="message is-warning">
                        <div class="message-header">
                          <p>Telefon</p>
                        </div>
                        <div class="message-body has-text-centered">
                          +48 606 317 350
                        </div>
                      </article>

      const email = <article class="message is-danger">
                        <div class="message-header">
                          <p>e-mail</p>
                        </div>
                        <div class="message-body has-text-centered">
                          kamila-s@go2.pl
                        </div>
                      </article>

      const about = <div class="card">
                      <div class="card-content">
                        <div class="media">
                          <div class="media-content">
                            <p class="title is-4">Kamila Wiśniewska</p>
                            <p class="subtitle is-6">lektorka i autorka strony</p>
                          </div>
                        </div>
                        <div class="content">
                          <p>
                          Jestem absolwentką wydziału neofilologii Uniwersytetu Warszawskiego. Od blisko 5 lat uczę języka niemieckiego prywatnie oraz dla szkół językowych.
                          Spędziłam 4 lata pracując oraz ucząc się w Niemczech, wiedzę którą tam zdobyłam chętnie wykorzystuję na lekcjach.
                          Prowadzę zajęcia dla osób w każdym wieku i na każdym poziomie zaawansowania.
                          Program dopasowuję indywidualnie dla każdego ucznia.
                          Lekcje odbywają się na żywo lub online!
                          </p>
                          <p>Serdecznie zapraszam!<br/>Kamila</p>
                        </div>
                      </div>
                    </div>



      return  <section className="section columns" style={{paddingTop: 20}}>
      <div className="column is-8 is-offset-2">
        <div className="tile is-ancestor">
          <div className="tile is-vertical">
            <div className="tile">
                <div className="tile is-parent is-4">
                  <div className="tile is-child">
                    {logo}
                  </div>
                </div>
                <div className="tile is-parent is-3">
                  <div className="tile is-child">
                    {photo}
                  </div>
                </div>
              <div className="tile is-parent">
                <div className="tile is-child">
                  {about}
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
      </div>

              </section>
  }
}



class ContactSmallAbout extends React.Component{

  constructor(props){
    super(props);
    this.state = {
    };
  }

  render(){
      return  <div class="card">
                      <div class="card-image">
                        <figure class="image is-3by4">
                          <img src="../../../static/Kamila2_34.jpg" alt="Moja fotografia"/>
                        </figure>
                      </div>
                      <div class="card-content">
                        <div class="media">
                          <div class="media-content">
                            <p class="title is-4">Kamila Wiśniewska</p>
                            <p class="subtitle is-6">lektorka i autorka strony</p>
                          </div>
                        </div>
                        <div class="content is-small">
                          <p>
                          Jestem absolwentką wydziału neofilologii Uniwersytetu Warszawskiego. Od blisko 5 lat uczę języka niemieckiego prywatnie oraz dla szkół językowych.
                          Spędziłam 4 lata pracując oraz ucząc się w Niemczech, wiedzę którą tam zdobyłam chętnie wykorzystuję na lekcjach.
                          Prowadzę zajęcia dla osób w każdym wieku i na każdym poziomie zaawansowania.
                          Program dopasowuję indywidualnie dla każdego ucznia.
                          Lekcje odbywają się na żywo lub online!
                          </p>
                          <p>Serdecznie zapraszam!<br/>Kamila</p>
                        </div>
                      </div>
                    </div>
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

    return  <article class="message is-primary">
                      <div class="message-header">
                        <p>Dane kontaktowe</p>
                      </div>
                      <div class="message-body has-text-centered">
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
