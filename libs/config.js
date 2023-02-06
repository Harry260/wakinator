import { readFile } from "fs/promises";
const json = JSON.parse(
	await readFile(new URL("../config.json", import.meta.url))
);

export default json;
