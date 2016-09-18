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
  const OPTIONS_BODY = ['requestBody'];

  const SECURUS_URL = 'http://www.securus-software.com/';

  const TYPE_BLOCK = 'block';
  const TYPE_MONITOR = 'monitor';
  const TYPE_REDIRECT = 'redirect';

  const EVENT_RESPONSES = {
    block: { cancel: true },
    monitor: null,
    redirect: { redirectUrl: SECURUS_URL }
  };

  const BLACK_LIST = [
    '*://twitter.com/*'
  ];

  const REDIRECT_LIST = [
    '*://www.facebook.com/*'
  ];

  const listenAllFilter = {
    urls: ['<all_urls>'],
    types: ['image', 'main_frame', 'object', 'other', 'sub_frame']
  };

  const listenXHRFilter = {
    urls: ['<all_urls>'],
    types: ['xmlhttprequest']
  };

  const redirectFilter = {
    urls: REDIRECT_LIST,
    types: ['main_frame']
  };

  const blockBlacklistFilter = {
    urls: BLACK_LIST,
    types: RESOURCE_TYPES_ENUM
  };

  // Our callback function
  const mainResponseCallback = function (response) {
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

  // Our sender function
  // NB. The message.payload.requestBody.raw[0].bytes is an instance of ArrayBuffer here.
  // On receipt in the main extension it is an empty instance of a plain Object. The array buffer data is lost in transmission.
  // See https://developers.chrome.com/extensions/runtime#method-sendMessage - the message should be a JSON-ifiable object.
  // An ArrayBuffer is not JSON-ifiable. So we convert it to a string using the technique given here:
  // https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en
  const sendToMain = function (message) {
    const body = message.payload.requestBody;

    if (body && body.raw && Array.isArray(body.raw) && body.raw.length > 0) {
      body.raw = body.raw.map(function (uploadData) {
        if (uploadData.bytes && uploadData.bytes instanceof ArrayBuffer) {
          // return String.fromCharCode.apply(null, new Uint16Array(uploadData.bytes));
          return String.fromCharCode.apply(null, new Uint8Array(uploadData.bytes));
        }

        return uploadData;
      });
    }

    chrome.runtime.sendMessage(MAIN_EXTENSION_ID, message, mainResponseCallback);

    return message;
  };

  // Our maker function
  const makeMessageFromPayload = (type, payload) => ({
    type,
    payload
  });

  // Our hendler function for BeforeRequest event.
  const beforeRequestHandler = function (sender, maker, responses, type, details) {
    sender(maker(type, details));

    return responses[type];
  };
  const beforeRequestHandlerCurried = (sender) => (maker) => (responses) => (type) => (details) => beforeRequestHandler(sender, maker, responses, type, details); // eslint-disable-line max-len
  const beforeRequestHandlerForType = beforeRequestHandlerCurried(sendToMain)(makeMessageFromPayload)(EVENT_RESPONSES);
  const beforeRequestCallbackForBlock = beforeRequestHandlerForType(TYPE_BLOCK);
  const beforeRequestCallbackForMonitor = beforeRequestHandlerForType(TYPE_MONITOR);
  const beforeRequestCallbackForRedirect = beforeRequestHandlerForType(TYPE_REDIRECT);

  chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallbackForMonitor, listenAllFilter);
  chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallbackForMonitor, listenXHRFilter, OPTIONS_BODY);
  chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallbackForRedirect, redirectFilter, OPTIONS_BLOCK);
  chrome.webRequest.onBeforeRequest.addListener(beforeRequestCallbackForBlock, blockBlacklistFilter, OPTIONS_BLOCK);

  // Say hello to the main extension
  sendToMain({ payload: 'Hello there, Main!... from The Monitor' });

  return;
}(window, document, window, chrome));
