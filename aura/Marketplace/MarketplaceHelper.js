({
  loadPage: function(component) {
    var results = component.get("v.Allpackages");
    var currentPage = component.get("v.currentPageNum");
    var pageSize = component.get("v.pageSize");
    var startNumber = 0;
    var endNumber = pageSize * currentPage;
    if (currentPage > 1) {
      startNumber = pageSize * (currentPage - 1);
    }
    if (endNumber > results.length) {
      endNumber = results.length;
    }
    var pageResults = [];
    while (startNumber < endNumber) {
      pageResults.push(results[startNumber]);
      startNumber++;
    }
    $A.util.toggleClass(component.find('loading-span-stencil'),'hide-loading-span');
    component.set('v.packages', pageResults);
    setTimeout($A.getCallback(function(){
        component.set('v.loading',false);
    }),250);
  },
  buildLoadData: function(component) {
    var PAGE_SIZE = 10;
    component.set('v.pageSize', PAGE_SIZE);
    component.set('v.currentPageNum', 1);
    var action = component.get("c.getAllApplications");
    action.setCallback(this, function(response) {
        if (response.getState() === 'SUCCESS') {
        var resultsMap = JSON.parse(response.getReturnValue());
        if (!$A.util.isUndefinedOrNull(resultsMap.error)) {
            component.set('v.errorModalHeader','Marketplace Load Failed');
            component.set('v.packageInstallError',resultsMap.error);
            $('#modalUploadPackageError').modal('show');
        }
          else {
                if (resultsMap.metadata && resultsMap.metadata.enableMaintenanceMode) {
                    component.set('v.enableMaintainence', true)
                } else {
                    var key;
                    var results;
                    if (resultsMap.data != null) {
                        var packagesMap = resultsMap.data;
                        component.set('v.errorModalHeader','Package Install Failed');
                        component.set('v.AllpackagesMap', packagesMap);
                        results = [];
                        for (key in packagesMap) {
                          results.push(packagesMap[key]);
                        }
                    } else if (resultsMap.data == null || resultsMap.data === 'undefined' ) { // per Kruti, the string literal "undefined" might come back from Mongo.
                      component.set('v.errorModalHeader','Package Install Failed');
                      component.set('v.AllpackagesMap', resultsMap);
                      results = [];
                      for (key in resultsMap) {
                        results.push(resultsMap[key]);
                      }
                    }
                  var resultSize = results.length;
                  if (resultSize > 0) {
                    var pages = parseInt(resultSize / PAGE_SIZE, 10);
                    if (pages * PAGE_SIZE < resultSize) {
                      pages++;
                    }
                    component.set('v.Allpackages', results);
                    component.set('v.packagesSize', results.length);
                    component.set('v.totalPages', pages);
                    this.loadPage(component);
                  }
              }
          }
        }
      });
    $A.enqueueAction(action);
  },
  installPackage: function(component, event) {
    var currentInstallingPackage = event.currentTarget.dataset.id;
    var applications = component.get("v.AllpackagesMap");
    var installType = event.currentTarget.dataset.type;
	applications[currentInstallingPackage].isUpgrading = true;
	applications[currentInstallingPackage].installAvailable = false;
	applications[currentInstallingPackage].upgradeAvailable = false;
	component.set('v.AllpackagesMap',applications);
	var results = [];
	for (var key in applications) {
	  results.push(applications[key]);
	}
	component.set('v.Allpackages',results);
	this.loadPage(component);
	$('.install-package-set').prop("disabled",true);

    var action = component.get("c.installPackage");
    action.setParams({
      packageToInstall: JSON.stringify(applications[currentInstallingPackage])
    });
      currentInstallingPackage = '';
    action.setCallback(this, function(response) {
      if (response.getState() === 'SUCCESS') {
        var result = JSON.parse(response.getReturnValue());
		component.set('v.asyncResult',result);
		this.pollInstallComplete(component,this);
      }
    });
    $A.enqueueAction(action);
  },
	pollInstallComplete : function(component,helper) {
		var intervalTimer = setInterval($A.getCallback(
			function() {
				var action = component.get("c.checkInstallComplete");
				var asyncResult = component.get('v.asyncResult');
				action.setParams({
				  asyncResultId: asyncResult.id
				});
				action.setCallback(this, function(response) {
				  if (response.getState() === 'SUCCESS') {
					var result = JSON.parse(response.getReturnValue());
					if (result.installComplete) {
						clearInterval(component.get('v.intervalTimer'));
					}
					if (result.installComplete && !result.installSuccessful) {
						if (!$A.util.isUndefinedOrNull(component.get('v.intervalTimer'))) {
							component.set('v.packageInstallError',result.installErrorMessage);
							$('#modalUploadPackageError').modal('show');
							helper.buildLoadData(component);
						}
						$('.install-package-set').prop("disabled",false);
						component.set('v.intervalTimer',null);
					}
					else if (result.installComplete && result.installSuccessful) {
						if (!$A.util.isUndefinedOrNull(component.get('v.intervalTimer'))) {
							$('#modalRunConfirmation').modal('show');
							helper.buildLoadData(component);
						}
						$('.install-package-set').prop("disabled",false);
						component.set('v.intervalTimer',null);
					}
				  }
				});
				$A.enqueueAction(action);
			}), 5000);
		component.set('v.intervalTimer',intervalTimer);
	},
    getLabelStrings : function(component){
        var action = component.get("c.getLabels");
        action.setCallback(this, function(response) {
            if (response.getError() && response.getError().length) {
                return null;
            }
            var responseObj = JSON.parse(response.getReturnValue());
            component.set('v.installSuccessfullyRun',responseObj.scriptSuccessfullyRun);
            component.set('v.successLabel',responseObj.successLabel);

        });

        $A.enqueueAction(action);
    }
})