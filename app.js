'use strict';
//const BASE_URL = 'https://api.flightstats.com/flex/flightstatus/rest/v2/jsonp'
const BASE_URL = 'https://us-central1-sapi-framework.cloudfunctions.net/FlightStatus?';
let index = 0;
var flightData;

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
    async: false,
    success: function(data){
      console.log(data);
      flightData = data.flightStatuses;

      if(flightData.length > 1){
        //popup jquery modal with all flight choices, and set index to user selected flight
        var modal = $('#flightModal');

        $('.flight-selections').html(`<button id="choice1" value="1">hello</button>`)
        modal.removeClass("hidden");

      }
      else{
        if (flightData[index].hasOwnProperty('delays')){
         console.log('Has delays: ' + flightData[index].delays);
        } else {
          console.log ('No delays')
       }


        var flight = new Flight(
          $('#traveler-name').val(),
          flightData[index].carrierFsCode,
          flightData[index].flightNumber,
          flightData[index].departureAirportFsCode,
          flightData[index].arrivalAirportFsCode,
          flightData[index].operationalTimes.publishedDeparture.dateLocal,
          flightData[index].status,
          flightData[index].delays
        )
        state.flights.push(flight);
      }
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
    traveler: 'HARDCODED',
    airline: 'WN',
    flightNumber: '2158',
    airports: {
      departure: 'LAX',
      arrival: 'SFO'
    },
    departureTime: '2018-03-22T05:15:00.000',
    status: 'Scheduled',
    delays: 'Delayed'
  }]
};


// ----------------
// FLIGHT OBJECT
// ----------------
function Flight(traveler, airline, flightNumber, departAirport, arrivalAirport, departureTime, status, delays){
  this.traveler = traveler;
  this.airline = airline;
  this.flightNumber = flightNumber;
  this.airports = {
                    departure:  departAirport,
                    arrival:    arrivalAirport
                  };
  this.departureTime = departureTime;
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
    if (flights[index].hasOwnProperty('delays')){
         console.log('Has delays: ' + flights[index].delays);
        } else {
          console.log ('No delays')
       }


        var flight = new Flight(
          $('#traveler-name').val(),
          flightData[index].carrierFsCode,
          flightData[index].flightNumber,
          flightData[index].departureAirportFsCode,
          flightData[index].arrivalAirportFsCode,
          flightData[index].operationalTimes.publishedDeparture.dateLocal,
          flightData[index].status,
          flightData[index].delays
        )
        state.flights.push(flight);
}

// -------------
// RENDERING
// -------------
function renderList (state, element){
  console.log('Rendering...');
  var itemsHTML = state.flights.map(function(flight){
    var hidden = "hidden";

    if (flight.delays !== undefined){
      hidden = "";
    }

    return `
      <li class="flight-entry">
        <span id='close'>x</span>
        <div class="flight-traveler">` + flight.traveler + `</div>
        <div class="flight-info">` + flight.airline + flight.flightNumber + `</div>
        <div class="flight-locations">Airports: ` + flight.airports.departure + ` to ` + flight.airports.arrival + `</div>
        <div class="flight-status"> Flight Status: ` + flight.status +`</div>
        <div class="flight-arrival">ETA to Gate: ` + flight.departureTime + `</div>
        <div class="flight-delays ` + hidden + `">Delayed</div>
      </li>
    `
  })
  element.html(itemsHTML);
}



// -----------------
// EVENT LISTENERS
// -----------------
function handleCitySelect(){
  $('.flight-selections').on('click', '#choice1', function(event){
    console.log(flights);
    console.log(this.value);
    var index = this.value;
    addFlight(state, index)
    $('#flightModal').addClass("hidden");
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
$(handleCitySelect)
$(handleModalClose)
$(handleAddFlight)
$(handleDeleteFlight)
$(handleResetButton)
