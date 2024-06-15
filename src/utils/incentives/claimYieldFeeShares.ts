import { encodeFunctionData } from 'viem';
import { przUSDC } from '../constants/addresses.js';
import { vaultABI } from '@generationsoftware/hyperstructure-client-js';

export const claimYieldFeeShares = (amount: bigint) => {
    const claimYieldFeeSharesData = encodeFunctionData({
        abi: vaultABI,
        functionName: 'claimYieldFeeShares',
        args: [(amount)]
    })

    // Build the transactions
    const claimYieldFeeSharesTx = {
        to: przUSDC,
        data: claimYieldFeeSharesData,
    };
    return claimYieldFeeSharesTx
}