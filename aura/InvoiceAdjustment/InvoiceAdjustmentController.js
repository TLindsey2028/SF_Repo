({
    doInit: function(component) {
      component.find('messagePrompt').showModal();
    },
    goBack : function (component) {
        window.history.back();
    }
})