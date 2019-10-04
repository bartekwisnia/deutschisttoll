

function getData(endpoint, options, data_var, loaded_var, placeholder_var, caller, callback){
  const opt = options;
  let url = endpoint;
  let opt_str = opt ? Object.keys(opt).filter(key => {return opt[key];})
  .map(key => key + '=' + opt[key]).join("&") : '';
  if(opt_str)
    url += '?' + opt_str;
  //console.log(url);
  fetch(url)
    .then(response => {
      if (response.status !== 200) {
        console.log(endpoint);
        console.log(response);
        let state = {};
        state[placeholder_var] = "Something went wrong";
        return caller.setState(state);
      }
      return response.json();
    })
    .then(data => {
        console.log(endpoint);
        console.log(data);
        let state = {};
        state[data_var] = data;
        state[loaded_var] = true;
        return caller.setState(state, callback);
      });
}


function overalStatus(status){
  let overal_status = status;
  if (typeof(status) === "object")
  {
      overal_status = 0;
      for (var i = 0; i < status.length; i++) {
          if (status[i] === 1){
            overal_status = 1;
            break;
          }
          else if (status[i] === 2 && overal_status !== 1)
            overal_status = 2;
          else if (status[i] === 3 && overal_status === 0)
            overal_status = 3;
          else if (status[i] === 0 && overal_status >= 2)
            {
            overal_status = 1;
            break;
            }
      }
  }
  return overal_status;

}


function handleDate(results) {
  if(typeof(results[0]) !== "undefined"){
    for (var i = 0; i < results.length; i++) {
      if(typeof(results[i].timestamp) === "string"){results[i].timestamp = new Date(results[i].timestamp)};
      if(typeof(results[i].updated) === "string"){results[i].updated = new Date(results[i].updated)};
      if(typeof(results[i].start) === "string"){results[i].start = new Date(results[i].start)};
    }
  }
  else {
    //console.log("object");
    if(typeof(results.timestamp) === "string"){results.timestamp = new Date(results.timestamp)};
    if(typeof(results.updated) === "string"){results.updated = new Date(results.updated)};
    if(typeof(results.start) === "string"){results.start = new Date(results.start)};
  }
  return results;
}

function dateToYMD(date) {
    if (typeof(date) !== "undefined"){
      var my_date = new Date(date);
      var d = my_date.getDate();
      var m = my_date.getMonth() + 1; //Month from 0 to 11
      var y = my_date.getFullYear();
      return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
    }
    return ""
}

function dateToYMDHm(date) {
    if (typeof(date) !== "undefined"){
      var my_date = new Date(date);
      var d = my_date.getDate();
      var m = my_date.getMonth() + 1; //Month from 0 to 11
      var y = my_date.getFullYear();
      var h = my_date.getHours();
      var min = my_date.getMinutes();
      return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
      + ' ' + (h<=9 ? '0' + h : h) + ':' + (min<=9 ? '0' + min : min);
    }
    return ""
}

function dateToDjango(date) {
  // YYYY-MM-DD HH:MM[:ss[.uuuuuu]][TZ]
    if (typeof(date) !== "undefined"){
      var my_date = new Date(date);
      var d = my_date.getDate();
      var m = my_date.getMonth() + 1; //Month from 0 to 11
      var y = my_date.getFullYear();
      var h = my_date.getHours();
      var min = my_date.getMinutes();
      return '' + y + '-' + (m<=9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d)
      + ' ' + (h<=9 ? '0' + h : h) + ':' + (min<=9 ? '0' + min : min);
    }
    return ""
}

function getDayName(day) {
    if (typeof(day) !== "undefined"){
      let day_name = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
      return day_name[day]
    }
    return ""
}

function dateToWHm(date) {
    if (typeof(date) !== "undefined"){
      var my_date = new Date(date);
      var w = getDayName(my_date.getDay());
      var h = my_date.getHours();
      var min = my_date.getMinutes();
      return '' + w + ' ' + (h<=9 ? '0' + h : h) + ':' + (min<=9 ? '0' + min : min);
    }
    return ""
}

function dateToHm(date) {
    if (typeof(date) !== "undefined"){
      var my_date = new Date(date);
      var h = my_date.getHours();
      var min = my_date.getMinutes();
      return '' + (h<=9 ? '0' + h : h) + ':' + (min<=9 ? '0' + min : min);
    }
    return ""
}

function calcEnd(date, length) {
    if (typeof(date) !== "undefined"){
      var my_date = new Date(date);
      my_date.setMinutes(my_date.getMinutes() + length);
      return my_date;
    }
    return date;
}

function dateWithEnd(date, length) {
    if (typeof(date) !== "undefined" && typeof(length) !== "undefined"){
      var my_date = new Date(date);
      return dateToYMDHm(my_date) + " - " + dateToHm(calcEnd(my_date, length));
    }
    return date;
}

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            // console.log(cookies[i]);
            var cookie = cookies[i];
            //var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    // console.log(cookieValue);
    return cookieValue;
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}

function quasiRandomColour(index) {
  const colours = ["is-primary", "is-info", "is-danger", "is-success", "is-warning", "is-light", "is-dark"];
  return colours[index % 7]
}

export {
  getData, getCookie, handleDate, dateToYMD, dateToYMDHm, calcEnd, dateToHm, dateWithEnd, overalStatus, addDays, shuffleArray, quasiRandomColour, dateToWHm
}
