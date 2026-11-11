(function () {
  "use strict";

  if (!window.__BANBAN_WEB_SHIM) return;

  document.addEventListener(
    "click",
    function (event) {
      var entry = event.target.closest("#videoParserPinnedBtn");
      if (!entry) return;
      if (typeof window.__banbanOpenAlternateParser !== "function") return;
      event.preventDefault();
      event.stopImmediatePropagation();
      window.__banbanOpenAlternateParser();
    },
    true
  );
})();
