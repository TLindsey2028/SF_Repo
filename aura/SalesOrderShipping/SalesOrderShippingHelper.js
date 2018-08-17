({
    getShippingMethods: function(component) {
        var action = component.get('c.getShippingMethods');
        action.setParams({salesOrderString : JSON.stringify(component.get('v.salesOrder'))});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.shippingObj', result.getReturnValue());
                component.set('v.shippingRatesLoaded',true);
            }
        });
        action.setStorable();
        $A.enqueueAction(action);
    },
    fireWillNotShipEvent : function(component) {
        var willNotShipEvent = $A.get('e.OrderApi:WillNotShipEvent');
        willNotShipEvent.setParams(
            {
                willNotShip: component.get('v.willNotShip'),
            }
        );
        willNotShipEvent.fire();
    },
    findRatesByLocale : function(component, country, regions, items) {
        var regionIdsSelected = new Array();
        var rates = new Array();
        if ($A.util.isEmpty(regions)) {
            return;
        }
        if (!$A.util.isEmpty(regions)) {
            regions.forEach(function (reg) {
                if (!$A.util.isEmpty(reg.addressFieldCSV)) {
                    reg.addressFieldCSV.split(',').forEach(function (element) {
                        if (element.toLowerCase().trim() === country.toLowerCase().trim()) {
                            if (reg.willNotShip) {
                                component.set('v.willNotShip', true);
                                component.set('v.willNotShipMessage', reg.willNotShipMessage);
                            } else {
                                regionIdsSelected.push(reg.shippingRegionId);
                            }
                        }
                    });
                }
            });
        }
        if (!component.get('v.willNotShip') && $A.util.isEmpty(regionIdsSelected)) {
            if (!$A.util.isEmpty(regions)) {
                regions.forEach(function (reg) {
                    if (reg.isDefaultRegion) {
                        if (reg.willNotShip) {
                            component.set('v.willNotShip', true);
                            component.set('v.willNotShipMessage', reg.willNotShipMessage);
                        } else {
                            regionIdsSelected.push(reg.shippingRegionId);
                        }
                    }
                });
            }
        }
        if (component.get('v.willNotShip')) {
            this.deleteShippingLines(component);
        } else {
            if (!$A.util.isEmpty(regionIdsSelected)) {
                items.forEach(function(it) {
                    if (it.isDefaultShippingRate || (!$A.util.isEmpty(it.shippingRegion) &&
                    regionIdsSelected.indexOf(it.shippingRegion) !== -1)) {
                       rates.push(it);
                    }
                });
            }
            if ($A.util.isEmpty(rates)) {
                items.forEach(function(it) {
                    if (it.isDefaultShippingRate && $A.util.isEmpty(it.shippingRegion)) {
                       rates.push(it);
                    }
                });
            }
        }
        return rates;
    },
    getAllDefaultRates : function(component, items) {
        var self = this;
        var shippingOptions = new Array();
        if (!$A.util.isEmpty(items)) {
            items.forEach(function(it) {
                if (it.isDefaultShippingRate) {
                    self.updateShippingOption(component, shippingOptions, it);
                }
            });
        }
        return shippingOptions;
    },
    convertRate : function(fromWeightUOM, weight) {
        var convertedWeight;
        if (!$A.util.isEmpty(fromWeightUOM) && !$A.util.isEmpty(weight) && weight > 0) {
            if (fromWeightUOM === 'Milligram') {
                convertedWeight = weight * 0.000001;
            }
            else if (fromWeightUOM === 'Gram') {
                convertedWeight = weight * 0.001;
            }
            else if (fromWeightUOM === 'Kilogram') {
                convertedWeight = weight;
            }
            else if (fromWeightUOM === 'Ounce') {
                convertedWeight = weight * 0.0283495231;
            }
            else if (fromWeightUOM === 'Pound') {
                convertedWeight = weight * 0.45359237;
            }
            else {
                convertedWeight = weight;
            }
            return convertedWeight;
        }
        else {
            return weight;
        }
    },
    updateShippingOption : function(component, shippingOptions, rate) {
        var currencyFieldComp = component.find('currencyField');
        currencyFieldComp.updateValue(rate.price);
        shippingOptions.push(
            {
                "label" : rate.displayName + ' ' + currencyFieldComp.get('v.formattedValue'),
                "value" : rate.itemId
            }
        );
        return shippingOptions;
    },
    getShippingOptionsByWeight : function(component, rates, totalWeight) {
        var self = this;
        var shippingOptions = new Array();
        var rateFound = false;
        rates.forEach( function(rate) {
            var maxRateWeight = self.convertRate(rate.itemWeightUOM, rate.maxWeight);
            var minRateWeight = self.convertRate(rate.itemWeightUOM, rate.minWeight);
            if (!$A.util.isEmpty(totalWeight) && maxRateWeight >= totalWeight
                    && minRateWeight <= totalWeight) {
                rateFound = true;
                self.updateShippingOption(component, shippingOptions, rate);
            } else if (!rateFound && rate.IsDefaultShippingRate) {
                self.updateShippingOption(component, shippingOptions, rate);
            }
        });
        return shippingOptions;
    },
    getShippingOptionsByValue : function(component, rates, totalValue) {
        var self = this;
        var shippingOptions = new Array();
        var rateFound = false;
        rates.forEach( function(rate) {
            var maxRateValue = rate.maxValue;
            var minRateValue = rate.minValue;
            if (maxRateValue >= totalValue && minRateValue <= totalValue) {
                rateFound = true;
                self.updateShippingOption(component, shippingOptions, rate);
            } else if (!rateFound && rate.Is_Default_Shipping_Rate__c) {
                self.updateShippingOption(component, shippingOptions, rate);
            }
        });
        return shippingOptions;
    },
    calculateShipping: function(component) {
        var self = this;
        var shippingObj = component.get('v.shippingObj');
        var salesOrderObj = component.get('v.salesOrder');
        var ratesForLocale = new Array();
        var ratesDefault = this.getAllDefaultRates(component, shippingObj.rates);
        var pastWillNotShip = component.get('v.willNotShip');
        component.set('v.willNotShip', false);
        if (!$A.util.isEmpty(salesOrderObj.addressObj) && !$A.util.isEmpty(salesOrderObj.addressObj.country)) {
            var shippingCountry = salesOrderObj.addressObj.country.toLowerCase();
            ratesForLocale = this.findRatesByLocale(component, shippingCountry, shippingObj.regions, shippingObj.rates);
        }
        if (pastWillNotShip !== component.get('v.willNotShip')) {
            this.fireWillNotShipEvent(component);
        }
        if (!$A.util.isEmpty(ratesForLocale)) {
            if (salesOrderObj.businessGroup.enableShippingByOrder) {
                var divComponent = component.find("orderShippingDiv");
                var divBody = divComponent.get("v.body");
                if (divBody.length > 0){
                    divBody[0].destroy();
                }
                divBody = [];
                var totalOrderValue = 0;
                var totalOrderWeight = 0;
                salesOrderObj.shippingLines.forEach(function(ship) {
                    var tempTotal = 0;
                    if ($A.util.isEmpty(salesOrderObj.businessGroup.shippingRateBasis)
                    || salesOrderObj.businessGroup.shippingRateBasis === 'Item Weight') {
                        var item = shippingObj.items[ship.parentLine.item];
                        if (!$A.util.isEmpty(item.weight) && item.weight > 0) {
                            tempTotal = item.weight * ship.parentLine.quantity;
                            totalOrderWeight += self.convertRate(item.itemWeightUOM,tempTotal);
                        }
                    } else if (salesOrderObj.businessGroup.shippingRateBasis === 'Item Value') {
                        totalOrderValue +=  ship.parentLine.total;
                    }
                });
                var shippingOptions = new Array();
                if ($A.util.isEmpty(salesOrderObj.businessGroup.shippingRateBasis)
                                    || salesOrderObj.businessGroup.shippingRateBasis == 'Item Weight') {
                    shippingOptions = this.getShippingOptionsByWeight(component, ratesForLocale, totalOrderWeight);
                } else if (salesOrderObj.businessGroup.shippingRateBasis === 'Item Value') {
                    shippingOptions = this.getShippingOptionsByValue(component, ratesForLocale, totalOrderValue);
                }
                if ($A.util.isEmpty(shippingOptions) && !$A.util.isEmpty(ratesDefault)) {
                    shippingOptions = ratesDefault;
                }
                $A.createComponent(
                    'markup://Framework:InputFields',
                    {
                        'fieldType' : 'picklist',
                        'aura:id' : 'item',
                        'label' : '',
                        'value' : salesOrderObj.orderShippingLine,
                        'selectOptions' : shippingOptions,
                        'fireChangeEvent' : true,
                        'labelStyleClasses' : 'slds-hide',
                        'group' :'shipping',
                    }, function(cmp) {
                        cmp.set('v.value', salesOrderObj.orderShippingLine);
                        component.set('v.shipppingGlobalId', cmp.getGlobalId());
                        if (!$A.util.isEmpty(shippingOptions) && shippingOptions.length > 0) {
                            var valueFound = false;
                            if (!$A.util.isEmpty(salesOrderObj.orderShippingLine.item)) {
                                shippingOptions.forEach(function(element) {
                                    if (element.value === salesOrderObj.orderShippingLine.item) {
                                        valueFound = true;
                                    }
                                });
                            }
                            if (!valueFound) {
                                cmp.updateValue(shippingOptions[0].value);
                            }
                        }
                        divBody.push(cmp);
                    }
                );
                divComponent.set('v.body',divBody);
            } else {
                var divComponent = component.find("orderShippingListDiv");
                var divBody = divComponent.get("v.body");
                if (divBody.length > 0){
                    divBody.forEach(function(element) {
                        element.destroy();
                    });
                }
                divBody = []
                salesOrderObj.shippingLines.forEach(function(ship) {
                    var shippingOptions = new Array();
                    if ($A.util.isEmpty(salesOrderObj.businessGroup.shippingRateBasis)
                    || salesOrderObj.businessGroup.shippingRateBasis === 'Item Weight') {
                        var item = shippingObj.items[ship.parentLine.item];
                        if (!$A.util.isEmpty(item.weight) && item.weight > 0) {
                            shippingOptions = self.getShippingOptionsByWeight(component, ratesForLocale,
                            self.convertRate(item.itemWeightUOM, item.weight * ship.parentLine.quantity));
                        }
                    } else if (salesOrderObj.businessGroup.shippingRateBasis === 'Item Value') {
                        shippingOptions = self.getShippingOptionsByValue(component, ratesForLocale, ship.parentLine.total);
                    }
                    if ($A.util.isEmpty(shippingOptions) && !$A.util.isEmpty(ratesDefault)) {
                        shippingOptions = ratesDefault;
                    }
                    $A.createComponent(
                        'markup://OrderApi:'+'SalesOrderShippingLine',
                        {
                            'shipLine' : ship,
                            'shipOptions' : shippingOptions
                        }, function(cmp) {
                            divBody.push(cmp);
                        }
                    );
                });
                if (!$A.util.isEmpty(divBody)) {
                    divComponent.set('v.body',divBody);
                }
            }
        }
    },
    updateShippingMethod : function(component) {
        if (!$A.util.isEmpty(component.get('v.salesOrder').orderShippingLine.item)) {
            var orderShippingLine = component.get('v.salesOrder').orderShippingLine;
            orderShippingLine.salesOrder = component.get('v.salesOrder.salesOrderId');
            $A.getComponent(component.get('v.shipppingGlobalId')).setOtherAttributes({'disabled' : true},false);
            orderShippingLine.item = $A.getComponent(component.get('v.shipppingGlobalId')).get('v.value').item;
            var action = component.get('c.updateLine');
            action.setParams(
                {
                    salesOrderLineString : JSON.stringify(orderShippingLine),
                    fieldUpdated : 'item',
                }
            );
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var salesOrderObj = result.getReturnValue();
                    this.setAddress(component,salesOrderObj);
                    var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
                    solUpdateEvent.setParams(
                        {
                            salesOrder: salesOrderObj,
                            refreshShipping: true,
                        }
                    );
                    solUpdateEvent.fire();
                    this.updateCheckoutSummary(component);
                }
                $A.getComponent(component.get('v.shipppingGlobalId')).setOtherAttributes({'disabled' : false},false);
            });
            $A.enqueueAction(action);
        }
    },
    updateAddress : function(component,fieldUpdated) {
        var self = this;
        var action = component.get('c.updateSalesOrder');
        var soObject = component.get('v.salesOrder');
        if (!$A.util.isObject(soObject.addressObj) && soObject.addressObj === '') {
            soObject.addressObj = {};
        }
        if (!$A.util.isObject(soObject.billingAddressObj) && soObject.billingAddressObj === '') {
            soObject.billingAddressObj = {};
        }
        var startProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
        startProcessing.setParams({processingChanges: true});
        startProcessing.fire();
        action.setParams({salesOrderString: JSON.stringify(soObject), fieldUpdated: fieldUpdated});
        action.setCallback(this, function (result) {
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function (error) {
                    component.find('toastMessages').showMessage('', error.message, false, 'error');
                });
            }
            else {
                var so = result.getReturnValue();
                if (!so.processingChanges) {
                    self.setAddress(component, so);
                    component.set('v.salesOrder', so);
                    var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
                    solUpdateEvent.setParams(
                        {
                            salesOrder: component.get('v.salesOrder'),
                            refreshTax: true,
                            refreshAddress: true,
                        }
                    );
                    solUpdateEvent.fire();
                    self.updateCheckoutSummary(component);
                    if (Object.keys(so.addressObj).length > 0) {
                        var stopProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
                        stopProcessing.setParams({processingChanges: false});
                        stopProcessing.fire();
                    }
                    self.fireWillNotShipEvent(component);
                }
                else {
                    self.pollSOChanges(component, so);
                }
            }
        });
        $A.enqueueAction(action);
    },
    setAddress : function(component,so) {
        try {
            if (!$A.util.isUndefinedOrNull(component.find('knownAddresses'))) {
                var selectedAddress = component.find('knownAddresses').get('v.selectedAddress');
                if (!$A.util.isUndefinedOrNull(selectedAddress.address)) {
                    so.addressObj = selectedAddress.address;
                }
            }
        }
        catch(err) {}
    },
    pollSOChanges : function(component,salesOrder) {
        var self = this;
        var soCompletedCalled = false;
        var interval = setInterval($A.getCallback(function(){
            var action = component.get('c.getSalesOrder');
            action.setParams({salesOrderId : salesOrder.salesOrderId});
            action.setCallback(this,function(result){
                if (result.getState() === 'ERROR') {
                    result.getError().forEach(function(error){
                        component.find('toastMessages').showMessage('',error.message,false,'error');
                    });
                }
                else {
                    var so = result.getReturnValue();
                    if (!so.processingChanges) {
                        clearInterval(interval);
                        if (!soCompletedCalled) {
                            soCompletedCalled = true;
                            self.getCompletedSalesOrder(component, so);
                        }
                    }
                }
            });
            $A.enqueueAction(action);
        }),500);
    },
    getCompletedSalesOrder : function(component,salesOrder) {
        this.setAddress(component,salesOrder);
        component.set('v.salesOrder', salesOrder);
        var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
        solUpdateEvent.setParams(
            {
                salesOrder: component.get('v.salesOrder'),
                refreshTax: true,
                refreshAddress: true
            }
        );
        solUpdateEvent.fire();
        this.updateCheckoutSummary(component);
        var stopProcessing = $A.get('e.OrderApi:ProcessingChangesEvent');
        stopProcessing.setParams({processingChanges : false});
        stopProcessing.fire();
    },
    updateCheckoutSummary : function (component) {
        try {
            if (component.get('v.isPortal') && component.get('v.isThemed')) {
                checkoutSummary.loadTotals();
            }
        }
        catch (err){}
    },
    handleSalesOrderUpdate : function(component, event) {
        var salesOrderObj = event.getParam('salesOrder');
        component.set('v.salesOrder', salesOrderObj);
        if (event.getParam('refreshShippingMethod') && component.get('v.salesOrder').shippingRequired) {
            this.calculateShipping(component);
        }
    },
    deleteShippingLines : function(component) {
        var action = component.get('c.updateSalesOrder');
        action.setParams({salesOrderString : JSON.stringify(component.get('v.salesOrder')), fieldUpdated : 'deleteAddressLines'});
        action.setCallback(this,function(result){
            if (result.getState() === 'ERROR') {
                result.getError().forEach(function(error){
                    component.find('toastMessages').showMessage('',error.message,false,'error');
                });
            }
            else {
                component.set('v.salesOrder', result.getReturnValue());
                var solUpdateEvent = $A.get('e.OrderApi:SalesOrderUpdateEvent');
                solUpdateEvent.setParams(
                    {
                        salesOrder: component.get('v.salesOrder'),
                        refreshShipping : true
                    }
                );
                solUpdateEvent.fire();
                this.updateCheckoutSummary(component);
            }
        });
        $A.enqueueAction(action);
    },
    buildShippingTaxFieldText : function(component) {
        if (component.get('v.salesOrder.shippingRequired') && component.get('v.salesOrder.taxRequired')) {
            if (JSON.stringify(component.get('v.salesOrder.addressObj')) !== JSON.stringify(component.get('v.salesOrder.billingAddressObj'))) {
                component.set('v.linkTextShipping',$A.get("$Label.OrderApi.Shipping_Address_Sales_Order"));
                component.set('v.fieldTextShipping',$A.get("$Label.OrderApi.Shipping_Only_Address_Sales_Order"));
                component.set('v.showingTaxField',true);
            }
            else {
                component.set('v.fieldTextShipping',$A.get("$Label.OrderApi.Shipping_Address_Sales_Order"));
                component.set('v.linkTextShipping',$A.get('$Label.OrderApi.Separate_Tax_Address_Sales_Order'));
            }
        }
        else if (!component.get('v.salesOrder.shippingRequired') && component.get('v.salesOrder.taxRequired')) {
            component.set('v.fieldTextShipping',$A.get("$Label.OrderApi.Tax_Address_Sales_Order"));
        }
        else if (component.get('v.salesOrder.shippingRequired') && !component.get('v.salesOrder.taxRequired')) {
            component.set('v.fieldTextShipping',$A.get("$Label.OrderApi.Shipping_Only_Address_Sales_Order"));
        }
    }
})