"use strict";
// Example on how to use the Enigma DB
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("../index"));
const enigmaInstance = new index_1.default("postgresql://localhost:8000/test1", "postgresql://localhost:8001/test1");
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield enigmaInstance.connect();
            let result1 = yield enigmaInstance.set("key1", "val1", 3600);
            console.log(result1);
            for (let i = 0; i < 5; i++) {
                let result2 = yield enigmaInstance.get("key1");
                console.log(result2);
            }
            let result3 = yield enigmaInstance.expire("key1", 1800);
            console.log(result3);
            let result4 = yield enigmaInstance.del("key1");
            console.log(result4);
        }
        catch (err) {
            console.error(err);
            // throw new Error(err);
        }
        finally {
            yield enigmaInstance.disconnect();
        }
    });
}
init();
