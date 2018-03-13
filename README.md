# auxCord

Sync Spotify accounts to build tailored playlists.

![auxCord](brand/home_page.png)

View the live site at [auxcord.io](http://auxcord.io)

## Setup

auxCord runs on Node.js. Install it [here](http://www.nodejs.org/download/).

After installation, clone this repo and run the following command inside the directory.

    $ npm install

In order to authenticate with the Spotify API you need to create a file called `keys.js` in the `src` directory
to store your client_id and client_secret. You can get your own API keys by creating a [Spotify app](https://developer.spotify.com/). Once you have your keys, add them to your file as shown below.

```
// Spotify API keys
module.exports = {
    client_id : 'YOUR_CLIENT_ID',
    client_secret : 'YOUR_CLIENT_SECRET',
    redirect_uri : 'YOUR_REDIRECT_URI'
};
```

Finally run the server.

    $ node app.js

## To Do

* Allow for more than two users to sync their accounts
* Get favicon working
* Move .json file structure to some kind of database
* Add Google Analytics
* Allow users to choose whether to save playlists
* Add CSS animations 
* Edit the logo homepage redirection to '/'
* Improve CSS design for mobile 
* Add tags for SEO
* Add logic to exclude data from playlists named 'auxCord'
* Extend data collection to recieve more than 50 playlists
* Extend data collection to reviece more than 50 tracks per playlist
* Fix socket.io socket management  

### Won Best Cloud Based Hack at CUhackit 2018