import { default as constants } from "./constants";

const initialState = {
  loggedIn: false,
  user: null,
  loading: false
}

export default function(state = initialState, action){
  switch(action.type){
    case constants.AUTHENTICATE:
      return {
        ...state,
        loading: true
      }
    case constants.AUTHENTICATE_SUCCESS:
      return {
        ...state,
        loggedIn: true,
        user: action.user,
        loading: false,
      }
    case constants.AUTHENTICATE_FAILURE:
      return {
        ...state,
        loading: false
      }
    default:
      return state;
  }
}