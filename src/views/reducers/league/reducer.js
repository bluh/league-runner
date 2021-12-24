import constants from "./constants";

const initialState = {
  userLeagues: [],
  loadingUserLeagues: false,
  league: {},
  loadingLeague: false,
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
        userLeagues: action.data,
        loadingUserLeagues: false
      }
    case constants.GET_USER_LEAGUES_FAILURE:
      return {
        ...state,
        userLeagues: [],
        loadingUserLeagues: false
      }
    case constants.NEW_LEAGUE:
      return {
        ...state,
        loadingLeague: true,
      }
    case constants.NEW_LEAGUE_SUCCESS:
      return {
        ...state,
        loadingLeague: false,
      }
    case constants.NEW_LEAGUE_FAILURE:
      return {
        ...state,
        loadingLeague: true,
      }
    default:
      return state;
  }
}