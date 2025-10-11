import { createConfig, http } from "wagmi";
import { sepolia } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export const config = createConfig({
	chains: [sepolia],
	connectors: [metaMask()],
	transports: {
		[sepolia.id]: http(),
	},
});

export const JPYC_ADDRESS =
	"0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB" as const;

export const JPYC_ABI = [
	{
		inputs: [
			{ internalType: "address", name: "from", type: "address" },
			{ internalType: "address", name: "to", type: "address" },
			{ internalType: "uint256", name: "value", type: "uint256" },
			{ internalType: "uint256", name: "validAfter", type: "uint256" },
			{ internalType: "uint256", name: "validBefore", type: "uint256" },
			{ internalType: "bytes32", name: "nonce", type: "bytes32" },
		],
		name: "ReceiveWithAuthorization",
		type: "struct",
	},
	{
		inputs: [
			{ internalType: "address", name: "from", type: "address" },
			{ internalType: "address", name: "to", type: "address" },
			{ internalType: "uint256", name: "value", type: "uint256" },
			{ internalType: "uint256", name: "validAfter", type: "uint256" },
			{ internalType: "uint256", name: "validBefore", type: "uint256" },
			{ internalType: "bytes32", name: "nonce", type: "bytes32" },
			{ internalType: "uint8", name: "v", type: "uint8" },
			{ internalType: "bytes32", name: "r", type: "bytes32" },
			{ internalType: "bytes32", name: "s", type: "bytes32" },
		],
		name: "receiveWithAuthorization",
		outputs: [],
		stateMutability: "nonpayable",
		type: "function",
	},
	{
		inputs: [{ internalType: "address", name: "account", type: "address" }],
		name: "balanceOf",
		outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
		stateMutability: "view",
		type: "function",
	},
] as const;
