'use strict';
const config = require('./config.json');

const gulp = require('gulp');
const gutil = require('gulp-util');
const merge = require('merge-stream');
const gulpSequence = require('gulp-sequence').use(gulp);
const nodemon = require('gulp-nodemon');

const persistify = require('persistify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const scssify = require('scssify');

const source = require('vinyl-source-stream');
const streamify = require('gulp-streamify');

const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const cssnano = require('gulp-cssnano');

const yargs = require('yargs');
const argv = yargs.argv;

const browserSync = require('browser-sync');
const { exec } = require('child_process');

const vendors = [
	'react',
	'react-dom'
];
const isProduction = config.environment === 'production';

if(isProduction) {
	process.env.NODE_ENV = 'production';
}

process.env.FORCE_COLOR = 1;

const SRC_DIR = './src';
const BUILD_DIR = './build';

function swallowError (error) {
	console.log(error.toString());
	this.emit('end');
}

function buildHtml() {
	let buildStartTime = null;
	let buildEndTime = null;

	function run() {
		buildStartTime = new Date();

		let stream = gulp.src(`${SRC_DIR}/html/index.html`)
		.on('error', swallowError)
		.on('end', () => {
			buildEndTime = new Date();
			gutil.log(`Building HTML done. (Time elapsed ${buildEndTime - buildStartTime}ms.)`);
			browserSync.reload();
		});

		if(isProduction) {
			stream.pipe(htmlmin({collapseWhitespace: true}));
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/html`));
	}

	if(!argv.once) {
		gulp.watch(`${SRC_DIR}/html/**`, () => {
			gutil.log('Detect HTML changes. Rebuilding...');
			return run();
		});
	}

	return run();
}

function buildScss() {
	let buildStartTime = null;
	let buildEndTime = null;

	function run() {
		buildStartTime = new Date();

		let stream = gulp.src(`${SRC_DIR}/scss/app.scss`)
		.on('error', swallowError)
		.on('end', () => {
			buildEndTime = new Date();
			gutil.log(`Building SCSS done. (Time elapsed ${buildEndTime - buildStartTime}ms.)`);
		})
		.pipe(
			sass()
			.on('error', sass.logError)
		);

		if(isProduction) {
			stream.pipe(cssnano());
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/css`))
		.pipe(browserSync.stream());
	} 

	if(!argv.once) {
		gulp.watch(`${SRC_DIR}/scss/**`, () => {
			gutil.log('Detect SCSS changes. Rebuilding...');
			return run();
		});
	}

	return run();
}

function buildVendor() {
	const b = persistify({ debug: false }, {
		watch: !!!argv.once
	});

	vendors.forEach(vendor => {
		b.require(vendor);
	});

	let stream = b.bundle()
	.on('error', swallowError)
	.on('end', () => {
		gutil.log(`Building JS:vendor done.`);
		browserSync.reload();
	})
	.pipe(source('vendor.js'));

	if(isProduction) {
		stream.pipe(streamify(uglify()));
	}

	return stream.pipe(gulp.dest(`${BUILD_DIR}/js`));
}

function buildJs() {
	const opts = {
		paths: [
			`${SRC_DIR}/js`,
			`${SRC_DIR}/scss`
		],
		debug: !isProduction
	};

	const b = persistify(opts, {
		watch: !!!argv.once
	})
	.add(`${SRC_DIR}/js/index.js`)
	.on('update', bundle)
	.on('log', gutil.log)
	.external(vendors)
	.transform(babelify, { 
		presets: ["es2015", "react", "flow"],
		plugins: [
			"syntax-async-functions",
			"transform-regenerator",
			"transform-class-properties",
			"transform-object-rest-spread",
			"transform-react-jsx-source",
			"transform-decorators-legacy"
		]
	})
	.transform(scssify, {
		autoInject: true,
		sass: {
			"includePaths": [`${SRC_DIR}/scss`]
		}
	});
	
	function bundle() {
		let stream = b.bundle()
		.on('error', swallowError)
		.on('end', () => {
			gutil.log(`Building JS:bundle done.`);
			browserSync.reload();
		})
		.pipe(source('bundle.js'));

		if(isProduction) {
			stream.pipe(streamify(uglify()));
		}

		return stream.pipe(gulp.dest(`${BUILD_DIR}/js`));
	}

	return bundle();
}

function serve() {
	let serverStarted = false;

	nodemon({ 
		script: 'server.js',
		ignore: ['src/**', 'build/**']
	})
	.on('start', () => {
		if(!serverStarted) {
			serverStarted = true;

			browserSync.init(null, {
				proxy: `localhost:${config.port || 3000}`,
				port: config.proxyPort || 4000
			});

			// return empty stream
			return gutil.noop();	
		}
	});
}

gulp.task('default', gulpSequence('build', 'serve'));

gulp.task('build', () => {
	return merge([
		buildHtml(),
		buildScss(),
		buildJs(),
		buildVendor()
	]);
});

gulp.task('build::html', () => {
	return buildHtml();
});

gulp.task('build::scss', () => {
	return buildScss();
});

function runFlow(done) {
	exec("flow", (err, stdout, stderr) => {
		if(err) {
			console.log(stdout);
			return done();
		}

		done();
	});
}

gulp.task('flow', (done) => {
	return runFlow(done);
});

gulp.task('build::script', () => {
	return merge([
		buildJs(), 
		buildVendor()
	]);
});

gulp.task('mocha', (done) => {
	exec("mocha test/.setup.js test/**/*-test.js", (err, stdout, stderr) => {
		if(err) {
			console.log(err);
			console.log(stderr);
		}
		else {
			console.log(stdout);
		}

		done();
	});
});

gulp.task('serve', () => {
	return serve();
});

const rmrf = require('rimraf');

gulp.task('clear::cache', (cb) => {
	rmrf(__dirname + '/node_modules/flat-cache/.cache', (err) => {
		if(err) {
			gutil.log(err.message);
		}

		cb();
	});
});