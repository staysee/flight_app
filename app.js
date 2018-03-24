'use strict';
//const BASE_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/jsonp'
const BASE_URL = 'https://us-central1-sapi-framework.cloudfunctions.net/FlightStatus?';


// -------------
// CALENDAR UI
//--------------
function calendar(){
  $('#datepicker').datepicker({
    inline: true,
    showOtherMonths: true,
    dayNamesMin: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  });
}

// ----------
// CALL API
// ----------
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

      var flight = new Flight(
        $('#traveler-name').val(),
        data.flightStatuses[0].carrierFsCode,
        data.flightStatuses[0].flightNumber,
        data.flightStatuses[0].departureAirportFsCode,
        data.flightStatuses[0].arrivalAirportFsCode,
        data.flightStatuses[0].operationalTimes.publishedDeparture.dateLocal,
        data.flightStatuses[0].status
      )
      state.flights.push(flight);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log(textStatus);
    }
  });
}


// --------------
// STATE OBJECT
// --------------
var state = {
  flights: [{
    traveler: 'Stacey',
    airline: 'WN',
    flightNumber: '2158',
    airports: {
      departure: 'LAX',
      arrival: 'SFO'
    },
    departureTime: '2018-03-22T05:15:00.000',
    status: 'Scheduled'
  }]
};


// ----------------
// FLIGHT OBJECT
// ----------------
function Flight(traveler, airline, flightNumber, departAirport, arrivalAirport, departureTime, status){
  this.traveler = traveler;
  this.airline = airline;
  this.flightNumber = flightNumber;
  this.airports = {
                    departure:  departAirport,
                    arrival:    arrivalAirport
                  };
  this.departureTime = departureTime;
  this.status = status;
}


// --------------------
// STATE MODIFICATION
// --------------------
function getFlight (state, itemIndex){
  state.flights[itemIndex];
}

function deleteFlight (state, itemIndex){
  state.flights.splice(itemIndex, 1);
}

//addFlight is in the ajax success function
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



// -------------
// RENDERING
// -------------
function renderList (state, element){
  console.log('Rendering...');
  var itemsHTML = state.flights.map(function(flight){
    return `
      <li class="flight-entry">
        <span id='close'>x</span>
        <div class="flight-traveler">` + flight.traveler + `</div>
        <div class="flight-info">` + flight.airline + flight.flightNumber + `</div>
        <div class="flight-locations">Airports: ` + flight.airports.departure + ` to ` + flight.airports.arrival + `</div>
        <div class="flight-status"> Flight Status: ` + flight.status +`</div>
        <div class="flight-arrival">ETA to Gate: ` + flight.departureTime + `</div>
      </li>
    `
  })
  element.html(itemsHTML);
}



// -----------------
// EVENT LISTENERS
// -----------------
function handleAddFlight(flight){
  $('#add-flight-button').on('click', function(event){
    event.preventDefault();
    console.log('Clicked Add Flight Button')
    getDataFromApi();       //UNCOMMENT WHEN CALLING API, COMMENT OUT ADDFLIGHT
    //addFlight(state, flight);
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
