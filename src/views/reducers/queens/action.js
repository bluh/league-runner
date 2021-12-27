import constants from "./constants";
import { simpleReducerHelper } from "../helpers";
import queenService from "../../services/queen";

function getQueensList(id){
  return simpleReducerHelper({
    request: constants.GET_QUEENS,
    success: constants.GET_QUEENS_SUCCESS,
    failure: constants.GET_QUEENS_FAILURE
  }, queenService.getQueensInLeague, [id]);
}

export default {
  getQueensList,
}