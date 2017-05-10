"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _hashids = require("hashids");

var _hashids2 = _interopRequireDefault(_hashids);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var hasher = new _hashids2.default("Wimer Project Salt", 10);

exports.default = hasher;
//# sourceMappingURL=hasher.js.map