({
    afterRender: function (component, helper) {
        this.superAfterRender();
        try {
            helper.menuItems(component);
            window.addEventListener("resize", $A.getCallback(function () {
                helper.menuItems(component);
            }), false);
            var content = document.querySelector('.fonteva-content-wrapper');

            content.addEventListener("scroll", $A.getCallback(function () {
                var nav = document.querySelector('.fonteva-navbar_mobile');
                if (content == null) {
                    return;
                }
                if (content.scrollTop > 106 && document.body.scrollHeight > 646) {
                    nav.classList.add('active');
                } else if (content.scrollTop === 0) {
                    nav.classList.remove('active');
                }
            }), false);
        }
        catch (err) {}
    }
})