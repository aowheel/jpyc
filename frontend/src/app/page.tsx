"use client";

import { useState } from "react";
import { type Address, formatUnits, parseUnits } from "viem";
import {
	useAccount,
	useConnect,
	useDisconnect,
	useReadContract,
	useSignTypedData,
} from "wagmi";
import { JPYC_ABI, JPYC_ADDRESS } from "@/lib/wagmi";

// Sample products
const PRODUCTS = [
	{ id: 1, name: "Premium T-Shirt", price: 500, image: "👕" },
	{ id: 2, name: "Coffee Mug", price: 300, image: "☕" },
	{ id: 3, name: "Notebook", price: 200, image: "📓" },
	{ id: 4, name: "Wireless Headphones", price: 1500, image: "🎧" },
	{ id: 5, name: "Phone Case", price: 400, image: "📱" },
	{ id: 6, name: "Water Bottle", price: 350, image: "💧" },
];

interface CartItem {
	id: number;
	name: string;
	price: number;
	quantity: number;
	image: string;
}

export default function Home() {
	const { address, isConnected } = useAccount();
	const { connect, connectors } = useConnect();
	const { disconnect } = useDisconnect();
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isProcessing, setProcesing] = useState(false);

	// Get JPYC balance
	const { data: balance } = useReadContract({
		address: JPYC_ADDRESS,
		abi: JPYC_ABI,
		functionName: "balanceOf",
		args: address ? [address] : undefined,
		query: {
			enabled: Boolean(address),
		},
	});

	const { signTypedDataAsync } = useSignTypedData();

	const addToCart = (product: (typeof PRODUCTS)[0]) => {
		setCart((prev) => {
			const existing = prev.find((item) => item.id === product.id);
			if (existing) {
				return prev.map((item) =>
					item.id === product.id
						? { ...item, quantity: item.quantity + 1 }
						: item,
				);
			}
			return [...prev, { ...product, quantity: 1 }];
		});
	};

	const removeFromCart = (productId: number) => {
		setCart((prev) => prev.filter((item) => item.id !== productId));
	};

	const updateQuantity = (productId: number, quantity: number) => {
		if (quantity <= 0) {
			removeFromCart(productId);
			return;
		}
		setCart((prev) =>
			prev.map((item) =>
				item.id === productId ? { ...item, quantity } : item,
			),
		);
	};

	const getTotalPrice = () => {
		return cart.reduce((total, item) => total + item.price * item.quantity, 0);
	};

	const handlePurchase = async () => {
		if (!address || cart.length === 0) return;

		setProcesing(true);
		try {
			const totalAmount = getTotalPrice();
			const nonce = `0x${crypto.getRandomValues(new Uint8Array(32)).reduce((str, byte) => str + byte.toString(16).padStart(2, "0"), "")}`;

			// Create signature for receiveWithAuthorization
			const transferData = {
				from: address,
				to: "0x8C713BB047edcc200427f7605E66E0329258dAC9" as Address, // Will be set by backend
				value: parseUnits(totalAmount.toString(), 18),
				validAfter: BigInt(0),
				validBefore: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour from now
				nonce: nonce as `0x${string}`,
			};

			const signature = await signTypedDataAsync({
				domain: {
					name: "JPY Coin",
					version: "1",
					chainId: 11155111, // Sepolia
					verifyingContract: JPYC_ADDRESS,
				},
				types: {
					ReceiveWithAuthorization: [
						{ name: "from", type: "address" },
						{ name: "to", type: "address" },
						{ name: "value", type: "uint256" },
						{ name: "validAfter", type: "uint256" },
						{ name: "validBefore", type: "uint256" },
						{ name: "nonce", type: "bytes32" },
					],
				},
				primaryType: "ReceiveWithAuthorization",
				message: transferData,
			});

			// Send to backend (convert BigInt values to strings for JSON serialization)
			const response = await fetch("/api/purchase", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					cart,
					transferData: {
						...transferData,
						value: transferData.value.toString(),
						validAfter: transferData.validAfter.toString(),
						validBefore: transferData.validBefore.toString(),
					},
					signature,
				}),
			});

			if (response.ok) {
				const result = await response.json();
				alert(`Purchase successful! Transaction: ${result.txHash}`);
				setCart([]);
			} else {
				const error = await response.json();
				alert(`Purchase failed: ${error.message}`);
			}
		} catch (error) {
			console.error("Purchase error:", error);
			alert("Purchase failed. Please try again.");
		} finally {
			setProcesing(false);
		}
	};

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<h1 className="text-2xl font-bold text-gray-900">JPYC EC Demo</h1>

						<div className="flex items-center gap-4">
							{isConnected ? (
								<div className="flex items-center gap-4">
									<div className="text-sm">
										<div className="font-medium">
											{address?.slice(0, 6)}...{address?.slice(-4)}
										</div>
										<div className="text-gray-500">
											Balance:{" "}
											{balance ? formatUnits(balance as bigint, 18) : "0"} JPYC
										</div>
									</div>
									<button
										type="button"
										onClick={() => disconnect()}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
									>
										Disconnect
									</button>
								</div>
							) : (
								<button
									type="button"
									onClick={() => connect({ connector: connectors[0] })}
									className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
								>
									Connect Wallet
								</button>
							)}
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Product Catalog */}
					<div className="lg:col-span-2">
						<h2 className="text-xl font-bold text-gray-900 mb-6">Products</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{PRODUCTS.map((product) => (
								<div
									key={product.id}
									className="bg-white rounded-lg shadow-sm border p-6"
								>
									<div className="text-6xl mb-4 text-center">
										{product.image}
									</div>
									<h3 className="text-lg font-medium text-gray-900 mb-2">
										{product.name}
									</h3>
									<p className="text-2xl font-bold text-blue-600 mb-4">
										{product.price} JPYC
									</p>
									<button
										type="button"
										onClick={() => addToCart(product)}
										disabled={!isConnected}
										className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md"
									>
										Add to Cart
									</button>
								</div>
							))}
						</div>
					</div>

					{/* Shopping Cart */}
					<div className="bg-white rounded-lg shadow-sm border p-6 h-fit">
						<h2 className="text-xl font-bold text-gray-900 mb-6">
							Shopping Cart ({cart.length})
						</h2>

						{cart.length === 0 ? (
							<p className="text-gray-500 text-center py-8">
								Your cart is empty
							</p>
						) : (
							<>
								<div className="space-y-4 mb-6">
									{cart.map((item) => (
										<div
											key={item.id}
											className="flex items-center justify-between"
										>
											<div className="flex items-center gap-3">
												<span className="text-2xl">{item.image}</span>
												<div>
													<h4 className="text-sm font-medium text-gray-900">
														{item.name}
													</h4>
													<p className="text-sm text-gray-500">
														{item.price} JPYC each
													</p>
												</div>
											</div>
											<div className="flex items-center gap-2">
												<button
													type="button"
													onClick={() =>
														updateQuantity(item.id, item.quantity - 1)
													}
													className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
												>
													-
												</button>
												<span className="text-sm font-medium w-8 text-center">
													{item.quantity}
												</span>
												<button
													type="button"
													onClick={() =>
														updateQuantity(item.id, item.quantity + 1)
													}
													className="px-2 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
												>
													+
												</button>
												<button
													type="button"
													onClick={() => removeFromCart(item.id)}
													className="px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
												>
													×
												</button>
											</div>
										</div>
									))}
								</div>

								<div className="border-t pt-4">
									<div className="flex justify-between items-center mb-4">
										<span className="text-lg font-bold">Total:</span>
										<span className="text-2xl font-bold text-blue-600">
											{getTotalPrice()} JPYC
										</span>
									</div>

									<button
										type="button"
										onClick={handlePurchase}
										disabled={!isConnected || isProcessing || cart.length === 0}
										className="w-full px-4 py-3 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md"
									>
										{isProcessing ? "Processing..." : "Purchase with JPYC"}
									</button>

									{!isConnected && (
										<p className="text-sm text-gray-500 text-center mt-2">
											Connect your wallet to make a purchase
										</p>
									)}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
