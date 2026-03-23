const STORAGE_KEYS = {
  names: "buddyMatcher_names",
  savedLists: "buddyMatcher_saved_lists",
  lastResult: "buddyMatcher_last_result"
};

const gradients = [
  "linear-gradient(135deg, #38bdf8, #3b82f6)",
  "linear-gradient(135deg, #34d399, #10b981)",
  "linear-gradient(135deg, #f59e0b, #f97316)",
  "linear-gradient(135deg, #f472b6, #ec4899)",
  "linear-gradient(135deg, #a78bfa, #8b5cf6)",
  "linear-gradient(135deg, #60a5fa, #2563eb)"
];

const addButton = document.getElementById("add-button");
const deleteButton = document.getElementById("delete-button");
const nameInput = document.getElementById("name-input");
const showNamesButton = document.getElementById("show-names");
const buttonGenerator = document.getElementById("buttonGenerator");
const namesListDiv = document.getElementById("names-list");
const matchesDiv = document.getElementById("matches");
const emptyState = document.getElementById("empty-state");
const resetButton = document.getElementById("reset");
const deleteAllButton = document.getElementById("delete-all");
const dialogBox = document.getElementById("confirm-deleteAll-dialog");
const deleteAllModalBtn = document.getElementById("yesDelete-Modal-btn");
const groupSizeSelector = document.getElementById("group-size");
const groupPreviewDiv = document.getElementById("group-preview");
const copyResultsButton = document.getElementById("copy-results");
const downloadResultsButton = document.getElementById("download-results");
const shareToolButton = document.getElementById("share-tool");
const saveListButton = document.getElementById("save-list");
const loadListButton = document.getElementById("load-list");
const deleteListButton = document.getElementById("delete-list");
const savedListsSelect = document.getElementById("saved-lists");
const avoidRepeatsCheckbox = document.getElementById("avoid-repeats");
const savedStatus = document.getElementById("saved-status");

let names = JSON.parse(localStorage.getItem(STORAGE_KEYS.names)) || [];
let savedLists = JSON.parse(localStorage.getItem(STORAGE_KEYS.savedLists)) || {};
let lastResult = JSON.parse(localStorage.getItem(STORAGE_KEYS.lastResult)) || [];

function persistNames() {
  localStorage.setItem(STORAGE_KEYS.names, JSON.stringify(names));
  updateSavedStatus();
}

function persistSavedLists() {
  localStorage.setItem(STORAGE_KEYS.savedLists, JSON.stringify(savedLists));
}

function persistLastResult() {
  localStorage.setItem(STORAGE_KEYS.lastResult, JSON.stringify(lastResult));
}

function updateSavedStatus() {
  savedStatus.textContent =
    names.length > 0
      ? `${names.length} name${names.length === 1 ? "" : "s"} saved locally in your browser`
      : "Saved locally in your browser";
}

function normaliseInputToArray(raw) {
  return raw
    .split(/\r?\n|,/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function dedupeNames(arr) {
  const seen = new Set();
  const result = [];

  for (const name of arr) {
    const lower = name.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      result.push(name);
    }
  }

  return result;
}

function renderNamesList() {
  namesListDiv.innerHTML = "";

  if (names.length === 0) {
    return;
  }

  names.forEach((name) => {
    const chip = document.createElement("span");
    chip.className = "name-chip";
    chip.textContent = name;
    namesListDiv.appendChild(chip);
  });
}

function updateGroupPreview() {
  const total = names.length;
  const groupSize = Math.max(2, parseInt(groupSizeSelector.value, 10) || 2);

  if (total === 0) {
    groupPreviewDiv.textContent = "Add some names to see group distribution.";
    return;
  }

  let remaining = total;
  const groups = [];

  while (remaining > 0) {
    let currentGroupSize = groupSize;

    if (remaining <= groupSize) {
      currentGroupSize = remaining;
    } else if (remaining - groupSize === 1) {
      currentGroupSize = groupSize + 1;
    }

    groups.push(currentGroupSize);
    remaining -= currentGroupSize;
  }

  groupPreviewDiv.textContent = `Total names: ${total} → Group sizes: ${groups.join(", ")}`;
}

function refreshSavedListsDropdown() {
  const currentValue = savedListsSelect.value;
  savedListsSelect.innerHTML = '<option value="">Choose a saved list</option>';

  Object.keys(savedLists)
    .sort((a, b) => a.localeCompare(b))
    .forEach((listName) => {
      const option = document.createElement("option");
      option.value = listName;
      option.textContent = `${listName} (${savedLists[listName].length})`;
      savedListsSelect.appendChild(option);
    });

  if (savedLists[currentValue]) {
    savedListsSelect.value = currentValue;
  }
}

function shuffleArray(arr) {
  const clone = [...arr];
  for (let i = clone.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [clone[i], clone[j]] = [clone[j], clone[i]];
  }
  return clone;
}

function buildGroupsFromNames(sourceNames, groupSize) {
  const working = [...sourceNames];
  const groups = [];

  while (working.length > 0) {
    let currentGroupSize = groupSize;

    if (working.length <= groupSize) {
      currentGroupSize = working.length;
    } else if (working.length - groupSize === 1) {
      currentGroupSize = groupSize + 1;
    }

    groups.push(working.splice(0, currentGroupSize));
  }

  return groups;
}

function groupSignature(group) {
  return [...group].sort((a, b) => a.localeCompare(b)).join("|");
}

function repeatsLastGrouping(candidateGroups) {
  if (!Array.isArray(lastResult) || lastResult.length === 0) return false;

  const previous = new Set(lastResult.map(groupSignature));
  return candidateGroups.some((group) => previous.has(groupSignature(group)));
}

function generateGroupsWithRetry() {
  const groupSize = Math.max(2, parseInt(groupSizeSelector.value, 10) || 2);
  const avoidRepeats = avoidRepeatsCheckbox.checked;

  let bestGroups = buildGroupsFromNames(shuffleArray(names), groupSize);

  if (!avoidRepeats || lastResult.length === 0) {
    return bestGroups;
  }

  for (let attempt = 0; attempt < 200; attempt++) {
    const candidate = buildGroupsFromNames(shuffleArray(names), groupSize);
    if (!repeatsLastGrouping(candidate)) {
      return candidate;
    }
    bestGroups = candidate;
  }

  return bestGroups;
}

function renderGroups(groups) {
  matchesDiv.innerHTML = "";

  if (!groups.length) {
    emptyState.style.display = "block";
    return;
  }

  emptyState.style.display = "none";

  groups.forEach((group, index) => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "group-card";

    const label = document.createElement("div");
    label.className = "group-label";
    label.textContent = `Group ${index + 1}`;
    groupDiv.appendChild(label);

    group.forEach((name, nameIndex) => {
      const pill = document.createElement("span");
      pill.className = "name-pill";
      pill.textContent = name;
      pill.style.background = gradients[(index + nameIndex) % gradients.length];
      groupDiv.appendChild(pill);
    });

    matchesDiv.appendChild(groupDiv);
  });
}

function groupsToPlainText(groups) {
  if (!groups || groups.length === 0) return "";

  return groups
    .map((group, index) => `Group ${index + 1}: ${group.join(", ")}`)
    .join("\n");
}

async function copyResults() {
  const text = groupsToPlainText(lastResult);
  if (!text) {
    alert("Generate some groups first.");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    copyResultsButton.textContent = "Copied";
    setTimeout(() => {
      copyResultsButton.textContent = "Copy";
    }, 1200);
  } catch {
    alert("Could not copy automatically. Please try again.");
  }
}

function downloadResults() {
  const text = groupsToPlainText(lastResult);
  if (!text) {
    alert("Generate some groups first.");
    return;
  }

  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "buddy-matcher-results.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function shareTool() {
  const shareData = {
    title: "Buddy Matcher",
    text: "Free random pair generator for names, teams and classrooms.",
    url: window.location.href.split("#")[0]
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch {
      // fall through to clipboard
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    shareToolButton.textContent = "Link copied";
    setTimeout(() => {
      shareToolButton.textContent = "Share tool";
    }, 1200);
  } catch {
    alert("Could not share the link.");
  }
}

function addNamesFromInput() {
  const rawInput = nameInput.value.trim();

  if (!rawInput) {
    alert("Please enter at least one name.");
    return;
  }

  const incoming = dedupeNames(normaliseInputToArray(rawInput));

  if (incoming.length === 0) {
    alert("Please enter at least one valid name.");
    return;
  }

  const existingLower = new Set(names.map((name) => name.toLowerCase()));
  let addedCount = 0;

  incoming.forEach((name) => {
    if (!existingLower.has(name.toLowerCase())) {
      names.push(name);
      existingLower.add(name.toLowerCase());
      addedCount++;
    }
  });

  if (addedCount === 0) {
    alert("Those names are already in the list.");
    return;
  }

  persistNames();
  renderNamesList();
  updateGroupPreview();
  nameInput.value = "";
}

function deleteOneName() {
  const rawInput = nameInput.value.trim();

  if (!rawInput) {
    alert("Type the exact name you want to delete.");
    return;
  }

  const index = names.findIndex((name) => name.toLowerCase() === rawInput.toLowerCase());

  if (index === -1) {
    alert("Name not found.");
    return;
  }

  names.splice(index, 1);
  persistNames();
  renderNamesList();
  updateGroupPreview();
  nameInput.value = "";
}

function generateAllMatches() {
  if (names.length < 2) {
    alert("Add at least two names first.");
    return;
  }

  const groups = generateGroupsWithRetry();
  lastResult = groups;
  persistLastResult();
  renderGroups(groups);
}

function clearResultsOnly() {
  matchesDiv.innerHTML = "";
  emptyState.style.display = "block";
}

function deleteAllNames() {
  names = [];
  lastResult = [];
  localStorage.removeItem(STORAGE_KEYS.names);
  localStorage.removeItem(STORAGE_KEYS.lastResult);
  renderNamesList();
  renderGroups([]);
  updateGroupPreview();
  updateSavedStatus();
  nameInput.value = "";
}

function saveCurrentList() {
  if (names.length === 0) {
    alert("Add some names before saving a list.");
    return;
  }

  const listName = window.prompt("Name this list:", "");
  if (!listName) return;

  const trimmed = listName.trim();
  if (!trimmed) return;

  savedLists[trimmed] = [...names];
  persistSavedLists();
  refreshSavedListsDropdown();
  savedListsSelect.value = trimmed;
}

function loadSelectedList() {
  const selected = savedListsSelect.value;
  if (!selected || !savedLists[selected]) {
    alert("Choose a saved list first.");
    return;
  }

  names = [...savedLists[selected]];
  persistNames();
  renderNamesList();
  updateGroupPreview();
  clearResultsOnly();
}

function deleteSelectedList() {
  const selected = savedListsSelect.value;
  if (!selected || !savedLists[selected]) {
    alert("Choose a saved list first.");
    return;
  }

  const confirmed = window.confirm(`Delete saved list "${selected}"?`);
  if (!confirmed) return;

  delete savedLists[selected];
  persistSavedLists();
  refreshSavedListsDropdown();
}

function init() {
  renderNamesList();
  renderGroups([]);
  updateGroupPreview();
  refreshSavedListsDropdown();
  updateSavedStatus();
}

addButton.addEventListener("click", addNamesFromInput);
deleteButton.addEventListener("click", deleteOneName);
showNamesButton.addEventListener("click", renderNamesList);
buttonGenerator.addEventListener("click", generateAllMatches);
resetButton.addEventListener("click", clearResultsOnly);

deleteAllButton.addEventListener("click", () => {
  dialogBox.showModal();
});

deleteAllModalBtn.addEventListener("click", (event) => {
  event.preventDefault();
  deleteAllNames();
  dialogBox.close();
});

groupSizeSelector.addEventListener("change", updateGroupPreview);
copyResultsButton.addEventListener("click", copyResults);
downloadResultsButton.addEventListener("click", downloadResults);
shareToolButton.addEventListener("click", shareTool);
saveListButton.addEventListener("click", saveCurrentList);
loadListButton.addEventListener("click", loadSelectedList);
deleteListButton.addEventListener("click", deleteSelectedList);

nameInput.addEventListener("input", () => {
  const tempNames = dedupeNames(normaliseInputToArray(nameInput.value.trim()));
  if (tempNames.length === 0) {
    updateGroupPreview();
    return;
  }

  const groupSize = Math.max(2, parseInt(groupSizeSelector.value, 10) || 2);
  let remaining = tempNames.length;
  const groups = [];

  while (remaining > 0) {
    let currentGroupSize = groupSize;
    if (remaining <= groupSize) {
      currentGroupSize = remaining;
    } else if (remaining - groupSize === 1) {
      currentGroupSize = groupSize + 1;
    }
    groups.push(currentGroupSize);
    remaining -= currentGroupSize;
  }

  groupPreviewDiv.textContent = `Pasted names: ${tempNames.length} → Group sizes: ${groups.join(", ")}`;
});

nameInput.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
    addNamesFromInput();
  }
});

init();