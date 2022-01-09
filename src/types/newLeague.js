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
 *      allowLeaders:
 *        type: boolean
 *      users:
 *        type: array
 *        items:
 *          $ref: '#/definitions/userListItem'
 *      queens:
 *        type: array
 *        items:
 *          type: string
 * 
 *  userListItem:
 *    type: object
 *    properties:
 *      role:
 *        type: integer
 *      user:
 *        type: integer
 */

module.exports = {
  name: {
    type: "string",
    presence: true,
    length: {
      maximum: 20
    }
  },
  description: {
    type: "string",
    length: {
      maximum: 200
    }
  },
  drafts: {
    type: "number",
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 0
    }
  },
  allowLeaders: {
    type: "boolean",
    presence: true
  },
  users: {
    array: {
      each: {
        role: {
          type: "number",
          presence: true,
          numericality: {
            onlyInteger: true,
            greaterThan: 0,
            lessThanOrEqualTo: 3 
          }
        },
        user: {
          type: "number",
          presence: true
        }
      },
      unique: "user"
    }
  },
  queens: {
    array: {
      each: {
        type: "string",
        presence: true
      }
    },
    length: {
      minimum: 1,
      tooShort: "Please specify at least 1 queen"
    }
  }
}