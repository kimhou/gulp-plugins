'use strict';
var through = require('through2');
var gutil = require('gulp-util');
var ejs = require('ejs');
var path = require('path');
var PluginError = gutil.PluginError;
var File = gutil.File;

module.exports = function(file, opt) {
    if (!file) {
        throw new PluginError('gulp-concat', 'Missing file option for gulp-concat');
    }
    opt = opt || {};

    // to preserve existing |undefined| behaviour and to introduce |newLine: ""| for binaries
    if (typeof opt.newLine !== 'string') {
        opt.newLine = gutil.linefeed;
    }

    var fileName;
    var files = [];

    if (typeof file === 'string') {
        fileName = file;
    } else if (typeof file.path === 'string') {
        fileName = path.basename(file.path);
    } else {
        throw new PluginError('gulp-concat', 'Missing path in file options for gulp-concat');
    }

    function bufferContents(file, enc, cb) {
        // ignore empty files
        if (file.isNull()) {
            cb();
            return;
        }

        // we don't do streams (yet)
        if (file.isStream()) {
            this.emit('error', new PluginError('gulp-concat',  'Streaming not supported'));
            cb();
            return;
        }
        files.push(file);
        cb();
    }

    function endStream(cb) {
        // no files passed in, no file goes out
        if (!files || !files.length) {
            cb();
            return;
        }

        var joinedFile;

        // if file opt was a file path
        // clone everything from the latest file
        if (typeof file === 'string') {
            joinedFile = files[0].clone({contents: false});
            joinedFile.path = path.join(files[0].base, file);
        } else {
            joinedFile = new File(file);
        }

        joinedFile.contents = new Buffer(ejsCompiler(files));

        this.push(joinedFile);
        cb();
    }

    return through.obj(bufferContents, endStream);
};

function ejsCompiler(files) {
    var code = [];
    files.forEach(function (file) {
        var fileName = path.basename(file.path);
        code.push('"' + fileName.split('.')[0] + '": ' + codeToFunction(file.contents.toString()));
    });
    if(code.length > 0){
        code = code.join(',\r\n');
        return 'var tmpl = {\r\n' + code + '\r\n};\r\nmodule.exports = tmpl;';
    }
}

function codeToFunction(code) {

    if (!code) {
        return "function(){return ''}";
    }
    //code = code.replace(/\/\/[^%]*/gmi, '');
    var regCode = /(?:(?:\r\n|\r|\n)\s*?)?<%([\-=]?)([\w\W\r\n]*?)%>(?:\r\n|\r|\n)?/gmi,
        index = 0,
        exec,
        len,
        res = ['var __p=[],_p=function(s){__p.push(s)};\n',
            'var ',
            "__a={'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#39;'},\n",
            '__b=/[&<>"\']/g,\n' +
            '__e=function (s) {s = String(s);return s.replace(__b, function (m) {return __a[m]});};\r\n',
            'with(data){\r\n'],
        jscode,
        eq;
    while (exec = regCode.exec(code)) {

        len = exec[0].length;

        if (index !== exec.index) {
            res.push(";_p('");
            res.push(
                code
                    .slice(index, exec.index)
                    .replace(/\\/gmi, "\\\\")
                    .replace(/'/gmi, "\\'")
                    .replace(/\r\n|\r|\n/g, "\\r\\n\\\r\n")
            );
            res.push("');\r\n");
        }

        index = exec.index + len;

        eq = exec[1];
        jscode = exec[2];

        // escape html
        if (eq === '=') {
            res.push(';_p(__e(');
            res.push(jscode);
            res.push('));\r\n');
        }
        // no escape
        else if (eq === '-') {
            res.push(';_p(');
            res.push(jscode);
            res.push(');\r\n');
        } else {
            res.push(jscode);
        }
    }

    res.push(";_p('");
    res.push(
        code
            .slice(index)
            .replace(/\\/gmi, "\\\\")
            .replace(/'/gmi, "\\'")
            .replace(/\r\n|\r|\n/g, "\\r\\n\\\r\n")
    );
    res.push("');", '\r\n', '}\r\n', 'return __p.join("");\r\n}', ',\r\n\r\n');
    res.length--;

    return ['function (data) {\r\n', res.join('')].join('');
}
