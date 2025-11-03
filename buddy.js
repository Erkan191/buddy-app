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
const groupSizeSelector = document.getElementById('group-size');
const groupPreviewDiv = document.getElementById('group-preview');


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
    const rawInput = nameInput.value.trim();

    if (!rawInput) {
        alert("Please enter a buddy name to add.");
        return;
    }

    // Split input on any whitespace (spaces, tabs, or newlines)
    const namesArray = rawInput.split(/\s+/);

    let addedNames = [];

    namesArray.forEach((employeeName) => {
        // Check for duplicate (case-insensitive)
        const exists = Object.values(employeeList).some(
            e => e.employee.toLowerCase() === employeeName.toLowerCase()
        );

        if (!exists && employeeName) {
            const newId = Object.keys(employeeList).length + 1;
            employeeList[newId] = { employee: employeeName };
            localStorage.setItem('addedEmployeeList', JSON.stringify(employeeList));

            // Show the newly added buddy immediately
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

            addedNames.push(employeeName);
                    nameInput.value = ""; // clear input

        }
    });

    if (addedNames.length === 0) {
        alert("You've already entered this name!");
    }

    nameInput.value = ""; // clear input
});


deleteButton.addEventListener('click', (event) => {
    event.preventDefault();
    const inputName = nameInput.value.trim();
    if (!inputName) {
        alert("Please enter a buddy name to delete.");
        return;
    }

    // Find the buddy in the employeeList
    const entry = Object.entries(employeeList).find(
        ([key, value]) => value.employee.toLowerCase() === inputName.toLowerCase()
    );

    if (entry) {
        const [id] = entry;
        delete employeeList[id];

        // Update localStorage
        localStorage.setItem('addedEmployeeList', JSON.stringify(employeeList));

        // Clear UI
        renderNamesList();       // refresh the names list
        matchesDiv.innerHTML = ''; // remove any current matches

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
        alert("You need to add some names first!");
        return;
    }

    if (namesListDiv.children.length > 0) fadeOutNamesList();
    matchesDiv.innerHTML = '';
    initializeSessionPool();

    if (sessionPool.length === 0) return;

    let groupSize = parseInt(groupSizeSelector.value);
    if (groupSize < 2) groupSize = 2;
    if (groupSize > 10) groupSize = 10;

    const totalNames = sessionPool.length;
    let groupNumber = 1;

    const colors = [
        'linear-gradient(135deg,#ff6b6b,#f06595)',
        'linear-gradient(135deg,#339af0,#22b8cf)',
        'linear-gradient(135deg,#51cf66,#94d82d)',
        'linear-gradient(135deg,#fcc419,#ff922b)',
        'linear-gradient(135deg,#845ef7,#5c7cfa)'
    ];

    while (sessionPool.length > 0) {
        let currentGroupSize = groupSize;

        if (sessionPool.length <= groupSize) {
            currentGroupSize = sessionPool.length;
        } else if (sessionPool.length - groupSize === 1) {
            currentGroupSize = groupSize + 1;
        }

        const group = [];
        for (let i = 0; i < currentGroupSize; i++) {
            const buddy = pickRandomFromSession();
            if (buddy) group.push(buddy[1].employee);
        }

        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group-card');
        // Pick a color gradient for this group
        groupDiv.style.background = '#fff';  // card background neutral
        groupDiv.style.border = `2px solid ${colors[groupNumber % colors.length].split(',')[0].replace('linear-gradient(135deg,', '')}`

        const label = document.createElement('div');
        label.classList.add('group-label');
        groupDiv.appendChild(label);

        group.forEach(name => {
            const pill = document.createElement('span');
            pill.classList.add('name-pill');
            pill.textContent = name;
            pill.style.background = colors[Math.floor(Math.random() * colors.length)];
            groupDiv.appendChild(pill);
        });

        matchesDiv.appendChild(groupDiv);
        groupNumber++;
        nameInput.value = ""; // clear input

    }
};


// Helper: generate a random pastel color
const randomPastelColor = () => {
    const r = Math.floor((Math.random() * 127) + 127);
    const g = Math.floor((Math.random() * 127) + 127);
    const b = Math.floor((Math.random() * 127) + 127);
    return `rgb(${r},${g},${b})`;
};


const updateGroupPreview = () => {
    const groupSize = parseInt(groupSizeSelector.value) || 2;
    const totalNames = Object.keys(employeeList).length;

    if (totalNames === 0) {
        groupPreviewDiv.textContent = "Add some buddies to see group distribution.";
        return;
    }

    let remaining = totalNames;
    let groups = [];

    while (remaining > 0) {
        let currentGroupSize = groupSize;

        // Avoid last group having only 1
        if (remaining <= groupSize) {
            currentGroupSize = remaining;
        } else {
            if (remaining - groupSize === 1) currentGroupSize = groupSize + 1;
        }

        groups.push(currentGroupSize);
        remaining -= currentGroupSize;
    }

    groupPreviewDiv.textContent = `Total buddies: ${totalNames} → Group sizes: ${groups.join(", ")}`;
};



// --- BUTTON EVENTS ---
buttonGenerator.addEventListener('click', generateAllMatches);

resetButton.addEventListener('click', () => {
    matchesDiv.innerHTML = ''; // only clear matches
    namesListDiv.innerHTML = ''; //clears names
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

    // Close the modal after deletion
    dialogBox.close();
});

nameInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        addButton.click()
    }
});