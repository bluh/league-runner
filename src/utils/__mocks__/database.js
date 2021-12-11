const database = jest.createMockFromModule("utils/database");

var dbData = new Array(0);
function __setDbData(data){
  dbData = new Array(0);
  data.forEach(entry => {
    const newEntry = Object.fromEntries(Object.entries(entry).map(([key, value]) => ([key, {value: value}])));
    dbData.push(newEntry);
  })
}

function request(){
  return Promise.resolve(dbData);
}

database.__setDbData = __setDbData;

database.request = request;

module.exports = database;