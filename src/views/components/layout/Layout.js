import React from "react";
import { connect } from "react-redux";
import { Button, Col, Layout as AntdLayout, Menu, Row } from "antd";
import { Link, withRouter } from "react-router-dom";

import "./layout.scss";

import userActions from "../../reducers/user/action";

class Layout extends React.Component{

  logoutUser = () => {
    this.props.logout();
  }

  render() {
    return (
      <AntdLayout className="layout-container">
        <AntdLayout.Header className="layout-header">
          <Row style={{ height: "100%" }}>
            <Col>
              <Link to="/"><h1>RPDR Fantasy League</h1></Link>
            </Col>
            <Col flex="auto">
              <Menu theme="dark" mode="horizontal" selectedKeys={[this.props.location.pathname || "/"]} className="layout-navbar">
                <Menu.Item key="/" onClick={() => this.props.history.push("/")}>
                  Home
                </Menu.Item>
                <Menu.Item key="/seasons" onClick={() => this.props.history.push("/seasons")}>
                  Seasons
                </Menu.Item>
                <Menu.Item key="/survey" onClick={() => this.props.history.push("/survey")}>
                  Surveys
                </Menu.Item>
                <Menu.Item key="/statistics" onClick={() => this.props.history.push("/statistics")}>
                  Statistics
                </Menu.Item>
              </Menu>
            </Col>
            {this.props.loggedIn && (
              <Col className="layout-logout-btn">
                <Button type="link" onClick={this.logoutUser}>Log Out</Button>
              </Col>
            )}
          </Row>
        </AntdLayout.Header>
        <AntdLayout.Content className="layout-content">
          <Row>
            <Col className="layout-content-container" span={24}>
              {this.props.children}
            </Col>
          </Row>
        </AntdLayout.Content>
      </AntdLayout>
    );
  }
}

const mapStateToProps = (state) => {
  const { loggedIn, user } = state.User;

  return {
    loggedIn,
    user
  }
}

const mapDispatchToProps = {
  logout: userActions.logoutUser
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Layout));