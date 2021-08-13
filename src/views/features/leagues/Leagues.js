import React from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router";
import { Link } from "react-router-dom";
import LeagueAdmin from "./LeagueAdmin";
import LeagueDetails from "./LeagueDetails";
import LeagueIndex from "./LeagueIndex";
import LeagueNew from "./LeagueNew";

class Leagues extends React.Component {
  render() {
    const path = this.props.match.path;
    return (
      <div className="leagues-container">
        {this.props.loggedIn ? (
          <Switch>
            <Route path={`${path}/`} exact>
              <LeagueIndex />
            </Route>

            <Route path={`${path}/new`} exact component={LeagueNew}/>

            <Route path={`${path}/:leagueID`} exact component={LeagueDetails} />

            <Route path={`${path}/:leagueID/admin`} exact component={LeagueAdmin}/>
          </Switch>
        ) : (
          <p>You must be logged in to view this page. <Link to="/login">Login here</Link>.</p>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { loggedIn } = state.User;

  return { loggedIn };
}

export default connect(mapStateToProps)(Leagues);