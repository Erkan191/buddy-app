let pairingHistory =
  JSON.parse(localStorage.getItem("pairingHistory")) || {};

function getNames() {
  return document
    .getElementById("namesInput")
    .value.split("\n")
    .map(n => n.trim())
    .filter(Boolean);
}

function saveListsUI() {
  const container = document.getElementById("savedLists");
  container.innerHTML = "";

  const lists = JSON.parse(localStorage.getItem("bmLists")) || {};

  Object.keys(lists).forEach(name => {
    const btn = document.createElement("button");
    btn.className = "listBtn";
    btn.textContent = name;

    btn.onclick = () => {
      document.getElementById("namesInput").value = lists[name].join("\n");
    };

    container.appendChild(btn);
  });
}

document.getElementById("saveListBtn").onclick = () => {
  const name = document.getElementById("listName").value.trim();
  const names = getNames();

  if (!name || names.length === 0) return;

  const lists = JSON.parse(localStorage.getItem("bmLists")) || {};
  lists[name] = names;

  localStorage.setItem("bmLists", JSON.stringify(lists));

  saveListsUI();
};

saveListsUI();

function shuffle(arr) {
  return arr.sort(() => Math.random() - 0.5);
}

document.getElementById("generateBtn").onclick = () => {
  let names = getNames();
  const size = Number(document.getElementById("groupSize").value);
  const avoid = document.getElementById("avoidRepeats").checked;

  names = shuffle(names);

  let groups = [];

  while (names.length) {
    let group = names.splice(0, size);

    if (avoid && group.length === 2) {
      const key = group.slice().sort().join("|");
      if (pairingHistory[key]) {
        names.push(...group);
        names = shuffle(names);
        continue;
      }
      pairingHistory[key] = true;
    }

    groups.push(group);
  }

  localStorage.setItem("pairingHistory", JSON.stringify(pairingHistory));

  render(groups);
};

function render(groups) {
  const res = document.getElementById("results");
  res.innerHTML = "";

  groups.forEach((g, i) => {
    const card = document.createElement("div");
    card.className = "groupCard";

    card.innerHTML =
      "<h4>Group " +
      (i + 1) +
      "</h4>" +
      g.map(n => "<div class='pill'>" + n + "</div>").join("");

    res.appendChild(card);
  });
}

document.getElementById("copyBtn").onclick = () => {
  let text = "";
  document.querySelectorAll(".groupCard").forEach(card => {
    text += card.innerText + "\n\n";
  });
  navigator.clipboard.writeText(text);
};

document.getElementById("csvBtn").onclick = () => {
  let csv = "";

  document.querySelectorAll(".groupCard").forEach(card => {
    const names = [...card.querySelectorAll(".pill")].map(p => p.innerText);
    csv += names.join(",") + "\n";
  });

  const blob = new Blob([csv]);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "groups.csv";
  a.click();
};

document.getElementById("printBtn").onclick = () => {
  window.print();
};