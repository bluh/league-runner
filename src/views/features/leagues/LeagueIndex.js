import React from "react";
import PropTypes from "prop-types";
import { Button, Col, List, Row, Spin } from "antd";
import { PlusSquareOutlined } from "@ant-design/icons";

import leagueActions from "../../reducers/league/action";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import LeagueBreadcrumb from "./LeagueBreadcrumb";

class LeagueIndex extends React.Component {

  componentDidMount(){
    this.props.getUserLeagues();
  }

  render() {
    return (
      <div className="leagues-index">
        <LeagueBreadcrumb />
        <h1>{this.props.username}&apos;s Leagues</h1>
        <Spin spinning={this.props.loading}>
          <Row>
            <Col flex="auto">
              <p>You are {this.props.leagues.length > 0 ? `in ${this.props.leagues.length} league${this.props.leagues.length > 1 ? "s" : ""}` : "not in any leagues"}.</p>
            </Col>
            <Col>
              <Link to="/leagues/new"><Button icon={<PlusSquareOutlined/>} type="primary">Add New League</Button></Link>
            </Col>
          </Row>
          <List
            bordered
            itemLayout="horizontal"
            loading={this.props.loading}
            dataSource={this.props.leagues}
            renderItem={item => (
              <List.Item
                actions={[
                  (item.roleId === 3 || item.roleId === 2 ? <Link key="admin" to={`/leagues/${item.id}/admin`}>Admin</Link> : null),
                  (<Link key="view" to={`/leagues/${item.id}`}>View</Link>),
                ]}
              >
                <List.Item.Meta
                  title={item.name}
                  description={item.description}
                />
              </List.Item>
            )}
          />
        </Spin>
      </div>
    )
  }
}

LeagueIndex.propTypes = {
  loading: PropTypes.bool,
  leagues: PropTypes.array,
  username: PropTypes.string,
  getUserLeagues: PropTypes.func
}

LeagueIndex.defaultProps = {
  loading: true,
  leagues: [],
  username: "",
  getUserLeagues: () => {}
}

const mapStateToProps = (state) => {
  const { loadingUserLeagues: loading, userLeagues: leagues } = state.League;
  const { user } = state.User;

  return {
    loading,
    leagues: leagues,
    username: user?.name
  }
}

const mapDispatchToProps = {
  getUserLeagues: leagueActions.getUserLeagues
}

export default connect(mapStateToProps, mapDispatchToProps)(LeagueIndex);