import { randomBytes } from "node:crypto";
import {
	encodeAbiParameters,
	encodePacked,
	type Hex,
	keccak256,
	parseEther,
} from "viem";
import {
	readContract,
	relayerClient,
	userClient,
	writeContractByRelayer,
} from "./utils/client";

async function transferWithAuthorization() {
	const domainSeparator = await readContract._domainSeparatorV4();
	const typeHash = await readContract.TRANSFER_WITH_AUTHORIZATION_TYPEHASH();

	const transferData = {
		from: "0xE19cFDf534dCee27D998A465a170390a9A4a78A6",
		to: "0x84C4eD0EF46a25496DFFaf147261f732bA3736C3",
		value: parseEther("1"), // 1 JPYC in wei
		validAfter: 0n,
		validBefore: BigInt(Math.floor(Date.now() / 1000) + 3600), // valid for 1 hour
		nonce: randomBytes(32).toString("hex"),
	} as const;

	const structHash = keccak256(
		encodeAbiParameters(
			[
				{ type: "bytes32" },
				{ type: "address" },
				{ type: "address" },
				{ type: "uint256" },
				{ type: "uint256" },
				{ type: "uint256" },
				{ type: "bytes32" },
			],
			[
				typeHash,
				transferData.from,
				transferData.to,
				transferData.value,
				transferData.validAfter,
				transferData.validBefore,
				`0x${transferData.nonce}`,
			],
		),
	);

	const digest = keccak256(
		encodePacked(
			["string", "bytes32", "bytes32"],
			["\x19\x01", domainSeparator, structHash],
		),
	);

	const signature = await userClient.signMessage({ message: digest });
	const r = `0x${signature.slice(2, 66)}` as Hex;
	const s = `0x${signature.slice(66, 130)}` as Hex;
	const v = Number(`0x${signature.slice(130, 132)}`);

	await writeContractByRelayer.transferWithAuthorization([
		transferData.from,
		transferData.to,
		transferData.value,
		transferData.validAfter,
		transferData.validBefore,
		`0x${transferData.nonce}`,
		v,
		r,
		s,
	]);
}

transferWithAuthorization();
