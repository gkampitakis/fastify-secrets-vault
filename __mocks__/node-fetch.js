const callSpy = jest.fn();
const options = {
  error: false,
  results: {}
};

function fetch (...args) {
  callSpy(...args);

  return Promise.resolve({
    json () {
      return Promise.resolve(options.results);
    }
  });
}

module.exports = fetch;
module.exports.callSpy = callSpy;
module.exports.options = options;
