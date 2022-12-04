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
const schema = require("./model/schema");
const adnew={};


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
    successRedirect: '/loged-in',
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
  app.get('/loged-in',isLoggedIn,(req,res)=>{
    res.sendFile(static1+"/filldetail.html")
  })
app.post('/filldetail' , isLoggedIn, async (req,res)=>
{
    try{
  const team_member_email=req.body.tmname;
  const team_member_name=req.body.tmemail;
  
  const detail= {leader_name:req.user.displayName,leader_email:req.user.email,img_url:req.user.picture,team_member_email:team_member_email,team_member_name:team_member_name} 
  const usr = new schema(detail);
    adnew = await usr.save();
   //res.send(adnew);
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

app.get('/payment', isLoggedIn, (req, res) => {
  res.sendFile("");
})

app.get('/logout', (req, res) => {
  req.logout();
  req.session.destroy();
  res.send('Goodbye!');
});

app.get('/auth/google/failure', (req, res) => {
  res.send('Failed to authenticate..');
});

app.listen(port, () => console.log('listening on port: 5000'));
