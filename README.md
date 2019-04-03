# auxCord

Sync Spotify accounts to build tailored playlists.

<img src="brand/home_page.png" alt="auxcord" width="800" >

View the live site at [http://auxcord.io](http://auxcord.io)

### [Won Best Cloud Based Hack at CUhackit 2018](https://devpost.com/software/auxcord)

## Setup

auxCord runs on Node.js. Install it [here](http://www.nodejs.org/download/).

After installation, clone this repo and run the following command inside the directory.

    $ npm install

In order to authenticate with the Spotify API you need to create a file called `keys.js` in the `src` directory
to store your client_id and client_secret. You can get your own API keys by creating a [Spotify app](https://developer.spotify.com/). Once you have your keys, add them to your file as shown below.

```
/*
   - Spotify API Keys -
   Replace the strings with your corresponding values. 
   We use redirect_uri of 'http://localhost:8888/callback' for local development. 
   We are using mlab for our db but the uri below just needs to be for your mongodb database.
*/
var keys = {
  client_id: 'CLIENT_ID',
  client_secret: 'CLIENT_SECRET',
  redirect_uri: 'REDIRECT_URI',
  mlab_db_uri: 'DATABSE_CONNECTION_URI'
};
module.exports = keys;
```

Finally run the server.

    $ node app.js
  or

    $ npm start

## Versioning

  We will use the [w.x.y.z](https://stackoverflow.com/questions/396429/how-do-you-know-what-version-number-to-use) system.
  
  * w - Major version, with many new features. The first public release of software is 1.X (pre-release versions are 0.X)
  * x - Significant release, but without groundbreaking new features
  * y - Bugfix releases
  * z - Patchlevel releases (fixing an emergency bug)

## To Do

* Allow for more than two users to sync their accounts
* Move .json file structure to some kind of database
* Add Google Analytics
* Allow users to choose whether to save playlists
* Add CSS animations
* Improve CSS design for mobile
* Add tags for SEO
* Extend data collection to recieve more than 50 playlists
* Extend data collection to reviece more than 50 tracks per playlist
* Fix socket.io socket management


