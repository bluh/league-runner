import constants from "./constants";
import leagueServices from "../../services/league";

function getUserLeagues() {
  const request = () => ({ type: constants.GET_USER_LEAGUES });
  const success = (data) => ({ type: constants.GET_USER_LEAGUES_SUCCESS, userLeagues: data});
  const failure = (err) => ({ type: constants.GET_USER_LEAGUES_FAILURE });

  return (dispatch) => {
    dispatch(request());
    leagueServices.getUserLeagues()
      .then(data => {
        dispatch(success(data));
      })
      .catch(err => {
        dispatch(failure())
      })
  }
}

export default {
  getUserLeagues
}