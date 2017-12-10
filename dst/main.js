document.addEventListener('DOMContentLoaded', function () {
    window.root = new test.FireLayout();
    root.attach(document.getElementById('container'));
    root.init();
    root.animationTest();
});