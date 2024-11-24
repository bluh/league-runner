import constants from "./constants";

const initialState = {
  userLeagues: [],
  loadingUserLeagues: false,
  league: {},
  loadingLeague: false,
  leagueUsers: [],
  loadingLeagueUsers: false,
  leagueRules: [],
  loadingLeagueRules: false,
  episodes: [],
  loadingEpisodes: false
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
    case constants.UPDATE_LEAGUE:
      return {
        ...state,
        loadingLeague: true,
      }
    case constants.UPDATE_LEAGUE_SUCCESS:
      return {
        ...state,
        league: {
          ...state.league,
          draftLeader: action.data.draftLeader,
          description: action.data.description,
          drafts: action.data.drafts,
          name: action.data.name,
        },
        loadingLeague: false,
      };
    case constants.UPDATE_LEAGUE_FAILURE:
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
    case constants.GET_LEAGUE_RULES:
      return {
        ...state,
        loadingLeagueRules: true
      };
    case constants.GET_LEAGUE_RULES_SUCCESS:
      return {
        ...state,
        leagueRules: action.data,
        loadingLeagueRules: false
      }
    case constants.GET_LEAGUE_RULES_FAILURE:
      return {
        ...state,
        leagueRules: [],
        loadingLeagueRules: false
      }
    case constants.GET_LEAGUE_EPISODES:
      return {
        ...state,
        loadingEpisodes: true
      };
    case constants.GET_LEAGUE_EPISODES_SUCCESS:
      return {
        ...state,
        episodes: action.data,
        loadingEpisodes: false
      }
    case constants.GET_LEAGUE_EPISODES_FAILURE:
      return {
        ...state,
        episodes: [],
        loadingEpisodes: false
      }
    default:
      return state;
  }
}