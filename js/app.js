'use strict';
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

      } else if (flightData.length == 0){
          $('.error-msg').html("Sorry, the flight you entered was not found. Please try again.");

      } else if (flightData.length > 1){    //if flight has multiple legs, choose arrival city
          const modal = $('#flightModal');  //modal to show city
          let cityButtons = flightData.map(function(leg, flightIndex){
            return `
              <button id="choice${flightIndex}" value="${flightIndex}">${flightData[flightIndex].arrivalAirportFsCode}</button>
            `
        })
        $('.flight-selections').html(cityButtons);
        modal.removeClass("hidden");

      }
      else {

        const flight = new Flight(
          $('#traveler-name').val(),
          flightData[index].carrierFsCode,
          flightData[index].flightNumber,
          flightData[index].departureAirportFsCode,
          flightData[index].arrivalAirportFsCode,
          flightData[index].operationalTimes,
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
              flights: []
};


// ----------------
// FLIGHT OBJECT
// ----------------
function Flight(traveler, airline, flightNumber, departAirport, arrivalAirport, operationalTimes, status, delays){
  this.traveler = traveler;
  this.airline = airline;
  this.flightNumber = flightNumber;
  this.airports = {
                  departure: departAirport,
                  arrival: arrivalAirport
  };
  this.operationalTimes = operationalTimes;
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

  const flight = new Flight(
    $('#traveler-name').val(),
    flightData[index].carrierFsCode,
    flightData[index].flightNumber,
    flightData[index].departureAirportFsCode,
    flightData[index].arrivalAirportFsCode,
    flightData[index].operationalTimes,
    flightData[index].status,
    flightData[index].delays
  )
  state.flights.push(flight);
}

// -------------
// RENDERING
// -------------
function fixETA(flight){
  let time = flight.operationalTimes.estimatedGateArrival.dateLocal

  if (time.includes("T")){
    let timeSplit = time.substring(0, time.length-7).split("T");
    let etaDate = timeSplit[0];
    let etaTime = timeSplit[1];
    flight.operationalTimes.arrivalDisplay = timeSplit[1] + " " + timeSplit[0];
  }
}

function renderList (state, element){
  console.log('Rendering...');
  let itemsHTML = state.flights.map(function(flight){
    let hidden = "hidden";
    let status = "";
    let delayTime = "";

    if (flight.status === "S"){
      flight.statusDisplay = "Scheduled";
      status = "scheduled";
    } else if (flight.status === "A"){
      flight.statusDisplay = "In Flight";
      status = "inflight";
    } else if (flight.status === "C"){
      flight.statusDisplay = "Cancelled";
      status = "attention";
    } else if (flight.status === "D"){
      flight.statusDisplay = "Diverted";
      status = "attention";
    } else if (flight.status === "L"){
      flight.statusDisplay = "Landed";
       status = "landed";
    } else if (flight.status === "R"){
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

    //Some flights don't have an Estimated Gate Arrival
    if (flight.operationalTimes.estimatedGateArrival!== undefined){
      fixETA(flight);
    } else {
      flight.operationalTimes.arrivalDisplay = "--:--"
    }

    return `
      <li class="flight-entry ${status}">
        <span id='close'>&times;</span>
        <div class="flight-traveler">${flight.traveler}</div>
        <div class="flight-info">${flight.airline}${flight.flightNumber}</div>
        <div class="flight-locations">${flight.airports.departure} to ${flight.airports.arrival}</div>
        <div class="flight-arrival">ETA to Gate: ${flight.operationalTimes.arrivalDisplay}</div>
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
