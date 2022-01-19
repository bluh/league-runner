import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import leagueActions from "../../reducers/league/action";
import LeagueBreadcrumb from "./LeagueBreadcrumb";
import LeagueForm from "./LeagueForm";
import { message } from "antd";
import { FORM_ERROR } from "final-form";

class LeagueNew extends React.Component {
  constructor(props){
    super(props);

    this.state = {
      leaving: false
    }
  }

  handleSubmit = (data) => {
    this.props.createLeague(data, err => {
      if(err){
        const errorText = err.response?.data?.message || "";
        message.error(`Error creating new League: ${errorText}`);
        return { [FORM_ERROR]: errorText };
      }else{
        message.success("New League created");
        this.setState({
          leaving: true
        }, () => {
          this.props.history.push("/leagues");
        })
      }
    });
  }

  render() {
    return (
      <div className="league-new">
        <LeagueBreadcrumb leagueName="New League"/>
        <h1>New League</h1>
        <LeagueForm
          initialData={{
            name: "",
            description: "",
            drafts: 1,
            allowLeaders: true,
            users: [
              {
                role: 3,
                user: this.props.userID,
                name: this.props.username,
                key: 0,
              }
            ]
          }}
          onSubmit={this.handleSubmit}
          leaving={this.state.leaving}
        />
      </div>
    )
  }
}

LeagueNew.propTypes = {
  username: PropTypes.string,
  userID: PropTypes.number,
  loading: PropTypes.bool,
  createLeague: PropTypes.func,
}

LeagueNew.defaultProps = {
  username: "",
  userID: 0,
  loading: false,
  createLeague: () => {},
}

const mapStateToProps = (state) => {
  const { user } = state.User;
  const { loadingLeague } = state.League;

  return {
    username: user?.name,
    userID: user?.id,
    loading: loadingLeague
  }
}

const mapDispatchToProps = {
  createLeague: leagueActions.createNewLeague
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LeagueNew));