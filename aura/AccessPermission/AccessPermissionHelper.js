({
    getInfoAndBadges : function(component) {
        var self = this;
        var action = component.get('c.getBadgeData');
        action.setParams({sObjId : component.get('v.sObjId')});
        action.setCallback(this,function(result){
            if (result.getState() === 'SUCCESS') {
                var resultObj = JSON.parse(result.getReturnValue());
                if (resultObj.error === 'true') {
                    component.find('toastMessages').showMessage('Error',resultObj.message,false,'error');
                }
                else {
                    self.setBadgeInfo(component,resultObj);
                }
                self.fireComponentLoadedEvent(component);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    setBadgeInfo : function (component,resultObj) {
        component.set('v.objectInformation', resultObj);
        component.set('v.accessPermissions', {id: resultObj.id,selectedPermissions : []});
        var badgeInputField = component.find('selectedPermissions');
        badgeInputField.setOtherAttributes({
            availableValues: resultObj.availablePermissions,
            selectedValues: resultObj.selectedPermissions,
            firstListName: $A.get("$Label.OrderApi.Access_Permissions_First_List_Label"),
            secondListName: $A.get("$Label.OrderApi.Access_Permissions_Second_List_Label")
        });
    },
    saveBadges : function(component) {
        var action = component.get('c.saveBadges');
        action.setParams({accessObjJSON : JSON.stringify(component.get('v.accessPermissions'))});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var resultObj = result.getReturnValue();
                var navEvt = $A.get("e.force:navigateToSObject");
                if (!$A.util.isEmpty(navEvt)) {
                    navEvt.setParams({
                        "recordId": component.get('v.sObjId')
                    });
                    navEvt.fire();
                }
                else {
                    UrlUtil.navToUrl(resultObj.location);
                }
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    }
})