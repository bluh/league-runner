import React from "react";
import { Route, Switch } from "react-router";
import LeagueAdmin from "./LeagueAdmin";
import LeagueDetails from "./LeagueDetails";
import LeagueIndex from "./LeagueIndex";
import LeagueNew from "./LeagueNew";

import "./League.scss";
import Authorizer from "../../components/authorizer/Authorizer";

class Leagues extends React.Component {
  render() {
    const path = this.props.match.path;
    return (
      <div className="leagues-container">
        <Authorizer>
          <Switch>
            <Route path={`${path}/`} exact>
              <LeagueIndex />
            </Route>

            <Route path={`${path}/new`} exact component={LeagueNew}/>

            <Route path={`${path}/:leagueID`} exact component={LeagueDetails} />

            <Route path={`${path}/:leagueID/admin`} exact component={LeagueAdmin}/>
          </Switch>
        </Authorizer>
      </div>
    )
  }
}

export default Leagues;