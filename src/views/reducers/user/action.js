import constants from "./constants";
import userServices from "../../services/user";
import { simpleReducerHelper } from "../helpers";

function authenticateUser(user) {
  if(user){
    return ({ type: constants.AUTHENTICATE_LOGIN, user })
  }else{
    return ({ type: constants.AUTHENTICATE_LOGOUT })
  }
}

function loginUser(username, password, callback){
  return simpleReducerHelper({
    request: constants.LOGIN,
    success: constants.LOGIN_SUCCESS,
    failure: constants.LOGIN_FAILURE
  }, userServices.login, [username, password], callback);
}

function logoutUser(callback) {
  return simpleReducerHelper({
    request: constants.LOGOUT,
    success: constants.LOGOUT_SUCCESS,
    failure: constants.LOGOUT_FAILURE
  }, userServices.logout, [], callback);
}

function registerUser(username, password, email, callback){
  return simpleReducerHelper({
    request: constants.REGISTER,
    success: constants.REGISTER_SUCCESS,
    failure: constants.REGISTER_FAILURE
  }, userServices.register, [username, password, email], callback);
}

function resetPassword(hash, password, callback){
  return simpleReducerHelper({
    request: constants.RESET,
    success: constants.RESET_SUCCESS,
    failure: constants.RESET_FAILURE
  }, userServices.sendReset, [hash, password], callback);
}

export default {
  authenticateUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword
}