document.addEventListener("DOMContentLoaded", () => {
  const mainLocation = document.getElementById("mainLocation");
  const subLocation = document.getElementById("subLocation");
  const addMainLocation = document.getElementById("addMainLocation");
  const editMainLocation = document.getElementById("editMainLocation");
  const deleteMainLocation = document.getElementById("deleteMainLocation");
  const addSubLocation = document.getElementById("addSubLocation");
  const editSubLocation = document.getElementById("editSubLocation");
  const deleteSubLocation = document.getElementById("deleteSubLocation");
  const searchBox = document.getElementById("searchBox");
  const searchResults = document.getElementById("searchResults");
  const basketList = document.getElementById("basketList");
  const logList = document.getElementById("logList");
  const combinedList = document.getElementById("combinedList");
  const clearAll = document.getElementById("clearAll");

  let inventory = JSON.parse(localStorage.getItem("inventory")) || {};
  let basket = [];
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
          .map(([loc, qty]) => `${loc} x ${qty}`)
          .join(", ");
        return `<li>${name} x${details.total} (${locations})</li>`;
      })
      .join("");
  };

  const addItemToBasket = (item) => {
    const existing = basket.find(b => b.name === item.name);
    if (existing) {
      existing.quantity++;
    } else {
      basket.push({ ...item, quantity: 1 });
    }

    log.push({
      location: `${mainLocation.value} - ${subLocation.value}`,
      name: item.name,
      quantity: 1,
    });

    combined[item.name] = combined[item.name] || { total: 0, locations: {} };
    combined[item.name].total++;
    combined[item.name].locations[mainLocation.value] =
      (combined[item.name].locations[mainLocation.value] || 0) + 1;

    renderBasket();
    updateReports();
  };

  const renderBasket = () => {
    basketList.innerHTML = "";
    basket.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <span>${item.name} (x${item.quantity})</span>
        <button class="minus">-</button>
        <button class="plus">+</button>
      `;
      li.querySelector(".minus").addEventListener("click", () => {
        item.quantity--;
        if (item.quantity === 0) basket = basket.filter(b => b !== item);
        renderBasket();
      });
      li.querySelector(".plus").addEventListener("click", () => {
        item.quantity++;
        renderBasket();
      });
      basketList.appendChild(li);
    });
  };

  const addNewItem = (name) => {
    const location = mainLocation.value;
    const subloc = subLocation.value;
    if (!inventory[location][subloc]) return;

    const newItem = { name, quantity: 0 };
    inventory[location][subloc].push(newItem);
    saveInventory();
    return newItem;
  };

  searchBox.addEventListener("input", () => {
    const query = searchBox.value.trim();
    const items = inventory[mainLocation.value]?.[subLocation.value] || [];
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(query.toLowerCase())
    );

    if (filtered.length === 0 && query) {
      if (confirm(`No item found for "${query}". Add as new item?`)) {
        const newItem = addNewItem(query);
        addItemToBasket(newItem);
      }
    }

    searchResults.innerHTML = filtered
      .map(item => `<li>${item.name}</li>`)
      .join("");

    Array.from(searchResults.querySelectorAll("li")).forEach((li, idx) =>
      li.addEventListener("click", () => addItemToBasket(filtered[idx]))
    );
  });

  clearAll.addEventListener("click", () => {
    basket = [];
    log = [];
    combined = {};
    renderBasket();
    updateReports();
  });

  loadLocations();
});
