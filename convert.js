const fs = require("fs");
const csv = require("csv-parser");

const results = [];

fs.createReadStream("THE_Sheet2.csv")
  .pipe(csv())
  .on("data", (row) => {
    results.push({
      id: clean(row.id),
      category: clean(row.category),
      title: clean(row.title),
      shortMeaning: clean(row.shortMeaning),
      description: clean(row.description),
      tags: clean(row.tags)
        .split(",")
        .map(tag => tag.trim())
        .filter(Boolean)
    });
  })
  .on("end", () => {
    fs.writeFileSync(
      "data/entries.json",
      JSON.stringify(results, null, 2)
    );

    console.log("Created data/entries.json");
  });

function clean(value) {
  return String(value || "")
    .replace(/^"+|"+$/g, "")
    .trim();
}