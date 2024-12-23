/**
 * @openapi
 * definitions:
 *  updateUser:
 *    required:
 *      - roleID
 *    properties:
 *      roleID:
 *        type: number
 */

module.exports = {
  roleID: {
    type: "number",
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 0,
      lessThanOrEqualTo: 2
    }
  },
}