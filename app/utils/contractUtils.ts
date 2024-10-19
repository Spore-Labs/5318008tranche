import { contractAddresses } from '../../config'

export const getContractAddress = (chainId: number): `0x${string}` | null => {
  if (chainId === 1) return contractAddresses.mainnet as `0x${string}`
  if (chainId === 11155111) return contractAddresses.sepolia as `0x${string}`
  return null
}