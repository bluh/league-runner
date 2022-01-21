import validate from "validate.js";

function validateLeague(values) {
  // Top-level validation
  var errors = validate(values, {
    name: {
      type: "string",
      presence: {
        allowEmpty: false,
        message: "Please specify a name for the new league"
      },
      length: {
        maximum: 20,
        message: "Please enter a shorter league name"
      }
    },
    description: {
      type: "string",
      length: {
        maximum: 200,
        message: "Please enter a shorter description"
      }
    },
    drafts: {
      presence: {
        allowEmpty: false,
        message: "Please specify the number of drafts on a team"
      },
      numericality: {
        onlyInteger: true,
        greaterThan: 0,
        notValid: "Please specify the number of drafts on a team",
        notGreaterThan: "Please specify the number of drafts on a team"
      }
    },
    allowLeaders: {
      type: "boolean"
    },
    queens: {
      type: "array",
      presence: {
        allowEmpty: false,
        message: "At least one queen must be registered."
      },
      length: {
        minimum: 1,
        tooShort: "At least one queen must be registered."
      }
    },
    rules: {
      type: "array",
      presence: {
        allowEmpty: false,
        message: "At least one rule must be created."
      },
      length: {
        minimum: 1,
        tooShort: "At least one rule must be created."
      }
    }
  }, { fullMessages: false });

  // Validate users array
  if (values.users && validate.isArray(values.users)) {
    const totalUsersErrors = {};
    values.users.forEach((user, index) => {
      const userErrors = validate(user, {
        role: {
          type: "number",
          presence: {
            message: "Please select a role",
          }
        },
        user: {
          type: "number",
          presence: {
            message: "Please enter a username"
          }
        }
      }, { fullMessages: false, format: "flat" })

      if (userErrors) {
        totalUsersErrors[index] = userErrors;
      }
    });

    if (Object.keys(totalUsersErrors).length > 0) {
      errors = {
        ...errors,
        users: totalUsersErrors
      }
    }
  }

  // Validate queens array
  if (values.queens && validate.isArray(values.queens)) {
    const totalQueensErrors = {};

    values.queens.forEach((queen, index) => {
      const queenErrors = validate(queen, {
        name: {
          type: "string",
          presence: {
            message: "Please enter a queen name",
            allowEmpty: false
          }
        }
      }, { fullMessages: false, format: "flat" });

      if (queenErrors) {
        totalQueensErrors[index] = queenErrors;
      }
    });

    if (Object.keys(totalQueensErrors).length > 0) {
      errors = {
        ...errors,
        queens: totalQueensErrors
      }
    }
  }

  // Validate rules array
  if (values.rules && validate.isArray(values.rules)){
    const totalRulesErrors = {};

    values.rules.forEach((rule, index) => {
      const ruleErrors = validate(rule, {
        name: {
          type: "string",
          presence: {
            message: "Please enter a rule name",
            allowEmpty: false
          }
        },
        description: {
          type: "string",
        },
        points: {
          presence: {
            message: "Please enter a point value",
            allowEmpty: false
          }
        }
      }, { fullMessages: false });

      if (ruleErrors) {
        totalRulesErrors[index] = ruleErrors;
      }
    });

    if (Object.keys(totalRulesErrors).length > 0) {
      errors = {
        ...errors,
        rules: totalRulesErrors
      }
    }
  }

  console.log('errors', errors);

  return errors || null;
}

export default {
  validateLeague
}