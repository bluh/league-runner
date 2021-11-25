import React from "react";
import PropTypes from "prop-types";
import { Breadcrumb } from "antd";
import { Link } from "react-router-dom";

class LeagueBreadcrumb extends React.Component {

  render() {
    return (
      <Breadcrumb separator=">">
        <Breadcrumb.Item><Link to="/leagues">Leagues</Link></Breadcrumb.Item>
        {this.props.leagueName && (
          <Breadcrumb.Item>
            {this.props.leagueID ? (
              <Link to={`/leagues/${this.props.leagueID}`}>{this.props.leagueName}</Link>) : (
              this.props.leagueName
            )}
          </Breadcrumb.Item>
        )}
        {this.props.isAdmin && (<Breadcrumb.Item><Link to={`/leagues/${this.props.leagueID}/admin`}>Admin</Link></Breadcrumb.Item>)}
      </Breadcrumb>
    )
  }
}

LeagueBreadcrumb.propTypes = {
  leagueName: PropTypes.string,
  leagueID: PropTypes.number,
  isAdmin: PropTypes.bool
}

LeagueBreadcrumb.defaultProps = {
  leagueName: null,
  leagueID: null,
  isAdmin: false
}

export default LeagueBreadcrumb;