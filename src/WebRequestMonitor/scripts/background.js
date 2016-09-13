;(function (window, document, global, chrome) { // eslint-disable-line no-extra-semi
  'use strict';

  const MAIN_EXTENSION_ID = 'abdgnfkllabhagajifbiladleedklkep';

  const RESOURCE_TYPES_ENUM = [ // eslint-disable-line no-unused-vars
    'font',
    'image',
    'main_frame',
    'object',
    'other',
    'ping',
    'script',
    'stylesheet',
    'sub_frame',
    'xmlhttprequest'
  ];

  const ON_BEFORE_REQUEST_OPTIONS_ENUM = [ // eslint-disable-line no-unused-vars
    'blocking',
    'requestBody'
  ];

  const OPTIONS_BLOCK = ['blocking'];

  const SECURUS_URL = 'http://www.securus-software.com/';
  const REDIRECT_TO_SECURUS_RESPONSE = { redirectUrl: SECURUS_URL };
  const BLOCK_RESPONSE = { cancel: true };

  const BLACK_LIST = [
    '*://twitter.com/*'
  ];

  const listenAllFilter = {
    urls: ['<all_urls>'],
    types: ['image', 'main_frame', 'object', 'other', 'sub_frame', 'xmlhttprequest']
  };

  const redirectFacebookFilter = {
    urls: ['*://www.facebook.com/*'],
    types: ['main_frame']
  };

  const blockBlacklistFilter = {
    urls: BLACK_LIST,
    types: RESOURCE_TYPES_ENUM
  };

  const responseCallback = function (response) {
    if (response) {
      console.log(`${response.ack ? 'ACK' : response.nack ? 'NACK' : 'ERROR'}`);  // eslint-disable-line no-nested-ternary
    } else {
      if (chrome.runtime.lastError) {  // eslint-disable-line no-lonely-if
        console.log(chrome.runtime.lastError.message);
      } else {
        console.log('Expected a chrome.runtime.lastError but none existed.');
      }
    }

    return;
  };

  const sendToMain = function (message) {
    chrome.runtime.sendMessage(MAIN_EXTENSION_ID, message, responseCallback);

    return message;
  };

  const makeMessageFromPayload = (type, payload) => ({
    type,
    payload
  });
  const makeBlockMessage = (payload) => makeMessageFromPayload('block', payload);
  const makeRedirectMessage = (payload) => makeMessageFromPayload('redirect', payload);
  const makeMonitorMessage = (payload) => makeMessageFromPayload('monitor', payload);

  const listenAllCallback = function (details) {
    sendToMain(makeMonitorMessage(details));

    return null;
  };

  const redirectFacebookCallback = function (details) {
    sendToMain(makeRedirectMessage(details));

    return REDIRECT_TO_SECURUS_RESPONSE;
  };

  const blockBlacklistCallback = function (details) {
    sendToMain(makeBlockMessage(details));

    return BLOCK_RESPONSE;
  };

  chrome.webRequest.onBeforeRequest.addListener(listenAllCallback, listenAllFilter);
  chrome.webRequest.onBeforeRequest.addListener(redirectFacebookCallback, redirectFacebookFilter, OPTIONS_BLOCK);
  chrome.webRequest.onBeforeRequest.addListener(blockBlacklistCallback, blockBlacklistFilter, OPTIONS_BLOCK);

  // Say hello to the main extension
  sendToMain({ payload: 'Hello there, Main!... from The Monitor' });

  return;
}(window, document, window, chrome));
