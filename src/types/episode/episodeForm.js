const { itemWithId } = require("../common");

/**
 * @openapi
 * definitions:
 *  episodeForm:
 *    required:
 *      - number
 *      - name
 *      - airDate
 *    properties:
 *      number:
 *        type: number
 *      name:
 *        type: string
 *      airDate:
 *        type: date
 *      
 */
module.exports = {
  number: {
    type: "number",
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 0
    }
  },
  name: {
    type: "string",
    presence: { allowEmpty: false },
    length: {
      maximum: 100,
      message: "Please enter a shorter league name"
    }
  },
  airDate: {
    date: true,
    presence: true
  },
  details: {
    type: "array",
    array: {
      each: {
        queen: {
          ...itemWithId
        },
        rule: {
          ...itemWithId
        },
        timestamp: {

        }
      },
      nullable: true
    }
  }
}