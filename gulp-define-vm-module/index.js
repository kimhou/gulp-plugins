'use strict';
var through = require('through');
var path = require('path');
var gutil = require('gulp-util');
var _ = require('lodash');

function makeCMD(path, moduleContents, opts) {
  // define(['dependency'], function(Dependency) { return moduleObject; });
  var includes = [];
  var defines = [];
  var splite = '\\';
  if(path.indexOf('/') != -1 && path.indexOf(splite) == -1){
    splite = '/';
  }
  var arr = path.split(splite);
  var name = arr && arr.length > 1 && arr[arr.length - 2];

  if(!name){
    throw (new Error('module name error!!'));
  }

  var vmRequire = [];
  _.each(opts.deps, function(include) {
    if (include !== null) {
      vmRequire.push('require(' + JSON.stringify(include) + ');');
    }
  });
  moduleContents = moduleContents.replace(/window\[('|")require('|")\]/g, 'require');
  var exportModule = moduleContents.split(/\[|\]/);
  exportModule = exportModule && exportModule.length > 1 && exportModule[exportModule.length - 2] || 0;

  return 'define(' + (name && name.length ? '"' + (opts.prefix || '') + name + '", ' : '') +
      'function(require, exports, module) { \r\n' +
      vmRequire.join('\r\n') +
      '\r\nvar mod = ' + moduleContents + '; \r\nreturn mod("' + exportModule + '");\r\n});';
}

module.exports = function(options) {
  return through(function(file) {
    if (file.isNull()) { return this.queue(file); } // pass along
    if (file.isStream()) { return this.emit('error', new gutil.PluginError('gulp-define-vm-module', 'Streaming not supported')); }

    var opts = _.defaults({}, options, file.defineModuleOptions);
    opts.context = _([file.defineModuleOptions, options])
      .filter(_.identity).pluck('context')
      .filter(_.identity).value();
    opts.require = _.merge.apply(null, _([file.defineModuleOptions, options, { require: {} }])
      .filter(_.identity).pluck('require')
      .filter(_.identity).value());

    var contents = file.contents.toString();
    var name = path.basename(file.path, path.extname(file.path));
    var context = {
      name: name,
      file: file,
      contents: contents
    };
    if (opts.wrapper) {
      opts.context.forEach(function(extensions) {
        if (!extensions) { return; }
        if (typeof extensions === 'function') {
          extensions = extensions(context);
        }
        _.merge(context, _(extensions).map(function(value, key) {
          return [key, _.template(value)(context)];
        }).object().value());
      });

      contents = _.template(opts.wrapper)(context);
    }

    contents = makeCMD(file.path, contents, opts);

    file.path = gutil.replaceExtension(file.path, '.js');
    file.path = rename(file.path, options.moduleName);
    file.contents = new Buffer(contents);
    this.queue(file);
  });

  function rename(path, moduleName){
    var splite = '\\';
    if(path.indexOf('/') != -1 && path.indexOf(splite) == -1){
      splite = '/';
    }
    var arr = path.split(splite);
    var name = moduleName ? moduleName : arr && arr.length > 1 && arr[arr.length - 2];

    var p = arr.splice(0, arr.length - 2);

    p.push(name + '.js');
    p.join(splite);
    return p.join(splite);;
  }
};
