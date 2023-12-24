import { client1, client2 } from "./client";
import * as readline from "readline";

// Readline is used to make the DB interactive and get commands from the user using a CLI
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function init(): Promise<void> {
    console.log("Connecting DB...");
    await client1.connect();
    await client2.connect();
    console.log("DB Connected!!\n");

    rl.setPrompt("> ");
    rl.prompt();

    rl.on("line", async function (line: string): Promise<void> {
        // Get the command that the user entered and split it based on spaces
        let instruction: string[] = line.split(" ");
        instruction = instruction.filter((ins) => ins !== "");

        // Get the command and key from the instruction
        const command: string | undefined = instruction[0];
        const key: string | undefined = instruction[1];

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
                        res = await client1.query(query);
                    } else {
                        res = await client2.query(query);
                    }

                    if (res.rows.length > 0) {
                        console.log(key, ": ", res.rows[0].val);
                        rl.prompt();
                    } else {
                        console.log(`${key} not found.`);
                        rl.prompt();
                    }
                } catch (err: any) {
                    console.error("Error executing GET query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect. Please give the command in the format: 'GET key'"
                );
                rl.prompt();
            }
        } else if (command && command === "SET") {
            const val: string | undefined = instruction[2];
            let ttl: string | undefined = instruction[3];
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
                        res = await client1.query(query);
                    } else {
                        res = await client2.query(query);
                    }

                    if (res?.rowCount && res?.rowCount > 0) {
                        console.log(
                            `Successfully inserted ${res.rowCount} row(s) for key ${key}.`
                        );
                        rl.prompt();
                    } else {
                        console.log(`${key} not found.`);
                        rl.prompt();
                    }
                } catch (err: any) {
                    console.error("Error executing SET query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect. Please give the command in the format: 'SET key value TTL(s)'"
                );
                rl.prompt();
            }
        } else if (command && command === "DELETE") {
            if (key && instruction.length === 2) {
                const query = {
                    text: "UPDATE kv_store SET expired_at=-1 WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                    values: [key],
                };

                try {
                    const letter = key.charAt(0).toLowerCase();
                    let res;

                    if (letter <= "m") {
                        res = await client1.query(query);
                    } else {
                        res = await client2.query(query);
                    }

                    if (res?.rowCount && res?.rowCount > 0) {
                        console.log(
                            `Successfully deleted ${res.rowCount} row(s) for key ${key}.`
                        );
                        rl.prompt();
                    } else {
                        console.log(`${key} not found.`);
                        rl.prompt();
                    }
                } catch (err: any) {
                    console.error("Error executing DELETE query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect. Please give the command in the format: 'DELETE key'"
                );
                rl.prompt();
            }
        } else if (command && command === "EXPIRE") {
            let ttl: string | undefined = instruction[2];
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
                        res = await client1.query(query);
                    } else {
                        res = await client2.query(query);
                    }

                    if (res?.rowCount && res?.rowCount > 0) {
                        console.log(
                            `Successfully changed expiry for key ${key}.`
                        );
                        rl.prompt();
                    } else {
                        console.log(`${key} not found.`);
                        rl.prompt();
                    }
                } catch (err: any) {
                    console.error("Error executing EXPIRE query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect. Please give the command in the format: 'EXPIRE key TTL(s)'"
                );
                rl.prompt();
            }
        } else {
            console.error(
                "Incorrect Command!!! Only GET, SET, DELETE, and EXPIRE are allowed."
            );
            rl.prompt();
        }
    }).on("close", async (): Promise<void> => {
        console.log("Disconnecting Clients...");
        await client1.end();
        await client2.end();
        console.log("Clients Disconnected!!\n");
    });
}

init();
