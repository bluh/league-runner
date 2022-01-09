import React from "react";
import PropTypes from "prop-types";
import tinygradient from "tinygradient";
import tinycolor from "tinycolor2";

class GradientText extends React.Component {
  render() {
    var gradientColor;
    if(this.props.total < 2) {
      gradientColor = tinycolor("#00CC00");
    }else{
      const gradient = tinygradient("#00CC00", "#CC0000").hsv(this.props.total, 'short');
      gradientColor = gradient ? gradient[this.props.index] : null;
    }
    
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