import mongoose from "mongoose";
//TODO: Add validations

let contact_schema = new mongoose.Schema({
    contact_last_name: {
        type:String,
        required:true
    },
    contact_first_name: {
        type:String,
        required:true
    },
    contact_email: {
        type:String,
        required:true
    },

    contact_phone_number: {
        type:String,
        required:true
    },

    contact_type: {
        type:String,
        enum: ["general", "payment", "account"]
    },

    contact_message: {
        type:String,
        required:true
    },

    contact_support_file: {
        type:String,
        required:false
    }

})

export default mongoose.model("Contact", contact_schema);