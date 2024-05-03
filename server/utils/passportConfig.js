// passport.js
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import UserModel from '../models/user.js';
import { createWallet } from './initWallet.js'

function generateRandomPassword() {
  return Math.random().toString(36).slice(-8);
}

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://127.0.0.1:8000/user/auth/google/callback"
  },
  async function(accessToken, refreshToken, profile, cb) {
    try {
      let user = await UserModel.findOne({ googleId: profile.id });
      if (!user) {
        user = new UserModel({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          password: generateRandomPassword()
        });
        await user.save();
        const wallet = await createWallet(user._id, "user");

        if (!wallet) {
          throw new Error('Failed to create wallet');
        }
      }
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  }
));

passport.serializeUser(function(user, done) {
    console.log(user);
    done(null, user._id);
  });

  passport.deserializeUser(async function(id, done) {
    try {
      const user = await UserModel.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
export default passport;