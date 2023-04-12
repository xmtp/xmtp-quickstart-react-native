var add = function (x) {
    return function (y) { window.postMessage(x + y); return x + y; };
}