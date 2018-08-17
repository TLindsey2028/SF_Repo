/* global $ */
({
    getCommunities: function(component) {
        var action = component.get('c.getCommunities');
        action.setCallback(this,function(response){
            if (response.getState() === 'ERROR') {
                response.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('Error loading app',error.message,false,'error');
                });
            }
            else {
                var communities = response.getReturnValue();
                component.find('networkId').setSelectOptions(JSON.parse(communities.networkOptions));
                component.find('templateId').setSelectOptions(JSON.parse(communities.templateOptions));
                var siteModal = component.find('siteModal');
                var modalBackdrop = component.find('modalBackdrop');
                $A.util.addClass(siteModal, 'slds-fade-in-open');
                $A.util.addClass(modalBackdrop, 'slds-backdrop--open');
            }
        });
        $A.enqueueAction(action);
    },
    save: function(component) {
        if (this.validateForm(component)) {
            var siteObj = component.get('v.siteObj');
            siteObj.businessGroupId = component.get('v.businessGroupId');
            var action = component.get('c.saveSite');
            action.setParams({siteJson : JSON.stringify(siteObj)});
            action.setCallback(this,function(response){
                if (response.getState() === 'ERROR') {
                    response.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var navEvt = $A.get("e.force:navigateToSObject");
                    if (!$A.util.isEmpty(navEvt)) {
                        navEvt.setParams({
                            "recordId": response.getReturnValue()
                        });
                        navEvt.fire();
                    }
                    else {
                        UrlUtil.navToUrl('/' + response.getReturnValue());
                    }
                }
            });
            $A.enqueueAction(action);
        } else {
            component.find('submitButton').stopIndicator();
        }
    },
    validateForm : function (component) {
        var isFormValid;
        component.find('name').validate();
        component.find('networkId').validate();
        component.find('templateId').validate();
        if (component.find('name').get('v.validated') && component.find('networkId').get('v.validated') && component.find('templateId').get('v.validated')) {
            isFormValid = true;
        }
        else {
            isFormValid = false;
        }
        if (isFormValid === undefined) {
            isFormValid = true;
        }
        return isFormValid;
    },
    fireComponentLoadedEvent : function(component) {
        var action = component.get('c.getSitePrefix');
        action.setCallback(this,function(result){
            $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
            var compEvent = $A.get('e.PagesApi:ComponentLoadedEvent');
            compEvent.fire();
            component.set('v.sitePrefix',result.getReturnValue());
        });
        action.setStorable();
        $A.enqueueAction(action);
    }
})