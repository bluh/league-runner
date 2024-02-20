import React from "react";
import PropTypes from "prop-types";

class EditQueenForm extends React.Component {

}

EditQueenForm.propTypes = {
  show: PropTypes.bool,
  onFinish: PropTypes.func,
  hideOnFinish: PropTypes.bool,
  defaultValues: PropTypes.object
}

EditQueenForm.defaultProps = {
  show: false,
  onFinish: () => {},
  hideOnFinish: true,
  defaultValues: {}
}