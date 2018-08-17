({
	doInit : function(component) {
        var compEvent = $A.get('e.Framework:ComponentLoadedEvent');
        compEvent.fire();
        component.set('v.healthCheckObj', {
            recordId : null,
            varianceStr : '5',
            lastMDate : null
        });
        component.find('varianceStr').setSelectOptions(
            [
             {"label" : 5, "value" : 5},
             {"label" : 10, "value" : 10},
             {"label" : 15, "value" : 15},
             {"label" : 20, "value" : 20},
             {"label" : 25, "value" : 25},
             {"label" : 30, "value" : 30},
             {"label" : 35, "value" : 35},
             {"label" : 40, "value" : 40},
             {"label" : 45, "value" : 45},
             {"label" : 50, "value" : 50},
			 {"label" : 55, "value" : 55},
			 {"label" : 60, "value" : 60},
			 {"label" : 120,"value": 120},
			 {"label" : 180,"value": 180}
             ], '');
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

    },
    getLogInfo: function(component) {
		var action = component.get("c.getLogs");
        action.setParams({'recordId' : component.get('v.healthCheckObj').recordId,
                          'varianceStr' : component.get('v.healthCheckObj').varianceStr,
                          'lastMDate' : component.get('v.healthCheckObj').lastMDate
                         });
        action.setCallback(this,function(response){
            if (response.getState() === 'SUCCESS') {
              var responseObj = response.getReturnValue();
                if (!$A.util.isEmpty(responseObj)) {
                  component.set('v.systemLogs', responseObj);
                }
                component.find('cmpSaveBtn').stopIndicator();
            } else {
                response.getError().forEach(function (error) {
                   component.find('toastMessages').showMessage('', error.message,false,'error','topCenter');
                });
            }
        });
        $A.enqueueAction(action);
    }
})