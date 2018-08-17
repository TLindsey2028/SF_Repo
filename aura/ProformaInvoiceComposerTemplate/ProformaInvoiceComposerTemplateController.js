({
    doInit : function(component, event, helper) {
        component.set('v.proformaInvComposerObj',{
            to : null,
            subject : null,
            sites : null,
            message : null
        });
        var action = component.get('c.isSalesOrderClosedAndReceipt');
        action.setParams({salesOrderId : component.get('v.salesOrderId')});
        action.setCallback(this, function(response){
            if (response.getState() === 'SUCCESS') {
                if(response.getReturnValue()) {
                    component.set('v.proformaInvComposerObj',{
                        to: '',
                        subject: '',
                        message: '',
                        sites : null
                    });
                    helper.getToEmailAddress(component);
                    helper.getEmailSubject(component);
                    helper.getEmailBody(component);
                    helper.getPublishedSites(component);
                    $A.util.removeClass(component.find('proformaInvoiceFields'),'hidden');
                }
            }
        });
        $A.enqueueAction(action);
        helper.fireComponentLoadedEvent(component);
    },
    validate : function(component, event, helper) {
        if (helper.validateEmailFields(component) && helper.validateForm(component.get('v.proformaInvComposerObj'), component) && helper.validateEmailAddress(component)) {
            component.set('v.validated',true);
        } else {
            component.set('v.validated',false);
        }
    },
    hideProformaInvFields : function(component, event, helper) {
        $A.util.addClass(component.find('proformaInvoiceFields'),'hidden');
    }
})