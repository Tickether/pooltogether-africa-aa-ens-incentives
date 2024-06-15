import { walletClient } from '../viem/client.js'
import { BiconomySmartAccountV2, PaymasterMode, Transaction, UserOpResponse, createSmartAccountClient } from '@biconomy/account'
import dotenv from 'dotenv'
import { QUOTER, Recipient, SWAP_ROUTER, USDC, WETH, przUSDC } from '../constants/addresses.js';
import { claimYieldFeeShares } from '../incentives/claimYieldFeeShares.js';
import { transfer } from '../incentives/transfer.js';
import { yieldFeeBalance } from '../incentives/yieldFeeBalance.js';
import { getPoolers } from '../pooler/getPoolers.js';
import { getPooler } from '../pooler/getPooler.js';
import { vaultTWAB } from '../incentives/vaultTWAB.js';
import { poolerTWAB } from '../incentives/poolerTWAB.js';

dotenv.config();

let smartAccount: BiconomySmartAccountV2 | undefined = undefined
let smartAccountAddress: `0x${string}` | undefined = undefined
let amount: bigint 

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

// interface twab {address, twab, shares }
export interface TWAB {
    address: `0x${string}`
    email: string
    shares: bigint
    transferTx: Transaction
}
function chunkUserOpsArray(arr: Transaction[], maxTxData: number) {
    const chunkUserOps = [];
    for (let i = 0; i < arr.length; i += maxTxData) {
        chunkUserOps.push(arr.slice(i, i + maxTxData));
    }
    return chunkUserOps;
}

const withdrawIncentives = async() => {
    try {    
        // check balance of weth (take fee)
        amount = await yieldFeeBalance()
    
        
        //withdraw yield fee in przUDC
        const claimYieldFeeSharesTx = claimYieldFeeShares(amount)
    
        // Send the transaction and get the transaction hash
        const userOpResponse = await smartAccount!.sendTransaction(claimYieldFeeSharesTx, {
            paymasterServiceData: {mode: PaymasterMode.SPONSORED},
        });
        const { transactionHash } = await userOpResponse.waitForTxHash();
        console.log("Transaction Hash", transactionHash);
        
        const userOpReceipt  = await userOpResponse?.wait();
        if(userOpReceipt?.success == 'true') { 
            console.log("UserOp receipt", userOpReceipt)
            console.log("Transaction receipt", userOpReceipt?.receipt)
        }
        return transactionHash
    } catch (error) {
        console.log(error)
    }
}

const poolIncentivesDistro = async() => {
    let poolersTWAB: TWAB[]
    // get all users (get twab and filter)
    const poolers = await getPoolers()
    let vaultTWAB_ //= await vaultTWAB(przUSDC, BigInt('1000000'), BigInt('1000000'))

    for (let i = 0; i < poolers!.length; i++) {
        //calc amount to send and push
        const poolerAddress = poolers![i];
        //get pooler twab
        const poolerTWAB_ = await poolerTWAB(przUSDC, poolerAddress, BigInt('1000000'), BigInt('1000000'))
        if (poolerTWAB_ > BigInt(0)) {
            //get pooler email
            const pooler = await getPooler(poolerAddress)
            const TWAB = {
                address: poolerAddress,
                email: pooler?.email!,
                shares: poolerTWAB_,
                transferTx: {to: '', data: ''}
            }
            //push no zero tabs and shares into anew array
            poolersTWAB!.push(TWAB)
        }
    }

    vaultTWAB_ = poolersTWAB!.reduce((totalTWAB: bigint, twab: TWAB ) => {
        return totalTWAB + twab.shares;
    }, BigInt(0))

    for (let i = 0; i < poolersTWAB!.length; i++) {
        const poolerTWAB_ = poolersTWAB![i];
        //calculate amonunt amount to send into interface
        const userAmount = (poolerTWAB_.shares * amount) / vaultTWAB_
        const transferTx = transfer(poolerTWAB_.address, userAmount)
        poolerTWAB_.transferTx = transferTx
        //post db
        //send emails
        
    }
    // generate arrays of transfer tx calldata to send shares out max 450
    
    const tranferTxArray = poolersTWAB!.map( twab => twab.transferTx )
    const chunkUsersTranferTx = chunkUserOpsArray(tranferTxArray!, 400)

    // Send the transaction and get the transaction hash
    let txPromises: Promise<UserOpResponse>[] = [];
    for (let i = 1; i <= chunkUsersTranferTx.length; i++) {
        // wrap the tx in a user op and send it
        // we don't want to await for the user op to be executed because we want to send all users ops at the same time
        const txPromise = smartAccount!.sendTransaction(chunkUsersTranferTx[i], {
            nonceOptions: {nonceKey: i},
            paymasterServiceData: {mode: PaymasterMode.SPONSORED},
        });

        // save the promise response for later
        txPromises.push(txPromise);
    }
    // later we can resolve the promises to get user operation receipts
    const userOpResponses: UserOpResponse[] = await Promise.all(txPromises);
    userOpResponses.forEach(async (userOpResponse) => {
        const { wait } = userOpResponse;
        const receipt = await wait();
        console.log("Receipt: ", receipt);
    })
}


export const smartUserOP = async() => {

    try {
            
        await createSmartAccount()

        await withdrawIncentives()
        
        await poolIncentivesDistro()
            
    } catch (error) {
        console.log(error)
    }
}
