const express = require("express");
const bcrypt = require("bcrypt");
const path = require("path");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/status", (req, res) => {
res.json({
status: "online",
game: "Missile War"
});
});

// ثبت نام
app.post("/register", async (req, res) => {

const { username, password } = req.body;

if (!username || !password) {
return res.status(400).json({
error: "نام کاربری و رمز عبور لازم است"
});
}

try {

const hashedPassword =
await bcrypt.hash(password, 10);

db.run(
"INSERT INTO users (username,password) VALUES (?,?)",
[username, hashedPassword],
function(err) {

if (err) {
return res.status(400).json({
error: "این نام کاربری قبلاً ثبت شده"
});
}

res.json({
success: true,
message: "ثبت نام موفق"
});

}
);

} catch {

res.status(500).json({
error: "خطای سرور"
});

}

});

// ورود
app.post("/login", (req, res) => {

const { username, password } = req.body;

db.get(
"SELECT * FROM users WHERE username=?",
[username],
async (err, user) => {

if (err || !user) {
return res.status(400).json({
error: "نام کاربری یا رمز اشتباه است"
});
}

const match =
await bcrypt.compare(
password,
user.password
);

if (!match) {
return res.status(400).json({
error: "نام کاربری یا رمز اشتباه است"
});
}

res.json({
success: true,
username: user.username,
message: "ورود موفق"
});

}
);

});

// اطلاعات بازیکن
app.get("/player/:username", (req, res) => {

const username = req.params.username;

db.get(
"SELECT * FROM users WHERE username=?",
[username],
(err, user) => {

if (err) {
return res.status(500).json({
error: "خطای دیتابیس"
});
}

if (!user) {
return res.status(404).json({
error: "بازیکن پیدا نشد"
});
}

res.json(user);

}
);

});

// جمع آوری منابع
app.post("/collect", (req, res) => {

const { username } = req.body;

db.run(
"UPDATE users SET money=money+500, iron=iron+200, fuel=fuel+100 WHERE username=?",
[username],
function(err) {

if (err) {
return res.json({
error: "خطا در جمع آوری منابع"
});
}

db.get(
"SELECT money,iron,fuel FROM users WHERE username=?",
[username],
(err, user) => {

res.json({
success: true,
money: user.money,
iron: user.iron,
fuel: user.fuel
});

}
);

}
);

});

// ساخت موشک
app.post("/build-missile", (req,res)=>{

const { username } = req.body;

db.get(
"SELECT iron,fuel FROM users WHERE username=?",
[username],
(err,user)=>{

if(err || !user){
return res.json({
error:"بازیکن پیدا نشد"
});
}

if(user.iron < 100 || user.fuel < 50){
return res.json({
error:"منابع کافی نیست"
});
}

db.run(
"UPDATE users SET missiles=missiles+1, iron=iron-100, fuel=fuel-50 WHERE username=?",
[username]
);

res.json({
success:true
});

});

});

// ارتقای کارخانه
app.post("/upgrade-factory",(req,res)=>{

const { username } = req.body;

db.run(
"UPDATE users SET factory=factory+1, money=money-1000 WHERE username=? AND money>=1000",
[username],
function(){

if(this.changes===0){
return res.json({
error:"پول کافی نیست"
});
}

res.json({
success:true
});

}
);

});

// ارتقای پالایشگاه
app.post("/upgrade-fuel",(req,res)=>{

const { username } = req.body;

db.run(
"UPDATE users SET fuelPlant=fuelPlant+1, money=money-1000 WHERE username=? AND money>=1000",
[username],
function(){

if(this.changes===0){
return res.json({
error:"پول کافی نیست"
});
}

res.json({
success:true
});

}
);

});

// ارتقای دفاع
app.post("/upgrade-defense",(req,res)=>{

const { username } = req.body;

db.run(
"UPDATE users SET defense=defense+1, money=money-1000 WHERE username=? AND money>=1000",
[username],
function(){

if(this.changes===0){
return res.json({
error:"پول کافی نیست"
});
}

res.json({
success:true
});

}
);

});

const PORT = 3000;

app.listen(PORT, () => {
console.log("Server running on port " + PORT);
});