({
    doInit : function(component,event,helper) {
        if(!$A.util.isEmpty(component.get('v.recordId'))) {
            component.set('v.sObjId',component.get('v.recordId'));
        }
        component.set('v.accessPermissions',{
            selectedPermissions : null
        });
        if (!$A.util.isEmpty(component.get('v.objectInformation.id'))) {
            helper.setBadgeInfo(component,component.get('v.objectInformation'));
        }
        else {
            helper.getInfoAndBadges(component);
        }
    },
    saveAccessPermissions : function(component,event,helper) {
        helper.saveBadges(component);
    },
    cancelAccessPermissions : function(component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.sObjId')
            });
            navEvt.fire();
        }
        else {
           UrlUtil.navToSObject(component.get('v.accessPermissions').id);
        }
    }
})