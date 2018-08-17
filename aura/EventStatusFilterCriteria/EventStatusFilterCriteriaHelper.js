/* global $ */
/* global _ */
({
	"CONSTANTS" : {
	    filterTemplate : {filterField: '', filterOperator: '', filterValue: ''}
	},
    renderAllCriteria : function(component) {
        component.set("v.body", []);
        var criteriaLen = component.get("v.filterCriteria").length;
        for (var i = 0; i < criteriaLen; i++) {
            this.createRowComponent(component, i, (i !== criteriaLen - 1 ? true : false));
        }
    },
    createRow : function(component, event) {
        var filterRowPlaceholder = component.find("filterRowPlaceholder");
        var body = filterRowPlaceholder.get("v.body");
        var criteria = component.get("v.filterCriteria");
        if (event.getParam('eventGroup') === body[body.length - 1].get("v.group")) {
            criteria.push(_.cloneDeep(this.CONSTANTS.filterTemplate));
            component.set("v.filterCriteria", criteria);
            this.createRowComponent(component, criteria.length - 1, false);
        }
    },
    createRowComponent : function(component, counter, hasDeleteButton) {
        $A.createComponent(
            "markup://EventApi:EventStatusFilterCriteriaRow",
            {
                sObjectName : 'EventApi__Event__c',
                filterCriterion : component.get('v.filterCriteria')[counter],
                fieldOptions : _.cloneDeep(component.get("v.fieldApiNames")),
                fieldTypes : component.get("v.valueToFieldTypes"),
                group : (Date.now() * Math.random()).toString(),
                showDeleteButton : hasDeleteButton,
                index : counter + 1
            },
            function(cmp) {
                var filterRowPlaceholder = component.find("filterRowPlaceholder");
                var filterRowPlaceholderBody = filterRowPlaceholder.get("v.body");
                filterRowPlaceholderBody.push(cmp);
                filterRowPlaceholder.set("v.body",filterRowPlaceholderBody);
                cmp.set("v.filterCriterion", component.get('v.filterCriteria')[filterRowPlaceholderBody.length - 1]);
                cmp.set("v.fieldTypes", component.get("v.valueToFieldTypes"));
            }
        );
    },
    removeFilterRow : function(component, event) {
        var group = event.getParam("group");
        var filterRowPlaceholder = component.find("filterRowPlaceholder");
        var body = filterRowPlaceholder.get("v.body");
        var index = 0;
        for (var i=0; i < body.length; i++) {
            if (group === body[i].get("v.group")) {
                var filterCriteria = component.get("v.filterCriteria");
                filterCriteria.splice(i, 1);
                component.set("v.filterCriteria", filterCriteria);
                body[i].destroy();
                body.splice(i, 1);
                filterRowPlaceholder.set("v.body", body);
                break;
            }
        }
    }
})