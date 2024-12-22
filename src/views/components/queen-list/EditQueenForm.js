import React from "react";
import PropTypes from "prop-types";

class EditQueenForm extends React.Component {

}

EditQueenForm.propTypes = {
  show: PropTypes.bool,
  onFinish: PropTypes.func,
  defaultValues: PropTypes.object
}

EditQueenForm.defaultProps = {
  show: false,
  onFinish: () => { },
  defaultValues: {}
}