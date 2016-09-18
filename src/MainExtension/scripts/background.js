/* eslint-disable require-jsdoc */
;(function (window, document, global, chrome) { // eslint-disable-line no-extra-semi
  'use strict';

  const MONITOR_EXTENSION_ID = 'elojbmhgmpdndbpcjnhjckkjfejleelp';
  const HOST_URL = 'http://localhost:3000/api/events/';

  const TYPE_BLOCK = 'block';
  const TYPE_MONITOR = 'monitor';
  const TYPE_REDIRECT = 'redirect';
  const SEND_THESE_TO_HOST = [TYPE_BLOCK, TYPE_MONITOR, TYPE_REDIRECT];

  let profileUserInfo = null;

  /**
   * @summary Saves the user profile.
   * @description Sets the profileUserInfo variable in extension scope.
   *
   * @param {object} userInfo object as returned in the callback from chrome.identity.getProfileUserInfo(function callback)
   * @returns {object} profileUserInfo
   */
  function storeUser (userInfo) {
    profileUserInfo = userInfo;

    return profileUserInfo;
  }

  function retrieveUser () {
    return profileUserInfo;
  }

  const getUserEmail = (userInfo) => userInfo && (userInfo.email || '');

  /**
   * @summary  Returns a promise for user profile information.
   * @description
   * The promise fulfills returning a *userInfo* object as returned in the callback from chrome.identity.getProfileUserInfo(function callback).
   * The promise rejects if the user profile is empty due to the user not being signed in or the identity.email manifest permission not being specified.
   *
   * @returns {Promise} userInfo
   */
  function getUser () {
    return new Promise(function (resolve, reject) {
      chrome.identity.getProfileUserInfo(function (userInfo) {
        if (userInfo && userInfo.id && userInfo.email) {
          resolve(userInfo);
        } else {
          reject(new Error('User profile is empty.'));
        }
      });
    });
  }

  const formatTimeStamp = (timeStamp) => (new Date(timeStamp)).toISOString();

/* eslint-disable max-len, object-shorthand */
  const formatByType = {
    block: (details) => `Blacklist item intercepted and blocked: ${details.url} at ${formatTimeStamp(details.timeStamp)}: user is ${getUserEmail(retrieveUser())}`,
    monitor: (details) => `Web request of type ${details.type}: ${details.method} ${details.url} at ${formatTimeStamp(details.timeStamp)}: user is ${getUserEmail(retrieveUser())}: requestId is ${details.requestId}`,
    redirect: (details) => `Request redirected: ${details.url} at ${formatTimeStamp(details.timeStamp)}: user is ${getUserEmail(retrieveUser())}`,
    default: function (details) {
      return typeof details === 'string' ? details : details.toString();
    }
  };

/* eslint-enable max-len, object-shorthand */

  const renderInConsole = function (str) {
    console.log(str);

    return str;
  };

  const renderItem = (type, item) => renderInConsole(formatByType[type](item));

  const constructCapture = function (userInfo, message) {
    const capture = {
      captureType: message.type,
      method: message.payload.method,
      url: message.payload.url,
      userEmail: getUserEmail(userInfo),
      dateTime: formatTimeStamp(message.payload.timeStamp),
      resourceType: message.payload.type,
      tabId: message.payload.tabId,
      requestId: message.payload.requestId
    };

    if (message.payload.type === 'xmlhttprequest') {
      if (message.payload.requestBody) {
        console.log(`We have an xhr body for a ${message.payload.method}: ${JSON.stringify(message.payload.requestBody, null, 2)}`);
        // { "raw": [{ "bytes": { <<This is an ArrayBuffer object with a copy of the data>> } }] }
        capture.body = message.payload.requestBody;
      }
    }

    return Promise.resolve(capture);
  };

  const postJSONCurried = (url) => (body) => global.$JPW$.webApiUtils.postJSON(url, body);

  const sendToHost = postJSONCurried(HOST_URL);

  const logPostResponse = function (response) {
    console.log(`Host ${response.ack ? 'ACK' : response.nack ? 'NACK' : 'ERROR'}: ${response.uri} created.`); // eslint-disable-line no-nested-ternary

    return response;
  };

  // Our receiver function
  // NB. The message.payload.requestBody.raw[0].bytes is an instance of a plain Object here.
  // On sending in the monitor extension it is an empty instance of ArrayBuffer. The array buffer data is lost in transmission.
  const messageHandler = function (message, sender, respondCallback) {
    if (sender && sender.id === MONITOR_EXTENSION_ID) {
      if (message && message.payload) {
        renderItem(
          message.type || 'default',
          message.payload
        );

        if (SEND_THESE_TO_HOST.includes(message.type)) {
          constructCapture(retrieveUser(), message)
            .then(sendToHost)
            .then(logPostResponse)
            .then(function () {
              if (respondCallback) {
                respondCallback({ ack: true });
              }
            })
            .catch(function (err) {
              console.log(err.message);
              if (respondCallback) {
                respondCallback({ nack: true });
              }
            });
        } else {
          if (respondCallback) {
            respondCallback({ ack: true });
          }
        }
      } else {
        if (respondCallback) {
          respondCallback({ nack: true });
        }
      }
    } else {
      if (sender) {
        console.log(`Message received in Main from unknown extension: sender.id is ${sender.id}, sender.url is ${sender.url}.`);
      } else {
        console.log('Message received in Main with no sender.');
      }
      if (respondCallback) {
        respondCallback({ nack: true });
      }
    }

    return true;
  };

  getUser().then(storeUser)
  .catch(function (err) {
    console.error(err.message);
  });

  chrome.runtime.onMessageExternal.addListener(messageHandler);
  console.log('Main extension is listening...');

  return;
}(window, document, window, chrome));
