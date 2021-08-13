import React from "react";
import LeagueBreadcrumb from "./LeagueBreadcrumb";

class LeagueNew extends React.Component {

  render() {
    return (
      <div className="league-new">
        <LeagueBreadcrumb leagueName="New League"/>
        <h1>Looking at New.</h1>
      </div>
    )
  }
}

export default LeagueNew;