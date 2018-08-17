({
	"filterFieldOperation" : [
          {
              label : "Equals",
              value : "="
          },
          {
              label : "Not equals",
              value : "!="
          },
          {
              label : "Less than",
              value : "<"
          },
          {
              label : "Less than or equal",
              value : "<="
          },
          {
              label : "Greater than",
              value : ">"
          },
          {
              label : "Greater than or equal",
              value : ">="
          },
          {
              label : "Contains",
              value : "LIKE"
          },
          {
              label : "Does not contain",
              value : "NOT LIKE"
          },
          {
              label : "Starts with",
              value : "LIKE%"
          },
          {
              label : "Ends with",
              value : "%LIKE"
          },
          {
              label : "Includes",
              value : "IN"
          },
          {
              label : "Excludes",
              value : "NOT IN"
          }
    ],
	buildRow : function(component) {
	    var filterCriterion = component.get('v.filterCriterion');
	    var filterFieldOptions = component.get('v.fieldOptions');
        var self = this;
        setTimeout($A.getCallback(function(){
            self.updateValueFieldType(component, filterCriterion.filterField, filterCriterion.filterValue);
        }), 400);
        component.find('filterField').setSelectOptions(filterFieldOptions, filterCriterion.filterField);
        component.find('filterOperator').setSelectOptions(this.filterOperators(component), filterCriterion.filterOperator);
	},
	updateValueFieldType : function(component, selectedField, value) {
	    if (!$A.util.isEmpty(selectedField)) {
	        var fieldType = component.get("v.fieldTypes")[selectedField].fieldType.toLowerCase();
	        var otherAttributes = {};
	        var selectOptions = [];
	        if (fieldType === "picklist" || fieldType === "multipicklist") {
	            fieldType = "multipicklist";
	            otherAttributes = {objectName: component.get("v.sObjectName"), field: selectedField, maxAllowed: 1};
	        } else if (fieldType === "reference" || fieldType === "id" || fieldType === "double") {
	            fieldType = "string";
            } else if (fieldType === "boolean") {
                fieldType = "multipicklist";
                selectOptions = [{"value":"TRUE","label":"TRUE"},{"value":"FALSE","label":"FALSE"}];
                otherAttributes = {maxAllowed: 1};
            }
            $A.createComponent('markup://Framework:InputFields',
                {
                    fieldType : fieldType.toLowerCase(),
                    'aura:id' : 'filterValue',
                    group : component.get('v.group'),
                    label : '',
                    value : component.get('v.filterCriterion'),
                    otherAttributes : otherAttributes,
                    selectOptions : selectOptions
                },function(cmp){
                    cmp.set('v.value', component.get('v.filterCriterion'));
                    component.find("filterValueDiv").set('v.body',[cmp]);
                });
            var filterCriterion = component.get('v.filterCriterion');
            component.find('filterOperator').setSelectOptions(this.filterOperators(component), filterCriterion.filterOperator);
        }
	},
    valueChanged : function(component, event) {
        if (event.getParam('group') === component.get('v.group') ){
            var rowCriteria = component.get('v.filterCriterion');
            if (event.getParam("fieldId") === "filterField") {
                component.set('v.filterCriterion.filterValue', '');
                this.updateValueFieldType(component, rowCriteria.filterField, rowCriteria.filterValue);
                component.find('filterOperator').updateValue(null, false);
            }
            if (!$A.util.isEmpty(rowCriteria.filterField) && !$A.util.isEmpty(rowCriteria.filterOperator)) {
                event.stopPropagation();
                component.set("v.showDeleteButton", true);
                var createRowEvent = $A.get("e.EventApi:FilterCriteriaRowSet");
                createRowEvent.setParams({
                    eventGroup: event.getParam('group')
                });
                createRowEvent.fire();
            }
        }
    },
    deleteCriteria : function(component, event) {
        var FilterCriteriaRowSetIndexEvent = $A.get("e.EventApi:FilterCriteriaRowSetIndexEvent");
        FilterCriteriaRowSetIndexEvent.setParams({
            "rowIndex" : component.get("v.index")
        });
        FilterCriteriaRowSetIndexEvent.fire();
        var deleteRowEvent = $A.get("e.EventApi:DeleteFilterRow");
        deleteRowEvent.setParams({
            "group" : component.get("v.group")
        });
        deleteRowEvent.fire();
        event.stopPropagation();
    },
    handleFilterCriteriaRowSetIndexEvent : function(component, event, helper) {
        if (component.get('v.index') > event.getParam('rowIndex')) {
            component.set('v.index', component.get('v.index') - 1);
        }
    },
    filterOperators : function(component) {
        var filterOperators = ['=', '!=', '<', '<=', '>', '>=', 'like', 'not like', 'like%', '%like', 'in', 'not in'];
        var filterCriterion = component.get('v.filterCriterion');
        if (!$A.util.isEmpty(filterCriterion.filterField)) {
            var fieldType = component.get("v.fieldTypes")[filterCriterion.filterField].fieldType.toLowerCase();
            switch (fieldType) {
                case 'date' :
                case 'datetime' :
                case 'integer' :
                case 'percent' :
                case 'currency' :
                case 'double' :
                    filterOperators =['=', '!=', '<', '<=', '>', '>='];
                    break;
                case 'boolean' :
                case 'reference' :
                case 'id' :
                    filterOperators = ['=', '!='];
                    break;
                case 'string' :
                case 'picklist' :
                case 'phone' :
                case 'url' :
                case 'email' :
                    filterOperators = ['=', '!=', 'like', 'not like', 'like%', '%like'];
                    break;
                case 'multipicklist' :
                    filterOperators = ['=', '!=', 'in', 'not in'];
                    break;
                default :
                    break;
            }
        }
        return _.filter(this.filterFieldOperation, function(o){ return _.indexOf(filterOperators, o.value.toLowerCase()) > -1});
    }
})