import { setAccessToken, getUserData } from '../SpotifyConnector'
import { io } from '../server'
import { writeFile } from 'fs'


export function create(req, res) {
    setAccessToken(req.session.acess_token)
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
