const { client1, client2 } = require("./client");

class Enigma {
    constructor() {}
    async connect() {
        console.log("Connecting DB...");
        await client1.connect();
        await client2.connect();
        console.log("DB Connected!!");
    }
    async disconnect() {
        console.log("Disconnecting Clients...");
        await client1.end();
        await client2.end();
        console.log("Clients Disconnected!!");
    }
    async get(key) {
        if (!client1 || !client2) {
            return new Error("Call connect() first.");
        }

        if (!client1._connected || !client2._connected) {
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
                    res = await client1.query(query);
                } else {
                    res = await client2.query(query);
                }
                if (res.rows.length > 0) {
                    return `${key}: ${res.rows[0].val}`;
                } else {
                    return new Error(`${key} not found.`);
                }
            } catch (err) {
                return new Error(`Error executing GET query: ${err.message}`);
            }
        } else {
            return new Error(
                "The passed parameter is incorrect please pass correct parameter. "
            );
        }
    }
    async set(key, val, ttl) {
        if (!client1 || !client2) {
            return new Error("Call connect() first.");
        }

        if (!client1._connected || !client2._connected) {
            return new Error("Call connect() first.");
        }
        const currentEpochTime = Math.floor(new Date().getTime() / 1000);
        ttl = parseInt(ttl) + currentEpochTime;
        if (key && val && ttl) {
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
                    return `Successfully inserted ${res.rowCount} row(s) for key ${key}.`;
                } else {
                    return new Error(`${key} not found.`);
                }
            } catch (err) {
                return new Error(`Error executing SET query: ${err.message}`);
            }
        } else {
            return new Error(
                "The passed parameters are incorrect please pass correct parameters. "
            );
        }
    }
    async del(key) {
        if (!client1 || !client2) {
            return new Error("Call connect() first.");
        }
        if (!client1._connected || !client2._connected) {
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
                    res = await client1.query(query);
                } else {
                    res = await client2.query(query);
                }
                if (res.rowCount > 0) {
                    return `Successfully deleted ${res.rowCount} row(s) for key ${key}.`;
                } else {
                    return new Error(`${key} not found.`);
                }
            } catch (err) {
                return new Error(
                    `Error executing DELETE query: ${err.message}`
                );
            }
        } else {
            return new Error(
                "The passed parameter is incorrect please pass correct parameter. "
            );
        }
    }
    async expire(key, ttl) {
        if (!client1 || !client2) {
            return new Error("Call connect() first.");
        }
        if (!client1._connected || !client2._connected) {
            return new Error("Call connect() first.");
        }
        const currentEpochTime = Math.floor(new Date().getTime() / 1000);
        ttl = parseInt(ttl) + currentEpochTime;
        if (key && ttl) {
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
                if (res.rowCount > 0) {
                    return `Successfully deleted ${res.rowCount} row(s) for key ${key}.`;
                } else {
                    return new Error(`${key} not found.`);
                }
            } catch (err) {
                return new Error(
                    `Error executing EXPIRE query: ${err.message}`
                );
            }
        } else {
            return new Error(
                "The passed parameters are incorrect please pass correct parameters. "
            );
        }
    }
}

module.exports = Enigma;
