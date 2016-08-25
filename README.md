# Express & mongoose REST API Boilerplate in TS with Code Coverage

## Overview

This is a boilerplate application for building REST APIs in Node.js using TS and Express with Code Coverage.
It's based on https://github.com/KunalKapadia/express-mongoose-es6-rest-api

### Features

| Feature                                | Summary                                                                                                                                                                                                                                                     |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Typescript Support                  	 	 | [TypeScript](https://www.typescriptlang.org/).  |
| Code Linting               			 | TS code linting is done using [TSLint](https://github.com/palantir/tslint)                                                                                                |
| Auto server restart                  	 | Restart the server using [nodemon](https://github.com/remy/nodemon) in real-time anytime an edit is made, with babel compilation and eslint.                                                                                                                                                                            |
| Code Coverage via [istanbul](https://www.npmjs.com/package/istanbul)                  | Supports code coverage using istanbul and mocha. Code coverage reports are saved in `coverage/` directory post `npm test` execution. Open `lcov-report/index.html` to view coverage report. `npm test` also displays code coverage summary on console.                                                                                                                                                                            |
| Debugging via [debug](https://www.npmjs.com/package/debug)           | Instead of inserting and deleting console.log you can replace it with the debug function and just leave it there. You can then selectively debug portions of your code by setting DEBUG env variable. If DEBUG env variable is not set, nothing is displayed to the console.                       |
| Secure app via [helmet](https://github.com/helmetjs/helmet)           | Helmet helps secure Express apps by setting various HTTP headers. |

- CORS support via [cors](https://github.com/expressjs/cors)
- Uses [http-status](https://www.npmjs.com/package/http-status) to set http status code. It is recommended to use `httpStatus.INTERNAL_SERVER_ERROR` instead of directly using `500` when setting status code.
- Has `.editorconfig` which helps developers define and maintain consistent coding styles between different editors and IDEs.

## Getting Started

Clone the repo:
```sh
git clone https://github.com/muratsu/tsrestapi.git
cd tsrestapi
```

Install dependencies:
```sh
npm install
typings install
```

Start server:
```sh
npm run start
```

Execute tests:
```sh
npm test
```

Other tasks:
```sh
# Creates docs in doc folder
npm run docs
```

##### Commit:

Follows [AngularJS's commit message convention](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#-git-commit-guidelines)
```sh
# Lint and execute tests before committing code.
npm run commit
# OR
# use git commit directly with correct message convention.
git commit -m "chore(ghooks): Add pre-commit and commit-msg ghook"
```

## Contributing

Contributions, questions and comments are all welcome and encouraged. For code contributions submit a pull request with unit test.
