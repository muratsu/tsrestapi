import {User, IUserModel} from '../models/user';
import * as express from "express";

/**
 * Load user and append to req.
 */
let load: express.RequestParamHandler = async function (req, res, next, id) {
  try {
    let user = User.get(id);
    req.params.user = user;
    return next();
  } catch(e) {
    next(e);
    return;
  }
}

/**
 * Get user
 * @returns {User}
 */
let get: express.RequestHandler = (req, res) => {
  return res.json(req.params.user);
}

/**
 * Create new user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
let create: express.RequestHandler = (req, res, next) => {
  req.checkBody('username', 'invalid username').notEmpty().isAlphanumeric();
  req.checkBody('mobileNumber', 'invalid mobile number').notEmpty().isAlphanumeric();

  let valErrors = <any[]>(req.validationErrors());
  if (valErrors) {
    valErrors.forEach((val, idx, arr) => {
      next(val);
    });
    return;
  }

  const user = new User({
    username: req.body.username,
    mobileNumber: req.body.mobileNumber
  });

  user.save((err, savedUser, num) => {
    if (err) {
      next(err);
      return;
    }
    res.json(savedUser);
  });
}

/**
 * Update existing user
 * @property {string} req.body.username - The username of user.
 * @property {string} req.body.mobileNumber - The mobileNumber of user.
 * @returns {User}
 */
let update: express.RequestHandler = (req, res, next) => {
  const user = <IUserModel>(req.params.user);
  user.username = req.body.username;
  user.mobileNumber = req.body.mobileNumber;

  user.save((err, savedUser, num) => {
    if (err) {
      next(err);
      return;
    }
    res.json(savedUser);
  });
}

/**
 * Get user list.
 * @property {number} req.query.skip - Number of users to be skipped.
 * @property {number} req.query.limit - Limit number of users to be returned.
 * @returns {User[]}
 */
let list: express.RequestHandler = async function (req, res, next) {
  const { limit = 50, skip = 0 } = req.query;
  try {
    let users = await User.list({ limit, skip });
    res.json(users);
    return;
  } catch(e) {
    next(e);
    return;
  }
}

/**
 * Delete user.
 * @returns {User}
 */
let remove: express.RequestHandler = async function (req, res, next) {
  const user = req.params.user;
  try {
    let deletedUser: IUserModel = user.removeAsync();
    res.json(deletedUser);
    return;
  } catch(e) {
    next(e);
    return;
  }
}

export default { load, get, create, update, list, remove };
