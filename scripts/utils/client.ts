import "dotenv/config";
import {
	type Address,
	createPublicClient,
	createWalletClient,
	getContract,
	http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import { JPYC_ABI } from "../config/abi";
import { JPYC_ADDRESS } from "../config/constants";

const rpcEndpoint = process.env.RPC_ENDPOINT;

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(rpcEndpoint),
});

export const readContract = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: publicClient,
}).read;

export const userAccount = privateKeyToAccount(
	process.env.USER_PRIVATE_KEY as Address,
);

export const userClient = createWalletClient({
	account: userAccount,
	chain: sepolia,
	transport: http(rpcEndpoint),
});

export const writeContractByUser = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: userClient,
}).write;

export const relayerAccount = privateKeyToAccount(
	process.env.RELAYER_PRIVATE_KEY as Address,
);

export const relayerClient = createWalletClient({
	account: relayerAccount,
	chain: sepolia,
	transport: http(rpcEndpoint),
});

export const writeContractByRelayer = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: relayerClient,
}).write;
