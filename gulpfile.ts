import * as gulp from 'gulp';
import * as gulpLoadPlugins from 'gulp-load-plugins';
import * as path from 'path';
import * as del from 'del';
import * as runSequence from 'run-sequence';
import {Gulpclass, Task} from 'gulpclass/Decorators';

const plugins: any = gulpLoadPlugins();
const tsProject = plugins.typescript.createProject('tsconfig.json');
// tslint:disable-next-line
const tsCompiler = require('ts-node/register');

const paths = {
  finalJS: ['dist/**/*.js'],
  ts: ['./**/*.ts', '!dist/**', '!node_modules/**', '!coverage/**', '!src/tests/**'],
  nonJs: ['./package.json', './.gitignore'],
  tests: './src/tests/*.ts'
};

const options = {
  codeCoverage: {
    reporters: ['lcov', 'text-summary'],
    thresholds: {
      global: { statements: 80, branches: 75, functions: 80, lines: 80 }
    }
  }
};

@Gulpclass()
export class Gulpfile {

  // clean up dist and coverage directory
  @Task('clean')
  clean() {
    return del(['dist/**', 'coverage/**', '!dist', '!coverage']);
  }

  // clean up docs directory
  @Task('clean:docs')
  cleanDocs() {
    return del(['docs/**', '!docs']);
  }

  // set env variables
  @Task('set-env')
  setEnv(cb: Function) {
    plugins.env({
      vars: {
        NODE_ENV: 'test'
      }
    });
    cb();
  }

  // lint TypeScript
  @Task('lint')
  lint() {
    return gulp.src([...paths.ts, '!typings/**'])
      .pipe(plugins.tslint({
        formatter: 'prose'
      }))
      .pipe(plugins.tslint.report({
          emitError: true,
          summarizeFailureOutput: true
      }));
  }

  // copy non-js files to dist
  @Task('copy')
  copy() {
    return gulp.src(paths.nonJs)
      .pipe(plugins.newer('dist'))
      .pipe(gulp.dest('dist'));
  }

  // generate docs from TypeScript files
  @Task('docs', ['clean:docs'])
  docs() {
    return gulp.src([...paths.ts, '!gulpfile.ts'], { base: '.' })
      .pipe(plugins.typedoc({
        module: 'commonjs',
        target: 'es6',
        includeDeclarations: true,

        // typedoc options
        out: './docs',
        name: 'Rest Api Project',
        theme: 'default',
        excludeExternals: true,
        // plugins: ["my", "plugins"],
        ignoreCompilerErrors: false,
        version: true
      }));
  }

  // compile TypeScript to ES5 and copy to dist
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

  // start server with restart on file changes
  @Task('nodemon', ['lint', 'copy', 'typescript'])
  nodemon() {
    plugins.nodemon({
      script: path.join('dist', 'index.js'),
      ext: 'js',
      ignore: ['node_modules/**/*.js', 'dist/**/*.js'],
      tasks: ['lint', 'copy', 'typescript']
    });
  }

  // covers files for code coverage
  @Task('pre-test')
  preTest(cb: Function) {
    return gulp.src([...paths.finalJS, '!gulpfile.ts'])
      // covering files
      .pipe(plugins.istanbul({
        includeUntested: true
      }))
      // force `require` to return covered files
      .pipe(plugins.istanbul.hookRequire());
  }

  // triggers mocha test with code coverage
  @Task('test', ['pre-test', 'set-env'])
  test() {
    let reporters = {};
    let exitCode = 0;

    if (plugins.util.env['code-coverage-reporter']) {
      reporters = [...options.codeCoverage.reporters, plugins.util.env['code-coverage-reporter']];
    } else {
      reporters = options.codeCoverage.reporters;
    }

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
      // creating the reports after execution of test cases
      .pipe(plugins.istanbul.writeReports({
        dir: './coverage',
        reporters
      }))
      // enforce test coverage
      .pipe(plugins.istanbul.enforceThresholds({
        thresholds: options.codeCoverage.thresholds
      }))
      .on('end', () => {
          plugins.util.log('completed !!');
          process.exit(exitCode);
      });
  }

  // clean dist, compile js files, copy non-js files and execute tests
  @Task('mocha', ['clean'])
  mocha() {
    runSequence(
      ['copy', 'lint', 'typescript'],
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
