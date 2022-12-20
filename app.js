const express = require('express');
const app = express();
const session = require('express-session');
const passport = require('passport');
const port = process.env.PORT||5000;
require('./auth');
app.set("view engine",'ejs');
const path = require("path");
require("./connection/conn");
app.use(express.json());
app.use(express.urlencoded({extended:false}));
const schema = require("./model/schema")
const Razorpay=require("razorpay");
var instance = new Razorpay({
  key_id: 'rzp_test_lIAffka8ZIqfaU',
  key_secret: 'lIhTEeoU53SwaQIlITg8qT2y',
});
//const adnew={};


const static1 = path.join(__dirname,"./login")
const static2 = path.join(__dirname,"./home_page")
const static3 = path.join(__dirname,"./public")

 app.use(express.static(static1));
 app.use(express.static(static3));
 app.use(express.static(static2));



function isLoggedIn(req, res, next) {
  req.user ? next() : res.redirect("/login");
}
function emailverification(req,res,next)
{
  var email = req.user.email;
  let l= email.length;
  let mail="";
  for(let i=l;i>l-12;i--)
  {
      mail = email[i]+mail;
  }
  if(mail=="akgec.ac.inundefined")
  {
    next();
  }
  else res.send("you are not the part of akgec.ac.in")

}

app.use(session({ secret: 'jassi', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());


app.get("/",function(req,res){

  res.sendFile(static2+"/home_page.html");
})


 app.get('/login', (req, res) => {
  res.sendFile(static1+'/login.html');
});

app.get('/auth/google',
  passport.authenticate('google', { scope: [ 'email', 'profile' ] }
));

app.get( '/auth/google/callback',
  passport.authenticate( 'google', {
    successRedirect: '/filldetails',
    failureRedirect: '/auth/google/failure'
  })
);


  app.get('/filldetails',isLoggedIn,emailverification, async (req,res)=>{

            






    // const adnew = await schema.findOne({leader_email:req.user.email});
    //       if(adnew){
    //       res.sendFile(static1+"/filldetail.html")
    //      //  res.send("eamil allready register")
    //       }
    //       else{
                 
    //   res.sendFile(static1+"/filldetail.html")
    // // res.send("eamil allready register")
    //       }
      res.sendFile(static1+"/filldetail.html");
  })
app.post('/filldetail', isLoggedIn,emailverification, async (req,res)=>
{

  const team_member_email=req.body.tmname;
  const team_member_name=req.body.tmemail;
  const detail= {leader_name:req.user.displayName,leader_email:req.user.email,img_url:req.user.picture,team_member_email:team_member_email,team_member_name:team_member_name,payment_status:"unseccessful",razorpay_order_id:"none",razorpay_payment_id:"none",razorpay_signature:"none"} 
  
    try{
  const usr = new schema(detail);
   const adnew = await usr.save();
  // res.status(201).send(adnew);
  res.redirect("/create/orderId") 
// res.sendFile(static1+"/pay.html");
    }
      catch(error){
        res.status(400).send(error);
      }
})



app.post('/review', isLoggedIn,emailverification,async (req, res) => {

   //res.send(`<html><h1>DETAIL<h1> <br><img src="${adnew.img_url}" <h5>LEARDER NAME : ${adnew.leader_name}</h3><br><h3>LEARDER EMAIL : ${adnew.leader_email}</h5><br><h5>TEAM MEMBER EMAIL : ${adnew.team_member_email}</h5><br><h5>TEAM MEMBER NAME : ${adnew.team_member_name}</h5><br><h5>PAYMENT : ${adnew.payment_status}</h5><html>`)
  // res.sendFile(static1+'/filldetail.html');
 // const detail= {leader_name:req.user.displayName,leader_email:req.user.email,img_url:req.user.picture,payment_status:payment_status} 
  const keep = await schema.updateOne({leader_email:req.user.email},{payment_status:"successfull"});
   const adnew = await schema.findOne({leader_email:req.user.email});
   res.send(adnew);
 });

app.get('/create/orderId', isLoggedIn,emailverification,  async (req, res) => {
  
  let options = {
    amount: 2000,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, async function(err, order) {
    console.log(order);
   // res.send({orderId:order.id})
    try{
     await schema.updateOne({leader_email:req.user.email},{razorpay_order_id:order.id});
     const adnew = await schema.findOne({leader_email:req.user.email});
    //res.send(adnew);
    res.render("payment",{order:order.id,adnew});
    }
    catch(e){
    console.log("error");
    }
  });
 

})
app.post("/api/payment/verify", async (req,res)=>{

  //const adnew = await schema.findOne({leader_email:req.user.email})
  let body=req.body.razorpay_order_id + "|" + req.body.razorpay_payment_id;
 
   var crypto = require("crypto");
   var expectedSignature = crypto.createHmac('sha256', 'lIhTEeoU53SwaQIlITg8qT2y')
                                   .update(body.toString())
                                   .digest('hex');
                                   console.log("sig received " ,req.body.razorpay_signature);
                                   console.log("sig generated " ,expectedSignature);
   var response = {"signatureIsValid":"false"}
   if(expectedSignature === req.body.razorpay_signature)
   
 {
  const keep = await schema.updateOne({leader_email:req.user.email},{payment_status:"successfull",razorpay_signature:"verified",razorpay_payment_id:req.body.razorpay_payment_id});
  const adnew = await schema.findOne({leader_email:req.user.email});
 
  res.send(adnew);
 }
      else 
     { const keep = await schema.updateOne({leader_email:req.user.email},{payment_status:"unsuccessfull"});
   //  console.log(req.body.razorpay_order_id,req.body.razorpay_payment_id,req.body.razorpay_signature);
     res.send("payment is not veryfied");
}
   
  
       
   });
app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.listen(port, () => console.log('listening on port: 5000'));
