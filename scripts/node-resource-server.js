/* eslint-disable consistent-return, no-console */

const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');
const dotenv = require('dotenv');

// Read environment variables from "testenv". Override environment vars if they are already set.
const TESTENV = path.resolve(__dirname, '..', 'testenv');
if (fs.existsSync(TESTENV)) {
  const envConfig = dotenv.parse(fs.readFileSync(TESTENV));
  Object.keys(envConfig).forEach((k) => {
    process.env[k] = envConfig[k];
  });
}
process.env.CLIENT_ID = process.env.CLIENT_ID || process.env.SPA_CLIENT_ID;
process.env.OKTA_TESTING_DISABLEHTTPSCHECK = process.env.OKTA_TESTING_DISABLEHTTPSCHECK || false;

const box = (() => {
  const configJSON = JSON.parse(fs.readFileSync(path.resolve(__dirname, './config.json')));
  const sdk = boxSDK.getPreconfiguredInstance(configJSON);
  const client = sdk.getAppAuthClient('enterprise');

  let oktaRecord = {};
  let userId = '';
  let userClient;

  function validateUser(userInfo, res) {
    // TODO: VALIDATE USER
    this.oktaRecord = userInfo
    client.enterprise.getUsers({ "external_app_user_id": this.oktaRecord.sub })
    .then((result) => {
      if (result.total_count > 0) {
        // TODO: MAKE AUTHENTICATED USER CALL
        this.userId = result.entries[0].id;
        this.userClient = sdk.getAppAuthClient('user', this.userId);

        this.userClient.users.get(this.userClient.CURRENT_USER_ID)
        .then(currentUser => {
          res.send(`Hello ${currentUser.name}`);
        });
      } else {
        // User not found - create user
        this.createUser();
      }
    });
  }

  function createUser(res) {
    // TODO: CREATE USER
    const spaceAmount = 1073741824;   // ~ 1gb
    client.enterprise.addAppUser(
      this.oktaRecord.name, 
      {
        space_amount: spaceAmount,
        external_app_user_id: this.oktaRecord.sub
      }
    ).then(appUser => {
      res.send(`New user created: ${appUser.name}`);
    });
  }

  return {
    validateUser,
    createUser
  };
})();

function startResourceServer() {
  const dir = path.join(__dirname, '..', 'samples-nodejs-express-4');
  if (!fs.existsSync(dir)) {
    console.error('[ERROR] samples-nodejs-express4 doesn\'t exist.');
    return;
  }

  if (process.env.ISSUER === undefined) {
    console.error('[ERROR] Please set the ISSUER Environment variable');
    return;
  }

  if (process.env.CLIENT_ID === undefined) {
    console.error('[ERROR] Please set the CLIENT_ID Environment variable');
    return;
  }

  const command = `node ${dir}/resource-server/server.js`;
  const options = {
    env: {
      ISSUER: process.env.ISSUER,
      SPA_CLIENT_ID: process.env.CLIENT_ID,
      PATH: process.env.PATH,
      OKTA_TESTING_DISABLEHTTPSCHECK: process.env.OKTA_TESTING_DISABLEHTTPSCHECK,
    },
  };
  exec(command, options, (err, stdout) => {
    if (err !== null) {
      return console.error(err);
    }
    return console.log(stdout);
  });
}

startResourceServer();
