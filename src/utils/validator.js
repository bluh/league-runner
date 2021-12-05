const validator = require('validate.js');
const _ = require('lodash');

/**
 * Usage:
 *  validator: {
 *    array: {
 *      each: object describing the test for each item
 *      unique: true if each value of array is unique; string describing a property that must be unique
 *    }
 *  }
 */
validator.validators.array = function(value, options){
  const errors = [];
  const validateEach = options.each;
  const validateUnique = options.unique;

  if(!Array.isArray(value))
    return "\"each\" property must be an array of objects";
  
  if(validateEach){
    value.forEach((item, index) => {
      if(typeof item === "object" && !Array.isArray(item)){
        const error = validator.validate(item, validateEach);
        if(error){
          for(const key in error){
            errors.push(`@${index}: ${error[key]}`);
          }
        }
      }else{
        errors.push(`@${index} is not an object`);
      }
    })
  }

  if(typeof validateUnique === 'boolean' && validateUnique === true){
    const isValid = _.isEqual(value, _.uniq(value));
    if(!isValid){
      errors.push('Duplicate values in array');
    }
  }else if(typeof validateUnique === 'string'){
    const isValid = _.isEqual(value, _.uniqBy(value, validateUnique));
    if(!isValid){
      errors.push('Duplicate values in array');
    }
  }

  return errors.length === 0 ? null : errors;
}

const types = require('../types/types');

validator.types = {
  ...types
}

module.exports = validator;