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
      console.log('Flight Status: ' + data.flightStatuses[0].status);
      console.log('Departure Airport: ' + data.flightStatuses[0].departureAirportFsCode);
      console.log('Arrival Airport: ' + data.flightStatuses[0].arrivalAirportFsCode);
      console.log('ETA: '+data.flightStatuses[0].operationalTimes.estimatedGateArrival.dateLocal);
      renderList(state, $('.flights-list'), data);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log(textStatus);
    }
  });
}

// State Object
var state = {
  flights: []
};


// State Mod Functions
function getFlight (state, itemIndex){
  state.flights[itemIndex];
}

function addFlight (state, flight){
  state.flights.push(flight);
}

function deleteFlight (state, itemIndex){
  state.flights.splice(itemIndex, 1);
}

// Rendering
function renderList (state, element, data){
  var itemsHTML = state.flights.map(function(flight){
    return `
      <li class="flight-entry">
        <span id='close'>x</span>
        <div class="temp-flight"></div>
        <div class="flight-traveler"></div>
        <div class="flight-identification"></div>
        <div class="flight-locations">Airports: ` + data.flightStatuses[0].departureAirportFsCode + ` to ` + data.flightStatuses[0].arrivalAirportFsCode + ` </div>
        <div class="flight-status"> Flight Status: ` + data.flightStatuses[0].status + `</div>
        <div class="flight-arrival">ETA to Gate: ` + data.flightStatuses[0].operationalTimes.estimatedGateArrival.dateLocal + `</div>
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

function handleAddFlight(){
  $('#add-flight-button').on('click', function(event){
    event.preventDefault();
    console.log('Clicked Add Flight Button')
    getDataFromApi();
    addFlight(state, $('#traveler-name').val());
    // renderList(state, $('.flights-list'));

    $('#traveler-name').val("");
    $('#flight-query').val("");
    $('#datepicker').val("");
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

