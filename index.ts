import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import config from './config/env';
import app from './config/express';

// promisify mongoose
Promise.promisifyAll(mongoose);

// connect to mongo db
mongoose.connect(config.db, { server: { socketOptions: { keepAlive: 1 } } });
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${config.db}`);
});

// tslint:disable-next-line
const debug = require('debug')('express-mongoose-ts-rest-api:index');

// listen on port config.port
app.listen(config.port, () => {
  debug(`server started on port ${config.port} (${config.env})`);
});

export default app;
