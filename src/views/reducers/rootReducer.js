import { combineReducers } from "redux";

import { default as User } from "./user/reducer";
import { default as League } from "./league/reducer";

export default combineReducers({
  User,
  League
 });