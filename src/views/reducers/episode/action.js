import constants from "./constants";
import episodeService from "../../services/episode";
import { simpleReducerHelper } from "../helpers";


function getEpisode(id){
  return simpleReducerHelper({
    request: constants.GET_EPISODE,
    success: constants.GET_EPISODE_SUCCESS,
    failure: constants.GET_EPISODE_FAILURE
  }, episodeService.getEpisode, [id])
}

export default {
  getEpisode
}