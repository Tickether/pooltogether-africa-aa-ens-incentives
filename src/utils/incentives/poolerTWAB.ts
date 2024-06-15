import { twabControllerABI } from '@generationsoftware/hyperstructure-client-js'
import { publicClient } from '../viem/client.js'
import { TWAB } from '../constants/addresses.js'

export const poolerTWAB = async (vault: `0x${string}`, owner: `0x${string}`, startTime: bigint, endTime: bigint) => {

    const twabData = await publicClient.readContract({
        address: TWAB,
        abi: twabControllerABI,
        functionName: 'getTwabBetween',
        args: [(vault), (owner), (startTime), (endTime)]
    })

    return twabData
    
}