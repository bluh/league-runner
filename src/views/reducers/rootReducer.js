import { combineReducers } from "redux";

import { default as User } from "./user/reducer";
import { default as League } from "./league/reducer";
import { default as Metas } from './metas/reducer';
import { default as Queens } from "./queens/reducer"
import { default as Episode } from "./episode/reducer";

export default combineReducers({
  User,
  League,
  Metas,
  Queens,
  Episode
 });