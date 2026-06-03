import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getKB = () => {
    const data = fs.readFileSync(
        path.join(__dirname, "data/fake-job.json"),
        "utf-8"
    );

    return JSON.parse(data);
};