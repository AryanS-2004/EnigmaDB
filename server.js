const { client1, client2 } = require("./client");
const readline = require("readline");

//Readline is used to make the DB interactive and get commands from user using a CLI

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

async function init() {
    console.log("Connecting DB...");
    await client1.connect();
    await client2.connect();
    console.log("DB Connected!!");
    rl.setPrompt("> ");
    rl.prompt();
    rl.on("line", async function (line) {
        const instruction = line.split(" ");
        const command = instruction[0];
        const key = instruction[1];
        const val = instruction[2];
        const currentEpochTime = Math.floor(new Date().getTime() / 1000);
        const ttl = parseInt(instruction[3]) + currentEpochTime;
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
                        console.log("Key not found.");
                        rl.prompt();
                    }
                } catch (err) {
                    console.error("Error executing GET query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect please give the command in the format : 'GET key' "
                );
                rl.prompt();
            }
        } else if (command && command === "SET") {
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
                    if (res.rowCount > 0) {
                        console.log(
                            `Successfully inserted ${res.rowCount} row(s) for key ${key}.`
                        );
                        rl.prompt();
                    } else {
                        console.log(`No rows found for key ${key}.`);
                        rl.prompt();
                    }
                } catch (err) {
                    console.error("Error executing SET query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect please give the command in the format : 'SET key value TTL(s)' "
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
                    if (res.rowCount > 0) {
                        console.log(
                            `Successfully deleted ${res.rowCount} row(s) for key ${key}.`
                        );
                        rl.prompt();
                    } else {
                        console.log(`No rows found for key ${key}.`);
                        rl.prompt();
                    }
                } catch (err) {
                    console.error("Error executing DELETE query:", err.message);
                    rl.prompt();
                }
            } else {
                console.error(
                    "The command is incorrect please give the command in the format : 'DELETE key'"
                );
                rl.prompt();
            }
        } else {
            console.error(
                "Incorrect Command!!! Only GET, SET and DELETE are allowed."
            );
            rl.prompt();
        }
    }).on("close", async () => {
        console.log("Disconnecting Clients...");
        await client1.end();
        await client2.end();
        console.log("Clients Disconnected!!");
    });
}

init();
