import express from 'express'
import socket from 'socket.io'

import path from 'path'
import favicon from 'serve-favicon'

import session from 'client-sessions'

// parsers
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'


// misc
import { generateRandomString } from './Tools'

// routes
import { login } from './routes/Login'
import { join } from './routes/Join'
import { callback } from './routes/Callback'
import { create } from './routes/Create'
import { refresh_token } from './routes/RefreshToken'


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
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')))

// static serve public directory
app.use(express.static(path.join(__dirname, 'public')))



// routes
app
  .get('/login', login)
  .get('/callback', callback)
  .get('/create', create)
  .get('/join', join)
  .get('/refresh_token', refresh_token)


var server = app.listen(8888, () => console.log('auxCord listening on 8888'))
var io = socket(server)

export { io }