/* global $ */
({
    doInit : function(component,event,helper) {
        component.set('v.mediaAssetObj',{
            path : null,
            title : null,
            shortDescription : null
        });
        if (!$A.util.isEmpty(component.get('v.mediaAssetCollection'))) {
            helper.getMediaCollectionName(component);
            $A.util.removeClass(component.find('mediaAssetBody'),'slds-hide');
        }
        else {
            $A.util.removeClass(component.find('mediaAssetBodyNoCollection'),'slds-hide');
            helper.fireComponentLoadedEvent(component);
        }

        if (!$A.util.isEmpty(component.get('v.bucket')) && component.get('v.bucket').length > 0) {
            component.find('path').setOtherAttributes({generatePrefix : true,bucket : component.get('v.bucket')});
        }
    },
    saveAsset : function(component,event,helper) {
        if (helper.validateForm(component.get('v.mediaAssetObj'),component)) {
            helper.saveAssetObj(component);
        }
        else {
            component.find('saveButton').stopIndicator();
        }
    },
    exitToMediaCollection : function(component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.mediaAssetCollection')
            });
            navEvt.fire();
        }
        else {
            if (!$A.util.isEmpty(component.get('v.mediaAssetCollection'))) {
                UrlUtil.navToUrl('/' + component.get('v.mediaAssetCollection'));
            }
            else {
               windown.location = window.history.back();
            }
        }
    }
})