import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

class Authorizer extends React.Component {
  render() {
    var authorized = false;
    if (this.props.loggedIn && this.props.isLoggedIn) {
      if (this.props.roles && this.props.roles.length > 0 && this.props.userData) {
        authorized = this.props.roles.every(r => this.props.userData.roles.indexOf(r) > 0);
      } else {
        authorized = true
      }
    }
    return authorized ? this.props.children : (<p>You must be logged in to view this page. <Link to="/login">Login here</Link>.</p>);
  }
}

Authorizer.propTypes = {
  loggedIn: PropTypes.bool,
  roles: PropTypes.array,
  isLoggedIn: PropTypes.bool,
  userData: PropTypes.object
}

Authorizer.defaultProps = {
  loggedIn: true,
  roles: null,
  isLoggedIn: false,
  userData: null
}

const mapStateToProps = (state) => {
  const { loggedIn, user } = state.User;

  return { isLoggedIn: loggedIn, userData: user };
}

export default connect(mapStateToProps)(Authorizer);