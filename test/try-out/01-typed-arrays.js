/* eslint-disable max-statements, no-invalid-this, no-magic-numbers, no-unused-expressions, require-jsdoc */

describe('Try out Javascript typed arrays.', function () {
  'use strict';

  // See https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String?hl=en
  function ab2str (buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf)); // eslint-disable-line prefer-reflect
  }
  function str2ab (str) {
    const buf = new ArrayBuffer(2 * str.length); // 2 bytes for each char
    const bufView = new Uint16Array(buf);

    for (let i = 0, strLen = str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }

    return bufView.buffer;
  }

  // Test cases
  describe('Case 1: chrome.webRequest.onBeforeRequest can return an ArrayBuffer.', function () {
    context('ArrayBuffer with strings.', function () {
      it('Should create an ArrayBuffer from a string.', function (done) {
        const body = 'HELLO';

        expect(body).to.be.a('string');
        expect(body).to.have.lengthOf(5);

        const array = Array.from(body);

        expect(array).to.be.instanceof(Array);
        expect(array).to.have.lengthOf(body.length);
        expect(array[0] === 'H').to.be.true;
        expect(array[1] === 'E').to.be.true;
        expect(array[2] === 'L').to.be.true;
        expect(array[3] === 'L').to.be.true;
        expect(array[4] === 'O').to.be.true;
        expect(typeof array[5] === 'undefined').to.be.true;

        const arrayBuffer = str2ab(body);

        expect(arrayBuffer).to.be.instanceof(ArrayBuffer);
        expect(arrayBuffer.byteLength).to.be.equal(2 * body.length);

        const uint16 = new Uint16Array(arrayBuffer);

        expect(uint16).to.be.instanceof(Uint16Array);
        expect(uint16.byteLength).to.be.equal(2 * body.length);
        expect(uint16.length).to.be.equal(body.length);
        expect(uint16[0]).to.be.equal(72);
        expect(uint16[1]).to.be.equal(69);
        expect(uint16[2]).to.be.equal(76);
        expect(uint16[3]).to.be.equal(76);
        expect(uint16[4]).to.be.equal(79);
        expect(typeof uint16[5] === 'undefined').to.be.true;

        const string = ab2str(arrayBuffer);

        expect(string).to.be.a('string');
        expect(string).to.have.lengthOf(body.length);
        expect(string === body).to.be.true;

        return done();
      });
    });
  });
});
