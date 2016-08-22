import * as Promise from 'bluebird';
import * as mongoose from 'mongoose';
import * as httpStatus from 'http-status';
import APIError from '../helpers/APIError';

/**
 * User Schema
 */
// export type IUserModel = IUser & mongoose._mongoose._Model<IUser>;

interface IUserDocument extends mongoose.Document {
  username: string,
  mobileNumber: string,
  createdAt: Date
};

interface IUserStatics {
  get(id: number): Promise<IUserDocument>,
  list({}: {skip: number, limit: number}): Promise<IUserDocument[]>,
}

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true,
    match: [/^[1-9][0-9]{9}$/, 'The value of path {PATH} ({VALUE}) is not a valid mobile number.']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
UserSchema.method({
});

/**
 * Statics
 */
UserSchema.statics = {
  /**
   * Get user
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  get(id: number) {
    return this.findById(id)
      .execAsync().then((user: any) => {
        if (user) {
          return user;
        }
        const err = new APIError('No such user exists!', httpStatus.NOT_FOUND);
        return Promise.reject(err);
      });
  },

  /**
   * List users in descending order of 'createdAt' timestamp.
   * @param {number} skip - Number of users to be skipped.
   * @param {number} limit - Limit number of users to be returned.
   * @returns {Promise<User[]>}
   */
  list({ skip = 0, limit = 50 } = {}) {
    return this.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .execAsync();
  }
};

/**
 * @typedef User
 */
export type IUserModel = IUserDocument & IUserStatics & mongoose._mongoose._Model<IUserDocument>;
export const User = mongoose.model<IUserDocument, IUserStatics>('User', UserSchema);
