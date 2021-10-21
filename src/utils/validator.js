const validator = require('validate.js');

/**
 * Usage:
 *  validator: {
 *    array: {
 *      each: object describing the test for each item
 *    }
 *  }
 */
validator.validators.array = function(value, options, key, attributes){
  const validateEach = options.each;

  if(!Array.isArray(value))
    return "must be an array of objects";
  
  if(validateEach){
    const errors = [];
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

    if(errors.length > 0)
      return errors;
  }
  return null;
}

validator.types = {
  newLeague: require('../types/newLeague')
}

module.exports = validator;