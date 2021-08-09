import { default as constants } from "./constants";
import userServices from "../../services/user";

function authenticateUser(user) {
  if(user){
    return ({ type: constants.AUTHENTICATE_LOGIN, user })
  }else{
    return ({ type: constants.AUTHENTICATE_LOGOUT })
  }
}

function loginUser(username, password, callback){
  const request = () => ({ type: constants.LOGIN });
  const success = (user) => ({ type: constants.LOGIN_SUCCESS, user });
  const failure = () => ({ type: constants.LOGIN_FAILURE });

  return (dispatch) => {
    dispatch(request())
    userServices.login(username, password)
      .then(result => {
        dispatch(success(result));
        callback(result);
      })
      .catch(err => {
        dispatch(failure());
      })
  }
}

export default {
  authenticateUser,
  loginUser
}