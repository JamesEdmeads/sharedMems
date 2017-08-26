var scrypt = require("scrypt");
var scryptParameters = scrypt.paramsSync(0.1);
var key = new Buffer("this is a key");

var kdfResult = scrypt.kdfSync("password", scryptParameters);

console.log("Synchronous result: "+kdfResult.toString("hex"));

console.log(scrypt.verifyKdfSync(kdfResult, "password"));
