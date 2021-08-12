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

function logoutUser(callback) {
  const request = () => ({ type: constants.LOGOUT });
  const success = () => ({ type: constants.LOGOUT_SUCCESS });
  return (dispatch) => {
    dispatch(request());
    userServices.logout()
      .then(() => {
        dispatch(success());
        callback();
      })
  }
}

function registerUser(username, password, callback){
  const request = () => ({ type: constants.REGISTER });
  const success = (user) => ({ type: constants.REGISTER_SUCCESS, user });
  const failure = () => ({ type: constants.REGISTER_FAILURE });

  return (dispatch) => {
    dispatch(request())
    userServices.register(username, password)
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
  loginUser,
  logoutUser,
  registerUser
}