({
    getItemClasses: function (component) {
        var self = this;
        var action = component.get('c.getItemClasses');
        action.setParams({
            itemId: component.get('v.itemId')
        });
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var itemClasses = result.getReturnValue();
                if (itemClasses.length > 0) {
                    self.fireComponentLoadedEvent(component);
                    $A.util.removeClass(component.find('wrapper'),'slds-hide');
                    component.find('itemClasses').setSelectOptions(itemClasses,itemClasses[0].value);
                    self.getItems(component);
                    self.buildContactAccountFields(component);
                    component.find('itemClasses').set('v.fireChangeEvent',true);
                } else {
                    $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
                    component.find('itemRenewalValidationMessage').showModal();
                }
            }
        });
        $A.enqueueAction(action);
    },
    getItems : function (component) {
        var self = this;
        var otherAttributes = {};
        var action = component.get('c.getItems');
        action.setParams({
            sObjId : component.get("v.renewalPathObj").itemClasses,
            selectedItems : JSON.stringify(component.get('v.renewalPathObj.selectItems'))
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var resultObj = JSON.parse(result.getReturnValue());
                if (resultObj.error === 'true') {
                    component.find('toastMessages').showMessage('Error',resultObj.message,false,'error');
                }
                else {
                    otherAttributes = {
                        availableValues : resultObj.availableItems,
                        selectedValues : resultObj.selectedItems,
                        firstListName : $A.get("$Label.OrderApi.Available_Items"),
                        secondListName : $A.get("$Label.OrderApi.Renew_Into_Items"),
                        showSearchField : true,
                        searchPlaceholder : 'Search Items'
                    };
                    self.rebuildItemMultiDragDrop(component, otherAttributes);
                }
            }
        });
        $A.enqueueAction(action);
    },
    buildContactAccountFields : function (component) {
        var action = component.get('c.buildContactAccountFields');
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                component.set('v.accountFields',returnObj.accountFields);
                component.set('v.contactFields',returnObj.contactFields);
            }
        });
        $A.enqueueAction(action);
    },
    saveRenewalPath : function(component) {
        var action = component.get('c.saveRenewalPath');
        var renewalPathObj = component.get('v.renewalPathObj');
        if ($A.util.isUndefinedOrNull(renewalPathObj.completedTerms)) {
            renewalPathObj.completedTerms = 0;
        }
        if ($A.util.isUndefinedOrNull(renewalPathObj.defaultItem) && !$A.util.isUndefinedOrNull(renewalPathObj.selectItems)) {
            renewalPathObj.defaultItem = renewalPathObj.selectItems[0].value;
        }
        if (!$A.util.isUndefinedOrNull(renewalPathObj.selectItems)) {
            renewalPathObj.selectItems.forEach(function(element,index){
                if (!$A.util.isUndefinedOrNull(renewalPathObj.selectItems[index].selected)) {
                    renewalPathObj.selectItems[index].selected = 'true';
                } else if ($A.util.isUndefinedOrNull(renewalPathObj.selectItems[index].selected) && renewalPathObj.selectItems[index].value === renewalPathObj.defaultItem) {
                    renewalPathObj.selectItems[index].selected = 'true';
                } else {
                    renewalPathObj.selectItems[index].selected = 'false';
                }
            });
        }
        if (!$A.util.isUndefinedOrNull(renewalPathObj.renewalVariables)) {
            renewalPathObj.renewalVariables.forEach(function (element, index) {
                delete renewalPathObj.renewalVariables[index].contactFields;
                delete renewalPathObj.renewalVariables[index].accountFields;
            });
        }
        if (!$A.util.isUndefinedOrNull(renewalPathObj.selectItems)) {
            action.setParams({
                renewalPathObj : JSON.stringify(renewalPathObj),
                itemId : component.get('v.retUrl')
            });
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                    component.find('savePlan').stopIndicator();
                }
                else {
                    var navEvt = $A.get("e.force:navigateToSObject");
                    if (!$A.util.isEmpty(navEvt)) {
                        navEvt.setParams({
                            "recordId": component.get('v.itemId')
                        });
                        navEvt.fire();
                    }
                    else {
                        UrlUtil.navToUrl('/' + component.get('v.retUrl'));
                    }
                }
            });
            $A.enqueueAction(action);
        }
        else {
           component.find('toastMessages').showMessage('',$A.get("$Label.OrderApi.Item_RenewalPath_Validation"),false,'error');
           component.find('savePlan').stopIndicator();
        }

    },
    createRenewalVariableComp : function(component,variableObj,index) {
        $A.util.removeClass(component.find('variableHeadings'),'slds-hide');
        $A.createComponent('markup://OrderApi:PriceRuleVariable',variableObj,function(cmp) {
            cmp.set('v.variableObj',component.get('v.renewalPathObj').renewalVariables[index]);
            cmp.set('v.accountFields',variableObj.accountFields);
            cmp.set('v.contactFields',variableObj.contactFields);
            var divComponent = component.find('renewalVariables');
            var divBody = divComponent.get('v.body');
            divBody.push(cmp);
            divComponent.set('v.body',divBody);
        });
    },
    getExistingRenewalPaths : function(component) {
        var self = this;
        var otherAttributes = {};
        var action = component.get('c.getExistingRenewalPaths');
        action.setParams({
            itemId : component.get('v.retUrl')
        });
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                var returnObj = result.getReturnValue();
                if (returnObj) {
                   $A.util.removeClass(component.find('wrapper'),'slds-hide');
                   component.set('v.accountFields',returnObj.contactAccountFields.accountFields);
                   component.set('v.contactFields',returnObj.contactAccountFields.contactFields);
                   component.set('v.renewalPathObj.itemName',returnObj.itemName);
                   component.find('defaultItem').setSelectOptions(_.cloneDeep(returnObj.renewalPath.selectItems),returnObj.renewalPath.defaultItem);
                   component.find('itemClasses').setSelectOptions(returnObj.itemClassList, returnObj.itemClassList[0].value);
                   component.find('itemClasses').set('v.fireChangeEvent',true);
                   component.set('v.renewalPathObj.selectItems',returnObj.renewalPath.selectItems);
                   component.set('v.renewalPathObj.accountOrContact',returnObj.renewalPath.accountOrContact);
                    component.set('v.renewalPathObj.term',returnObj.renewalPath.term);
                   setTimeout($A.getCallback(function(){
                       otherAttributes = {
                           availableValues : returnObj.items,
                           selectedValues  : returnObj.renewalPath.selectItems,
                           firstListName : $A.get("$Label.OrderApi.Available_Items"),
                           secondListName : $A.get("$Label.OrderApi.Renew_Into_Items"),
                           showSearchField : true,
                           searchPlaceholder : 'Search Items'
                       };
                       self.rebuildItemMultiDragDrop(component, otherAttributes);
                   }),500);
                   if (returnObj.renewalPath.accountOrContact) {
                       component.find('accountOrContact').updateValue(returnObj.renewalPath.accountOrContact);
                       component.set('v.renewalPathObj.renewalVariables',returnObj.renewalPath.renewalVariables);
                       if (!$A.util.isUndefinedOrNull(returnObj.renewalPath.renewalVariables) && returnObj.renewalPath.renewalVariables.length > 0) {
                           $A.util.removeClass(component.find('variableHeadings'),'slds-hide');
                           returnObj.renewalPath.renewalVariables.forEach(function(element,index){
                               var variableObj = {
                                   variableObj: _.cloneDeep(element),
                                   contactFields: _.cloneDeep(returnObj.contactAccountFields.contactFields),
                                   accountFields: _.cloneDeep(returnObj.contactAccountFields.accountFields),
                                   groupName: 'group_'+index
                               };
                               self.createRenewalVariableComp(component,variableObj,index);
                           });
                       }
                   }
                   else {
                       component.find('term').updateValue(returnObj.renewalPath.term);
                       component.find('completedTerms').updateValue(returnObj.renewalPath.completedTerms);
                   }
                   self.fireComponentLoadedEvent(component);
                }
                else {
                   self.getItemClasses(component);
                }
            }
        });
        $A.enqueueAction(action);
    },
    fireComponentLoadedEvent : function(component) {
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    },
    rebuildItemMultiDragDrop : function(component, otherAttributes) {
        if (!$A.util.isUndefinedOrNull(component.get('v.renewalPathGlobalId')) && !$A.util.isUndefinedOrNull(component.find(component.get('v.renewalPathGlobalId')))) {
            var divComponent = component.find("dragDropItemsDiv");
            divComponent.set('v.body',[]);
        }
		$A.createComponent(
			'markup://Framework:'+'InputFields',
			{   fieldType : 'multidragdrop',
				'aura:id' : 'selectItems',
				label : $A.get("$Label.OrderApi.Renewal_Path_Select_Instruction"),
				value : component.get("v.renewalPathObj"),
				otherAttributes : otherAttributes,
				fireChangeEvent : true
			},
			function(cmp,status) {
				cmp.set('v.value',component.get('v.renewalPathObj'));
				component.set('v.renewalPathGlobalId', component.getGlobalId());
				var divComponent = component.find("dragDropItemsDiv");
				divComponent.set('v.body',[cmp]);
			}
		);
    },
    getMainItemName : function(component) {
        var action = component.get('c.getMainItemName');
        action.setParams({
            itemId: component.get('v.itemId')
        });
        action.setCallback(this,function(result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
               component.set('v.renewalPathObj.itemName',result.getReturnValue());
            }
        });
        $A.enqueueAction(action);
    }
})