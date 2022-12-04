const mongoose = require("mongoose");

mongoose.connect("mongodb+srv://cluster0:8766263593%40Jk@cluster0.tjqmln6.mongodb.net/jassi",


).then(()=> console.log("connected ...."))
.catch(()=>console.log("not connected"));