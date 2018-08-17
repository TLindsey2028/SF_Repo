({
    getData: function(component) {
        this.showGridSpinner(component);
        var action = component.get('c.retrieveEmailSendDefinitionDetails');
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                this.showData(component, response.getReturnValue());
            } else if (state === 'ERROR') {
                var errors = response.getError();
                var error;
                if (errors && errors[0] && errors[0].message) {
                    error = errors[0].message;
                } else {
                    error = $A.get("$Label.et4ae5.trackingDataCleanupGridUnknownError");
                }
                this.showError(component, error);
            } else if (state === 'INCOMPLETE') {
                // The server didn't return a response, treat this as an unknown error
                this.showError(component, $A.get("$Label.et4ae5.trackingDataCleanupGridUnknownError"));
            }
            this.hideGridSpinner(component);
        }));

        // How data should be sorted
        var sortDirection = component.get('v.sortedDirection');
        var sortByField = component.get('v.sortedBy');

        // Determine range of rows to get
        var pageNumber = component.get('v.currentPage');
        var pageSize = component.get('v.itemsPerPage');
        var lowIndex = ((pageNumber - 1) * pageSize);

        action.setParams({ 
                lowIndex : lowIndex, 
                pageSize: pageSize,
                sortDirection : sortDirection, 
                sortByField : sortByField 
            });
        $A.enqueueAction(action);
    },
    // This method is called when the page is changed
	changePage : function(component, newPage) {
        this.deselectAllRows(component);
        component.set('v.currentPage', newPage);
        this.getData(component);   
        
        //Update displayed pages such that the current page is display in the middle of the list
        var currentPage = newPage;
        var maxPage = component.get('v.maxPage');
        var numPagesToShow = component.get('v.numPagesToShow');
        //Don't display more pages than are available
        if (maxPage < numPagesToShow) {
            numPagesToShow = maxPage;
        }
        //Determine lowIndex
        var lowIndex = currentPage - Math.ceil(numPagesToShow/2);
        // If the first page to show is negative, start from 0
        if (lowIndex < 0) {
            lowIndex = 0;
        }
        // If the first page to show is in the last group of pages,
        // show the entire last group
        else if (lowIndex > maxPage - numPagesToShow) {
            lowIndex = maxPage - numPagesToShow;
        }
        
        var currentPages = [];
        for (var i = 0; i < numPagesToShow; ++i) {
            //Add 1 since pages are 1 based
            currentPages.push(lowIndex + i + 1);
        }
        component.set('v.currentPages', currentPages);
    },
    rowsSelected : function(component, selectedRows) {
        //Used to determine whether or not to enable the delete selected tracking data button
        component.set('v.isRowSelected', selectedRows.length > 0);
    },
    deselectAllRows : function(component) {
        component.set('v.selectedRows', []);
        this.rowsSelected(component, []);
    },
    // Called when Next or Previous are clicked as well as when a column is clicked for sorting. Also called to dismiss the modal.
    showSelectionModal : function(component, event, helper, show) {
        if (show) {
            $A.util.addClass(component.find("modalBox"), "slds-fade-in-open");
            $A.util.addClass(component.find("modalBackdrop"), "slds-backdrop_open");
        }
        else {
            $A.util.removeClass(component.find("modalBox"), "slds-fade-in-open");
            $A.util.removeClass(component.find("modalBackdrop"), "slds-backdrop_open");
        }
    },
    changePageSize : function(component, newPageSize) {
        var itemsPerPage = component.get('v.itemsPerPage');
        var recordCount = component.get('v.recordCount');
        var numPagesToShow = component.get('v.numPagesToShow');
        
        //Update display and maxpage
        var maxPage = this.calculateMaxPage(recordCount, newPageSize);
        component.set('v.maxPage', maxPage);
        component.set('v.itemsPerPage', newPageSize);

        //Switch to first page
        this.changePage(component, 1);
    },
    requestPageChange : function(component, event, desiredPage) {
        // Boundary checks
        // New page is the same as the current page
        var currentPage = component.get('v.currentPage');
        if (desiredPage == currentPage) { return; }
        // New page is 0 or less
        if (desiredPage < 1) { return; }
        // New page is Larger than largest page with data
        var maxPage = component.get('v.maxPage');
        if (desiredPage > maxPage) { return; }
        // Display warning Modal if items selected, delaying page change until confirmation
        // Otherwise continue
        var isRowSelected = component.get('v.isRowSelected');
        if (isRowSelected) {
            component.set('v.desiredPage', desiredPage);
            this.showSelectionModal(component, event, this, true);
        }
        else {
            this.changePage(component, desiredPage);
        }
    },
    requestSort : function(component, event, desiredSortDirection, desiredSortField) {
        // Boundary Checks
        // If already sorted by this field and direction, nothing to do
        var currentSortField = component.get('v.sortedBy');
        var currentSortDirection = component.get('v.sortedDirection');
        if (currentSortDirection == desiredSortDirection && currentSortField == desiredSortField) {
            return;
        }
        // Display warning Modal if items selected, delaying page change until confirmation
        // Otherwise continue
        var isRowSelected = component.get('v.isRowSelected');
        if (isRowSelected) {
            component.set('v.desiredSortedDirection', desiredSortDirection);
            component.set('v.desiredSortedBy', desiredSortField);
            component.set('v.desiredPage', 1);
            component.set('v.isSorting', true);
            this.showSelectionModal(component, event, this, true);
        }
        else {
            // Used in page change when retrieving data
            component.set('v.sortedDirection', desiredSortDirection);
            component.set('v.sortedBy', desiredSortField);
            // Changing the page updates the data set with appropriate sort
            // Change to first page so user doesn't have to navigate there themselves
            component.set('v.currentPage', 1);
            this.changePage(component, 1);
        }
    },
    requestPageSizeChange : function(component, event, desiredPageSize) {
        var itemsPerPage = component.get('v.itemsPerPage');
        // If desiredPageSize is the same as the current page size, no need to continue
        if (desiredPageSize == itemsPerPage) { return; }

        var isRowSelected = component.get('v.isRowSelected');
        if (isRowSelected) {
            component.set('v.desiredPageSize', desiredPageSize);
            component.set('v.isPageSizeChanging', true);
            this.showSelectionModal(component, event, this, true);
        }
        else {
            this.changePageSize(component, desiredPageSize);
        }
    },
    calculateMaxPage : function(recordCount, pageSize) {
       return (pageSize !== 0 ? Math.ceil(recordCount/pageSize) : 1);
    },
    showDeleteSelectionModal : function(component, event, helper, show) {
        if (show) {
            //initialize inputs on the modal
            component.find("chkSendDef").set("v.checked", false);
            component.find("chkIER").set("v.checked", false);
            component.find("chkILD").set("v.checked", false);
            component.find("chkALD").set("v.checked", false);
            component.find("chkSendDef").set("v.disabled", false);
            component.find("chkIER").set("v.disabled", false);
            component.find("chkILD").set("v.disabled", false);
            component.find("chkALD").set("v.disabled", false);

            component.find("radioDeleteAll").set("v.checked", true);
            component.find("radioDeleteOnlyNotOpenedNotClicked").set("v.checked", false);
            component.find("radioDeleteOnlyNotOpened").set("v.checked", false);
            component.find("radioDeleteOnlyNotClicked").set("v.checked", false);
            component.find("radioDeleteAll").set("v.disabled", true);
            component.find("radioDeleteOnlyNotOpenedNotClicked").set("v.disabled", true);
            component.find("radioDeleteOnlyNotOpened").set("v.disabled", true);
            component.find("radioDeleteOnlyNotClicked").set("v.disabled", true);

            var emailAddress = component.find("emailAddress");
            emailAddress.set("v.value", "");
            $A.util.removeClass(emailAddress, "slds-has-error");
            component.set("v.emailAddresses", []);

            component.find("chkConfirmDelete").set("v.checked", false);

            $A.util.addClass(component.find("errorTrackingLevel"), "slds-hide");
            $A.util.addClass(component.find("errorEmail"), "slds-hide");
            $A.util.addClass(component.find("errorEmailListSize"), "slds-hide");
            $A.util.addClass(component.find("errorConfirm"), "slds-hide");
            $A.util.addClass(component.find("errorServer"), "slds-hide");
            $A.util.removeClass(component.find("errorTrackingLevel"), "slds-show");
            $A.util.removeClass(component.find("errorEmail"), "slds-show");
            $A.util.removeClass(component.find("errorEmailListSize"), "slds-show");
            $A.util.removeClass(component.find("errorConfirm"), "slds-show");
            $A.util.removeClass(component.find("errorServer"), "slds-show");

            $A.util.addClass(component.find("notificationDisplay"), "slds-hide");
            $A.util.removeClass(component.find("notificationDisplay"), "slds-show");
            
            $A.util.addClass(component.find("modalDeleteSelection"), "slds-fade-in-open");
            $A.util.addClass(component.find("modalBackdrop"), "slds-backdrop_open");
        }
        else {
            $A.util.removeClass(component.find("modalDeleteSelection"), "slds-fade-in-open");
            $A.util.removeClass(component.find("modalBackdrop"), "slds-backdrop_open");
        }
    },
    setIERRadioOptions : function(component, event, helper, isDisabled, desiredOptionId) {
        component.find("radioDeleteAll").set("v.disabled", isDisabled);
        component.find("radioDeleteOnlyNotOpenedNotClicked").set("v.disabled", isDisabled);
        component.find("radioDeleteOnlyNotOpened").set("v.disabled", isDisabled);
        component.find("radioDeleteOnlyNotClicked").set("v.disabled", isDisabled);

        var currentOptionId = component.get("v.ierRadioOptionIDSelected");
        if (currentOptionId == "") {
            //there is no current option selected (initialization), so set the current option to the desired option
            component.find(desiredOptionId).set("v.checked", true);
            component.set("v.ierRadioOptionIDSelected", desiredOptionId);
        }
        else if (desiredOptionId) {
            if (currentOptionId != desiredOptionId) {
                component.find(currentOptionId).set("v.checked", false);
                component.find(desiredOptionId).set("v.checked", true);
                component.set("v.ierRadioOptionIDSelected", desiredOptionId);
            }
        }
    },
    deleteSelectedRecords: function(component, event, helper, sendDefIds, deleteSendDefs, deleteIERs, deleteILDs, deleteALDs, optionIER, emails) {
        var action = component.get('c.deleteTrackingData');
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            var unknownError = $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteTrackingDataError");
            if (state === 'SUCCESS') {
                this.showDeleteSelectionModal(component, event, helper, false);
                //force in progress message to show
                component.set("v.isBatchJobRunning", true);
            } else if (state === 'ERROR') {
                var errors = response.getError();
                var error;
                if (errors && errors[0] && errors[0].message) {
                    error = errors[0].message; //show the error message thrown from the server side controller
                } else {
                    //show a more general/unknown error
                    error = unknownError;
                }
                //show message in notificationDisplay on delete selection modal
                component.set("v.deleteTrackingDataServerError", error);
                this.setNotificationDisplay(component, event, helper, true, "errorServer", true);
            } else if (state === 'INCOMPLETE') {
                // The server didn't return a response, treat this as an unknown error
                //show message in notificationDisplay
                component.set("v.deleteTrackingDataServerError", unknownError);
                this.setNotificationDisplay(component, event, helper, true, "errorServer", true);
            }
        }));
        
        action.setParams({ 
                sendDefinitionIds : sendDefIds, 
                deleteSendDefinitions: deleteSendDefs,
                deleteAggregateLinkLevelDetails : deleteALDs, 
                deleteIndividualEmailResults : deleteIERs,
                deleteIndividualLinkLevelDetails : deleteILDs,
                selectedIEROption : optionIER,
                emailAddresses : emails
            });
        $A.enqueueAction(action);
    },
    deleteAllRecords: function(component, event, helper, deleteSendDefs, deleteIERs, deleteILDs, deleteALDs, optionIER, emails) {
        var action = component.get('c.deleteAllTrackingData');
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            var unknownError = $A.get("$Label.et4ae5.trackingDataCleanupGridDeleteTrackingDataError");
            if (state === 'SUCCESS') {
                this.showDeleteSelectionModal(component, event, helper, false);
                //force in progress message to show
                component.set("v.isBatchJobRunning", true);
            } else if (state === 'ERROR') {
                var errors = response.getError();
                var error;
                if (errors && errors[0] && errors[0].message) {
                    error = errors[0].message; //show the error message thrown from the server side controller
                } else {
                    //show a more general/unknown error
                    error = unknownError;
                }
                //show message in notificationDisplay on delete selection modal
                component.set("v.deleteTrackingDataServerError", error);
                this.setNotificationDisplay(component, event, helper, true, "errorServer", true);
            } else if (state === 'INCOMPLETE') {
                // The server didn't return a response, treat this as an unknown error
                //show message in notificationDisplay
                component.set("v.deleteTrackingDataServerError", unknownError);
                this.setNotificationDisplay(component, event, helper, true, "errorServer", true);
            }
        }));
        
        action.setParams({ 
                deleteSendDefinitions: deleteSendDefs,
                deleteAggregateLinkLevelDetails : deleteALDs, 
                deleteIndividualEmailResults : deleteIERs,
                deleteIndividualLinkLevelDetails : deleteILDs,
                selectedIEROption : optionIER,
                emailAddresses : emails
            });
        $A.enqueueAction(action);
    },
    showGridSpinner: function (component) {
        component.set("v.showGridSpinner", true);
    },    
    hideGridSpinner: function (component) {
        component.set("v.showGridSpinner", false);
    },
    showData : function(component, sendData) {
        var isEmpty = Object.keys(sendData).length == 0;
        if (isEmpty) {
            component.set('v.emptyRecords', true);
        } else {
            component.set('v.emailSends', sendData);
        }
        component.set('v.isUnknownError', false);
        component.set('v.isMaxRecordsError', false);
    },
    showError : function(component, error) {
        if (error.startsWith("toomanyrecords")) {
            this.showTooManyRecordsError(component, error);
        } else {
            component.set('v.errorMessageText', error);
            component.set('v.isUnknownError', true);
        }
    },
    showTooManyRecordsError : function(component, error) {
        var numRecords = error.split("_")[1];
        var recordsError = $A.get("$Label.et4ae5.trackingDataCleanupGridTooManyRecordsError");
        var formattedError = recordsError.replace('{0}', numRecords);

        component.set('v.emailSends', null);
        component.set('v.errorMessageText', formattedError);
        component.set('v.isMaxRecordsError', true);
    },
    setNotificationDisplay : function(component, event, helper, showDisplay, messageElementId, showMessage) {
        var notificationDisplay = component.find("notificationDisplay");
        var errorMessage = component.find(messageElementId);

        if (showDisplay) {
            if ($A.util.hasClass(notificationDisplay, "slds-hide")) {
                $A.util.removeClass(notificationDisplay, "slds-hide");
                $A.util.addClass(notificationDisplay, "slds-show");
            }
        }
        else {
            if ($A.util.hasClass(notificationDisplay, "slds-show")) {
                $A.util.removeClass(notificationDisplay, "slds-show");
                $A.util.addClass(notificationDisplay, "slds-hide");
            }
        }
        
        if (showMessage) {
            if ($A.util.hasClass(errorMessage, "slds-hide")) {
                $A.util.removeClass(errorMessage, "slds-hide");
                $A.util.addClass(errorMessage, "slds-show");
            }
        }
        else {
            if ($A.util.hasClass(errorMessage, "slds-show")) {
                $A.util.removeClass(errorMessage, "slds-show");
                $A.util.addClass(errorMessage, "slds-hide");
            }
        }

        //if there are no error messages showing, hide the notification display
        var isHiddenErrorTrackingLevel = $A.util.hasClass(component.find("errorTrackingLevel"), "slds-hide");
        var isHiddenErrorEmail = $A.util.hasClass(component.find("errorEmail"), "slds-hide");
        var isHiddenErrorEmailListSize = $A.util.hasClass(component.find("errorEmailListSize"), "slds-hide");
        var isHiddenErrorConfirm = $A.util.hasClass(component.find("errorConfirm"), "slds-hide");
        var isHiddenErrorServer = $A.util.hasClass(component.find("errorServer"), "slds-hide");

        if (isHiddenErrorTrackingLevel && isHiddenErrorEmail && isHiddenErrorConfirm && isHiddenErrorServer && isHiddenErrorEmailListSize) {
            //all error messages are hidden so hide the notification display
            if ($A.util.hasClass(notificationDisplay, "slds-show")) {
                $A.util.removeClass(notificationDisplay, "slds-show");
                $A.util.addClass(notificationDisplay, "slds-hide");
            }
        }
    },
    // Called when Confirm is clicked on the modal (needs to handle confirm sort and paging)
    confirmSelectionModal : function(component, event, helper){
        var isSorting = component.get('v.isSorting');
        var isPageSizeChanging = component.get('v.isPageSizeChanging');
        if (isSorting) {
            component.set('v.isSorting', false);
            component.set('v.sortedBy', component.get('v.desiredSortedBy'));
            component.set('v.sortedDirection', component.get('v.desiredSortedDirection'));        
            //Changing the page updates the data set with appropriate sort
            component.set('v.currentPage', 1);
            this.changePage(component, 1);
            this.showSelectionModal(component, event, helper, false);
        }
        else if (isPageSizeChanging) {
            component.set('v.isPageSizeChanging', false);
            this.changePageSize(component, component.get('v.desiredPageSize'));
            this.showSelectionModal(component, event, helper, false);
        }
        else {
            var newPage = Number(component.get('v.desiredPage'));
            this.changePage(component, newPage);
            this.showSelectionModal(component, event, helper, false);
        }
    },
    // Called when Confirm is clicked on the delete modal (needs to handle confirm sort and paging)
    confirmDeleteSelectionModal : function(component, event, helper) {
        var clickedButtonId = component.get("v.deleteButtonClicked");
        var deleteSendDefs = component.find("chkSendDef").get("v.checked");
        var deleteIERs = component.find("chkIER").get("v.checked");
        var deleteILDs = component.find("chkILD").get("v.checked");
        var deleteALDs = component.find("chkALD").get("v.checked");
        var selectedIEROption = component.find(component.get("v.ierRadioOptionIDSelected")).get("v.value");
        var currentEmailList = this.deepCopySimpleArray(component.get("v.emailAddresses"));
        var maxEmailAddresses = component.get("v.maxEmailAddresses");        
        var confirmedDelete = component.find("chkConfirmDelete").get("v.checked");
        var newEmailControl = component.find("emailAddress");
        var newEmailValidity = newEmailControl.get("v.validity");
        var newEmailValue = newEmailControl.get("v.value"); 
        var errorElementIds = [];

        //Check validity
        //add the value in the email input field to the list of emails even though the user hasn't clicked Add
        if (newEmailValue) {
            if (newEmailValidity.valid) {
                currentEmailList.push(newEmailValue);
            }
            else {
                errorElementIds.push("errorEmail");
            }
        }

        if (currentEmailList.length > maxEmailAddresses) {
            errorElementIds.push("errorEmailListSize");
        }
        
        if (!confirmedDelete) {
            //user needs to check confirm
            errorElementIds.push("errorConfirm");
        }
        
        if (!deleteSendDefs && !deleteIERs && !deleteILDs && !deleteALDs) {
            errorElementIds.push("errorTrackingLevel");
        }

        // If invalid, display errors
        if (errorElementIds.length > 0) {
            for (var i = 0; i < errorElementIds.length; ++i) {
                this.setNotificationDisplay(component, event, this, true, errorElementIds[i], true);
            }
            return;
        }

        // Otherwise send the delete request
        if (clickedButtonId == "btnDeleteSelected") {
            //user only wants to delete the rows selected
            var selectedRows = component.find("tableExpiredRecords").getSelectedRows();
            if (selectedRows.length > 0) {
                var sendDefIds = [];
                for (var i = 0; i < selectedRows.length; i++) {
                    sendDefIds.push(selectedRows[i].id);
                }

                this.deleteSelectedRecords(component, event, helper, JSON.stringify(sendDefIds), deleteSendDefs, deleteIERs, deleteILDs, deleteALDs, selectedIEROption, JSON.stringify(currentEmailList));
            }
        }
        else {
            //user wants to delete all
            this.deleteAllRecords(component, event, helper, deleteSendDefs, deleteIERs, deleteILDs, deleteALDs, selectedIEROption, JSON.stringify(currentEmailList));
        }
    },
    // Called when either Delete button is clicked, to initialize the delete selection modal
    deleteRecords : function(component, event, helper) {
        var clickedButtonId = event.getSource().getLocalId();
        component.set("v.deleteButtonClicked", clickedButtonId);

        if (component.get("v.ierRadioOptionIDSelected") === "") {
            //first time delete modal has been opened
            this.setIERRadioOptions(component, event, helper, true, "radioDeleteAll");
        }
        
        this.showDeleteSelectionModal(component, event, helper, true);
    },
    // Called before any server side call is made to navigate pages, sort, display the delete selection modal, or submit a delete request
    // callback parameter is the function to be called once the check for isBatchRunning returns false
    isBatchRunnning : function(component, event, helper, callback) {
        var action = component.get('c.isBatchRunning');
        action.setCallback(this, $A.getCallback(function (response) {
            var state = response.getState();
            if (state === 'SUCCESS') {
                //value will be true or false
                var isRunning = response.getReturnValue();
                component.set("v.isBatchJobRunning", isRunning);
                
                if (!isRunning) {
                    if (typeof callback === "function") {
                        //.call sets the value to be used as the this object (inside whatever the callback function is) as the first parameter... all other parameters follow that
                        callback.call(this);
                    }
                }
            } else if (state === 'ERROR') {
                var errors = response.getError();
                var error;
                if (errors && errors[0] && errors[0].message) {
                    error = errors[0].message;
                } else {
                    error = $A.get("$Label.et4ae5.trackingDataCleanupGridUnknownError");
                }
                this.showError(component, error);
            } else if (state === 'INCOMPLETE') {
                // The server didn't return a response, treat this as an unknown error
                this.showError(component, $A.get("$Label.et4ae5.trackingDataCleanupGridUnknownError"));
            }
        }));

        $A.enqueueAction(action);
    },
    //A simple array is on in which the elements are "base" types: ints, strings, etc.
    //The term "deepCopy" is used because oldArray may be of type Proxy
    deepCopySimpleArray : function(oldArray) {
        var newArray = [];
        for (var i = 0; i < oldArray.length; ++i) {
            newArray.push(oldArray[i]);
        }
        return newArray;
    }
})