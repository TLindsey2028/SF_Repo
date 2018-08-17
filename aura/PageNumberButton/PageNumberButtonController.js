({
    init : function (component, event, helper) {
        var btn = component.find('theButton');
        var page = component.get('v.page');
        var currentPage = component.get('v.currentPage');
        if (page == currentPage) {
            btn.set('v.variant', 'brand');
        }
    },
    onclick : function(component, event, helper) {
        var event = component.getEvent('onclick');
        event.fire();
    },
    handleCurrentPageChange : function(component, event, helper) {
        var btn = component.find('theButton');
        var page = component.get('v.page');
        var currentPage = event.getParam('value');
        btn.set('v.variant', (page == currentPage ? 'brand' : 'neutral'));
    }
})