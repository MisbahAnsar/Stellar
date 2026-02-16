import { Buffer } from "buffer";
import { AssembledTransaction, Client as ContractClient, ClientOptions as ContractClientOptions, MethodOptions } from "@stellar/stellar-sdk/contract";
import type { u64, i128 } from "@stellar/stellar-sdk/contract";
export * from "@stellar/stellar-sdk";
export * as contract from "@stellar/stellar-sdk/contract";
export * as rpc from "@stellar/stellar-sdk/rpc";
export declare const networks: {
    readonly testnet: {
        readonly networkPassphrase: "Test SDF Network ; September 2015";
        readonly contractId: "CD7SRE3NRLB6KXY336BE3LJ2D7GMI754DBAKLLSXBWTGWY4FOHM4UPWP";
    };
};
export type DataKey = {
    tag: "Admin";
    values: void;
} | {
    tag: "Campaign";
    values: readonly [u64];
} | {
    tag: "CampaignCount";
    values: void;
} | {
    tag: "UserDonations";
    values: readonly [string];
};
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
    donate: ({ campaign_id, amount, token, from }: {
        campaign_id: u64;
        amount: i128;
        token: string;
        from: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a withdraw transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Withdraw funds (Campaign owner only)
     */
    withdraw: ({ campaign_id, token }: {
        campaign_id: u64;
        token: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a initialize transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Initialize the contract with an admin
     */
    initialize: ({ admin }: {
        admin: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<null>>;
    /**
     * Construct and simulate a get_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_campaign: ({ campaign_id }: {
        campaign_id: u64;
    }, options?: MethodOptions) => Promise<AssembledTransaction<Campaign>>;
    /**
     * Construct and simulate a create_campaign transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     * Create a new campaign
     */
    create_campaign: ({ name, target, deadline, owner }: {
        name: string;
        target: i128;
        deadline: u64;
        owner: string;
    }, options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
    /**
     * Construct and simulate a get_campaign_count transaction. Returns an `AssembledTransaction` object which will have a `result` field containing the result of the simulation. If this transaction changes contract state, you will need to call `signAndSend()` on the returned object.
     */
    get_campaign_count: (options?: MethodOptions) => Promise<AssembledTransaction<u64>>;
}
export declare class Client extends ContractClient {
    readonly options: ContractClientOptions;
    static deploy<T = Client>(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options: MethodOptions & Omit<ContractClientOptions, "contractId"> & {
        /** The hash of the Wasm blob, which must already be installed on-chain. */
        wasmHash: Buffer | string;
        /** Salt used to generate the contract's ID. Passed through to {@link Operation.createCustomContract}. Default: random. */
        salt?: Buffer | Uint8Array;
        /** The format used to decode `wasmHash`, if it's provided as a string. */
        format?: "hex" | "base64";
    }): Promise<AssembledTransaction<T>>;
    constructor(options: ContractClientOptions);
    readonly fromJSON: {
        donate: (json: string) => AssembledTransaction<null>;
        withdraw: (json: string) => AssembledTransaction<null>;
        initialize: (json: string) => AssembledTransaction<null>;
        get_campaign: (json: string) => AssembledTransaction<Campaign>;
        create_campaign: (json: string) => AssembledTransaction<bigint>;
        get_campaign_count: (json: string) => AssembledTransaction<bigint>;
    };
}
