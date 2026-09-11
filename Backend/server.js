const dns = require("node:dns")
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"])
    dns.setDefaultResultOrder("ipv4first")
} catch (e) {}

require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")

connectToDB()


app.listen(3000, () => {
    console.log("Server is running on port 3000")
})