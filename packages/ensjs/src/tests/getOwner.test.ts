import { ethers } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]

beforeAll(async () => {
  ;({ ENSInstance, revert, provider } = await setup())
  accounts = await provider.listAccounts()
  const tx = await ENSInstance.wrapName('parthtejpal.eth', accounts[0])
  await tx.wait()
})

afterAll(async () => {
  await revert()
})

describe('getOwner', () => {
  it('should return null for an unregistered name', async () => {
    const result = await ENSInstance.getOwner('test123123cool.eth')
    expect(result).toBeNull()
  })
  it('should return the owner, registrant, and ownership level for a registered name', async () => {
    const result = await ENSInstance.getOwner('jefflau.eth')
    expect(result).toMatchObject({
      owner: '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      registrant: '0x866B3c4994e1416B7C738B9818b31dC246b95eEE',
      ownershipLevel: 'registrar',
    })
  })
  it('should return nameWrapper as the ownership level for a wrapped name', async () => {
    const result = await ENSInstance.getOwner('parthtejpal.eth')
    expect(result?.ownershipLevel).toBe('nameWrapper')
  })
  it('should return registry as the ownership level for an unwrapped subname', async () => {
    const tx = await ENSInstance.createSubname({
      name: 'test.parthtejpal.eth',
      contract: 'nameWrapper',
      owner: accounts[0],
      shouldWrap: false,
    })
    await tx.wait()

    const result = await ENSInstance.getOwner('test.parthtejpal.eth')
    expect(result?.ownershipLevel).toBe('registry')
  })
})