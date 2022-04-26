import { ethers, utils } from 'ethers'
import { ENS } from '..'
import setup from './setup'

let ENSInstance: ENS
let revert: Awaited<ReturnType<typeof setup>>['revert']
let provider: ethers.providers.JsonRpcProvider
let accounts: string[]

beforeAll(async () => {
  ;({ ENSInstance, revert, provider } = await setup())
  accounts = await provider.listAccounts()
})

afterAll(async () => {
  await revert()
})

describe('deleteSubname', () => {
  beforeEach(async () => {
    await revert()
  })
  it('should allow transferring a subname on the registry', async () => {
    const createSubnameTx = await ENSInstance.createSubname({
      contract: 'registry',
      name: 'test.parthtejpal.eth',
      owner: accounts[0],
      options: { addressOrIndex: 0 },
    })
    await createSubnameTx.wait()

    const tx = await ENSInstance.transferSubname(
      'test.parthtejpal.eth',
      'registry',
      accounts[1],
      { addressOrIndex: 0 },
    )
    expect(tx).toBeTruthy()
    await tx.wait()

    const registry = await ENSInstance.contracts!.getRegistry()!
    const result = await registry.owner(utils.namehash('test.parthtejpal.eth'))
    expect(result).toBe(accounts[1])
  })
  it('should allow transferring a subname on the nameWrapper', async () => {
    const wrapNameTx = await ENSInstance.wrapName(
      'parthtejpal.eth',
      accounts[0],
    )
    await wrapNameTx.wait()
    const createSubnameTx = await ENSInstance.createSubname({
      contract: 'nameWrapper',
      name: 'test.parthtejpal.eth',
      owner: accounts[0],
      shouldWrap: true,
      options: { addressOrIndex: 0 },
    })
    await createSubnameTx.wait()

    const tx = await ENSInstance.transferSubname(
      'test.parthtejpal.eth',
      'nameWrapper',
      accounts[1],
      { addressOrIndex: 0 },
    )
    expect(tx).toBeTruthy()
    await tx.wait()

    const registry = await ENSInstance.contracts!.getRegistry()!
    const result = await registry.owner(utils.namehash('test.parthtejpal.eth'))
    expect(result).toBe(accounts[1])
  })
})