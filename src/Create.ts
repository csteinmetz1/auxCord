import keys from './Keys'
import { getUserData } from './Gather'


export function create(req, res) {
  keys.spotifyApi.setAccessToken(req.session.access_token);
  getUserData(req).then(
    function (userData) {

      res.render('create.ejs', { auxId: userData.auxId });

      // init socket.io
      io.on('connection', function (socket) {
        userData.socketId = socket.id;

        var data = JSON.stringify(userData);
        fs.writeFile('data/' + userData.auxId + '.json', data, 'utf8', function (err) {
          if (err) throw err;
        });
      });
    });
}