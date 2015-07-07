# gulp-ejs-compile-amd

[![NPM version][npm-image]][npm-url] [![Build status][travis-image]][travis-url] [![Code Climate][codeclimate-image]][codeclimate-url] [![Coverage Status][coverage-image]][coverage-url] [![Dependencies][david-image]][david-url] [![devDependencies][david-dev-image]][david-dev-url]

gulp-ejs-compile-amd 此插件可以将ejs模板编译成js文件并合并生成AMD风格的模块化文件.

##DEMO

tmpl1.ejs
```ejs
<h1><%=title%></h1>
```
tmpl2.ejs
```ejs
<div><%=name%></div>
```
result:
```javascript
var tmpl = {
"tmpl1": function (data) {
var __p=[],_p=function(s){__p.push(s)};
;_p('<h1>');
;_p(__e(title));
;_p('</h1>\r\n\
');
return __p.join("");
},
"tmpl2": function (data) {
var __p=[],_p=function(s){__p.push(s)};
;_p('<div>');
;_p(__e(name));
;_p('</div>\r\n\
');
return __p.join("");
}
};
module.exports = tmpl;
```

##Use Example
```javascript
gulp.src('./js/*/tmpl/*.ejs')
	.pipe(compiler('tmpl.js'))
	.pipe(gulp.dest('./dist/'));
```


## License

This project is distributed under the MIT license.

