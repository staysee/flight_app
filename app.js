'use strict';
//const BASE_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/jsonp'
const BASE_URL = 'https://us-central1-sapi-framework.cloudfunctions.net/FlightStatus?';
let flightData;
let index = 0;  //index for #flights in entire flight route

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
  let flightquery = $('#flight-query').val();
  let airline_code = flightquery.match(/^[a-zA-z]*/);
  let flight_number = flightquery.match(/[0-9]*$/);

  let flightdate = $('#datepicker').val();
  let dateArray = flightdate.split("/");
  let dep_month = dateArray[0];
  let dep_day = dateArray[1];
  let dep_year = dateArray[2];


  $.ajax({
    url: BASE_URL+'airline='+airline_code+'&flight_number='+flight_number+'&year='+dep_year+'&month='+dep_month+'&day='+dep_day,
    method: 'GET',
    async: false,
    success: function(data){
      console.log(data);
      flightData = data.flightStatuses;

      if (data.hasOwnProperty("error")){
        $('.error-msg').html("ERROR: " + data.error.errorMessage);
      }
      else if (flightData.length == 0){
        $('.error-msg').html("Sorry, the flight you entered was not found. Please try again.");
      }
      else if (flightData.length > 1){
        //popup jquery modal with all flight choices, and set index to user selected flight
        const modal = $('#flightModal');
        let cityButtons = flightData.map(function(leg, flightIndex){
          return `
            <button id="choice${flightIndex}" value="${flightIndex}">${flightData[flightIndex].arrivalAirportFsCode}</button>
          `
        })
        $('.flight-selections').html(cityButtons);
        modal.removeClass("hidden");

      }
      else {
        // if (flightData[index].hasOwnProperty('delays')){
        //  console.log('Has delays: ' + flightData[index].delays);
        // } else {
        //   console.log ('No delays')
        // }

        const flight = new Flight(
          $('#traveler-name').val(),
          flightData[index].carrierFsCode,
          flightData[index].flightNumber,
          flightData[index].departureAirportFsCode,
          flightData[index].arrivalAirportFsCode,
          flightData[index].operationalTimes.estimatedGateArrival.dateLocal,
          flightData[index].status,
          flightData[index].delays
        )
        state.flights.push(flight);
      }
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log(textStatus);
      $('.error-msg').html("Error: Please enter a valid flight that is scheduled or departing. Check your flight information and/or its format. Airline codes must be followed by a flight number (no spaces).")

    }
  });
}


// --------------
// STATE OBJECT
// --------------
const state = {
              flights: [
              // {
              //           traveler: 'HARDCODED',
              //           airline: 'WN',
              //           flightNumber: '2158',
              //           airports: {
              //                     departure: 'LAX',
              //                     arrival: 'SFO'
              //           },
              //           arrivalTime: '2018-03-22T05:15:00.000',
              //           status: 'Scheduled',
              //           delays: 'Delayed'
              // }
              ]
};


// ----------------
// FLIGHT OBJECT
// ----------------
function Flight(traveler, airline, flightNumber, departAirport, arrivalAirport, arrivalTime, status, delays){
  this.traveler = traveler;
  this.airline = airline;
  this.flightNumber = flightNumber;
  this.airports = {
                  departure:  departAirport,
                  arrival:    arrivalAirport
  };
  this.arrivalTime = arrivalTime;
  this.status = status;
  this.delays = delays;
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

function addFlight (state, index){
  // if (flightData[index].hasOwnProperty('delays')){
  //      console.log('Has delays: ' + flightData[index].delays);
  // } else {
  //       console.log ('No delays')
  // }

  const flight = new Flight(
    $('#traveler-name').val(),
    flightData[index].carrierFsCode,
    flightData[index].flightNumber,
    flightData[index].departureAirportFsCode,
    flightData[index].arrivalAirportFsCode,
    flightData[index].operationalTimes.estimatedGateArrival.dateLocal,
    flightData[index].status,
    flightData[index].delays
  )
  state.flights.push(flight);
}

// -------------
// RENDERING
// -------------
function checkStatus(){

}

function fixETA(flight){
  let time = flight.arrivalTime

  if (time.includes("T")){
    let timeSplit = time.substring(0, time.length-7).split("T");
    let etaDate = timeSplit[0];
    let etaTime = timeSplit[1];
    flight.arrivalTime = timeSplit[1] + " " + timeSplit[0];
  }
}

function renderList (state, element){
  console.log('Rendering...');
  let itemsHTML = state.flights.map(function(flight){
    fixETA(flight);
    let hidden = "hidden";
    let status= "";
    let delayTime = "";

    if (flight.status === "S"){
      flight.statusDisplay = "Scheduled";
      status = "scheduled";
    }
    if (flight.status === "A"){
      flight.statusDisplay = "In Flight";
      status = "inflight";
    }
    if (flight.status === "C"){
      flight.statusDisplay = "Cancelled";
      status = "attention";
    }
    if (flight.status === "D"){
      flight.statusDisplay = "Diverted";
      status = "attention";
    }
    if (flight.status === "L"){
      flight.statusDisplay = "Landed";
       status = "landed";
    }
    if (flight.status === "R"){
      flight.statusDisplay = "Redirected";
      status = "attention";
    }

    if (flight.delays !== undefined && flight.statusDisplay !== "Landed"){
      if (flight.delays.arrivalGateDelayMinutes !== undefined){

        hidden = "";

        if (flight.delays.arrivalGateDelayMinutes > 10){
          status = "attention";
          delayTime = flight.delays.arrivalGateDelayMinutes;
        } else {
          status = "slight-delay";
          delayTime = flight.delays.arrivalGateDelayMinutes;
        }
      }
    }


    return `
      <li class="flight-entry ${status}">
        <span id='close'>&times;</span>
        <div class="flight-traveler">${flight.traveler}</div>
        <div class="flight-info">${flight.airline}${flight.flightNumber}</div>
        <div class="flight-locations">${flight.airports.departure} to ${flight.airports.arrival}</div>
        <div class="flight-arrival">ETA to Gate: ${flight.arrivalTime}</div>
        <div class=status"><span class="flight-status">${flight.statusDisplay}</span><span class="flight-delays ${hidden}"> -- Delayed: ${delayTime} min.</span></div>
      </li>
    `
  })
  element.html(itemsHTML);
}



// -----------------
// EVENT LISTENERS
// -----------------
function handleCitySelect(){
  $('.flight-selections').on('click', 'button', function(event){
    console.log(flightData);
    console.log(this.value);
    addFlight(state, this.value)
    $('#flightModal').addClass("hidden");
    renderList(state, $('.flights-list'));
  })
}

function handleModalClose(){
  $('.modal-close').click(function(){
    $('#flightModal').addClass("hidden");
  })
}

function handleAddFlight(flight){
  $('#add-flight-button').on('click', function(event){
    event.preventDefault();
    console.log('Clicked Add Flight Button')
    $('.error-msg').html("");
    getDataFromApi();
    renderList(state, $('.flights-list'));
    $('#search-form')[0].reset();
  })
}

function handleDeleteFlight(){
  $('.flights-list').on('click', '#close', function(event){
    var itemIndex = $(this).closest('li').index();
    console.log('Deleting Flight: ' + itemIndex);
    deleteFlight(state, itemIndex);
    renderList(state, $('.flights-list'));
  })
}

function handleResetButton(){
  $('#reset-flights-button').on('click', function(event){
    event.preventDefault();
    console.log('Clearing state');
    $('.error-msg').html("");
    state.flights = [];
    renderList(state, $('.flights-list'));
  })
}



$(calendar)
$(handleCitySelect)
$(handleModalClose)
$(handleAddFlight)
$(handleDeleteFlight)
$(handleResetButton)
