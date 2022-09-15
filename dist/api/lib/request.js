"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequest = void 0;
const buildURL = (host, path) => `${host}${path}`;
const createRequest = (address) => {
    return (path, options) => __awaiter(void 0, void 0, void 0, function* () {
        const response = yield fetch(buildURL(address, path), options ? {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify((options === null || options === void 0 ? void 0 : options.body) || {})
        } : undefined);
        return response[(options === null || options === void 0 ? void 0 : options.responseType) || 'json']();
    });
};
exports.createRequest = createRequest;
