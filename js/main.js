
//Global variables.
var map;
// Create a new blank array for all the listing markers.
var markers = ko.observableArray();
// These are the real estate listings that will be shown to the user.
// Normally we'd have these in a database instead and we use this array as the original data, not changed.
var locations = [
    //{title: 'Park Ave Penthouse', location: {lat: 40.7713024, lng: -73.9632393}},
    //{title: 'Chelsea Loft', location: {lat: 40.7444883, lng: -73.9949465}},
    //{title: 'East Village Hip Studio', location: {lat: 40.7281777, lng: -73.984377}},
    //{title: 'TriBeCa Artsy Bachelor Pad', location: {lat: 40.7195264, lng: -74.0089934}},
    //{title: 'Chinatown Homey Space', location: {lat: 40.7180628, lng: -73.9961237}},
    {title: 'Whitney Museum of American Art', location:{lat:40.7497956,lng: -73.985954}},
    {title: 'Lincoln Center for the Performing Arts', location:{lat:40.7577219,lng: -73.9929697}},
    //{title: 'Carnegie Hall', location:{lat:40.74973,lng: -73.986116}},
    //{title: 'The High Line', location:{lat:40.740052,lng: -73.986116}},
    //{title: 'Federal Reserve Bank of New York', location:{lat:40.7083688,lng: -74.0086484}},
    //{title: 'Empire State Building', location:{lat:40.7484405,lng: -73.9856644}},
    {title: 'Times Square', location:{lat: 40.750242, lng: -73.98454}},
    //{title: 'World Trade Center Memorial Foundation', location:{lat: 40.7106212, lng: -74.0155509}},
    {title: 'New York Stock Exchange', location:{lat: 40.706877, lng: -74.0112654}}
  ];

var newLocations = ko.observableArray();
var locationsCopy = locations.clone();
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
    var marker = new google.maps.Marker({
      map: map,
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      id: i
    });

    // Push the marker to our array of markers.
    markers.push(marker);
    // Create an onclick event to open an infowindow at each marker.
    marker.addListener('click', function() {
      toggleBounce(this);
      populateInfoWindow(this, largeInfowindow);
    });
    bounds.extend(marker.position);
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
    infowindow.setContent('<div>' + marker.title + '</div>');
    model.getDataFromFourSquare(marker.position);
    infowindow.open(map, marker);
    // Make sure the marker property is cleared if the infowindow is closed.
    infowindow.addListener('closeclick',function(){
      infowindow.setMarker = null;
    });
  }
};

//---------- this is for controller part ----------------
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
            }
          }
          else
          {
            if (newLocations.indexOf(val) !=-1){
              newLocations.remove(val);
            }
          }
        });
        alert(locations.length);
      }
      else{
        if(locations.length<locationsCopy.length) {//some values are removed, so roll back them.
          locationsCopy.forEach(function(val,index){
            if(newLocations.indexOf(val) ==-1){
              newLocations.splice(index,0,val);//insert this value to locations array.
            }
          });
        }
      }
    },
    search: function(){

    }
};
//Using Knockout to set up MVVM model to develop search, show list and markers functions.
$(function(){
  var self = this;
  var WikiElems = ko.observableArray([]);
  //Model part in MVVM pattern
  var model = {
    //This function will get data from Foursquare API by ajax, then convert the results to DOM elements
    //In the HTTP request, you need to pass in your client ID, client secret, a version parameter, 
    //and any other parameters that the endpoint requires:
    //https://api.foursquare.com/v2/venues/search
    //  ?client_id=CLIENT_ID
    //  &client_secret=CLIENT_SECRET
    //  &v=20130815
    //  &ll=40.7,-74
    //  &query=sushi
    getDataFromFourSquare: function(location){
      var currentDate = new Date().Format('yyyyMMdd'); //Get current date and formate it to yyyyMMdd
      console.log(currentDate);
      var loc = location.lat()+','+location.lng();
      console.log(loc);
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
        var venues =data.response.venues;
        venues.forEach(function(val, index){
          console.log(val.name);
          console.log(location.address+location.lat+location.lng);
        });
        return venues;
      })
      .fail(function(msg){
        //do sth.
        console.log(msg);
      })
      .always(function(msg){
        //do something
      });
    },
    //Json-P to get Wiki data
    //https://en.wikipedia.org/w/api.php?action=query&titles=Main%20Page&prop=revisions&rvprop=content&format=json
    getResultsFromWiki: function(location){
      var $wikiElem = $('#search-results');
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
        console.log(data);
        var location = data[0];
        if(data[1].length>0)
        {
          var keywords = data[1];
          var shortDesc = data[2];
          var keywordURLs = data[3];
          //var items = [];
          //this.currentWikiElems = ko.observableArray([{keyword:'ssdd', keywordURL:'dkjalk', shortDesc:'damdnam,'}]);
          var search_results = '<div id="search-results" class="search-results">'
                                +'<h3>'+location+'</h3>'
                                +'<li>';
          for(var i=0; i<data[1].length; i++){
            //var item = {keyword: keywords[i], shortDesc:shortDesc[i],keywordURL: keywordURLs[i]};
            //this.currentWikiElems.push(item);
            search_results += '<a href="'+keywordURLs[i]+'">'+keywords[i]+'</a><br>';
            search_results += '<span>'+shortDesc[i]+'</span>';
          }
          search_results += '</li></div>';
          $('#searchbox').append(search_results);
          //this.currentWikiElems = WikiElems;
        }else{
          //Todo: Not found.
          //var wikiResults = {location:location, ['']};
        }
      })
      .fail(function(msg){
          $wikiElem.append('<span class="errorMsg">'+'Error: ' + xmsg +'</span>');
      });
    }
  };
  //----------this part is for view ----------
  newLocations = ko.observableArray(locations);

  var ViewModel = function(){
    this.addressList = newLocations;
    this.showAddList = ko.observable(true);
    //this.showWikiList = ko.observable(false);
    // Load current item after clicking
    this.loadWiki = function(item, event){
      if(event.button ==0){
        
        this.showAddList(false);
        //this.showWikiList(true);
        model.getResultsFromWiki(item.title);
      }
      else{
        //ko.cleanNode($('#search-results')[0]);
      }
    }
  }
  ko.applyBindings(new ViewModel());
});