const mongoose = require("mongoose")
const dns = require("node:dns")

// Resolve SRV records using public DNS and force IPv4 to avoid ISP ECONNREFUSED & TLS alert 80
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"])
    dns.setDefaultResultOrder("ipv4first")
} catch (e) {
    // Ignore if custom DNS servers cannot be set
}



async function connectToDB() {

    try {
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI
        await mongoose.connect(uri)

        console.log("Connected to Database")
    }
    catch (err) {
        console.log(err)
    }
}

module.exports = connectToDB