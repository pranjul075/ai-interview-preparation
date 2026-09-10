const mongoose = require("mongoose")



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