(function () {
  "use strict";

  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = "";
    var inQuotes = false;

    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"' && text[i + 1] === '"') {
          field += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          field += c;
        }
      } else if (c === '"') {
        inQuotes = true;
      } else if (c === ",") {
        row.push(field);
        field = "";
      } else if (c === "\n" || c === "\r") {
        if (field.length || row.length) {
          row.push(field);
          rows.push(row);
        }
        field = "";
        row = [];
        if (c === "\r" && text[i + 1] === "\n") i++;
      } else {
        field += c;
      }
    }
    if (field.length || row.length) {
      row.push(field);
      rows.push(row);
    }
    return rows;
  }

  var grid = document.getElementById("kelpies-grid");
  if (!grid) return;

  var IMAGE_DIR = "assets/kelpies-photos/";

  fetch("data/kelpies.csv")
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCsv(text).slice(1).filter(function (r) { return r.length > 1; });
      if (!rows.length) return;

      grid.innerHTML = "";
      rows.forEach(function (cols) {
        var file = cols[0];
        var name = cols[1] || "";
        var title = cols[2] || "";
        var description = cols[3] || "";

        var figure = document.createElement("figure");
        figure.className = "gallery-item kelpie-item";

        if (file) {
          var link = document.createElement("a");
          link.href = IMAGE_DIR + file;
          link.target = "_blank";
          link.rel = "noopener";

          var img = document.createElement("img");
          img.className = "photo";
          img.src = IMAGE_DIR + file;
          img.alt = (name !== "TBC" ? name + " — " : "") + (title !== "TBC" ? title : "Sandsprite Kelpie");
          img.loading = "lazy";

          link.appendChild(img);
          figure.appendChild(link);
        } else {
          var placeholder = document.createElement("img");
          placeholder.src = "assets/paw.svg";
          placeholder.alt = "";
          placeholder.width = 50;
          placeholder.height = 50;
          figure.appendChild(placeholder);
        }

        var figcaption = document.createElement("figcaption");
        var heading = document.createElement("strong");
        heading.textContent = (name === "TBC" && title === "TBC")
          ? "Name & title — TBC"
          : (title && title !== "TBC" ? name + " — " + title : name);
        figcaption.appendChild(heading);

        if (description) {
          var span = document.createElement("span");
          span.textContent = description;
          figcaption.appendChild(span);
        }
        figure.appendChild(figcaption);

        grid.appendChild(figure);
      });
    })
    .catch(function () {
      // Leave the static fallback cards in place if the CSV can't be loaded.
    });
})();
