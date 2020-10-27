'use strict';

/**
 * This re-runs the whole test suite inside of chromium.
 * That's great for CI but tends to be hard to debug.
 *
 * So for debugging purposes there's:
 *
 * 1. Start the test API: `node test/mock-service.js`
 * 2. Create the test HTML page (see below)
 * 3. Open `tmp/test.html` in your browser
 *
 * ```
 * npx mochify --watch --consolify tmp/test.html --reporter spec ./test/**\/*.test.js
 * ```
 */

// Early out if we're not running in node right now
if (typeof document !== 'undefined') return;

// Ignore this import when processing via browserify
const execFile = module.require('' + 'child_process').execFile;

require('./mock-service');

describe('in a browser', () => {
  it('works (almost) just the same', function (done) {
    const mochifyBin = require.resolve('.bin/mochify');
    this.timeout(60 * 1000);
    const child = execFile(
      mochifyBin,
      ['--allow-chrome-as-root', './test/**/*.test.js'],
      done
    );
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
  });
});
