({
    doInit : function (component,event,helper) {
        helper.setTabStatus(component,0);
    },
    changeTab : function (component, event,helper) {
        event.preventDefault();
        var e = $A.get('e.OrderApi:PaymentMethodChangeEvent');
        e.setParams({methodId: event.target.dataset.tab,lightningComponent : event.target.dataset.comp});
        e.fire();
        helper.setTabStatus(component,event.target.dataset.index);
    }
})