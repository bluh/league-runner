import validate, { getDeepObjectValue, single } from "validate.js";

validate.validators.conditional = function(value, options, key, attributes) {
  const { on, is, success, fail } = options;
  const otherVal = getDeepObjectValue(attributes, on);

  if(success && otherVal && otherVal === is){
    return single(value, success);
  }

  if(fail){
    return single(value, fail);
  }
}

export default validate;