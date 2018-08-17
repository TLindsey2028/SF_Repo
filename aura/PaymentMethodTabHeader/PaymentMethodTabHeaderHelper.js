({
    setTabStatus : function (component,index) {
        var interval = setInterval($A.getCallback(function(){
            var tabs = component.find('paymentMethodTabLabel');
            if (!$A.util.isUndefinedOrNull(tabs)) {
                tabs.forEach(function (element) {
                    $A.util.removeClass(element, 'slds-active');
                });
                $A.util.addClass(tabs[index], 'slds-active');
                clearInterval(interval);
            }
        }),50);

    }
})