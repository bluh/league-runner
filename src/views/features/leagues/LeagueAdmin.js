import React from "react";
import LeagueBreadcrumb from "./LeagueBreadcrumb";

class LeagueAdmin extends React.Component {

  render() {
    return (
      <div className="league-admin">
      <LeagueBreadcrumb leagueName="League1" leagueID={1} isAdmin/>
        <h1>Looking at Admin.</h1>
      </div>
    )
  }
}

export default LeagueAdmin;