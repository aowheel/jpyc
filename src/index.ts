import { JPYC_V2_ABI } from "@jpyc/sdk-v1";
import { JPYC_ADDRESS } from "./config/constants";
import { jpyc } from "./utils/jpyc-client";
import { publicClient } from "./utils/viem-client";

jpyc.totalSupply().then((totalSupply) => {
	console.log(`Total Supply: ${totalSupply.toString()}`);
});

publicClient
	.readContract({
		address: JPYC_ADDRESS,
		abi: JPYC_V2_ABI,
		functionName: "name",
	})
	.then((name) => {
		console.log(`Token Name: ${name}`);
	});
