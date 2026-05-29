const fs = require("fs");
const path = require("path");

const getKB = () => {
    const data = fs.readFileSync(
        path.join(__dirname, "data/fakeJobScam.json"),
        "utf-8"
    );
    return JSON.parse(data);
};

module.exports = { getKB };