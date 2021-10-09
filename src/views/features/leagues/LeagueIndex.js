import React from "react";
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
        <h1>{this.props.username}'s Leagues</h1>
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
                actions={[<Link to={`/leagues/${item.id}`}>View</Link>, item.owner ? <Link to={`/leagues/${item.id}/admin`}>Admin</Link> : null]}
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

const mapStateToProps = (state) => {
  const { loadingUserLeagues: loading, userLeagues: leagues } = state.League;
  const { user } = state.User;

  return {
    loading,
    leagues: (leagues || []),
    username: user.user
  }
}

const mapDispatchToProps = {
  getUserLeagues: leagueActions.getUserLeagues
}

export default connect(mapStateToProps, mapDispatchToProps)(LeagueIndex);