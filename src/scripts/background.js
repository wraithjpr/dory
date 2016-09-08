;(function (window, document, global, chrome) { // eslint-disable-line no-extra-semi
  'use strict';

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

  const formatTimeStamp = (timeStamp) => (new Date(timeStamp)).toISOString();

  const listenAllCallback = function (details) {
    console.log(`Web request ${details.requestId} of type ${details.type}: ${details.method} ${details.url} at ${formatTimeStamp(details.timeStamp)}`);

    return null;
  };

  const redirectFacebookCallback = function (details) {
    console.log(`Facebook redirected: ${details.url}`);

    return REDIRECT_TO_SECURUS_RESPONSE;
  };

  const blockBlacklistCallback = function (details) {
    console.log(`Blacklist intercepted: ${details.url}`);

    return BLOCK_RESPONSE;
  };

  chrome.webRequest.onBeforeRequest.addListener(listenAllCallback, listenAllFilter);
  chrome.webRequest.onBeforeRequest.addListener(redirectFacebookCallback, redirectFacebookFilter, OPTIONS_BLOCK);
  chrome.webRequest.onBeforeRequest.addListener(blockBlacklistCallback, blockBlacklistFilter, OPTIONS_BLOCK);

  return;
}(window, document, window, chrome));
