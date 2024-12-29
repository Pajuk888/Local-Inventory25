document.addEventListener("DOMContentLoaded", () => {
  const mainLocation = document.getElementById("mainLocation");
  const subLocation = document.getElementById("subLocation");
  const addMainLocation = document.getElementById("addMainLocation");
  const addSubLocation = document.getElementById("addSubLocation");
  const itemName = document.getElementById("itemName");
  const itemDescription = document.getElementById("itemDescription");
  const itemQuantity = document.getElementById("itemQuantity");
  const itemCategory = document.getElementById("itemCategory");
  const addItem = document.getElementById("addItem");
  const inventory = document.getElementById("inventory");
  const clearInventory = document.getElementById("clearInventory");

  let data = JSON.parse(localStorage.getItem("inventoryData")) || {};

  const saveData = () => {
    localStorage.setItem("inventoryData", JSON.stringify(data));
  };

  const loadLocations = () => {
    mainLocation.innerHTML = Object.keys(data)
      .map(location => `<option value="${location}">${location}</option>`)
      .join("");
    if (mainLocation.value) loadSubLocations(mainLocation.value);
  };

  const loadSubLocations = (location) => {
    subLocation.innerHTML = Object.keys(data[location] || {})
      .map(sub => `<option value="${sub}">${sub}</option>`)
      .join("");
  };

  const loadInventory = () => {
    inventory.innerHTML = "";
    const items = data[mainLocation.value]?.[subLocation.value] || [];
    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `${item.name} (x${item.quantity}) - ${item.description} <button class="delete">Delete</button>`;
      li.querySelector(".delete").addEventListener("click", () => {
        const index = items.indexOf(item);
        items.splice(index, 1);
        saveData();
        loadInventory();
      });
      inventory.appendChild(li);
    });
  };

  addMainLocation.addEventListener("click", () => {
    const location = prompt("Enter Main Location Name:");
    if (location) {
      data[location] = {};
      saveData();
      loadLocations();
    }
  });

  addSubLocation.addEventListener("click", () => {
    const sub = prompt("Enter Sub Location Name:");
    if (sub) {
      const location = mainLocation.value;
      if (!data[location]) data[location] = {};
      data[location][sub] = [];
      saveData();
      loadSubLocations(location);
    }
  });

  addItem.addEventListener("click", () => {
    const location = mainLocation.value;
    const sub = subLocation.value;
    if (!location || !sub) {
      alert("Please select a location and sub-location.");
      return;
    }
    const item = {
      name: itemName.value,
      description: itemDescription.value,
      quantity: parseInt(itemQuantity.value) || 0,
      category: itemCategory.value,
    };
    data[location][sub].push(item);
    saveData();
    loadInventory();
  });

  clearInventory.addEventListener("click", () => {
    if (confirm("Are you sure you want to clear all inventory data?")) {
      data = {};
      saveData();
      loadLocations();
      loadInventory();
    }
  });

  mainLocation.addEventListener("change", () => loadSubLocations(mainLocation.value));
  subLocation.addEventListener("change", loadInventory);

  loadLocations();
  loadInventory();
});
