const title = document.getElementById('title');

let namesArr = ["jack", "ada", "mummy", "daddy"];

const randomiser = () => {
    const randomNamesArr = namesArr.sort(() => Math.random() - 0.5);
    const singleNameFromnamesArr = randomNamesArr[Math.floor(Math.random() * namesArr.length)];
    return singleNameFromnamesArr;
};

const getBuddy = () => {
    return randomiser();
};

const firstBuddy = getBuddy();

const getBuddy2 = () => {
    const secondBuddyArr = namesArr.filter(name => name !== firstBuddy);
    return secondBuddyArr[Math.floor(Math.random() * secondBuddyArr.length)];
};

const secondBuddy = getBuddy2();

title.innerHTML = `${firstBuddy} ❤️ ${secondBuddy}`;
