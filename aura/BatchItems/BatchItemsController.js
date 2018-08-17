({
    myAction : function(component, event, helper) {
        component.set("v.openPledgesPopped", false);
        component.set("v.doneRendering", false);
        var batch = component.get("v.batch");
        component.set("v.batchId", batch.Id);
        
        var close = component.get("v.close");
        if (close)
            component.set("v.closeStep", 1);
        else
            component.set("v.closeStep", 0);
        component.set("v.closeError1", "");
        if (close) 
            component.set("v.showDataEntry", false);
        else
            component.set("v.showDataEntry", true);
        component.set("v.currentSort", "");
        
        helper.getBatchItems(component);    
        //if (!close) 
        //    helper.setDefaults(component);

        /*var action = component.get("c.getBatch");
        action.setParams({
            "batchId": component.get("v.batchId")
        });
        action.setCallback(this, function(data) {
            component.set("v.batch", data.getReturnValue());
        	helper.getBatchItems(component);    
        	if (!close) 
            	helper.setDefaults(component);
        });
        $A.enqueueAction(action);*/
    },
    
    onRender : function(component, event, helper) {
        var com = component.find('hiddenLookup'); 
        if (com != undefined)
        	$A.util.addClass(com, 'slds-hide'); 

        var done = component.get("v.doneRendering");
        if (!done) {
       		var close = component.get("v.close");
            if (!close) 
                helper.setDefaults(component);
            if (!close && component.get("v.batch").RecordType.Name != 'Open Batch') {
                document.getElementById("dataEntryForm").style.display="none";
                document.getElementById("deToggle").style.display="none";
            }
            component.set("v.doneRendering", true);
        }
        if (component.get("v.voidAndCorrect") == true) {
            var amtElement;
            var c = component.get("v.voidTransaction.AQB__Method__c");
            if (c != null) {
                if (c == 'Pledge' || c == 'Grant') 
                	document.getElementById("inputAmount2").disabled = true;
                else if (c == 'Credit Card') 
                	document.getElementById("inputAmount3").disabled = true;
                else if (c == 'Securities')
                	document.getElementById("inputAmount4").disabled = true;
                else if (c == 'Service') 
                	document.getElementById("inputAmount5").disabled = true;
                else 
                	document.getElementById("inputAmount").disabled = true;
            }
        }
        else if (component.get("v.currentLinkIndicator") == "verifySoftCredits") {
            var radiobtn;
            var softCredits = component.get("v.softCreditAccounts");
            var index = component.get("v.currentSoftCredit");
            if (softCredits.length > 0 && softCredits.length >= index + 1) {
                var scForm = document.getElementById("softCreditPaymentForm");
                if (scForm != null)
            		document.getElementById("softCreditPaymentForm").style.display="none";        	        
                if (softCredits[index].AQB__LinkToPledge__c != null) {
                    radiobtn = document.getElementById(softCredits[index].AQB__LinkToPledge__c);
                    if (radiobtn != null) {
                    	component.set("v.accountOption", softCredits[index].AQB__LinkToPledge__c);
                        radiobtn.checked = true;  
                        var action = component.get("c.getOpenPledgeTransactions");
                        action.setParams({
                            "pledgeId": softCredits[index].AQB__LinkToPledge__c
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.openPledgeTransactions", data.getReturnValue());
                            if (softCredits[index].AQB__NumberOfPayments__c > 0) {
                            	// get soft credit payments and set amounts
                                var action2 = component.get("c.getSoftCreditPayments");
                                action2.setParams({
                                    "scId": softCredits[index].Id
                                });
                                action2.setCallback(this, function(data) {
                                    var softCreditPayments = data.getReturnValue();
                                    for (var i = 0; i < softCreditPayments.length; i++) {
                                        var getAll = component.find("SCamt");
                                        if (getAll.length == undefined) {
                                            getAll.set("v.value", softCreditPayments[i].AQB__Amount__c);
                                            component.set("v.transactionTotal", 0);
                                        }
                                        else {    
                                            for (var i = 0; i < getAll.length; i++) {
                                                if (getAll[i].get("v.class") == softCreditPayments[i].AQB__LinkToTransaction__c) {
                                                	getAll[i].set("v.value", softCreditPayments[i].AQB__Amount__c);
                                                }
                                                else getAll[i].set("v.value", "");
                                            }
                                            component.set("v.transactionTotal", 0);
                                        }
                                    }
                                    document.getElementById("softCreditPaymentForm").style.display="block";
                                });
                                $A.enqueueAction(action2);
                        	}
                        	else 
                            	component.updateRemainingAmountMethod();
                            document.getElementById("softCreditPaymentForm").style.display="block";
                        });
                        $A.enqueueAction(action);
       	        	}
                }
                else if (softCredits[index].AQB__LinkIndicator__c == 'Do not Create') {
                    radiobtn = document.getElementById("ignoreSoftCredit");
                    if (radiobtn != null) {
                        component.set("v.accountOption", 'ignoreSoftCredit');
                        radiobtn.checked = true;  
                    }
                }
                else {
                    radiobtn = document.getElementById("newSoftCredit");
                    if (radiobtn != null) {
                        component.set("v.accountOption", 'newSoftCredit');
                        radiobtn.checked = true;  
                    }
                }
                component.set("v.currentLinkIndicator", "verifySoftCredits2");
            }
        }
    },
    
    confirmClose : function(component, event, helper) {
        var sButton = event.getSource();
        sButton.set('v.label','Closing...');
        sButton.set("v.disabled", true);
        var action = component.get("c.getCloseBatch");
        action.setParams({
            "batchId": component.get("v.batchId")
        });
        action.setCallback(this, function(data) {
            var ret = data.getReturnValue();
            if (ret == 'started')
        		component.set("v.closeStep", 4);
            else
            {
                helper.showError(component, "The batch cannot be closed.  " + ret);
                sButton.set('v.label','Confirm Close');
        		sButton.set("v.disabled", false);
            }
        });
        $A.enqueueAction(action);
    },
    
    cancelClose : function(component, event, helper) {
        //window.location.assign("/" + component.get("v.batch.Id")); causes error in IE
        var navEvt = $A.get("e.force:navigateToSObject");
	    navEvt.setParams({
            "recordId": component.get("v.batch.Id")
        });
        navEvt.fire();
    },	
    
    sortItems : function(component, event, helper) {
        var sort = event.target.id;
        var s = component.get("v.currentSort");
        var o = component.get("v.currentOrder");
        if (s == sort && o == "") {
            component.set("v.currentOrder", "DESC");            
        }
        else 
            component.set("v.currentOrder", "");
        component.set("v.currentSort", sort);
        helper.getBatchItems(component);    
    },
    
    dataEntry: function(component, event, helper) {
        var show = component.get("v.showDataEntry");
        var source = event.getSource();
        if (!show) {
            helper.updateTender(component, false);
            source.set('v.label', 'Hide Data Entry');
            document.getElementById("dataEntryForm").style.display="block";
            component.set("v.showDataEntry", true);
        }
        else { 
            source.set('v.label', 'Data Entry');
            document.getElementById("dataEntryForm").style.display="none";
            document.getElementById("form1").style.display="none";
            document.getElementById("pledgeform").style.display="none";
            document.getElementById("ccform").style.display="none";
            document.getElementById("securitiesform").style.display="none";
			document.getElementById("serviceform").style.display="none";
			component.set("v.showDataEntry", false);
            var com = component.find('hiddenLookup'); 
        	$A.util.addClass(com, 'slds-hide'); 
        }
    },
        
    updateMethod: function(component, event, helper) {
        helper.updateTender(component, false);
    },
    
    updatePaymentMethod: function(component, event, helper) {
        if (component.get("v.newItem.AQB__PaymentMethod__c") == '' && component.get("v.currentLinkIndicator") != 'AddTransaction') {
            helper.showError(component, "Pledge is not a type of Payment, please select another Payment Method.");
            return;
        }
        helper.updateTender(component, true);
    },
    
    updateWriteOffForm: function(component, event, helper) {
        if (component.get("v.newItem").AQB__Account__c == '') {
            helper.showError(component, "You must enter an Account.");
            return;
        }        
        component.set("v.currentLinkIndicator", 'WriteOff');
        helper.getOpenPledges(component, component.get("v.newItem").AQB__Account__c);
    },
    
    updatePledgeForm: function(component, event, helper) {
        component.set("v.gotPayments", false);
        component.set("v.postAsPayment", false);
        var s = component.get("v.newItem.AQB__PledgeScheduleType__c");
        if (s == '') {
        	document.getElementById("pledgeform").style.display="none";
        }
        else {
            document.getElementById("pledgeform").style.display="block";
            var sLabel = component.find('pPaymentLabel'); 
            var sField = component.find('pPaymentField'); 
            var dLabel = component.find('pEndDateLabel'); 
            var dField = component.find('pEndDateField'); 
            if (s == 'Single Payment') {
                var iLabel = component.find('pIntervalLabel'); 
                var iField = component.find('pIntervalField'); 
                var fLabel = component.find('pFrequencyLabel'); 
                var fField = component.find('pFrequencyField'); 
                $A.util.addClass(iLabel, 'slds-hide'); 
                $A.util.addClass(iField, 'slds-hide'); 
                $A.util.addClass(fLabel, 'slds-hide'); 
                $A.util.addClass(fField, 'slds-hide'); 
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                $A.util.addClass(dLabel, 'slds-hide'); 
                $A.util.addClass(dField, 'slds-hide'); 
            }
            else if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Payment Amount, Fixed End Date') {
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                $A.util.removeClass(dLabel, 'slds-hide'); 
                $A.util.removeClass(dField, 'slds-hide'); 
            }
            else {
                $A.util.removeClass(sLabel, 'slds-hide'); 
                $A.util.removeClass(sField, 'slds-hide'); 
                $A.util.addClass(dLabel, 'slds-hide'); 
                $A.util.addClass(dField, 'slds-hide'); 
            }
            var Label = document.getElementById("pAmountLabel");
            if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Total Amount, Fixed Number of Payments' || s == 'Single Payment') {
                if (component.get("v.newItem.AQB__Method__c") == 'Planned Gift') {
                    if (component.get("v.newItem.AQB__PaymentMethod__c") == 'Pledge')
                        Label.innerHTML = 'Total Pledge';
                    else
                        Label.innerHTML = 'Total Grant';
                }
				else if (component.get("v.newItem.AQB__Method__c") == 'Pledge')
                    Label.innerHTML = 'Total Pledge';
                else
                    Label.innerHTML = 'Total Grant';
            }
            else
                Label.innerHTML = 'Individual Payment';
            
            Label = document.getElementById("pDueLabel");
            if (s == 'Single Payment') 
                Label.innerHTML = 'Due Date';
            else
            	Label.innerHTML = '<span style="font-weight: bold; color: red">*</span>1st Payment Due';
        }
    },
    
    updateExtraForm: function(component, event, helper) {
        component.set("v.gotPayments", false);
        component.set("v.postAsPayment", false);
        var s = component.get("v.extra.AQB__PledgeScheduleType__c");
        if (s == '') {
        	document.getElementById("scheduleform2").style.display="none";
        }
        else {
            document.getElementById("scheduleform2").style.display="block";
            var sLabel = component.find('ePaymentLabel'); 
            var sField = component.find('ePaymentField'); 
            var dLabel = component.find('eEndDateLabel'); 
            var dField = component.find('eEndDateField'); 
            if (s == 'Single Payment') {
                var iLabel = component.find('eIntervalLabel'); 
                var iField = component.find('eIntervalField'); 
                var fLabel = component.find('eFrequencyLabel'); 
                var fField = component.find('eFrequencyField'); 
                $A.util.addClass(iLabel, 'slds-hide'); 
                $A.util.addClass(iField, 'slds-hide'); 
                $A.util.addClass(fLabel, 'slds-hide'); 
                $A.util.addClass(fField, 'slds-hide'); 
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                $A.util.addClass(dLabel, 'slds-hide'); 
                $A.util.addClass(dField, 'slds-hide'); 
            }
            else if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Payment Amount, Fixed End Date') {
                $A.util.addClass(sLabel, 'slds-hide'); 
                $A.util.addClass(sField, 'slds-hide'); 
                $A.util.removeClass(dLabel, 'slds-hide'); 
                $A.util.removeClass(dField, 'slds-hide'); 
            }
            else {
                $A.util.removeClass(sLabel, 'slds-hide'); 
                $A.util.removeClass(sField, 'slds-hide'); 
                $A.util.addClass(dLabel, 'slds-hide'); 
                $A.util.addClass(dField, 'slds-hide'); 
            }
            var Label = document.getElementById("eAmountLabel");
            if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Total Amount, Fixed Number of Payments' || s == 'Single Payment') {
                if (component.get("v.newItem.AQB__Method__c") == 'Planned Gift') {
                    if (component.get("v.newItem.AQB__PaymentMethod__c") == 'Pledge')
                        Label.innerHTML = 'Total Pledge';
                    else
                        Label.innerHTML = 'Total Grant';
                }
				else if (component.get("v.newItem.AQB__Method__c") == 'Pledge')
                    Label.innerHTML = 'Total Pledge';
                else
                    Label.innerHTML = 'Total Grant';
            }
            else
                Label.innerHTML = 'Individual Payment';
            Label = document.getElementById("eDueLabel");
            if (s == 'Single Payment') 
                Label.innerHTML = 'Due Date';
            else
            	Label.innerHTML = '<span style="font-weight: bold; color: red">*</span>1st Payment Due';
            var label;
            var field;
            if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                document.getElementById("tempFieldSetP2").style.display="block";
                label = component.find('p2bbDateLabel'); 
                field = component.find('p2bbDateField'); 
                $A.util.removeClass(label, 'slds-hide'); 
                $A.util.removeClass(field, 'slds-hide'); 
            }
            else {
                $A.util.addClass(label, 'slds-hide'); 
                $A.util.addClass(field, 'slds-hide');     
            }
        }
    },
    
    calculatePayments: function(component, event, helper) {
        var s = component.get("v.newItem.AQB__PledgeScheduleType__c");
        var startdate = '';
        var stopdate = '';
        if (s != 'Single Payment' && component.find("pledgeStartDate").get("v.value") == null) {
            helper.showError(component, "You must enter when the 1st Payment is Due.");
            return;
        }        
        else {
            var start = component.find("pledgeStartDate").get("v.value");
            if (start != undefined) {
                var sdate = new Date(start);
                startdate = sdate.getUTCFullYear() + "-";  
                startdate += (sdate.getUTCMonth() + 1) + "-";  
                startdate += sdate.getUTCDate();  
            }
        }
        if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Payment Amount, Fixed End Date') {
            if (component.find("pledgeEndDate").get("v.value") == null) {
                helper.showError(component, "You must enter the 'Ending By' date of the pledge.");
                return;
            }
            // Verify Pledge End Date is greater than Start Date
            var start = component.find("pledgeStartDate").get("v.value");
            var stop =  component.find("pledgeEndDate").get("v.value");
            var sdate = new Date(start);
            var edate = new Date(stop);
            if (sdate > edate) {
                helper.showError(component, "The 'Ending By' date must be greater than or equal to the '1st Payment is Due' date.");
                return;
            }
            else {
                stopdate = edate.getUTCFullYear() + "-";  
                stopdate += (edate.getUTCMonth() + 1) + "-";  
            	stopdate += edate.getUTCDate();  
            }
        }
        else {
            if (s != 'Single Payment' && component.get("v.newItem").AQB__NumberOfPayments__c == null) {
                helper.showError(component, "You must enter the '# of Payments' for the pledge.");
                return;
            }
        }
        // check for amount, frequency, interval, due date
        if (component.get("v.newItem").AQB__Amount__c == null) {
            helper.showError(component, "You must enter Amount for the pledge.");
            return;
        }
        if (s != 'Single Payment' && component.get("v.newItem").AQB__Frequency__c == null) {
            helper.showError(component, "You must enter Frequency of the pledge payments.");
            return;
        }
        if (s != 'Single Payment' && component.get("v.newItem").AQB__PledgeInterval__c == '') {
            helper.showError(component, "You must enter Interval of the pledge payments.");
            return;
        }
        if (component.get("v.newItem").AQB__PledgeType__c == '') {
            helper.showError(component, "You must enter the Pledge Type.");
            return;
        }        

        var action = component.get("c.getCalculatedPayments");
        var numberOfPayments = '0';
        if (component.get("v.newItem").AQB__NumberOfPayments__c != null)
            numberOfPayments = (component.get("v.newItem").AQB__NumberOfPayments__c).toString();
        var frequency = '0';
        if (component.get("v.newItem").AQB__Frequency__c != null)
            frequency = (component.get("v.newItem").AQB__Frequency__c).toString();
        action.setParams({
            "pledgeScheduleType": component.get("v.newItem").AQB__PledgeScheduleType__c,
            "paymentNumber": numberOfPayments,
            "pledgeFrequency": frequency,
            "interval": component.get("v.newItem").AQB__PledgeInterval__c,
            "giftCurrency": component.get("v.newItem").AQB__Currency__c,
            "amount": component.get("v.newItem").AQB__Amount__c,
            "pledgeStartDate": startdate,
            "pledgeEndDate": stopdate
        });
        action.setCallback(this, function(data) {
            var d = data.getReturnValue();
            component.set("v.scheduleDetail", d[0].AQB__Alert__c);
            d.shift();
            component.set("v.payments", d);
            component.set("v.paymentNumber", d.length);
            var start = component.find("pledgeStartDate").get("v.value");
            var stop =  component.find("pledgeEndDate").get("v.value");
            var sdate = new Date(start);
            var edate = new Date(stop);                
            startdate = (sdate.getUTCMonth() + 1) + "/";  
            startdate += sdate.getUTCDate() + "/";  
            startdate += sdate.getUTCFullYear();  
			stopdate = (edate.getUTCMonth() + 1) + "/";  
            stopdate += edate.getUTCDate() + "/";  
            stopdate += edate.getUTCFullYear();  
            if (startdate != 'NaN/NaN/NaN')
            	component.set("v.newItem.AQB__PledgeStartDate__c", startdate);
            if (stopdate != 'NaN/NaN/NaN')
            	component.set("v.newItem.AQB__PledgeEndDate__c", stopdate); 
            if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Total Amount, Fixed Number of Payments' || s == 'Single Payment') 
                component.set("v.newItem.AQB__TotalPledgeOriginalCurrency__c", component.get("v.newItem.AQB__Amount__c"));
            else
            	component.set("v.newItem.AQB__IndividualPaymentOriginalCurrency__c", component.get("v.newItem.AQB__Amount__c"));
            component.set("v.gotPayments", true);
        });
        $A.enqueueAction(action);
    },
    
    calculateAdditionalPayments: function(component, event, helper) {
        var s = component.get("v.extra.AQB__PledgeScheduleType__c");
        var startdate = '';
        var stopdate = '';
        if (s != 'Single Payment' && component.find("epledgeStartDate").get("v.value") == null) {
            helper.showError(component, "You must enter when the 1st Payment is Due.");
            return;
        }        
        else {
            var start = component.find("epledgeStartDate").get("v.value");
            if (start != undefined) {
                var sdate = new Date(start);
                startdate = sdate.getUTCFullYear() + "-";  
                startdate += (sdate.getUTCMonth() + 1) + "-";  
                startdate += sdate.getUTCDate();  
            }
        }
        if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Payment Amount, Fixed End Date') {
            if (component.find("epledgeEndDate").get("v.value") == null) {
                helper.showError(component, "You must enter the 'Ending By' date of the pledge.");
                return;
            }
            // Verify Pledge End Date is greater than Start Date
            var start = component.find("epledgeStartDate").get("v.value");
            var stop =  component.find("epledgeEndDate").get("v.value");
            var sdate = new Date(start);
            var edate = new Date(stop);
            if (sdate > edate) {
                helper.showError(component, "The 'Ending By' date must be greater than or equal to the '1st Payment is Due' date.");
                return;
            }
            else {
                stopdate = edate.getUTCFullYear() + "-";  
                stopdate += (edate.getUTCMonth() + 1) + "-";  
            	stopdate += edate.getUTCDate();  
            }
        }
        else {
            if (s != 'Single Payment' && component.get("v.extra").AQB__NumberOfPayments__c == null) {
                helper.showError(component, "You must enter the '# of Payments' for the pledge.");
                return;
            }
        }
        // check for amount, frequency, interval, due date
        if (component.get("v.extra").AQB__Amount__c == null) {
            helper.showError(component, "You must enter Amount for the pledge.");
            return;
        }
        if (s != 'Single Payment' && component.get("v.extra").AQB__Frequency__c == null) {
            helper.showError(component, "You must enter Frequency of the pledge payments.");
            return;
        }
        if (s != 'Single Payment' && component.get("v.extra").AQB__PledgeInterval__c == '') {
            helper.showError(component, "You must enter Interval of the pledge payments.");
            return;
        }
        if (component.get("v.extra").AQB__PledgeType__c == '') {
            helper.showError(component, "You must enter the Pledge Type.");
            return;
        }        

        var action = component.get("c.getCalculatedPayments");
        var numberOfPayments = '0';
        if (component.get("v.extra").AQB__NumberOfPayments__c != null)
            numberOfPayments = (component.get("v.extra").AQB__NumberOfPayments__c).toString();
        var frequency = '0';
        if (component.get("v.newItem").AQB__Frequency__c != null)
            frequency = (component.get("v.newItem").AQB__Frequency__c).toString();
        action.setParams({
            "pledgeScheduleType": component.get("v.extra").AQB__PledgeScheduleType__c,
            "paymentNumber": numberOfPayments,
            "pledgeFrequency": frequency,
            "interval": component.get("v.extra").AQB__PledgeInterval__c,
            "giftCurrency": component.get("v.extra").AQB__Currency__c,
            "amount": component.get("v.extra").AQB__Amount__c,
            "pledgeStartDate": startdate,
            "pledgeEndDate": stopdate
        });
        action.setCallback(this, function(data) {
            var d = data.getReturnValue();
            component.set("v.scheduleDetail", d[0].AQB__Alert__c);
            d.shift();
            component.set("v.payments", d);
            component.set("v.paymentNumber", d.length);
            var start = component.find("epledgeStartDate").get("v.value");
            var stop =  component.find("epledgeEndDate").get("v.value");
            var sdate = new Date(start);
            var edate = new Date(stop);                
            startdate = (sdate.getUTCMonth() + 1) + "/";  
            startdate += sdate.getUTCDate() + "/";  
            startdate += sdate.getUTCFullYear();  
			stopdate = (edate.getUTCMonth() + 1) + "/";  
            stopdate += edate.getUTCDate() + "/";  
            stopdate += edate.getUTCFullYear();  
            if (startdate != 'NaN/NaN/NaN')
            	component.set("v.extra.AQB__PledgeStartDate__c", startdate);
            if (stopdate != 'NaN/NaN/NaN')
            	component.set("v.extra.AQB__PledgeEndDate__c", stopdate); 
            //if (s == 'Fixed Total Amount, Fixed End Date' || s == 'Fixed Total Amount, Fixed Number of Payments') 
            //    component.set("v.newItem.AQB__TotalPledgeOriginalCurrency__c", component.get("v.extra.AQB__Amount__c"));
            //else
            //	component.set("v.newItem.AQB__IndividualPaymentOriginalCurrency__c", component.get("v.extra.AQB__Amount__c"));
            component.set("v.gotPayments", true);
        });
        $A.enqueueAction(action);
    },
    
    checkMethod: function(component, event, helper) {
        if (component.get("v.newItem").AQB__Account__c == '') {
            helper.showError(component, "You must enter an Account.");
            return;
        }      
        if (component.get("v.newItem.AQB__Method__c") == 'Pledge Write Off') {
            component.set("v.currentLinkIndicator", 'WriteOff');
            helper.getOpenPledges(component, component.get("v.newItem").AQB__Account__c);
        }
    },
    
    resetPayments: function(component, event, helper) {
        component.set("v.gotPayments", false);
    },
    
    resetForm: function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
        //helper.setDefaults(component);
    },
    
    addTransaction: function(component, event, helper) {
        component.set("v.saveOK", false);
        helper.checkRequiredFields(component);
        var ok = component.get("v.saveOK");
        if (ok) {
        	// Get Values from Batch
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            //component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
            component.set("v.newItem.AQB__CampaignAppeal__c", component.get("v.batch.AQB__DefaultCampaignAppeal__c"));
            component.set("v.newItem.AQB__ChartOfAccounts__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
            component.set("v.newItem.AQB__Acknowledgement__c", component.get("v.batch.AQB__DefaultAcknowledgement__c"));
            if (component.get("v.newItem.AQB__Method__c") == 'Securities') {
                component.set("v.newItem.AQB__Amount__c", ((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c") / 2) * component.get("v.newItem.AQB__NumberOfShares__c")));
            	component.set("v.transactionTotal", component.get("v.newItem.AQB__NumberOfShares__c"));
            }
            else
        		component.set("v.transactionTotal", component.get("v.newItem.AQB__Amount__c"));
        	// Get Names for Account, Designation, Campaign, & Acknowledgement
			var action = component.get("c.getLookupNames");
            action.setParams({
                "designationId": component.get("v.newItem.AQB__ChartOfAccounts__c"),
                "campaignId": component.get("v.newItem.AQB__CampaignAppeal__c"),
                "acknowledgementId": component.get("v.newItem.AQB__Acknowledgement__c"),
                "accountId": component.get("v.newItem.AQB__Account__c")
            });
            action.setCallback(this, function(data) {
        	    var ret = data.getReturnValue();
                var split = ret.split('^');
        		component.set("v.designation1", split[0]);
                component.set("v.currentCampaign", split[1]);
                component.set("v.currentAcknowledgement", split[2]);
        		component.set("v.currentAccountName", split[3]);
                component.set("v.newTransaction.AQB__Description__c", component.get("v.newItem.AQB__Description__c"))
                component.set("v.newTransaction.AQB__PropertyCategory__c", component.get("v.newItem.AQB__Transaction1PropertyCategory__c"))
                component.set("v.transactionNumber", 1);   
                var field1 = component.find('tSharesField'); 
                var field2 = component.find('tAmountField'); 
                if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                    var aLabel = document.getElementById("tAmountLabel");
                	aLabel.innerHTML = 'Number of Shares'; 
                    $A.util.addClass(field2, 'slds-hide'); 
                }
                else 
                    $A.util.addClass(field1, 'slds-hide'); 
                var field = component.find('tPropertyField'); 
                if (component.get("v.newItem").AQB__Method__c == 'Personal Property' || component.get("v.newItem").AQB__Method__c == 'Real Property') 
                    $A.util.removeClass(field, 'slds-hide'); 
                else
                    $A.util.addClass(field, 'slds-hide'); 
                field = component.find('tCreditedDateField'); 
        		if (component.get("v.batch.AQB__GiftCreditYear__c") == true) 
		            $A.util.removeClass(field, 'slds-hide'); 
        		else
        		    $A.util.addClass(field, 'slds-hide'); 
                // hide data entry form
        		document.getElementById("dataEntryForm").style.display="none";
                // show add transactions form
            	document.getElementById("transform").style.display="block";
                var label = component.find('tbbDateLabel'); 
                field = component.find('tbbDateField'); 
        		if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
            });
        	$A.enqueueAction(action);
        }
    },
    
    addAnotherTransaction: function(component, event, helper) {
        if (component.get("v.batch").AQB__DefaultChartofAccounts__c == null) {
            helper.showError(component, "You must enter the Designation.");
            return;
        }        
        if (component.get("v.newItem").AQB__Method__c == 'Securities' && component.get("v.newTransaction").AQB__NumberOfShares__c == null) {
            helper.showError(component, "You must enter the Number of Shares.");
            return;
        }        
        if (component.get("v.newItem").AQB__Method__c != 'Securities' && component.get("v.newTransaction").AQB__Amount__c == null) {
            helper.showError(component, "You must enter an Amount.");
            return;
        }        
        if ((component.get("v.newItem").AQB__Method__c == 'Service' || component.get("v.newItem").AQB__Method__c == 'Personal Property' || component.get("v.newItem").AQB__Method__c == 'Real Property')
            && (component.get("v.newTransaction").AQB__Description__c == '' || component.get("v.newTransaction").AQB__Description__c == undefined)) {
            helper.showError(component, "You must enter a Description.");
            return;
        }   
		
       	var num = component.get("v.transactionNumber");  
        num++;
        var checknum = component.get("v.newItem.AQB__CheckNumber__c");
        if (num == 2) {
            component.set("v.newItem.AQB__ChartOfAccounts2__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
            component.set("v.newItem.AQB__Amount2__c", component.get("v.newTransaction.AQB__Amount__c"));
            if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                component.set("v.newItem.AQB__NumberOfShares2__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
                component.set("v.newItem.AQB__Amount2__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
            }
            component.set("v.newItem.AQB__Description2__c", component.get("v.newTransaction.AQB__Description__c"));
            component.set("v.newItem.AQB__Transaction2PropertyCategory__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
            if (checknum != null)
            	component.set("v.newItem.AQB__CheckNumber2__c", checknum.toString());
            component.set("v.newItem.AQB__Reference2__c", component.get("v.newItem.AQB__Reference__c"));
            component.set("v.newItem.AQB__CreditedYearOverrideDate2__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        }
        else if (num == 3) {
            component.set("v.newItem.AQB__ChartOfAccounts3__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
            component.set("v.newItem.AQB__Amount3__c", component.get("v.newTransaction.AQB__Amount__c"));
            if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                component.set("v.newItem.AQB__NumberOfShares3__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
            	component.set("v.newItem.AQB__Amount3__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
            }
            component.set("v.newItem.AQB__Description3__c", component.get("v.newTransaction.AQB__Description__c"));
            component.set("v.newItem.AQB__Transaction3PropertyCategory__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
            if (checknum != null)
            	component.set("v.newItem.AQB__CheckNumber3__c", checknum.toString());
            component.set("v.newItem.AQB__Reference3__c", component.get("v.newItem.AQB__Reference__c"));
            component.set("v.newItem.AQB__CreditedYearOverrideDate3__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        }
        else if (num == 4) {
            component.set("v.newItem.AQB__ChartOfAccounts4__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
            component.set("v.newItem.AQB__Amount4__c", component.get("v.newTransaction.AQB__Amount__c"));
            if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                component.set("v.newItem.AQB__NumberOfShares4__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
            	component.set("v.newItem.AQB__Amount4__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
            }
            component.set("v.newItem.AQB__Description4__c", component.get("v.newTransaction.AQB__Description__c"));
            component.set("v.newItem.AQB__Transaction_4_Property_Category__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
            if (checknum != null)
            	component.set("v.newItem.AQB__CheckNumber4__c", checknum.toString());
            component.set("v.newItem.AQB__Reference4__c", component.get("v.newItem.AQB__Reference__c"));
            component.set("v.newItem.AQB__CreditedYearOverrideDate4__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        }
        // Get Name for Designation
        var action = component.get("c.getLookupNames");
        action.setParams({
            "designationId": component.get("v.batch.AQB__DefaultChartofAccounts__c"),
            "campaignId": null,
            "acknowledgementId": null,
            "accountId": null
        });
        action.setCallback(this, function(data) {
            var ret = data.getReturnValue();
            var split = ret.split('^');
            if (num == 2)
                component.set("v.designation2", split[0]);
            else if (num == 3)
                component.set("v.designation3", split[0]);
            else if (num == 4)
                component.set("v.designation4", split[0]);
            component.set("v.newTransaction.AQB__Amount__c", null);
            component.set("v.newTransaction.AQB__NumberOfShares__c", null);
            component.set("v.transactionNumber", num);                  
        });
        $A.enqueueAction(action);
    },
    
    updateTotal: function(component, event, helper) {
        var total = component.get("v.transactionTotal");
        if (component.get("v.newItem.AQB__Method__c") == 'Securities') 
           	total += component.get("v.newTransaction.AQB__NumberOfShares__c");
        else
            total += component.get("v.newTransaction.AQB__Amount__c");
        component.set("v.transactionTotal", total);
    },
    
    saveAddedTransactionsAddCredit: function(component, event, helper) {
        component.set("v.addSoftCredit", true);
        component.saveAddedTransactionsMethod();
    },
    
    saveAddedTransactions: function(component, event, helper) {
        if (component.get("v.batch").AQB__DefaultChartofAccounts__c == null) {
            helper.showError(component, "You must enter the Designation.");
            return;
        }        
        if (component.get("v.newItem").AQB__Method__c == 'Securities' && component.get("v.newTransaction").AQB__NumberOfShares__c == null) {
            helper.showError(component, "You must enter the Number of Shares.");
            return;
        }        
        if (component.get("v.newItem").AQB__Method__c != 'Securities' && component.get("v.newTransaction").AQB__Amount__c == null) {
            helper.showError(component, "You must enter an Amount.");
            return;
        }        
        if ((component.get("v.newItem").AQB__Method__c == 'Service' || component.get("v.newItem").AQB__Method__c == 'Personal Property' || component.get("v.newItem").AQB__Method__c == 'Real Property')
            && (component.get("v.newTransaction").AQB__Description__c == '' || component.get("v.newTransaction").AQB__Description__c == undefined)) {
            helper.showError(component, "You must enter a Description.");
            return;
        }   
        
       	component.set("v.saveOK", false);
        helper.checkRequiredFields(component);
        var ok = component.get("v.saveOK");
        if (ok) {
            var num = component.get("v.transactionNumber");  
            num++;
        	var checknum = component.get("v.newItem.AQB__CheckNumber__c");
            if (num == 2) {
                component.set("v.newItem.AQB__ChartOfAccounts2__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
                component.set("v.newItem.AQB__Amount2__c", component.get("v.newTransaction.AQB__Amount__c"));
                if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                    component.set("v.newItem.AQB__NumberOfShares2__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
                    component.set("v.newItem.AQB__Amount2__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
                }
                component.set("v.newItem.AQB__Description2__c", component.get("v.newTransaction.AQB__Description__c"));
                component.set("v.newItem.AQB__Transaction2PropertyCategory__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
                if (checknum != null)
            		component.set("v.newItem.AQB__CheckNumber2__c", checknum.toString());
                component.set("v.newItem.AQB__Reference2__c", component.get("v.newItem.AQB__Reference__c"));
                component.set("v.newItem.AQB__CreditedYearOverrideDate2__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        	}
            else if (num == 3) {
                component.set("v.newItem.AQB__ChartOfAccounts3__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
                component.set("v.newItem.AQB__Amount3__c", component.get("v.newTransaction.AQB__Amount__c"));
                if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                    component.set("v.newItem.AQB__NumberOfShares3__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
                    component.set("v.newItem.AQB__Amount3__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
                }
                component.set("v.newItem.AQB__Description3__c", component.get("v.newTransaction.AQB__Description__c"));
                component.set("v.newItem.AQB__Transaction3PropertyCategory__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
                if (checknum != null)
            		component.set("v.newItem.AQB__CheckNumber3__c", checknum.toString());
                component.set("v.newItem.AQB__Reference3__c", component.get("v.newItem.AQB__Reference__c"));
                component.set("v.newItem.AQB__CreditedYearOverrideDate3__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        	}
            else if (num == 4) {
                component.set("v.newItem.AQB__ChartOfAccounts4__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
                component.set("v.newItem.AQB__Amount4__c", component.get("v.newTransaction.AQB__Amount__c"));
                if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                    component.set("v.newItem.AQB__NumberOfShares4__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
                    component.set("v.newItem.AQB__Amount4__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
                }
                component.set("v.newItem.AQB__Description4__c", component.get("v.newTransaction.AQB__Description__c"));
                component.set("v.newItem.AQB__Transaction_4_Property_Category__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
                if (checknum != null)
            		component.set("v.newItem.AQB__CheckNumber4__c", checknum.toString());
                component.set("v.newItem.AQB__Reference4__c", component.get("v.newItem.AQB__Reference__c"));
                component.set("v.newItem.AQB__CreditedYearOverrideDate4__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        	}
            else if (num == 5) {
                component.set("v.newItem.AQB__ChartOfAccounts5__c", component.get("v.batch.AQB__DefaultChartofAccounts__c"));
                component.set("v.newItem.AQB__Amount5__c", component.get("v.newTransaction.AQB__Amount__c"));
                if (component.get("v.newItem").AQB__Method__c == 'Securities') {
                    component.set("v.newItem.AQB__NumberOfShares5__c", component.get("v.newTransaction.AQB__NumberOfShares__c"));
                    component.set("v.newItem.AQB__Amount5__c", (((component.get("v.newItem.AQB__DailyHigh__c") + component.get("v.newItem.AQB__DailyLow__c")) / 2) * component.get("v.newTransaction.AQB__NumberOfShares__c")));	
                }
                component.set("v.newItem.AQB__Description5__c", component.get("v.newTransaction.AQB__Description__c"));
                component.set("v.newItem.AQB__Transaction5PropertyCategory__c", component.get("v.newTransaction.AQB__PropertyCategory__c"));
                if (checknum != null)
            		component.set("v.newItem.AQB__CheckNumber5__c", checknum.toString());
                component.set("v.newItem.AQB__Reference5__c", component.get("v.newItem.AQB__Reference__c"));
                component.set("v.newItem.AQB__CreditedYearOverrideDate5__c", component.get("v.newTransaction.AQB__CreditedYearOverrideDate__c"));
        	}
            component.set("v.saveButton", event.getSource());
            helper.showOpenStuff(component);
        }
    },
    
    saveNewTransaction: function(component, event, helper) {
        if (component.get("v.saveStatus") != "check4Pledges")
        	helper.goSaveNewTransaction(component, event);
        else {
            component.set("v.saveButton", event.getSource());
            component.set("v.saveStatus", "saveWhenDone");
        }
    },
    
    saveAddCredit: function(component, event, helper) {
        component.set("v.addSoftCredit", true);
        if (component.get("v.saveStatus") != "check4Pledges")
            helper.goSaveNewTransaction(component, event);
        else {
            component.set("v.saveButton", event.getSource());
            component.set("v.saveStatus", "saveWhenDone");
        }
    },
    
    savePayment: function(component, event, helper) {
        component.set("v.saveOK", false);
        helper.checkRequiredFields(component);
        var ok = component.get("v.saveOK");
        if (ok) {
            var checknum = component.get("v.newItem.AQB__CheckNumber__c");
            component.set("v.newTransaction.AQB__BatchItemID__c", component.get("v.itemId"));
            component.set("v.newTransaction.AQB__PledgePayment__c", true);
            component.set("v.newTransaction.AQB__Method__c", component.get("v.newItem.AQB__PaymentMethod__c"));
            component.set("v.newTransaction.AQB__CampaignAppeal__c", component.get("v.newItem.AQB__CampaignAppeal__c"));
            component.set("v.newTransaction.AQB__Designation__c", component.get("v.newItem.AQB__ChartOfAccounts__c"));
            component.set("v.newTransaction.AQB__Acknowledgement__c", component.get("v.batch.AQB__DefaultAcknowledgement__c"));
            component.set("v.newTransaction.AQB__Amount__c", component.get("v.newItem.AQB__Amount__c"));
            component.set("v.newTransaction.AQB__Description__c", component.get("v.newItem.AQB__Description__c"));
            component.set("v.newTransaction.AQB__PropertyCategory__c", component.get("v.newItem.AQB__Transaction1PropertyCategory__c"));
            if (checknum != null)
            	component.set("v.newTransaction.AQB__CheckNumber__c", checknum.toString());
            component.set("v.newTransaction.AQB__Reference__c", component.get("v.newItem.AQB__Reference__c"));
            component.set("v.newTransaction.AQB__Date__c", component.get("v.newItem.AQB__Date__c"));
            component.set("v.newTransaction.AQB__CreditedYearOverrideDate__c", component.get("v.newItem.AQB__CreditedYearOverrideDate__c"));
            component.set("v.saveButton", event.getSource());
            
            var sButton = event.getSource();
            sButton.set('v.label','Saving...');
            sButton.set("v.disabled", true);      
            var action = component.get("c.getSavePaymentTransaction");
            action.setParams({
                "trans": component.get("v.newTransaction")
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component);  
                    //helper.setDefaults(component);
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    addPayment: function(component, event, helper) {
        component.set("v.addPayment", true);
        var pNum = component.get("v.pledgeSchedule");
        if (pNum == 1) {
            component.set("v.pledgeSchedule", 2);
            helper.goSaveNewTransaction(component, event);
        }
        else {
            //helper.setupPayment(component);
            helper.finishSaveNewSchedule(component, false);
        }
    },
    
    addNewSchedule: function(component, event, helper) {
        var pNum = component.get("v.pledgeSchedule");
        if (pNum == 1) {
            component.set("v.pledgeSchedule", 2);
            helper.goSaveNewTransaction(component, event);
        }
        else {
            helper.finishSaveNewSchedule(component, true);
        }
    },
    
    saveNewSchedule: function(component, event, helper) {
        helper.finishSaveNewSchedule(component, false);
    },
    
    saveAddCredit2: function(component, event, helper) {
        component.set("v.addSoftCredit", true);
        helper.finishSaveNewSchedule(component, false);
    },
    
    writeOffPledge: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');        
		var whichOne = event.target.id.substring(1);
        component.set("v.newItem.AQB__LinkToPledge__c", whichOne);
        var action = component.get("c.getOpenPledgeTransactions");
        action.setParams({
            "pledgeId": whichOne
        });
        action.setCallback(this, function(data) {
            component.set("v.openPledgeTransactions", data.getReturnValue());
            component.set("v.selectedCount", component.get("v.openPledgeTransactions").length);
            document.getElementById("writeOffForm").style.display="block";
        });
        $A.enqueueAction(action);
    },
    
    checkboxSelect: function(component, event, helper) {
        var selectedRec = event.getSource().get("v.value");
        var getSelectedNumber = component.get("v.selectedCount");
        if (selectedRec == true) 
            getSelectedNumber++;
        else 
            getSelectedNumber--;
        if (getSelectedNumber == component.get("v.openPledgeTransactions").length)
            component.find("checkAllTrans").set("v.value", true);
        else
            component.find("checkAllTrans").set("v.value", false);
        component.set("v.selectedCount", getSelectedNumber);
    },
    
    checkboxSelectV: function(component, event, helper) {
        var selectedRec = event.getSource().get("v.value");
        var getSelectedNumber = component.get("v.selectedCount");
        if (selectedRec == true) 
            getSelectedNumber++;
        else 
            getSelectedNumber--;
        if (getSelectedNumber == component.get("v.giftTransactions").length)
            component.find("checkAllTransV").set("v.value", true);
        else
            component.find("checkAllTransV").set("v.value", false);
        component.set("v.selectedCount", getSelectedNumber);
        var button = component.find("voidCorrectButton"); 
        if (getSelectedNumber == 1)
            button.set("v.disabled", false); 
        else
           button.set("v.disabled", true); 
    },
    
    selectAll: function(component, event, helper) {
        var selectedHeaderCheck = event.getSource().get("v.value");
        var getAllId = component.find("boxPack");
        if (selectedHeaderCheck == true) {
            for (var i = 0; i < getAllId.length; i++) {
                component.find("boxPack")[i].set("v.value", true);
                component.set("v.selectedCount", getAllId.length);
            }
        } 
        else {
            for (var i = 0; i < getAllId.length; i++) {
                component.find("boxPack")[i].set("v.value", false);
                component.set("v.selectedCount", 0);
            }
        }
    },
    
    selectAllV: function(component, event, helper) {
        var selectedHeaderCheck = event.getSource().get("v.value");
        var getAllId = component.find("boxPackV");
        if (selectedHeaderCheck == true) {
            if (getAllId.length == undefined) {
                component.find("boxPackV").set("v.value", true);
                component.set("v.selectedCount", 1);
            }
            else {
                for (var i = 0; i < getAllId.length; i++) {
                    component.find("boxPackV")[i].set("v.value", true);
                    component.set("v.selectedCount", getAllId.length);
                }
            }
        } 
        else {
            if (getAllId.length == undefined) {
                component.find("boxPackV").set("v.value", false);
                component.set("v.selectedCount", 0);
            }
            else {
                for (var i = 0; i < getAllId.length; i++) {
                    component.find("boxPackV")[i].set("v.value", false);
                    component.set("v.selectedCount", 0);
                }
            }
        }
        var button = component.find("voidCorrectButton"); 
        if (component.get("v.selectedCount") == 1)
            button.set("v.disabled", false); 
        else
            button.set("v.disabled", true); 
    },
    
    addTransaction2Existing: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');        
		var whichOne = event.target.id.substring(1);
        component.set("v.newItem.AQB__Gift__c", whichOne);
        var g = component.get("v.gifts");
        for (var i = 0; i < g.length; i++) {
            if (g[i].Id == whichOne) {
                component.set("v.selectedGift", g[i]);
            }
        }
        helper.updateTender(component, true);
    },

	matchGift: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');        
		var whichOne = event.target.id.substring(1);
        component.set("v.newItem.AQB__MatchLink__c", whichOne);
        var g = component.get("v.gifts");
        for (var i = 0; i < g.length; i++) {
            if (g[i].Id == whichOne) {
                component.set("v.selectedGift", g[i]);
            }
        }
        var action = component.get("c.getMatchingCompanies");
        action.setParams({
            "giftId": whichOne
        });
        action.setCallback(this, function(data) {
            component.set("v.accountOption", '');
            component.set("v.matchingAccounts", data.getReturnValue());
            component.set("v.popupGo", true);
            helper.showPopupHelper(component, 'matchingAccountsDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);
    },
    
    saveMatchingAccountOption: function(component, event, helper) {
        var option = component.get("v.accountOption");
        var accountId = null;
        var matchPotentialId = null;
        if (option == "useNew") {
            var a = component.get("v.newAccount");
            if (a.AQB__Account__c != '') {
                accountId = a.AQB__Account__c;
            }
            else {
                helper.showError(component, "You must enter an Account.");
            	return;
            }
        }
        else if (option != "") {
            matchPotentialId = option;
        }
        
        var action = component.get("c.getMatchGift");
        action.setParams({
            "giftId": component.get("v.newItem.AQB__MatchLink__c"),
            "matchPotentialId": matchPotentialId,
            "accountId": accountId
        });
        action.setCallback(this, function(data) {
            var split = data.getReturnValue().split('^');
            component.set("v.errorMessage", "");
            var message = '';
            if (split[0] != '')
                message = 'The original Campaign Appeal is ' + split[0];
            if (split[1] != '') {
                if (split[0] != '')
                	message += ', the original Designation is ' + split[1];
                else
                	message += 'The original Designation is ' + split[1];
                message += '.';
            }
            component.set("v.errorMessage", message);
            component.set("v.newItem.AQB__Account__c", split[2]); 
        	component.set("v.newItem.AQB__AccountName__c", split[3]);
            if (split[4] != '')
             	component.set("v.newItem.AQB__Amount__c", split[4]);   
            component.set("v.newItem.AQB__Acknowledgement__c", component.get("v.batch.AQB__DefaultAcknowledgement__c"));
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'matchingAccountsDialog', 'slds-fade-in-');
            document.getElementById("matchform").style.display="block";
        });
        $A.enqueueAction(action);
    }, 
    
    updateMatchingPayment: function(component, event, helper) {
        var s = component.get("v.newItem.AQB__MatchMethod__c");
        if (s == '') {
        	document.getElementById("matchpaymentForm").style.display="none";
        }
        else {
            var action = component.get("c.getMatches");
            action.setParams({
                "accountId": component.get("v.newItem.AQB__Account__c")
            });
            action.setCallback(this, function(data) {
                component.set("v.transactionTotal", 0);
                component.set("v.selectedTotal", 0);
                component.set("v.matchingGifts", data.getReturnValue());
                if (component.get("v.matchingGifts").length == 0)
                    helper.showError(component, "This Account does not have any outstanding Matching Gifts.");
                else
                    document.getElementById("matchpaymentForm").style.display="block";
            });
            $A.enqueueAction(action);
        }
    },
    
	updateAmount: function(component, event, helper) {
        var newtrans = component.get("v.newItem");
        if (newtrans.AQB__NumberOfShares__c == '' || newtrans.AQB__NumberOfShares__c == undefined ||
            newtrans.AQB__DailyLow__c == '' || newtrans.AQB__DailyLow__c == undefined ||
            newtrans.AQB__DailyHigh__c == '' || newtrans.AQB__DailyHigh__c == undefined) 
            return;
        else
            component.updateRemainingAmountMethod();
    },                               
    
    updateRemainingAmount: function(component, event, helper) {
        component.set("v.transactionTotal", component.get("v.newItem.AQB__Amount__c") - component.get("v.selectedTotal"));
        if (component.get("v.currentLinkIndicator") == 'PayPledge') {    
            var total = 0;
            var newtrans = component.get("v.newItem");
            if (newtrans.AQB__Method__c == 'Securities') {
                if (newtrans.AQB__NumberOfShares__c == '' || newtrans.AQB__NumberOfShares__c == undefined) {
                    helper.showError(component, "You must enter the Number of Shares.");
                    return;
                }        
                if (newtrans.AQB__DailyLow__c == '' || newtrans.AQB__DailyLow__c == undefined) {
                    helper.showError(component, "You must enter the Daily Low.");
                    return;
                }        
                if (newtrans.AQB__DailyHigh__c == '' || newtrans.AQB__DailyHigh__c == undefined) {
                    helper.showError(component, "You must enter the Daily High.");
                    return;
                }               
                total = ((newtrans.AQB__DailyLow__c + newtrans.AQB__DailyHigh__c) / 2) * newtrans.AQB__NumberOfShares__c;
                component.set("v.newItem.AQB__Amount__c", total);
            }
            else
            	total = newtrans.AQB__Amount__c;
            var getAll = component.find("PPamt");
            if (getAll.length == undefined) {
                getAll.set("v.value", total);
	            component.set("v.transactionTotal", 0);
            }
            else {    
            	var t = component.get("v.openPledgeTransactions");  
                for (var i = 0; i < getAll.length; i++) {
                	if (total > 0) {
                        if (total > t[i].AQB__Balance__c) {
                            getAll[i].set("v.value", t[i].AQB__Balance__c);
                            total -= t[i].AQB__Balance__c;
                        }
                        else {
                            getAll[i].set("v.value", total);
                            total = 0;
                        }
                    }
                    else getAll[i].set("v.value", "");
                }
                component.set("v.transactionTotal", component.get("v.newItem.AQB__Amount__c") - (component.get("v.newItem.AQB__Amount__c") - total));
            }    
        }
        else if (component.get("v.currentLinkIndicator") == 'verifySoftCredits2') {    
        	var total;
            if (component.get("v.addSoftCredit") == true) {
                total = component.get("v.newItem.AQB__Amount__c");
                component.set("v.selectedTotal", total);
            }
            else
                total = component.get("v.selectedTotal");
            var getAll = component.find("SCamt");
            if (getAll.length == undefined) {
                getAll.set("v.value", total);
	            component.set("v.transactionTotal", 0);
            }
            else {    
            	var t = component.get("v.openPledgeTransactions");  
                for (var i = 0; i < getAll.length && i < t.length; i++) {
                	if (total > 0) {
                        if (total > t[i].AQB__Balance__c) {
                            getAll[i].set("v.value", t[i].AQB__Balance__c);
                            total -= t[i].AQB__Balance__c;
                        }
                        else {
                            getAll[i].set("v.value", total);
                            total = 0;
                        }
                    }
                    else getAll[i].set("v.value", "");
                }
                component.set("v.transactionTotal", component.get("v.selectedTotal") - (component.get("v.selectedTotal") - total));
            }    
        }
    },
    
    updatePP: function(component, event, helper) {
        var amt = 0;
        var getAll;
        if (component.get("v.currentLinkIndicator") == 'verifySoftCredits2')
        	getAll = component.find("SCamt");
        else
        	getAll = component.find("PPamt");
        if (getAll.length == undefined) {
            if (getAll.get("v.value") != null) 
                amt += getAll.get("v.value");
        }
        else {    
            for (var i = 0; i < getAll.length; i++) {
                if (getAll[i].get("v.value") != '' && getAll[i].get("v.value") != null) {
                    amt += getAll[i].get("v.value");
                }
            }
        }
        if (component.get("v.currentLinkIndicator") == 'verifySoftCredits2')
        	component.set("v.transactionTotal", component.get("v.selectedTotal") - amt);    
        else {
        	component.set("v.transactionTotal", component.get("v.newItem.AQB__Amount__c") - amt);    
            component.set("v.selectedTotal", amt);
        }
        
    },
    
    confirmPledgePayment: function(component, event, helper) {
        if (component.get("v.transactionTotal") != 0) 
            helper.showError(component, "The Remaining Amount must equal $0.00.");
        else {
            var newtrans =  component.get("v.newItem");
            var method = newtrans.AQB__Method__c;
            if (component.get("v.batch").AQB__DefaultAcknowledgement__c == '') {
                helper.showError(component, "You must enter an Acknowledgement Type.");
                return;
            }        
            if ((method == 'Personal Property' || method == 'Real Property')
                && (newtrans.AQB__Description__c == '' || newtrans.AQB__Description__c == undefined)) {
                helper.showError(component, "You must enter a Description.");
                return;
            }   
            if (method == 'Securities') {
                if (newtrans.AQB__TickerSymbol__c == '' || newtrans.AQB__TickerSymbol__c == undefined) {
                    helper.showError(component, "You must enter a Ticker Symbol.");
                    return;
                }        
                if (newtrans.AQB__DateOfTransfer__c == '' || newtrans.AQB__DateOfTransfer__c == undefined) {
                    helper.showError(component, "You must enter the Transfer Date.");
                    return;
                }        
                else {
                    var thedate = component.get("v.newItem.AQB__DateOfTransfer__c");
                    var tdate = new Date(thedate);
                    var fdate = (tdate.getMonth() + 1) + "/";  
                    fdate += tdate.getDate() + "/";  
                    fdate += tdate.getFullYear();  
                    component.set("v.newItem.AQB__DateOfTransfer__c", fdate);	
                }
            }
            var transIds = [];
            var transAmts = [];
            var getAll = component.find("PPamt");
            if (getAll.length == undefined) {
                if (getAll.get("v.value") != null && getAll.get("v.value") != 0) {
                    transIds.push(getAll.get("v.class"));
                    transAmts.push(getAll.get("v.value"));
                }
            }
            else {    
                for (var i = 0; i < getAll.length; i++) {
                    if (getAll[i].get("v.value") != null && getAll[i].get("v.value") != 0) {
                        transIds.push(getAll[i].get("v.class"));
                        transAmts.push(getAll[i].get("v.value"));
                    }
                }
            }
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
            component.set("v.newItem.AQB__Acknowledgement__c", component.get("v.batch.AQB__DefaultAcknowledgement__c"));           
            var action = component.get("c.getSavePledgePayment");
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "transIds": transIds,
                "transAmts": transAmts
            });
            action.setCallback(this, function(data) {
            	if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else 
                	$A.get('e.force:refreshView').fire();
            });
            $A.enqueueAction(action);
        }
    },
    
    checkboxSelectM: function(component, event, helper) {
        var id = event.getSource().get("v.text");
        var selectedRec = event.getSource().get("v.value");
        var total = component.get("v.selectedTotal");
        var amt = 0;
        var g = component.get("v.matchingGifts");
        for (var i = 0; i < g.length; i++) {
            if (g[i].Id == id) {
                amt = g[i].AQB__RollUpPledgeBalanceTotal__c;
            }
        }
        if (selectedRec == true) 
            component.set("v.selectedTotal", total + amt);
        else 
            component.set("v.selectedTotal", total - amt);
        if (component.get("v.newItem.AQB__Amount__c") == null)
        	component.set("v.transactionTotal", 0 - component.get("v.selectedTotal"));
        else
        	component.set("v.transactionTotal", component.get("v.newItem.AQB__Amount__c") - component.get("v.selectedTotal"));
    },
    
    confirmMatchPayment: function(component, event, helper) {
        if (component.get("v.transactionTotal") != 0) 
            helper.showError(component, "The Remaining Amount must equal $0.00.");
        else {
            var transIds = [];
            var getAllId = component.find("boxPackM");
            if (getAllId.length == undefined) {
                if (getAllId.get("v.value") == true) 
                    transIds.push(getAllId.get("v.text"));
            }
            else {    
                for (var i = 0; i < getAllId.length; i++) {
                    if (getAllId[i].get("v.value") == true) 
                        transIds.push(getAllId[i].get("v.text"));
                }
            }
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            var action = component.get("c.getSaveMatchingPayment");
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "matchingGiftIds": transIds
            });
            action.setCallback(this, function(data) {
            	if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else 
                	$A.get('e.force:refreshView').fire();
            });
            $A.enqueueAction(action);
        }
    },
    
    updatePlannedGift: function(component, event, helper) {
        var m = component.get("v.newItem.AQB__Method__c");
        var s = component.get("v.newItem.AQB__PaymentMethod__c");            
        if (s == '') {
            document.getElementById("plannedGiftForm").style.display="none";
        }
        else {
            var action = component.get("c.getPlannedGifts");
            action.setParams({
                "accountId": component.get("v.newItem.AQB__Account__c")
            });
            action.setCallback(this, function(data) {
                component.set("v.openOpportunities", data.getReturnValue());
                component.set("v.currentLinkIndicator", 'PlannedGift');
                if (component.get("v.openOpportunities").length != 0) {
                    helper.showPopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
                }
                else {
                    document.getElementById("plannedGiftForm").style.display="block";
                    helper.updateTender(component, false);
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    check4Pledges: function(component, event, helper) {
        component.set("v.saveStatus", "check4Pledges");
        
        if (component.get("v.newItem").AQB__Account__c == '') {
            helper.showError(component, "You must enter an Account.");
            return;
        }   
    	if (component.get("v.openPledgesPopped") == false && component.get("v.newItem.AQB__Method__c") != 'Planned Gift' && 
            component.get("v.newItem.AQB__Method__c") != 'Soft Credit - Other Account' && component.get("v.addPayment") != true) {
            component.set("v.currentLinkIndicator", 'PayPledge'); 
            component.set("v.openOpportunities.length", 0); 
            var action = component.get("c.getOpenPledges");
            action.setParams({
                "accountId": component.get("v.newItem.AQB__Account__c"),
                "pledgeId": null
            });
            action.setCallback(this, function(data) {
                component.set("v.openPledges", data.getReturnValue());
                var p = component.get("v.openPledges");
                if (p.length) {
                    component.set("v.openPledgesPopped", true);
                    component.set("v.currentAccountName", p[0].AQB__Account__r.Name);
                    helper.showPopupHelper(component, 'openPledgesOptDialog', 'slds-fade-in-');
                    if (p.length == 1) {
                        var box = component.find('boxPackP');
                        box.set("v.value", true);
                    }
                }
                else {
                    component.set("v.currentLinkIndicator", ''); 
                	if (component.get("v.saveStatus") == "saveWhenDone")
                        helper.goSaveNewTransaction(component, event);
                    else
                        component.set("v.saveStatus", "");
                 }
            });
            $A.enqueueAction(action);
        }
    },
   
    payOpportunity: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        component.set("v.newItem.AQB__LinkToOpportunity__c", whichOne);
        var o = component.get("v.openOpportunities");
        for (var i = 0; i < o.length; i++) {
            if (o[i].Id == whichOne) {
                component.set("v.newItem.AQB__Revocable__c", o[i].AQB__Revocable__c);
                component.set("v.newItem.AQB__InitialNetPresentValue__c", o[i].AQB__InitialNetPresentValue__c);
                component.set("v.newItem.AQB__Instrument__c", o[i].RecordType.Name);
                component.set("v.newItem.AQB__MaturityDate__c", o[i].AQB__MaturityDate__c);
                component.set("v.newItem.AQB__TaxAmount__c", o[i].AQB__TaxAmount__c);
                component.set("v.newItem.AQB__TotalAssetAmount__c", o[i].AQB__TotalAssetAmount__c);
                //component.set("v.newItem.AQB__InstrumentDescriptor__c", o[i].AQB__InstrumentDescriptor__c);
            }
        }
        document.getElementById("plannedGiftForm").style.display="block";
        helper.updateTender(component, false);
        helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
    },
    
    noOpportunity: function(component, event, helper) {
        document.getElementById("plannedGiftForm").style.display="block";
        helper.updateTender(component, false);
        helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
    },
    
    voidGift: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');        
		var whichOne = event.target.id.substring(1);
        component.set("v.newItem.AQB__Gift__c", whichOne);
        var g = component.get("v.gifts");
        for (var i = 0; i < g.length; i++) {
            if (g[i].Id == whichOne) {
                component.set("v.selectedGift", g[i]);
            }
        }
        var action = component.get("c.getVoidTransactions");
        action.setParams({
            "giftId": whichOne
        });
        action.setCallback(this, function(data) {
            component.set("v.giftTransactions", data.getReturnValue());
            component.set("v.voidAndCorrect", false);
            component.set("v.selectedCount", component.get("v.giftTransactions").length);
        	document.getElementById("voidForm").style.display="block";
            var button = component.find("voidCorrectButton"); 
            if (component.get("v.giftTransactions").length == 1)
                button.set("v.disabled", false); 
            else
                button.set("v.disabled", true);         
        });
        $A.enqueueAction(action);
    },
    
    confirmVoidTrans: function(component, event, helper) {
        component.set("v.popped", true);
        helper.showPopupHelper(component, 'confirmVoidDialog', 'slds-fade-in-');
    },
    
    confirmVoidAndCorrect: function(component, event, helper) {
        component.set("v.voidAndCorrect", true);
        component.set("v.popped", true);
        helper.showPopupHelper(component, 'confirmVoidDialog', 'slds-fade-in-');
    },
    
    hideConfirmVoidPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'confirmVoidDialog', 'slds-fade-in-');
    },     
    
    voidTransactions: function(component, event, helper) {
        var d = component.get("v.newItem").AQB__Description__c;
        if (d == '' || d == null || d == undefined) {
            helper.showError(component, "You must enter a Description.");
            return;
        }       
        var transIds = [];
        var getAllId = component.find("boxPackV");
        if (getAllId.length == undefined) {
        	if (getAllId.get("v.value") == true) 
            	transIds.push(getAllId.get("v.text"));
        }
        else {    
            for (var i = 0; i < getAllId.length; i++) {
                if (getAllId[i].get("v.value") == true) 
                    transIds.push(getAllId[i].get("v.text"));
            }
        }
        
        if (component.get("v.voidAndCorrect") == true) {
            var t = component.get("v.giftTransactions");
            for (var i = 0; i < t.length; i++) {
                if (t[i].Id == transIds[0]) {
                    t[i].AQB__Description__c = d;
                    component.set("v.voidTransaction", t[i]);
                }
            }
            helper.hidePopupHelper(component, 'confirmVoidDialog', 'slds-fade-in-');
            document.getElementById("voidForm").style.display="none";
            document.getElementById("corrrectionform").style.display="block";
            helper.updateTender(component, false);
            var imField = component.find('inputMethod'); 
        	$A.util.addClass(imField, 'slds-hide'); 
            var omField = component.find('inputMethod2'); 
        	$A.util.removeClass(omField, 'slds-hide'); 
        }
        else {
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
            component.set("v.newItem.AQB__Amount__c", null);
            var action = component.get('c.getSaveVoids');
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "transactionIds": transIds
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    hideGiftSelectPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');
    }, 

    writeOffTrans: function(component, event, helper) {
        var transIds = [];
        var getAllId = component.find("boxPack");
        if (getAllId.length == undefined) {
        	if (getAllId.get("v.value") == true) 
            	transIds.push(getAllId.get("v.text"));
        }
        else {    
            for (var i = 0; i < getAllId.length; i++) {
                if (getAllId[i].get("v.value") == true) 
                    transIds.push(getAllId[i].get("v.text"));
            }
        }
        if (transIds.length == 0) {
			helper.showError(component, "Please choose transaction(s) to Write Off or Cancel.");        
        }
        else if (transIds.length == 1) {
            var dueDate = null;
            var pledges = component.get("v.openPledgeTransactions");
            for (var i = 0; i < pledges.length; i++) {
                if (pledges[i].Id == transIds[0]) {
                    dueDate = pledges[i].AQB__DateDue__c;
                }
            }
            var startdate = '';
          	var sdate = new Date(dueDate);
            startdate = (sdate.getUTCMonth() + 1) + "/";  
            startdate += sdate.getUTCDate() + "/";  
            startdate += sdate.getUTCFullYear();  
            //alert('dueDate = ' + dueDate);
			//alert('startdate = ' + startdate);
			component.set("v.popped", true);
            component.set("v.itemId", transIds[0]);
        	helper.showPopupHelper(component, 'confirmWoDialog', 'slds-fade-in-');

            if (startdate != 'NaN/NaN/NaN')
            	component.set("v.newTransaction.AQB__DueDate__c", startdate);
            else
            	component.set("v.newTransaction.AQB__DueDate__c", null);
            component.set("v.newTransaction.AQB__Amount__c", 0);           
        }
        else {
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
            component.set("v.newItem.AQB__Amount__c", null);
            var action = component.get('c.getSaveWriteOff');
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "transactionIds": transIds
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    writeOffTransaction: function(component, event, helper) {
        component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
        component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
        component.set("v.newItem.AQB__Amount__c", null);
        var amount = component.get("v.newTransaction").AQB__Amount__c;
        if (amount == null || amount == 0) {
            // write off full amount
            var transIds = [];
            transIds.push(component.get("v.itemId"));
            var action = component.get('c.getSaveWriteOff');
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "transactionIds": transIds
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
        }
        else { // write off partial amount
            var action = component.get('c.getSavePartialWriteOff');
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "newTransaction" : component.get("v.newTransaction"),
                "transactionId": component.get("v.itemId")
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    component.set("v.popped", false);
                    helper.hidePopupHelper(component, 'confirmVoidDialog', 'slds-fade-in-');
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
        }
    },
    
    hideConfirmWoDialog: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'confirmWoDialog', 'slds-fade-in-');
        $A.get('e.force:refreshView').fire();
    },     
    
    convertTransaction2Payment: function(component, event, helper) {
        component.set("v.currentTransactionId", event.target.id.substring(1));
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftTransactionDialog', 'slds-fade-in-');
        component.set("v.openOpportunities.length", 0); 
        var action = component.get("c.getOpenPledges");
        action.setParams({
            "accountId": component.get("v.newItem.AQB__Account__c"),
            "pledgeId": null
        });
        action.setCallback(this, function(data) {
            component.set("v.openPledges", data.getReturnValue());
            var p = component.get("v.openPledges");
            if (p.length)                
                helper.showPopupHelper(component, 'openStuffDialog', 'slds-fade-in-');
            else
                helper.showError(component, "This Account does not have any Pledges.");
        });
        $A.enqueueAction(action);
    },
    
    hideGiftTransactionPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftTransactionDialog', 'slds-fade-in-');
        $A.get('e.force:refreshView').fire();
    },     
    
    showOpenPledgesTrans: function(component, event, helper) {
        var pledgeIds = [];
        var getAllId = component.find("boxPackP");
        if (getAllId.length == undefined) {
            if (getAllId.get("v.value") == true) 
                pledgeIds.push(getAllId.get("v.text"));
        }
        else {    
            for (var i = 0; i < getAllId.length; i++) {
                if (getAllId[i].get("v.value") == true) 
                    pledgeIds.push(getAllId[i].get("v.text"));
            }
        }
        if (pledgeIds.length == 0) 
            helper.showError(component, "Please choose Pledge(s) to pay, otherwise click on 'Do not Post as a Pledge Payment'.");
        else {
            component.set("v.newItem.AQB__LinkToPledge__c", pledgeIds[0]);
            if (pledgeIds.length > 1)
                component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'User Selected - Multiple');
            else
                component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'User Selected');
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'openPledgesOptDialog', 'slds-fade-in-');     
            var action = component.get("c.getOpenPledgesTransactions");
            action.setParams({
                "pledgeIds": pledgeIds
            });
            action.setCallback(this, function(data) {
                document.getElementById("form1").style.display="none";
                document.getElementById("ccform").style.display="none";
                document.getElementById("securitiesform").style.display="none";
                component.set("v.openPledgeTransactions", data.getReturnValue());
                var c = component.get("v.newItem.AQB__Method__c");
                var field = component.find('PPcheckField'); 
                if (c == 'Check') 
                    $A.util.removeClass(field, 'slds-hide'); 
                else 
                    $A.util.addClass(field, 'slds-hide'); 
                field = component.find('PPreferenceField'); 
                if (c == 'ACH' || c == 'Wire' || c == 'PayPal' || c == 'Transfer') 
                    $A.util.removeClass(field, 'slds-hide'); 
                else 
                    $A.util.addClass(field, 'slds-hide');    
                field = component.find('originsField'); 
                if (c == 'Transfer') {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }      
                field = component.find('PPpCategoryField'); 
                var field2 = component.find('PPdescriptionField'); 
                if (c == 'Personal Property' || c == 'Real Property') {
                    $A.util.removeClass(field, 'slds-hide'); 
                    $A.util.removeClass(field2, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(field, 'slds-hide');     
                    $A.util.addClass(field2, 'slds-hide');     
                }
                if (c == 'Securities') 
                    document.getElementById("PPsecurities").style.display="block";
                else
                    component.updateRemainingAmountMethod();
                var label = component.find('ppDateLabel'); 
                field = component.find('ppDateField'); 
                if (component.get("v.batch.AQB__GiftDate__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }
                label = component.find('ppcDateLabel'); 
                field = component.find('ppcDateField'); 
                if (component.get("v.batch.AQB__GiftCreditYear__c") == true) {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide');     
                }
                document.getElementById("pledgePaymentForm").style.display="block";
            });
            $A.enqueueAction(action);
        }
    },        
    
    linkPledgeToItem: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        if (component.get("v.currentLinkIndicator") == 'PayPledge') {      
            component.set("v.newItem.AQB__LinkToPledge__c", whichOne);
            component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'User Selected');
            component.set("v.popped", false);
        	helper.hidePopupHelper(component, 'openStuffDialog', 'slds-fade-in-');       
            var action = component.get("c.getOpenPledgeTransactions");
            action.setParams({
                "pledgeId": whichOne
            });
            action.setCallback(this, function(data) {
                document.getElementById("form1").style.display="none";
                document.getElementById("ccform").style.display="none";
                document.getElementById("securitiesform").style.display="none";
                component.set("v.openPledgeTransactions", data.getReturnValue());
                var c = component.get("v.newItem.AQB__Method__c");
            	var field = component.find('PPcheckField'); 
                if (c == 'Check') 
                    $A.util.removeClass(field, 'slds-hide'); 
                else 
                    $A.util.addClass(field, 'slds-hide'); 
                field = component.find('PPreferenceField'); 
                if (c == 'ACH' || c == 'Wire' || c == 'PayPal' || c == 'Transfer') 
                    $A.util.removeClass(field, 'slds-hide'); 
                else 
                    $A.util.addClass(field, 'slds-hide');    
                field = component.find('originsField'); 
                if (c == 'Transfer') {
                    $A.util.removeClass(label, 'slds-hide'); 
                    $A.util.removeClass(field, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(label, 'slds-hide'); 
                    $A.util.addClass(field, 'slds-hide'); 
                }      
                field = component.find('PPpCategoryField'); 
                var field2 = component.find('PPdescriptionField'); 
                if (c == 'Personal Property' || c == 'Real Property') {
                    $A.util.removeClass(field, 'slds-hide'); 
                    $A.util.removeClass(field2, 'slds-hide'); 
                }
                else {
                    $A.util.addClass(field, 'slds-hide');     
                    $A.util.addClass(field2, 'slds-hide');     
                }
                if (c == 'Securities') 
                	document.getElementById("PPsecurities").style.display="block";
                else
                    component.updateRemainingAmountMethod();
                document.getElementById("pledgePaymentForm").style.display="block";
            });
            $A.enqueueAction(action);
        }
        else if (component.get("v.currentLinkIndicator") == 'Convert') {
            component.set("v.popped", false);
        	helper.hidePopupHelper(component, 'openStuffDialog', 'slds-fade-in-');       
            component.set("v.newItem.AQB__Batch__c", component.get("v.batchId"));
            component.set("v.newItem.AQB__Date__c", component.get("v.batch.AQB__BatchDate__c"));
            component.set("v.newItem.AQB__Amount__c", null);
            var action = component.get("c.getSaveConvert2Payment");
            action.setParams({
                "batchItem": component.get("v.newItem"),
                "transactionId": component.get("v.currentTransactionId"),
                "pledgeId": whichOne
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '')
                	alert(data.getReturnValue());
                else 
                	$A.get('e.force:refreshView').fire();
            });
            $A.enqueueAction(action);
        }
        else {
            component.set("v.newItem.AQB__LinkToPledge__c", whichOne);
            component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'User Selected');
            component.set("v.postAsPayment", true);
            helper.finishSaveNewTransaction(component);
    	}
    },
    
    linkOpportunityToItem: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        component.set("v.newItem.AQB__LinkToOpportunity__c", whichOne);
        component.set("v.newItem.AQB__OpportunityLinkIndicator__c", 'User Selected');
        helper.finishSaveNewTransaction(component);
    },
    
    goSaveNoLink: function(component, event, helper) {
        if (component.get("v.openPledges").length != 0) 
            component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'Do Not Link Pledge');
        if (component.get("v.openOpportunities").length != 0)
            component.set("v.newItem.AQB__OpportunityLinkIndicator__c", 'Do Not Link Opportunity');
        helper.finishSaveNewTransaction(component);
    },
    
    hideOpenStuffPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'openStuffDialog', 'slds-fade-in-');
        if (component.get("v.currentLinkIndicator") == 'PayPledge') {
            component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'Do Not Link Pledge');
            component.set("v.currentLinkIndicator", '')
        }
        if (component.get("v.currentLinkIndicator") == 'Convert') 
            $A.get('e.force:refreshView').fire();
    }, 
    
    hideOpenPledgesOptPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'openPledgesOptDialog', 'slds-fade-in-');
        component.set("v.newItem.AQB__PledgeLinkIndicator__c", 'Do Not Link Pledge');
        component.set("v.currentLinkIndicator", '');
        if (component.get("v.saveStatus") == "saveWhenDone")
            helper.goSaveNewTransaction(component, event);
        else 
            component.set("v.saveStatus", "");
    }, 
    
    setSoftCreditOption: function(component, event, helper) {
        var selected = document.querySelector('input[name="softCreditOption"]:checked').id;
        component.set("v.accountOption", selected);
        if (selected != 'ignoreSoftCredit' && selected != 'newSoftCredit' && selected != '') {
            component.set("v.openPledgeTransactions", null);
            var action = component.get("c.getOpenPledgeTransactions");
            action.setParams({
                "pledgeId": selected
            });
            action.setCallback(this, function(data) {
                component.set("v.openPledgeTransactions", data.getReturnValue());
                component.updateRemainingAmountMethod();
                document.getElementById("softCreditPaymentForm").style.display="block";
            });
            $A.enqueueAction(action);
        }
    },
    
    saveSoftCredit: function(component, event, helper) {
        var option = component.get("v.accountOption");
        if (option == '')
            helper.showError(component, "Please choose an option or Cancel.");
        else {
            if (component.get("v.currentLinkIndicator") != 'Credit4Other' && component.get("v.addSoftCredit") != true) {
                // Automated Credits
                var softCredits = component.get("v.softCreditAccounts");
                var index = component.get("v.currentSoftCredit");
                // Update Soft Credit
                var pledgeId = null;
                var transIds = [];
                var transAmts = [];
                if (option != "newSoftCredit" && option != 'ignoreSoftCredit') {
                    // Paying a Pledge 
                    pledgeId = option;
                    if (component.get("v.transactionTotal") != 0) {
            			helper.showError(component, "The Remaining Amount must equal $0.00.");
                    	return;
                    }
                    var getAll = component.find("SCamt");
                    if (getAll.length == undefined) {
                        if (getAll.get("v.value") != null && getAll.get("v.value") != 0) {
                            transIds.push(getAll.get("v.class"));
                            transAmts.push(getAll.get("v.value"));
                        }
                    }
                    else {    
                        for (var i = 0; i < getAll.length; i++) {
                            if (getAll[i].get("v.value") != null && getAll[i].get("v.value") != 0) {
                                transIds.push(getAll[i].get("v.class"));
                                transAmts.push(getAll[i].get("v.value"));
                            }
                        }
                    }
                }
                var action = component.get("c.getUpdateSoftCredit");
                action.setParams({ 
                    "scId": softCredits[index].Id,
                    "pledgeId": pledgeId,
                    "option" : option,
                    "transIds": transIds,
                    "transAmts": transAmts
                });
                action.setCallback(this, function(data) {
                    if (data.getReturnValue() != '') 
                        alert(data.getReturnValue());
                    else {
						component.set("v.currentSoftCredit", index + 1);
                        helper.showSoftCreditOptions(component); 
                    }
                });
                $A.enqueueAction(action);
            }
        	else {
                var giftId = null;
                var bItemId = null;
                var acct = component.get("v.softCreditAccount.Id");
                var anon = component.get("v.softCreditAccount.AQB__GiftsAreAnonymous__c");
                if (component.get("v.currentLinkIndicator") == 'Credit4Other') {
                    // Create New Batch Item for the Soft Credit
                    giftId = component.get("v.selectedGift.Id");
                    var option = component.get("v.accountOption");
                    document.getElementById(option).checked = false;
                    component.set("v.popped", false);
                    helper.hidePopupHelper(component, 'softCreditDialog', 'slds-fade-in-');
                    if (option == "newSoftCredit") {
                        var action = component.get("c.getCreateSoftCredit");
                        action.setParams({ 
                            "bItem": component.get("v.newItem"),
                            "giftId": giftId,
                            "batchItemId": bItemId,
                            "softAccountId": acct,
                            "anon": anon,
                            "batchId": component.get("v.batchId"),
                            "pledgeId": null
                        });
                        action.setCallback(this, function(data) {
                            if (data.getReturnValue() != '') 
                                alert(data.getReturnValue());
                            else 
                                $A.get('e.force:refreshView').fire();
                        });
                        $A.enqueueAction(action);
                    }
                    else if (option == "ignoreSoftCredit" || option == "") {
                        $A.get('e.force:refreshView').fire();
                    }
                    else if (option != "") {
                        var action = component.get("c.getCreateSoftCredit");
                        action.setParams({ 
                            "bItem": component.get("v.newItem"),
                            "giftId": giftId,
                            "batchItemId": bItemId,
                            "softAccountId": acct,
                            "anon": anon,
                            "batchId": component.get("v.batchId"),
                            "pledgeId": option
                        });
                        action.setCallback(this, function(data) {
                            if (data.getReturnValue() != '') 
                                alert(data.getReturnValue());
                            else 
                                $A.get('e.force:refreshView').fire();
                        });
                        $A.enqueueAction(action);
                    }
                }
                else {
                    // Create New Batch Item Soft Credit
                    if (option != "ignoreSoftCredit") {
                        // Insert Soft Credit
                        var pledgeId = null;
                        if (option != "newSoftCredit") {
                            if (component.get("v.transactionTotal") != 0) {
                                helper.showError(component, "The Remaining Amount must equal $0.00.");
                                return;
                            }
                            pledgeId = option;
                        }
                        var action = component.get("c.getNewSoftCredit");
                        action.setParams({ 
                            "batchItemId": component.get("v.itemId"),
                            "softAccountId": acct,
                            "anon": anon,
                            "pledgeId": pledgeId
                        });
                        action.setCallback(this, function(data) {
                            if (data.getReturnValue() != '') 
                                alert(data.getReturnValue());
                            else
                                $A.get('e.force:refreshView').fire();
                        });
                        $A.enqueueAction(action);
                    }
                }
            }
        }
    }, 
    
    hideSoftCreditPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'softCreditDialog', 'slds-fade-in-');
        if (component.get("v.currentLinkIndicator") == 'Credit4Other') {
            $A.get('e.force:refreshView').fire();
        }
        else if (component.get("v.addSoftCredit") == true) {
        	component.set("v.addSoftCredit", false);
            helper.showSoftCredits(component);
        }
        else {
            var index = component.get("v.currentSoftCredit");
            component.set("v.currentSoftCredit", index + 1);
	        helper.showSoftCreditOptions(component);
        }
    }, 
    
    verifySoftCredits: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = event.target.id.split('^');
        component.set("v.currentItemId", split[0]);
        component.set("v.currentAccountName", split[1]);
        component.set("v.selectedTotal", split[2]);
        var action = component.get("c.getSoftCredits");
        action.setParams({
            "batchItemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", true);
            component.set("v.softCreditAccounts", data.getReturnValue());
            var s = component.get("v.softCreditAccounts");
            if (s.length) {
                component.set("v.currentLinkIndicator", "verifySoftCredits");
                component.set("v.currentSoftCredit", 0);
                helper.showSoftCreditOptions(component);          
            }
        });
        $A.enqueueAction(action);
    },

	editItem: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = event.target.id.split('^');
        component.set("v.currentEditObj", split[1]);
        $A.get('e.force:editRecord').setParams({ recordId: split[0] }).fire();
    },
    
    Refresh: function(component, event, helper) {
    	var whichOne = component.get("v.currentEditObj");
        if (whichOne == 'BatchItem') 
	        helper.getBatchItems(component); 
        else if (whichOne == 'Transaction') {
            //helper.getCalculations(component);
            helper.getBatchItems(component);
            helper.getTransactions(component);
        }
       	else if (whichOne == 'Quid') 
	        helper.getQuids(component); 
        else if (whichOne == 'Tribute') {
            helper.getTributes(component); 
         	helper.getBatchItems(component);
	    }
       	else if (whichOne == 'Recognition') 
	        helper.getRecognitions(component); 
    },
    
    confirmDeleteBatchItem: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = whichOne.split('^');
        component.set("v.popped", true);
        component.set("v.currentItemId", split[0]);
        component.set("v.currentAccountName", split[1]);
        component.set("v.popupHeader", 'Batch Item');
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteBatchItem: function(component, event, helper) {
        var action = component.get("c.getDeleteBatchItem");
        action.setParams({
            "batchItemId": component.get("v.currentItemId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            helper.getBatchItems(component);  
        });
        $A.enqueueAction(action);
    },
    
    hideConfirmDeletePopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    }, 
    
    cancelPopup: function(component, event, helper) {
        component.set("v.popupGo", false);
    },
    
    /*showAttachment: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped =  component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        component.set("v.popped", true);
                        component.set("v.currentItemId", whichOne);
                        var t = component.get("v.batchItems");
                        for (var i = 0; i < t.length; i++) {
                            if (t[i].Id == whichOne) {
                                component.set("v.currentItem", t[i]);
                            }
                        }
                        helper.showPopupHelper(component, 'attachmentDialog', 'slds-fade-in-');
                    }
                }
            }), 500
        );
    },
    
    hideAttachmentPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'attachmentDialog', 'slds-fade-in-');
    }, */
    
    showAccountMatches: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        component.set("v.accountOption", '');
        component.set("v.newAccount.AQB__Account__r.Name", "");
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        component.set("v.popped", true);
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        var whichType = split[0].substring(0, 1);
                        var whichId = split[0].substring(1);
                        var accountId = split[1];
                        if (whichType == "U") 
                            component.set("v.currentAccountName", split[2]);
                        var selectedId;
                        component.set("v.currentItemId", whichId);
                        var radiobtn = document.getElementById("useNew");
						radiobtn.checked = false;
                        radiobtn = document.getElementById("createNew");
                        radiobtn.checked = false; 
                        if (whichType == "X") {
                            radiobtn = document.getElementById("createNew");
							radiobtn.checked = true;
                        }
                        if (whichType == "U") 
                            selectedId = accountId;
                        var action = component.get("c.getAccountMatches");
                        action.setParams({
                            "batchItemId": whichId,
                            "selectedId": selectedId
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.accountMatches", data.getReturnValue());
                            /*if (whichType == "U") {
                                var ms = component.get("v.accountMatches");
                                var m = component.get("v.accountMatch");
                                m.AQB__Account__c = accountId;
                                m.AQB__MatchConfidence__c = '';
                                m.AQB__Details__c = 'User Selected';
                                ms = ms + m;
                                component.set("v.accountMatches", ms);
                            }   */
							if (whichType == "F" || whichType == "U") {
                                window.setTimeout(
            						$A.getCallback(function() {
                                        var m = component.get("v.accountMatches");
                                        for (var i = 0; i < m.length; i++) {
                                            radiobtn = document.getElementById(m[i].AQB__Account__c);
                                            if (m[i].AQB__Account__c == accountId) 
                                                radiobtn.checked = true;
                                            else
                                                radiobtn.checked = false;
                                        }	
                                        helper.showPopupHelper(component, 'accountsDialog', 'slds-fade-in-');
                                	}), 100
                                );
                            }
                            else 
                            	helper.showPopupHelper(component, 'accountsDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    saveAccountOption: function(component, event, helper) {
        component.set("v.popped", false);
        var option = component.get("v.accountOption");
        if (option == "createNew") {
            var action = component.get("c.getCreateNew");
            action.setParams({
                "batchItemId": component.get("v.currentItemId")
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    helper.hidePopupHelper(component, 'accountsDialog', 'slds-fade-in-');
                    helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
        }
        else if (option == "useNew") {
            var a = component.get("v.newAccount");
            if (a.AQB__Account__c != '') {
                var action = component.get("c.getSetNewAccount");
                action.setParams({
                    "batchItemId": component.get("v.currentItemId"),
                    "accountId": a.AQB__Account__c
                });
                action.setCallback(this, function(data) {
                    if (data.getReturnValue() != '') 
                    	alert(data.getReturnValue());
                    else {
                        helper.hidePopupHelper(component, 'accountsDialog', 'slds-fade-in-');
                        $A.get('e.force:refreshView').fire();
                        //helper.getBatchItems(component);
                    } 
                });
                $A.enqueueAction(action);
            }
        }
        else if (option != "") {
        	var action = component.get("c.getSetNewAccount");
            action.setParams({
                "batchItemId": component.get("v.currentItemId"),
                "accountId": option
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    helper.hidePopupHelper(component, 'accountsDialog', 'slds-fade-in-');
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
        }
    }, 
    
    hideAccountsPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'accountsDialog', 'slds-fade-in-');
    }, 
    
    setAccountOption: function(component, event, helper) {
        var selected = document.querySelector('input[name="accountOption"]:checked').id;
        component.set("v.accountOption", selected);
    },
    
    savescAccount: function(component, event, helper) {
    	var a = component.get("v.newAccount");
        if (a.AQB__Account__c != '') {
            var action = component.get("c.getSetSoftCredit");
            action.setParams({
                "accountId": a.AQB__Account__c
            });
            action.setCallback(this, function(data) {
                component.set("v.popped", false);
                helper.hidePopupHelper(component, 'scAccountDialog', 'slds-fade-in-');
                component.set("v.softCreditAccount", data.getReturnValue());
                component.set("v.currentSoftCredit", 0);
                if (component.get("v.currentLinkIndicator") == 'Credit4Other') 
                    helper.showCreditOptions4Other(component);      
                else
                    helper.showSoftCreditOptions(component);          
            });
            $A.enqueueAction(action);
        }
    },
    
    hidescAccountPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'scAccountDialog', 'slds-fade-in-');
        if (component.get("v.currentLinkIndicator") == 'Credit4Other') {
             $A.get('e.force:refreshView').fire();
        }
        else {
            component.set("v.addSoftCredit", false);
            helper.showSoftCredits(component);
        }
    }, 
    
    addCredit4Other: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'giftSelectDialog', 'slds-fade-in-');        
		var whichOne = event.target.id.substring(1);
        var g = component.get("v.gifts");
        for (var i = 0; i < g.length; i++) {
            if (g[i].Id == whichOne) {
                component.set("v.selectedGift", g[i]);
            }
        }
        helper.getAccountForCredit(component);
    },
    
    showCampaign: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[1]);
                        var t = component.get("v.batchItems");
                        for (var i = 0; i < t.length; i++) {
                            if (t[i].Id == whichOne)
                                component.set("v.currentItem", t[i]);
                        }
                        helper.showPopupHelper(component, 'campaignDialog', 'slds-fade-in-');
                    }
                }
            }), 500
        );
    },
    
    saveCampaign: function(component, event, helper) {
        component.set("v.popped", false);
        var action = component.get("c.getSaveCampaign");
            action.setParams({
                "batchItemId": component.get("v.currentItemId"),
                "campaignId": component.get("v.currentItem.AQB__CampaignAppeal__c")
            });
            action.setCallback(this, function(data) {
                if (data.getReturnValue() != '') 
                    alert(data.getReturnValue());
                else {
                    helper.hidePopupHelper(component, 'campaignDialog', 'slds-fade-in-');
                    $A.get('e.force:refreshView').fire();
                    //helper.getBatchItems(component); 
                }
            });
            $A.enqueueAction(action);
    },
    
    hideCampaignPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'campaignDialog', 'slds-fade-in-');
    },
    
    /*showTransactions: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        component.set("v.popped", true);
                        component.set("v.currentItemId", whichOne);
                        component.set("v.popupHeader", "Transactions");
                        var t = component.get("v.batchItems");
                        for (var i = 0; i < t.length; i++) {
                            if (t[i].Id == whichOne) {
                                component.set("v.currentItem", t[i]);
                                $A.createComponent(
                                    "AQB:BatchItemTransactions",
                                    {
                                        "batchItem": t[i],
                                        "closeTransactionsPopup": component.getReference("c.hideTransactionsPopup")
                                    },
                                    function(box, status, errorMessage) {
                                        if (status === "SUCCESS") {
                                            helper.showPopupHelper(component, 'transactionsDialog', 'slds-fade-in-');
                                            var targetCmp = component.find('transactionsPlaceHolder');
                                            var body = component.get("v.body");
                                            body.push(box);
                                            component.set("v.body", body);
                                        }
                                        else if (status === "INCOMPLETE") {
                                            console.log("No response from server or client is offline.")
                                        }
                                        else if (status === "ERROR") {
                                            console.log("Error: " + errorMessage);
                                        }
                                    }
                                );
                            }
                        }
                    }
                }
            }), 500
        );
    },*/
    
    showTransactions: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[1]);
                        component.set("v.currentMethod", split[2]);
                        helper.getTransactions(component);
                    }
                }
            }), 500
        );
    },
    
    confirmDeleteTransaction: function(component, event, helper) {
        var whichOne = event.target.id;
        component.set("v.popped", true);
        component.set("v.currentTransactionId", whichOne);
        component.set("v.popupHeader", 'Transaction');
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteTransaction: function(component, event, helper) {
        var action = component.get("c.getDeleteTransaction");
        action.setParams({
            "transactionId": component.get("v.currentTransactionId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            //helper.getCalculations(component);  
            helper.getBatchItems(component);
            helper.getTransactions(component);
        });
        $A.enqueueAction(action);
    },

    hideTransactionsPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.getBatchItems(component); 
        helper.hidePopupHelper(component, 'transactionsDialog', 'slds-fade-in-');
    },
    
    showPledgeLink: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped"); 
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[2]);
                        component.set("v.currentLinkIndicator", split[3]);
                        component.set("v.recurringGiftPledgeLink", split[4]);
                        var action = component.get("c.getOpenPledges");
                        action.setParams({
                            "accountId": null,
                            "pledgeId": split[1]
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.showLink", true);
                            component.set("v.openPledges", data.getReturnValue());
                            helper.showPopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    showMultiplePledgeLink: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped"); 
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[1]);
                        var action = component.get("c.getPledges");
                        action.setParams({
                            "batchItemId": split[0]
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.currentLinkIndicator", 'Multiple');
                            component.set("v.openPledges", data.getReturnValue());
                            helper.showPopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    showOpenPledges: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[2]);
                        component.set("v.currentLinkIndicator", split[3]);
                        helper.getOpenPledges(component, split[1]);
                    }
                }
            }), 500
        );
    },
    
    linkPledge: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getLinkPledge");
        action.setParams({
            "batchItemId": itemId,
            "pledgeId": whichOne
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    unlinkPledge: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getLinkPledge");
        action.setParams({
            "batchItemId": itemId,
            "pledgeId": null,
            "recurringGiftLink": component.get("v.recurringGiftPledgeLink")
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    verifyPledge: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getVerifyPledge");
        action.setParams({
            "batchItemId": itemId
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
            	helper.hidePopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    saveNoPledgeLink: function(component, event, helper) {
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getNoPledgeLink");
        action.setParams({
            "batchItemId": itemId
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
            	helper.hidePopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    hideOpenPledgesPopup: function(component, event, helper) {
        component.set("v.popped", false);
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        helper.hidePopupHelper(component, 'openPledgesDialog', 'slds-fade-in-');
    }, 
    
    showRecurringGiftLink: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped"); 
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[2]);
                        component.set("v.currentLinkIndicator", split[3]);
                        component.set("v.recurringGiftPledgeLink", split[4]);
                        component.set("v.currentLinkIndicator", '');
                        var action = component.get("c.getRecurringGifts");
                        action.setParams({
                            "accountId": null,
                            "recurringGiftId": split[1]
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.showLink", true);
                            component.set("v.recurringGifts", data.getReturnValue());
                            helper.showPopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    showRecurringGifts: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[2]);
                        component.set("v.currentLinkIndicator", split[3]);
                        var action = component.get("c.getRecurringGifts");
                        action.setParams({
                            "accountId": split[1],
                            "recurringGiftId": null
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.showLink", false);
                            component.set("v.recurringGifts", data.getReturnValue());
                            helper.showPopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    linkRecurringGift: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getLinkRecurringGift");
        action.setParams({
            "batchItemId": itemId,
            "recurringGiftId": whichOne
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
            	helper.hidePopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    unlinkRecurringGift: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getLinkRecurringGift");
        action.setParams({
            "batchItemId": itemId,
            "recurringGiftId": null,
            "pledgeLink": component.get("v.recurringGiftPledgeLink")
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
        
    verifyRecurringGift: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getVerifyRecurringGift");
        action.setParams({
            "batchItemId": itemId
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },

    saveNoRecurringGiftLink: function(component, event, helper) {
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getNoRecurringGiftLink");
        action.setParams({
            "batchItemId": itemId
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    hideRecurringGiftsPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'recurringGiftsDialog', 'slds-fade-in-');
    }, 
    
    showNewRecurringGift: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped"); 
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[1]);
                        var t = component.get("v.batchItems");
                        for (var i = 0; i < t.length; i++) {
                            if (t[i].Id == split[0]) {
                                component.set("v.currentItem", t[i]);
                            }
                        }
                        helper.showPopupHelper(component, 'newRecurringGiftDialog', 'slds-fade-in-');
                    }
                }
            }), 500
        );
    },
    
    deleteRecurringGift: function(component, event, helper) {
        var item = component.get("v.currentItem");
        item.AQB__RecurringGiftLinkIndicator__c = null;
        var action = component.get("c.getSaveTransactions");
        action.setParams({
            "batchItem": item
        });
        action.setCallback(this, function(data) {
            helper.getBatchItems(component);    
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'newRecurringGiftDialog', 'slds-fade-in-');
        });
        $A.enqueueAction(action);
    }, 
        
    hideNewRecurringGiftPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'newRecurringGiftDialog', 'slds-fade-in-');
    }, 
    
    showOpportunityLink: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {        
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[2]);
                        component.set("v.currentLinkIndicator", split[3]);
                        var action = component.get("c.getOpenOpportunities");
                        action.setParams({
                            "accountId": null,
                            "opportunityId": split[1]
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.showLink", true);
                            component.set("v.openOpportunities", data.getReturnValue());
                            helper.showPopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    showOpenOpportunities: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id;
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[2]);
                        component.set("v.currentLinkIndicator", split[3]);
                        var action = component.get("c.getOpenOpportunities");
                        action.setParams({
                            "accountId": split[1], 
                            "opportunityId": null
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.showLink", false);
                            component.set("v.openOpportunities", data.getReturnValue());
                            helper.showPopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    linkOpportunity: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getLinkOpportunity");
        action.setParams({
            "batchItemId": itemId,
            "opportunityId": whichOne
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    unlinkOpportunity: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getLinkOpportunity");
        action.setParams({
            "batchItemId": itemId,
            "opportunityId": null
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    verifyOpportunity: function(component, event, helper) {
        var whichOne = event.target.id.substring(1);
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getVerifyOpportunity");
        action.setParams({
            "batchItemId": itemId
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },

    saveNoOpportunityLink: function(component, event, helper) {
        var itemId = component.get("v.currentItemId");
        var action = component.get("c.getNoOpportunityLink");
        action.setParams({
            "batchItemId": itemId
        });
        action.setCallback(this, function(data) {
            if (data.getReturnValue() != '') 
                alert(data.getReturnValue());
            else {
                helper.getBatchItems(component);    
                helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
            }
        });
        $A.enqueueAction(action);                    
    },
    
    hideOpenOpportunitiesPopup: function(component, event, helper) {
        component.set("v.popped", false);
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        helper.hidePopupHelper(component, 'openOpportunitiesDialog', 'slds-fade-in-');
    }, 
    
    showMatches: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var split = thisOne.split('^');
                        component.set("v.popped", true);
                        whichOne = split[0].substring(1);
                        component.set("v.currentAccountName", split[1]);
                        component.set("v.currentItemId", whichOne);
                        helper.getMatches(component);
                        /*var action = component.get("c.getMatchPotentials");
                        action.setParams({
                            "batchItemId": whichOne
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.matchPotentials", data.getReturnValue());
                            helper.showPopupHelper(component, 'matchPotentialsDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);*/
                    }
                }
            }), 500
        );
    },
    
    confirmDeleteMatch: function(component, event, helper) {
        var whichOne = event.target.id;
        component.set("v.popped", true);
        component.set("v.currentMatchId", whichOne);
        component.set("v.popupHeader", 'Match Potential');
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteMatch: function(component, event, helper) {
        var action = component.get("c.getDeleteMatch");
        action.setParams({
            "matchId": component.get("v.currentMatchId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            helper.getMatches(component);
            helper.getBatchItems(component);  
        });
        $A.enqueueAction(action);
    },
    
	/*saveMatchPotentials: function(component, event, helper) {
        component.set("v.popped", false);
        var action = component.get("c.getSaveMatchPotentials");
        action.setParams({
            "matchPotentials": component.get("v.matchPotentials")
        });
        $A.enqueueAction(action);
        
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        
        helper.hidePopupHelper(component, 'matchPotentialsDialog', 'slds-fade-in-');
    },*/
    
    hideMatchPotentialsPopup: function(component, event, helper) {
        component.set("v.popped", false);
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        helper.hidePopupHelper(component, 'matchPotentialsDialog', 'slds-fade-in-');
    }, 
    
    showQuids: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var split = thisOne.split('^');
                        component.set("v.popped", true);
                        var whichOne = split[0].substring(1);
                        component.set("v.currentItemId", whichOne);
                        component.set("v.currentAccountName", split[1]);
                        helper.getQuids(component);
                    }
                }
            }), 500
        );
    },
    
    confirmDeleteQuid: function(component, event, helper) {
        var whichOne = event.target.id;
        component.set("v.popped", true);
        component.set("v.currentQuidId", whichOne);
        component.set("v.popupHeader", 'Quid Pro Quo');
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteQuid: function(component, event, helper) {
        var action = component.get("c.getDeleteQuid");
        action.setParams({
            "quidId": component.get("v.currentQuidId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            helper.getQuids(component);
            helper.getBatchItems(component);  
        });
        $A.enqueueAction(action);
    },
    
    saveQuids: function(component, event, helper) {
        component.set("v.popped", false);
        var action = component.get("c.getSaveQuids");
        action.setParams({
            "quids": component.get("v.quids")
        });
        $A.enqueueAction(action);
        
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        
        helper.hidePopupHelper(component, 'quidsDialog', 'slds-fade-in-');
    },
    
    hideQuidsPopup: function(component, event, helper) {
        component.set("v.popped", false);
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        helper.hidePopupHelper(component, 'quidsDialog', 'slds-fade-in-');
    },
    
    showTributes: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[1]);
                        helper.getTributes(component);
						/*var action = component.get("c.getTributes");
                        action.setParams({
                            "batchItemId": split[0]
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.tributes", data.getReturnValue());
                            helper.showPopupHelper(component, 'tributesDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);   */ 
                    }
                }
            }), 500
        );
    },
    
    confirmDeleteTribute: function(component, event, helper) {
        var whichOne = event.target.id;
        component.set("v.popped", true);
        component.set("v.currentTributeId", whichOne);
        component.set("v.popupHeader", 'Tribute');
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteTribute: function(component, event, helper) {
        var action = component.get("c.getDeleteTribute");
        action.setParams({
            "tributeId": component.get("v.currentTributeId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            helper.getTributes(component);
            helper.getBatchItems(component);  
        });
        $A.enqueueAction(action);
    },
    
    hideTributesPopup: function(component, event, helper) {
        component.set("v.popped", false);
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        helper.hidePopupHelper(component, 'tributesDialog', 'slds-fade-in-');
    },
    
    showRecognitions: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        var split = whichOne.split('^');
                        component.set("v.popped", true);
                        component.set("v.currentItemId", split[0]);
                        component.set("v.currentAccountName", split[1]);
                        helper.getRecognitions(component);
                        /*var action = component.get("c.getRecognitions");
                        action.setParams({
                            "batchItemId": whichOne
                        });
                        action.setCallback(this, function(data) {
                            component.set("v.recognitions", data.getReturnValue());
                            helper.showPopupHelper(component, 'recognitionsDialog', 'slds-fade-in-');
                        });
                        $A.enqueueAction(action);*/
                    }
                }
            }), 500
        );
    },
    
    hideRecognitionsPopup: function(component, event, helper) {
        component.set("v.popped", false);
        var refresh = component.get("v.refresh");
        if (refresh)
            helper.getBatchItems(component);    
        helper.hidePopupHelper(component, 'recognitionsDialog', 'slds-fade-in-');
    },
    
    confirmDeleteRecognition: function(component, event, helper) {
        var whichOne = event.target.id;
        var split = whichOne.split('^');
        component.set("v.popped", true);
        component.set("v.currentRecognitionId", split[0]);
        component.set("v.currentAccountName", split[1]);
        component.set("v.popupHeader", 'Recognition Credit');
        helper.showPopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
    },
    
    deleteRecognition: function(component, event, helper) {
        var action = component.get("c.getDeleteRecognition");
        action.setParams({
            "recognitionId": component.get("v.currentRecognitionId")
        });
        action.setCallback(this, function(data) {
            component.set("v.popped", false);
            helper.hidePopupHelper(component, 'confirmDeleteDialog', 'slds-fade-in-');
            helper.getRecognitions(component);
            helper.getBatchItems(component);  
         });
        $A.enqueueAction(action);
    },
    
    showFiles: function(component, event, helper) {
        component.set("v.popupGo", true);
        component.set("v.currentPopupId", event.target.id);
        window.setTimeout(
            $A.getCallback(function() {
                if (component.isValid()) {
                    var popup = component.get("v.popupGo");
                    var popped = component.get("v.popped");
                    var oldOne = component.get("v.currentPopupId");
                    var thisOne = event.target.id;
                    if (popup && !popped && oldOne == thisOne) {
                        var whichOne = event.target.id.substring(1);
                        var action = component.get("c.getFiles");
                        action.setParams({
                            "batchItemId": whichOne
                        });
                        action.setCallback(this, function(data) {
                            $A.get('e.lightning:openFiles').fire({
                                recordIds: data.getReturnValue(),
                                selectedRecordId: null
                            });
                        });
                        $A.enqueueAction(action);
                    }
                }
            }), 500
        );
    },
    
    callBatchItems:function(component, event, helper) {
		var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "AQB:BatchItems",
			componentAttributes: {
                batch : component.get("v.batch"),
                close : false
            }
		});

		evt.fire();
	},
    
    hideErrorPopup: function(component, event, helper) {
        component.set("v.popped", false);
        helper.hidePopupHelper(component, 'errorDialog', 'slds-fade-in-');
    }, 
    

})