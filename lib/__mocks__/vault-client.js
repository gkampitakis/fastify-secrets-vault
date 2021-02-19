const readSpy = jest.fn();
const readySpy = jest.fn();
const constructorSpy = jest.fn();
const nextSpy = jest.fn();
const mockResult = {
  data: {}
};

class MockVaultClient {
  constructor (...args) {
    constructorSpy(...args);
  }

  read (...args) {
    readSpy(...args);
    return Promise.resolve(mockResult.data);
  }

  ready () {
    readySpy();
    return Promise.resolve();
  }
}

module.exports = MockVaultClient;
module.exports.mockResult = mockResult;
module.exports.readSpy = readSpy;
module.exports.readySpy = readySpy;
module.exports.nextSpy = nextSpy;
module.exports.constructorSpy = constructorSpy;
