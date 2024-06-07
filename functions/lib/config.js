"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeFirebase = exports.getConfig = void 0;
const admin = require("firebase-admin");
const base_1 = require("@web3auth/base");
const getConfig = () => {
    var _a;
    let chainID = process.env.CHAIN_ID;
    if (chainID == undefined || chainID == null) {
        chainID = "0x1";
    }
    else {
        chainID = (_a = process.env.CHAIN_ID) === null || _a === void 0 ? void 0 : _a.toString(16);
    }
    return {
        databaseURL: `https://${process.env.RTDB_INSTANCE}.${process.env.LOCATION}.firebasedatabase.app`,
        chainConfig: {
            chainNamespace: base_1.CHAIN_NAMESPACES.EIP155,
            chainId: chainID,
            rpcTarget: process.env.RPC || "https://rpc-mumbai.maticvigil.com",
            displayName: "",
            blockExplorer: "",
            ticker: "",
            tickerName: "",
        },
    };
};
exports.getConfig = getConfig;
const initializeFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: (0, exports.getConfig)().databaseURL,
    });
};
exports.initializeFirebase = initializeFirebase;
//# sourceMappingURL=config.js.map