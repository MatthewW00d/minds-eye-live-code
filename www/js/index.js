ons.ready(function () {

    /* Javascript for device api here... */
    console.log('\n-------------\nDEVICE READY');
    //alert('DEVICE READY');

    //Put stuff in here that uses the phonegap plugins
    //geo location (gps) etc
    getUserLocation();
    navigator.geolocation.watchPosition(watchLocationSuccess, watchLocationError, { timeout: 25000, maximumAge: 0, enableHighAccuracy: true });
    
    addDegreeShowMarker();
    
    

});
//from https://onsen.io/v2/api/js/ons-navigator.html
    document.addEventListener('init', function (event) {
        var page = event.target;

        if (page.id === 'page1') {
            page.querySelector('#ons-button').onclick = function () {
                document.querySelector('#myNavigator').pushPage('page2.html', {
                    data: {
                        title: 'Page 2'
                    }
                });
            };
        } else if (page.id === 'page2') {
            page.querySelector('ons-toolbar .center').innerHTML = page.data.title;
        }
    });

// MAPPING VARIABLES

//global variables
var placeMap, userMarker;
var hotspots = [];
var hotspotState;
var markers = [];
var myMedia = null;
var mediaTimer = null;
var mediaPlaying = false;
//var mediaPaused = null;




/////////////////////////////////////////////////
// Initialize Firebase for the whole app
// only do this once
// but retieve data as often as you like EG****
var config = {
   apiKey: "AIzaSyBMqUeL0hNK-DptzOy7xpenhRvkmfAUN_c",
    authDomain: "minds-eye-545ba.firebaseapp.com",
    databaseURL: "https://minds-eye-545ba.firebaseio.com",
    projectId: "minds-eye-545ba",
    storageBucket: "minds-eye-545ba.appspot.com",
    messagingSenderId: "89483189524"
};
firebase.initializeApp(config);




//MAKE MAP

//CREATE MAP
//get firebase data from INSIDE the map function
//map loads first, 
//then gets the firebase data
//then add the markers using the data.
//Any other order will trigger errors
function initMap() {
  var bristol = {lat: 51.447659, lng: -2.598238};
  

  //global
  placeMap = new google.maps.Map(document.getElementById('map'), {
    zoom: 16,
    center: bristol,
    disableDefaultUI: true,
    styles: [
      {
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#f7a70b"
          }
        ]
      },
      {
        "elementType": "labels.icon",
        "stylers": [
          {
            "visibility": "on"
          }
        ]
      },
      {
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "elementType": "labels.text.stroke",
        "stylers": [
          {
            "color": "#f5f5f5"
          }
        ]
      },
      {
        "featureType": "administrative.land_parcel",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#bdbdbd"
          }
        ]
      },
      {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "poi",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "poi.attraction",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e0e0e0"
          }
        ]
      },
      {
        "featureType": "poi.business",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi.government",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "poi.park",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "poi.school",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "road",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#a8bbcc"
          }
        ]
      },
      {
        "featureType": "road.arterial",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#757575"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#8492a0"
          }
        ]
      },
      {
        "featureType": "road.highway",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#616161"
          }
        ]
      },
      {
        "featureType": "road.local",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      },
      {
        "featureType": "transit.line",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#e5e5e5"
          }
        ]
      },
      {
        "featureType": "transit.station",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#eeeeee"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "geometry",
        "stylers": [
          {
            "color": "#0d3546"
          }
        ]
      },
      {
        "featureType": "water",
        "elementType": "labels.text.fill",
        "stylers": [
          {
            "color": "#9e9e9e"
          }
        ]
      }
    ]
  });
  

  var getData = firebase.database().ref('stories');
  getData.on('value', gotData);

  function gotData(data) {
    var stories = data.val();
    var keys = Object.keys(stories);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var title = stories[k].title;
      var name = stories[k].name;
      var longitude = stories[k].longitude;
      var published = stories[k].published;
      var latitude = stories[k].latitude;
      var audio = stories[k].audioFile;

      if (published == true) {
      addStoryMarker(latitude, longitude, name, title, audio);
      
      } else {

      }
    }
  }
}


//// Place Degree Show Marker ////

function addDegreeShowMarker() {
  var degreeShow = {lat: 51.449496, lng: -2.597457};
  var image = {
    url: '../img/minds-eye.gif',
    scaledSize: new google.maps.Size(40, 40) // scaled size
  };

  var marker = new google.maps.Marker({
    position: degreeShow,
    map: placeMap,
    icon: image
  
  });
}



//ADD STORY MARKER
function addStoryMarker(markerLat, markerLng, storyName, storyTitle, storyAudio) {
  deleteMarkers();
  console.log('addStoryMarker');
  for ( var i = 0, len = localStorage.length; i < len; ++i ) {
    console.log('This is the local storage:' +localStorage.key( i ) + ': ' + localStorage.getItem( localStorage.key( i ) ) );
  }
  var storyPin = {lat: markerLat, lng: markerLng};
  var image = {
    url: '../img/map-pin.svg',
    scaledSize: new google.maps.Size(40, 40) // scaled size
  };

  var contentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h4 id="firstHeading" class="firstHeading">' + storyTitle + '</h4>'+
            '<div id="bodyContent">'+
            '<p>'+ 'by ' + storyName + '</p>'+
            '</div>'+
            '</div>';

  var enteredContentString = '<div id="content">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h4 id="firstHeading" class="firstHeading">' + storyTitle + '</h4>'+
            '<div id="bodyContent">'+
            '<p> by ' + storyName + '</p><ons-button onclick="loadStoryPage(&apos;'+storyName+ '&apos;, &apos;' +storyTitle+ '&apos;, &apos;' +storyAudio+ '&apos;)">Listen </ons-button>'+
            '</div>'+
            '</div>';
}

//Markers
var marker = new google.maps.Marker({
    position: storyPin,
    map: placeMap,
    icon: image,
    title: storyTitle,
  });
  google.maps.event.addListener(marker, "click", function(){
    infowindow.open(map, marker);
  });
  var northBounds = markerLat + 0.00015;
  var southBounds = markerLat - 0.00015;
  var eastBounds = markerLng + 0.0002;
  var westBounds = markerLng - 0.0002;
  var newHotspot = {storyName: storyName, storyTitle: storyTitle, storyAudio: storyAudio, northEdge: northBounds, southEdge: southBounds, eastEdge: eastBounds, westEdge: westBounds, markerLat: markerLat, markerLng: markerLng};
  hotspots.push(newHotspot);
  showMarkers();


//////////

// Sets the map on all markers in the array.
function setMapOnAll(placeMap) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(placeMap);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}

/////////
// Reset map to location
function resetMapLocation() {
    navigator.geolocation.getCurrentPosition(
    function(position){
      var Latitude, Longitude;
      Latitude = position.coords.latitude;
      Longitude = position.coords.longitude;
      console.log("This is my location");
      panMap(position);
    }, 
    function(error){
      console.log('code: ' + error.code + '\n' +
        'message: ' + error.message + '\n');
    }, 
    { enableHighAccuracy: true });
}
//////////
//////////
// Get geo coordinates
function getUserLocation() {
    navigator.geolocation.getCurrentPosition
    (onLocationSuccess, onLocationError, { enableHighAccuracy: true });
}

// Success callback for get geo coordinates
function onLocationSuccess(position) {
    var Latitude, Longitude;
    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;
    console.log("This is my location");
    drawUserMarker(position);
}

//ERROR
function onLocationError(error) {
  console.log('code: ' + error.code + '\n' +
      'message: ' + error.message + '\n');
}




//DRAW USER MARKER INITIALLY
function drawUserMarker(position) {
  lat = position.coords.latitude;
  lon = position.coords.longitude;
  var myLocation = {lat: lat, lng: lon};
  //assign global marker
  var image = {
    url: 'img/user-marker.svg',
    scaledSize: new google.maps.Size(40, 40) // scaled size
  };
  userMarker = new google.maps.Marker({
    position: myLocation,
    map: placeMap,
    icon: image
  });
  panMap(position);
  
}

//PAN MAP AND MARKER
function panMap(position){
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var center = new google.maps.LatLng(lat, lon);
  // using global variable:
  placeMap.panTo(center);
  userMarker.setPosition(center);
}

//MONITOR LOCATION
function watchLocationSuccess(position) {
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;
  var center = new google.maps.LatLng(lat, lon);
  // using global variable:
  userMarker.setPosition(center);
  var haveEnteredExited = checkPositionHotspot1(position);
  console.log(haveEnteredExited);
}

function watchLocationError(error) {
  ons.notification.alert('Could not find your location. This app requires your location to function. Try walking outside or allowing location services on your device.');
  console.log('This is the watch location error ' + JSON.stringify(error) );

}



//CHECK POSITION EVERY TIME watchPosition executes
function checkPositionHotspot1(position) {
  console.log(JSON.stringify(position));
  var lat = position.coords.latitude;
  var lon = position.coords.longitude;

  for (var i = 0; i < hotspots.length; i++) {
    console.log("\nMy position:" + lat + " , " + lon);
    console.log(hotspots[i].southEdge);
    console.log(lat + " my pos");
    console.log(hotspots[i].northEdge);
    console.log(hotspots[i].eastEdge);
    console.log(hotspots[i].westEdge);
    //test if inside hotspot
    if ( (lat > hotspots[i].southEdge && lat < hotspots[i].northEdge) && (lon < hotspots[i].eastEdge && lon > hotspots[i].westEdge) ) {
      if (hotspotState == "entering-" + hotspots[i].storyName || hotspotState == "inside-" + hotspots[i].storyName) {
        hotspotState = "inside-" + hotspots[i].storyName;
      } else {
        hotspotState = "entering-" + hotspots[i].storyName;
        createAlertDialog(hotspots[i].storyName, hotspots[i].storyTitle, hotspots[i].storyAudio)
        //store story title
        localStorage.setItem(hotspots[i].storyTitle, 'visited');
        addStoryMarker(hotspots[i].markerLat, hotspots[i].markerLng, hotspots[i].storyName, hotspots[i].storyTitle, hotspots[i].storyAudio);
        
      };
      return hotspotState
    } else {
      console.log('Were outside ' + hotspots[i].storyName);
    };
  };
}


var createAlertDialog = function(storyName, storyTitle, storyAudio) {
  ons.notification.confirm({
    title: 'Story found...',
    message: storyTitle + ' by ' + storyName,
    buttonLabels: ['Cancel', 'Listen'],
    callback: function(idx) {
      switch (idx) {
        case 0: //cancel
          
          break;
        case 1: //listen
          var myNavigator = document.querySelector('ons-navigator');
          console.log(JSON.stringify(hotspots) );
          //pass data to page2 and navigate there
          myNavigator.pushPage('page2.html', {data: {name: storyName, title: storyTitle, audio: storyAudio} });
            
          break;
      }
    }
  });
};

    