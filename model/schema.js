const mongoose=require("mongoose");

const userschema=new mongoose.Schema({
    leader_name:{
        type:String,
    },
    leader_email:{
        type:String,
      // unique:[true,"email already exist"]
    },
    img_url:{
        type:String,
       
    },
    team_member_email:{
        type:String,
     //   unique:[true,"email already exist"]
        
         },
    team_member_name:{
        type:String,
    
    },
    payment_status:{
        type:Boolean,
    
    }
});
const usr= new mongoose.model("users",userschema);
module.exports=usr;