import {
  UserRequest,
  UserResponse
} from '../Types'

export function join(req: UserRequest, res: UserResponse) {
  res.redirect('/join.html')
}