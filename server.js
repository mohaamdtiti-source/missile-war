const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.post("/register", async (req, res) => {

const { username, password } = req.body;

if (!username || !password) {
return res.status(400).json({
error: "نام کاربری و رمز لازم است"
});
}

try {

const hashedPassword =
await bcrypt.hash(password, 10);

db.run(
"INSERT INTO users(username,password) VALUES(?,?)",
[username, hashedPassword],
function(err){

if(err){
return res.status(400).json({
error:"این نام کاربری قبلاً ثبت شده"
});
}

res.json({
success:true,
message:"ثبت نام موفق"
});

}
);

} catch {

res.status(500).json({
error:"خطای سرور"
});

}

});

app.post("/login",(req,res)=>{

const { username,password } = req.body;

db.get(
"SELECT * FROM users WHERE username=?",
[username],
async (err,user)=>{

if(err || !user){
return res.status(400).json({
error:"نام کاربری یا رمز اشتباه است"
});
}

const match =
await bcrypt.compare(
password,
user.password
);

if(!match){
return res.status(400).json({
error:"نام کاربری یا رمز اشتباه است"
});
}

res.json({
success:true,
username:user.username
});

}
);

});

app.get("/player/:username",(req,res)=>{

db.get(
`SELECT
username,
money,
iron,
fuel,
missiles,
factory,
fuelPlant,
defense
FROM users
WHERE username=?`,
[req.params.username],
(err,user)=>{

if(err){
return res.status(500).json({
error:"خطای دیتابیس"
});
}

if(!user){
return res.status(404).json({
error:"بازیکن پیدا نشد"
});
}

res.json(user);

}
);

});

app.post("/collect",(req,res)=>{

const { username } = req.body;

db.run(
`UPDATE users
SET
money = money + (500 * factory),
iron = iron + (200 * factory),
fuel = fuel + (100 * fuelPlant)
WHERE username=?`,
[username],
(err)=>{

if(err){
return res.status(500).json({
error:"خطا"
});
}

db.get(
"SELECT money,iron,fuel FROM users WHERE username=?",
[username],
(err,user)=>{

res.json({
success:true,
money:user.money,
iron:user.iron,
fuel:user.fuel
});

}
);

}
);

});

app.post("/build-missile",(req,res)=>{

const { username } = req.body;

db.get(
"SELECT iron,fuel,missiles FROM users WHERE username=?",
[username],
(err,user)=>{

if(user.iron < 300 || user.fuel < 150){
return res.json({
error:"منابع کافی نیست"
});
}

db.run(
`UPDATE users
SET
iron = iron - 300,
fuel = fuel - 150,
missiles = missiles + 1
WHERE username=?`,
[username],
()=>{

res.json({
success:true
});

}
);

}
);

});

app.post("/upgrade-factory",(req,res)=>{

const { username } = req.body;

db.get(
"SELECT money,factory FROM users WHERE username=?",
[username],
(err,user)=>{

const cost =
user.factory * 2000;

if(user.money < cost){
return res.json({
error:"پول کافی نیست"
});
}

db.run(
`UPDATE users
SET
money = money - ?,
factory = factory + 1
WHERE username=?`,
[cost,username],
()=>{

res.json({
success:true
});

}
);

}
);

});

app.post("/upgrade-fuel",(req,res)=>{

const { username } = req.body;

db.get(
"SELECT money,fuelPlant FROM users WHERE username=?",
[username],
(err,user)=>{

const cost =
user.fuelPlant * 1800;

if(user.money < cost){
return res.json({
error:"پول کافی نیست"
});
}

db.run(
`UPDATE users
SET
money = money - ?,
fuelPlant = fuelPlant + 1
WHERE username=?`,
[cost,username],
()=>{

res.json({
success:true
});

}
);

}
);

});

app.post("/upgrade-defense",(req,res)=>{

const { username } = req.body;

db.get(
"SELECT money,defense FROM users WHERE username=?",
[username],
(err,user)=>{

const cost =
user.defense * 2500;

if(user.money < cost){
return res.json({
error:"پول کافی نیست"
});
}

db.run(
`UPDATE users
SET
money = money - ?,
defense = defense + 1
WHERE username=?`,
[cost,username],
()=>{

res.json({
success:true
});

}
);

}
);

});

const PORT =
process.env.PORT || 3000;

app.listen(PORT,()=>{

console.log(
"Missile War Running On Port " + PORT
);

});
