// This is a CRON job to delete the key that are expired or the keys that the user delted

const { client1, client2 } = require("./client");

async function delRows() {
    //Current time in epoch seconds
    const currTime = Math.floor(new Date().getTime() / 1000);

    const query = {
        text: "DELETE FROM kv_store WHERE expired_at <= $1",
        values: [currTime],
    };
    try {
        //Deleting keys with time to live less than the current time from the DB1
        await client1.query(query);
        console.log("Deleted expired rows in client1.");
    } catch (err) {
        console.log("Error in deleting tuples in client1: ", err.message);
    }
    try {
        //Deleting keys with time to live less than the current time from the DB2
        await client2.query(query);
        console.log("Deleted expired rows in client2.");
    } catch (err) {
        console.log("Error in deleting tuples in client2: ", err.message);
    }
}

//This job runs every 30 mins and does a batch deletion of the keys that are expired
// and due to this the rebalancing of the tree is done only once every 30 mins
// as when the user deletes a key it is soft deleted not hard deleted
setInterval(delRows, 1800000);
