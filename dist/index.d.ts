import { Client } from "pg";

declare class Enigma {
    private client1: Client;
    private client2: Client;
    private isConnected: boolean;

    constructor(server1: string, server2: string);

    connect(): Promise<Error | void>;
    disconnect(): Promise<Error | void>;
    get(key: string): Promise<string | Error>;
    set(key: string, val: string, ttl: number): Promise<number | Error>;
    del(key: string): Promise<number | Error>;
    expire(key: string, ttl: number): Promise<number | Error>;
}

export default Enigma;
