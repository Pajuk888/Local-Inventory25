document.addEventListener("DOMContentLoaded", () => {
  const mainLocation = document.getElementById("mainLocation");
  const subLocation = document.getElementById("subLocation");
  const addMainLocation = document.getElementById("addMainLocation");
  const addSubLocation = document.getElementById("addSubLocation");
  const searchBox = document.getElementById("searchBox");
  const searchResults = document.getElementById("searchResults");
  const basketList = document.getElementById("basketList");
  const clearAll = document.getElementById("clearAll");

  let inventory = JSON.parse(localStorage.getItem("inventory")) || {};
  let basket = [];

  const saveInventory = () => localStorage.setItem("inventory", JSON.stringify(inventory));

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

  const addItemToBasket = (item) => {
    const existing = basket.find(b => b.name === item.name);
    if (existing) {
      existing.quantity++;
    } else {
      basket.push({ ...item, quantity: 1 });
    }
    renderBasket();
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

  addMainLocation.addEventListener("click", () => {
    const loc = prompt("Enter Main Location:");
    if (loc && !inventory[loc]) {
      inventory[loc] = {};
      saveInventory();
      loadLocations();
    }
  });

  addSubLocation.addEventListener("click", () => {
    const subloc = prompt("Enter Sub Location:");
    if (subloc && !inventory[mainLocation.value]?.[subloc]) {
      inventory[mainLocation.value][subloc] = [];
      saveInventory();
      loadSubLocations(mainLocation.value);
    }
  });

  searchBox.addEventListener("input", () => {
    const query = searchBox.value.toLowerCase();
    searchResults.innerHTML = inventory[mainLocation.value]?.[subLocation.value]
      ?.filter(item => item.name.toLowerCase().includes(query))
      .map(item => `<li>${item.name}</li>`)
      .join("") || "";
    Array.from(searchResults.querySelectorAll("li")).forEach((li, idx) =>
      li.addEventListener("click", () => addItemToBasket(inventory[mainLocation.value][subLocation.value][idx]))
    );
  });

  clearAll.addEventListener("click", () => {
    basket = [];
    renderBasket();
  });

  loadLocations();
});
