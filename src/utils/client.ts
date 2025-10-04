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

export const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(),
});

export const readContract = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: publicClient,
}).read;

export const userClient = createWalletClient({
	account: privateKeyToAccount(process.env.USER_PRIVATE_KEY as Address),
	chain: sepolia,
	transport: http(),
});

export const writeContractByUser = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: userClient,
}).write;

export const relayerClient = createWalletClient({
	account: privateKeyToAccount(process.env.RELAYER_PRIVATE_KEY as Address),
	chain: sepolia,
	transport: http(),
});

export const writeContractByRelayer = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: relayerClient,
}).write;
