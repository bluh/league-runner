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
 *      users:
 *        type: array
 *        items:
 *          $ref: '#/definitions/userListItem'
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
  }
}