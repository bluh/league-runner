const validator = require("../validator");
const types = require("../types");

const wrapValidator = (validatorSchema) => (item, opts = {}) => validator.validator(item, validatorSchema, opts);


module.exports = {
  validateNewLeague: wrapValidator(types.league.newLeague),
  validateUpdateLeague: wrapValidator(types.league.updateLeague),
  validateLeagueUser: wrapValidator(types.league.updateLeagueUser),
  validateEpisodeForm: wrapValidator(types.episode.episodeForm)
}