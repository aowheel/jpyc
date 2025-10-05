import { randomBytes } from "node:crypto";
import { type Hex, parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { JPYC_ADDRESS } from "./config/constants";
import { userClient, writeContractByRelayer } from "./utils/client";

/**
 * Execute a transfer with a signed authorization (EIP-3009)
 * This enables meta-transactions and atomic interactions with ERC-20 tokens
 */
async function transferWithAuthorization() {
	console.log("🚀 EIP-3009 Transfer With Authorization");

	// Construct transfer parameters
	console.log("📝 Constructing transfer parameters...");
	const transferData = {
		from: "0xE19cFDf534dCee27D998A465a170390a9A4a78A6", // Payer's address (Authorizer)
		to: "0x84C4eD0EF46a25496DFFaf147261f732bA3736C3", // Payee's address
		value: parseUnits("100", 18), // Amount to be transferred
		validAfter: 0n, // The time after which this is valid (unix time)
		validBefore: BigInt(Math.floor(Date.now() / 1000) + 3600), // The time before which this is valid (unix time)
		nonce: `0x${randomBytes(32).toString("hex")}`, // Unique nonce (randomly generated 32-byte data)
	} as const;
	console.log("✅ Transfer parameters:", transferData);

	// Generate signature using EIP-712 typed data signing
	console.log("✍️ Generating signature...");
	const signature = await userClient.signTypedData({
		domain: {
			name: "JPY Coin", // Token name
			version: "1", // Version
			chainId: sepolia.id, // Sepolia testnet
			verifyingContract: JPYC_ADDRESS, // JPYC contract address
		},
		types: {
			TransferWithAuthorization: [
				{ name: "from", type: "address" },
				{ name: "to", type: "address" },
				{ name: "value", type: "uint256" },
				{ name: "validAfter", type: "uint256" },
				{ name: "validBefore", type: "uint256" },
				{ name: "nonce", type: "bytes32" },
			],
		},
		primaryType: "TransferWithAuthorization",
		message: {
			from: transferData.from,
			to: transferData.to,
			value: transferData.value,
			validAfter: transferData.validAfter,
			validBefore: transferData.validBefore,
			nonce: transferData.nonce,
		},
	});
	const r = `0x${signature.slice(2, 66)}` as Hex;
	const s = `0x${signature.slice(66, 130)}` as Hex;
	const v = Number(`0x${signature.slice(130, 132)}`);
	console.log("✅ Signature components:", { v, r, s });

	// Execute transfer with authorization via relayer
	console.log("📡 Executing transfer with authorization...");
	const txHash = await writeContractByRelayer.transferWithAuthorization([
		transferData.from,
		transferData.to,
		transferData.value,
		transferData.validAfter,
		transferData.validBefore,
		transferData.nonce,
		v,
		r,
		s,
	]);
	console.log("🎉 Transfer completed! Transaction hash:", txHash);
}

transferWithAuthorization();
