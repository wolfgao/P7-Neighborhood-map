
//Global variables.
var map;
// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead and we use this array as the original data, not changed.
var locations = [
    {title: 'Whitney Museum of American Art', location:{lat:40.7395877,lng:-74.0088629}, marker:null},
    {title: 'Park Ave Penthouse', location: {lat: 40.7615772, lng: -73.9717627}, marker:null},
    {title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}, marker:null},
    {title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}, marker:null},
    {title: 'Museum Of Chinese In America', location: {lat: 40.7195241, lng: -73.9992096}, marker:null},
    {title: 'Lincoln Center for the Performing Arts', location:{lat:40.7724641,lng: -73.9834889}, marker:null},
    {title: 'Carnegie Hall', location:{lat:40.7651283,lng: -73.9799273}, marker:null},
    {title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}, marker:null},
    {title: 'The High Line', location:{lat:40.7479925,lng: -74.0047649}, marker:null},
    {title: 'Federal Reserve Bank of New York', location:{lat:40.7083688,lng: -74.0086484}, marker:null},
    {title: 'Empire State Building', location:{lat:40.7484405,lng: -73.9856644}, marker:null},
    {title: 'Times Square', location:{lat: 40.758895, lng: -73.985131}, marker:null},
    {title: 'World Trade Center Memorial Foundation', location:{lat: 40.7106212, lng: -74.0155509}, marker:null},
    {title: 'New York Stock Exchange', location:{lat: 40.706877, lng: -74.0112654}, marker:null}
  ];

var newLocations = ko.observableArray();
var locationsCopy = locations.clone();
var showAddList = ko.observable();
// Initialize Google map with markers...
var initMap = function() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  var largeInfowindow = new google.maps.InfoWindow();
  var bounds = new google.maps.LatLngBounds();

  // The following group uses the location array to create an array of markers on initialize.
  for (var i = 0; i < locations.length; i++) {
    // Get the position from the location array.
    var position = locations[i].location;
    var title = locations[i].title;
    // Create a marker per location, and put into markers array.
    locations[i].marker = new google.maps.Marker({
      map: map,
      draggable: true,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });
    // Create an onclick event to open an infowindow at each marker.
    locations[i].marker.addListener('click', function() {
      toggleBounce(this);
      populateInfoWindow(this, largeInfowindow);
    });
    bounds.extend(locations[i].marker.position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);
};

//Add animation for marker
function toggleBounce(marker) {  
  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);
  }
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.

function populateInfoWindow(marker, infowindow) {
  // Check to make sure the infowindow is not already opened on this marker.
  if (infowindow.marker != marker) {
    infowindow.marker = marker;
    model.getDataFromFourSquare(infowindow);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
};

var model = {
  //This function will get data from Foursquare API by ajax, then convert the results to DOM elements
  //In the HTTP request, you need to pass in your client ID, client secret, a version parameter, 
  //and any other parameters that the endpoint requires:
  //https://api.foursquare.com/v2/venues/search?client_id=CLIENT_ID&client_secret=CLIENT_SECRET&v=20130815
  //  &ll=40.7,-74
  getDataFromFourSquare: function(infowindow){
    var currentDate = new Date().Format('yyyyMMdd'); //Get current date and formate it to yyyyMMdd
    var position = infowindow.marker.position;
    var loc = position.lat()+','+position.lng();
    $.ajax({
      method: "GET",
      url: "https://api.foursquare.com/v2/venues/search",
      data: { 
        client_id: 'IY04Y4HNARJD3P0YEGEINJEC0EB3E25XEN3UF5PIX3UINKHV',
        client_secret:'QTKWYYYJCARMHNNNBW4OENWAMAXIGKVRKDLAGSI4YISCVDDA',
        v: currentDate,
        ll:loc
      }
    })
    .done(function( data ) {
      if (data != null){
        var venues =data.response.venues;
        infoWindownView.rendor(venues, infowindow);
      }
    })
    .fail(function(msg){
      //do sth.
      //console.log(msg);
      var errorMsg = '<h3> Sorry, failed to get data from Foursquare right now, please check your network and try again.</h3>'
                      + '<br> Error Message:'+ msg;
      infowindow.setContent(errorMsg);
    })
  },
  //Json-P to get Wiki data
  //https://en.wikipedia.org/w/api.php?action=query&titles=Main%20Page&prop=revisions&rvprop=content&format=json
  getResultsFromWiki: function(location){
    var wikiURL = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+location+"&format=json";
    $.ajax({
        url: wikiURL,
        method: "GET",
        headers: {
                "Accept" : "application/json; charset=utf-8",
                "Content-Type": "application/javascript; charset=utf-8",
                "Access-Control-Allow-Origin" : "*"
            },
        dataType: "jsonp"
    })
    .done(function( data) {
      wikiView.rendor(data);
    })
    .fail(function(msg){
        $wikiElem.append('<span class="errorMsg">'+'Error: ' + msg +'</span>');
    });
  },
  //Change markers array to make the clicked marker is showing
  updateMarkers: function(title){
    $.each(locations,function(index, val){
      if(val.title != title){
        val.marker.setMap(null);
        //break;
      }
    });
  }
}

// ---------- this is for controller part ----------------
// Basically it will handle the requests from UI, then get data from Model, then show the responses on UI.
var omnibox = {
  inputText: null,
  keyUp: function(){
    inputText = $('#searchboxinput').val();
    //trim the input text and normalize express it.
    inputText = inputText.replace(/(^\s*)|(\s*$)/g, "");
    var re = new RegExp(inputText,"gi");
    if(inputText.length>0){ // if <=1, no need to search in this array
      locationsCopy.forEach(function(val,index) {
        if(re.test(val.title)){
          if (newLocations.indexOf(val) ==-1){
            newLocations.push(val);
            val.marker.setMap(map);
          }
        }
        else
        {
          if (newLocations.indexOf(val) !=-1){
            newLocations.remove(val);
            val.marker.setMap(null);
          }
        }
      });
      //alert(locations.length);
    }
    else{
      if(locations.length<locationsCopy.length) {//some values are removed, so roll back them.
        locationsCopy.forEach(function(val,index){
          if(newLocations.indexOf(val) ==-1){
            newLocations.splice(index,0,val);//insert this value to locations array.
            val.marker.setMap(map);
          }
        });
      }
    }
  },
  search: function(){
    this.keyUp();
  },
  clear: function(){
    wikiView.clear();
    initMap();
    $('#addressList').show();
  },
};
// ---------------- View part --------------------
//This is for Wiki view, left pane view of the map, when you search a location in WikiPedia, then will show results here.
var wikiView ={
  rendor: function(data){
    var backBTN = '<button id="backBTN" onclick="omnibox.clear()">Clear</button>';
    var $searchbox = $('#searchbox');
    var search_results = '<div id="search-results" class="search-results">';
    $searchbox.append(backBTN);
    var location = data[0];
    if(data[1].length>0)
    {
      var keywords = data[1];
      var shortDesc = data[2];
      var keywordURLs = data[3];
      search_results += '<h3>'+location+' from WikiPedia</h3><li>';
      for(var i=0; i<data[1].length; i++){
        search_results += '<a href="'+keywordURLs[i]+'">'+keywords[i]+'</a>';
        search_results += '<p>Description: '+shortDesc[i]+'</p><br>';
      }
      search_results += '</li></div>';
      $searchbox.append(search_results);
    }else{
      //Todo: Not found.
      var strNotFound = '<p id="notfound"><span class="notfound">Sorry, can\'t find any items with keyword "'
                        +location+'" in wikipedia.</span></p>'
      $searchbox.append(strNotFound);
    }
  },
  clear: function(){
    if($('#search-results')){
      $('#search-results').remove();
    }
    if($('#notfound')){
      $('#notfound').remove();
    }
    $('#backBTN').remove();
  }
}
// This is for pop window by clicking markers.
var infoWindownView ={
  rendor: function(venues, infowindow){
    var popWindow = '<div class="infowindow" id="infowindow"><h3 align="center">'+infowindow.marker.title+'</h3>';
    var tableDOM ='<table><tr><th>Category:</th><th>Address:</th><th>Website:</th></tr>'
    var contentDOM = '';
    //basically the venues lengh = 30, we can't show all records, so just 5 records.
    for(var i=0; i<5; i++){
      var val = venues[i];
      var name = val.name;
      var catagories = val.categories[0].name;
      var url = val.url;
      var location = {lat:val.location.lat, lng:val.location.lng};
      var address = val.location.formattedAddress;
      /**  If you want to change marker icon, just unblock these.
      var icon = val.categories[0].icon.prefix+'64'+val.categories[0].icon.suffix;
      var image = {
        url: icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };
      infowindow.setIcon(image);
      */
      var categoryDOM = '<tr><td>' + catagories +'</td>';
      var addressDOM = '<td>' + address+'</td>';
      var websiteDOM = '<td><a href="' + url +'" class= infowindow>' + name + '</a></td>';
      var oneRecord =  categoryDOM + addressDOM + websiteDOM + '</tr>';
      contentDOM += oneRecord;
      //infowindow.marker.setIcon(image);
    };
    //console.log(contentDOM);
    var streetView = "http://maps.googleapis.com/maps/api/streetview?location="
                        +infowindow.marker.position.lat()+','+infowindow.marker.position.lng()
                        +'&size=400x300&heading=60&fov=90&pitch=10';
    var streetImag  = '<img src="'+streetView+'"></img>';
    contentDOM =popWindow + tableDOM + contentDOM + '</table><br>' + streetImag+'</div>';
    infowindow.setContent(contentDOM);
    infowindow.open(map, infowindow.marker);
  }
}
//Using Knockout to set up MVVM model to develop search, show list and markers functions.
$(function(){
  var self = this;
  newLocations = ko.observableArray(locations);

  var ViewModel = function(){
    this.addressList = newLocations;
    this.showAddList = ko.observable(true);
    // Load current item after clicking
    this.loadWiki = function(item, event){
      if(event.button ==0){ // Only handle the real click action, otherwise it will handle data with the loop.
        model.updateMarkers(item.title);
        this.showAddList(false);
        model.getResultsFromWiki(item.title);
      }
    }
  }

  ko.applyBindings(new ViewModel());
});