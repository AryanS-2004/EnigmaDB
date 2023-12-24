import { client1, client2 } from "./client";

class Enigma {
    constructor() {}

    async connect(): Promise<void> {
        console.log("Connecting DB...");
        await client1.connect();
        await client2.connect();
        console.log("DB Connected!!\n");
    }

    async disconnect(): Promise<void> {
        console.log("Disconnecting Clients...");
        await client1.end();
        await client2.end();
        console.log("Clients Disconnected!!\n");
    }

    async get(key: string): Promise<string | Error> {
        if (!client1 || !client2) {
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
                    return res.rows[0].val;
                } else {
                    return new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                return new Error(`Error executing GET query: ${err.message}`);
            }
        } else {
            return new Error(
                "The passed parameter is incorrect. Please pass a correct parameter."
            );
        }
    }

    async set(key: string, val: string, ttl: number): Promise<number | Error> {
        if (!client1 || !client2) {
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
                    res = await client1.query(query);
                } else {
                    res = await client2.query(query);
                }

                if (res?.rowCount && res?.rowCount > 0) {
                    return 1;
                } else {
                    return new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                return new Error(`Error executing SET query: ${err.message}`);
            }
        } else {
            return new Error(
                "The passed parameters are incorrect. Please pass correct parameters."
            );
        }
    }

    async del(key: string): Promise<number | Error> {
        if (!client1 || !client2) {
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

                if (res?.rowCount && res?.rowCount > 0) {
                    return 1;
                } else {
                    return new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                return new Error(
                    `Error executing DELETE query: ${err.message}`
                );
            }
        } else {
            return new Error(
                "The passed parameter is incorrect. Please pass a correct parameter."
            );
        }
    }

    async expire(key: string, ttl: number): Promise<number | Error> {
        if (!client1 || !client2) {
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
                    res = await client1.query(query);
                } else {
                    res = await client2.query(query);
                }

                if (res?.rowCount && res?.rowCount > 0) {
                    return 1;
                } else {
                    return new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                return new Error(
                    `Error executing EXPIRE query: ${err.message}`
                );
            }
        } else {
            return new Error(
                "The passed parameters are incorrect. Please pass correct parameters."
            );
        }
    }
}

export default Enigma;
