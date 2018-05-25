import * as express from 'express'
import { join } from 'path'
import * as favicon from 'serve-favicon'

import * as session from 'client-sessions'

// parsers
import * as bodyParser from 'body-parser'
import * as cookieParser from 'cookie-parser'


// misc
import { generateRandomString } from './Tools'

// routes
import { login } from './Login'

const stateKey = 'spotify_auth_state'
export { stateKey }

var app = express();
app.set('view engine', 'ejs');


// specify parsers
app
    .use(bodyParser.urlencoded({ extended: true }))
    .use(bodyParser.json())
    .use(cookieParser())


// specify session
app.use(session({
    cookieName: 'session',
    secret: 'random_string_goes_here',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
}))


// specify favicon
app.use(favicon(join(__dirname, 'public', 'favicon.ico')))

// static serve public directory
app.use(express.static(join(__dirname, 'public')))




app.get('/login', login);



var server = app.listen(8888, () => console.log('auxCord listening on 8888'))
