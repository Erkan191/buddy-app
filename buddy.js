// --- DOM ELEMENTS ---
const addButton = document.getElementById('add-button');
const deleteButton = document.getElementById('delete-button');
const nameInput = document.getElementById('name-input');
const showNamesButton = document.getElementById('show-names'); // optional button
const buttonGenerator = document.getElementById('buttonGenerator');
const namesListDiv = document.getElementById('names-list'); // shows newly added names
const matchesDiv = document.getElementById('matches'); // shows pairings/trios
const resetButton = document.getElementById('reset');
const deleteAll = document.getElementById('delete-all');
const dialogBox = document.getElementById('confirm-deleteAll-dialog');
const deleteAllModalBtn = document.getElementById('yesDelete-Modal-btn');

// --- DATA ---
let employeeList = JSON.parse(localStorage.getItem('addedEmployeeList')) || {};
let sessionPool = []; // temporary pool for current matching session

// --- UTILITY FUNCTIONS ---
const renderNamesList = () => {
    namesListDiv.innerHTML = '';
    Object.values(employeeList).forEach(e => {
        const div = document.createElement('div');
        div.textContent = e.employee;
        div.style.fontSize = "24px";
        div.classList.add("text-center");
        div.style.opacity = 0; // fade-in
        namesListDiv.appendChild(div);
        setTimeout(() => {
            div.style.transition = "opacity 0.8s";
            div.style.opacity = 1;
        }, 50);
    });
};

const fadeOutNamesList = () => {
    if (namesListDiv.children.length === 0) return;
    namesListDiv.style.transition = "opacity 0.8s";
    namesListDiv.style.opacity = 0;
    setTimeout(() => {
        namesListDiv.innerHTML = '';
        namesListDiv.style.opacity = 1;
    }, 800);
};

const initializeSessionPool = () => {
    sessionPool = Object.entries(employeeList).map(([key, value]) => [key, value]);
};

const pickRandomFromSession = () => {
    if (sessionPool.length === 0) return null;
    const index = Math.floor(Math.random() * sessionPool.length);
    return sessionPool.splice(index, 1)[0];
};

// --- BUTTON FUNCTIONS ---
addButton.addEventListener('click', (event) => {
    event.preventDefault();
    const employeeName = nameInput.value.trim();
    if (!employeeName) {
        alert("Please enter a buddy name to add.");
        return;
    }

    const newId = Object.keys(employeeList).length + 1;
    employeeList[newId] = { employee: employeeName };
    localStorage.setItem('addedEmployeeList', JSON.stringify(employeeList));
    nameInput.value = "";

    // Show the newly added buddy immediately at the top
    const div = document.createElement('div');
    div.textContent = employeeName;
    div.style.fontSize = "24px";
    div.classList.add("text-center");
    div.style.opacity = 0;
    namesListDiv.appendChild(div);
    setTimeout(() => {
        div.style.transition = "opacity 0.8s";
        div.style.opacity = 1;
    }, 50);
});

deleteButton.addEventListener('click', (event) => {
    event.preventDefault();
    const inputName = nameInput.value.trim();
    if (!inputName) {
        alert("Please enter a buddy name to delete.");
        return;
    }

    const entry = Object.entries(employeeList).find(
        ([key, value]) => value.employee.toLowerCase() === inputName.toLowerCase()
    );
    if (entry) {
        const [id] = entry;
        delete employeeList[id];
        localStorage.setItem('addedEmployeeList', JSON.stringify(employeeList));
        renderNamesList();
    } else {
        alert("Buddy not found");
    }

    nameInput.value = "";
});

showNamesButton.addEventListener('click', () => {
    if (Object.keys(employeeList).length === 0) {
        alert("No buddies available. Please add some!");
        return;
    }
    renderNamesList();
});

// --- MATCH GENERATION ---
const generateAllMatches = () => {
    if (Object.keys(employeeList).length === 0) {
        alert("Please add some buddies before generating matches!");
        return;
    }

    // fade out names list showing added buddies
    if (namesListDiv.children.length > 0) fadeOutNamesList();

    // clear previous matches
    matchesDiv.innerHTML = '';

    // initialize session pool
    initializeSessionPool();

    if (sessionPool.length === 0) {
        alert("No buddies to match!");
        return;
    }

    while (sessionPool.length > 0) {
        if (sessionPool.length >= 3) {
            const buddy1 = pickRandomFromSession();
            const buddy2 = pickRandomFromSession();
            matchesDiv.innerHTML += `<div class="text-center" style="font-size:24px">${buddy1[1].employee} ❤️ ${buddy2[1].employee}</div><br>`;
        } else if (sessionPool.length === 2) {
            const buddy1 = pickRandomFromSession();
            const buddy2 = pickRandomFromSession();
            matchesDiv.innerHTML += `<div class="text-center" style="font-size:24px">${buddy1[1].employee} ❤️ ${buddy2[1].employee}</div><br>`;
        } else {
            const last = pickRandomFromSession();
            matchesDiv.innerHTML += `<div class="text-center text-muted" style="font-size:20px">${last[1].employee} has no match 😢</div><br>`;
        }
    }
};

// --- BUTTON EVENTS ---
buttonGenerator.addEventListener('click', generateAllMatches);

resetButton.addEventListener('click', () => {
    matchesDiv.innerHTML = ''; // only clear matches
});

deleteAll.addEventListener('click', () => {
    dialogBox.showModal();
});

deleteAllModalBtn.addEventListener('click', () => {
    employeeList = {};
    sessionPool = [];
    localStorage.removeItem('addedEmployeeList');
    namesListDiv.innerHTML = '';
    matchesDiv.innerHTML = '';
});
