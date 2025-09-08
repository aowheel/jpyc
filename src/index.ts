import { jpyc } from "./utils/client";

jpyc.totalSupply().then((totalSupply) => {
	console.log(`Total Supply: ${totalSupply.toString()}`);
});
