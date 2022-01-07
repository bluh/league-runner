import constants from "./constants";

const initialState = {
  userLeagues: [],
  loadingUserLeagues: false,
  league: {},
  loadingLeague: false,
  leagueUsers: [],
  loadingLeagueUsers: false
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
        loadingLeague: false,
      }
    case constants.GET_LEAGUE:
      return {
        ...state,
        loadingLeague: true
      };
    case constants.GET_LEAGUE_SUCCESS:
      return {
        ...state,
        league: action.data,
        loadingLeague: false
      }
    case constants.GET_LEAGUE_FAILURE:
      return {
        ...state,
        league: [],
        loadingLeague: false
      }
    case constants.GET_LEAGUE_USERS:
      return {
        ...state,
        loadingLeagueUsers: true
      };
    case constants.GET_LEAGUE_USERS_SUCCESS:
      return {
        ...state,
        leagueUsers: action.data,
        loadingLeagueUsers: false
      }
    case constants.GET_LEAGUE_USERS_FAILURE:
      return {
        ...state,
        leagueUsers: [],
        loadingLeagueUsers: false
      }
    default:
      return state;
  }
}