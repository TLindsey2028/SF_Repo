({
	doInit : function(component, event, helper) {
        component.set('v.filterCriterion', {
            filterField : component.get('v.filterCriterion').filterField,
            filterOperator : component.get('v.filterCriterion').filterOperator,
            filterValue : component.get('v.filterCriterion').filterValue
        });
	    helper.buildRow(component);
	},
    valueChanged : function(component, event, helper) {
        helper.valueChanged(component, event);
    },
    deleteCriteria : function(component, event, helper) {
        helper.deleteCriteria(component, event);
    },
    handleFilterCriteriaRowSetIndexEvent : function(component, event, helper) {
        helper.handleFilterCriteriaRowSetIndexEvent(component, event);
    }
})