import * as path from 'path';

const env = process.env.NODE_ENV || 'development';
// tslint:disable-next-line
const config = require(`./${env}`).default;

// defaults
config.root = path.join(__dirname, '/..');

export default config;
