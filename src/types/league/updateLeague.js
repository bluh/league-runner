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
    presence: {
      allowEmpty: false,
      message: "Please specify a name for the league"
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
  draftLeader: {
    type: "boolean"
  },
}