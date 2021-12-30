import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import LeagueBreadcrumb from "./LeagueBreadcrumb";
import leagueActions from "../../reducers/league/action";
import { Badge, Spin, Tabs } from "antd";
import QueenList from "../../components/queen-list/QueenList";
import { IdcardOutlined, KeyOutlined, LineChartOutlined, LoadingOutlined, OrderedListOutlined, ProfileOutlined, TeamOutlined, VideoCameraOutlined } from "@ant-design/icons";
import LeagueUserList from "../../components/league-users-list/LeagueUserList";

class LeagueDetails extends React.Component {

  componentDidMount(){
    const leagueID = this.props.match.params.leagueID;
    this.props.dispatch(leagueActions.getLeague(leagueID));
  }

  renderTabTitle(RequestedIcon, title, badge = 0){
    return (
      <span>
        <RequestedIcon/>
        {title}
        {badge > 0 && (
          <Badge style={{marginLeft: 8}} count={badge} size="small"/>
        )}
      </span>
    )
  }

  render() {
    return (
      <Spin spinning={this.props.loading}>
        <div className="league-details">
          <LeagueBreadcrumb leagueName={this.props.league.name} leagueID={this.props.league.id}/>
          <h1>{this.props.league.name}</h1>
          <Tabs type="card">
            <Tabs.TabPane tab={this.renderTabTitle(ProfileOutlined, "Details")} key="1">
              <p>{this.props.league.description}</p>
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(this.props.queensLoading ? LoadingOutlined : IdcardOutlined, "Queens")} key="2" forceRender >
              <QueenList leagueID={this.props.league.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(this.props.queensLoading ? LoadingOutlined : TeamOutlined, "Players")} key="3" forceRender>
              <LeagueUserList leagueID={this.props.league.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(VideoCameraOutlined, "Episodes")} key="4">
              
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(LineChartOutlined, "Stats")} key="5">
              
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(KeyOutlined, "Rules")} key="6">
              
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(OrderedListOutlined, "Surveys", 1)} key="7">
              
            </Tabs.TabPane>
          </Tabs>
        </div>
      </Spin>
    )
  }
}

LeagueDetails.propTypes = {
  loading: PropTypes.bool,
  league: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    description: PropTypes.string
  }),
  queensLoading: PropTypes.bool,
  loadingLeagueUsers: PropTypes.bool
}

LeagueDetails.defaultProps = {
  loading: false,
  league: {},
  queensLoading: true,
  loadingLeagueUsers: true
}

const mapStateToProps = (state) => {
  const { loadingLeague, league, loadingLeagueUsers } = state.League;
  const { loading: queensLoading } = state.Queens;
  
  return {
    loading: loadingLeague,
    league: league,
    queensLoading,
    loadingLeagueUsers
  };
}

export default connect(mapStateToProps)(LeagueDetails);