/**
 * @openapi
 * definitions:
 *  updateLeague:
 *    required:
 *      - name
 *      - drafts
 *      - draftLeader
 *    properties:
 *      name:
 *        type: string
 *      description:
 *        type: string
 *      drafts:
 *        type: number
 *      draftLeader:
 *        type: boolean
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
  draftLeader: {
    type: "boolean",
    presence: true
  }
}