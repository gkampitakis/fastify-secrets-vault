const callSpy = jest.fn();
const mock = {
  error: false,
  results: {}
};

function fetch (...args) {
  callSpy(...args);

  return Promise.resolve({
    json () {
      return Promise.resolve(mock.results);
    }
  });
}

module.exports = fetch;
module.exports.callSpy = callSpy;
module.exports.mock = mock;
