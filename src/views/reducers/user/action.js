import { default as constants } from "./constants";
import userServices from "../../services/user";

function authenticateUser(username, password){
  const request = () => ({ type: constants.AUTHENTICATE });
  const success = (user) => ({ type: constants.AUTHENTICATE_SUCCESS, user });
  const failure = () => ({ type: constants.AUTHENTICATE_FAILURE });

  return (dispatch) => {
    dispatch(request())
    userServices.login(username, password)
      .then(result => {
        dispatch(success(result));
      })
      .catch(err => {
        dispatch(failure());
      })
  }
}

export default {
  authenticateUser
}