
//---------Global variables.
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

var myInfowindow; //only one infowindow is valid.

/**
 * @function Update Place's prototype
 * @description Return the url if present or a message if it doesn't.
 * @param {object} Foursquare data
 */
Place.prototype.getUrl = function(data) {
  return data.url ? data.url : 'Website not available';
};

/**
 * @class Create the Place Class
 * @description Format Foursquare Data
 * @param {object} Foursquare data
 */
function Place(data) {
  this.name = data.name;
  this.lat = data.location.lat;
  this.lng = data.location.lng;
  this.category = data.categories[0].pluralName;
  this.address = data.location.formattedAddress;
  this.url = this.getUrl(data);
}
//------------- end------------------

// Initialize Google map with markers...
var initMap = function() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 40.7413549, lng: -73.9980244},
    zoom: 13
  });

  var bounds = new google.maps.LatLngBounds();
  var largeInfowindow = new google.maps.InfoWindow();

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

    //Add animation event for markers
    locations[i].marker.addListener('click', function() {
      toggleBounce(this);
      populateInfoWindow(this, largeInfowindow);
    });
    bounds.extend(locations[i].marker.position);
  }
  // Extend the boundaries of the map for each marker
  map.fitBounds(bounds);

};
//reload map
var reloadMap = function () {
  $.getScript("https://maps.googleapis.com/maps/api/js?libraries=places&key=AIzaSyCqYws-DUG9U254coGf2QHlzqcIj2tlRKA&v=3&callback=initMap");
}
//When failed to init Google map, we need a function to handle this error
var mapErrorHandler = function(){
  //TODO: 这里处理初始化地图失败的case
  $('div#map').html('error loading map...click <a href="#" onclick="reloadMap()">here</a> to reload');
}

//Add animation for marker
function toggleBounce(marker) {
  if (marker.getAnimation() != null) {
    marker.setAnimation(null);
  } else {
    marker.setAnimation(google.maps.Animation.BOUNCE);

    // 2 秒钟后停止动画
    window.setTimeout(function(){
        marker.setAnimation(null);
    }, 2000);
  }
};

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
var populateInfoWindow = function(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    myInfowindow = infowindow;
    if (infowindow.marker != marker) {
      myInfowindow.marker = marker;
      infowindowShow();
      viewModel.getDataFromFourSquare();
      // Make sure the marker property is cleared if the infowindow is closed.
      infowindow.addListener('closeclick',function(){
        infowindow.setMarker = null;
      });
    }
};

var clear = function(){
    $('#backBTN').remove();
    $('.search-results').remove();
    if($('.notfound').html()){
      $('.notfound').remove();
    }
    initMap();
    $('.addressList').show();
}


// ---------------- View part --------------------
// This is for pop window by clicking markers.
var infowindowShow = function(){
    var popWindow = '<div class="infowindow" data-bind="foreach: filterVenues" id="infowindow"><h3 align="center">'+myInfowindow.marker.title+'</h3>';
    var tableDOM ='<table><tr><th>Category:</th><th>Address:</th><th>Website:</th></tr>'
    //Each record
    var categoryDOM = '<tr><td data-bind="text: categories"></td>';
    var addressDOM = '<td data-bind="text: address"></td>';
    var websiteDOM = '<td><a data-bind="attr: {href: url, title: name }"></a></td>';

    //Complete all records UI rendoring
    var contentDOM = popWindow+tableDOM+categoryDOM+addressDOM+websiteDOM+'</table><br>';

    var streetView = "http://maps.googleapis.com/maps/api/streetview?location="
                        +myInfowindow.marker.position.lat()+','+ myInfowindow.marker.position.lng()
                        +'&size=400x300&heading=60&fov=90&pitch=10';
    var streetImag  = '<img src="'+streetView+'"></img>';

    contentDOM = contentDOM + streetImag+'</div>';
    myInfowindow.setContent(contentDOM);
    myInfowindow.open(map, myInfowindow.marker);
}

function openNav() {
    document.getElementById("search-box").style.width = "28%";
}

function closeNav() {
    document.getElementById("search-box").style.width = "0";
}

// ---------- this is for controller part ----------------
// Basically it will handle the requests from UI, then get data from Model, then show the responses on UI.
//Using Knockout to set up MVVM model to develop search, show list and markers functions.
//Change markers array to make the clicked marker is showing

var viewModel = function(){
  var self = this;

  self.showWikiList = ko.observable(true);
  self.showAddList = ko.observable(true);

  //inital array for locations and infowindow
  //self.addressList = ko.observableArray(locations);
  self.query = ko.observable('');
  //进行数组筛选，我们采用的array.filter()函数
  self.addressList = ko.computed(function() {
    //self.query = ko.observable('');
    self.showAddList(true);
    var inputText = self.query().replace(/(^\s*)|(\s*$)/g, ""); //trim left and right space to get the real input text
    //检查输入是否为空
    if (!inputText) {
        //如果输入的空值，那么数组还原，确保每一个location的marker也要还原
        locations.forEach(function(val){
          if(val.marker){
            val.marker.setMap(map);
          }
        });
        return locations;
      } else {
        var re = new RegExp(inputText,"gi");
        return locations.filter( function(val) {
          if(re.test(val.title)){
              val.marker.setMap(map);
              return true;
          } else {
              val.marker.setMap(null);
              return false;
          }
        });
    }
  });

  var clearMarkers = function(title){
    $.each(locations,function(index, val){
      if(val.title != title){
        val.marker.setMap(null);
        //break;
      }
    });
  }

  self.currentWiki = ko.observable();
  // Load current item after clicking
  self.loadWiki = function(item, event) {
    // Only handle the real click action, otherwise it will handle data with the loop.
    if (typeof(event) != "undefined") {
      //the first time to this loop, do nothing.
     if (event.button == 0){ //mouse click event
      clearMarkers(item.title);
      self.showAddList(false);
      //$('.addressList').remove();
      $('.searchbox').after($('.search-results'));
      //self.showWikiList(true);
      var wikiURL = "https://en.wikipedia.org/w/api.php?action=opensearch&search="+item.title+"&format=json";
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
        if (data[1].length>0){ //
          var result = {
            name: data[1][0],
            brief: data[2][0],
            url: data[3][0]
          };
          this.currentWiki = ko.observable(result);
          console.log(this.currentWiki());
        }
        else{
          //can't find any records from Wikipedia
        $('#search-results').append('<span class="notfound">Sorry, can\'t find any records from Wikipedia with this keyword "'
                                  + item.title +'"! </span>');
        }
      })
      .fail(function(msg){
        $('#search-results').append('<span class="errorMsg">'+'Error: ' + msg +'</span>');
      });
    }
  }
}

//get information from Foursquare
self.filterVenues = ko.observableArray();
self.getDataFromFourSquare = function(){
    self.filterVenues([]);
    var currentDate = new Date().Format('yyyyMMdd'); //Get current date and formate it to yyyyMMdd
    var position = myInfowindow.marker.position;
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
        for(var i=0; i<3; i++){
          var venues = data.response.venues;
          self.filterVenues.push(new Place(venues[i]));
        }
      }
    })
    .fail(function(msg){
      var errorMsg = '<h3> Sorry, failed to get data from Foursquare right now, please check your network and try again.</h3>'
                      + '<br> Error Message:'+ msg;
      myInfowindow.setContent(errorMsg);
    });
  }
//
}

viewModel = new viewModel();
ko.applyBindings(viewModel);

