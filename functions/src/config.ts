import * as admin from "firebase-admin";
import { CHAIN_NAMESPACES } from "@web3auth/base";

export const getConfig = () => {
    let chainID = process.env.CHAIN_ID;
    if (chainID == undefined || chainID == null) {
        chainID = "0x1"
    } else {
        chainID = (process.env.CHAIN_ID as unknown as number)?.toString(16)
    }
    return {
        databaseURL: `https://${process.env.RTDB_INSTANCE}.${process.env.LOCATION}.firebasedatabase.app`,
        chainConfig: {
            chainNamespace: CHAIN_NAMESPACES.EIP155,
            chainId: chainID,
            rpcTarget: process.env.RPC || "https://rpc-mumbai.maticvigil.com",
            displayName: "",
            blockExplorer: "",
            ticker: "",
            tickerName: "",
        },
    };
};

export const initializeFirebase = () => {
    admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        databaseURL: getConfig().databaseURL,
    });
};