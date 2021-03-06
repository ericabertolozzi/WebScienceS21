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
// Connect to MongoDB-----------------------------------------------------------
const MongoClient = require('mongodb').MongoClient;
// had to URL encode the password bc it contained an '@' - VB
const url = "mongodb+srv://barnev:.mUNYTL8Ga.6q2%40@cluster0.pacdp.mongodb.net/lab5?retryWrites=true&w=majority";
const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
//------------------------------------------------------------------------------
app.get('/', function(req, res){
    res.sendFile(__dirname + '/Lab4/src/app/spotify/spotify.component.html');
});

app.get('/erica.html',function(req, res){
    res.sendFile(__dirname + '/Lab4/src/app/spotify/erica.html');
  });


// Erica Bertolozzi Part 1
app.get('/ericapart1', function(req, res){
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("lab5");
        var collection = dbo.collection("transformed");
        const query = { "Genre" : "Pop" };
        const cursor = collection.find(query);
        cursor.toArray(function(err, docs) {
            // Build an HTML string to send pop song data to the front end
            var html = "<!DOCTYPE html><html><head></head><body><h1>List of Pop Songs in the Database</h1><ul>";
            for (let i=0; i<docs.length; i++) {
                html += '<li>' + docs[i]['Track Name'] + " by " + docs[i]['Artist Name'] + '</li>';
            }
            html += "</ul></body></html>";
            res.send(html);
        });
    });
});

// Erica Bertolozzi Part 2
app.post('/ericapart2', function(req, res) {
    var album_title = req.body.title;
    console.log("Attempting to find Spotify ID for " + album_title + " from the API.");

    // Use the searchAlbums API function to find the ID of the album to use next
    spotifyApi.searchAlbums(album_title).then(
        function(data) {
            var album_id = data.body.albums.items[0]['id'];
            var release_date = data.body.albums.items[0]['release_date'];
            // Get the tracks from the album and add the first track to the database
            spotifyApi.getAlbumTracks(album_id).then(
                function(data) {
                    var artist = data.body.items[0].artists[0]['name'];

                    var track_name = data.body.items[0]['name'];

                    // Add track to the collection
                    MongoClient.connect(url, function(err, db) {
                        if (err) throw err;
                        var myobj = { "Track Name": track_name, "Artist Name" : artist, "Album Name": album_title, "Date" : release_date };
                        var dbo = db.db("lab5");
                        var collection = dbo.collection("transformed");
                        collection.insertOne(myobj, function(err, res) {
                          if (err) throw err;
                          console.log( "Added " + track_name + " by " + artist + " to the database." );
                          db.close();
                        });
                    });

                },
                function(err) {
                    console.log('Something went wrong!', err);
                }
            );
        }
    );

});

////////////// Helena O'Sullivan ///////////////////////
// PART 1
app.get('/helena.html', function(req, res){
  res.sendFile(__dirname + '/Lab4/src/app/spotify/helena.html');
});
app.get('/osullhpart1', function(req, res){
  // console.log( "osullhpart1 called" ); // Debug Statement
 MongoClient.connect(url, function(err, db) {
  if (err) throw err;
   var dbo = db.db("lab5");
   var collection = dbo.collection("transformed");
   var mysort_osullh = { 'Track Name': 1 };
   dbo.collection('transformed').find().sort(mysort_osullh).toArray(function(err, data) {
     var rand_var=JSON.stringify(data);
     console.log(rand_var);
     var htmlpage_osullh = "<!DOCTYPE html><html><head></head><body><h1>Ordered List of Songs:</h1><ul><style>body {background-image: linear-gradient(to bottom right, rgb(80, 161, 134), rgb(17, 80, 45));}h1{text-align:center;}</style>";
     for (var itr = 0; itr < data.length; itr++) {
      htmlpage_osullh += '<li>'+'<b>Track: </b>  ' + data[itr]['Track Name'] +'</li>';
     }
     res.send(htmlpage_osullh)
 });
   console.log("Connected")
});
});


// PART 2
app.get('/osullhpart2', function (req, res) {
    // Get track name from frontend form
    var track = req.query.track;
    console.log( "Attempting to add " + track + " to the database." );
    // Get track's genre from Spotify API
    spotifyApi.searchTracks( track ).then(function(data) { // Get track ID
      track_id = data.body['track']['items'][0]['id'];
      spotifyApi.getArtist(track_id, 'GB').then(function(data) {
        // DB takes Track Name, Artist Name, Album Name, Date, and Genre
        var track_name = data.body["track"][0]["name"];
        console.log("Track Name: " + track_name);
        var album_name = data.body["track"][0]["album"]["name"];
        console.log("Album Name: " + album_name);
        var date = data.body["track"][0]["album"]["release_date"];
        console.log("Date: " + date);
        var genre = null;

        // Add top track to the collection
        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            var osullh_obj = { "Track Name": track_name, "Artist Name" : artist, "Album Name": album_name, "Date" : date };
            var dbo = db.db("lab5");
            var collection = dbo.collection("transformed");
            collection.insertOne(osullh_obj, function(err, res) {
              if (err) throw err;
              console.log( "Added " + album_name + " by " + artist + " to the database." );
              db.close();
            });
        });
dbo.collection('transformed').insertOne(data,function(err, collection){
 if (err) throw err;
 console.log("Album was Inserted Without Error");
 res.send("Album was Inserted Without Error")
});
});
});
});

/////////////////////////////////////////////////////

////////////// Lauren McAlarney///////////////////////
app.get('/lauren.html', function(req, res){
  var artists = [];
  var images = [];
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("lab5");
    var collection = dbo.collection("transformed");
    var cursor = collection.find();
    output = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8/">
      <title>All Artists</title>
      <link rel="preconnect" href="https://fonts.gstatic.com">
      <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
      <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet">
    </head>
    <body>
      <h1>Artists</h1>
      <div class="container">
      </div>
    </body>
    `;
    cursor.each(function(err, item) {
      if(item == null) {
          db.close();
          return;
      }
      //console.log(item['Artist Name']);
      output += '<p>' + item['Artist Name'] + '</p>';
    });
    res.send(output);
    //res.sendFile(__dirname + '/Lab4/src/app/spotify/lauren.html');
  });
});


/////////////////////////////////////////////////////
app.get('/manya.html',function(req, res){
  res.sendFile(__dirname + '/Lab4/src/app/spotify/manya.html');
});

app.get('/display', function(req, res){
     resultarray=[]
    MongoClient.connect(url, function(err, db) {
      var dbo = db.db("lab5");
      var collection = dbo.collection("transformed");
      dbo.collection('transformed').find({},{projection:{_id:0,'Artist Name':1,'Track Name':1, 'Album Name':1,Genre:1}}).toArray(function(err, docs) {
        var x=JSON.stringify(docs);
        console.log(x);
        var htmlBegin = "<!DOCTYPE html><html><head></head><body><h1>Database</h1><ul><style>body {background-color:lightblue;}h1{text-align:center;}</style>";
        for (var s = 0; s < docs.length; s++) {
          htmlBegin += '<li>'+ '<b>Album Name:</b>  '+ docs[s]['Album Name'] +'  ' + '<b>Track: </b>  ' + docs[s]['Track Name'] + " <b>Artist:</b> " + docs[s]['Artist Name'] + '</li>';
        }
        res.send(htmlBegin)
    });
      console.log("Connected")
});
});

app.post('/manyapost', function (req, res) {
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("lab5");
    var collection = dbo.collection("transformed");
    var track= req.body.track;
    var artist= req.body.name;
    var album =req.body.album;
    var date = req.body.date;
    var genre =req.body.genre;
    var data = {
      "Track Name": track,
      "Artist Name":artist,
      "Album Name":album,
      "Date":date,
      "Genre":genre
  }
  dbo.collection('transformed').insertOne(data,function(err, collection){
    if (err) throw err;
    console.log("Record inserted Successfully");
    res.send("Record Inserted Successfully")
});
  });
});

//SIMI

//part 1
//posts top Country artists
app.get('/simi.html', function(req, res){
    MongoClient.connect(url, function(err, db) {
    var dbo = db.db("lab5");
    var collection = dbo.collection("transformed");
    myCursor = collection.find({"Genre" : "Country"});

    myCursor.each(function(err, item) {
      var web = "<!DOCTYPE html><html><head>Top Country Artists</head><body>";
      for(let x=0; x<item.length; x++){
        web += item[x]['Artist Name'];
            }
          web += "</body></html>";
          db.send(web);
    });
    res.sendFile(__dirname + '/Lab4/src/app/spotify/simi.html');
});

});

//part 2
app.post('/simi.html', function (req, res) {
  MongoClient.connect(url, function(err, db) {
    var dbo = db.db("lab5");
    var collection = dbo.collection("transformed");
    myCursor = collection.find({"Genre" : "Country"});
    var artist;
    myCursor.each(function(err, item) {
      for(let x=0; x<item.length; x++){
         var artist = item[x]['Artist Name'];
            }
    });
      MongoClient.connect(url, function(err, db){
        var obj = {"Artist Name" : artist}
        var dbo = db.db("lab5");
        var collection = dbo.collection("transformed");
        collection.insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log( "Added " + artist + " to the database." );
          db.close();
      });

    });



});
});


// PREP FOR VIRGINIA'S PAGE
html1 = `
<!-- virginia -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8/">
  <title>All Artists</title>
  <link rel="preconnect" href="https://fonts.gstatic.com">
  <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css" integrity="sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Varela+Round&display=swap" rel="stylesheet">

  <style>
    body, html {
      height: 100%;
      margin: 0;
      background-repeat: no-repeat;
      background-attachment: fixed;
      font-family: 'Varela Round', sans-serif;
      background-image: linear-gradient(rgba(0,0,0,1), rgba(96,98,101,1));
    }

    h1 {
      margin-top: 2%;
      font-size: 300%;
      width: 100%;
      text-align: center;
      color: #1FD662;
      font-weight: bold;
    }

    p {
      margin-top: 2%;
      font-size: 150%
      font-family: 'Varela Round', sans-serif;
      color: white;
    }

    .container {
      text-align: center;
      color: white;
      margin-bottom: 2%;
    }

    .artist-form {
      text-align: center;
    }

    .button {
      border-radius: 20px;
      width: 125px;
      height: 40px;
      display: inline;
      font-family: 'Varela Round', sans-serif;
      color: white;
      background-color: #1FD662;
      border-style: none;
      letter-spacing: 2px;
    }

    #artist {
      border-radius: 20px;
      width: 250px;
      height: 40px;
      display: inline;
      font-family: 'Varela Round', sans-serif;
      border-style: none;
      letter-spacing: 2px;

      .footer {
        text-align: center !important;
        justify-content: center;
      }

  </style>
</head>
<body>
  <h1>Artists</h1>
  <div class="container">
`;

html2 = `
<div class="container">
  <h1>Add an Artist's Top Song</h1>
  <p>Enter an Artist's name, click RUN, and watch as that artist's top track is added to the database!</p>
  <div class="form-group artist-form">
    <form id="artist" action="/virginia.html/artist" method="GET">
      <input type="text" id="artist" name="artist" placeholder="Enter Artist Name">
      <input type="submit" class="button" value="ADD" id="submit">
    </form>
  </div>
</div>
<footer class="container">
    <p>Design by Team luna</p>
</footer>
</body>
`;

// PART 1
app.get('/virginia.html', function(req, res) {
  var artists = [];
  var images = [];
  MongoClient.connect(url, function(err, db) {
    if (err) throw err;
    var dbo = db.db("lab5");
    var collection = dbo.collection("transformed");
    var cursor = collection.find();
    // Execute the each command, triggers for each document
    cursor.each(function(err, item) {
        // If the item is null then the cursor is exhausted/empty and closed
        if(item == null) {
            db.close(); // you may not want to close the DB if you have more code....
            return;
        }
        var artist_id = null;
        spotifyApi.searchArtists( item['Artist Name'] ).then(function(data) {
          if( !data.body['artists']['items'][0] ) {
            console.log( "Could not add " + item['Artist Name'] + " to collage" );
          }
          else {
            // console.log( data.body['artists']['items'][0] );
            artist_id = data.body['artists']['items'][0]['id']; // Get the ID from the artist name
            spotifyApi.getArtist(artist_id).then(function(data) {
              artists.push(item['Artist Name']);
              images.push(data.body['images'][0]['url']);
            }, function(err) {
              console.log("Could not search " + item['Artist Name'] + " with Spotify API" );
            });
          }
        }, function(err) {
          console.log("Could not search " + item['Artist Name'] + " with Spotify API" );
        });
      });
      // Removed duplicates
      setTimeout(() => {  artists = [...new Set(artists)]; }, 2000);
      setTimeout(() => {  images = [...new Set(images)]; }, 2000);
      setTimeout(() => {
        output = '';
        for (var i = 0; i < images.length; i++) {
          output += '<img src="' + images[i] + '" alt="image" width="150px" height="150px">';
        }
        output += '<p>';
        for (var i = 0; i < artists.length; i++) {
          output += artists[i];
          if( i != artists.length-1 ) {
            output += '; ';
          }
        }
        output += '</p></div>';
        res.send( html1 + output + html2 );
      }, 2000);
    });
  });

  // PART 2
  app.get('/virginia.html/artist', function(req, res){
    // Get artist name from frontend form
    var artist = req.query.artist;
    console.log( "Attempting to add " + artist + " to the database." );
    // Get artist's top track from Spotify API
    spotifyApi.searchArtists( artist ).then(function(data) { // Get artist ID
      artist_id = data.body['artists']['items'][0]['id'];
      spotifyApi.getArtistTopTracks(artist_id, 'GB').then(function(data) { // Get top track
        // DB takes Track Name, Artist Name, Album Name, Date, and Genre
        var track_name = data.body["tracks"][0]["name"];
        console.log("Track Name: " + track_name);
        var album_name = data.body["tracks"][0]["album"]["name"];
        console.log("Album Name: " + album_name);
        var date = data.body["tracks"][0]["album"]["release_date"];
        console.log("Date: " + date);
        var genre = null;

        // Add top track to the collection
        MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          var myobj = { "Track Name": track_name, "Artist Name" : artist, "Album Name": album_name, "Date" : date };
          var dbo = db.db("lab5");
          var collection = dbo.collection("transformed");
          collection.insertOne(myobj, function(err, res) {
            if (err) throw err;
            console.log( "Added " + track_name + " by " + artist + " to the database." );
            db.close();
          });
        });

        // Refresh the frontend
        setTimeout(() => {  res.redirect('/virginia.html'); }, 2000);


      }, function(err) {
      console.log( "Could not add " + artist + " to the database." );
      });
    }, function(err) {
      console.log( "Could not add " + artist + " to the database." );
    });
  });

app.listen(port, () => {
	console.log('Listening on *:4200');
});
