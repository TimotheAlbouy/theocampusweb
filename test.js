const bcrypt = require("bcrypt");

const password = "admin";
const saltRounds = 10;
console.log(bcrypt.hashSync(password, saltRounds));