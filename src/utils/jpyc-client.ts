import type { ChainName, Endpoint, NetworkName } from "@jpyc/sdk-core";
import { type IJPYC, type ISdkClient, JPYC, SdkClient } from "@jpyc/sdk-v1";

// 1. Initialize an SdkClient instance
const sdkClient: ISdkClient = new SdkClient({
	chainName: process.env.CHAIN_NAME as ChainName,
	networkName: process.env.NETWORK_NAME as NetworkName,
	rpcEndpoint: process.env.RPC_ENDPOINT as Endpoint,
});

// 2. Generate an account from a private key
export const account = sdkClient.createPrivateKeyAccount({});

// 3. Generate a client with the account
export const client = sdkClient.createLocalClient({ account });

// 4. Initialize an SDK instance
export const jpyc: IJPYC = new JPYC({ client });
