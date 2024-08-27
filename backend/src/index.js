import { app } from "./app.js";
import dotenv from "dotenv"
import connectDB from "./db/index.js";


dotenv.config({
    path: "./.env"
})

connectDB()
    .then(() => {
        app.on('error', (error) => {
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT || 8001, () => {
            console.log(`localhost is running on ${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log("MongoDB Connection Failed ", err);

    })

app.get("/", (req, res) => {
    res.send("Hello backend")
})

