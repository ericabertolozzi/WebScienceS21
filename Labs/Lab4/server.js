const path = require('path');
const express = require('express');
const app = express();
const port = 4200;
app.use(express.static(path.join(__dirname, './Lab4')));
var bodyParser = require('body-parser') //To help read form data.
app.use(bodyParser.urlencoded({
  extended: false
}));

// Connect to the SpotifyWebApi-------------------------------------------------
var SpotifyWebApi = require('spotify-web-api-node');
var spotifyApi = new SpotifyWebApi({
  clientId: 'f59627e7fcb842ff8c712ebe30c3d9d7',
  clientSecret: '24e4f9a1e4244fd88fca81e8515a9860',
  redirectUri: 'https://localhost:4200'
});

var access_token;
// Retrieve an access token.
spotifyApi.clientCredentialsGrant().then (
  function(data) {
    console.log('The access token expires in ' + data.body['expires_in']);
    console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
    access_token = data.body['access_token'];
  },
  function(err) {
    console.log('Something went wrong when retrieving an access token', err);
  }
);
var spotifyApi = new SpotifyWebApi({
  accessToken: access_token
});
//------------------------------------------------------------------------------
app.get('/', function(req, res){
    res.sendFile(__dirname + '/Lab4/src/app/spotify/spotify.component.html');
});

app.get('/v1/singers/returnsongs', function(req, res){
  singername = req.query.singername;
  spotifyApi.searchArtists( singername ) // Enter any artist name here
    .then(function(data) {
      var output = '';
      artist_id = data.body['artists']['items'][0]['id']; // Get the ID from the artist name

      return spotifyApi.getArtistTopTracks(artist_id, 'GB') // Get the top three tracks
        .then(function(data) {
          for( let i=0; i < 3; i++ ) {
            output += data.body["tracks"][i]['name']; // Track name
            if (i<2)
              output += ', ';
            // output += data.body["tracks"][i]['preview_url']; // Track audio preview
          }
          res.send( output );
        }, function(err) {
        res.send('Something went wrong!', err);
        });
    }, function(err) {
      res.send("Artist name not found");
    });
});

// Using route parameters and string patterns
// Using regular expressions thought process:
// /v1(optional /)(optional "users")(optional /)(optional any string) / :singername / returnsongs
// /v1(/users/*)?/:singername/returnsongs
app.get('/v1(/users/*)?/:singername/returnsongs', function (req, res) {
  singername = req.params.singername;
  spotifyApi.searchArtists( singername ) // Enter any artist name here
    .then(function(data) {
      var output = '';
      artist_id = data.body['artists']['items'][0]['id']; // Get the ID from the artist name

      return spotifyApi.getArtistTopTracks(artist_id, 'GB') // Get the top three tracks
        .then(function(data) {
          for( let i=0; i < 3; i++ ) {
            output += data.body["tracks"][i]['name']; // Track name
            if (i<2)
              output += ', ';
            // output += data.body["tracks"][i]['preview_url']; // Track audio preview
          }
          res.send( output );
        }, function(err) {
        res.send('Something went wrong!', err);
        });
    }, function(err) {
      res.send("Artist name not found");
    });
})

var singername='';
app.post('/v1/singers',function(req,res){
  singername=req.body.singername;
  res.send(singername);
  console.log(singername) //Users input saved to variable singernames
})



// PUT request to bulk update users
app.put('/v1/users', function(req, res) {
  res.send('PUT Request for Bulk Update Called');
});

// PUT request to update songs for a particular singer
app.put('/v1/singers/:singername/returnsongs', function(req, res) {
  res.send('PUT Request for Songs Update Called');
});

// Regular Expression middleware
app.delete(/\/v1\/users\/.*a/, function(req, res) {
  res.send('DELETE Request for users with names that contains any letters before ending with "a" called');
});

app.delete('/v1/users', function(req, res) {
  res.send("DELETE Request for bulk deletion of users called");
});

app.listen(port, () => {
	console.log('Listening on *:4200');
});
