"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = exports.logError = exports.postCall = void 0;
// utils.js
const axios_1 = require("axios");
const functions = require("firebase-functions");
/**
 * Makes an HTTP POST request to the specified URL with the given payload.
 *
 * @param {string} url The URL to which the POST request is made.
 * @param {any} payload The data to be sent in the body of the POST request.
 * @return {Promise<any>} A promise that resolves with the response of the POST request.
 * @throws Will throw an error if the HTTP request fails.
 */
async function postCall(url, payload) {
    try {
        const response = await axios_1.default.post(url, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response;
    }
    catch (error) {
        (0, exports.logError)("Error making post call", error);
        throw error;
    }
}
exports.postCall = postCall;
;
const logError = (message, error) => {
    functions.logger.error(message, error);
};
exports.logError = logError;
const logInfo = (message) => {
    functions.logger.log(message);
};
exports.logInfo = logInfo;
//# sourceMappingURL=utils.js.map