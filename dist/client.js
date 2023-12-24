"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.client2 = exports.client1 = void 0;
const pg_1 = require("pg");
const env_1 = require("./env");
// Two clients are used to shard the db for better performance as the keys till
// 'm' are stored in DB1 and after 'm' the keys are stored in DB2
const connectionString1 = env_1.server1;
const connectionString2 = env_1.server2;
const client1 = new pg_1.Client({
    connectionString: connectionString1,
});
exports.client1 = client1;
const client2 = new pg_1.Client({
    connectionString: connectionString2,
});
exports.client2 = client2;
