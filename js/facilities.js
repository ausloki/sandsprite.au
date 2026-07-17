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

  var grid = document.getElementById("facilities-grid");
  if (!grid) return;

  var IMAGE_DIR = "assets/facilities/";
  var CATEGORY_ORDER = ["Kitchenette", "Boarding suites", "Cattery", "Daycare play yard", "Outdoor runs", "Large Day Pens", "Small Day Pens"];

  // ---------- Lightbox (shared across all categories) ----------
  var lightbox = document.createElement("div");
  lightbox.className = "lightbox-overlay";
  lightbox.hidden = true;
  lightbox.innerHTML =
    '<div class="lightbox-content">' +
      '<button class="lightbox-close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox-prev" type="button" aria-label="Previous photo">&#8249;</button>' +
      '<img class="lightbox-image" alt="">' +
      '<button class="lightbox-next" type="button" aria-label="Next photo">&#8250;</button>' +
      '<div class="lightbox-info">' +
        '<span class="lightbox-caption"></span>' +
        '<span class="lightbox-counter"></span>' +
        '<a class="lightbox-original" target="_blank" rel="noopener">Open full size &#8599;</a>' +
      '</div>' +
    '</div>';
  document.body.appendChild(lightbox);

  var lightboxImage = lightbox.querySelector(".lightbox-image");
  var lightboxCaption = lightbox.querySelector(".lightbox-caption");
  var lightboxCounter = lightbox.querySelector(".lightbox-counter");
  var lightboxOriginal = lightbox.querySelector(".lightbox-original");

  var currentPhotos = [];
  var currentIndex = 0;
  var currentCategory = "";

  function showPhoto(index) {
    currentIndex = (index + currentPhotos.length) % currentPhotos.length;
    var photo = currentPhotos[currentIndex];
    lightboxImage.src = IMAGE_DIR + photo.file;
    lightboxImage.alt = photo.alt || currentCategory;
    lightboxCaption.textContent = photo.description || "";
    lightboxCounter.textContent = (currentIndex + 1) + " of " + currentPhotos.length;
    lightboxOriginal.href = IMAGE_DIR + photo.file;
  }

  function openLightbox(category, photos) {
    currentCategory = category;
    currentPhotos = photos;
    showPhoto(0);
    lightbox.hidden = false;
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = "";
  }

  lightbox.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
  lightbox.querySelector(".lightbox-prev").addEventListener("click", function () { showPhoto(currentIndex - 1); });
  lightbox.querySelector(".lightbox-next").addEventListener("click", function () { showPhoto(currentIndex + 1); });
  lightbox.addEventListener("click", function (e) {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", function (e) {
    if (lightbox.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (e.key === "ArrowRight") showPhoto(currentIndex + 1);
  });

  // ---------- Category grid ----------
  fetch("data/facilities.csv")
    .then(function (res) { return res.text(); })
    .then(function (text) {
      var rows = parseCsv(text).slice(1).filter(function (r) { return r.length > 1; });
      if (!rows.length) return;

      var byCategory = {};
      rows.forEach(function (cols) {
        var photo = { file: cols[0], category: cols[1], alt: cols[2] || "", description: cols[3] || "" };
        (byCategory[photo.category] = byCategory[photo.category] || []).push(photo);
      });

      grid.innerHTML = "";
      CATEGORY_ORDER.forEach(function (category) {
        var photos = byCategory[category];
        var figure = document.createElement("figure");
        figure.className = "gallery-item";

        if (!photos || !photos.length) {
          var icon = document.createElement("img");
          icon.src = "assets/paw.svg";
          icon.alt = "Photo placeholder";
          icon.width = 60;
          icon.height = 60;
          figure.appendChild(icon);
        } else {
          var button = document.createElement("button");
          button.type = "button";
          button.className = "gallery-item-trigger";
          button.setAttribute("aria-label", "View all " + category + " photos (" + photos.length + ")");

          var img = document.createElement("img");
          img.className = "photo";
          img.src = IMAGE_DIR + photos[0].file;
          img.alt = photos[0].alt || category;
          img.loading = "lazy";

          button.appendChild(img);
          button.addEventListener("click", function () { openLightbox(category, photos); });
          figure.appendChild(button);
        }

        var figcaption = document.createElement("figcaption");
        figcaption.textContent = category + (photos && photos.length > 1 ? " (" + photos.length + ")" : "");
        figure.appendChild(figcaption);

        grid.appendChild(figure);
      });
    })
    .catch(function () {
      // Leave the static fallback tiles in place if the CSV can't be loaded.
    });
})();
