<aura:application description="ChargeInvoicePaymentApp" access="GLOBAL" extends="ltng:outApp" useAppCache="true">
	<aura:dependency resource="OrderApi:InvoicePayment"/>
	<aura:dependency resource="OrderApi:PayNow"/>
	<aura:dependency resource="OrderApi:SalesOrderSummaryLine"/>
	<aura:dependency resource="Framework:InputFields"/>
	<aura:dependency resource="Framework:Button"/>
	<aura:dependency resource="Framework:CurrencyField"/>
	<aura:dependency resource="Framework:Toast"/>
</aura:application>