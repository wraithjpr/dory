/* eslint-disable require-jsdoc */
;(function (window, document, global, chrome) { // eslint-disable-line no-extra-semi, no-unused-vars
  'use strict';

  const HTTP_GET = 'GET';
  const HTTP_POST = 'POST';

  const HTTP_OK = 200;

  function get (url) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();

      xhr.open(HTTP_GET, url, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === HTTP_OK) {
            resolve(xhr.response);
          } else {
            reject(new Error(xhr.statusText));
          }
        }
      };

      // Handle network errors
      xhr.onerror = function () {
        reject(new Error('Network Error'));
      };

      // Make the request
      xhr.send();
    });
  }

  function getJSON (url) {
    return get(url).then(JSON.parse);
  }

  function post (url, body) {
    return new Promise(function (resolve, reject) {
      const xhr = new XMLHttpRequest();

      xhr.open(HTTP_POST, url, true);

      xhr.onreadystatechange = function () {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === HTTP_OK) {
            resolve(xhr.response);
          } else {
            reject(new Error(xhr.statusText));
          }
        }
      };

      // Handle network errors
      xhr.onerror = function () {
        reject(new Error('Network Error'));
      };

      // Make the request
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(JSON.stringify(body));
    });
  }

  function postJSON (url, body) {
    return post(url, body).then(JSON.parse);
  }

  // Assign to global.$JPW$ for use by other scripts
  if (!global.hasOwnProperty('$JPW$')) {
    global.$JPW$ = Object.create({});
  }

  global.$JPW$.webApiUtils = {
    get,
    getJSON,
    post,
    postJSON
  };

  return;
}(window, document, window, chrome));
