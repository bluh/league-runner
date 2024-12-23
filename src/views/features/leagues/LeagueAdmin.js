import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Badge, Button, Modal, Spin, Tabs } from "antd";
import LeagueBreadcrumb from "./LeagueBreadcrumb";
import leagueActions from "../../reducers/league/action";
import { IdcardOutlined, KeyOutlined, LoadingOutlined, ProfileOutlined, UserOutlined, VideoCameraAddOutlined, WarningOutlined } from "@ant-design/icons";
import AdminQueenList from "../../components/queen-list/AdminQueenList";
import AdminLeagueForm from "../../components/league-details/AdminLeagueForm";
import AdminUserList from "../../components/league-users-list/AdminUserList";
import AdminEpisodesList from "../../components/league-episodes-list/AdminEpisodesList";
import AdminRulesList from "../../components/league-rules-list/AdminRulesList";

class LeagueAdmin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showDeleteModal: false,
    }
  }

  componentDidMount() {
    const leagueID = this.props.match.params.leagueID;
    this.props.dispatch(leagueActions.getLeague(leagueID));
  }

  renderTabTitle(RequestedIcon, title, badge = 0) {
    return (
      <span>
        <RequestedIcon />
        {title}
        {badge > 0 && (
          <Badge style={{ marginLeft: 8 }} count={badge} size="small" />
        )}
      </span>
    )
  }

  deleteLeague() {
    this.setState({ showDeleteModal: false });
  }

  render() {
    return (
      <Spin spinning={this.props.loading}>
        <div className="league-admin">
          <LeagueBreadcrumb leagueName={this.props.league.name} leagueID={this.props.league.id} isAdmin />
          <h1>Admin Portal for <span className="league-name-display">{this.props.league.name}</span></h1>
          <Tabs type="card">
            <Tabs.TabPane tab={this.renderTabTitle(ProfileOutlined, "Details")} key="1">
              <AdminLeagueForm />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(this.props.loadingLeagueUsers ? LoadingOutlined : UserOutlined, "Players")} key="2" forceRender>
              <AdminUserList leagueID={this.props.league.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(this.props.episodesLoading ? LoadingOutlined : VideoCameraAddOutlined, "Episodes")} key="3" forceRender>
              <AdminEpisodesList leagueID={this.props.league.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(this.props.queensLoading ? LoadingOutlined : IdcardOutlined, "Queens")} key="4" forceRender>
              <AdminQueenList leagueID={this.props.league.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(this.props.loadingLeagueRules ? LoadingOutlined : KeyOutlined, "Rules")} key="5" forceRender>
              <AdminRulesList leagueID={this.props.league.id} />
            </Tabs.TabPane>
            <Tabs.TabPane tab={this.renderTabTitle(WarningOutlined, "Danger Zone")} key="6">
              <h2>Delete League</h2>
              <Button type="default" danger onClick={() => this.setState({ showDeleteModal: true })}>Delete League</Button>
            </Tabs.TabPane>
          </Tabs>
        </div>
        <Modal
          open={this.state.showDeleteModal}
          okText="Yes! Bye!"
          okType="primary"
          okButtonProps={{
            danger: true
          }}
          onOk={() => this.deleteLeague()}
          onCancel={() => this.setState({ showDeleteModal: false })}
        >
          Are you SURE you want to delete this league? Be very careful!
        </Modal>
      </Spin>
    )
  }
}

LeagueAdmin.propTypes = {
  loading: PropTypes.bool,
  league: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string
  }),
  queensLoading: PropTypes.bool,
  episodesLoading: PropTypes.bool,
  loadingLeagueUsers: PropTypes.bool,
  loadingLeagueRules: PropTypes.bool
}

LeagueAdmin.defaultProps = {
  loading: false,
  league: {},
  queensLoading: true,
  episodesLoading: true,
  loadingLeagueUsers: true,
  loadingLeagueRules: true
}

const mapStateToProps = (state) => {
  const { loadingLeague, league, loadingLeagueUsers, loadingLeagueRules, loadingEpisodes } = state.League;
  const { loading: queensLoading } = state.Queens;

  return {
    loading: loadingLeague,
    league: league,
    queensLoading,
    episodesLoading: loadingEpisodes,
    loadingLeagueUsers,
    loadingLeagueRules
  };
}

export default connect(mapStateToProps)(LeagueAdmin);