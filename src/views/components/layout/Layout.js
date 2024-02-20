import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Col, Layout as AntdLayout, Menu, Row, Badge } from "antd";
import { Link, withRouter } from "react-router-dom";

import "./layout.scss";

import userActions from "../../reducers/user/action";
import { AreaChartOutlined, CloseOutlined, ContainerOutlined, EllipsisOutlined, HomeOutlined, MenuOutlined, OrderedListOutlined } from "@ant-design/icons";

class Layout extends React.Component {
  constructor(props) {
    super(props);

    this.menuKeys = [
      { key: "/", label: "Home", icon: <HomeOutlined /> },
      { key: "/leagues", label: "Leagues", icon: <OrderedListOutlined /> },
      { key: "/survey", label: "Survey", icon: <ContainerOutlined /> },
      { key: "/statistics", label: "Statistics", icon: <AreaChartOutlined /> },
    ]

    this.state = {
      siderOpen: false
    }
  }

  logoutUser = () => {
    this.props.logout((err) => {
      if (!err)
        this.navigate("/");
    });
  }

  navigate = (toPage) => {
    this.setState({
      siderOpen: false
    });

    this.props.history.push(toPage);
  }

  getSubmenuEllipsis = (numSurveys) => {
    if(numSurveys === 0){
      return <EllipsisOutlined style={{ color: "#FFF" }}/>
    }

    return <Badge count={numSurveys} size="small" offset={[8, 0]}><EllipsisOutlined style={{ color: "#FFF" }}/></Badge>
  }

  render() {
    const menuKeys = (this.props.location.pathname || "/").match(/\/(.*?)(?:\/|$)/);
    const selectedMenuKey = menuKeys ? ("/" + menuKeys[1]) : "/";
    const numSurveys = 0;
    return (
      <AntdLayout className="layout-container">
        <div className="show-on-small sider-content">
          <div className={`sider-backdrop ${this.state.siderOpen ? "open" : ""}`} onClick={() => this.setState({ siderOpen: false })} />
          <div className={`sider-content bg-2 ${this.state.siderOpen ? "open" : ""}`}>
            <Row justify="space-between" className="sider-controls">
              <Col className="sider-logout-btn">
                {this.props.loggedIn ? (
                  <>
                    <span>Hello {this.props.username}!</span>
                    <Button type="link" onClick={this.logoutUser}>Log Out</Button>
                  </>
                ) : (
                  <>
                    <span>You are not logged in.</span>
                    <Button type="link" onClick={() => this.navigate("/login")}>Log in</Button>
                  </>
                )}
              </Col>
              <Col>
                <Button type="text" size="large" icon={<CloseOutlined />} onClick={() => this.setState({ siderOpen: false })} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <Menu theme="dark" mode="vertical" onClick={(item) => this.navigate(item.key)} items={this.menuKeys} selectedKeys={[selectedMenuKey]} rootClassName="layout-navbar" overflowedIndicator={this.getSubmenuEllipsis(numSurveys)} />
              </Col>
            </Row>
          </div>
        </div>
        <AntdLayout.Header className="layout-header">
          <Row style={{ height: "100%" }} wrap={false} className="show-on-small" gutter={[12, 0]} >
            <Col flex="none" offset={2}>
              <Button type="text" className="sider-toggle" icon={<MenuOutlined />} onClick={() => this.setState({ siderOpen: true })} />
            </Col>
            <Col flex="auto">
              <Link to="/"><h1>RDPRFL</h1></Link>
            </Col>
          </Row>
          <Row style={{ height: "100%" }} wrap={false} className="hide-on-small">
            <Col>
              <Link to="/"><h1>RPDR Fantasy League</h1></Link>
            </Col>
            <Col flex="auto">
              <Menu theme="dark" mode="horizontal" onClick={(item) => this.navigate(item.key)} items={this.menuKeys} selectedKeys={[selectedMenuKey]} rootClassName="layout-navbar" overflowedIndicator={this.getSubmenuEllipsis(numSurveys)} />
            </Col>
            <Col className="layout-logout-btn">
              {this.props.loggedIn ? (
                <>
                  <span>Hello {this.props.username}</span>
                  <Button type="link" onClick={this.logoutUser}>Log Out</Button>
                </>
              ) : (
                <>
                  <Button type="link" onClick={() => this.navigate("/login")}>Log in</Button>
                </>
              )}
            </Col>
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

Layout.propTypes = {
  loggedIn: PropTypes.bool,
  username: PropTypes.string,
  logout: PropTypes.func
}

Layout.defaultProps = {
  loggedIn: false,
  username: "",
  logout: () => { }
}

const mapStateToProps = (state) => {
  const { loggedIn, user } = state.User;

  return {
    loggedIn,
    username: user?.name
  }
}

const mapDispatchToProps = {
  logout: userActions.logoutUser
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Layout));