({
    retrievePackageDetails : function(component) {
        var self = this;
        var action = component.get('c.getPackageDetails');
        action.setParams({
                parentItemId : component.get('v.parentItemId'),
                packageId : component.get('v.packageId')
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                self.loadPackageDetails(component,result.getReturnValue());
            }
            this.fireComponentLoadedEvent(component);
        });
        $A.enqueueAction(action);
    },
    loadPackageDetails : function(component,packageObj) {
        if (packageObj.maxQuantity === -1) {
            packageObj.maxQuantity = null;
        }
        if (packageObj.minQuantity === -1) {
            packageObj.minQuantity = null;
        }
        if (packageObj.maxQuantityPerItem === -1) {
            packageObj.maxQuantityPerItem = null;
        }
        component.set('v.packageObj', packageObj);
        this.buildItemLookUp(component);
        if ($A.util.isUndefinedOrNull(component.get('v.parentItemId')) ||
            (!$A.util.isUndefinedOrNull(component.get('v.parentItemId')) && component.get('v.parentItemId').length === 0)) {
            component.set('v.parentItemId',packageObj.parentItemId);
        }
        var compEvents = $A.get('e.Framework:RefreshInputField');
        compEvents.setParams({group : 'package', type:'value' , data : packageObj});
        compEvents.fire();
    },
    save : function(component) {
        var self = this;
        var action = component.get('c.savePackageDetails');
        action.setParams({
                packageJsonString : JSON.stringify(component.get('v.packageObj'))
            }
        );
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
                component.find('saveButton').stopIndicator();
            }
            else {
                self.exitPage(component);
            }
        });
        $A.enqueueAction(action);
    },
    buildItemLookUp : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.pckgItemGlobalId')) && !$A.util.isUndefinedOrNull($A.getComponent(component.get('v.pckgItemGlobalId')))) {
            var divComponent = component.find("entityDiv");
            divComponent.set("v.body",[]);
        }
              $A.createComponent(
                  'Framework:InputFields',{
                      value : component.get('v.packageObj'),
                      fieldType : 'lookup',
                      'aura:id' : 'item',
                      group : 'package1',
                      label : $A.get("$Label.OrderApi.Select_Package_Item"),
                      fireChangeEvent : true,
                      isRequired : true,
                      otherAttributes : {
                          advanced: true,
                          loadBaseValues : false,
                          concatenateLabel : true,
                          types : {
                              OrderApi__Item__c : {
                                  fieldNames : ['Name', 'OrderApi__Line_Description__c','OrderApi__Is_Subscription__c','OrderApi__Is_Contribution__c'],
                                  filter : 'OrderApi__Is_Active__c = true AND OrderApi__Is_Event__c = false AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Rate__c = false',
                                  initialLoadFilter : 'OrderApi__Is_Active__c = true AND OrderApi__Is_Tax__c = false AND OrderApi__Is_Shipping_Rate__c = false ORDER BY OrderApi__Item_Class__r.OrderApi__Sold_Inventory__c DESC LIMIT 30'
                              }
                          },
                          otherMethods: {
                              searchField : ['sObjectLabel','Name', 'OrderApi__Line_Description__c','OrderApi__Is_Subscription__c','OrderApi__Is_Contribution__c','OrderApi__Item_Class__r.Name'],
                              render: {
                                  option: function (item, escape) {
                                      var lowerText = '';
                                      if (item.sObj.OrderApi__Is_Subscription__c) {
                                          lowerText = escape('Subscriptions');
                                      }
                                      else if(item.sObj.Is_Contribution__c) {
                                          lowerText = escape('Contribution')+'&nbsp;&nbsp;-&nbsp;&nbsp;'+escape(item.sObj.OrderApi__Line_Description__c);
                                      }
                                      return '<div class="slds-grid">' +
                                          '<div class="slds-col slds-grid slds-wrap"><div class="slds-col slds-size--1-of-1 slds-text-weight--regular">' + escape(item.sObj.Name) +
                                          '</div><div class="slds-col slds-size--1-of-1 slds-text-body--small">'+lowerText+'</div></div></div>' ;
                                  },
                                  item: function (item, escape) {
                                        return '<div>' + escape(item.sObj.Name) + '</div>';
                                  }
                              }
                          }
                      }
                  }, function(cmp) {
                      cmp.set('v.value',component.get('v.packageObj'));
                      component.set('v.pckgItemGlobalId',cmp.getGlobalId());
                      var divComponent = component.find("entityDiv");
                      divComponent.set("v.body",[cmp]);
                  }
              );
    },
    buildItemClassLookUp : function(component) {
        if (!$A.util.isUndefinedOrNull(component.get('v.pckgItemClassGlobalId')) && !$A.util.isUndefinedOrNull($A.getComponent(component.get('v.pckgItemClassGlobalId')))) {
            var divComponent = component.find("entityDiv");
            divComponent.set("v.body",[]);
        }
        $A.createComponent(
            'markup://Framework:InputFields',
            {
                group : 'package1',
                fieldType : 'lookup',
                'aura:id' : 'itemClass',
                fireChangeEvent : true,
                isRequired : true,
                label : $A.get("$Label.OrderApi.Select_Package_Item_Class"),
                value : component.get('v.packageObj'),
                otherAttributes : {
                    type : 'OrderApi__Item_Class__c',
                    filter : 'OrderApi__Is_Active__c=true'
                }
            }, function(cmp) {
                component.set('v.pckgItemClassGlobalId',cmp.getGlobalId());
                cmp.set('v.value', component.get('v.packageObj'));
                var divComponent = component.find("entityDiv");
                divComponent.set("v.body",[cmp]);
            }
        );
    },
    validateForm : function(component) {
        var isFormValid;
        if ($A.util.isUndefinedOrNull(component.get('v.packageObj.isRequired')) || (!$A.util.isUndefinedOrNull(component.get('v.packageObj.isRequired')) &&
            !component.get('v.packageObj.isRequired'))) {
            component.find('displayName').validate();
            if (!component.find('displayName').get('v.validated')) {
                isFormValid = false;
            }
            if (component.get('v.packageObj').type === 'item') {
                component.find('minQuantity').validate();
                component.find('maxQuantity').validate();
                if (!component.find('minQuantity').get('v.validated') || !component.find('maxQuantity').get('v.validated')) {
                    isFormValid = false;
                }
                else if ((component.find('minQuantity').get('v.validated') && component.find('maxQuantity').get('v.validated')) && !$A.util.isUndefinedOrNull(component.get('v.packageObj').maxQuantity) && !$A.util.isUndefinedOrNull(component.get('v.packageObj').minQuantity) &&
                    component.get('v.packageObj').maxQuantity < component.get('v.packageObj').minQuantity) {
                    isFormValid = false;
                    component.find('maxQuantity').setErrorMessages([{message: 'Max Quantity cannot be less than Min Quantity'}])
                }
            }
        }
        if (!$A.util.isEmpty(component.get('v.packageObj.isRequired')) && component.get('v.packageObj.isRequired') &&
            component.get('v.packageObj.type') === 'item') {
            component.find('minQuantity').validate();
            if (!component.find('minQuantity').get('v.validated')) {
                isFormValid = false;
            }
        }
        if (component.get('v.packageObj').type === 'item') {
            $A.getComponent(component.get('v.pckgItemGlobalId')).validate();
            if (!$A.getComponent(component.get('v.pckgItemGlobalId')).get('v.validated')) {
                isFormValid = false;
            }
        } else {
            $A.getComponent(component.get('v.pckgItemClassGlobalId')).validate();
            if (!$A.getComponent(component.get('v.pckgItemClassGlobalId')).get('v.validated')) {
                isFormValid = false;
            }
        }
        if (isFormValid == undefined) {
            isFormValid = true;
        }

        return isFormValid;
    },
    exitPage : function(component) {
        var navEvt = $A.get("e.force:navigateToSObject");
        if (!$A.util.isEmpty(navEvt)) {
            navEvt.setParams({
                "recordId": component.get('v.parentItemId')
            });
            navEvt.fire();
        }
        else {
            UrlUtil.navToSObject(component.get('v.parentItemId'));
        }
    },
    fireComponentLoadedEvent : function(component) {
        $('#mainWrapper').addClass('hidden');
        $A.util.removeClass(component.find('mainWrapperDiv'),'hidden');
        var compEvent = $A.get('e.OrderApi:ComponentLoadedEvent');
        compEvent.fire();
    }
})