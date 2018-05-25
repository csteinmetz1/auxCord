import { generateRandomString } from './../Tools'
import { stringify } from 'querystring'
import keys from './../Keys'
import { stateKey } from './../server'


export function login(req, res) {
    var state = generateRandomString(16);
    res.cookie(stateKey, state);

    // your application requests authorization
    var scope = 'user-read-private user-top-read playlist-read-private playlist-read-collaborative playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize?' +
        stringify({
            response_type: 'code',
            client_id: keys.clientId,
            scope: scope,
            redirect_uri: keys.redirectUri,
            state: state
        }));
}
