// Code to create the tables required in the DB

import { client1, client2 } from "./client";

async function init(): Promise<void> {
    console.log("Connecting DB...");
    await client1.connect();
    await client2.connect();
    console.log("DB Connected!!\n");

    console.log("Creating the required tables...");

    const query = {
        text: "CREATE TABLE kv_store(key VARCHAR(255) PRIMARY KEY, val TEXT, expired_at INTEGER);",
    };

    try {
        await client1.query(query);
    } catch (err) {}

    try {
        await client2.query(query);
    } catch (err) {}

    console.log("Created the required tables!!\n");
    console.log("Disconnecting Clients...");
    await client1.end();
    await client2.end();
    console.log("Clients Disconnected!!\n");
}

init();
