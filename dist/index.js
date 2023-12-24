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
const client_1 = require("./client");
class Enigma {
    constructor() { }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Connecting DB...");
            yield client_1.client1.connect();
            yield client_1.client2.connect();
            console.log("DB Connected!!\n");
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Disconnecting Clients...");
            yield client_1.client1.end();
            yield client_1.client2.end();
            console.log("Clients Disconnected!!\n");
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client_1.client1 || !client_1.client2) {
                return new Error("Call connect() first.");
            }
            if (key) {
                const query = {
                    text: "SELECT val FROM kv_store WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                    values: [key],
                };
                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;
                    if (letter <= "m") {
                        res = yield client_1.client1.query(query);
                    }
                    else {
                        res = yield client_1.client2.query(query);
                    }
                    if (res.rows.length > 0) {
                        return res.rows[0].val;
                    }
                    else {
                        return new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    return new Error(`Error executing GET query: ${err.message}`);
                }
            }
            else {
                return new Error("The passed parameter is incorrect. Please pass a correct parameter.");
            }
        });
    }
    set(key, val, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client_1.client1 || !client_1.client2) {
                return new Error("Call connect() first.");
            }
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
                        res = yield client_1.client1.query(query);
                    }
                    else {
                        res = yield client_1.client2.query(query);
                    }
                    if ((res === null || res === void 0 ? void 0 : res.rowCount) && (res === null || res === void 0 ? void 0 : res.rowCount) > 0) {
                        return 1;
                    }
                    else {
                        return new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    return new Error(`Error executing SET query: ${err.message}`);
                }
            }
            else {
                return new Error("The passed parameters are incorrect. Please pass correct parameters.");
            }
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client_1.client1 || !client_1.client2) {
                return new Error("Call connect() first.");
            }
            if (key) {
                const query = {
                    text: "UPDATE kv_store SET expired_at=-1 WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                    values: [key],
                };
                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;
                    if (letter <= "m") {
                        res = yield client_1.client1.query(query);
                    }
                    else {
                        res = yield client_1.client2.query(query);
                    }
                    if ((res === null || res === void 0 ? void 0 : res.rowCount) && (res === null || res === void 0 ? void 0 : res.rowCount) > 0) {
                        return 1;
                    }
                    else {
                        return new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    return new Error(`Error executing DELETE query: ${err.message}`);
                }
            }
            else {
                return new Error("The passed parameter is incorrect. Please pass a correct parameter.");
            }
        });
    }
    expire(key, ttl) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client_1.client1 || !client_1.client2) {
                return new Error("Call connect() first.");
            }
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
                        res = yield client_1.client1.query(query);
                    }
                    else {
                        res = yield client_1.client2.query(query);
                    }
                    if ((res === null || res === void 0 ? void 0 : res.rowCount) && (res === null || res === void 0 ? void 0 : res.rowCount) > 0) {
                        return 1;
                    }
                    else {
                        return new Error(`${key} not found!!\n`);
                    }
                }
                catch (err) {
                    return new Error(`Error executing EXPIRE query: ${err.message}`);
                }
            }
            else {
                return new Error("The passed parameters are incorrect. Please pass correct parameters.");
            }
        });
    }
}
exports.default = Enigma;
