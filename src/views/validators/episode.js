import validate from "./validator";

validate.extend(validate.validators.datetime, {

})

function validateEpisodeForm(values) {
  const errors = validate(values, {
    number: {
      presence: true,
      numericality: {
        onlyInteger: true,
        greaterThan: 0
      }
    },
    name: {
      presence: true
    },
    airDate: {
      presence: true
    }
  });

  return errors || null;
}

export default {
  validateEpisodeForm
}