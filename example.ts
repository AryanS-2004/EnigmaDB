import Enigma from "./index";

const enigmaInstance = new Enigma();

async function init(): Promise<void> {
    await enigmaInstance.connect();

    let result1: number | Error = await enigmaInstance.set(
        "key1",
        "val1",
        3600
    );
    console.log(result1);

    for (let i = 0; i < 5; i++) {
        let result2: string | Error = await enigmaInstance.get("key1");
        console.log(result2);
    }

    let result3: number | Error = await enigmaInstance.expire("key1", 1800);
    console.log(result3);

    let result4: number | Error = await enigmaInstance.del("key1");
    console.log(result4);

    await enigmaInstance.disconnect();
}

init();
