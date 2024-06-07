import { getPublicCompressed } from "@toruslabs/eccrypto";
import Web3Auth from "@web3auth/single-factor-auth";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import * as admin from "firebase-admin";
import { logInfo, postCall } from "./utils";
import { getConfig } from "./config";
import * as functions from "firebase-functions";
import { initializeFirebase } from "./config";
import { WalletUnlocked, Wallet } from "fuels";


initializeFirebase();

// Generate a wallet address for a new Firebase user
export const generateWalletAddress = async (
  user: functions.auth.UserRecord,
  context: functions.EventContext
) => {
  const config = getConfig();

  try {
    const verifierId = user.uid;
    const verifier = process.env.WEB3AUTH_VERIFIER_NAME || "";
    let idToken = "";

    if (context.auth) {
      // If user is authenticated
      idToken = context.auth.token as unknown as string;
    } else {
      // If user is not authenticated
      const customToken = await admin.auth().createCustomToken(verifierId);
      const verifyURL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.API_KEY}`;
      const requestBody = JSON.stringify({ token: customToken, returnSecureToken: true });
      idToken = await postCall(verifyURL, requestBody);
    }

    // Web3Auth SFA initialization
    const web3authSfa = new Web3Auth({
      clientId: process.env.WEB3AUTH_CLIENT_ID || "",
      web3AuthNetwork: process.env.WEB3AUTH_NETWORK as any,
      usePnPKey: false,
    });

    const privateKeyProvider = new EthereumPrivateKeyProvider({ config: { chainConfig: config.chainConfig } });
    web3authSfa.init(privateKeyProvider);

    const web3authSfaprovider = await web3authSfa.connect({ verifier, verifierId, idToken }) as any;
    const privateKey = await web3authSfaprovider.request({ method: "eth_private_key" });
    const publicAddress = getPublicCompressed(Buffer.from(privateKey.padStart(64, "0"), "hex")).toString("hex");

    logInfo(`ETH Wallet Address: ${publicAddress} for user with userId: ${user.uid} is created successfully.`);

    const fuelWallet: WalletUnlocked = Wallet.fromPrivateKey(privateKey);
     
    const database = admin.database();
    database.ref(`${process.env.RTDB_PATH || "web3auth"}/${user.uid}`).set({
      name: user.displayName,
      email: user.email,
      eth_address: publicAddress,
      fuel_address: fuelWallet.address,
      private_key: privateKey,
    });
  } catch (error) {
    functions.logger.error("Error creating Web3Auth user", error);
    throw new Error(`Error creating Web3Auth user: ${error}`);
  }
};

export const generateWalletAddressCloudFunction = functions.auth
  .user()
  .onCreate(generateWalletAddress);