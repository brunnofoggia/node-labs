"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
exports.__esModule = true;
exports.idResponse = exports.update = exports.item = exports.create = void 0;
var d = new Date();
exports.create = {
    id: 1,
    createdAt: d,
    updatedAt: d,
    deletedAt: d
};
exports.item = __assign({ createdAt: d, updatedAt: d }, exports.create);
exports.update = __assign(__assign({}, exports.create), { createdAt: d, updatedAt: d, name: 'test2' });
exports.idResponse = { id: 1 };
