"use strict";
// Code to use the DB in interactive CLI mode
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const readline = __importStar(require("readline"));
// Readline is used to make the DB interactive and get commands from the user using a CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Connecting DB...");
        yield client_1.client1.connect();
        yield client_1.client2.connect();
        console.log("DB Connected!!\n");
        console.log("Creating the required tables...");
        const query = {
            text: "CREATE TABLE kv_store(key VARCHAR(255) PRIMARY KEY, val TEXT, expired_at INTEGER);",
        };
        try {
            yield client_1.client1.query(query);
        }
        catch (err) { }
        try {
            yield client_1.client2.query(query);
        }
        catch (err) { }
        console.log("Created the required tables!!\n");
        rl.setPrompt("> ");
        rl.prompt();
        rl.on("line", function (line) {
            return __awaiter(this, void 0, void 0, function* () {
                // Get the command that the user entered and split it based on spaces
                let instruction = line.split(" ");
                instruction = instruction.filter((ins) => ins !== "");
                // Get the command and key from the instruction
                const command = instruction[0];
                const key = instruction[1];
                if (command && command === "GET") {
                    if (key && instruction.length === 2) {
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
                                console.log(key, ": ", res.rows[0].val);
                                rl.prompt();
                            }
                            else {
                                console.log(`${key} not found.`);
                                rl.prompt();
                            }
                        }
                        catch (err) {
                            console.error("Error executing GET query:", err.message);
                            rl.prompt();
                        }
                    }
                    else {
                        console.error("The command is incorrect. Please give the command in the format: 'GET key'");
                        rl.prompt();
                    }
                }
                else if (command && command === "SET") {
                    const val = instruction[2];
                    let ttl = instruction[3];
                    const currentEpochTime = Math.floor(new Date().getTime() / 1000);
                    ttl = ttl ? (parseInt(ttl) + currentEpochTime).toString() : "";
                    if (key && val && ttl && instruction.length === 4) {
                        const query = {
                            text: "INSERT INTO kv_store (key, val, expired_at) VALUES ($1, $2, $3) ON CONFLICT (key) DO UPDATE SET key = $1 , val = $2, expired_at = $3;",
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
                                console.log(`Successfully inserted ${res.rowCount} row(s) for key ${key}.`);
                                rl.prompt();
                            }
                            else {
                                console.log(`${key} not found.`);
                                rl.prompt();
                            }
                        }
                        catch (err) {
                            console.error("Error executing SET query:", err.message);
                            rl.prompt();
                        }
                    }
                    else {
                        console.error("The command is incorrect. Please give the command in the format: 'SET key value TTL(s)'");
                        rl.prompt();
                    }
                }
                else if (command && command === "DELETE") {
                    if (key && instruction.length === 2) {
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
                                console.log(`Successfully deleted ${res.rowCount} row(s) for key ${key}.`);
                                rl.prompt();
                            }
                            else {
                                console.log(`${key} not found.`);
                                rl.prompt();
                            }
                        }
                        catch (err) {
                            console.error("Error executing DELETE query:", err.message);
                            rl.prompt();
                        }
                    }
                    else {
                        console.error("The command is incorrect. Please give the command in the format: 'DELETE key'");
                        rl.prompt();
                    }
                }
                else if (command && command === "EXPIRE") {
                    let ttl = instruction[2];
                    const currentEpochTime = Math.floor(new Date().getTime() / 1000);
                    ttl = ttl ? (parseInt(ttl) + currentEpochTime).toString() : "";
                    if (key && ttl && instruction.length === 3) {
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
                                console.log(`Successfully changed expiry for key ${key}.`);
                                rl.prompt();
                            }
                            else {
                                console.log(`${key} not found.`);
                                rl.prompt();
                            }
                        }
                        catch (err) {
                            console.error("Error executing EXPIRE query:", err.message);
                            rl.prompt();
                        }
                    }
                    else {
                        console.error("The command is incorrect. Please give the command in the format: 'EXPIRE key TTL(s)'");
                        rl.prompt();
                    }
                }
                else {
                    console.error("Incorrect Command!!! Only GET, SET, DELETE, and EXPIRE are allowed.");
                    rl.prompt();
                }
            });
        }).on("close", () => __awaiter(this, void 0, void 0, function* () {
            console.log("Disconnecting Clients...");
            yield client_1.client1.end();
            yield client_1.client2.end();
            console.log("Clients Disconnected!!\n");
        }));
    });
}
init();
