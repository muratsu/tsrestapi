import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import * as path from 'path';
import * as del from 'del';
import * as runSequence from 'run-sequence';
import {Gulpclass, Task} from "gulpclass/Decorators";

// import * as isparta from 'isparta';

const plugins: any = gulpLoadPlugins();
const tsProject = plugins.typescript.createProject('tsconfig.json');
const tsCompiler = require('ts-node/register');

const paths = {
  ts: ['./**/*.ts', '!dist/**', '!node_modules/**', '!coverage/**'],
  nonJs: ['./package.json', './.gitignore'],
  tests: './src/tests/*.ts'
};

const options = {
  codeCoverage: {
    reporters: ['lcov', 'text-summary'],
    thresholds: {
      global: { statements: 80, branches: 80, functions: 80, lines: 80 },
      each: { statements: 50, branches: 50, functions: 50, lines: 50 }
    }
  }
};

@Gulpclass()
export class Gulpfile {

  // Clean up dist and coverage directory
  @Task('clean')
  clean() {
    return del(['dist/**', 'coverage/**', '!dist', '!coverage']);
  }

  // Set env variables
  @Task('set-env')
  setEnv(cb: Function) {
    plugins.env({
      vars: {
        NODE_ENV: 'test'
      }
    });
    cb();
  }

  // Lint TypeScript
  @Task('lint')
  lint() {
    return gulp.src(paths.ts)
      // eslint() attaches the lint output to the "eslint" property
      // of the file object so it can be used by other modules.
      // .pipe(plugins.eslint())
      // eslint.format() outputs the lint results to the console.
      // Alternatively use eslint.formatEach() (see Docs).
      // .pipe(plugins.eslint.format())
      // To have the process exit with an error code (1) on
      // lint error, return the stream and pipe to failAfterError last.
      // .pipe(plugins.eslint.failAfterError());
  }

  // Copy non-js files to dist
  @Task('copy')
  copy() {
    return gulp.src(paths.nonJs)
        .pipe(plugins.newer('dist'))
        .pipe(gulp.dest('dist'))
  }


  // Compile TypeScript to ES5 and copy to dist
  @Task('typescript')
  typescript() {
    return gulp.src([...paths.ts, '!gulpfile.ts'], { base: '.' })
      .pipe(plugins.newer('dist'))
      .pipe(plugins.sourcemaps.init())
      .pipe(plugins.typescript(tsProject))
      .pipe(plugins.sourcemaps.write('.', {
        includeContent: false,
        sourceRoot(file: any) {
          return path.relative(file.path, __dirname);
        }
      }))
    .pipe(gulp.dest('dist'));
  }

  // Start server with restart on file changes
  @Task('nodemon', ['lint', 'copy', 'typescript'])
  nodemon() {
    plugins.nodemon({
      script: path.join('dist', 'index.js'),
      ext: 'js',
      ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
      tasks: ['lint', 'copy', 'typescript']
    })
  }

  // covers files for code coverage
  @Task('pre-test')
  preTest(cb: Function) {
    // return gulp.src([...paths.ts, '!gulpfile.ts'])
      // Covering files
      // .pipe(plugins.istanbul({
      //   instrumenter: isparta.Instrumenter,
      //   includeUntested: true
      // }))
      // Force `require` to return covered files
      // .pipe(plugins.istanbul.hookRequire())
      cb();
  }

  // triggers mocha test with code coverage
  @Task('test', ['pre-test', 'set-env'])
  test() {
    let reporters = {};
    let exitCode = 0;

    // if (plugins.util.env['code-coverage-reporter']) {
    //   reporters = [...options.codeCoverage.reporters, plugins.util.env['code-coverage-reporter']];
    // } else {
    //   reporters = options.codeCoverage.reporters;
    // }

    return gulp.src([paths.tests], { read: false })
      .pipe(plugins.plumber())
      .pipe(plugins.mocha({
        reporter: plugins.util.env['mocha-reporter'] || 'spec',
        ui: 'bdd',
        timeout: 6000,
        compiler: {
          ts: tsCompiler
        }
      }))
      .once('error', (err: Error) => {
        plugins.util.log(err);
        exitCode = 1;
      })
      // // // Creating the reports after execution of test cases
      // // .pipe(plugins.istanbul.writeReports({
      // //   dir: './coverage',
      // //   reporters
      // // }))
      // // // Enforce test coverage
      // // .pipe(plugins.istanbul.enforceThresholds({
      // //   thresholds: options.codeCoverage.thresholds
      // // }))
      .once('end', () => {
        plugins.util.log('completed !!');
        process.exit(exitCode);
      });
  }

  // clean dist, compile js files, copy non-js files and execute tests
  @Task('mocha', ['clean'])
  mocha() {
    runSequence(
      ['copy', 'typescript'],
      'test'
    );
  }

  // gulp serve for development
  @Task('serve', ['clean'])
  serve() {
    runSequence('nodemon');
  }

  // default task: clean dist, compile js files and copy non-js files.
  @Task('default', ['clean'])
  default() {
    runSequence(
      ['copy', 'typescript']
    );
  }
}
