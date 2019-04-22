gulp-rev-hash
=============

> Appends a file's hash to a file URL to cache assets

## Install

```
npm install --save-dev gulp-rev-hash
```


## Examples

### Default

This example will take the `example.html` file and add rev tags to all files that are found in this file, with default options.

```js
var gulp = require('gulp');
var rev = require('gulp-rev-hash');

gulp.task('rev', function () {
	gulp.src('template.html')
		.pipe(rev())
		.pipe(gulp.dest('.'));
});
```

#### Input:

```html
<!-- rev-hash -->
<link rel="stylesheet" href="main.min.css"/>
<!-- end -->

<!-- rev-hash -->
<script src="abc.js"></script>
<script src="def.js"></script>
<!-- end -->
```

#### Output:

```html
<link rel="stylesheet" href="main.min.css?v=9d58b7441d92130f545778e418d1317d">

<script src="abc.js?v=0401f2bda539bac50b0378d799c2b64e"></script><script src="def.js?v=e478ca95198c5a901c52f7a0f91a5d00"></script>
```

### Custom options

```
assetsDir: '/public'
```

Path to assets in your project