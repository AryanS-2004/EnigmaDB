import { Client } from "pg";

class Enigma {
    private client1: Client;
    private client2: Client;
    private isConnected: boolean;

    constructor(server1: string, server2: string) {
        this.client1 = new Client({
            connectionString: server1,
        });

        this.client2 = new Client({
            connectionString: server2,
        });
        this.isConnected = false;
    }

    async connect(): Promise<Error | void> {
        try {
            await this.client1.connect();
            await this.client2.connect();
            const query = {
                text: "CREATE TABLE kv_store(key VARCHAR(255) PRIMARY KEY, val TEXT, expired_at INTEGER);",
            };
            await this.client1.query("DROP TABLE IF EXISTS kv_store;");
            await this.client2.query("DROP TABLE IF EXISTS kv_store;");

            await this.client1.query(query);
            await this.client2.query(query);
            this.isConnected = true;
            // This job runs every 10 mins and does a batch deletion of the keys that are expired
            // and due to this, the rebalancing of the tree is done only once every 30 mins
            // as when the user deletes a key it is soft deleted not hard deleted
            // this.delRows();
            setInterval(this.delRows, 600000);
        } catch (err: any) {
            throw new Error(`\n\nError during table creation: ${err}\n\n`);
        }
    }

    private async delRows() {
        //Current time in epoch seconds
        const currTime: number = Math.floor(new Date().getTime() / 1000);
        const query = {
            text: "DELETE FROM kv_store WHERE expired_at <= $1",
            values: [currTime],
        };
        try {
            // Deleting keys with time to live less than the current time from DB1
            await this.client1.query(query);
        } catch (err: any) {
            // throw new Error(`Error in deleting expired keys:  ${err.message}`);
        }
        try {
            // Deleting keys with time to live less than the current time from DB2
            await this.client2.query(query);
        } catch (err: any) {
            // throw new Error(`Error in deleting expired keys:  ${err.message}`);
        }
    }

    private checkConnection(): void {
        if (!this.isConnected) {
            throw new Error("Call connect() first.");
        }
    }

    async disconnect(): Promise<Error | void> {
        this.checkConnection();
        try {
            // console.log("Disconnecting Clients...");
            await this.client1.end();
            await this.client2.end();
            // console.log("Clients Disconnected!!\n");
        } catch (err: any) {
            throw new Error(`\n\nError disconnecting: ${err}\n\n`);
        }
    }

    async get(key: string): Promise<string | Error> {
        this.checkConnection();
        if (key) {
            const query = {
                text: "SELECT val FROM kv_store WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                values: [key],
            };

            try {
                const letter = key.charAt(0).toLowerCase();
                let res;

                if (letter <= "m") {
                    res = await this.client1.query(query);
                } else {
                    res = await this.client2.query(query);
                }

                if (res.rows.length > 0) {
                    return res.rows[0].val;
                } else {
                    throw new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                throw new Error(`Error executing GET query: ${err.message}`);
            }
        } else {
            throw new Error(
                "The passed parameter is incorrect. Please pass a correct parameter."
            );
        }
    }

    async set(key: string, val: string, ttl: number): Promise<number | Error> {
        this.checkConnection();

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
                    res = await this.client1.query(query);
                } else {
                    res = await this.client2.query(query);
                }

                if (res?.rowCount && res?.rowCount > 0) {
                    return 1;
                } else {
                    throw new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                throw new Error(`Error executing SET query: ${err.message}`);
            }
        } else {
            throw new Error(
                "The passed parameters are incorrect. Please pass correct parameters."
            );
        }
    }

    async del(key: string): Promise<number | Error> {
        this.checkConnection();
        if (key) {
            const query = {
                text: "UPDATE kv_store SET expired_at=-1 WHERE key=$1 AND expired_at > EXTRACT(epoch FROM NOW());",
                values: [key],
            };

            try {
                const letter = key.charAt(0).toLowerCase();
                let res;

                if (letter <= "m") {
                    res = await this.client1.query(query);
                } else {
                    res = await this.client2.query(query);
                }

                if (res?.rowCount && res?.rowCount > 0) {
                    return 1;
                } else {
                    throw new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                throw new Error(
                    `Error executing DELETE query: ${err.message}`
                );
            }
        } else {
            throw new Error(
                "The passed parameter is incorrect. Please pass a correct parameter."
            );
        }
    }

    async expire(key: string, ttl: number): Promise<number | Error> {
        this.checkConnection();
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
                    res = await this.client1.query(query);
                } else {
                    res = await this.client2.query(query);
                }

                if (res?.rowCount && res?.rowCount > 0) {
                    return 1;
                } else {
                    throw new Error(`${key} not found!!\n`);
                }
            } catch (err: any) {
                throw new Error(
                    `Error executing EXPIRE query: ${err.message}`
                );
            }
        } else {
            throw new Error(
                "The passed parameters are incorrect. Please pass correct parameters."
            );
        }
    }
}

export default Enigma;
