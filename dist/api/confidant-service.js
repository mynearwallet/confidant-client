"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const request_1 = require("./lib/request");
class ConfidantService {
    constructor(address) {
        this.handshake = (publicKey, pkhash) => {
            return this.request('/api/handshake', {
                body: {
                    publicKey,
                    pkhash,
                },
            });
        };
        this.getCombinedKey = (publicKey) => {
            return this.request('/api/key', {
                body: { clientPublicKey: publicKey }
            });
        };
        this.signTransaction = (message, data, clientPublicKey, auth) => {
            return this.request('/api/sign', {
                body: {
                    message: message,
                    data,
                    clientPublicKey,
                    auth,
                }
            });
        };
        this.qrCode = (url) => {
            return this.request('/api/qrcode', {
                body: { url },
                responseType: 'blob',
            });
        };
        this.hasAuth = (publicKey) => {
            return this.request('/api/2fa/enabled', {
                body: { publicKey }
            });
        };
        this.createGoogTwoFA = (accountId, publicKey) => {
            return this.request('/api/2fa/goog/create', {
                body: { accountId, publicKey },
                responseType: 'blob',
            });
        };
        this.activateGoogTwoFA = (publicKey, token) => {
            return this.request('/api/2fa/goog/activate', {
                body: { publicKey, token },
            });
        };
        this.deactivateGoogTwoFA = (pkhash) => {
            return this.request('/api/2fa/goog/deactivate', {
                body: { pkhash },
            });
        };
        this.request = (0, request_1.createRequest)(address);
    }
}
exports.default = ConfidantService;
