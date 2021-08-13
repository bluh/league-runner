import React from "react";
import LeagueBreadcrumb from "./LeagueBreadcrumb";

class LeagueDetails extends React.Component {

  render() {
    return (
      <div className="league-details">
        <LeagueBreadcrumb leagueName="League1" leagueID={1}/>
        <h1>Looking at details for {this.props.match.params.leagueID}.</h1>
      </div>
    )
  }
}

export default LeagueDetails;