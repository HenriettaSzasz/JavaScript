// 1. Considitonals

let a = 5;
let b = -1;
let c = -2;

if (a * b * c < 0) {
    console.log('MINUS');
}
else {
    console.log('PLUS');
}


let box = 200;
switch (box) {
    case 10: console.log('A pen'); break;
    case 200: console.log('A cat'); break;
    case 3000: console.log('A dog'); break;
    case 40000: console.log('A horse'); break;
    case 5000000: console.log('A car'); break;
    default: console.log('A truckload of bunnies');
}


// 2. Loops

let sum = 0;
let n = 1000;

for (i = 1; i < n; i++) {
    sum += i;
}
console.log(sum);

let number = 500;
while (number < 10000) {
    number *= Math.random() * 10;
}

// 3. Arrays

let myArray = []

for (let i = 0; i < 50; i++) {
    myArray[i] = i;
}

myArray.push(89, 99, 120, 412, 124)

myArray.pop()


// 4. Objects

let object = { age: 21, 'first-name': 'Gigel', 'last-name': 'Gica' }

// 6. Functions

let fn = function (a, b, c) {
    if (a * b * c < 0) {
        console.log('MINUS');
    }
    else {
        console.log('PLUS');
    }
}

let divide3 = function (array) {
    array.forEach(element => {
        if (element % 3 !== 0) {
            console.log(element)
        }
    });
}

// 7. Classes

class Human {

    constructor(name) {
        this.fullName = name;
    }

    sayHi() {
        console.log('HI I\'M ' + this.name);
    }

}

let me = new Human('Heni')