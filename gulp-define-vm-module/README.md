# gulp-define-vm-module

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependencies][david-image]][david-url] [![devDependencies][david-dev-image]][david-dev-url]

gulp-define-vm-module 此插件可以将browserify合并的代码生成AMD风格的模块化文件，返回browserify中的主模块对象, 生成的文件名为源文件的最后一个目录名，比如： gulp.src('./js/module1/index.js') 将把index.js及其依赖包装生成 dest/module1.js.

```javascript
define('moduleName', function(require, exports, module){
var mod = (browserify script);
return mod['{mainModuleID}'];
})
```
use Example
```javascript
gulp.src('./statics/dev/*/index.js')
        .pipe(browserify({debug:false}))
        .pipe(derequire())
        .pipe(defineVMModule('amd', {
            deps:[],//依赖
            prefix: ''//生成文件的前缀
        }))
        .pipe(gulp.dest('./statics/dev/'));
```


## License

This project is distributed under the MIT license.


[travis-url]: http://travis-ci.org/wbyoung/gulp-define-vm-module
[travis-image]: https://secure.travis-ci.org/wbyoung/gulp-define-vm-module.png?branch=master
[npm-url]: https://npmjs.org/package/gulp-define-vm-module
[npm-image]: https://badge.fury.io/js/gulp-define-vm-module.png
[codeclimate-image]: https://codeclimate.com/github/wbyoung/gulp-define-vm-module.png
[codeclimate-url]: https://codeclimate.com/github/wbyoung/gulp-define-vm-module
[coverage-image]: https://coveralls.io/repos/wbyoung/gulp-define-vm-module/badge.png
[coverage-url]: https://coveralls.io/r/wbyoung/gulp-define-vm-module
[david-image]: https://david-dm.org/wbyoung/gulp-define-vm-module.png?theme=shields.io
[david-url]: https://david-dm.org/wbyoung/gulp-define-vm-module
[david-dev-image]: https://david-dm.org/wbyoung/gulp-define-vm-module/dev-status.png?theme=shields.io
[david-dev-url]: https://david-dm.org/wbyoung/gulp-define-vm-module#info=devDependencies

[gulp-define-vm-module]: https://github.com/wbyoung/gulp-define-vm-module
[gulp-handlebars]: https://github.com/lazd/gulp-handlebars
[gulp-ember-emblem]: https://github.com/wbyoung/gulp-ember-emblem
[lodash.template]: http://lodash.com/docs#template
