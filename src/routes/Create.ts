import { setAccessToken } from '../SpotifyConnector'
import { getUserData } from './../Gather'
import { io } from '../server'
import { writeFile } from 'fs'

import {
  UserRequest,
  UserResponse
} from '../Types'


export function create(req: UserRequest, res: UserResponse) {
  setAccessToken(req.session.access_token)
  getUserData(req).then((userData) => {

    res.render('create.ejs', { auxId: userData.auxId })

    io.on('connection', (socket) => {

      userData.socketId = socket.id

      var data = JSON.stringify(userData)
      writeFile('data/' + userData.auxId + '.json', data, 'utf8', (err) => {
        if (err) throw err;
      })
    })
  })
}
