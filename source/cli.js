var bole = require('bole');
var docopt = require('docopt');
var fs = require('fs');
var http = require('http');
var levelup = require('levelup');
var memdown = require('memdown');
var path = require('path');
var serve = require('commonform-serve');

var meta = require('../package');
var usage = fs.readFileSync(path.join(__dirname, 'usage')).toString();
var versionString = meta.name + ' ' + meta.version;

module.exports = function(stdin, stdout, stderr, env, argv, callback) {
  var options;
  try {
    options = docopt.docopt(usage, {
      argv: argv,
      help: false,
      exit: false
    });
  } catch (error) {
    stderr.write(error.message + '\n');
    callback(1);
    return;
  }
  if (options['--version'] || options['-v']) {
    stdout.write(versionString + '\n');
    callback(0);
  } else if (options['--help'] || options['-h']) {
    stdout.write(usage + '\n');
    callback(0);
  } else {
    var port = options['--port'];
    var level = levelup('', {db: memdown});
    bole.output({level: 'debug', stream: process.stdout});
    var logger = bole(versionString);
    http.createServer(serve(logger, level))
      .on('listening', function() {
        logger.info({port: this.address().port});
      })
      .listen(port);
  }
};
