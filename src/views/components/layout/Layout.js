import React from "react";
import { connect } from "react-redux";
import { default as userActions } from "../../reducers/user/action";

class Layout extends React.Component{

  logIn = () => {
    this.props.authenticateUser("Aadu", "aadus password");
  }

  render() {
    return (
      <div className="layout">
        <h1>Drag League</h1>
        {this.props.loggedIn ? 
          (<p>Logged in as: {this.props.user.user}</p>)
          : (<button onClick={this.logIn}>Log In</button>)
        }
        {this.props.loading && <p>Loading...</p>}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { loggedIn, user, loading } = state.User;

  return {
    loggedIn,
    user,
    loading
  }
}

const mapDispatchToProps = {
  authenticateUser: userActions.authenticateUser
}

export default connect(mapStateToProps, mapDispatchToProps)(Layout);