import { twabControllerABI } from '@generationsoftware/hyperstructure-client-js'
import { publicClient } from '../viem/client.js'
import { TWAB } from '../constants/addresses.js'

export const vaultTWAB = async (vault: `0x${string}`, startTime: bigint, endTime: bigint) => {

    const twabData = await publicClient.readContract({
        address: TWAB,
        abi: twabControllerABI,
        functionName: 'getTotalSupplyTwabBetween',
        args: [(vault), (startTime), (endTime)]
    })

    return twabData
    
}