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

import { useOktaAuth } from '@okta/okta-react';
import React from 'react';
import { useHistory, Link } from 'react-router-dom';
import { Container, Icon, Image, Menu, Input } from 'semantic-ui-react';

const Navbar = ({ setCorsErrorModalOpen }) => {
  const history = useHistory();
  const { authState, oktaAuth } = useOktaAuth();
  const login = async () => history.push('/login');

  // Note: Can't distinguish CORS error from other network errors
  const isCorsError = (err) => (err.name === 'AuthApiError' && !err.errorCode && err.xhr.message === 'Failed to fetch');

  const logout = async () => {
    try {
      await oktaAuth.signOut();
    } catch (err) {
      if (isCorsError(err)) {
        setCorsErrorModalOpen(true);
      } else {
        throw err;
      }
    }
  };

  return (
    <div>
      <Menu secondary inverted style={{ backgroundColor: '#dc1431', height: '80px', fontSize: '15px' }}>
        <Container>
          <Menu.Item header>
            <Image size="mini" src="/bank.png" />
            &nbsp;
            <Link to="/">&nbsp;Bank of America</Link>
          </Menu.Item>
          <Menu.Item>
            Online Banking
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item>
              Profile &amp; Settings
            </Menu.Item>
            <Menu.Item>
              Saved Items
            </Menu.Item>
            <Menu.Item>
              <Input className="icon" icon="search" placeholder="How Can We Help You?" />
            </Menu.Item>
          </Menu.Menu>
          {authState.isAuthenticated && (
          <Menu.Item id="messages-button">
            <Icon name="mail outline" />
            <Link to="/messages">Messages</Link>
          </Menu.Item>
          )}
          {authState.isAuthenticated && (
            <Menu.Item id="profile-button">
              <Link to="/profile">Profile</Link>
            </Menu.Item>
          )}
          {authState.isAuthenticated && <Menu.Item id="logout-button" onClick={logout}>Logout</Menu.Item>}
          {!authState.isPending && !authState.isAuthenticated && <Menu.Item onClick={login}>Login</Menu.Item>}
        </Container>
      </Menu>
      <Menu attached="top" style={{ backgroundColor: '#e5e2da', marginTop: '-20px' }}>
        <Menu.Item>
          Accounts
        </Menu.Item>
        <Menu.Item>
          Bill Pay
        </Menu.Item>
        <Menu.Item>
          Transfer | Zelle
        </Menu.Item>
        <Menu.Item>
          Rewards &amp; Deals
        </Menu.Item>
        <Menu.Item>
          Tools &amp; Investing
        </Menu.Item>
        <Menu.Menu position="right">
          <Menu.Item>
            Open an Account
          </Menu.Item>
          <Menu.Item>
            Help &amp; Support
          </Menu.Item>
        </Menu.Menu>
      </Menu>
    </div>
  );
};
export default Navbar;
