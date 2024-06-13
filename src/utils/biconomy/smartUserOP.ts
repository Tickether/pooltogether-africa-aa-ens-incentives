import { walletClient } from '../viem/client.js'
import { BiconomySmartAccountV2, createSmartAccountClient } from '@biconomy/account'
import dotenv from 'dotenv'


dotenv.config();

let smartAccount: BiconomySmartAccountV2 | undefined = undefined
let smartAccountAddress: `0x${string}` | undefined = undefined


export const createSmartAccount = async () => {
    try {
        if (!walletClient) return;

        const smartAccountFromCreate = await createSmartAccountClient({
            signer: walletClient,
            bundlerUrl: process.env.BICONOMY_BUNDLER_URL as string, // <-- Read about this at https://docs.biconomy.io/dashboard#bundler-url
            biconomyPaymasterApiKey: process.env.BICONOMY_PAYMASTER_API_KEY as string, // <-- Read about at https://docs.biconomy.io/dashboard/paymaster
        });
    
        const address = await smartAccountFromCreate.getAccountAddress();
        smartAccountAddress = (address);
        console.log('smart account wallet:', smartAccountAddress)
        smartAccount = (smartAccountFromCreate);
    } catch (error) {
        console.log(error)
    }
};

