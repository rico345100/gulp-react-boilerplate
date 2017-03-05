# gulp-react-boilerplate
Boilerplate for developing React App with Browserify and Gulp, with Server Side as Express with Browser-Sync.


## What is this?
It is a just boilerplate for developing React Application with Browserify + Express + Gulp + Browser-Sync.


## Features
- Express
- Livereload (feat. Browser-Sync)
- SASS compiling
- JS/CSS/HTML minification on production build
- ES2015 Support
- React Support
- Class Properties
- ES7 Async & Await
	- Yes, it uses babel-polyfill. If you feeling that babel-polyfill is too heavy, remove from depedencies and your code, but you cannot use Async & Await anymore. I recommend that just use it, but if really hate it, then use ES6 Generator Coroutine instead.
- ESLint


## To Start
This project will provides as minimal as possible, so if you want to add some more functionalities, 
Using sass or TypeScript, you must do it yourself.

Basic usage is:

```bash
$ npm install
```

To install all dependencies first. Note that you must installed gulp globally if you didn't.
```bash
$ npm install -g gulp
```

Now run the default task, which build all resources and automatically run browser-sync to serve your resources.
```bash
$ gulp
```


## Tasks
### gulp default
By default, will proceed these steps:

1. Build HTML/SCSS/JS
2. Start Express server and initiate browser-sync
3. Watch all changes and refresh or inject(scss as css only)

### gulp serve
Start server with Express, also initiate Browser-Sync with Express server.
Express will uses port number in config.json, and Browser-Sync will uses proxyPort number in config.json.
After you change your server code, nodemon will restarts Express server automatically.
Or if you change your client resources, browser-sync will reload or inject client resources automatically.

### gulp build
Build all resources.

### gulp build::html
Build HTML resources. In production build, it uses gulp-htmlmin to minify HTML.

### gulp build::scss
Build SCSS resources. In production build, it uses gulp-cssnano to minify CSS.

### gulp build::script
Build JS resources. It will create two scripts, vendor.js and bundle.js.
vendor.js contains common scripts and bundle.js contains actual your code.


## Production Build
To set your application production mode, simply update environment variable inside of config.json to "production".
Also don't run your server with "gulp serv" in production state!


## License
MIT. Free to use. Also this project will gonna update continuously.