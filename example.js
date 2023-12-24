const Enigma = require("./index");

const enigmaInstance = new Enigma();

async function init() {
    await enigmaInstance.connect();

    let result = await enigmaInstance.set("key1", "val1", 3600);
    console.log(result);
    for (let i = 0; i < 5; i++) {
        let result = await enigmaInstance.get("key1");
        console.log(result);
    }
    result = await enigmaInstance.del("key1");
    console.log(result);
    await enigmaInstance.disconnect();
}

init();
