'use strict';

new Vue({
  el: '#movieapp',
  data: {
    mouse: {
      down: false,
      x: 0
    },
    movieIdx: 0,
    movies: [],
  },
  mounted: function () {
    // Movie data from Open Movie Database - my top five Marvel movies
    var movieUrls = [
      'https://www.omdbapi.com/?t=guardians+of+the+galaxy&y=&plot=short&r=json',
      'https://www.omdbapi.com/?t=civil+war&y=2016&plot=short&r=json',
      'https://www.omdbapi.com/?t=winter+soldier&y=2014&plot=short&r=json',
      'https://www.omdbapi.com/?t=strange&y=2016&plot=short&r=json',
      'https://www.omdbapi.com/?t=The+Avengers&y=2012&plot=short&r=json'
    ];

    // Function that returns a promise that should resolve with the JSON for the requested movie
    var requestMovie = function (url) {
      var p = new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function () {
          if (request.readyState === 4) { // done
            if (request.status === 200) { // success
              resolve(request.responseText);
            } else { // failure
              reject(request.statusText);
            }
          }
        };

        request.open('Get', url);
        request.send();
      });

      return p;
    };

    var self = this;
    // Create a promise for each movie url
    Promise.all(movieUrls.map(function (url) {
      return requestMovie(url);
    })).then(function (values) {
      // When all promises have been resolved, parse the returned JSON and add to movies array
      values.forEach(function (json) {
        var movie = JSON.parse(json);
        self.movies.push(movie);
      });
    }, function (errors) {
      // something went wrong
      console.log(errors);
    });
  },
  methods: {
    navTo: function (idx) {
      this.movieIdx = idx;
    },
    navLeft: function () {
      this.movieIdx--;
      if (this.movieIdx < 0) {
        this.movieIdx = this.movies.length - 1;
      }
    },
    navRight: function () {
      this.movieIdx++;
      if (this.movieIdx >= this.movies.length) {
        this.movieIdx = 0;
      }
    },
    mouseDown: function (e) {
      //console.log('mouseDown', e.changedTouches[0].clientX);
      this.mouse.down = true;
      this.mouse.x = e.changedTouches[0].clientX;
    },
    mouseUp: function (e) {
      if (this.mouse.down) {
        var deltaX = e.changedTouches[0].clientX - this.mouse.x;
        //console.log('mouseUp', e.changedTouches[0].clientX, deltaX);
        this.mouse.down = false;
        var threshold = 200; // min distance of swipe required for navigation
        if (Math.abs(deltaX) >= threshold) {
          if (deltaX < 0) {
            this.navRight();
          } else {
            this.navLeft();
          }
        }
      }
    },
    getMovieProperty: function (prop) {
      var val = 'Placeholder';
      if (this.movies[this.movieIdx]) {
        val = this.movies[this.movieIdx][prop]
      }
      return val;
    },
    getMovieRating: function () {
      var rating = [];
      if (this.movies[this.movieIdx]) {
        // Convert IMDB rating to 5 star scale
        var stars = Math.round(5 * ((this.movies[this.movieIdx].imdbRating) / 10));
        rating = Array(5).fill(1);
        rating = rating.fill(0, stars);
      }
      return rating;
    },
  }
})