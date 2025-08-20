const addButton = document.getElementById('add-button');
const deleteButton = document.getElementById('delete-button');
const nameInput = document.getElementById('name-input');
const teamInput = document.getElementById('team-input');
const buttonGenerator = document.getElementById('buttonGenerator');
const output = document.getElementById('output-section');
const resetButton = document.getElementById('reset');
const switchButton = document.getElementById('switch');
const deleteAll = document.getElementById('delete-all');
const dialogBox = document.getElementById('confirm-deleteAll-dialog');
const deleteAllModalBtn = document.getElementById('yesDelete-Modal-btn');
let employeeName;
let employeeTeam;

window.onload = () => {
    const newEmployeeList = JSON.parse(localStorage.getItem('addedEmployeeList'));
    console.log(employeeList);
};

let employeeList = JSON.parse(localStorage.getItem('addedEmployeeList')) || {
    // 1: { employee: "Erkan Said", team: "EO" },
    // 2: { employee: "Joe Hicks", team: "EO" },
    // 3: { employee: "Kainat Hussein", team: "EO" },
    // 4: { employee: "Rebecca Corey", team: "EO" },
    // 5: { employee: "Will Smith", team: "EO" },
    // 6: { employee: "Nichola Bolton", team: "LEO" },
    // 7: { employee: "Elliot Thornton", team: "NSPOC" },
    // 8: { employee: "Chris Campbell", team: "PNT" },
    // 9: { employee: "Stephen Strauss", team: "PNT" },
    // 10: { employee: "Bill Jones", team: "NSPOC" },
};

// / Create a shuffled list (array) of employee IDs
const availableIds = () => {
    return Object.keys(employeeList) //This gives you an array of all the keys from the object. They are strings by default.
        .map(Number) // converts the strings in the new array to numbers
        .sort(() => Math.random() - 0.5); // This is a common trick to shuffle an array randomly
};

let shuffledIds = availableIds();

// Get next random number without repeating
const randomNumber = () => {
    if (!shuffledIds || shuffledIds.length === 0) {
        alert("All buddy's matched!");
        return null;
    }

    return shuffledIds.pop(); // removes first ID in array and returns    
};

addButton.addEventListener('click', (event) => {
    event.preventDefault() //stops the page refreshing

    let employeeName = nameInput.value.trim();

    if (!employeeName) {
        alert("Please enter a name to add employee.");
        return;
    }

    const newId = Object.keys(employeeList).length + 1;

    employeeList[newId] = {
        employee: employeeName,
    }

    shuffledIds = availableIds(); // Refresh the list with new employee added

    nameInput.value = "";

    output.innerHTML += `<div class="text-center" style="font-size: 24px">${employeeName}</div><br>`;


    console.log(employeeList);


    localStorage.setItem('addedEmployeeList', JSON.stringify(employeeList));
});

deleteButton.addEventListener('click', (event) => {
    event.preventDefault()

    let inputtedName = String(nameInput.value.trim());

    if (!inputtedName) {
        alert("Please enter a name to delete employee.");
        return;
    }

    const entry = Object.entries(employeeList).find(
        ([key, value]) => value.employee.toLowerCase() === inputtedName.toLowerCase()
    );

    if (entry) {
        const [id] = entry;
        delete employeeList[id];
        console.log(employeeList);
    } else {
        console.log("Employee not found");
    }

    nameInput.value = "";

    localStorage.setItem('addedEmployeeList', JSON.stringify(employeeList));
})

const getBuddy = () => {
    const employeeId = randomNumber();
    if (!employeeId) return null;

    const name = employeeList[employeeId].employee;
    delete employeeList[employeeId];
    return name;
};

const getBuddy2 = () => {
    const employeeId = randomNumber();
    if (!employeeId) {
        return null;
    }

    const name = employeeList[employeeId].employee;
    delete employeeList[employeeId];
    return name;
};

const getBuddy3 = () => {
    const employeeId = randomNumber();
    if (!employeeId) {
        return null;
    }

    const name = employeeList[employeeId].employee;
    delete employeeList[employeeId];
    return name;
};

const matchGenerator = () => {
    const employeeListLength = Object.keys(employeeList).length;

    if (employeeListLength === 3) {
        const buddy1 = getBuddy();
        const buddy2 = getBuddy2();
        const buddy3 = getBuddy3();

        output.innerHTML += `<div class="text-center" style="font-size: 24px">${buddy1} ❤️ ${buddy2} ❤️ ${buddy3}</div><br>`;
        return;
    }

    if (employeeListLength >= 2) {
        const buddy1 = getBuddy();
        const buddy2 = getBuddy2();

        output.innerHTML += `<div class="text-center" style="font-size: 24px">${buddy1} ❤️ ${buddy2}</div><br>`;
    }

    if (employeeListLength === 1) {
        const lastId = Object.keys(employeeList)[0];
        const lastName = employeeList[lastId].employee;

        output.innerHTML += `<div class="text-center text-muted" style="font-size: 20px">${lastName} has no match 😢</div><br>`;
        delete employeeList[lastId];
    }
};

const matchGeneratorQuick = () => {
    while (Object.keys(employeeList).length > 1) {
        matchGenerator();
    };
};

resetButton.addEventListener('click', () => {
    location.reload();
});

buttonGenerator.addEventListener('click', () => {
    if (!switchButton.checked) {
        while (output.hasChildNodes()) {
            output.removeChild(output.firstChild);
        }
        matchGenerator();
    } else {
        while (output.hasChildNodes()) {
            output.removeChild(output.firstChild);
        }
        matchGeneratorQuick();
    };
});

deleteAll.addEventListener('click', () => {
    dialogBox.showModal();
});

deleteAllModalBtn.addEventListener('click', () => {
    let employeeListArr = Object.keys(employeeList);

    for (let i = employeeListArr.length; i == employeeListArr.length; i--) {
        employeeListArr.shift();
    };

    while (output.hasChildNodes()) {
        output.removeChild(output.firstChild);
    }

    console.log(employeeListArr);

    localStorage.clear();
});