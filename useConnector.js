import { connector } from "./connector.js";

const fireCrackers = async (walletAddress, tokenAddress) => {
   const result = await connector.getWalletBalance(walletAddress, tokenAddress);

    console.log(result);
}

fireCrackers(walletAddress, tokenAddress)

// walletAddress: "0xDBD06E7690F2c575129abD5552DaEB0055367305", 
// tokenAddress: "0x118A4b1541836393662b8F87dB23C0F8B0291a70"