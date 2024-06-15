import { Pooler } from "./getPooler.js"

export const getPoolers = async ()=>{
    try {
        const res = await fetch('https://susu.club/api/getPoolers', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
        })
        const poolers: `0x${string}`[] = await res.json()
        //console.log(poolers)
        return poolers!
    } catch(err){
        console.log(err)
    }
}