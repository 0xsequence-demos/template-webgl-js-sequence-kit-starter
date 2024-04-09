import React, { useEffect, useState } from 'react'
import { useOpenConnectModal } from '@0xsequence/kit'
import { ethers } from 'ethers'

import {
    useDisconnect,
    useAccount,
    useWalletClient,
    useSendTransaction,
} from 'wagmi';

import { SequenceIndexer } from '@0xsequence/indexer';
import { useMutex } from 'react-context-mutex';

const ContractAddress = '0x856de99d7647fb7f1d0f60a04c08340db3875340';

let burnCallback = null
function Login(props) {
    const MutexRunner = useMutex();
    const mutexBurn = new MutexRunner('sendMutexBurn');
    const { setOpenConnectModal } = useOpenConnectModal()
    const { data: walletClient } = useWalletClient();

    const { isConnected } = useAccount()
    const {disconnect} = useDisconnect()

    const { data: txnData, sendTransaction, isLoading: isSendTxnLoading } = useSendTransaction();

    const onClick = () => {
        setOpenConnectModal(true)
    }

    window.setOpenConnectModal = () => {
        setOpenConnectModal(true);
    };

    const sendBurnToken = async (tokenID, callback) => {
        if(!mutexBurn.isLocked()){
            const contractABI = ['function burn(uint256 tokenId, uint256 amount)']; // Replace with your contract's ABI
            const contract = new ethers.Contract(ContractAddress, contractABI);

            // call indexer 
            // check for achievement balance
            const indexer = new SequenceIndexer(
                'https://arbitrum-sepolia-indexer.sequence.app',
                ENV.projectAccessKey
            );

            const response = await indexer.getTokenBalances({
                accountAddress: walletClient.account.address,
                contractAddress: '0x856de99d7647fb7f1d0f60a04c08340db3875340',
            })

            const data = contract.interface.encodeFunctionData('burn', [
                tokenID,
                response.balances[0].balance,
            ]);
    
            try {
                mutexBurn.lock()
                burnCallback = callback
                await sendTransaction({
                    to: ContractAddress,
                    data: data,
                    value: '0',
                    gas: null,
                })
            } catch (error) {
                console.log(error)
            callback(error);
            }
        } else {
            console.log('burn in progress')
        }
      };

    useEffect(() => {
        if(txnData && burnCallback && mutexBurn.isLocked()) {
            mutexBurn.unlock();
            burnCallback(txnData)
        }
    }, [burnCallback, txnData])

    useEffect(() => {
        if (isConnected && walletClient) {
            props.scene.sequenceController.init(
                walletClient,
                sendBurnToken
            );
        }
    }, [isConnected, walletClient]);

    useEffect(() => {
        if(isConnected){
            props.scene.login()
        } else {
            props.scene.logout()
        }
    }, [isConnected])

    return (
        <>
            <div style={{textAlign:'center'}}>
                {isConnected && <div onClick={() => disconnect()} style={{cursor: 'pointer', zIndex: 100, position: 'fixed', top: '30px', right: '30px'}}>
                    sign out
                </div> }
            </div>
        </>
    )
}

export default Login