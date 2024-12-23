const validator = require('validate.js');
const moment = require('moment');
const _ = require('lodash');

validator.extend(validator.validators.datetime, {
  parse: (val) => +moment.utc(val),
  format: (val) => val
});

/**
 * Usage:
 *  validator: {
 *    array: {
 *      each: object describing the test for each item
 *      unique: true if each value of array is unique; string describing a property that must be unique
 *      nullable: if the array can contain no values or be null
 *    }
 *  }
 */
validator.validators.array = function(value, options){
  const errors = [];
  const { each, unique, nullable } = options;

  if(!Array.isArray(value) || validator.isEmpty(value))
    return nullable ? null : "property must be an array of objects";
  
  if(each){
    value.forEach((item, index) => {
      if(typeof item === "object" && !Array.isArray(item)){
        const error = validator.validate(item, each);
        if(error){
          for(const key in error){
            errors.push(`@${index}: ${error[key]}`);
          }
        }
      }else{
        const error = validator.single(item, each);
        if(error){
          errors.push(error);
        }
      }
    })
  }

  if(typeof unique === 'boolean' && unique === true){
    const isValid = _.isEqual(value, _.uniq(value));
    if(!isValid){
      errors.push('Duplicate values in array');
    }
  }else if(typeof unique === 'string'){
    const isValid = _.isEqual(value, _.uniqBy(value, unique));
    if(!isValid){
      errors.push('Duplicate values in array');
    }
  }

  return errors.length === 0 ? null : errors;
}


/**
 * Usage:
 *  validator: {
 *    conditional: {
 *      on: path of item to check
 *      is: value to check against item
 *      success: validation to run if the item is the value
 *      fail: validation to run if the item is not the value
 *    }
 *  }
 */
validator.validators.conditional = function(value, options, key, attributes) {
  const { on, is, success, fail } = options;
  const otherVal = validator.getDeepObjectValue(attributes, on);

  if(success && otherVal && otherVal === is){
    return validator.single(value, success);
  }

  if(fail){
    return validator.single(value, fail);
  }
}

/**
 * Usage:
 *  validator: {
 *    children: describes the validation to run on each child
 *  }
 */
validator.validators.children = function(value, options) {
  const errors = validator(value, options, { format: "detailed", fullMessages: false });

  if(errors){
    return errors.map(v => `["${v.attribute}"]: ${v.error}`);
  }
}

module.exports = {
  validator
};