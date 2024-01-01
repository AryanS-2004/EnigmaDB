# Enigma DB

Enigma DB is a versatile, lightweight database built on top of PostgreSQL, transforming your relational database into a powerful key-value store. This project is designed to provide a convenient interface, allowing users to interact with their database using simple commands.

## Features

- **Key-Value Storage**: Seamlessly utilize your PostgreSQL database as a key-value store. Enigma DB efficiently manages keys and their corresponding values, making it easy to store, retrieve, and manipulate data.

- **Sharding for Performance**: Enigma DB intelligently shards the data across two PostgreSQL servers, optimizing performance by distributing keys based on their initial letter.

- **CRON Job for Cleanup**: Keep your database clean and efficient with a CRON job that periodically deletes expired keys, ensuring optimal performance and resource utilization.

- **Integration with Existing Database**: Easily integrate Enigma DB with your existing PostgreSQL database, turning it into a dynamic key-value store.


## Getting Started

To get started with Enigma DB, follow these simple steps:

1. **Installation**: Install the necessary dependencies.

```bash
npm install enigma-db   
```

2. **Configure PostgreSQL Servers**

Start and Configure two PostgreSQL servers.



## Example

Use Enigma DB in normal mode by incorporating it into your TypeScript/JavaScript code. Below is an example:


```typescript
import Enigma from "enigma-db";

const enigmaInstance = new Enigma("postgresql://localhost:8000/test1", "postgresql://localhost:8001/test1");

async function init(): Promise<Error | void> {
    try {
        await enigmaInstance.connect();
        let result1: number | Error = await enigmaInstance.set("key1", "val1", 3600);
        console.log(result1);
        for (let i = 0; i < 5; i++) {
            let result2: string | Error = await enigmaInstance.get("key1");
            console.log(result2);
        }
        let result3: number | Error = await enigmaInstance.expire("key1", 1800);
        console.log(result3);

        let result4: number | Error = await enigmaInstance.del("key1");
        console.log(result4);

    } catch (err: any) {
        console.error(err);
        // throw new Error(err);
    } finally {
        await enigmaInstance.disconnect();
    }
}
init();
```
