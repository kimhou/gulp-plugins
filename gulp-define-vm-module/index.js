'use strict';
var through = require('through');
var path = require('path');
var gutil = require('gulp-util');
var _ = require('lodash');

function makeAMD(path, moduleContents, opts) {
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
  _.each(opts.deps, function(include, define) {
    if (include !== null) {
      includes.push(JSON.stringify(include));
      defines.push(define);
    }
  });
  var exportModule = moduleContents.split(/\[|\]/);
  exportModule = exportModule && exportModule.length > 1 && exportModule[exportModule.length - 2] || 0;
  return 'define(' + (name && name.length ? '"' + (opts.prefix || '') + name + '", ' : '') + ((includes && includes.length) ? '[' + includes.join(', ') + '], ' : '') +
      'function(require, exports, module) { \r\nvar mod = ' + moduleContents + '; \r\nreturn mod("' + exportModule + '");\r\n});';
}

function makeCommonJS(moduleContents, opts) {
  // var Dependency = require('dependency');module.exports = moduleObject;
  var requires = _.map(opts.require, function(key, value) {
    if (key !== null) {
      return 'var ' + value + ' = require(' + JSON.stringify(key) + ');';
    }
  });
  return requires.join('') + 'module.exports = ' + moduleContents + ';';
}

function makeHybrid(moduleContents, opts) {
  // (function(definition) { if (typeof exports === 'object') { module.exports = definition(require('library')); }
  // else if (typeof define === 'function' && define.amd) { define(['library'], definition); } else { definition(Library); }
  // })(function(Library) { return moduleObject; });
  var includes = [];
  var requires = [];
  var defines = [];
  _.each(opts.require, function(include, define) {
    includes.push(JSON.stringify(include));
    requires.push('require(' + JSON.stringify(include) + ')');
    defines.push(define);
  });

  return '(function(definition) { ' +
    'if (typeof exports === \'object\') { module.exports = definition(' + requires.join(',') + '); } ' +
    'else if (typeof define === \'function\' && define.amd) { define([' + includes.join(',') + '], definition); } ' +
    'else { definition(' + defines.join(',') + '); } ' +
    '})(function(' + defines.join(',') + ') { return ' + moduleContents + '; });';
}

function makePlain(moduleContents, opts) {
  // moduleObject;
  return moduleContents + ';';
}

module.exports = function(type, options) {
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

    if (type === 'amd') { contents = makeAMD(file.path, contents, opts); }
    else if (type === 'commonjs' || type === 'node') { contents = makeCommonJS(contents, opts); }
    else if (type === 'hybrid') { contents = makeHybrid(contents, opts); }
    else if (type === 'plain') { contents = makePlain(contents, opts); }
    else {
      throw new Error('Unsupported module type for gulp-define-vm-module: ' + type);
    }

    file.path = gutil.replaceExtension(file.path, '.js');
    file.path = rename(file.path);
    file.contents = new Buffer(contents);
    this.queue(file);
  });

  function rename(path){
    var splite = '\\';
    if(path.indexOf('/') != -1 && path.indexOf(splite) == -1){
      splite = '/';
    }
    var arr = path.split(splite);
    var name = arr && arr.length > 1 && arr[arr.length - 2];

    var p = arr.splice(0, arr.length - 2);

    p.push(name + '.js');
    p.join(splite);
    return p.join(splite);;
  }
};
