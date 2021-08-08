import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";

class Home extends React.Component {

  render() {
    return (
      <div className="home-page">
        <h1>Welcome to the Drag League!</h1>
        {this.props.loggedIn ?
        (<p>Welcome {this.props.username}!</p>)
        : (<p>You are not logged in. <Link to="/login">Log In</Link> or <Link to="/register">Register</Link></p>)}
      </div>
    )
  }
}

const mapStateToProps = state => {
  const { loggedIn, user } = state.User;

  return {
    loggedIn,
    username: user ? user.user : ""
  }
}

export default connect(mapStateToProps)(Home);