import { Buffer } from "buffer";
import { Address } from "@stellar/stellar-sdk";
import {
  AssembledTransaction,
  Client as ContractClient,
  ClientOptions as ContractClientOptions,
  MethodOptions,
  Result,
  Spec as ContractSpec,
} from "@stellar/stellar-sdk/contract";
import type {
  u32,
  i32,
  u64,
  i64,
  u128,
  i128,
  u256,
  i256,
  Option,
  Timepoint,
  Duration,
} from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";

if (typeof window !== "undefined") {
  //@ts-ignore Buffer exists
  window.Buffer = window.Buffer || Buffer;
}


export const networks = {
  testnet: {
    networkPassphrase: "Test SDF Network ; September 2015",
    contractId: "CD7SRE3NRLB6KXY336BE3LJ2D7GMI754DBAKLLSXBWTGWY4FOHM4UPWP",
  }
} as const

export type DataKey = {tag: "Admin", values: void} | {tag: "Campaign", values: readonly [u64]} | {tag: "CampaignCount", values: void} | {tag: "UserDonations", values: readonly [string]};


export interface Campaign {
  active: boolean;
  balance: i128;
  deadline: u64;
  name: string;
  owner: string;
  target: i128;
}

export interface Client {
  /**
   * Construct and simulate a donate transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Donate to a campaign via token transfer is complex without inputs.
   * Detailed implementation usually involves transferring tokens to the contract address.
   * For simplicity in this demo, we assume native XLM or a specific token integration.
   * Here we'll just track the balance update assuming the transfer logic is handled or we use a token client.
   * 
   * REAL IMPLEMENTATION: The user transfers tokens to the contract, calling a function that records it.
   * Or we use the `token` interface.
   * Let's use a simplified approach: Input header says "donate".
   */
  donate: ({campaign_id, amount, token, from}: {campaign_id: u64, amount: i128, token: string, from: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Withdraw funds (Campaign owner only)
   */
  withdraw: ({campaign_id, token}: {campaign_id: u64, token: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Initialize the contract with an admin
   */
  initialize: ({admin}: {admin: string}, options?: MethodOptions) => Promise<AssembledTransaction<null>>

  /**
   * Construct and simulate a get_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign: ({campaign_id}: {campaign_id: u64}, options?: MethodOptions) => Promise<AssembledTransaction<Campaign>>

  /**
   * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   * Create a new campaign
   */
  create_campaign: ({name, target, deadline, owner}: {name: string, target: i128, deadline: u64, owner: string}, options?: MethodOptions) => Promise<AssembledTransaction<u64>>

  /**
   * Construct and simulate a get_campaign_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
   */
  get_campaign_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>

}
export class Client extends ContractClient {
  static async deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions &
      Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
      }
  ): Promise<AssembledTransaction<T>> {
    return ContractClient.deploy(null, options)
  }
  constructor(public readonly options: ContractClientOptions) {
    super(
      new ContractSpec([ "AAAAAAAAAhhEb25hdGUgdG8gYSBjYW1wYWlnbiB2aWEgdG9rZW4gdHJhbnNmZXIgaXMgY29tcGxleCB3aXRob3V0IGlucHV0cy4KRGV0YWlsZWQgaW1wbGVtZW50YXRpb24gdXN1YWxseSBpbnZvbHZlcyB0cmFuc2ZlcnJpbmcgdG9rZW5zIHRvIHRoZSBjb250cmFjdCBhZGRyZXNzLgpGb3Igc2ltcGxpY2l0eSBpbiB0aGlzIGRlbW8sIHdlIGFzc3VtZSBuYXRpdmUgWExNIG9yIGEgc3BlY2lmaWMgdG9rZW4gaW50ZWdyYXRpb24uCkhlcmUgd2UnbGwganVzdCB0cmFjayB0aGUgYmFsYW5jZSB1cGRhdGUgYXNzdW1pbmcgdGhlIHRyYW5zZmVyIGxvZ2ljIGlzIGhhbmRsZWQgb3Igd2UgdXNlIGEgdG9rZW4gY2xpZW50LgoKUkVBTCBJTVBMRU1FTlRBVElPTjogVGhlIHVzZXIgdHJhbnNmZXJzIHRva2VucyB0byB0aGUgY29udHJhY3QsIGNhbGxpbmcgYSBmdW5jdGlvbiB0aGF0IHJlY29yZHMgaXQuCk9yIHdlIHVzZSB0aGUgYHRva2VuYCBpbnRlcmZhY2UuCkxldCdzIHVzZSBhIHNpbXBsaWZpZWQgYXBwcm9hY2g6IElucHV0IGhlYWRlciBzYXlzICJkb25hdGUiLgAAAAZkb25hdGUAAAAAAAQAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAARmcm9tAAAAEwAAAAA=",
        "AAAAAAAAACRXaXRoZHJhdyBmdW5kcyAoQ2FtcGFpZ24gb3duZXIgb25seSkAAAAId2l0aGRyYXcAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
        "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAAIQ2FtcGFpZ24AAAABAAAABgAAAAAAAAAAAAAADUNhbXBhaWduQ291bnQAAAAAAAABAAAAAAAAAA1Vc2VyRG9uYXRpb25zAAAAAAAAAQAAABM=",
        "AAAAAAAAACVJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIGFkbWluAAAAAAAACmluaXRpYWxpemUAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
        "AAAAAQAAAAAAAAAAAAAACENhbXBhaWduAAAABgAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAdiYWxhbmNlAAAAAAsAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAGdGFyZ2V0AAAAAAAL",
        "AAAAAAAAAAAAAAAMZ2V0X2NhbXBhaWduAAAAAQAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAfQAAAACENhbXBhaWdu",
        "AAAAAAAAABVDcmVhdGUgYSBuZXcgY2FtcGFpZ24AAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAZ0YXJnZXQAAAAAAAsAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAAAY=",
        "AAAAAAAAAAAAAAASZ2V0X2NhbXBhaWduX2NvdW50AAAAAAAAAAAAAQAAAAY=" ]),
      options
    )
  }
  public readonly fromJSON = {
    donate: this.txFromJSON<null>,
        withdraw: this.txFromJSON<null>,
        initialize: this.txFromJSON<null>,
        get_campaign: this.txFromJSON<Campaign>,
        create_campaign: this.txFromJSON<u64>,
        get_campaign_count: this.txFromJSON<u64>
  }
}