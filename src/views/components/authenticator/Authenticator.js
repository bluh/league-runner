import React from "react";
import { connect } from "react-redux";
import { Spin } from "antd";
import userService from "../../services/user";
import userActions from "../../reducers/user/action";

class Authenticator extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      initAuth: false
    }
  }

  componentDidMount = () => {
    userService.getUser()
      .then(data => {
        this.props.authenticateUser(data);
        this.setState({initAuth: true})
      })
  }

  render() {
    return (
      <Spin spinning={!this.state.initAuth}>
        {this.props.children}
      </Spin>
    );
  }
}

const mapStateToProps = () => ({})

const mapDispatchToProps = {
  authenticateUser: userActions.authenticateUser
}

export default connect(mapStateToProps, mapDispatchToProps)(Authenticator);