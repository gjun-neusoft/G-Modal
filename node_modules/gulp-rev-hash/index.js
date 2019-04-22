var path = require('path');
var fs = require('fs');
var EOL = require('os').EOL;

var through = require('through2');
var gutil = require('gulp-util');

module.exports = function(options) {
  options = options || {};

  var startReg = /<!--\s*rev\-hash\s*-->/gim;
  var endReg = /<!--\s*end\s*-->/gim;
  var jsReg = /<\s*script\s+.*?src\s*=\s*"([^"]+.js).*".*?><\s*\/\s*script\s*>/gi;
  var cssReg = /<\s*link\s+.*?href\s*=\s*"([^"]+.css).*".*?>/gi;
  var basePath, mainPath, mainName, alternatePath;

  function getBlockType(content) {
    return jsReg.test(content) ? 'js' : 'css';
  }

  function getFiles(content, reg) {
    var paths = [];
    var files = [];

    content
      .replace(/<!--(?:(?:.|\r|\n)*?)-->/gim, '')
      .replace(reg, function (a, b) {
        paths.push(b);
      });

    return paths;
  }

  return through.obj(function(file, enc, callback) {
    if (file.isNull()) {
      this.push(file); // Do nothing if no contents
      callback();
    }
    else if (file.isStream()) {
      this.emit('error', new gutil.PluginError('gulp-usemin', 'Streams are not supported!'));
      callback();
    }
    else {
      basePath = file.base;
      mainPath = path.dirname(file.path);
      mainName = path.basename(file.path);

      var html = [];
      var sections = String(file.contents).split(endReg);

      for (var i = 0, l = sections.length; i < l; ++i) {
        if (sections[i].match(startReg)) {
          var assets, type;
          var section = sections[i].split(startReg);
          html.push(section[0]);
          html.push('<!-- rev-hash -->\r\n')

          var cssAssets = getFiles(section[1], cssReg);
          var jsAssets = getFiles(section[1], jsReg);
          if (cssAssets.length > 0) { assets = cssAssets; type = 'css' }
          else { assets = jsAssets; type = 'js' }

          for (var j = 0; j < assets.length; j++) {
            asset = assets[j];
            var hash = require('crypto')
              .createHash('md5')
              .update(
                fs.readFileSync(
                  path.join((options.assetsDir?options.assetsDir:''), asset), {encoding: 'utf8'}))
              .digest("hex");
              if (type === 'css') {
                html.push('<link rel="stylesheet" href="' + asset + '?v=' + hash + '"/>\r\n');
              }
              else {
                html.push('<script src="' + asset + '?v=' + hash + '"></script>\r\n');
              }
          }
          html.push('<!-- end -->');
        }
        else { html.push(sections[i]); }
      }
      file.contents = new Buffer(html.join(''));
      this.push(file);
      return callback();
    }
  });
};
