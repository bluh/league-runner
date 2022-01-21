import constants from "./constants";
import leagueServices from "../../services/league";
import { simpleReducerHelper } from '../helpers';

function getUserLeagues() {
  return simpleReducerHelper({
    request: constants.GET_USER_LEAGUES,
    success: constants.GET_USER_LEAGUES_SUCCESS,
    failure: constants.GET_USER_LEAGUES_FAILURE
  }, leagueServices.getUserLeagues);
}

function getLeague(id) {
  return simpleReducerHelper({
    request: constants.GET_LEAGUE,
    success: constants.GET_LEAGUE_SUCCESS,
    failure: constants.GET_LEAGUE_FAILURE
  }, leagueServices.getLeague, [id]);
}

function createNewLeague(data, finished) {
  return simpleReducerHelper({
    request: constants.NEW_LEAGUE,
    success: constants.NEW_LEAGUE_SUCCESS,
    failure: constants.NEW_LEAGUE_FAILURE
  }, leagueServices.newLeague, [data], finished);
}

function getLeagueUsers(id){
  return simpleReducerHelper({
    request: constants.GET_LEAGUE_USERS,
    success: constants.GET_LEAGUE_USERS_SUCCESS,
    failure: constants.GET_LEAGUE_USERS_FAILURE
  }, leagueServices.getLeagueUsers, [id]);
}

function getLeagueRules(id){
  return simpleReducerHelper({
    request: constants.GET_LEAGUE_RULES,
    success: constants.GET_LEAGUE_RULES_SUCCESS,
    failure: constants.GET_LEAGUE_RULES_FAILURE
  }, leagueServices.getLeagueRules, [id]);
}

export default {
  getUserLeagues,
  getLeague,
  createNewLeague,
  getLeagueUsers,
  getLeagueRules
}