import React, { createRef } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Button, Drawer, message, Space, Spin, Table } from "antd";
import moment from "moment";
import leagueActions from "../../reducers/league/action";
import { Link } from "react-router-dom";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import episodeServices from "../../services/episode";
import EditEpisodeForm from "./EditEpisodeForm";


class AdminEpisodesList extends React.Component {
  constructor(props){
    super(props);

    this.formRef = createRef();

    this.state = {
      drawerOpen: false,
      forEdit: false,
      drawerLoading: false,
      defaultEpisodeData: {},
      dataDirty: false
    }

    this.cols = [
      {
        title: "Ep. Number",
        dataIndex: "number",
        key: "number",
        sorter: (a,b) => a.number - b.number,
        defaultSortOrder: "ascend",
        width: 120,
      },
      {
        title: "Episode",
        dataIndex: "name",
        key: "name",
        sorter: (a,b) => a.name.localeCompare(b.name),
        render: (_, record) => <Link to={`/episode/${record.id}`}>{record.name}</Link>
      },
      {
        title: "Air Date",
        dataIndex: "airDate",
        key: "airDate",
        sorter: (a,b) => new Date(a.airDate) - new Date(b.airDate),
        render: (_, record) => moment(record.airDate).utc().format("MM/DD/YYYY"),
        width: 150,
      },
      {
        title: "Edit",
        render: (_, record) => (
          <Button onClick={() => this.openEditModal(record)} type="primary" >
            <EditOutlined />
          </Button>
        ),
        width: 75,
      }
    ]
  }

  componentDidUpdate(prevProps){
    if(this.props.leagueID && this.props.leagueID !== prevProps.leagueID){
      this.props.dispatch(leagueActions.getLeagueEpisodes(this.props.leagueID));
    }
  }

  openEditModal(record) {
    if (!record)
      return;

    this.setState({
      drawerOpen: true,
      forEdit: true,
      drawerLoading: true,
      dataDirty: false
    })
    
    episodeServices.getEpisodeDetails(record.id)
      .then(episodeData => {
        const data = {
          ...record,
          airDate: moment.utc(record.airDate),
          details: episodeData.map(detail => ({
            ...detail,
            key: `EXISTING_${detail.id}`,
            timestamp: moment.utc(detail.timestamp)
          })),
        };

        this.setState({
          drawerLoading: false,
          defaultEpisodeData: data
        })
      })
  }

  openNewModal() {
    const newEpNumber = this.props.episodes.reduce((prev, curr) => Math.max(prev, curr.number), 0) || 0;

    const newData = {
      id: null,
      number: newEpNumber + 1,
      airDate: moment().utc(true).startOf("day"),
      details: []
    };

    this.setState({
      drawerOpen: true,
      forEdit: false,
      defaultEpisodeData: newData,
      dataDirty: false
    });

    this.formRef.current && this.formRef.current.resetForm(newData);
  }
  
  saveAdminModal() {
    this.formRef.current.submitForm();
  }

  closeAdminModal() {
    if (this.state.dataDirty && !confirm("Unsaved data will be lost")) {
      return;
    }

    this.setState({
      drawerOpen: false
    });
  }

  saveNewData(values) {
    const newData = {
      leagueID: this.props.leagueID,
      name: values.name,
      number: values.number,
      airDate: values.airDate.format(),
      details: (values.details ?? []).map(detail => ({
        id: detail.id ?? -1,
        queen: {
          id: detail.queen.id,
        },
        rule: {
          id: detail.rule.id,
        },
        timestamp: detail.timestamp.utc(true).format()
      }))
    };

    if(!this.state.forEdit){
      episodeServices.addNewEpisode(newData)
        .then(() => {
          this.setState({
            drawerOpen: false
          });
      
          this.formRef.current && this.formRef.current.resetForm();
  
          this.props.dispatch(leagueActions.getLeagueEpisodes(this.props.leagueID));
        })
        .catch(err => {
          console.error(err);
          message.error("Error creating new Episode");
        })
    }else{
      episodeServices.updateEpisode(newData, values.id)
        .then(() => {
          this.setState({
            drawerOpen: false
          });
      
          this.formRef.current && this.formRef.current.resetForm();
  
          this.props.dispatch(leagueActions.getLeagueEpisodes(this.props.leagueID));
        })
        .catch(err => {
          console.error(err);
          message.error("Error updating Episode");
        })
    }
  }

  render() {
    return (
      <>
        <Drawer
          open={this.state.drawerOpen}
          onClose={() => this.closeAdminModal()}
          size="large"
          extra={
            <Space>
              <Button onClick={() => this.closeAdminModal()}>Cancel</Button>
              <Button
                type="primary"
                onClick={() => this.saveAdminModal()}
                disabled={!this.state.dataDirty}
              >
                Save
              </Button>
            </Space>
          }
        >
          <Spin spinning={this.state.drawerLoading}>
            <EditEpisodeForm
              ref={this.formRef}
              defaultValues={this.state.defaultEpisodeData}
              isEdit={this.state.forEdit}
              onSubmit={(vals) => this.saveNewData(vals)}
              onDirty={() => this.setState({ dataDirty: true })}
            />
          </Spin>
        </Drawer>

        <Space direction="vertical" style={{ width: "100%" }}>
          <Button
            icon={<PlusOutlined />}
            type="primary"
            onClick={() => this.openNewModal()}
            style={{ float: "right" }}
          >
            Add Episode
          </Button>

          <Table
            bordered
            loading={this.props.loading}
            rowKey={item => item.id}
            dataSource={this.props.episodes}
            columns={this.cols}
            pagination={{
              hideOnSinglePage: true
            }}
            locale={{emptyText: "No episodes in this league!"}}
          />
        </Space>
      </>
    )
  }
}

AdminEpisodesList.propTypes = {
  leagueID: PropTypes.number,
  loading: PropTypes.bool,
  showLeaderPoints: PropTypes.bool,
  episodes: PropTypes.array
}

AdminEpisodesList.defaultProps = {
  leagueID: null,
  loading: false,
  showLeaderPoints: true,
  episodes: []
}

const mapStateToProps = (state) => {
  const { loadingEpisodes, episodes } = state.League;

  return {
    episodes,
    loading: loadingEpisodes
  }
}

export default connect(mapStateToProps)(AdminEpisodesList);