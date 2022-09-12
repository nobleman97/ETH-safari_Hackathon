import { createRequire } from "module";
const require = createRequire(import.meta.url);

import ethers from 'ethers';
import * as thefile from './secrets.js';
const ABI = require("./testToken.json");

const connector = {
    getWalletBalance : async (walletAddress, tokenAddress) =>{

        const alchemyProjectID = thefile.secret.infuraProjectId;
        const contractabi = ABI.abi;    

        const provider = new ethers.getDefaultProvider(
            'ropsten',
            alchemyProjectID
        )
    
     
    
        const contract = new ethers.Contract(
            tokenAddress,
            contractabi,
            provider
        )
    
        const walletBalance = await contract.balanceOf(walletAddress);
        const weiValue = walletBalance.toString()
        const ethValue = ethers.utils.formatEther(weiValue);


        return ethValue.toString();
    }
}

export { connector }