(function () {
  "use strict";

  var TARGET_NAME = "班伴·IOS云端残血版";

  function applyName() {
    document.querySelectorAll(".about-facts .about-fact").forEach(function (fact) {
      var label = fact.querySelector("dt");
      if (!label || label.textContent.trim() !== "软件名字") return;
      var value = fact.querySelector("dd b") || fact.querySelector("dd");
      if (!value || value.textContent.trim() === TARGET_NAME) return;
      value.textContent = TARGET_NAME;
    });
  }

  function start() {
    applyName();
    var observer = new MutationObserver(applyName);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
