import mongoose from "mongoose";

const db=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Database connected sucessfully!")
    }catch(error){
        console.log("Error connecting database:",error);
        process.exit(1)
    }
}

export default db;