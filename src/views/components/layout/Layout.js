import React from "react";
import { connect } from "react-redux";
import { Col, Layout as AntdLayout, Menu, Row } from "antd";

import "./layout.scss";
import { Link, withRouter } from "react-router-dom";

class Layout extends React.Component{

  render() {
    return (
      <AntdLayout className="layout-container">
        <AntdLayout.Header className="layout-header">
          <Row>
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

export default withRouter(connect(mapStateToProps)(Layout));