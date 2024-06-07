"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWalletAddressCloudFunction = exports.generateWalletAddress = void 0;
const eccrypto_1 = require("@toruslabs/eccrypto");
const single_factor_auth_1 = require("@web3auth/single-factor-auth");
const ethereum_provider_1 = require("@web3auth/ethereum-provider");
const admin = require("firebase-admin");
const utils_1 = require("./utils");
const config_1 = require("./config");
const functions = require("firebase-functions");
const config_2 = require("./config");
const fuels_1 = require("fuels");
(0, config_2.initializeFirebase)();
// Generate a wallet address for a new Firebase user
const generateWalletAddress = async (user, context) => {
    const config = (0, config_1.getConfig)();
    try {
        const verifierId = user.uid;
        const verifier = process.env.WEB3AUTH_VERIFIER_NAME || "";
        let idToken = "";
        if (context.auth) {
            // If user is authenticated
            idToken = context.auth.token;
        }
        else {
            // If user is not authenticated
            const customToken = await admin.auth().createCustomToken(verifierId);
            const verifyURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.API_KEY}`;
            const requestBody = JSON.stringify({ token: customToken, returnSecureToken: true });
            idToken = await (0, utils_1.postCall)(verifyURL, requestBody);
        }
        // Web3Auth SFA initialization
        const web3authSfa = new single_factor_auth_1.default({
            clientId: process.env.WEB3AUTH_CLIENT_ID || "",
            web3AuthNetwork: process.env.WEB3AUTH_NETWORK,
            usePnPKey: false,
        });
        const privateKeyProvider = new ethereum_provider_1.EthereumPrivateKeyProvider({ config: { chainConfig: config.chainConfig } });
        web3authSfa.init(privateKeyProvider);
        const web3authSfaprovider = await web3authSfa.connect({ verifier, verifierId, idToken });
        const privateKey = await web3authSfaprovider.request({ method: "eth_private_key" });
        const publicAddress = (0, eccrypto_1.getPublicCompressed)(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");
        (0, utils_1.logInfo)(`ETH Wallet Address: ${publicAddress} for user with userId: ${user.uid} is created successfully.`);
        const fuelWallet = fuels_1.Wallet.fromPrivateKey(privateKey);
        const database = admin.database();
        database.ref(`${process.env.RTDB_PATH || "web3auth"}/${user.uid}`).set({
            name: user.displayName,
            email: user.email,
            eth_address: publicAddress,
            fuel_address: fuelWallet.address,
            private_key: privateKey,
        });
    }
    catch (error) {
        functions.logger.error("Error creating Web3Auth user", error);
        throw new Error(`Error creating Web3Auth user: ${error}`);
    }
};
exports.generateWalletAddress = generateWalletAddress;
exports.generateWalletAddressCloudFunction = functions.auth
    .user()
    .onCreate(exports.generateWalletAddress);
//# sourceMappingURL=index.js.map