var add = function (x) {
    return function (y) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
            key: x+y
        }), "*");
        return x + y; 
    };
}