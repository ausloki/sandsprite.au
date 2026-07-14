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

  var grid = document.getElementById("gallery-grid");
  if (!grid) return;

  var IMAGE_DIR = "assets/gallery-photos/";

  fetch("data/gallery.csv")
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCsv(text).slice(1).filter(function (r) { return r.length > 1; });
      if (!rows.length) return;

      var photos = rows.map(function (cols) {
        return { file: cols[0], date: cols[1], caption: cols[2], alt: cols[3], description: cols[4] };
      });
      photos.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });

      grid.innerHTML = "";
      photos.forEach(function (photo) {
        var figure = document.createElement("figure");
        figure.className = "gallery-item";

        var link = document.createElement("a");
        link.href = IMAGE_DIR + photo.file;
        link.target = "_blank";
        link.rel = "noopener";

        var img = document.createElement("img");
        img.className = "photo";
        img.src = IMAGE_DIR + photo.file;
        img.alt = photo.alt || "";
        img.loading = "lazy";

        link.appendChild(img);
        figure.appendChild(link);

        var figcaption = document.createElement("figcaption");
        figcaption.textContent = photo.caption || "";
        if (photo.description) {
          figcaption.classList.add("has-description");
          var desc = document.createElement("span");
          desc.className = "desc";
          desc.textContent = photo.description;
          figcaption.appendChild(desc);
        }
        figure.appendChild(figcaption);

        grid.appendChild(figure);
      });
    })
    .catch(function () {
      // Leave the static fallback photos in place if the CSV can't be loaded.
    });
})();
