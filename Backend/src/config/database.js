const mongoose = require("mongoose")
const dns = require("node:dns")

// Resolve SRV records using public DNS to avoid ISP/router ECONNREFUSED
try {
    dns.setServers(["8.8.8.8", "8.8.4.4"])
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