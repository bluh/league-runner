import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { Select } from "antd";
import metasActions from "../../reducers/metas/action";

class UserPicker extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: [],
    }
  }

  componentDidMount() {
    if (!this.props.usersList || this.props.usersList.length === 0) {
      this.props.dispatch(metasActions.getUsersList());
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.value !== this.props.value) {
      this.setState({ list: this.props.usersList })
    }
  }

  handleSearch = (value) => {
    this.setState({
      list: this.props.usersList.filter(u => u.Username.toLowerCase().includes(value.toLowerCase()))
    });
  }

  render() {
    const selectList = this.state.list.filter(v => !this.props.excludeList.includes(v.ID));
    return (
      <Select
        allowClear
        placeholder="Start typing a name..."
        filterOption={false}
        showSearch
        onSearch={this.handleSearch}
        onChange={value => this.props.onChange(value)}
        value={this.props.value}
        style={{
          width: "100%"
        }}
      >
        {selectList.map(v => (<Select.Option key={v.ID} value={v.ID}>{v.Username}</Select.Option>))}
      </Select>
    );
  }
}

UserPicker.propTypes = {
  onChange: PropTypes.func,
  value: PropTypes.number,
  excludeList: PropTypes.array,
  usersList: PropTypes.array
}

UserPicker.defaultProps = {
  onChange: () => { },
  value: undefined,
  excludeList: [],
  usersList: []
}

const mapStateToProps = (state) => {
  const { loading, usersList } = state.Metas;

  return {
    usersList,
    loading
  }
}

export default connect(mapStateToProps)(UserPicker);