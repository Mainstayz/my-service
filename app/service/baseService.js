const BaseModel = require('../baseModel');
const ORMs = require('../orm');

module.exports = class BaseService extends BaseModel {
  constructor(connection) {
    super();
    this.connection = connection || null;
    this.ORMs = ORMs;
  }

  getConnection() {
    return this.connection;
  }

  throwError(errorMsg) {
    let error = new Error(errorMsg);
    error.type = this.localConst.NOT_SYS_ERROR;
    throw error;
  }

  checkDBResult(result, ifNullMsg, ifExistMsg) {
    if (!result.length) {
      if(ifNullMsg) {
        this.throwError(ifNullMsg);
      }
    } else {
      if(ifExistMsg) {
        this.throwError(ifExistMsg);
      }
    }
  }
};
