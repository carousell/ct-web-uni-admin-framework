import { setCookie, removeCookie } from './cookie';
const crypto = require('crypto');
const CryptoJS = require("crypto-js");

AccountsTemplates.addField({
  _id: 'username',
  type: 'text',
  func: function (value) {
    return value
  },
});

const sha1 = require('sha1');
var oldLoginSystem = Meteor.loginWithPassword
Meteor.hashCPPassowrd = function (value) {
  return sha1(value);
}
Meteor.cpInfo = function (key) {
  let user = Meteor.user();
  let cpInfo = (user && user.services.cp) || {};
  return (key && cpInfo[key]) || cpInfo
}
Meteor.oldLoggingIn = Meteor.loggingIn;
var isCPLoggingIn = new ReactiveVar(true);
Meteor.loggingIn = function () {
  return isCPLoggingIn.get() && Meteor.oldLoggingIn();
}
Meteor.loginWithPassword = function (user, password, cb) {
  if (user.indexOf("@") != -1) {
    // return oldLoginSystem.apply(Meteor, arguments);
    return oldLoginSystem(user, password, function(err) {
      cb(err);
      const salt = generateSalt(16);
      const hashObj = hash(Meteor.user()._id, salt);
      hashObj.platform = 'admin-centre';
      const tokenizer = JSON.stringify(hashObj) + "_" + hashObj.salt;

      setCookie('__token', tokenizer, 3600, getDomain(meteorEnv.NODE_ENV));
    });
  }
  isCPLoggingIn.set(true);
  return Accounts.callLoginMethod({
    methodArguments: [{ cp: { username: user, password: Meteor.hashCPPassowrd(password) } }],
    userCallback: function (err) {
      if (!err) {
        setTimeout(function () {
          isCPLoggingIn.set(false);

          // set cookie with timeout 1 hour on login
          setCookie('s', Meteor.user().services.cp.token, 3600, getDomain(meteorEnv.NODE_ENV))
        }, 0)
        return Meteor.logoutOtherClients(cb)
      }
      cb && cb(err);
    }
  });
}

Accounts.onLogin(function () {
  Meteor.call('Global/User/VerifyToken');
})

Accounts.onLogout(function () {
  // remove cookie when logout
  removeCookie('s', getDomain(meteorEnv.NODE_ENV))
})

const getDomain = (env) => {
  let domain = '.dev.com'
  if (env === 'development') {
    domain = '.chotot.org'
  }
  if (env === 'production') {
    domain = '.chotot.com'
  }
  return domain
}

const generateSalt = rounds => {
  if (rounds > 16) {
      throw new Error(`${rounds} is greater than 16,Must be less that 16`);
  }
  if (typeof rounds !== 'number') {
      throw new Error('rounds param must be a number');
  }
  if (rounds == null) {
      rounds = 12;
  }
  return crypto.randomBytes(Math.ceil(rounds / 2)).toString('hex').slice(0, rounds);
};

const hasher = (str, salt) => {
  const hash = CryptoJS.AES.encrypt(str, salt).toString();
  return {
    salt: salt,
    hashedStr: hash,
  };
};

const hash = (str, salt) => {
  if (str == null || salt == null) {
      throw new Error('Must Provide String and salt values');
  }
  if (typeof str !== 'string' || typeof salt !== 'string') {
      throw new Error('Password must be a string and salt must either be a salt string or a number of rounds');
  }
  return hasher(str, salt);
};