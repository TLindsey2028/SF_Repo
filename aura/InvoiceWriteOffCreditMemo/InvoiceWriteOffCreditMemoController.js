({
    doInit : function(component,event,helper) {
        if (component.get('v.actionType') === 'writeOff') {
            $('#mainWrapper').addClass('hidden');
            $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
            component.find('writeOff').showModal();
        }
        else {
            helper.creditMemo(component);
        }
    },
    goBack : function (component,event,helper) {
        helper.goBackToInvoice(component);
    },
    continueWriteOff : function(component, event, helper) {
        helper.writeOff(component);
    }
})