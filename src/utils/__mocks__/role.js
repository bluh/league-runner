const role = jest.createMockFromModule("utils/role");

function __generateToken(){
  return {
    DLAccess: "token"
  }
}

function getUserInfo(token){
  return new Promise((resolve,reject) => {
    if(token){
      resolve({
        user: "",
        id: 0,
        roles: []
      })
    }else{
      reject();
    }
  })
}

role.__generateToken = __generateToken;

role.getUserInfo = getUserInfo;

module.exports = role;