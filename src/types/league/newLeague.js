const updateLeague = require("./updateLeague");

/**
 * @openapi
 * definitions:
 *  newLeague:
 *    required:
 *      - name
 *      - users
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      drafts:
 *        type: number
 *      draftLeader:
 *        type: boolean
 *      users:
 *        type: array
 *        items:
 *          $ref: '#/definitions/userListItem'
 *      queens:
 *        type: array
 *        items:
 *          type: string
 *      rules:
 *        type: array
 *        items:
 *          $ref: '#/definitions/ruleListItem'
 * 
 *  userListItem:
 *    type: object
 *    properties:
 *      role:
 *        type: integer
 *      user:
 *        type: integer
 * 
 *  ruleListItem:
 *    type: object
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      points:
 *        type: integer
 */

module.exports = {
  ...updateLeague,
  queens: {
    type: "array",
    presence: {
      allowEmpty: false,
      message: "At least one queen must be registered."
    },
    length: {
      minimum: 1,
      tooShort: "At least one queen must be registered."
    },
    array: {
      each: {
        type: "string",
        presence: {
          message: "Please enter a queen name",
          allowEmpty: false
        }
      }
    }
  },
  users: {
    type: "array",
    presence: {
      allowEmpty: false,
      message: "At least one user must be registered."
    },
    length: {
      minimum: 1,
      tooShort: "At least one user must be registered."
    },
    array: {
      each: {
        role: {
          type: "number",
          presence: {
            message: "Please select a role",
          },
          numericality: {
            onlyInteger: true,
            greaterThan: 0,
            lessThanOrEqualTo: 3
          }
        },
        user: {
          type: "number",
          presence: {
            message: "Please enter a username"
          }
        }
      },
      unique: "user"
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
    },
    array: {
      each: {
        name: {
          type: "string",
          presence: {
            message: "Please enter a rule name",
            allowEmpty: false
          },
          length: {
            maximum: 100
          }
        },
        points: {
          type: "integer",
          presence: {
            message: "Please enter a point value",
            allowEmpty: false
          }
        },
        description: {
          type: "string",
          length: {
            maximum: 500
          }
        },
      }
    }
  }
}