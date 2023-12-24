// Making Postgres Clients for use

import { Client } from "pg";
import { server1, server2 } from "./env";

// Two clients are used to shard the db for better performance as the keys till
// 'm' are stored in DB1 and after 'm' the keys are stored in DB2

const connectionString1: string = server1;
const connectionString2: string = server2;

const client1: Client = new Client({
    connectionString: connectionString1,
});

const client2: Client = new Client({
    connectionString: connectionString2,
});

export { client1, client2 };
