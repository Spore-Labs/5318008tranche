/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              connect-src 'self' blob: data: 
              https://*.walletconnect.com https://*.walletconnect.org https://pulse.walletconnect.org
              https://*.uniswap.org https://docs.5318008.io https://api.web3modal.org
              https://*.alchemy.com https://*.arbitrum.io https://*.base.org/
              https://*.coinbase.com https://*.coingecko.com/ https://*.coinmarketcap.com/
              https://*.drpc.org/ https://*.gemini.com https://*.googleapis.com
              https://*.infura.io https://*.nodereal.io https://*.optimism.io
              https://*.quiknode.pro https://*.twnodes.com https://*.zerion.io
              https://alfajores-forno.celo-testnet.org https://api.avax.network/ext/bc/C/rpc
              https://api.moonpay.com/ https://api.opensea.io https://bsc-dataseed1.binance.org/
              https://bsc-dataseed1.bnbchain.org https://buy.moonpay.com/ https://cdn.center.app/
              https://celo-org.github.io https://cloudflare-eth.com https://ethereum-optimism.github.io/
              https://forno.celo.org/ https://gateway.ipfs.io/ https://hardbin.com/ https://i.seadn.io/
              https://images-country.meld.io https://invalid.rpki.cloudflare.com/ https://ipfs.io/
              https://ipv4-check-perf.radar.cloudflare.com https://ipv6-check-perf.radar.cloudflare.com/
              https://lh3.googleusercontent.com/ https://mainnet.base.org/ https://o1037921.ingest.sentry.io
              https://browser-intake-datadoghq.com https://openseauserdata.com/
              https://performance.radar.cloudflare.com/ https://polygon-rpc.com/
              https://raw.githubusercontent.com https://raw.seadn.io/ https://rpc-mainnet.maticvigil.com
              https://rpc-mumbai.maticvigil.com https://rpc.ankr.com https://rpc.blast.io/
              https://rpc.degen.tips https://rpc.goerli.mudit.blog/ https://rpc.mevblocker.io/
              https://rpc.scroll.io/ https://rpc.sepolia.org/ https://rpc.zora.energy/
              https://sockjs-us3.pusher.com/ https://sparrow.cloudflare.com/ https://statsigapi.net
              https://trustwallet.com https://uniswap.org https://us-central1-uniswap-mobile.cloudfunctions.net/
              https://valid.rpki.cloudflare.com https://vercel.com https://vercel.live/
              https://wallet.crypto.com https://web3.1inch.io https://mainnet.era.zksync.io/
              wss://*.uniswap.org wss://relay.walletconnect.com wss://relay.walletconnect.org
              wss://ws-us3.pusher.com/ wss://www.walletlink.org;
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://app.uniswap.org https://vercel.live;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
              font-src 'self' data: https://fonts.gstatic.com;
              img-src 'self' data: blob: https:;
              frame-src 'self' https://*.walletconnect.com https://*.walletconnect.org https://app.uniswap.org https://secure.walletconnect.org;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'self' http://localhost:* https://*.pages.dev https://*.ngrok-free.app https://secure-mobile.walletconnect.com https://secure-mobile.walletconnect.org;
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim()
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
