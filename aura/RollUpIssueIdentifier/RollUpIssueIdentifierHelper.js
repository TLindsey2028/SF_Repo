({
    doInit : function(component) {
        this.getRollUpInfo(component);
    },
    getRollUpInfo : function(component) {
        var action = component.get('c.verifyRollupSummary');
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
                var responseObj = response.getReturnValue();
                if (!$A.util.isEmpty(responseObj)) {
                  component.set('v.healthCheckObjBadRsfs', responseObj.badRsfs.length);
                  component.set('v.healthCheckObjduplicateRsfs', responseObj.duplicateRsfs.length);
                  component.set('v.healthCheckObjbadChildObjects', JSON.stringify(responseObj.badChildObjectsList));
                }
                var compEvent = $A.get('e.Framework:ComponentLoadedEvent');
                compEvent.fire();
            } else {
                  response.getError().forEach(function(error) {
                  component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                  });
            }
        });
        $A.enqueueAction(action);
    },
    collapseList: function(component, event) {
        var btnId;
        switch (event.currentTarget.id) {
            case 'logLookupDownBtn'  :
            case 'logLookupRightBtn' :
                btnId = 'logLookup';
                break;
            case 'dataTableDownBtn'  :
            case 'dataTableRightBtn' :
                btnId = 'dataTable';
                break;
            case 'defaultTableDownBtn'  :
            case 'defaultTableRightBtn' :
                btnId = 'defaultTable';
                break;
            default :
            btnId = '';
    }
    $A.util.toggleClass(document.getElementById(btnId), 'hide');
    $A.util.toggleClass(document.getElementById(btnId+'DownBtn'), 'hide');
    $A.util.toggleClass(document.getElementById(btnId+'RightBtn'), 'hide');
    }
})