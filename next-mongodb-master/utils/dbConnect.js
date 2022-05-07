import mongoose from 'mongoose';
//import * as mongoose from "mongoose";
const connection = {};
let url = "mongodb+srv://rafajtomas:rafajtomas@rafajbp.px0k8.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

async function dbConnect() {
    if (connection.isConnected) {
        return;
    }
    const source = process.env.MONGO_URI
    console.log(source)
    const db = await mongoose.connect(source, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    connection.isConnected = db.connections[0].readyState;
}

export default dbConnect;