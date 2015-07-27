# gulp-define-vm-module

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependencies][david-image]][david-url] [![devDependencies][david-dev-image]][david-dev-url]

gulp-define-vm-module 此插件可以将browserify合并的代码生成CMD风格的模块化文件，返回browserify中的第一个模块对象, 生成的文件名为源文件的最后一个目录名，比如： gulp.src('./js/module1/index.js') 将生成 module1.js.

```javascript
define('moduleName', function(require, exports, module){
var mod = (browserify script);
return mod['1'];
})
```
use Example
```javascript
var moduleDir = '/data/websitedir/path/moduleName';
gulp.src(moduleDir + '/index.js')
            .pipe(browserify())
            .on('error', function (err) {
                console.log(err)
            })
            .pipe(derequire())
            .pipe(defineVMModule({
                moduleName: moduleName, //可选， 合并生文件名，为空时则为index.js的目录名
                deps: depends,
                prefix: ''
            }))
            .pipe(gulp.dest(moduleDir));
```
## 合并规则
/data/websitedir/path/moduleName 下有 index.js a.js b.js
index.js依赖a.js b.js

生成
/data/websitedir/path/moduleName.js

如果有外部依赖则在js中使用window\['require'\](moduleName)引用 (跟子模块依赖区分)
生成代码会自动转成require(moduleName)


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
