import React from 'react'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'

function Login() {
    const { setOpenConnectModal } = useOpenConnectModal()

    const { isConnected } = useAccount()
    const {disconnect} = useDisconnect()

    const onClick = () => {
        setOpenConnectModal(true)
    }

    return (
        <>
        <div style={{textAlign:'center'}}>
            <br/>
            {isConnected && <div onClick={() => disconnect()} style={{cursor: 'pointer', position: 'fixed', top: '30px', right: '30px'}}>
                sign out
            </div> }
            {!isConnected &&<button className='button' style={{cursor: 'pointer'}} onClick={onClick}>
                connect
            </button> }
            <br/>
            <br/>
        </div>
        </>
    )
}

export default Login