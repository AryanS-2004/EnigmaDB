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
        console.log("Disconnecting Clients...");
        yield client_1.client1.end();
        yield client_1.client2.end();
        console.log("Clients Disconnected!!\n");
    });
}
init();
