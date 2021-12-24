import { default as constants } from "./constants";

const initialState = {
  loggedIn: false,
  user: null,
  loading: false
}

export default function(state = initialState, action){
  switch(action.type){
    case constants.AUTHENTICATE_LOGIN:
      return {
        ...state,
        user: action.user,
        loggedIn: true,
      }
    case constants.AUTHENTICATE_LOGOUT:
      return {
        ...state,
        user: null,
        loggedIn: false,
      }
    case constants.LOGIN:
      return {
        ...state,
        loading: true
      }
    case constants.LOGIN_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        user: action.data,
        loading: false,
      }
    case constants.LOGIN_FAILURE:
      return {
        ...state,
        loading: false
      }
    case constants.LOGOUT:
      return {
        ...state,
        loading: true
      }
    case constants.LOGOUT_SUCCESS:
      return {
        ...state,
        loggedIn: false,
        user: null,
        loading: false
      }
    case constants.REGISTER:
      return {
        ...state,
        loading: true
      }
    case constants.REGISTER_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        user: action.data,
        loading: false,
      }
    case constants.REGISTER_FAILURE:
      return {
        ...state,
        loading: false
      }
    default:
      return state;
  }
}