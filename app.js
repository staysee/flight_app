'use strict';
const APP_ID = config.APP_ID;
const API_KEY = config.API_KEY;
const BASE_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/'
// const BASE_URL = 'https://us-central1-sapi-framework.cloudfunctions.net/FlightStatus?airline=WN&flight_number=2115';


// API
function getDataFromApi(){
  $.ajax({
    url: BASE_URL,
    method: 'GET',
    dataType: 'json',
    appId: APP_ID,
    appKey: API_KEY,
    carrier:'SWA',
    flight: '2993',
    year: '2018',
    month: '03',
    day: '16',
    success: function(data){
      console.log(data);
      console.log('Flight Status: ' + data.flightStatuses[0].status);
      console.log('Departure Airport: ' + data.flightStatuses[0].departureAirportFsCode);
      console.log('Arrival Airport: ' + data.flightStatuses[0].arrivalAirportFsCode);
      console.log('ETA: ' + data.flightStatuses[0].operationalTimes.estimatedGateArrival.dateLocal);
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
function renderList (state, element){
  var itemsHTML = state.flights.map(function(flight){
    return `
      <li class="flight-entry">
        <span id='close'>x</span>
        <div class="temp-flight"></div>
        <div class="flight-identification"></div>
        <div class="flight-locations"></div>
        <div class="flight-status"></div>
        <div class="flight-arrival">ETA:</div>
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

$(calendar);
$(handleAddFlight)
$(handleDeleteFlight)
$(handleResetButton)
