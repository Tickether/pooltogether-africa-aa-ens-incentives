import { vaultABI } from '@generationsoftware/hyperstructure-client-js'
import { publicClient } from '../viem/client.js'
import { przUSDC } from '../constants/addresses.js'

export const yieldFeeBalance = async () => {

    const yieldFeeBalanceData = await publicClient.readContract({
        address: przUSDC,
        abi: vaultABI,
        functionName: 'yieldFeeBalance',
        //args: [(owner)]
    })

    return yieldFeeBalanceData
    
}