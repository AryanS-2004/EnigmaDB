"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
class Enigma {
    constructor(server1, server2) {
        this.client1 = new pg_1.Client({
            connectionString: server1,
        });
        this.client2 = new pg_1.Client({
            connectionString: server2,
        });
        this.isConnected = false;
        this.intervalId = null;
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.client1.connect();
                yield this.client2.connect();
                const query = {
                    text: "CREATE TABLE kv_store(key VARCHAR(255) PRIMARY KEY, val TEXT, expired_at INTEGER);",
                };
                yield this.client1.query("DROP TABLE IF EXISTS kv_store;");
                yield this.client2.query("DROP TABLE IF EXISTS kv_store;");
                yield this.client1.query(query);
                yield this.client2.query(query);
                this.isConnected = true;
                // This job runs every 10 mins and does a batch deletion of the keys that are expired
                // and due to this, the rebalancing of the tree is done only once every 30 mins
                // as when the user deletes a key it is soft deleted not hard deleted
                // this.delRows();
                this.intervalId = setInterval(this.delRows, 600000);
            }
            catch (err) {
                throw new Error(`\n\nError during table creation: ${err}\n\n`);
            }
        });
    }
    delRows() {
        return __awaiter(this, void 0, void 0, function* () {
            //Current time in epoch seconds
            const currTime = Math.floor(new Date().getTime() / 1000);
            const query = {
                text: "DELETE FROM kv_store WHERE expired_at <= $1",
                values: [currTime],
            };
            try {
                // Deleting keys with time to live less than the current time from DB1
                yield this.client1.query(query);
            }
            catch (err) {
                // throw new Error(`Error in deleting expired keys:  ${err.message}`);
            }
            try {
                // Deleting keys with time to live less than the current time from DB2
                yield this.client2.query(query);
            }
            catch (err) {
                // throw new Error(`Error in deleting expired keys:  ${err.message}`);
            }
        });
    }
    checkConnection() {
        if (!this.isConnected) {
            throw new Error("Call connect() first.");
        }
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            try {
                if (this.intervalId !== null) {
                    clearInterval(this.intervalId);
                    this.intervalId = null;
                }
                yield this.client1.end();
                yield this.client2.end();
                this.isConnected = false;
            }
            catch (err) {
                throw new Error(`\n\nError disconnecting: ${err}\n\n`);
            }
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            if (key) {
                const query = {
                    text: "SELECT val FROM kv_store WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                    values: [key],
                };
                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;
                    if (letter <= "m") {
                        res = yield this.client1.query(query);
                    }
                    else {
                        res = yield this.client2.query(query);
                    }
                    if (res.rows.length > 0) {
                        return res.rows[0].val;
                    }
                    else {
                        throw new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    throw new Error(`Error executing GET query: ${err.message}`);
                }
            }
            else {
                throw new Error("The passed parameter is incorrect. Please pass a correct parameter.");
            }
        });
    }
    set(key, val, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const currentEpochTime = Math.floor(new Date().getTime() / 1000);
            ttl = ttl + currentEpochTime;
            if (key && val && ttl) {
                const query = {
                    text: "INSERT INTO kv_store (key, val, expired_at) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET key = $1, val = $2, expired_at = $3;",
                    values: [key, val, ttl],
                };
                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;
                    if (letter <= "m") {
                        res = yield this.client1.query(query);
                    }
                    else {
                        res = yield this.client2.query(query);
                    }
                    if ((res === null || res === void 0 ? void 0 : res.rowCount) && (res === null || res === void 0 ? void 0 : res.rowCount) > 0) {
                        return 1;
                    }
                    else {
                        throw new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    throw new Error(`Error executing SET query: ${err.message}`);
                }
            }
            else {
                throw new Error("The passed parameters are incorrect. Please pass correct parameters.");
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            if (key) {
                const query = {
                    text: "UPDATE kv_store SET expired_at=-1 WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                    values: [key],
                };
                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;
                    if (letter <= "m") {
                        res = yield this.client1.query(query);
                    }
                    else {
                        res = yield this.client2.query(query);
                    }
                    if ((res === null || res === void 0 ? void 0 : res.rowCount) && (res === null || res === void 0 ? void 0 : res.rowCount) > 0) {
                        return 1;
                    }
                    else {
                        throw new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    throw new Error(`Error executing DELETE query: ${err.message}`);
                }
            }
            else {
                throw new Error("The passed parameter is incorrect. Please pass a correct parameter.");
            }
        });
    }
    expire(key, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            this.checkConnection();
            const currentEpochTime = Math.floor(new Date().getTime() / 1000);
            ttl = ttl + currentEpochTime;
            if (key && ttl) {
                const query = {
                    text: "UPDATE kv_store SET expired_at=$1 WHERE key=$2;",
                    values: [ttl, key],
                };
                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;
                    if (letter <= "m") {
                        res = yield this.client1.query(query);
                    }
                    else {
                        res = yield this.client2.query(query);
                    }
                    if ((res === null || res === void 0 ? void 0 : res.rowCount) && (res === null || res === void 0 ? void 0 : res.rowCount) > 0) {
                        return 1;
                    }
                    else {
                        throw new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    throw new Error(`Error executing EXPIRE query: ${err.message}`);
                }
            }
            else {
                throw new Error("The passed parameters are incorrect. Please pass correct parameters.");
            }
        });
    }
}
exports.default = Enigma;
