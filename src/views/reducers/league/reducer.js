import constants from "./constants";

const initialState = {
  userLeagues: [],
  loadingUserLeagues: false
}

export default function(state = initialState, action){
  switch(action.type){
    case constants.GET_USER_LEAGUES:
      return {
        ...state,
        loadingUserLeagues: true
      };
    case constants.GET_USER_LEAGUES_SUCCESS:
      return {
        ...state,
        userLeagues: action.userLeagues,
        loadingUserLeagues: false
      }
    case constants.GET_USER_LEAGUES_FAILURE:
      return {
        ...state,
        userLeagues: [],
        loadingUserLeagues: false
      }
    default:
      return state;
  }
}