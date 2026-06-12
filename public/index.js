let money = 1000;
let iron = 500;
let fuel = 300;
let missiles = 0;

function updateUI(){
document.getElementById("money").innerText = money;
document.getElementById("iron").innerText = iron;
document.getElementById("fuel").innerText = fuel;
}

function collectResources(){

money += 500;
iron += 200;
fuel += 100;

updateUI();

document.getElementById("result").innerText =
"منابع جمع آوری شد";

}

function buildMissile(){

if(iron < 100 || fuel < 50){
document.getElementById("result").innerText =
"منابع کافی نیست";
return;
}

iron -= 100;
fuel -= 50;
missiles++;

updateUI();

document.getElementById("result").innerText =
"یک موشک ساخته شد 🚀";

}

updateUI();
