import React from "react";
import PropTypes from "prop-types";
import tinygradient from "tinygradient";

class GradientText extends React.Component {
  render() {
    const gradient = tinygradient("#00CC00", "#CC0000").hsv(this.props.total, 'short');
    const gradientColor = gradient ? gradient[this.props.index] : null;
    
    return (
      <span style={{ fontWeight: "bold", color: gradientColor ? gradientColor.toHexString() : "" }}>
        {this.props.text}
      </span>
    )
  }
}

GradientText.propTypes = {
  total: PropTypes.number,
  index: PropTypes.number,
  text: PropTypes.string
}

GradientText.defaultProps = {
  total: 1,
  index: 0,
  text: ""
}

export default GradientText;