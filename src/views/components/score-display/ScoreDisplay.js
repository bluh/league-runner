import React from "react";
import PropTypes from "prop-types";
import { Tooltip } from "antd";

class ScoreDisplay extends React.Component{
  render() {
    return (
      <span>
        {this.props.leader === null
          ? this.props.total
          : (
            <>
              <b>
                <Tooltip title="Total Points">
                  {this.props.total}
                </Tooltip>
              </b>
              {' / '}
              <Tooltip title="Leader Points">
                {this.props.leader}
              </Tooltip>
            </>
          )
        }
      </span>
    )
  }
}

ScoreDisplay.propTypes = {
  total: PropTypes.number,
  leader: PropTypes.number
}

ScoreDisplay.defaultProps = {
  total: 0,
  leader: null
}

export default ScoreDisplay;