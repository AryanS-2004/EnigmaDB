"use strict";
//CRON Job to delete expired keys
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
function delRows() {
    return __awaiter(this, void 0, void 0, function* () {
        // Current time in epoch seconds
        try {
            yield client_1.client1.connect();
        }
        catch (err) { }
        try {
            yield client_1.client2.connect();
        }
        catch (err) { }
        const currTime = Math.floor(new Date().getTime() / 1000);
        const query = {
            text: "DELETE FROM kv_store WHERE expired_at <= $1",
            values: [currTime],
        };
        try {
            // Deleting keys with time to live less than the current time from DB1
            yield client_1.client1.query(query);
            console.log("Deleted expired rows in client1.");
        }
        catch (err) {
            console.log("Error in deleting tuples in client1: ", err.message);
        }
        try {
            // Deleting keys with time to live less than the current time from DB2
            yield client_1.client2.query(query);
            console.log("Deleted expired rows in client2.");
        }
        catch (err) {
            console.log("Error in deleting tuples in client2: ", err.message);
        }
        try {
            yield client_1.client1.end();
        }
        catch (err) { }
        try {
            yield client_1.client2.end();
        }
        catch (err) { }
    });
}
// This job runs every 10 mins and does a batch deletion of the keys that are expired
// and due to this, the rebalancing of the tree is done only once every 30 mins
// as when the user deletes a key it is soft deleted not hard deleted
setInterval(delRows, 600000);
