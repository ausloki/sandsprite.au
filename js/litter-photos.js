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

  var grid = document.getElementById("litter-photos-grid");
  if (!grid) return;

  var IMAGE_DIR = "assets/litters-photos/";

  fetch("data/litter-photos.csv")
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCsv(text).slice(1).filter(function (r) { return r.length > 1; });
      if (!rows.length) return;

      grid.innerHTML = "";
      rows.forEach(function (cols) {
        var file = cols[0];
        var caption = cols[1] || "";
        var alt = cols[2] || "";
        var description = cols[3] || "";

        var figure = document.createElement("figure");
        figure.className = "gallery-item";

        var link = document.createElement("a");
        link.href = IMAGE_DIR + file;
        link.target = "_blank";
        link.rel = "noopener";

        var img = document.createElement("img");
        img.className = "photo";
        img.src = IMAGE_DIR + file;
        img.alt = alt;
        img.loading = "lazy";

        link.appendChild(img);
        figure.appendChild(link);

        if (caption || description) {
          var figcaption = document.createElement("figcaption");
          figcaption.textContent = caption;
          if (description) {
            figcaption.classList.add("has-description");
            var desc = document.createElement("span");
            desc.className = "desc";
            desc.textContent = description;
            figcaption.appendChild(desc);
          }
          figure.appendChild(figcaption);
        }

        grid.appendChild(figure);
      });
    })
    .catch(function () {
      // Leave the static fallback photos in place if the CSV can't be loaded.
    });
})();
