/*
 * Copyright (c) 2018, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *
 * See the License for the specific language governing permissions and limitations under the License.
 */

import React, { useState, useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import { Header, Icon, Table } from 'semantic-ui-react';

// const BoxSDK = require('box-node-sdk');

const Profile = () => {
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  // const sdk = new BoxSDK({
  //   clientID: '4xaegsr5mg392v5bkbib1pb12exw3eyj',
  //   clientSecret: 'tYI2U0xvyNUiABAdkZOTAZlO1UEwELNq',
  // });
  // Have to replace every 60 mins
  // const client = sdk.getBasicClient('EhZ0snVjvlKjrWY7HLFqrqb1cNFneHx9');
  // const getBoxInfo = () => {
  //   fetch(client.users.get(client.CURRENT_USER_ID))
  //     .then((user) => console.log('Hello', user.name, '!'))
  //     .catch((err) => console.log('Got an error!', err));
  // };

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      const token = oktaAuth.getAccessToken();
      // eslint-disable-next-line
      console.log('Access Token returned from oktaAuth: ', token);
      setAccessToken(token);
      // eslint-disable-next-line
      console.log('Access Token saved in state: ', accessToken);
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
        // getBoxInfo();
        // if (userInfo.sub) {
        //   box.validateUser(userInfo, res);
        // } else {
        //   console.log("No Okta ID")
        // }
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  if (!userInfo) {
    return (
      <div>
        <p>Fetching user profile...</p>
      </div>
    );
  }

  return (
    <div>
      <div>
        <Header as="h1">
          <Icon name="drivers license" />
          {' '}
          My User Profile (ID Token Claims)
          {' '}
        </Header>
        <p>
          Below is the information from your ID token which was obtained during the &nbsp;
          <a href="https://developer.okta.com/docs/guides/implement-auth-code-pkce">PKCE Flow</a>
          {' '}
          and is now stored in local storage.
        </p>
        <p>
          This route is protected with the
          {' '}
          <code>&lt;SecureRoute&gt;</code>
          {' '}
          component, which will ensure that this page cannot be accessed until you have authenticated.
        </p>
        <Table>
          <thead>
            <tr>
              <th>Claim</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(userInfo).map((claimEntry) => {
              const claimName = claimEntry[0];
              const claimValue = claimEntry[1];
              const claimId = `claim-${claimName}`;
              return (
                <tr key={claimName}>
                  <td>{claimName}</td>
                  <td id={claimId}>{claimValue.toString()}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default Profile;
