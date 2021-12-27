import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import LeagueBreadcrumb from "./LeagueBreadcrumb";
import leagueActions from "../../reducers/league/action";
import { Spin, Tabs } from "antd";
import QueenList from "../../components/queen-list/QueenList";
import { IdcardOutlined, LineChartOutlined, LoadingOutlined, OrderedListOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";

class LeagueDetails extends React.Component {

  componentDidMount(){
    const leagueID = this.props.match.params.leagueID;
    this.props.dispatch(leagueActions.getLeague(leagueID));
  }

  renderTabTitle(RequestedIcon, title){
    return (
      <span>
        <RequestedIcon/>
        {title}
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
            <Tabs.TabPane tab={this.renderTabTitle(UserOutlined, "Players")} key="3">

            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(OrderedListOutlined, "Surveys")} key="4">
              
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(LineChartOutlined, "Stats")} key="5">
              
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
  queensLoading: PropTypes.bool
}

LeagueDetails.defaultProps = {
  loading: false,
  league: {},
  queensLoading: true
}

const mapStateToProps = (state) => {
  const { loadingLeague, league } = state.League;
  const { loading: queensLoading } = state.Queens;
  
  return {
    loading: loadingLeague,
    league: league,
    queensLoading
  };
}

export default connect(mapStateToProps)(LeagueDetails);