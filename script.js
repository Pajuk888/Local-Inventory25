document.addEventListener("DOMContentLoaded", () => {
  const mainLocation = document.getElementById("mainLocation");
  const subLocation = document.getElementById("subLocation");
  const addMainLocation = document.getElementById("addMainLocation");
  const addSubLocation = document.getElementById("addSubLocation");
  const searchBox = document.getElementById("searchBox");
  const addNewItem = document.getElementById("addNewItem");
  const searchResults = document.getElementById("searchResults");
  const logList = document.getElementById("logList");
  const combinedList = document.getElementById("combinedList");
  const clearAll = document.getElementById("clearAll");

  let inventory = JSON.parse(localStorage.getItem("inventory")) || {};
  let log = [];
  let combined = {};

  const saveInventory = () => localStorage.setItem("inventory", JSON.stringify(inventory));
  const updateReports = () => {
    renderLog();
    renderCombinedTotals();
  };

  const loadLocations = () => {
    mainLocation.innerHTML = Object.keys(inventory)
      .map(loc => `<option value="${loc}">${loc}</option>`)
      .join("");
    if (mainLocation.value) loadSubLocations(mainLocation.value);
  };

  const loadSubLocations = (loc) => {
    subLocation.innerHTML = Object.keys(inventory[loc] || {})
      .map(subloc => `<option value="${subloc}">${subloc}</option>`)
      .join("");
  };

  const renderLog = () => {
    logList.innerHTML = log
      .map(item => `<li>${item.location}: ${item.name} x${item.quantity}</li>`)
      .join("");
  };

  const renderCombinedTotals = () => {
    combinedList.innerHTML = Object.entries(combined)
      .map(([name, details]) => {
        const locations = Object.entries(details.locations)
          .map(([loc, qty]) => `${loc} x${qty}`)
          .join(", ");
        return `<li>${name} x${details.total} (${locations})</li>`;
      })
      .join("");
  };

  const addItemToLog = (name, quantity, location) => {
    log.push({ name, quantity, location });
    combined[name] = combined[name] || { total: 0, locations: {} };
    combined[name].total += quantity;
    combined[name].locations[location] =
      (combined[name].locations[location] || 0) + quantity;

    updateReports();
  };

  const addItemToInventory = (name) => {
    const location = mainLocation.value;
    const subloc = subLocation.value;
    if (!inventory[location]) inventory[location] = {};
    if (!inventory[location][subloc]) inventory[location][subloc] = [];
    inventory[location][subloc].push({ name });
    saveInventory();
  };

  searchBox.addEventListener("input", () => {
    const query = searchBox.value.trim();
    const items = inventory[mainLocation.value]?.[subLocation.value] || [];
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    searchResults.innerHTML = filtered
      .map(item => `<li>${item.name}</li>`)
      .join("");

    Array.from(searchResults.querySelectorAll("li")).forEach((li, idx) => {
      li.addEventListener("click", () => {
        const quantity = parseInt(prompt(`Enter quantity for "${filtered[idx].name}"`));
        if (!isNaN(quantity)) {
          addItemToLog(filtered[idx].name, quantity, `${mainLocation.value} - ${subLocation.value}`);
        }
      });
    });
  });

  addNewItem.addEventListener("click", () => {
    const name = searchBox.value.trim();
    if (name) {
      addItemToInventory(name);
      alert(`Added "${name}" to inventory`);
    }
  });

  clearAll.addEventListener("click", () => {
    log = [];
    combined = {};
    renderLog();
    renderCombinedTotals();
  });

  loadLocations();
});
