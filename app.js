'use strict';
//const BASE_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/jsonp'
const BASE_URL = 'https://us-central1-sapi-framework.cloudfunctions.net/FlightStatus?';


// API
function getDataFromApi(){
  var flightquery = $('#flight-query').val();
  var airline_code = flightquery.match(/^[a-zA-z]*/);
  var flight_number = flightquery.match(/[0-9]*$/);

  var flightdate = $('#datepicker').val();
  var dateArray = flightdate.split("/");
  var dep_month = dateArray[0];
  var dep_day = dateArray[1];
  var dep_year = dateArray[2];
  //console.log(flightdate);
  //console.log(dep_month);
  //console.log(dep_day);
  //console.log(dep_year);

  $.ajax({
    url: BASE_URL+'airline='+airline_code+'&flight_number='+flight_number+'&year='+dep_year+'&month='+dep_month+'&day='+dep_day,
    method: 'GET',
    success: function(data){
      console.log(data);
      // console.log('Flight Status: ' + data.flightStatuses[0].status);
      // console.log('Departure Airport: ' + data.flightStatuses[0].departureAirportFsCode);
      // console.log('Arrival Airport: ' + data.flightStatuses[0].arrivalAirportFsCode);
      // console.log('ETA: '+data.flightStatuses[0].operationalTimes.estimatedGateArrival.dateLocal);

      var flight = new Flight(
        $('#traveler-name').val(),
        data.flightStatuses[0].carrierFsCode,
        data.flightStatuses[0].flightNumber,
        data.flightStatuses[0].operationalTimes.publishedDeparture.dateLocal
      )
      state.flights.push(flight);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log(textStatus);
    }
  });
}

// State Object
var state = {
  flights: [{
    traveler: 'Stacey',
    airline: 'WN',
    flightNumber: '2158',
    departure: '2018-03-22T05:15:00.000',
    status: 'Scheduled'
  },
  {
    traveler: 'Friend',
    airline: 'WN',
    flightNumber: '374',
    departure: '2018-03-22T05:15:00.000',
    status: 'On-Time'
  }]
};

function Flight(traveler, airline, flightNumber, departure, status){
  this.traveler = traveler;
  this.airline = airline;
  this.flightNumber = flightNumber;
  this.departure = departure;
  this.status = status
}

// State Mod Functions
function getFlight (state, itemIndex){
  state.flights[itemIndex];
}

function addFlight (state, flight){
  var flightquery = $('#flight-query').val();
  var airline_code = flightquery.match(/^[a-zA-z]*/);
  var flight_number = flightquery.match(/[0-9]*$/);
  var flightdate = $('#datepicker').val();
  
  var flight = new Flight(
    $('#traveler-name').val(),
    airline_code,
    flight_number,
    flightdate
  )
  state.flights.push(flight);
}



function deleteFlight (state, itemIndex){
  state.flights.splice(itemIndex, 1);
}

// Rendering
function renderList (state, element){
  console.log('Rendering...');
  var itemsHTML = state.flights.map(function(flight){
    return `
      <li class="flight-entry">
        <span id='close'>x</span>
        <div class="flight-traveler">` + flight.traveler + `</div>
        <div class="flight-info">` + flight.airline + flight.flightNumber + `</div>
        <div class="flight-locations">Airports:</div>
        <div class="flight-status"> Flight Status:</div>
        <div class="flight-arrival">ETA to Gate: ` + flight.departure + `</div>
      </li>
    `
  })
  element.html(itemsHTML);
}




// Event Listeners
function calendar(){
  $('#datepicker').datepicker({
    inline: true,
    showOtherMonths: true,
    dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  });
}

function handleAddFlight(flight){
  $('#add-flight-button').on('click', function(event){
    event.preventDefault();
    console.log('Clicked Add Flight Button')
    //getDataFromApi();
    addFlight(state, flight);
    renderList(state, $('.flights-list'));
  })
}


function handleDeleteFlight(){
  $('.flights-list').on('click', '#close', function(event){
    var itemIndex = $(this).closest('li').index();
    console.log(itemIndex);
    deleteFlight(state, itemIndex);
    renderList(state, $('.flights-list'));
  })
}

function handleResetButton(){
  $('#reset-flights-button').on('click', function(event){
    event.preventDefault();
    //console.log('Reset button')
    //location.reload();
    console.log('Clearing state');
    state.flights = [];
    renderList(state, $('.flights-list'));

  })
}

$(calendar)
$(handleAddFlight)
$(handleDeleteFlight)
$(handleResetButton)
