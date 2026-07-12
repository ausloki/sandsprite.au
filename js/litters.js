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

  var tbody = document.getElementById("litters-body");
  if (!tbody) return;

  fetch("data/litters.csv")
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCsv(text).slice(1).filter(function (r) { return r.length > 1; });
      if (!rows.length) return;

      tbody.innerHTML = "";
      rows.forEach(function (cols) {
        var tr = document.createElement("tr");
        cols.forEach(function (value) {
          var td = document.createElement("td");
          td.textContent = value;
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    })
    .catch(function () {
      // Leave the static fallback row in place if the CSV can't be loaded.
    });
})();
