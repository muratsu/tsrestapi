import * as express from 'express';
import * as logger from 'morgan';
import * as bodyParser from 'body-parser';
import * as cookieParser from 'cookie-parser';
import * as compress from 'compression';
import * as methodOverride from 'method-override';
import * as cors from 'cors';
import * as httpStatus from 'http-status';
// tslint:disable-next-line
import expressValidator = require('express-validator');
import * as helmet from 'helmet';
import routes from '../src/routes';
import config from './env';
import APIError from '../src/helpers/APIError';
import winstonInstance from './winston';
// tslint:disable-next-line
let expressWinston = require('express-winston');

const app = express();

if (config.env === 'development') {
  app.use(logger('dev'));
}

// parse body params and attache them to req.body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(compress());
app.use(methodOverride());

// secure apps by setting various HTTP headers
app.use(helmet());

// enable CORS - Cross Origin Resource Sharing
app.use(cors());

// validators
app.use(expressValidator({
  errorFormatter: (param: string, msg: string, value: any) => {
    let namespace = param.split('.');
    let root = namespace.shift();
    let formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }

    return {
      message: msg,
      status: httpStatus.BAD_REQUEST,
      isPublic: true,
      _param : formParam,
      _value : value
    };
  }
}));

// mount all routes on /api path
app.use('/api', routes);

// enable detailed API logging in dev env
if (config.env === 'development') {
  expressWinston.requestWhitelist.push('body');
  expressWinston.responseWhitelist.push('body');
  app.use(expressWinston.logger({
    winstonInstance: winstonInstance,
    meta: true, // optional: log meta data about request (defaults to true)
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    colorStatus: true // color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
  }));
}

// log error in winston transports except when executing test suite
if (config.env !== 'test') {
  app.use(expressWinston.errorLogger({
    winstonInstance: winstonInstance
  }));
}

// if error is not an instanceOf APIError, convert it.
app.use((err: any, req: express.Request, res: express.Response, next: any) => {
  // if (err instanceof expressValidator.ValidationError) {
  //   // validation error contains errors which is an array of error each containing message[]
  //   const unifiedErrorMessage = err.errors.map(error => error.messages.join('. ')).join(' and ');
  //   const error = new APIError(unifiedErrorMessage, err.status, true);
  //   return next(error);
  if (!(err instanceof APIError)) {
    const apiError = new APIError(err.message, err.status, err.isPublic);
    return next(apiError);
  }
  return next(err);
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new APIError('API not found', httpStatus.NOT_FOUND);
  return next(err);
});

// error handler, send stacktrace only during development
app.use((err: any, req: express.Request, res: express.Response, next: any) => {
  return res.status(err.status).json({
    message: err.isPublic ? err.message : (<any>httpStatus)[err.status],
    stack: config.env === 'development' ? err.stack : {}
  });
});

export default app;
