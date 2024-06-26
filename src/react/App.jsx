import React from 'react'
import { useOpenConnectModal } from '@0xsequence/kit'
import { useDisconnect, useAccount } from 'wagmi'
import Login from './Login.jsx'

import { KitProvider } from '@0xsequence/kit'
import { getDefaultConnectors } from '@0xsequence/kit-connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createConfig, http, WagmiConfig } from 'wagmi'
import { arbitrumSepolia, Chain } from 'wagmi/chains'

const queryClient = new QueryClient() 

function App(props) {
  const chains = [arbitrumSepolia]
  const projectAccessKey = process.env.PROJECT_ACCESS_KEY

  const connectors = getDefaultConnectors({
    walletConnectProjectId: process.env.WALLET_CONNECT_ID,
    defaultChainId: 421614,
    appName: 'demo app',
    projectAccessKey
  })

  const transports = {}

  chains.forEach(chain => {
    transports[chain.id] = http()
  })
  
  const config = createConfig({
    transports,
    connectors,
    chains
  })

  return (
    <WagmiConfig config={config}>
        <QueryClientProvider client={queryClient}> 
          <KitProvider config={{defaultTheme: 'dark'}}>
            <Login scene={props.scene}/>
          </KitProvider>
        </QueryClientProvider>
    </WagmiConfig>
  );
}

export default App;