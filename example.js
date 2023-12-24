const Enigma = require("./index");

const enigmaInstance = new Enigma();

async function init() {
    await enigmaInstance.connect();

    await enigmaInstance.set("key1", "value1", 3600);
    for (let i = 0; i < 10000; i++) {
        let result = await enigmaInstance.get("key1");
        console.log(result);
    }
    await enigmaInstance.disconnect();
}

init();
