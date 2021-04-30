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
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Button, Header, Form, List } from 'semantic-ui-react';

const Admin = () => {
  const history = useHistory();
  const { authState, oktaAuth } = useOktaAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loanDocs, setLoanDocs] = useState();
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [targetName, setTargetName] = useState(null);
  // const [apiResponse, setApiResponse] = useState(null);
  // const [isFilePicked, setIsFilePicked] = useState(false);

  const token = 'Bearer nZFvaMl9IQlhKg3ZWoHV7NdgW2TpFOHM';
  const changeHandler = (event) => {
    setSelectedFile(event.target.files[0]);
    console.log('Check selected file: ', event.target.files[0]);
    // setIsFilePicked(true);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // console.log('selectedFile: ', selectedFile);
    formData.append('file', selectedFile);
    // const response = await fetch('http://localhost:8000/api/fileUpload', {
    const attributes = JSON.stringify({
      content_created_at: '',
      content_modified_at: '',
      name: selectedFile.name,
      parent: {
        id: '0',
      },
    });
    formData.append('attributes', attributes);
    const response = await fetch('https://upload.box.com/api/2.0/files/content', {
      method: 'POST',
      // mode: 'no-cors',
      headers: {
        // 'Content-Type': 'multipart/form-data',
        Authorization: token,
      },
      body: formData,
    });
    const resp = await response.text();
    console.log('resp: ', resp);
  };

  const getFolderItems = async () => {
    let myObj;
    await fetch('https://api.box.com/2.0/folders/0/items/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => response.text())
      .then((result) => {
        console.log('result: ', result);
        myObj = JSON.parse(result);
      })
      .catch((error) => console.log('error: ', error));
    const { entries } = myObj;
    const fileArr = [];
    entries.forEach((element) => {
      if (element.type === 'file') {
        fileArr.push(element);
        console.log('should log to console every time a new file element gets pushed to fileArr: ', fileArr);
      }
    });
    setLoanDocs(fileArr);
  };

  const handleDownload = async (e) => {
    const { value } = e.target.dataset;
    setTargetName(e.target.innerText);
    const endpoint = `https://api.box.com/2.0/files/${value}/content/`;
    console.log('endpoint: ', endpoint);
    await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: token,
      },
    })
      .then((response) => {
        response.text();
        const { url } = response;
        console.log('url: ', url);
        setDownloadUrl(url);
      })
      .catch((error) => console.log('error: ', error));
  };

  let listItems = [];
  if (loanDocs && loanDocs.length > 0) {
    listItems = loanDocs.map((object) => <List.Item key={object.name.toString()} value={object.id} onClick={handleDownload}>{object.name}</List.Item>);
    console.log('listItems: ', listItems);
  }

  useEffect(() => {
    if (!authState.isAuthenticated) {
      // When user isn't authenticated, forget any user info
      setUserInfo(null);
    } else {
      oktaAuth.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [authState, oktaAuth]); // Update if authState changes

  const login = async () => {
    history.push('/login');
  };

  const resourceServerExamples = [
    {
      label: 'Node/Express Resource Server Example',
      url: 'https://github.com/okta/samples-nodejs-express-4/tree/master/resource-server',
    },
    {
      label: 'Java/Spring MVC Resource Server Example',
      url: 'https://github.com/okta/samples-java-spring/tree/master/resource-server',
    },
    {
      label: 'ASP.NET Core Resource Server Example',
      url: 'https://github.com/okta/samples-aspnetcore/tree/master/samples-aspnetcore-3x/resource-server',
    },
  ];

  if (authState.isPending) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <div>
        <Header as="h1">Welcome to the Remote Application!</Header>

        { authState.isAuthenticated && !userInfo
        && <div>Loading user information...</div>}

        {authState.isAuthenticated && userInfo
        && (
        <div>
          <p>
            Welcome, &nbsp;
            {userInfo.name}
            !
          </p>
          <p>
            You have successfully authenticated against your Okta org, and have been redirected back to this application.  You now have an ID token and access token in local storage.
            Visit the
            {' '}
            <a href="/profile">My Profile</a>
            {' '}
            page to take a look inside the ID token.
          </p>
          <h3>Next Steps</h3>
          <p>Currently this application is a stand-alone front end application.  At this point you can use the access token to authenticate yourself against resource servers that you control.</p>
          <p>This sample is designed to work with one of our resource server examples.  To see access token authentication in action, please download one of these resource server examples:</p>
          <ul>
            {resourceServerExamples.map((example) => <li key={example.url}><a href={example.url}>{example.label}</a></li>)}
          </ul>
          <p>
            Once you have downloaded and started the example resource server, you can visit the
            {' '}
            <a href="/messages">My Messages</a>
            {' '}
            page to see the authentication process in action.
          </p>
        </div>
        )}

        {!authState.isAuthenticated
        && (
        <div>
          <p>You can use the buttons below to upload new documents as well as view &amp; download documents you&apos;ve previously submitted:</p>
          <p>
            <span>This example shows you how to use the </span>
            <a href="https://github.com/okta/okta-react/tree/master">Okta React Library</a>
            <span> to add the </span>
            <a href="https://developer.okta.com/docs/guides/implement-auth-code-pkce">PKCE Flow</a>
            <span> to your application.</span>
          </p>
          <p>
            When you click the login button below, you will be presented the login page on the Okta Sign-In Widget hosted within the application.
            After you authenticate, you will be logged in to this application with an ID token and access token. These tokens will be stored in local storage and can be retrieved at a later time.
          </p>
          <Button id="login-button" primary onClick={login}>Login</Button>
          <div style={{ marginTop: '25px' }}>
            <Form.Field encType="multipart/form-data">
              {/* eslint-disable-next-line */}
              <label>Click Here to Select File to Upload:</label>
              <input type="file" id="upload" name="upload" onChange={changeHandler} style={{ marginLeft: '25px' }} />
              <Button type="submit" onClick={handleUpload} primary>Upload Docs</Button>
            </Form.Field>
          </div>
          <div style={{ marginTop: '25px' }}>
            <Button onClick={getFolderItems}>See Uploaded Files</Button>
          </div>
          {loanDocs
          && (
          <div style={{ marginTop: '25px' }}>
            <List bulleted link>
              {listItems}
            </List>
          </div>
          )}
          {downloadUrl
          && (
            <div style={{ marginTop: '25px' }}>
              <Button href={downloadUrl}>
                Click to Download&nbsp;
                {targetName}
              </Button>
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
};
export default Admin;
