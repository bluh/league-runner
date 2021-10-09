import React from "react";
import { connect } from "react-redux";
import { Button, Col, Layout as AntdLayout, Menu, Row } from "antd";
import { Link, withRouter } from "react-router-dom";

import "./layout.scss";

import userActions from "../../reducers/user/action";

class Layout extends React.Component{

  logoutUser = () => {
    this.props.logout(() => {
      this.props.history.push("/");
    });
  }

  render() {
    const menuKeys = (this.props.location.pathname || "/").match(/\/(.*?)(?:\/|$)/);
    const selectedMenuKey = menuKeys ? menuKeys[1] : "/";
    return (
      <AntdLayout className="layout-container">
        <AntdLayout.Header className="layout-header">
          <Row style={{ height: "100%" }}>
            <Col>
              <Link to="/"><h1>RPDR Fantasy League</h1></Link>
            </Col>
            <Col flex="auto">
              <Menu theme="dark" mode="horizontal" selectedKeys={[selectedMenuKey]} className="layout-navbar">
                <Menu.Item key="/" onClick={() => this.props.history.push("/")}>
                  Home
                </Menu.Item>
                <Menu.Item key="leagues" onClick={() => this.props.history.push("/leagues")}>
                  Leagues
                </Menu.Item>
                <Menu.Item key="survey" onClick={() => this.props.history.push("/survey")}>
                  Surveys
                </Menu.Item>
                <Menu.Item key="statistics" onClick={() => this.props.history.push("/statistics")}>
                  Statistics
                </Menu.Item>
              </Menu>
            </Col>
            {this.props.loggedIn && (
              <Col className="layout-logout-btn">
                <span>Hello {this.props.user.user}</span>
                <Button type="link" onClick={this.logoutUser}>Log Out</Button>
              </Col>
            )}
          </Row>
        </AntdLayout.Header>
        <AntdLayout.Content className="layout-content">
          <Row justify="center">
            <Col className="layout-content-container" span={20}>
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