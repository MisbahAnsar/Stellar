import { Buffer } from "buffer";
import { Client as ContractClient, Spec as ContractSpec, } from "@stellar/stellar-sdk/contract";
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
};
export class Client extends ContractClient {
    options;
    static async deploy(
    /** Options for initializing a Client as well as for calling a method, with extras specific to deploying. */
    options) {
        return ContractClient.deploy(null, options);
    }
    constructor(options) {
        super(new ContractSpec(["AAAAAAAAAhhEb25hdGUgdG8gYSBjYW1wYWlnbiB2aWEgdG9rZW4gdHJhbnNmZXIgaXMgY29tcGxleCB3aXRob3V0IGlucHV0cy4KRGV0YWlsZWQgaW1wbGVtZW50YXRpb24gdXN1YWxseSBpbnZvbHZlcyB0cmFuc2ZlcnJpbmcgdG9rZW5zIHRvIHRoZSBjb250cmFjdCBhZGRyZXNzLgpGb3Igc2ltcGxpY2l0eSBpbiB0aGlzIGRlbW8sIHdlIGFzc3VtZSBuYXRpdmUgWExNIG9yIGEgc3BlY2lmaWMgdG9rZW4gaW50ZWdyYXRpb24uCkhlcmUgd2UnbGwganVzdCB0cmFjayB0aGUgYmFsYW5jZSB1cGRhdGUgYXNzdW1pbmcgdGhlIHRyYW5zZmVyIGxvZ2ljIGlzIGhhbmRsZWQgb3Igd2UgdXNlIGEgdG9rZW4gY2xpZW50LgoKUkVBTCBJTVBMRU1FTlRBVElPTjogVGhlIHVzZXIgdHJhbnNmZXJzIHRva2VucyB0byB0aGUgY29udHJhY3QsIGNhbGxpbmcgYSBmdW5jdGlvbiB0aGF0IHJlY29yZHMgaXQuCk9yIHdlIHVzZSB0aGUgYHRva2VuYCBpbnRlcmZhY2UuCkxldCdzIHVzZSBhIHNpbXBsaWZpZWQgYXBwcm9hY2g6IElucHV0IGhlYWRlciBzYXlzICJkb25hdGUiLgAAAAZkb25hdGUAAAAAAAQAAAAAAAAAC2NhbXBhaWduX2lkAAAAAAYAAAAAAAAABmFtb3VudAAAAAAACwAAAAAAAAAFdG9rZW4AAAAAAAATAAAAAAAAAARmcm9tAAAAEwAAAAA=",
            "AAAAAAAAACRXaXRoZHJhdyBmdW5kcyAoQ2FtcGFpZ24gb3duZXIgb25seSkAAAAId2l0aGRyYXcAAAACAAAAAAAAAAtjYW1wYWlnbl9pZAAAAAAGAAAAAAAAAAV0b2tlbgAAAAAAABMAAAAA",
            "AAAAAgAAAAAAAAAAAAAAB0RhdGFLZXkAAAAABAAAAAAAAAAAAAAABUFkbWluAAAAAAAAAQAAAAAAAAAIQ2FtcGFpZ24AAAABAAAABgAAAAAAAAAAAAAADUNhbXBhaWduQ291bnQAAAAAAAABAAAAAAAAAA1Vc2VyRG9uYXRpb25zAAAAAAAAAQAAABM=",
            "AAAAAAAAACVJbml0aWFsaXplIHRoZSBjb250cmFjdCB3aXRoIGFuIGFkbWluAAAAAAAACmluaXRpYWxpemUAAAAAAAEAAAAAAAAABWFkbWluAAAAAAAAEwAAAAA=",
            "AAAAAQAAAAAAAAAAAAAACENhbXBhaWduAAAABgAAAAAAAAAGYWN0aXZlAAAAAAABAAAAAAAAAAdiYWxhbmNlAAAAAAsAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAEbmFtZQAAABAAAAAAAAAABW93bmVyAAAAAAAAEwAAAAAAAAAGdGFyZ2V0AAAAAAAL",
            "AAAAAAAAAAAAAAAMZ2V0X2NhbXBhaWduAAAAAQAAAAAAAAALY2FtcGFpZ25faWQAAAAABgAAAAEAAAfQAAAACENhbXBhaWdu",
            "AAAAAAAAABVDcmVhdGUgYSBuZXcgY2FtcGFpZ24AAAAAAAAPY3JlYXRlX2NhbXBhaWduAAAAAAQAAAAAAAAABG5hbWUAAAAQAAAAAAAAAAZ0YXJnZXQAAAAAAAsAAAAAAAAACGRlYWRsaW5lAAAABgAAAAAAAAAFb3duZXIAAAAAAAATAAAAAQAAAAY=",
            "AAAAAAAAAAAAAAASZ2V0X2NhbXBhaWduX2NvdW50AAAAAAAAAAAAAQAAAAY="]), options);
        this.options = options;
    }
    fromJSON = {
        donate: (this.txFromJSON),
        withdraw: (this.txFromJSON),
        initialize: (this.txFromJSON),
        get_campaign: (this.txFromJSON),
        create_campaign: (this.txFromJSON),
        get_campaign_count: (this.txFromJSON)
    };
}
