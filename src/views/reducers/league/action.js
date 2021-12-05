import constants from "./constants";
import leagueServices from "../../services/league";

function getUserLeagues() {
  const request = () => ({ type: constants.GET_USER_LEAGUES });
  const success = (data) => ({ type: constants.GET_USER_LEAGUES_SUCCESS, userLeagues: data});
  const failure = (err) => ({ type: constants.GET_USER_LEAGUES_FAILURE, error: err });

  return (dispatch) => {
    dispatch(request());
    leagueServices.getUserLeagues()
      .then(data => {
        dispatch(success(data));
      })
      .catch(err => {
        dispatch(failure(err))
      })
  }
}

function createNewLeague(data, finished) {
  const request = () => ({ type: constants.NEW_LEAGUE });
  const success = (response) => ({ type: constants.NEW_LEAGUE_SUCCESS, newID: response });
  const failure = (err) => ({ type:constants.NEW_LEAGUE_FAILURE, error: err });

  return (dispatch) => {
    dispatch(request());
    leagueServices.newLeague(data)
      .then(response => {
        dispatch(success(response));
        finished(null);
      })
      .catch(err => {
        dispatch(failure(err));
        finished(err);
      })
  }
}

export default {
  getUserLeagues,
  createNewLeague
}