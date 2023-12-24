import { client1, client2 } from "./client";

async function delRows() {
    // Current time in epoch seconds
    try {
        await client1.connect();
    } catch (err) {}
    try {
        await client2.connect();
    } catch (err) {}

    const currTime: number = Math.floor(new Date().getTime() / 1000);

    const query = {
        text: "DELETE FROM kv_store WHERE expired_at <= $1",
        values: [currTime],
    };
    try {
        // Deleting keys with time to live less than the current time from DB1
        await client1.query(query);
        console.log("Deleted expired rows in client1.");
    } catch (err: any) {
        console.log("Error in deleting tuples in client1: ", err.message);
    }
    try {
        // Deleting keys with time to live less than the current time from DB2
        await client2.query(query);
        console.log("Deleted expired rows in client2.");
    } catch (err: any) {
        console.log("Error in deleting tuples in client2: ", err.message);
    }

    try {
        await client1.end();
    } catch (err) {}
    try {
        await client2.end();
    } catch (err) {}
}

// This job runs every 30 mins and does a batch deletion of the keys that are expired
// and due to this, the rebalancing of the tree is done only once every 30 mins
// as when the user deletes a key it is soft deleted not hard deleted
delRows();
setInterval(delRows, 1800000);
