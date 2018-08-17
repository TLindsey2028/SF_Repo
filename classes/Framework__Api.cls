/*
This file is generated and isn't the actual source code for this
managed global class.
This read-only file shows the class's global constructors,
methods, variables, and properties.
To enable code to compile, all methods return null.
*/
global class Api {
    global Api() {

    }
    global static List<SObject> deserialize(String apiService, dom.XmlNode node) {
        return null;
    }
    global static List<Framework.Api.Grouping> getAPIGroupings(String apiService) {
        return null;
    }
    global static List<Framework.Api.Resource> getAllResources() {
        return null;
    }
    global static List<Framework.Api.Dispatch> getDispatchObjs() {
        return null;
    }
    global static List<Framework.Api.Dispatch> getDispatchObjs(String apiService) {
        return null;
    }
    global static Map<String,Object> getLastJSONResponse(Framework.Api.Resource resource, String httpVerb) {
        return null;
    }
    global static String getLastRawResponse(Framework.Api.Resource resource, String httpVerb) {
        return null;
    }
    global static Framework.Api.Mapping getMapping(String apiResource, String apiObject, String apiField) {
        return null;
    }
    global static List<Framework.Api.Mapping> getMappings(String apiResource, String apiObject) {
        return null;
    }
    global static Map<String,Object> getPreviousJSONResponse(Framework.Api.Resource resource, String httpVerb, Integer position) {
        return null;
    }
    global static Framework.Api.Resource getResource(String apiService, String targetSObject) {
        return null;
    }
    global static List<Framework.Api.Resource> getResourcesByGrouping(String apiGrouping) {
        return null;
    }
    global static List<Framework.Api.Resource> getResources(String apiService) {
        return null;
    }
    global static Framework.Api.Service getService(String apiService) {
        return null;
    }
    global static Framework.Api.ServiceConnectionConfig getServiceConnectionConfig(String serviceConnection, String name) {
        return null;
    }
    global static List<Framework.Api.ServiceConnection> getServiceConnections(String apiService) {
        return null;
    }
    global static List<Framework.Api.Service> getServices() {
        return null;
    }
    global static List<Framework.Api.Service> getServices(String namespace) {
        return null;
    }
    global static List<Framework.Api.Variable> getVariables(String apiResource) {
        return null;
    }
    global static List<SObject> get(String resourceName) {
        return null;
    }
    global static List<SObject> get(String resourceName, Framework.Api.ResourceConfig config) {
        return null;
    }
    @TestVisible
    global static String makeRequest(String endpoint, String uri, List<String> uriParameters, Map<String,String> urlParameters, Framework.VendorAuthenticationService vendorAuthService, String body, String method, Map<String,String> headers, Boolean debugMode, Boolean retryAuth) {
        return null;
    }
    global static List<SObject> post(String resourceName, List<SObject> SObjects) {
        return null;
    }
    global static List<SObject> post(String resourceName, List<SObject> SObjects, Framework.Api.ResourceConfig config) {
        return null;
    }
    global static List<SObject> post(String resourceName, SObject sObj) {
        return null;
    }
    global static List<SObject> post(String resourceName, SObject sObj, Framework.Api.ResourceConfig config) {
        return null;
    }
    global static List<SObject> put(String resourceName, List<SObject> SObjects) {
        return null;
    }
    global static List<SObject> put(String resourceName, List<SObject> SObjects, Framework.Api.ResourceConfig config) {
        return null;
    }
    global static List<SObject> put(String resourceName, SObject sObj) {
        return null;
    }
    global static List<SObject> put(String resourceName, SObject sObj, Framework.Api.ResourceConfig config) {
        return null;
    }
    global static Framework.Api.ServiceConnectionConfig setDailyCalloutLimitConfig(String apiServiceConnection, Integer dailyLimit) {
        return null;
    }
global class Dispatch {
    global Boolean afterInsert;
    global Boolean afterUpdate;
    global String apiResource;
    global String apiService;
    global String configId;
    global Boolean disableRun;
    global List<Framework.Api.DispatchHeaderVariables> dispatchVariables;
    global Integer executionOrder;
    global String httpVerb;
    global Boolean isEnabled;
    global String sObjectName;
    global Dispatch() {

    }
}
global class DispatchHeaderVariables {
    global String apiDispatch;
    global String configId;
    global Boolean isHeader;
    global Boolean isTokenVariable;
    global Boolean isVariable;
    global String key;
    global Integer tokenOrder;
    global String value;
    global DispatchHeaderVariables() {

    }
}
global class Grouping {
    global Grouping() {

    }
    global String getApiObject() {
        return null;
    }
    global String getApiResource() {
        return null;
    }
    global String getApiService() {
        return null;
    }
    global String getGroupingId() {
        return null;
    }
    global String getTargetrelatedLookupField() {
        return null;
    }
    global void setApiObject(String apiObject) {

    }
    global void setApiResource(String apiResource) {

    }
    global void setApiService(String apiService) {

    }
    global void setGroupingId(String groupingId) {

    }
    global void setTargetrelatedLookupField(String targetrelatedLookupField) {

    }
}
global class Mapping {
    global String apiField;
    global String apiObject;
    global String apiResource;
    global String apiService;
    global String configId;
    global String relatedObjectField;
    global String targetField;
    global String targetFieldType;
    global Mapping() {

    }
}
global class Resource {
    global String apiObject;
    global String apiObjectKeyField;
    global String apiService;
    global String configId;
    global String createURI;
    global String createVerb;
    global String deleteURI;
    global String deleteVerb;
    global Boolean disablePostPutParse;
    global List<Framework.Api.Mapping> mappings;
    global String readURI;
    global String readVerb;
    global String targetObjectKeyField;
    global String targetSObject;
    global String updateURI;
    global String updateVerb;
    global List<Framework.Api.Variable> variables;
    global Resource() {

    }
    global String getParentGrouping() {
        return null;
    }
    global void setParentGrouping(String parentGrouping) {

    }
}
global class ResourceConfig {
    global ResourceConfig() {

    }
    global ResourceConfig(Map<String,String> parameters, List<String> uriParameters, Map<String,String> headers) {

    }
    global void setCheckForExistingRecords(Boolean checkForExistingRecords) {

    }
    global void setHeaders(Map<String,String> headers) {

    }
    global void setParameters(Map<String,String> parameters) {

    }
    global void setRawResponseOnly(Boolean rawResponseOnly) {

    }
    global void setServiceConnection(String serviceConnection) {

    }
    global void setUriParameters(List<String> uriParameters) {

    }
}
global class Service {
    global String apexClass;
    global Framework.VendorAuthenticationService.AuthType authType;
    global List<Framework.Api.ServiceConnection> connections;
    global Boolean debugMode;
    global String description;
    global String displayName;
    global String endpoint;
    global String imagePath;
    global Boolean isEnabled;
    global Boolean isReadOnly;
    global String name;
    global String namespace;
    global List<Framework.Api.Resource> resources;
    global Service() {

    }
}
global class ServiceConnection {
    global String accessToken;
    global String apiService;
    global String clientId;
    global String clientSecret;
    global String configId;
    global List<Framework.Api.ServiceConnectionConfig> configs;
    global Boolean isDefault;
    global String password;
    global String refreshToken;
    global String scope;
    global String username;
    global ServiceConnection() {

    }
}
global class ServiceConnectionConfig {
    global String apiServiceConnection;
    global String configId;
    global Boolean isMasked;
    global String name;
    global String value;
    global ServiceConnectionConfig() {

    }
}
global class Variable {
    global String apiResource;
    global String configId;
    global String defaultValue;
    global Map<String,String> deserializeMapping;
    global String fieldApiName;
    global String fieldApiValue;
    global Boolean required;
    global Map<String,String> serializeMapping;
    global Variable() {

    }
}
}
