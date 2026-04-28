let entries = [];
let selectedCategory = null;
const searchInput = document.getElementById("searchInput");
const categoryButtons = document.getElementById("categoryButtons");
const entriesContainer = document.getElementById("entries");

// Tracks which category sections are open
let openCategories = ["tattoos", "everyday laws"];

async function loadEntries() {
  const response = await fetch("data/entries.json");
  const text = await response.text();

  entries = JSON.parse(text);

  entries = entries.map(entry => ({
    ...entry,
    category: autoCategorize(entry),
    tags: Array.isArray(entry.tags) ? entry.tags : []
  }));

  renderCategoryButtons();
  renderCategorySections();
}

function autoCategorize(entry) {
  if (entry.category && entry.category.trim() !== "") {
    return entry.category.trim().toLowerCase();
  }

  const tags = Array.isArray(entry.tags)
    ? entry.tags.map(tag => tag.toLowerCase())
    : [];

  if (tags.includes("tattoo") || tags.includes("ink")) return "tattoos";
  if (tags.includes("law") || tags.includes("productivity")) return "everyday laws";

  return "uncategorized";
}

// Buttons at the top quickly open/close categories
function renderCategoryButtons() {
  const categories = [...new Set(entries.map(entry => entry.category))];

  categoryButtons.innerHTML = "";

  categories.forEach(category => {
    const button = document.createElement("button");
    button.textContent = category;

    button.className = `
    ${openCategories.includes(category) ? "active" : ""}
    ${selectedCategory === category ? "selected" : ""}
   `;

button.addEventListener("click", () => {
  // If the same category is clicked again, unselect it
  if (selectedCategory === category) {
    selectedCategory = null;
  } else {
    selectedCategory = category;
  }

  toggleCategory(category);
});
    categoryButtons.appendChild(button);
  });
}

function toggleCategory(category) {
  if (openCategories.includes(category)) {
    openCategories = openCategories.filter(c => c !== category);
  } else {
    openCategories.push(category);
  }

  renderCategoryButtons();
  renderCategorySections();
}

// Main display: one collapsible card per category
function renderCategorySections() {
  const searchTerm = searchInput.value.toLowerCase();
  const categories = [...new Set(entries.map(entry => entry.category))];

  entriesContainer.innerHTML = "";

  categories.forEach(category => {
    const categoryEntries = entries.filter(entry => {
      const searchableText = `
        ${entry.title}
        ${entry.shortMeaning}
        ${entry.description}
        ${entry.tags.join(" ")}
      `.toLowerCase();

      return entry.category === category && searchableText.includes(searchTerm);
    });

    if (categoryEntries.length === 0) return;

    const section = document.createElement("section");
    section.className = "category-section";

    const isOpen = openCategories.includes(category);

    section.innerHTML = `
      <div class="category-header">
        <h2>${category}</h2>
        <span>${isOpen ? "−" : "+"}</span>
      </div>
      <div class="category-content ${isOpen ? "" : "hidden"}"></div>
    `;

    section.querySelector(".category-header").addEventListener("click", () => {
      toggleCategory(category);
    });

    const content = section.querySelector(".category-content");

    categoryEntries.forEach(entry => {
      const card = document.createElement("article");
      card.className = "card";

      card.addEventListener("click", () => openModal(entry));

      card.innerHTML = `
        <h3>${entry.title}</h3>
        <p class="short">${entry.shortMeaning}</p>
        <p>${entry.description}</p>
        <div class="tags">
          ${entry.tags.map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>
      `;

      content.appendChild(card);
    });

    entriesContainer.appendChild(section);
  });
}

function showRandom() {
  if (entries.length === 0) return;

  const random = entries[Math.floor(Math.random() * entries.length)];
  openModal(random);
}

function openModal(entry) {
  const modal = document.createElement("div");
  modal.className = "modal";

  modal.innerHTML = `
    <div class="modal-content">
      <h2>${entry.title}</h2>
      <p><strong>${entry.shortMeaning}</strong></p>
      <p>${entry.description}</p>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;

  document.body.appendChild(modal);
}

function showRandomFromSelectedCategory() {
  if (!selectedCategory) {
    alert("Select a category first");
    return;
  }

  const categoryEntries = entries.filter(entry => entry.category === selectedCategory);

  if (categoryEntries.length === 0) {
    alert("No entries found in this category");
    return;
  }

  const random = categoryEntries[Math.floor(Math.random() * categoryEntries.length)];
  openModal(random);
}

searchInput.addEventListener("input", renderCategorySections);

loadEntries();