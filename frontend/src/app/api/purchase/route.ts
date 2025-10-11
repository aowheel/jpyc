import { type NextRequest, NextResponse } from "next/server";
import {
	type Address,
	createPublicClient,
	createWalletClient,
	getContract,
	type Hex,
	http,
	parseUnits,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";

// JPYC contract configuration
const JPYC_ADDRESS = "0x431D5dfF03120AFA4bDf332c61A6e1766eF37BDB" as Address;

const JPYC_ABI = [
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
] as const;

// Environment variables for the relayer account
const RELAYER_PRIVATE_KEY = process.env.RELAYER_PRIVATE_KEY as Hex;
const RPC_ENDPOINT =
	process.env.RPC_ENDPOINT || "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";

if (!RELAYER_PRIVATE_KEY) {
	throw new Error("RELAYER_PRIVATE_KEY environment variable is required");
}

// Create clients
const publicClient = createPublicClient({
	chain: sepolia,
	transport: http(RPC_ENDPOINT),
});

const relayerAccount = privateKeyToAccount(RELAYER_PRIVATE_KEY);
const relayerClient = createWalletClient({
	account: relayerAccount,
	chain: sepolia,
	transport: http(RPC_ENDPOINT),
});

const contract = getContract({
	address: JPYC_ADDRESS,
	abi: JPYC_ABI,
	client: relayerClient,
});

interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
	image: string;
}

interface TransferData {
	from: Address;
	to: Address;
	value: string; // Received as string from frontend
	validAfter: string; // Received as string from frontend
	validBefore: string; // Received as string from frontend
	nonce: Hex;
}

interface PurchaseRequest {
	cart: CartItem[];
	transferData: TransferData;
	signature: Hex;
}

export async function POST(request: NextRequest) {
	try {
		const body: PurchaseRequest = await request.json();
		const { cart, transferData, signature } = body;

		// Validate request
		if (!cart || cart.length === 0) {
			return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
		}

		if (!transferData || !signature) {
			return NextResponse.json(
				{ message: "Missing transfer data or signature" },
				{ status: 400 },
			);
		}

		// Calculate total amount from cart
		const totalAmount = cart.reduce(
			(total, item) => total + item.price * item.quantity,
			0,
		);
		const expectedValue = parseUnits(totalAmount.toString(), 18);

		// Convert string values to BigInt for validation and contract call
		const value = BigInt(transferData.value);
		const validAfter = BigInt(transferData.validAfter);
		const validBefore = BigInt(transferData.validBefore);

		// Validate that the transfer amount matches the cart total
		if (value !== expectedValue) {
			return NextResponse.json(
				{ message: "Transfer amount does not match cart total" },
				{ status: 400 },
			);
		}

		// Validate that the transfer is to the relayer (shop owner)
		const updatedTransferData = {
			from: transferData.from,
			to: relayerAccount.address, // Set the recipient to be the relayer (shop owner)
			value,
			validAfter,
			validBefore,
			nonce: transferData.nonce,
		};

		// Extract signature components
		const r = `0x${signature.slice(2, 66)}` as Hex;
		const s = `0x${signature.slice(66, 130)}` as Hex;
		const v = Number(`0x${signature.slice(130, 132)}`);

		console.log("Processing purchase:", {
			from: updatedTransferData.from,
			to: updatedTransferData.to,
			value: value.toString(),
			cart: cart.map((item) => `${item.name} x${item.quantity}`),
		});

		// Execute receiveWithAuthorization
		const txHash = await contract.write.receiveWithAuthorization([
			updatedTransferData.from,
			updatedTransferData.to,
			updatedTransferData.value,
			updatedTransferData.validAfter,
			updatedTransferData.validBefore,
			updatedTransferData.nonce,
			v,
			r,
			s,
		]);

		console.log("Transaction submitted:", txHash);

		// Wait for transaction confirmation
		const receipt = await publicClient.waitForTransactionReceipt({
			hash: txHash,
		});

		console.log("Transaction confirmed:", {
			hash: txHash,
			status: receipt.status,
			gasUsed: receipt.gasUsed.toString(),
		});

		if (receipt.status === "reverted") {
			return NextResponse.json(
				{ message: "Transaction failed" },
				{ status: 500 },
			);
		}

		// Log the successful purchase
		const orderDetails = {
			txHash,
			customer: updatedTransferData.from,
			total: totalAmount,
			items: cart,
			timestamp: new Date().toISOString(),
		};

		console.log("Purchase completed:", orderDetails);

		return NextResponse.json({
			success: true,
			txHash,
			orderDetails,
			message: "Purchase completed successfully!",
		});
	} catch (error) {
		console.error("Purchase processing error:", error);

		// Handle specific error types
		if (error instanceof Error) {
			if (error.message.includes("insufficient funds")) {
				return NextResponse.json(
					{ message: "Insufficient JPYC balance" },
					{ status: 400 },
				);
			}
			if (error.message.includes("authorization")) {
				return NextResponse.json(
					{ message: "Invalid signature or authorization expired" },
					{ status: 400 },
				);
			}
		}

		return NextResponse.json(
			{ message: "Internal server error" },
			{ status: 500 },
		);
	}
}
