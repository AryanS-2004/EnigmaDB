# Enigma DB

Enigma DB is a versatile, lightweight layer built on top of PostgreSQL, transforming your relational database into a powerful key-value store. This project is designed to provide a convenient and interactive interface, allowing users to interact with their database using simple commands through a Command Line Interface (CLI).

## Features

- **Interactive CLI**: Enigma DB comes with a user-friendly Command Line Interface that allows users to easily interact with their PostgreSQL database using basic commands.

- **Key-Value Storage**: Seamlessly utilize your PostgreSQL database as a key-value store. Enigma DB efficiently manages keys and their corresponding values, making it easy to store, retrieve, and manipulate data.

- **Sharding for Performance**: Enigma DB intelligently shards the data across two PostgreSQL servers, optimizing performance by distributing keys based on their initial letter.

- **CRON Job for Cleanup**: Keep your database clean and efficient with a CRON job that periodically deletes expired keys, ensuring optimal performance and resource utilization.

## Getting Started

To get started with Enigma DB, follow these simple steps:

1. **Installation**: Install the necessary dependencies and configure your PostgreSQL servers by providing their respective connection strings in the `env.ts` file.

2. **Creating Tables**: Run the provided initialization script to create the required tables for Enigma DB.

3. **Interactive Mode**: Launch Enigma DB in interactive mode to start issuing commands using the CLI. Supported commands include GET, SET, DELETE, and EXPIRE.

4. **Integration with Existing Database**: Easily integrate Enigma DB with your existing PostgreSQL database, turning it into a dynamic key-value store.

## Example Usage

```typescript
import Enigma from "./index";

const enigmaInstance = new Enigma();

async function init(): Promise<void> {
    await enigmaInstance.connect();

    // Perform key-value operations
    let result = await enigmaInstance.set("key1", "val1", 3600);
    console.log(result);

    for (let i = 0; i < 5; i++) {
        result = await enigmaInstance.get("key1");
        console.log(result);
    }

    result = await enigmaInstance.expire("key1", 1800);
    console.log(result);

    result = await enigmaInstance.del("key1");
    console.log(result);

    await enigmaInstance.disconnect();
}

init();
