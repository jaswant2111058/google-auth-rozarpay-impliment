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
const static3 = path.join(__dirname,"./new registration")

 app.use(express.static(static1));
 app.use(express.static(static3));
 app.use(express.static(static2));



function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
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
    successRedirect: '/filldetail',
    failureRedirect: '/auth/google/failure'
  })
);


// app.post('/loged-in', async (req, res) => {
//   // const team_member_email=req.body.team_member_email;
//   // const team_member_name=req.body.team_member_name;
//  //const detail= {leader_name:req.user.displayName,leader_email:req.user.email,ima_url:req.user.picture,team_member_email:team_member_email,team_member_name:team_member_name} 
  
  
//   const detail= {leader_name:req.user.displayName,leader_email:req.user.email,img_url:req.user.picture}
//    const user = new schema(detail);
//     const adnew =user.save(); 
//   res.status(201).send(adnew);
//   console.log(adnew);
// });
  app.get('/filldetail',isLoggedIn,(req,res)=>{
    res.sendFile(static1+"/filldetail.html")
  })
app.post('/filldetail' , isLoggedIn, async (req,res)=>
{
    try{
  const team_member_email=req.body.tmname;
  const team_member_name=req.body.tmemail;
  
  const detail= {leader_name:req.user.displayName,leader_email:req.user.email,img_url:req.user.picture,team_member_email:team_member_email,team_member_name:team_member_name} 
  const usr = new schema(detail);
   const adnew = await usr.save();
  // res.send(adnew);
 res.send(`<html><h1>DETAIL<h1> <br><img src="${adnew.img_url}" <h3>LEARDER NAME : ${adnew.leader_name}</h3><br><h3>LEARDER EMAIL : ${adnew.leader_email}</h3><br><h3>TEAM MEMBER EMAIL : ${adnew.team_member_email}</h3><br><h3>TEAM MEMBER NAME : ${adnew.team_member_name}</h3><br><h3>PAYMENT : ${adnew.payment_status}</h3><html>`);
  res.status(201);
 
    }
      catch(error){
        res.status(400).send(error);
      }
})

app.get('/review', isLoggedIn,async (req, res) => {
  
   
        res.send('<html><h1>DETAIL<h1> <br><img src="${adnew.img_url}" <h3>LEARDER NAME : ${adnew.leader_name}</h3><br><h3>LEARDER EMAIL : ${adnew.leader_email}</h3><br><h3>TEAM MEMBER EMAIL : ${adnew.team_member_email}</h3><br><h3>TEAM MEMBER NAME : ${adnew.team_member_name}</h3><br><h3>PAYMENT : ${adnew.payment_status}</h3><html>')
  // res.sendFile(static1+'/filldetail.html');
 });

app.get('/payment', isLoggedIn,  (req, res) => {
  let options = {
    amount: 1,  // amount in the smallest currency unit
    currency: "INR",
    receipt: "order_rcptid_11"
  };
  instance.orders.create(options, function(err, order) {
    console.log(order);
    res.send({orderID:order.id})
  });
  // res.sendFile("");

})
app.post("/api/payment/verify", async (req,res)=>{

  let body=req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;
 
   var crypto = require("crypto");
   var expectedSignature = crypto.createHmac('sha256', 'lIhTEeoU53SwaQIlITg8qT2y')
                                   .update(body.toString())
                                   .digest('hex');
                                   console.log("sig received " ,req.body.response.razorpay_signature);
                                   console.log("sig generated " ,expectedSignature);
   var response = {"signatureIsValid":"false"}
   if(expectedSignature === req.body.response.razorpay_signature)
    response={"signatureIsValid":"true"}
    {
      try{
    const team_member_email=req.body.tmname;
    const team_member_name=req.body.tmemail;
    
    const detail= {leader_name:req.user.displayName,leader_email:req.user.email,img_url:req.user.picture,team_member_email:team_member_email,team_member_name:team_member_name} 
    const usr = new schema(detail);
     const adnew = await usr.save();
     res.send(adnew);
   //res.send(`<html><h1>DETAIL<h1> <br><img src="${adnew.img_url}" <h3>LEARDER NAME : ${adnew.leader_name}</h3><br><h3>LEARDER EMAIL : ${adnew.leader_email}</h3><br><h3>TEAM MEMBER EMAIL : ${adnew.team_member_email}</h3><br><h3>TEAM MEMBER NAME : ${adnew.team_member_name}</h3><br><h3>PAYMENT : ${adnew.payment_status}</h3><html>`);
    res.status(201);
   
      }
        catch(error){
          res.status(400).send(error);
        }
  }
       res.send(response);
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
