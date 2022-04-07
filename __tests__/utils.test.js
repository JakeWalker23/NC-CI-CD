const { logger } = require('../utils');

describe('logger', () => {
  test('logs request method and url to the console', () => {
    const consoleSpy = jest.spyOn(console, 'log');
    logger('GET', '/abc');
    logger('POST', '/dogs');
    expect(consoleSpy).toHaveBeenNthCalledWith(
      1,
      'Request received - Method: GET, Endpoint: /abc'
    );
    expect(consoleSpy).toHaveBeenNthCalledWith(
      2,
      'Request received - Method: POST, Endpoint: /dogs'
    );
  });
});
