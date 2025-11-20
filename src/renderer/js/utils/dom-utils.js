(function(global) {
  function $(selector) {
    return document.querySelector(selector);
  }

  function $all(selector) {
    return Array.from(document.querySelectorAll(selector));
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) {
      element.textContent = value;
    }
  }

  global.DomUtils = { $, $all, setText };
})(window);
