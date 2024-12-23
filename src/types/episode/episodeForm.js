module.exports = {
  number: {
    presence: true,
    numericality: {
      onlyInteger: true,
      greaterThan: 0
    }
  },
  name: {
    presence: true
  },
  airDate: {
    presence: true
  }
}