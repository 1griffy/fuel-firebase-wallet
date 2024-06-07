// utils.js
import axios from "axios";
import * as functions from "firebase-functions";

/**
 * Makes an HTTP POST request to the specified URL with the given payload.
 * 
 * @param {string} url The URL to which the POST request is made.
 * @param {any} payload The data to be sent in the body of the POST request.
 * @return {Promise<any>} A promise that resolves with the response of the POST request.
 * @throws Will throw an error if the HTTP request fails.
 */
export async function postCall(url: string, payload: any): Promise<any> {
    try {
      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
    } catch (error) {
      logError("Error making post call",error)
      throw error;
    }
  };

export const logError = (message: string, error: any) => {
  functions.logger.error(message, error);
};

export const logInfo = (message: string) => {
    functions.logger.log(message);
  };