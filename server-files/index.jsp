<%@page import="com.contineonx.core.persistence.Find"%>
<%@page import="com.contineonx.core.app.AppSettings"%>
<%@page import="com.contineonx.core.security.BasicEncryption"%>
<%@page import="com.contineonx.core.common.BasicException"%>
<%@page import="com.contineonx.core.content.ContentManagementService"%>
<%@page import="com.contineonx.core.config.Tenant"%>
<%@page import="com.contineonx.core.security.AuthenticationService"%>
<%@page import="com.contineonx.core.security.SimpleAuthenticationService"%>
<%@page import="java.util.Map"%>
<%@page import="java.util.HashMap"%>
<%@page import="org.apache.commons.lang3.StringUtils"%>
<%@page import="org.apache.commons.io.FileUtils"%>
<%@page import="com.contineonx.core.persistence.Entity"%>
<%@page import="com.contineonx.core.app.ui.Widget"%>
<%@page import="com.contineonx.core.config.ConfigurationItem"%>
<%@page import="com.contineonx.core.User"%>
<%@page import="com.contineonx.core.app.ui.WebTheme"%>
<%@page import="com.contineonx.core.app.WebModule"%>
<%@page import="com.contineonx.core.config.Application"%>
<%@page import="javax.servlet.http.Cookie"%>
<%@page import="com.contineonx.core.web.AuthTokenCookie"%>
<%@page import="com.contineonx.core.common.AppUtil"%>
<%@page import="com.contineonx.core.web.TokenInfo"%>
<%@page import="com.contineonx.core.web.AuthTokenService"%> 
<%@page import="com.contineo.runtime.config.Config"%>
<%@page import="com.contineonx.core.config.ApplicationContextProvider"%>
<%@page import="java.io.File"%>
<%@page import="java.util.Collection"%>
<%@page language="java" contentType="text/html; charset=UTF-8"
   pageEncoding="UTF-8"%>
<%@page session="false"%>
<%

	response.setHeader("X-Frame-Options", "SAMEORIGIN");
	response.setHeader("X-XSS-Protection","1;mode=block");
	response.setHeader("X-Content-Type-Options", "nosniff");
	response.setHeader("Referrer-Policy", "no-referrer");
	response.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
	response.setHeader("Referrer-Policy", "no-referrer");
	response.setHeader("Content-Security-Policy", "script-src 'self' 'unsafe-inline' 'unsafe-eval' "
			+ " https://maps.googleapis.com https://fonts.googleapis.com https://developers.google.com https://www.google.com https://www.gstatic.com https://apis.google.com " 
			+ " https://cdnjs.cloudflare.com "
			+ " https://cdn.jsdelivr.net " 
			+ " https://code.highcharts.com "
			+ " https://code.tidio.co https://*.tidiochat.com/ "
			+ " https://uicdn.toast.com "
			+ " https://unpkg.com " 
			);


   String locale = request.getLocale().getLanguage();
   String frameworkPath = "appfiles/v-zero";
   String themeName = "contineo";
   Config configRef = (Config) ApplicationContextProvider.getApplicationContext().getBean("config");
   
   Object user = null;
   String tenant = null;
   
   String app = null;
   String module = null;
   //String email = null;
   String viewId = request.getParameter("viewId");
   System.out.println("viewId ############: " + viewId);
   User userRef = null;
   boolean afterLogin = false;
   
   if (viewId != null) {
   	String[] viewIdParts = viewId.split("-");
   	if (viewIdParts.length == 3) {
   		tenant = viewIdParts[0];
   		app = viewIdParts[1];
   		module = viewIdParts[2];
   	}
   }
   
   String subTenant = tenant;
   Tenant tenantRef = Application.getInstance().getApplicationTenant(tenant);
   tenant = tenantRef.getName();
     
   com.contineonx.core.Session sessionRef = tenantRef.createAnonymousSession();
   sessionRef.setSubTenant(subTenant);
   
   Application appRef = tenantRef.getApplicationByResourceId(sessionRef, app);
   sessionRef.setAppTenant(appRef);
   
   String tenantName = app;
   
   if ("qtis".equals(app)) {
   	  themeName = "qtistheme";
   }
   else if ("eliancesmembers".equals(app)) {
   	  themeName = "eliancesmembers";
   } 
   else {
 		File appThemeFolder = new File(AppUtil.getRootPath() + frameworkPath + "/shared/themes/" + app);
		if (appThemeFolder.exists()) {
			themeName = app;
		}
   }
   if (module != null && module.endsWith("formdesigner")) {
   	  themeName = "formdesigner";
   }
   
   String appURL = subTenant + "/webapps/" + app + "/";
   String pageURL = appURL + module;
   String bearerKey = pageURL.replace("/", "_");
   String queryString = request.getQueryString();
   
   String globalTagsMap = "{}";
   if (!AppUtil.isNullOrEmpty(queryString)) {
	   java.util.Map globalTags = new java.util.HashMap();
	   String[] qsParams = queryString.split("&");
	   for (String qsParam : qsParams) {
		  String[] paramParts = qsParam.split("="); 
		  globalTags.put(paramParts[0], paramParts[1]);
	   }
	   globalTagsMap = AppUtil.getJsonFromMap(globalTags);
   }
   
   String requestURL = request.getRequestURL().toString();
   System.out.println("Request URL 1: " + requestURL);
   System.out.println("Request URL 2: " + request.getServletPath());
      
   
   String uiFrameworkPath = request.getServletPath().replace("index.jsp", "");
   
   String apiURL = requestURL.replace(request.getServletPath(), "/");
   String baseApiURL = apiURL + tenant + "-" + app + "-api/";
   
   System.out.println("TENANT: " + tenant);
   System.out.println("API URL: " + apiURL);

	response.setHeader("Permissions-Policy", "geolocation=(self \""+apiURL+"\")");
   
   WebModule moduleRef = appRef.getWebModule(sessionRef, module);
   
   tenant = moduleRef.getTenant().getName();
   
   int sessionTimeoutPeriod = moduleRef.getInt("sessionTimeoutPeriod", 15);
   
   String logoURL = moduleRef.getLogoURL();
   if (logoURL != null && logoURL.startsWith("../images/")) {
	logoURL = "../../" + logoURL;
   }
   
   String caseId = "NA";
   
   boolean isAuthenticationRequired = moduleRef.getWebAuthenticationService() == null ? false : true;
   boolean hasTokenCookie = false;
   boolean isAuthenticated = false;
   
   String authService = "NA";
   
   String beforeLogoutScript = "function() { return true; }";
   
   String token = null;
   String tokenSource = null;
   
   String permissions = "[]";
   boolean isForgotPasswordEnabled = false;
   boolean isChangePasswordEnabled = false;
   
   AuthenticationService webAuth = moduleRef.getWebAuthenticationService();
   bearerKey = tenant + "_" + app + "_" + (webAuth == null ? "NA" : webAuth.getTypeId());
   
   int passwordMinLength = 4;
   int previousPasswordReuseRestriction = 0;
   String passwordMustContain = "";
   String usernameLabel = "Username";
   
   try{
	   if (webAuth.containsKey("forgotPasswordAPIName")) {
			String forgotPasswordApi = webAuth.get("forgotPasswordAPIName").toString();
			isForgotPasswordEnabled = (forgotPasswordApi!=null && !forgotPasswordApi.trim().isEmpty()) ? true :false;
	   }
		System.out.println("Auth Service: " + webAuth);
		System.out.println("FP API: " + webAuth.get("forgotPasswordAPIName"));
		
		if (webAuth.containsKey("changePasswordAPIName")) {
	    	String changePasswordAPi = webAuth.get("changePasswordAPIName").toString();
	    	isChangePasswordEnabled = (changePasswordAPi!=null && !changePasswordAPi.trim().isEmpty()) ? true :false;
	    }
		
		System.out.println("isForgotPasswordEnabled: " + isForgotPasswordEnabled);
		System.out.println("isChangePasswordEnabled: " + isChangePasswordEnabled);
		}catch(Exception ex){
			System.out.println("Exception: " + ex);
		}
   
   AuthenticationService authServiceObj = moduleRef.getWebAuthenticationService();
   passwordMinLength = authServiceObj.getInt("minimumPasswordLength", 4);
   passwordMustContain = authServiceObj.getPasswordMustContain();
   previousPasswordReuseRestriction = authServiceObj.getInt("previousPasswordReuseRestriction", 0);
   usernameLabel = authServiceObj.getUseSSOAuthentication() ? "Email" : "Username";
   
   if (isAuthenticationRequired) {
   
   	try {
   		authService = moduleRef.getWebAuthenticationService().toString();
   		
   		System.out.println("Authservice : " + authService);
   		int x = 10;
   		if (request.getCookies() != null) {
   			for (Cookie cookie : request.getCookies()) {
   
   				System.out.println("COOOOOKKKKIIEE: " + cookie.getPath() + " - " + cookie.getName() + " : "
   						+ "(" + bearerKey + ") (Age:" + cookie.getMaxAge() + ") = " + cookie.getValue());
   				if (cookie != null && cookie.getMaxAge() != 0  && cookie.getName().equals(bearerKey)) {
   					String value = cookie.getValue();
   					if (!"NA".equals(value)) {
   						token = cookie.getValue();
   						hasTokenCookie = true;
   						tokenSource = "cookie";
   					}
   				}
   			}
   		}
   		if (token == null || token.trim().isEmpty()) {
   			token = request.getParameter("BearerToken");
   			if (token != null) {
   				afterLogin = true;
   			}
   			tokenSource = "param";
   			
   			authServiceObj = moduleRef.getWebAuthenticationService();
   			if((authServiceObj instanceof SimpleAuthenticationService) &&  
   					(StringUtils.contains(authServiceObj.getCustomTags(), "#auto-login"))) {
   				
   				SimpleAuthenticationService simpleAuthService = (SimpleAuthenticationService)authServiceObj;
   				
   				Map<String, String> authParams = new HashMap<String, String>();
   				authParams.put(AuthenticationService.PARAM_USERNAME, simpleAuthService.getUsername());
   				authParams.put(AuthenticationService.PARAM_PASSWORD, simpleAuthService.getPassword());
   				
   				User userMap = authServiceObj.authenticate(authParams);
   				token = AuthTokenService.getInstance().createToken(tenant, subTenant, app, request.getServerName(), userMap, 8760L);
   			}
   		}
   	
  		
   		if (token != null) {
   
   			TokenInfo tokenInfo = AuthTokenService.getInstance().verifyToken(tenant, subTenant, app, request.getServerName(), 
   					moduleRef.getWebAuthenticationService().getTypeId(), token);
   
   			isAuthenticated = tokenInfo != null;
   			isAuthenticationRequired = !isAuthenticated;
   			
   			if (isAuthenticationRequired) {
   				for (Cookie cookie : request.getCookies()) {
   					cookie.setMaxAge(0);
   				}
   			}
   
   			if (!isAuthenticationRequired && !hasTokenCookie) {
   				Cookie cookie = new AuthTokenCookie(bearerKey, token);
   				String cookiePath = apiURL + appURL;
   				//cookie.setPath(cookiePath);
   				cookie.setMaxAge(//(int)(tokenInfo.getExpires().getMillis()/1000));
   						(int) ((new java.util.Date().getTime() - tokenInfo.getExpires().getMillis())
   								/ 1000));
   				System.out.println("COOOOOKKKKIIEE ##2: " + cookie.getPath() + " - " + cookie.getName() + " : "
   						+ "(" + bearerKey + ") (Age:" + cookie.getMaxAge() + ") = " + cookie.getValue() + ". TOKEN: " + tokenInfo.getExpires().getMillis());
   				response.addCookie(cookie);
   			}
   			//isAuthenticated = (queryString.contains("resetPassword") || queryString.contains("setPassword") ) ? false : true;
   			if (isAuthenticated) {
   				user = tokenInfo.getUser();
				request.getSession().setAttribute("auth", "true");
   			}
   			
   			User usr = appRef.getSession().create(User.class);
   			
   			//com.contineonx.core.Session userSession = appRef.createNewUserSession(usr);
   			//usr.setContext(sessionRef);
   			sessionRef.setUser(usr);
   			
   			usr.putAll(com.contineonx.core.common.AppUtil
   					.getMapfromJson(com.contineonx.core.common.AppUtil.getJsonFromObject(user)));
   			
			tenantName = usr.getTenantIdentifier();
   			if (usr.containsKey("tenantName")) {
   				tenantName = usr.getString("tenantName");
   			}
			
   			caseId = request.getParameter("CaseId");
   			
   			if ("links".equals(module) && caseId != null && !caseId.isEmpty()) {
   				Find getUserPermissions = (Find)sessionRef.getApi("GetCasePermissions");
   				getUserPermissions.getParameters().put("CaseId", caseId);
   				Object permissionsList = getUserPermissions.execute();
   				usr.set("permissions", permissionsList);
   				permissions = com.contineonx.core.common.AppUtil.getJsonFromObject(usr.get("permissions"));
   				System.out.println("Permissions: " + permissions);
   			}
   			else {
	   			if (moduleRef.getWebAuthenticationService().getRolePermissionsLoaderAction() != null) {
					if (!usr.containsKey("roleId") && usr.containsKey(moduleRef.getWebAuthenticationService().getRoleFieldName())) {
						usr.put("roleId", usr.get(moduleRef.getWebAuthenticationService().getRoleFieldName()));				
					}
	   				moduleRef.getWebAuthenticationService().loadUserPermissions(usr);
	   			}
   			}
   			if (usr.containsKey("permissions")) {
   				permissions = com.contineonx.core.common.AppUtil.getJsonFromObject(usr.get("permissions"));
   				//System.out.println("Permissions: " + permissions);
   				permissions = permissions.replace("\"", "'");
   			}
   			
   			if (!moduleRef.getWebAuthenticationService().isFieldNull(AuthenticationService.FIELD_BEFORE_LOGOUT_SCRIPT)) {
   				beforeLogoutScript = moduleRef.getWebAuthenticationService().getBeforeLogoutScript();
   			}
   
   		}
   	} catch (Exception ex) {
   		if (ex.getCause() != null
   				&& java.security.SignatureException.class.isAssignableFrom(ex.getCause().getClass())) {
   			Cookie cookie = new AuthTokenCookie(bearerKey, token);
   			cookie.setMaxAge(0);
   			response.addCookie(cookie);
   		}
   		ex.printStackTrace();
   		Application.getInstance().logError(ex);
   	}
   
   }
   
   
   
   String appId = appRef.getType().getId();
   
   User usr = appRef.getSession().create(User.class);
   //isAuthenticated = (queryString.contains("resetPassword") || queryString.contains("setPassword") ) ? false : true;
   if (isAuthenticated) {
   		usr.putAll(com.contineonx.core.common.AppUtil.getMapfromJson(user.toString()));
   } else if (!isAuthenticationRequired) {
   		isAuthenticated = true;
   		usr.setUsername(appRef.getType().getResourceId());
   }
   
   if (usr.getTenantIdentifier() == null) {
	   usr.setTenantIdentifier(appRef.getType().getResourceId());
   }
   
   boolean requiresMaps = false;
   String mapsAPIAccessKey = null;
   
   java.util.Map licenses = appRef.getThirdPartyLicenseKeys();
   Object licenseKey = licenses.get(com.contineonx.core.app.ui.Map.FIELD_MAP_API_ACCESS_KEY);
   if (!AppUtil.isObjectNullOrEmpty(licenseKey)) {
   	mapsAPIAccessKey = licenseKey.toString();
   	requiresMaps = true;
   }
   
   String layoutTemplate = moduleRef.isFieldNull("layoutTemplate")
   		? "sidefixedmenu"
   		: moduleRef.getLayoutTemplate();
   
   
   if (!layoutTemplate.startsWith("appfiles/")) {
	   layoutTemplate = "appfiles/v-zero/shared/layouts/" + layoutTemplate.toLowerCase();
   }
   
   if (!layoutTemplate.endsWith(".js")) {
	   layoutTemplate = layoutTemplate+ ".js";
   }
   
   
   ///////////////////////// THEME //////////////////////
   if (moduleRef.getDefaultTheme() != null) {
	   themeName = moduleRef.getDefaultTheme().getType().getResourceId(); 
	   configRef.getFilePath(tenant, appId, moduleRef.getDefaultTheme().getTypeId(),
	            "appfiles.v-zero.shared.themes._id.style$css", true);
	   themeName = moduleRef.getDefaultTheme().getTypeId();
	    
   } 
   
   System.out.println("TENANT: " + tenant);
   
   String themeJson = org.apache.commons.io.FileUtils.readFileToString(new java.io.File(
   		AppUtil.getRootPath() + frameworkPath + "/shared/themes/" + themeName + "/theme.json"));
   
   String seedId = usr.getSession().getIdGenerator().getNewId("webapp");
   
   //isAuthenticated = (queryString.contains("resetPassword") || queryString.contains("setPassword") ) ? false : true;
   if(queryString.contains("resetPassword") || queryString.contains("setPassword")){
           isAuthenticationRequired = true;
   }
   
   com.contineonx.ext.aws.S3ContentManagementService s3Service = null;
   try {
	   if (appRef.getContentManagementService() != null) {
		   ContentManagementService cms = appRef.getFileManagementService();
		   if (cms != null && 
				   com.contineonx.ext.aws.S3ContentManagementService.class.isAssignableFrom(cms.getClass())) {
			   s3Service = (com.contineonx.ext.aws.S3ContentManagementService)cms;
		   }
	   }
   }
   catch (Exception ex) {
	   
   }
   
   String sessionId = request.getSession().getId();
   BasicEncryption encr = (BasicEncryption)Application.getInstance().getStaticBean("Encryption");
   sessionId = encr.encrypt(sessionId);
   %>
<!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN" "http://www.w3.org/TR/html4/loose.dtd">
<html>
   <head>
   	  
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
	  
      <title><%=appRef.getType().getDefaultName()%></title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      
      <link href="<%=apiURL%>appfiles/v-zero/shared/themes/<%=themeName%>/quasar.min.css" rel="stylesheet" type="text/css">
      
      <!-- <link href="https://cdn.jsdelivr.net/npm/quasar@1.12.11/dist/quasar.min.css" rel="stylesheet" type="text/css"> -->
      
      
      <link href="<%=apiURL%>common/css/animate.css" rel="stylesheet"
         type="text/css">
       <link href="<%=apiURL%>common/css/chat-6.css" rel="stylesheet" type="text/css">  

      <link
         href='https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900|Material+Icons'
         rel="stylesheet">
         
      <link rel="stylesheet" type="text/css"
         href="<%=apiURL%>appfiles/v-zero/shared/themes/<%=themeName%>/style.css?v=5_20230274"> 

       <link href="<%=apiURL%>common/css/print.css" rel="stylesheet" type="text/css"> 

	   
         
     <%
     	Collection<File> customCssFiles = 
     				FileUtils.listFiles(new File(AppUtil.getRootPath() + frameworkPath + "/shared/themes/" + themeName)
						, new String[]{"css"}, false);
     
     	for(File file : customCssFiles) {
     		String fileName = file.getName();
     		if(fileName.startsWith("custom-")) {
     %>
		     	<link rel="stylesheet" type="text/css"
		         href="<%=apiURL%>appfiles/v-zero/shared/themes/<%=themeName%>/<%=fileName%>?v=5_<%=System.currentTimeMillis()%>">
     <%
     		}
     	}
     %>
      <link rel="icon" type="image/x-icon"
         href="<%=apiURL%>common/images/<%=app%>_favicon.png?v=5_2" sizes="32x32" />
      <link rel="stylesheet" type="text/css"
         href="https://uicdn.toast.com/tui-calendar/latest/tui-calendar.css" />
      <!-- If you use the default popups, use this. -->
      <link rel="stylesheet" type="text/css"
         href="https://uicdn.toast.com/tui.date-picker/latest/tui-date-picker.css" />
      <link rel="stylesheet" type="text/css"
         href="https://uicdn.toast.com/tui.time-picker/latest/tui-time-picker.css" />
         
	<link href="//unpkg.com/vis-charts@latest/dist/vis.min.css" rel="stylesheet" type="text/css">
         
         
      <script src="https://cdn.jsdelivr.net/npm/vuelidate@0.7.4/dist/vuelidate.min.js"></script>
      <link href="<%=apiURL%>common/css/dialog-styles.css" rel="stylesheet"
         type="text/css">
      <link href="<%=apiURL%>common/css/vue-dialog-drag.css" rel="stylesheet"
         type="text/css">
		 
         
      <% if (module != null && (module.endsWith("formdesigner") || module.endsWith("designerstudio"))) { %>
      <%-- <link href="<%=apiURL%>common/css/joint.min.css" rel="stylesheet"
         type="text/css">  
       --%>   
         <link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/jointjs/2.1.0/joint.css" />
         <link rel="stylesheet" href="../../../common/css/dist/themes/default/style.min.css" />
		 <link rel="stylesheet" href="../../../common/codemirror/codemirror.css">
		 <link rel="stylesheet" href="../../../common/codemirror/addon/lint/lint.css">
      <% } %>
      
      <% if (moduleRef.getEnablePWA()) { %>
      <% 	if (moduleRef.getManifestPath() != null && moduleRef.getManifestPath().startsWith("http")) { %>
      	 <link rel="manifest" href="<%=moduleRef.getManifestPath()%>">

      <% 	} else { %>
		 <link rel="manifest" href="/manifest.json">
      <% 	}
      } %>
	<!-- place this in a head section -->
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="default">
	<meta name="apple-mobile-web-app-title" content="Quick Tracking Information System">
	<link rel="apple-touch-icon" href="https://dev.zinatt.com/pwa-resources/common/images/icon-96.png">
	<link rel="apple-touch-icon" sizes="144x144" href="https://dev.zinatt.com/pwa-resources/common/images/icon-144.png">
	<link rel="apple-touch-icon" sizes="192x192" href="https://dev.zinatt.com/pwa-resources/common/images/icon-192.png">
	<link rel="apple-touch-icon" sizes="168x168" href="https://dev.zinatt.com/pwa-resources/common/images/icon-168.png">

	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-750x1294.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-1242x2148.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-1536x2048.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-1668x2224.png" media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-2048x2732.png" media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: portrait)">

	<%-- <link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-1136x640.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-1294x750.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-2148x1242.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-2436x1125.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-2048x1536.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-2224x1668.png" media="(min-device-width: 834px) and (max-device-width: 834px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)">
	<link rel="apple-touch-startup-image" href="https://dev.zinatt.com/pwa-resources/common/images/launch-2732x2048.png" media="(min-device-width: 1024px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2) and (orientation: landscape)"> --%>
  
<%
	if (s3Service != null) {
%>
    <link href="../../../common/fineuploder/fine-uploader-gallery.min.css" rel="stylesheet">
<%
	}
%>
           <link rel="stylesheet" type="text/css"
         href="<%=apiURL%>appfiles/v-zero/shared/themes/<%=themeName%>/style.css?v=5_20230224"> 
		 <link href="<%=apiURL%>appfiles/v-zero/shared/themes/qtistheme/chat-style.css" rel="stylesheet" type="text/css">
      
	 <meta name="google-signin-client_id" content="227319226836-c7i1h5heau4jut95q43nov5dbgfb3gud.apps.googleusercontent.com">
   </head>
   <body>
   
   		<!-- event: invokeTest args: { type: "list/form", widgetId: "", widgetURL:"" } -->
   	   <div id="at_event" ></div>
   	  
   	  

      <div id="app" v-cloak>
         <%
            if (!isAuthenticationRequired) {
            	try {
            %>
            
           
           
         <cnx-page v-if="viewRoot.pageLoaded" v-bind:uiprops="viewRoot.uiprops"
            v-bind:model="viewRoot.model" :key="viewRoot.key"></cnx-page>
            
         <cnx-quickadd-options></cnx-quickadd-options>
         <cnx-export></cnx-export>
         
         
         
         <cnx-data-purge></cnx-data-purge>
         
         <cnx-import-dialog></cnx-import-dialog>
         
         <form id="userLogout" action="<%=apiURL%><%=pageURL%>" method="post"></form>
         <!--  change password popup start -->
         <!--   <q-dialog v-model="small"> -->
         <q-dialog v-model="passwordChangeActionStatus" persistent
            transition-show="scale" transition-hide="scale">
            <q-card
               class="bg-teal text-white" style="width: 300px">
               <q-card-section
                  class="q-pt-none"> {{passwordChangeActionMsg}} </q-card-section>
               <q-card-actions
                  align="center" class="bg-white text-teal">
                  <q-btn
                     flat label="OK" v-close-popup></q-btn>
               </q-card-actions>
            </q-card>
         </q-dialog>
         <!--  popup end -->
         <!-- Change password dialog -->
         <q-dialog
            v-model="showChangePasswordDialog" persistent>
            <q-card>
               <q-card-section style="width:450px; margin-top:5px;" class="row col-xs-12 ">
                  <q-input required :label="getLabel('CurrentPassword')" v-model="currentpassword" class="col-xs-12  q-my-sm "
                     type="password" ref="fldPasswordChangeConfirm"
                     v-bind:rules="[ val => val && val.length > 0 || 'Field is blank']">
                  </q-input>
                  
                  <div class="row col-12 text-body text-black q-pa-sm q-mt-sm justify-left ">
                     		<div class="col justify-left" style="text-align: left !important;" v-html="getPasswordValidationMessage()"></div></div>
                     		
                  <q-input class="q-my-xs  col-xs-12  "
                     required :label="getLabel('NewPassword')" type="password"
                     v-model="newpasswordchange"
                     v-bind:rules="[ val => validatePassword(val) || 'Password is too weak']">
                  </q-input>
                  <q-input class="q-my-xs col-xs-12  "
                     required :label="getLabel('ConfirmPassword')" type="password"
                     v-model="newpasswordchangeconfirm"
                     v-bind:rules="[ val => val == newpasswordchange && val.length > 0 || 'Passwords do not match']">
                  </q-input>
               </q-card-section>
               <q-card-section style="width:450px;">
                  <q-btn
					 class="full-width" color="blue" @click="changeUserPassword()" 
					 :disable="!validatePassword(newpasswordchange) || newpasswordchangeconfirm != newpasswordchange || newpasswordchange.length == 0"
                     style="margin-top: 21px;"> {{getLabel('changepassword')}} </q-btn>
               </q-card-section>
               <q-card-actions
                  align="right">
                  <q-btn flat :label="getLabel('Close')"
                     color="primary" v-close-popup />
               </q-card-actions>
            </q-card>
         </q-dialog>
         <!-- change password dialog end -->
         <%
            } catch (Exception ex) {
            %>
         <h1>Oops! Something went wrong...</h1>
         <%
            }
            
            } else if (isAuthenticationRequired) {
            %>
         <!-------------------------------------------------------------------->
         <!-------------------  LOGIN - START  ------------------>
         <!-------------------------------------------------------------------->
         <%@include file="../../../appfiles/v-zero/login.jsp"%>
         <!-------------------------------------------------------------------->
         <!-------------------  LOGIN - END  ------------------>
         <!-------------------------------------------------------------------->
         <%
            }
            %>
	<q-dialog v-model="dialog.show" :persistent="dialog.showCancel">
            <q-card class="bg-blue text-white" dark style="min-width:300px;">
               <q-card-section
                  class="row items-center dialog">
                  <q-avatar
                     :icon="dialog.icon" color="blue-7" text-color="white"></q-avatar>
                  <div class="text-h6 q-pl-md">{{ dialog.title }}</div>
               </q-card-section>
               <q-card-section class="row items-center bg-white text-black" style="min-height:100px;">
                  <div class=" q-pl-md text-subtitle2">{{ dialog.message }}</div>
               </q-card-section>
               <q-separator dark></q-separator>
               <q-card-actions align="right" class="bg-white">
                  <q-btn color="blue" outlined unelevated v-if="dialog.showCancel" flat
                     v-on:click="processDialog(false)">{{ dialog.cancelButtonText
                     }} 
                  </q-btn>
                  <q-btn color="blue" unelevated v-on:click="processDialog(true)">{{
                     dialog.okButtonText }} 
                  </q-btn>
               </q-card-actions>
            </q-card>
         </q-dialog>
		          <q-dialog
            v-model="HelpDialog" persistent content-class="faq-popup">
            <q-card>
				<q-card-section class="row col-xs-12 ">	
					<q-toolbar-title
                     class="text-blue text-subtitle text-weight-thin'" floating
                     font-weight-thin class="q-toolbar__title ellipsis mr-5 align-center text-blue text-subtitle text-weight-thin text-blue text-subtitle text-weight-thin">Quick Help
                  </q-toolbar-title>               
				  <q-btn icon="close" size="md" flat v-close-popup></q-btn>
				</q-card-section>
               <q-card-section class="faq-content row col-xs-12 ">
                  <q-list>
					    <div class="faq-section">
                     <div class="support-wrapper">
                        <div class="techsupport-btn text-center">
                           <q-btn unelevated rounded class="tech-support bg-purple-13" text-color="white" @click="openChatLink()" label="Tech Support Chat"></q-btn>
                        </div>
                        <div class="tech-note">
                           <p class="text-center">Business Hours:  Monday - Friday | 8am - 5pm (Arizona Time)</p>
                           <p class="text-center">NOTE: If you message us outside of normal business hours we will be in contact as soon as one of our team members becomes available.</p>
                        </div>
                     </div>
                      <div class="faq-enclose">
                         <h2>I am having a difficult time logging in with my credentials.</h2>
                         <p>You can reset your password by selecting RESET PASSWORD. You will need to enter your email address to receive a link where you will be asked to reset your password.</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>I received a message my account was locked out.</h2>
                         <p>If you locked yourself out contact your Administrator and they can enable your account again.</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>Did not receive email to reset password.</h2>
                         <p>Be sure to check your spam and give it a few minutes as some email servers are slower than others.</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>The wheel is spinning but not loading my screen.</h2>
                         <p>Refresh your page this can help reload your content (Ctrl + F5).</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>I’m trying to sign in, but I receive the code to an old phone number I no longer have.</h2>
                         <p>You will need to contact your system administrator and they can update your user profile.</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>What is an OTP code?</h2>
                         <p>OTP is a One Time Passcode sent to you to verify your identity. All Qtis accounts are protected by this MFA security feature. You will be required to confirm your identity by entering a code sent to your registered mobile or email.</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>I get an Error message when I try to log in.</h2>
                         <p>Contact your system administrator.</p>
                      </div>
                      <div class="faq-enclose">
                         <h2>Recommended Browser.</h2>
                         <p>Google Chrome is highly recommended for the use of Qtis.</p>
                      </div>
                   </div>
				  </q-list>
               </q-card-section>
               <q-card-actions
                  align="right">
                  <q-btn flat :label="getLabel('Close')"
                     color="primary" v-close-popup />
               </q-card-actions>
            </q-card>
         </q-dialog>
      </div>
      <script src="<%=apiURL%>common/jquery-3.5.1.min.js"></script>
      <script src="<%=apiURL%>common/js/moment.min.js"></script>
	  <script src="<%=apiURL%>common/js/moment-timezone-with-data.min.js"></script>
      <script src="<%=apiURL%>common/js/encoding.min.js"></script>
      <script src="<%=apiURL%>common/js/htmldiff.min.js"></script>
      <script src="<%=apiURL%>common/js/utils.js?v=5_20230616"></script>
      <script src="<%=apiURL%>common/vue/js/vue-2.6.js"></script>
      <script src="<%=apiURL%>common/vue/js/contineo.js?v=5_20221231"></script>
      <script src="<%=apiURL%>common/vue/js/contineoEntity.js"></script>
      <script src="<%=apiURL%>common/vue/js/v-zero.js?v=5_20200712"></script>
      <script src="<%=apiURL%>common/vue/js/v-zero-5.js?v=5_20220828"></script>
      <script src="<%=apiURL%>common/jsencrypt.min.js"></script>
	  <script src="<%=apiURL%>common/js/html2pdf.bundle.min.js"></script>
	  
	  <script src="<%=apiURL%>common/js/FileSaver.min.js"></script>
	  <script src="<%=apiURL%>common/js/jszip.mn.js"></script>
	  <script src="<%=apiURL%>common/js/filesaver.min.js"></script>
	 <script src="<%=apiURL%>common/js/html-docx.js"></script>
      
<%
	if (s3Service != null) {
%>
        <script src="../../../common/fineuploder/s3.fine-uploader.min-1.js?v=5_20220908"></script>	
	<%@include file="../../../appfiles/v-zero/shared/components/s3uploader.html"%>
	<script src="../../../appfiles/v-zero/shared/components/s3uploader-4.js?v=5_20230346"></script>
<%
	}
%>
      <%
         if (requiresMaps) {
      %>
      <script type="text/javascript"
         src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js"></script>
      <script type="text/javascript"
         src="https://maps.googleapis.com/maps/api/js?key=<%=mapsAPIAccessKey%>&amp;libraries=visualization,places"></script>
      <script>
      		utils.getMapsAPIAccessKey = function() { return "<%=mapsAPIAccessKey%>"; }
      </script>
      <%
         }
      %>      
      
      <script src="<%=apiURL%>common/vue/js/vue-bar.js"></script>
      <script src="<%=apiURL%>common/js/vue-click-outside.js?v=20210826"></script>
	  <script src="<%=apiURL%>common/js/detect-browser.js"></script>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.3.0/socket.io.js"></script>
     
     <script
         src="https://unpkg.com/vis-charts@3.0.0/dist/vis.min.js"></script>
         
	 <script src="<%=apiURL%>common/client.min.js"></script>
 
         
      <script src="https://cdn.jsdelivr.net/npm/quasar@^1.1.7/dist/quasar.ie.polyfills.umd.min.js"></script>
      <script src="<%=apiURL%>common/js/quasar.umd.min.js"></script>
      
     <!--  <script src="https://cdn.jsdelivr.net/npm/quasar@1.12.11/dist/quasar.umd.min.js"></script>
      <script src="https://cdn.jsdelivr.net/npm/quasar@^1.12.11/dist/quasar.ie.polyfills.umd.min.js-NA"></script> -->
      
      <script src="<%=apiURL%>common/js/config.js"></script>
      <script src="<%=apiURL%>common/js/vue-dialog-drag.umd.js"></script>
      <script src="<%=apiURL%>common/js/vue-drop-area.umd.min.js"></script>
      <script src="https://unpkg.com/vuebar"></script>

      <script src="https://code.highcharts.com/highcharts.js"></script>
      <script src="https://code.highcharts.com/highcharts-more.js"></script>
      <script src="https://code.highcharts.com/modules/heatmap.js"></script>
      <script src="https://code.highcharts.com/modules/exporting.js"></script>
	  <script src="https://code.highcharts.com/modules/export-data.js"></script>
	  <script src="https://code.highcharts.com/modules/accessibility.js"></script>

      <!-- <script src="https://cdn.jsdelivr.net/npm/quasar@^1.5.1/dist/quasar.umd.min.js"></script> -->
      <%
         if (!"qtis".equals(app)) {
         %>

      <script src="<%=apiURL%>common/js/speech.js"></script>
      <script src="<%=apiURL%>common/js/QRScanner.js"></script>
      <script src="<%=apiURL%>common/js/instascan.min.js"></script>
      <%
         }
         %>

	<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/0.4.1/html2canvas.min.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.js"></script>


     <script
         src="../../../appfiles/v-zero/shared/labels.js?v=5_20241219"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/base.js?v=5_20250521"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/fields-22-44.js?v=5_20230784"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/dropdowns.js?v=5_20200949"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/purgeOptions.js?v=5_20200929"></script>
         
<script
         src="../../../appfiles/v-zero/shared/components/buttons.js?v=5_20200712"></script>
         
	  <script
         src="../../../appfiles/v-zero/shared/components/entityform.js?v=5_20200712"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/table-49.js?v=5_20250358"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/widget-6.js?v=5_20250611"></script>
      <script
         src="../../../appfiles/v-zero/shared/components/pagelayout-8.21.22.js?v=5_205344778"></script>

 	  <script
         src="../../../appfiles/v-zero/shared/components/timeline.js?v=5_20200632"></script>
        
         
      <%@include
         file="../../../appfiles/v-zero/shared/components/search.html"%>
         
      <script
         src="../../../appfiles/v-zero/shared/components/importExport.js?v=5_20200714"></script>
     
      <script
         src="../../../appfiles/v-zero/shared/components/menuRoleAccess-9.js?v=5_20241218"></script>
      <script
         src="https://uicdn.toast.com/tui.code-snippet/latest/tui-code-snippet.js"></script>
      <script src="https://uicdn.toast.com/tui.dom/v3.0.0/tui-dom.js"></script>
      <script
         src="https://uicdn.toast.com/tui.time-picker/latest/tui-time-picker.min.js"></script>
      <script
         src="https://uicdn.toast.com/tui.date-picker/latest/tui-date-picker.min.js"></script>
      <script
         src="https://uicdn.toast.com/tui-calendar/latest/tui-calendar.js"></script>
      <script
         src="../../../appfiles/v-zero/shared/components/calendar-6.js?v=5_20250514"></script>
      <script src="../../../appfiles/v-zero/shared/components/fileupload-3.js?v=5_20221030"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.19.2/axios.min.js"></script>
	<script src="../../../appfiles/v-zero/shared/components/chat-5.js?v=5_20220822"></script>
       
      <script src="../../../appfiles/v-zero/shared/components/map.js?v=5_20200623"></script>
            <script src="../../../appfiles/v-zero/shared/components/chart.js?v=5_20200922"></script> 
      
      <% 
         if (!"qtis".equals(app)) {
         %>
      

      <script src="../../../appfiles/v-zero/shared/components/multimedia.js?v=5_20200508"></script>      

      <% 
         } 
         if (module != null && (module.endsWith("formdesigner") || module.endsWith("designerstudio"))) {
         %>
 
          
       <script
         src="../../../appfiles/v-zero/shared/components/designer/designer.js?v=5_20200712"></script>
           
       <script src="../../../appfiles/v-zero/shared/components/designer/propertyEditor.js?v=5_20200712"></script>
       <script src="../../../appfiles/v-zero/shared/components/designer/propSelector.js?v=5_20200712"></script>
         
      <% if (module != null && module.endsWith("formdesigner")) { %>
      <%@include
         file="../../../appfiles/v-zero/shared/components/designer/formexplorer.html"%>
         
       <% } else if (module != null && module.endsWith("designerstudio")) { %> 
       
       <script
         src="../../../appfiles/v-zero/shared/components/designer/menudesigner.js?v=5_20200712"></script>
         
       <script 
         src="../../../appfiles/v-zero/shared/components/designer/uidesigner.js?v=5_20200712"></script>
         
         <script 
         src="../../../appfiles/v-zero/shared/components/designer/packagemanager.js?v=5_20210407"></script>
       
       <script 
         src="../../../appfiles/v-zero/shared/components/designer/debugLogViewer.js?v=5_2020050803"></script>
             
       <script
         src="../../../appfiles/v-zero/shared/components/designer/appservices.js?v=5_2020050903"></script>
       <script
         src="../../../appfiles/v-zero/shared/components/designer/appoverrides.js?v=5_2020050903"></script>
         
       <script src="../../../appfiles/v-zero/shared/components/designer/itemLinks.js?v=5_2020050903"></script>
       <script src="../../../appfiles/v-zero/shared/components/designer/appaccess.js?v=5_2020050903"></script>
          
    <!--    <script src="../../../common/js/lodash.min.js"></script>
       <script src="../../../common/js/backbone-min.js"></script>
       <script src="../../../common/js/joint.min.js"></script>
     -->   
       <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/lodash.js/3.10.1/lodash.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/backbone.js/1.3.3/backbone.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jointjs/2.1.0/joint.js"></script>
     
     <script src="../../../appfiles/v-zero/shared/components/designer/versions.js?v=5_2020050602"></script>
     
       <script src="../../../appfiles/v-zero/shared/components/designer/jointjs_paper.js?v=5_20200505"></script>
       <script src="../../../appfiles/v-zero/shared/components/designer/jointjs_designer.js?v=5_20200505"></script>
       <script src="../../../appfiles/v-zero/shared/components/designer/processflow.js?v=5_20200712"></script>
        <script src="../../../appfiles/v-zero/shared/components/designer/datamapper.js?v=5_2020050502"></script>
        <script src="../../../appfiles/v-zero/shared/components/designer/mapper.js?v=5_2020050602"></script>
        <script src="../../../appfiles/v-zero/shared/components/designer/datamapper_designer.js?v=5_20200510"></script>
        <script src="../../../common/js/jstree.min.js"></script>
	    <script src="../../../common/js/jstree.js"></script>
	    <script src="../../../appfiles/v-zero/shared/components/designer/js_api.js?v=5_20200712"></script>

<script src="../../../common/codemirror/codemirror.js"></script>
<script src="../../../common/codemirror/addon/edit/matchbrackets.js"></script>
<script src="../../../common/codemirror/addon/comment/continuecomment.js"></script>
<script src="../../../common/codemirror/addon/comment/comment.js"></script>
<script src="https://unpkg.com/jshint@2.9.6/dist/jshint.js"></script>
<script src="https://unpkg.com/jsonlint@1.6.3/web/jsonlint.js"></script>
<script src="../../../common/codemirror/addon/lint/lint.js"></script>
<script src="../../../common/codemirror/addon/lint/javascript-lint.js"></script>
<script src="../../../common/codemirror/addon/lint/json-lint.js"></script>
<script src="../../../common/codemirror/mode/javascript/javascript.js"></script>	    
<script src="../../../common/codemirror/mode/sql/sql.js"></script>
<script src="https://unpkg.com/esprima@~4.0/dist/esprima.js"></script>
         
        <script
         src="../../../appfiles/v-zero/shared/components/designer/explorer.js?v=5_20200712"></script>
         
       <% }  %>
       
       <script
         src="../../../appfiles/v-zero/shared/components/designer/schemaEditor.js?v=5_20211203"></script>
       
      <script
         src="../../../appfiles/v-zero/shared/components/designer/entityUI.js?v=5_20200506"></script>
         
      <script
         src="../../../appfiles/v-zero/shared/components/designer/entityAPI.js?v=5_20200712"></script>
            
      <script
         src="../../../appfiles/v-zero/shared/components/designer/links.js?v=5_20200502"></script>

      <%
         } else {
         %>
      <script src="../../../appfiles/v-zero/shared/components/rssfeed.js?v=5_2020042902"></script>
      <%
         }
         %>
      <%
         java.io.File customComponentsDir = new java.io.File(
         		AppUtil.getRootPath() + "appfiles/v-zero/custom/" + tenant + "/components");
         if (customComponentsDir.exists()) {
         	for (java.io.File customFile : customComponentsDir.listFiles()) { 
         		if (customFile.getName().endsWith(".js")) {
         			String jsFile = "../../../appfiles/v-zero/custom/" + tenant + "/components/" + customFile.getName()
         				+ "?v=5_" + customFile.lastModified();
             		%>
             	      <script src="<%=jsFile%>"></script>
             	    <%         			
         		}
         		else {
         			String fileContents = FileUtils.readFileToString(customFile);
         		%>
      <%=fileContents%>
		      	<%
		         }
		    }
         } else {
         %>
      <!-- No CUSTOM COMPONENTS: <%=customComponentsDir.getPath()%> -->
      <%
         }
         %>
       <script>
	     var serverName = "<%=request.getServerName()%>";
    	 var fingerprint = customizationFunctions.getFingerprint("<%=seedId%>");
      	 console.log("Fingerprint: " + fingerprint);
         var userIPAddress = "<%=request.getRemoteAddr()%>";
         var tenantName = "<%=tenant%>";
         var subTenantName = "<%=subTenant%>";
         var appName = "<%=app%>";
         var moduleName = "<%=module%>";
         var appId = "<%=appId%>";
         bearerKey = "<%=bearerKey%>";
         var viewId = "<%=viewId%>";
         var baseURL = "<%=apiURL%>";
         var apiURL = "<%=apiURL%>";
         var isForgotPasswordEnabled = "<%=isForgotPasswordEnabled%>";
         var isChangePasswordEnabled = "<%=isChangePasswordEnabled%>";
         isForgotPasswordEnabled = (isForgotPasswordEnabled == "true") ? true : false;
         isChangePasswordEnabled = (isChangePasswordEnabled == "true") ? true : false;
         var sessionId = "<%=sessionId%>";
         var caseId = "<%=caseId%>";
         
	 	var publicKey = "<%=AppSettings.getInstance().getPublicKey()%>";
         
     <%
     	if (s3Service != null) {
     %>
     	  var s3BucketUrl = "<%=s3Service.getDefaultBucketURL()%>";
     	  var s3AccessKey = "<%=s3Service.getAccessKey()%>";
     	  var s3ServiceId = "<%=s3Service.getType().getId()%>";
     	  var s3Bucket = "<%=s3Service.getContentBucket()%>"
     <%
     	} else {
     %>
     	  var s3BucketUrl;var s3AccessKey;var s3ServiceId;var s3Bucket;
     <%
     	} 
     %>         
         
         var nextControlToFocus;
         var nextControlToFocusId;
           
         var user = { email: "<%=usr.get(authServiceObj.getEmailFieldName())%>", id: "<%=usr.getId()%>", username: "<%=usr.getUsername()%>", tenantId: "<%=usr.getTenantIdentifier()%>", role: "<%=usr.getRole()%>",  
         		permissions: <%=permissions%>, tenantName: "<%=tenantName%>", userDetails: <%=usr.getMap("userDetails")%> };
         
         loadIdentity();
         loadPermissions();
          
        
         
         Vue.use(Vuebar);
         /*Vue.use(window.vuelidate.default)
         const { required, minLength } = window.validators*/
         var app = new Vue({
           el: '#app',
           data: () => ({ 
        	  pageKey: 0,
         	  currentLocale: "<%=locale%>",
         	  seqNum: 0,
         	  seedId: "<%=seedId%>",
         	  loginData: true,
         	  cancelEnabled:true,
         	  currentpassword:null,
         	  showChangePasswordDialog:false,
         	  newpasswordchange:null,
         	  newpasswordchangeconfirm:null,
         	  passwordChangeActionStatus:false,
         	  passwordChangeActionMsg:"An error occured while performing action", //getLabel('PasswordChangeErrorMsg')
         	  resetData:false,
         	  backButton:false,
			  HelpDialog: false,
         	  isSendRecoveryButtonEnabled:false,
         	  //forgotPassword:true,
         	  forgotPassword:isForgotPasswordEnabled,
         	  passwordValidationMessage:"",
         	  isResetPasswordDiff:false,
         	  hideEmail:false,
         	  userStage:'signin',
         	  //changePasswordState:false,
         	  changePasswordState:isChangePasswordEnabled,
         	  forgotUrl:null,
         	  resetUrl:null, 
         	  passwordValidations: {
         		 passwordMinLength: <%=passwordMinLength%>,
         		 passwordMustContain: "<%=passwordMustContain%>"
         	  },
         	  forgotPasswordLink:false,
         	  showServerError:true,
			  isPwd: true,
			  isPwd1: true,
         	  options: {},
         	  viewRoot: { 
         		  pageLoaded: false,
         		  key: "blank",
         		  model: { globalTags: {} },
         		  uiprops: { ABCD: "" }
         	  },
         	  globalComponents: {},
         	  user: null,
         	  labels: {},
         	  module: {},
         	  views: { page: '' },
         	  theme: <%=themeJson%>,
         	  eventListeners: {},
         	  methods:{
         		 getLabel(label) {
            		  try {  return labels[label] ? labels[label].get(this.currentLocale) : label;  }  catch (e) { return "ERROR: " + label; }
            	  }
				  
         	  },
         	  viewOptions: {
         		  selectedTheme: {},
         		  themes: [ 
         			  {
         				  label: "Dark", value:"dark",
         				  pageClass: "bg-grey-9 text-white",
         				  pageBarClass: "bg-trans-dark-3 text-white",
         				  cellClass: "bg-grey-9 text-white",
         				  fieldColor: "info"
         			  },
         			  {
         				  label: "Light", value:"light",
         				  pageClass: "bg-white text-grey-10",
         				  pageBarClass: "bg-trans-dark-3 text-grey-10",
         				  cellClass: "bg-white text-grey-10",
         				  fieldColor: "primary"
         			  }
         		  ]
         	  },
         	  
         <%if (isAuthenticationRequired) {%>
         	  error: "",
         	  username: "",
         	  opened: false,
         	  apps: null,
         	  password: "",
         	  OTP: "",
         	  OTPRetryCount: 0,
         	  expiryTime: null,
         	  timeLeft: "",
         	  sendOTPTo: "",
         	  authEndpoint: "",
         	  oldpassword:"",
         	  newpasswordchange:"",
         	  newpasswordchangeconfirm:"",
         	  email:"",
         	  newpassword:"",
         	  tempToken: "",
         	  retryToken: "",
         	  loginStatus: "LOGIN",
         	  isEmailValid:false,
         	  passwordChangeState:false,
         	  confirmpassword:"",
         	  errorText: "Invalid username or password",  //getLabel('ErrorTextMessage')
         	  inprogress: false,
           	  blockUI: false,
           	  error: false,
           	  valid: true,
           	  iscurrentLocalJa:false,
         <%}%>
         	  visibility: {
         		  
         	  },
         	  dialog : { 
         	    	  show: false, 
         	    	  message: "", 
         	    	  icon: "info", 
         	    	  showCancel: false, 
         	    	  okButtonText: "OK",
         	    	  cancelButtonText: "Cancel",
         	    	  onOk: function() {}
         	      }
           }),
           computed: {
         	  componentsList: function() {
         		  return this.$options.components;
         	  }  
           },
          methods: {
        	  validatePassword(val) {
        		  if (!val || this.passwordValidations.passwordMinLength > val.length) return false;
        		  if (this.passwordValidations.passwordMustContain.indexOf("LC") > -1 && !(/[a-z]/.test(val))) return false;
        		  if (this.passwordValidations.passwordMustContain.indexOf("UC") > -1 && !(/[A-Z]/.test(val))) return false;
        		  if (this.passwordValidations.passwordMustContain.indexOf("NUM") > -1 && !(/[0-9]/.test(val))) return false;
        		  if (this.passwordValidations.passwordMustContain.indexOf("SC") > -1 && !(/[ `!@#$%^&*()_+\-=\[\]{};:\\|,.<>\/?~]/.test(val))) return false;
        		  return true;
        	  },
        	  getPasswordValidationMessage() {
        		  
        		  var msg = "<ul><li>Password must be atleast " + this.passwordValidations.passwordMinLength + " characters </li><li>";
        		  var previousPasswordReuseRestriction = <%=previousPasswordReuseRestriction%>;

        		  var additoinalRules = "";
        		  if (this.passwordValidations.passwordMustContain.indexOf("LC") > -1) additoinalRules = (additoinalRules ? " " : " Have atleast one ") + "lowercase";
        		  if (this.passwordValidations.passwordMustContain.indexOf("UC") > -1) additoinalRules = additoinalRules + (additoinalRules ? ", " : " Have atleast one ") + "uppercase";
        		  if (this.passwordValidations.passwordMustContain.indexOf("NUM") > -1) additoinalRules = additoinalRules + (additoinalRules ? ", " : " Have atleast one ") + "numeric";
        		  if (this.passwordValidations.passwordMustContain.indexOf("NUM") > -1) additoinalRules = additoinalRules + (additoinalRules ? ", " : " Have atleast one ") + "special";
        		  msg = msg + (additoinalRules ? (additoinalRules + " character") : "") + "</li>";
        		  if (previousPasswordReuseRestriction > 0) {
        			  msg = msg + '<li>Last <%=webAuth.getInt("previousPasswordReuseRestriction", 0)%> passwords cannot be reused</li>';
        		  }
        		  msg = msg + "</ul>";
        		  return msg;
        	  
    	      },
        	  getData() {
        		 return this.viewRoot.model;  
        	  },
         	  registerGlobalComponent(name, component) {
         		 this.globalComponents[name] = component;  
         	  },
         	  getGlobalComponent(name) {
         		 return this.globalComponents[name]; 
         	  },
         	  handleServerError(status) {
         		   var message = "Server error";
         		   var onOkFunction = function() {};
         		   if (status == 403) {
         			   message = "Session Expired!";
         			   onOkFunction = function() { app.logout(); };
         		   }
         		   else if (status == 0) {
         			   message = "Server failed to respond";
         		   }
         		   
         		   if(this.showServerError && status != 403) {
	         		   this.showDialog({ 
	          		    	  show: true, 
	          		    	  message: message, 
	          		    	  icon: "warning", 
	          		    	  showCancel: false, 
	          		    	  okButtonText: "OK",
	          		    	  onOk: onOkFunction
	          		   });
         		   }
         	  },
         	  registerEventListener(event, listener) {
         		  var listeners = this.eventListeners[event];
         		  if (!listeners) {
         			  listeners = [];
         			  this.eventListeners[event] = listeners;
         		  }
         		  listeners.push(listener);
         	  },
         	  removeEventListener(event, listener) {
         		  var listeners = this.eventListeners[event];
         		  if (listeners) {
         			  var l = 0;
         			  for (l = 0; l < listeners.length; l++) {
         				 if (listeners[l] == listener) {
         					 listeners.splice(l, 1);
         					 l--;
         				 }
         			  }
         		  }
         	  }, 
         	  createWidgetControl(widgetId) {
         		  return {
                     		_instance: new Date().getTime(), resourceId: widgetId, 
                   		styleClasses:"col-md-12 row", controlName: "cnx-widget", loaded: false, 
                   		widgetId: widgetId, label: { 'default' : ""}
                   	 };
         	  },
         	  emitEvent(event, eventData) {
         		  var listeners = this.eventListeners[event];
         		  var result = false;
         		  if (listeners) {
         			  var l = 0;
         			  for (l = 0; l < listeners.length; l++) {
         				 if (listeners[l].notifyEvent) {
         					result = listeners[l].notifyEvent(event, eventData) || result;
         				 }
         				 else if (listeners[l].handleEvent) {
         					result = listeners[l].handleEvent(event, eventData) || result;
         				 }
         			  }
         		  }
         		  return result;
         	  },
         	  getUniqueId() {
         		 return this.seedId + "p" + this.getAutoincrementNumber();  
         	  },
         	  getAutoincrementNumber() {
         		  var num = this.seqNum++;
         		  return num;
         	  },
         	  getLabel(label) {
         		  try {  return labels[label] ? labels[label].get(this.currentLocale) : label;  }  catch (e) { return "ERROR: " + label; }
         	  },
         	  getLabelFromState(){
         		  return this.getLabel(this.userStage);
         	  },
         	  getLoginState(type){
         		  if(type == 'resetData'){
         			  return this.resetData;
         		  }
         		  if(type == 'forgotPassword'){
         			  return this.forgotPassword;
         		  }
         		 
         	  },
         	   changeUserPassword(){
         		 var currentURL = window.location.href;
         		  let redirectUrl =  currentURL.toString().split('#')[0];
         		  console.log("change user password called");
         		  let username = user.username;
         		  //let username = "qtistenant1";
         		  let curretPassword = this.currentpassword;
         		  let newPassword = this.newpasswordchange;
         		 
         
         		  if(curretPassword == null || newPassword ==null || username == null ) {

					var title = "Please enter Current Password"
					var message = "Please enter Current Password"
					var onOkFunction = function(){ return; }
					
					app.showDialog({ 
	          		    	  show: true, 
							  title: title,
	          		    	  message: message, 
	          		    	  icon: "warning", 
	          		    	  showCancel: false, 
	          		    	  okButtonText: "OK",
	          		    	  onOk: onOkFunction
	          		   });
					return;
				  }
         		  $.ajax({
         				url : apiURL + 'ResetCred',
         				type: 'POST',
         				contentType: "application/json",
         				data: JSON.stringify({
         					sessionuser: username,
         					currentpassword:curretPassword,
         					validpassword:false,
         					newpassword:newPassword,
         					actionType: 'ChangePasswordAction',
         					subTenant: subTenantName,
         					tenant: '<%=tenant%>',
         					app: '<%=app%>',
         					module: '<%=module%>' })
         				,
         				success : function(data) {
         					
         					var response = eval("(" + data + ")");
         					
         					if (response.result == 'OK' || response.result == 'ok') {
         						/*app.passwordChangeActionStatus = true;
         						app.passwordChangeActionMsg = "Password changed successfully redirecting back to home";
         						window.location.href = redirectUrl;*/
         						console.log("LOG");
         						let appRef = app;
         						app.showDialog({
         			   				  show: true, 
         			   				  title:appRef.getLabel('PasswordChange'),
         			   			   	  message: appRef.getLabel('PasswordChangeSuccestMessage'),
         			   			   	  icon: "priority_high", 
         			   			   	  //showCancel: true,
         			   			   	  cancelButtonText:  appRef.getLabel('cancel'),
         			   			   	  okButtonText: appRef.getLabel('ok'),
         			   			   	  
         			   			   	  //onOk: function() { this.ev.handleDelete(); }
         			   				});
         						app.showChangePasswordDialog = false;
         						console.log("reset resopnse:", response);
         					}else{
         						let appRef = app;
         						app.showDialog({
         	   				  show: true, 
         	   				  title: appRef.getLabel('error'),
         	   			   	  message: <%=previousPasswordReuseRestriction%> == 0 ? appRef.getLabel('PasswordChangeError') : appRef.getLabel('PasswordChangeErrorOldCheck'),
         	   			   	  icon: "priority_high", 
         	   			   	  //showCancel: true,
         	   			   	  cancelButtonText: appRef.getLabel('cancel'),
         	   			   	  okButtonText:appRef.getLabel('ok')
         	   			   	  
         	   			   	  //onOk: function() { this.ev.handleDelete(); }
         	   				});
         					}
         					
         				},
         				error : function(data, status, errorThrown) {
         					//endLogin(true, "Service error: " + status);
         				}
         			});
         		 
         		  
         	  },
         	  getLocalizedLabel(labelJson) {
         		  return labelJson[this.currentLocale] ? labelJson[this.currentLocale] : labelJson['default']; 	  
         	  },
         	  setJaLocal(){
         		 var userLang = navigator.language || navigator.userLanguage; 
         		  if( userLang == "ja"){this.iscurrentLocalJa = true;}
         	  },
         	  showDialog(dialog) {
         		  this.dialog = dialog;
         	  },
         	  processDialog(proceed) {
         		  this.dialog.show = false;
         		  
         		  if (proceed && this.dialog.onOk) {
         		  	this.dialog.onOk();
         		  };
         		  
         		  if (!proceed && this.dialog.onCancel) {
          		  	this.dialog.onCancel();
         		  }
         	  },
         <%if (!isAuthenticationRequired) {%>
         
         	 handleChange(functionId, args) {
         		 console.log("FIELD ---> CHANGED");
         		 this.changeCount = this.changeCount + 1;
         		 if (functionId) {
         			 delegate(functionId, args);
         		 }
         	 },
         	 delegate(functionId, args) {
         		 if (delegates && delegates[functionId]) {
         			delegates[functionId](args);
         		 }
         	 },
         	 
         	  handleEvent(handlerId, args) {
         		 this.delegate(handlerId, args);
         	  },
         	  doCheck(checkId, args) {
         		  this.delegate(checkId, args);	  
         	  },
         	  logout(isRedirectToLogin) {
				  sessionStorage.removeItem('UserLoginType');
          		  localStorage.setItem(appName + "_" + moduleName + "_lastLogout", new Date().getTime());
         		  deleteCookie("<%=bearerKey%>=;");
         		  try {
         			  if (beforeLogoutScript && !isRedirectToLogin) {
         			 	var beforeLogoutFunction = eval("(" + beforeLogoutScript + ")");
         			 	beforeLogoutFunction();
         			  }
         		  }
         		  catch (e) {
         			 console.error("Error before logout: " + e); 
         		  }
         		  if (!isRedirectToLogin) {
         		 	 customizationFunctions.logUserActivity("Logout");
         		  }
         		  try {
         		 executeAppAPI("processuserloginaction", { email: user.email, loginStatus: "loggedOut", 
     				appurl: baseURL, fingerprint: fingerprint, appName: appName }, user.email, function(response) {
     					console.log(JSON.stringify(response));
     					document.getElementById("userLogout").submit();				
     			 });
         		  } catch (e) {
         			  console.error(e);
         		  }
         		 
         		 
         	  },
         	  changePasswordClick(){
         		  deleteCookie("<%=bearerKey%>=;");
         	  },
         	  navigate(url) {
         		  window.location = url;
         	  },
             <%} else {%> 
             	  updateTimeLeft() {
             		  var timeInMillisLeft = this.expiryTime.getTime() - new Date().getTime();
             		  if (timeInMillisLeft <= 0 && !this.timeExpired) {
             			 this.timeExpired = true;             			 
				 this.showDialog({
			   				  show: true, 
			   				  title: app.getLabel('Time limit expired!'),
			   			   	  message: app.getLabel('Please try again.'), 
			   			   	  icon: "priority_high", 
			   			   	  okButtonText: app.getLabel('OK'), onOk: function() { window.location.reload(); }
			   				});
             		  }
             		  else {
             		  	this.timeLeft = utils.parseMillisecondsIntoReadableTime(timeInMillisLeft);
             		  }
             	  },
	         	  getLoginError() {
	         		  	return this.getLabel('loginerror');
	         		  },
         		  forgotPasswordFunc(){
        			  this.loginData = false;
         			  this.resetData = false;
         			  this.backButton = true;
         			  this.isSendRecoveryButtonEnabled = true;
         			  this.forgotPassword = false;
         			  this.hideEmail = true;
         			  this.userStage = app.getLabel('forgotpassword');  //internatilization will not work here need to retrive labels dynamically
         		  },
				  openHelpWindow(){
					  this.HelpDialog = true;
				  },
				  openChatLink(){
					window.open("https://www.tidio.com/talk/pwysmxl0dg4tronssnmpicrlhln5bj59", "_blank");
				  },
         		  reloadHomePage(){
         			  location.reload(true);
         		  },
         		  showResetView(){
         			  this.resetData = true;
         			  this.loginData = false;
         			  this.forgotPassword = false;
         			  this.forgotPasswordLink = false;
         		  },
         		  showChangePasswordView(){
         			  this.loginData = false;
         			  this.resetData = false;
         			  this.opened = false;
         			  this.hideEmail = false;
         			  this.backButton = false;
         			  this.forgotPassword = false;
         			  this.passwordChangeState = true;
         			  this.userStage = app.getLabel('changepassword');
         		},
         		  changePasswordActivate(){
         			  this.loginData = false;
         			  this.resetData = false;
         			  this.backButton = true;
         			  this.forgotPassword = false;
         			  this.hideEmail = true;
         			  this.userStage = app.getLabel('changepassword');
         			  this.passwordChangeState = true;
         		  },
         		  resetUserPassword(){
         			  let confirmPassword = this.confirmpassword;
         			  let newPassword = this.newpassword;
         			  if((newPassword.length==0) && (confirmPassword.length==0)) { this.isResetPasswordDiff = true; this.passwordValidationMessage="Enter both fields"; return;}
         			  if((newPassword.length > 0 && confirmPassword.length>0) && newPassword != confirmPassword) {
         				  this.isResetPasswordDiff = true;
         			      this.passwordValidationMessage = app.getLabel('passwordValidationMessage');
         			  }
         			  else if (!this.validatePassword(this.newpassword)){
         				  this.isResetPasswordDiff = true;
        			      this.passwordValidationMessage = app.getLabel('passwordWeakMessage');
         			  }
         			  else{
         			  this.isResetPasswordDiff = false;
         			  let currentURL = window.location.href;
         			  let key = currentURL.toString().split('=')[1];
         			  let redirectURL = currentURL.toString().split('?')[0];
					  if(key.includes("%21")){
						  key = key.replace("%21", "!");
					  }
         			  let notifyRef = this.$q;
         			  $.ajax({
         					url : apiURL + 'ResetCred',
         					type: 'POST',
         					contentType: "application/json",
         					data: JSON.stringify({
         						
         						//confirmpassword:this.confirmpassword,
         						confirmpassword:confirmPassword,
         						resetKey:key,
         						validResetKey:false,
         						actionType: 'ResetPasswordAction',
         						tenant: '<%=tenant%>',
         						subTenant: subTenantName,
         						app: '<%=app%>',
         						module: '<%=module%>' })
         					,
         					success : function(data) {
         						
         						var response = eval("(" + data + ")");
         						
         						if (response.result == 'OK' || response.result == 'ok') {
         							
         							this.forgotUrl = response.url;
         							let appRef = app;
         							app.showDialog({
           			   				  show: true, 
           			   				  title: appRef.getLabel('PasswordReset'),
           			   			   	  message: appRef.getLabel('PasswordResetSuccessMSG'),
           			   			   	  icon: "priority_high", 
           			   			   	  //showCancel: true,
           			   			   	  cancelButtonText: appRef.getLabel('cancel'),
           			   			   	  okButtonText: appRef.getLabel('ok'),
           			   			   	  
           			   			   	  onOk: function() {  
           			   			   		deleteCookie("<%=bearerKey%>=;");
         							  	let currentURL = window.location.href;
                   			  			let key = currentURL.toString().split('=')[1];
                   			  			let redirectURL = currentURL.toString().split('?')[0];
                   			  			window.location.href = redirectURL;
           			   			   	  }
           			   				});
         							//delete cookies so after reset if is have some cookies then it will not login after redirecting
         							
         							console.log("reset resopnse:", response);
         							
         						}

         						else {
									if (response.result == 'ERR_RKM') {
										let appRef = app;
										app.showDialog({
             			   				  show: true, 
             			   				  title: appRef.getLabel('error'),
             			   			   	  message: appRef.getLabel('PasswordLinkExpired'),
             			   			   	  icon: "priority_high", 
             			   			   	  //showCancel: true,
             			   			   	  cancelButtonText: appRef.getLabel('cancel'),
             			   			   	  okButtonText:appRef.getLabel('ok'),
             			   			   	  
             			   			   	  //onOk: function() { this.ev.handleDelete(); }
             			   				});
									} else if (response.result == 'ERR_OPM') {
										let appRef = app;
										app.showDialog({
             			   				  show: true, 
             			   				  title: appRef.getLabel('error'),
             			   			   	  message:appRef.getLabel('oldPasswordError'),
             			   			   	  icon: "priority_high", 
             			   			   	  //showCancel: true,
             			   			   	  cancelButtonText: appRef.getLabel('cancel'),
             			   			   	  okButtonText:appRef.getLabel('ok'),
             			   			   	  
             			   			   	  //onOk: function() { this.ev.handleDelete(); }
             			   				});
									} else {
										let appRef = app;
										app.showDialog({
             			   				  show: true, 
             			   				  title: appRef.getLabel('error'),
             			   			   	  message: 5 == 0 ? appRef.getLabel('PasswordResetError') : appRef.getLabel('PasswordResetErrorOldCheck'),
             			   			   	  icon: "priority_high", 
             			   			   	  //showCancel: true,
             			   			   	  cancelButtonText: appRef.getLabel('cancel'),
             			   			   	  okButtonText:appRef.getLabel('ok'),
             			   			   	  
             			   			   	  //onOk: function() { this.ev.handleDelete(); }
             			   				});
									}
         						}
         						
         						
         					},
         					error : function(data, status, errorThrown) {
         						
         						//endLogin(true, "Service error: " + status);
         					}
         				});
         			  }
         			    
         		  },validate(data){
         			  console.log("validate called");
         			  console.log(this.email);
         			  
         			  const dismis = this.$q.notify({
         			        message: '',
         			        html: true,
         			        position:'center',
         			        timeout: 10,
         			      });
         			  
         			  if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email))
         			  {
         				  this.isEmailValid = true;
         				
         			  }else{
         				  dismis();
         				 dismis = this.$q.notify({
         				        message: 'Invalid Email',
         				        html: true,
         				        position:'center',
         				        timeout: 10,
         				      });
         				  this.isEmailValid = false;
         				 }
         			    
         		  },
         		  validateEmail(){
         			  console.log("validate called");
         			  console.log(this.email);
         			   
         			  //if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(this.email))
         				 //for + sign 
         			  // if (/^[_a-z0-9-]+(\.[_a-z0-9-]+)*(\+[a-z0-9-]+)?@[a-z0-9-]+(\.[a-z0-9-]+)*$/i.test(this.email))
         				  if(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email))
         			{ 
         			   this.isEmailValid = true;
         			}else{
         				 this.isEmailValid = false;
         			 }
         		 },
         		  sendRecoveryEmail(data){
         			  this.validateEmail();
         			  let msg = "";
         			  msg = (this.isEmailValid)? "Check your email for password reset link":"Invalid Email";
         			 
         			      
         			 
         			 if(this.isEmailValid){
         			 var resetEmail = this.email.toString();
         			 }
         			 var currentURL = window.location.href;
         			 
         			 try {
						 if(currentURL.includes("#")){
						   var newurl = currentURL.split("#");
						   currentURL = newurl[0];
						 }
         				 if (!currentURL.endsWith('#')) {
         					currentURL = currentURL + '?';
         				 }
         			 }
         			 catch (e) {
         				 
         			 }
         			
         			
         			 $.ajax({
         						url : apiURL + 'ResetCred',
         						type: 'POST',
         						contentType: "application/json",
         						data: JSON.stringify({
         							email: resetEmail,
         							resetURL:currentURL,
         							actionType: 'ForgotPasswordAction',
         							tenant: '<%=tenant%>',
         							subTenant: subTenantName,
         							app: '<%=app%>',
         							module: '<%=module%>' })
         						,
         						success : function(data) {
         							
         							var response = eval("(" + data + ")");
         							
         							if (response.result == 'OK' || response.result == 'ok') {
         								this.opened = true;
         								this.forgotUrl = response.url;
         								//window.location.href = this.forgotUrl;
         								let appRef = app;
         								console.log("reset URL:->> ",response.url);
         								app.showDialog({
               			   				  show: true, 
               			   				  title: appRef.getLabel('RecoverPassword'),
               			   			   	  message: appRef.getLabel('RecoverPasswordMailMSG'), 
               			   			   	  icon: "priority_high", 
               			   			   	  //showCancel: true,
               			   			   	  //cancelButtonText: "Cancel",
               			   			   	  okButtonText: appRef.getLabel('ok'),
               			   			   	  
               			   			   	  onOk: function() { 
               			   			   			deleteCookie("<%=bearerKey%>=;");
               			   			   			//location.reload();
               			   			   	  }
               			   				});
         							}else{
         								let appRef = app;
         								app.showDialog({
                 			   				  show: true, 
                 			   				  title: appRef.getLabel('RecoverPassword'),
                 			   			   	  message: appRef.getLabel('AccountNotFound'), 
                 			   			   	  icon: "priority_high", 
                 			   			   	  //showCancel: true,
                 			   			   	  //cancelButtonText: "Cancel",
                 			   			   	  okButtonText: appRef.getLabel('ok'),
                 			   			   	  
                 			   			   	  //onOk: function() { this.ev.handleDelete(); }
                 			   				});
         							}
         							
         							
         						},
         						error : function(data, status, errorThrown) {
         							//endLogin(true, "Service error: " + status);
         						}
         					});
         				    
         		  },
         		  login(selectedSubTenant, selectedApp) {

         			 
         			
         			this.username = this.username.trim();
         			if (!this.username) {
         			     endLogin(true);
                    }
         			else {
         			  this.inprogress = true;
            		  this.error = false;
            		  var loginParams = {
            				username : this.username,
       						tenant: tenantName,
       						subTenant: selectedSubTenant ? selectedSubTenant : subTenantName,
       						app: selectedApp ? selectedApp : appName,
       						module: moduleName,
       						fingerprint: fingerprint + "",
       						rememberMeTokens: localStorage.getItem(this.username ? this.username.toLowerCase() : null)
       				  };



            		  if (selectedApp) {
            			  subTenantName = selectedSubTenant;
            			  loginParams.sso = true;
            		  }
            		  if (this.loginStatus == "LOGIN" || this.loginStatus  == "SEL_APP") {
            			  loginParams.password = this.password;
            			  let encrypt = new JSEncrypt();
            		      	  encrypt.setPublicKey(publicKey);
              		      	  let cipherText = encrypt.encrypt(loginParams.password);
            		          loginParams.password = cipherText; 
            		          loginParams.encryptedFields = "password";	
                		      if (this.username) {
                		    	  this.viewRoot.username = this.username;
                		      }           
            		  	if (!selectedSubTenant && tenantName == subTenantName) {
            				  delete loginParams.subTenant;
            		  	}   		          
            		  }
            		  else if (this.loginStatus == "OTP_PND" || this.loginStatus == "OTP_REQ") {
            			  loginParams.sendOTPTo = this.sendOTPTo;
            			  loginParams.OTP = this.OTP;
            		  }

            		  $.ajax({
         					url : apiURL + 'WebAppAuth' + this.authEndpoint,
         					type: 'POST',
         					contentType: "application/json",
         					data: JSON.stringify(loginParams),
         					headers: {
         						"Authorization": app.tempToken
         					}
         					,
         					success : function(data) {
         						
         						var response = eval("(" + data + ")");
         						
         						if (response.result == 'OK') {
         							endLogin(false);
         							token = response.token;
         							subTenantName = response.subTenant;
         							//alert(token);
         							//customizationFunctions.logUserActivity("Login");
         							//document.cookie = "<%=bearerKey%>=" + token + "expires='2999/12/31';path=/<%=subTenant%>/webapps/<%=app%>";
         							deleteCookie("<%=bearerKey%>");
         							document.getElementById("BearerToken").value = token;
         							
         							localStorage.setItem(appName + "_" + moduleName + "_lastLogin", new Date().getTime());
         							
         							if (response.fingerprint) {
         								var username = app.username ? app.username : app.viewRoot.username;
         								username = username.toLowerCase();
         								var fingerprintTokens = localStorage.getItem(username);
         								if (!fingerprintTokens) {
         									fingerprintTokens = {};
         								}
         								else {
         									fingerprintTokens = eval("(" + fingerprintTokens + ")");
         								}
         								fingerprintTokens[response.subTenant] = response.fingerprint;
         								localStorage.setItem(username, JSON.stringify(fingerprintTokens));
         							}
         							sessionStorage.setItem('UserLoginType', 'Password');
         							var loginForm = document.getElementById("userLogin");
         							loginForm.action = "../../../" + subTenantName + "/webapps/" + appName + "/" + moduleName;
         							loginForm.submit();
									localStorage.setItem('loginLoader', true);
         						}
         						else if (response.result != 'ERROR') {
         							
         							if (response.subTenant) {
         								subTenantName = response.subTenant;
									 }
									 if (response.result == "ERR_CUR") {
         								app.showDialog({
   						   				  show: true, 
   						   				  title: app.getLabel('Login Failed'),
   						   			   	  message: app.getLabel('Concurrent user limit exceeded.'), 
   						   			   	  icon: "priority_high", 
										   okButtonText: app.getLabel('OK') ,
										   onOk: function() { 
												window.location.reload();
										   }	   
   						   				});
         							}
         							else if (response.result == "SEL_APP") {
         								app.authEndpoint = app.authEndpoint + "/selectApp";
         								app.loginStatus = response.result;
         								app.tempToken = response.token;
         								app.apps = response.apps;
         							}
         							else if (response.result == "RES_PWD") {
         								app.showDialog({
     						   				  show: true, 
     						   				  title: app.getLabel('Password expired'),
     						   			   	  message: app.getLabel('Your password has expired. Please reset it once and login again.'), 
     						   			   	  icon: "priority_high", 
     						   			   	  okButtonText: app.getLabel('OK'),
     						   			  	  onOk: function() { 
     						   			  		  window.location = window.location + '?resetPassword=' + response.resetKey 
     						   			  				  + '!' + app.username;
     						   			  	  }
     						   				});
         							}         							
         							else if (response.result == "OTP_INV") {
         								//if (this.options.wrongAttemptDone == 1) {
         									app.showDialog({
         						   				  show: true, 
         						   				  title: app.getLabel('OTP Incorrect!'),
         						   			   	  message: app.getLabel('Please try again.'), 
         						   			   	  icon: "priority_high", 
         						   			   	  okButtonText: app.getLabel('OK'), onOk: function() { window.location.reload(); }
         						   				});
         								//}
         								//this.options.wrongAttemptDone = 1;
         							}
         							else {
         								 app.loginStatus = response.result;
	        							 app.tempToken = response.token;
	        							 app.authEndpoint = "/" + tenantName + "/" + appName + "/" + moduleName;
	        							 if (response.result == "OTP_PND") {
	        								 app.authEndpoint = app.authEndpoint + "/sendOTP"; 
	        							 }
	        							 else if (response.result == "OTP_REQ") {
	        								 app.sendOTPTo = response.target;
	        								 app.retryToken = response.retryToken;
	        								 app.authEndpoint = app.authEndpoint + "/verifyOTP";
	        								 app.expiryTime = new Date(new Date().getTime() + (60000 * response.expiresIn));
	        								 app.updateTimeLeft();
	        								 setInterval(app.updateTimeLeft, 1000);
	        							 }
         							}
        						}
         						else {

									if (response.errorCode && labels[response.errorCode]) {
										app.showDialog({
										show: true,
										title: app.getLabel('Error'),
										message: app.getLabel(response.errorCode),
										icon: "priority_high",
										okButtonText: app.getLabel('ok'),
										onOk: function () {
												location.reload();
											}
										});
									}
									if(response.errorCode && response.errorCode == 'null') {
										app.loginStatus = "LOGIN";
         								endLogin(true);
									}
         							// app.loginStatus = "LOGIN";
         							// endLogin(true);
         						}
         					},
         					error : function(data, status, errorThrown) {
         						if (app.loginStatus == 'OTP_REQ' || app.loginStatus == 'OTP_SENT') {
         							app.showDialog({
         				   				  show: true, 
         				   				 title: app.getLabel('OTP Incorrect!'),
						   			   	  message: app.getLabel('Please try again.'), 
						   			   	  icon: "priority_high", 
						   			   	  okButtonText: app.getLabel('OK'), onOk: function() { window.location.reload(); }
         				   				});
         						}
         						else {
         							endLogin(true, "Service error: " + status);
         						}
         					}
         				});
         			    }
         		  },
				  
         	  
         <%}%> //Login Methods End
           }
         });
         
         if (<%=afterLogin%>) {
        	 var lastLogin = localStorage.getItem(appName + "_" + moduleName + "_lastLogin");
        	 var lastLogout = localStorage.getItem(appName + "_" + moduleName + "_lastLogout");
        	 if (lastLogout && lastLogin && Number(lastLogout) > Number(lastLogin)) {
        		 app.logout(false);
        	 }
        	 customizationFunctions.logUserActivity("Login");
         }
         <%if (!isAuthenticationRequired) {%>         
         customizationFunctions.handleUserActivity();
         <%}%>
         
         app.viewOptions.selectedTheme = app.viewOptions.themes[0]; 
         
         console.log(window.location + "  -------- QUERY STRING:::::" +  window.location.search);
         var urlParameters = window.location.search;
         
         if(urlParameters.length > 0){
         urlParameters = urlParameters.toString().substring(1).split("=")[0].toLowerCase();
         if(urlParameters.toString().toLowerCase() == "resetpassword"  || urlParameters.toString().toLowerCase() == "setpassword"){
         	this.app.showResetView();
         	this.app.userStage= app.getLabel('resetPassword');
         }
         if(urlParameters.toString().toLowerCase() == "changepassword"){
         	this.app.showChangePasswordView();
         	console.log("change password URL in window.search.location");
         }
         
         }
         
         var globalTags = <%=globalTagsMap%>;
         app.viewRoot.model.globalTags = globalTags;
         
         var userGlobalTags = getValueAtPath(user, 'userDetails.globalTags');
         if (userGlobalTags) {
        	 for (tag in userGlobalTags) {
        		 app.viewRoot.model.globalTags[tag] = userGlobalTags[tag];
        	 }
         }
         
         console.log("Global tags: " + JSON.stringify(app.viewRoot.model.globalTags));
         
         if (window.location.hash) {
           var hash = window.location.hash.substring(1);
           if (hash == "login") {
            deleteCookie("<%=bearerKey%>=;");
            document.getElementById("userLogout").submit();
           }
         }
         
         if (!app.user) {
         //Load Login page
         
         }
         
         function deleteCookie(cname) {
             var d = new Date(); //Create an date object
             d.setTime(d.getTime() - (1000*60*60*24)); //Set the time to the past. 1000 milliseonds = 1 second
             var expires = "expires=" + d.toGMTString(); //Compose the expirartion date
             window.document.cookie = cname+"="+"; "+expires;//Set the cookie with name and the expiration date
         }
         
         function loadJS(file) {
             // DOM: Create the script element
             var jsElm = document.createElement("script");
             // set the type attribute
             jsElm.type = "application/javascript";
             // make the script element load file
             jsElm.innerHTML = "alert('Testing dynamicJS')";
             // finally insert the element to the body element in order to load the script
             document.body.appendChild(jsElm);
         }
         
         function handleTopMenuClick(menuItem) {
         	menuItem.top = true;
         	handleNavMenuClick(menuItem);
         }
         
         var currentPageId;
         
         function handleNavMenuClick(menuItem) {
        	 
        	 //pageWidget.destroy();
        	 
         	var handled = app.emitEvent("navMenuItemClicked", menuItem);
         	if (!handled) {
         		var widgetId1 = menuItem.url;
         		loadPage(widgetId1);
         	}
         }
         
         function loadPage(pageId) {
        	 if (!pageId && currentPageId) {
        		 pageId = currentPageId;
        	 }
        	 else if (!pageId && window.location.hash) {
        		 pageId = window.location.hash.substring(1);
        	 }
        	 else if (!pageId && webModule && webModule.homePage) {
        		 pageId = webModule.homePage;
        	 }
        	 if (pageId) {
        		/*
	        	pageLayout.children.pop();
	      		pageLayout.children.push({ showTitleBar: true, 
	      			resourceId: "pageWidget", styleClasses:"col-md-12 row", gutter: "md", controlName: "cnx-page-widget", loaded: false, 
	      			widgetId: pageId, label: { 'default' : '' }, _instance: new Date().getTime()
	      		});
	      		window.location.hash = "#" + pageId;
	      		*/
	      		navigation.url = pageId;
	      		navigation.handleNavigation();
	      		currentPageId = pageId;
        	 }
         }
         
         
         
          	
         function getAuthToken() {
             return token;
         }
         
		 function getURLParameterByName(name) {
			var url = window.location.href;
    	    name = name.replace(/[\[\]]/g, '\\$&');
    	    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    	        results = regex.exec(url);
    	    if (!results) return null;
    	    if (!results[2]) return '';
    	    return decodeURIComponent(results[2].replace(/\+/g, ' '));
    	 }
		
         <%if (isAuthenticationRequired) {%>
         
         function endLogin(error, errorText) {
         	app.inprogress = false;
         	app.error = error;
         	if (errorText) {
         		app.errorText = errorText; 
         	}
         }
		 

		 var token1 = getURLParameterByName('auth');
		  if (token1) {
			  //alert(token);
			  sessionStorage.setItem('UserLoginType', 'Proxy');
			  document.cookie = "Bearer=" + token1 + ";path=/<%=subTenant%>/webapps/<%=app%>/";
			  document.getElementById("BearerToken").value = token1;
			  document.getElementById("userLogin").submit();
		  }
	  
         <%}%> 
         
		 function handleAdminSwitch(userToken, isAdminModule) {
        	 var cname = '<%=bearerKey%>_' + user.id;
        	 const d = new Date();
        	 d.setTime(d.getTime() + (24*60*60*1000));
        	 let expires = "expires="+ d.toUTCString();
        	 document.cookie = cname + "=" + token + ";" + expires + ";path=/";
        	 deleteCookie("<%=bearerKey%>=;");
        	 window.open(apiURL + subTenantName + "/webapps/qtis/" +  (isAdminModule ? 'qtisusersmodule' : 'qtisweb') + "?auth=" + userToken, "_blank");
         }
		 
         initWebSockets();
          
         function getImageUrl(url) {
	     	if (url && (url.startsWith("../images/") || url.startsWith("../content/"))) {
	       		url = "../../" + url;
	       	}
	     	return url;
         }
         
         function getFileUrl(url) {
 	     	if (url && url.startsWith("../content/")) {
 	       		url = "../../" + url;
 	       	}
 	     	return url;
          }
        
         //checkUserInactivity(<%=sessionTimeoutPeriod%>);
         
         var beforeLogoutScript = `function() { <%=beforeLogoutScript%> }`;

	function userInactivity(){
 			localStorage.setItem('UserInactivity', '0');
 			var secondsSinceLastActivity = 0;
 			var maxInactivity = <%=sessionTimeoutPeriod%>;
 			setInterval(function(){
 				secondsSinceLastActivity++;
 				localStorage.setItem('UserInactivity', secondsSinceLastActivity);
 				var UserInactivityMin = localStorage.getItem('UserInactivity');
 				if(UserInactivityMin >= maxInactivity){
 					customizationFunctions.logUserActivity("Logout", "", "User inactivity timed out");
					deleteCookie("<%=bearerKey%>=;");
 					document.getElementById("userLogout").submit();
 				}
 			}, 60000);
 			function activity(){
 				secondsSinceLastActivity = 0;
 			}
 			var activityEvents = [
 				'mousedown', 'mousemove', 'scroll', 'touchstart'
 			];
 			activityEvents.forEach(function(eventName) {
 				document.addEventListener(eventName, activity, true);
 			});
 		}
		userInactivity();
try {
	$(document).ready(function() {
  		Highcharts.setOptions({
    			lang: {
      				thousandsSep: ','
    			}
  		});
	});
} catch (e) { console.log(e); }

      </script>
      
      <script
         src='<%=apiURL%><%=configRef.getFilePath(tenant, appId, moduleRef.getTypeId(),
            "appfiles/v-zero/custom/_tenant/modules/_appid/_id.js", true)%>'></script>
            
      <script
         src="<%=apiURL%><%=layoutTemplate%>?v=5_20250640"></script>
         
      <% if (moduleRef.getEnablePWA()) { %>
		<script>
			if ('serviceWorker' in navigator) {
				navigator.serviceWorker
				.register('../../../sw.js')
				.then(function(registration) {
					console.log('Service Worker registration successful with scope: ', registration.scope);
				})
				.catch(function(err) {
					console.log('Service Worker registration failed: ', err);
				});
			}
		</script>
		<script>
			// Detects if device is on iOS 
			const IsIos = () => {
				const userAgent = window.navigator.userAgent.toLowerCase();
				return /iphone|ipad|ipod/.test( userAgent );
			}
			// Detects if device is in standalone mode
			const IsInStandaloneMode = () => ('standalone' in window.navigator) && (window.navigator.standalone);

			// Checks if should display install popup notification:
			if (IsIos() && !IsInStandaloneMode()) {
				this.setState({ showInstallMessage: true });
			}
		</script>
      <% } %>
	  <%if (isAuthenticationRequired) {%>
      	<script src="//code.tidio.co/pwysmxl0dg4tronssnmpicrlhln5bj59.js" async></script>
      <% } %>
	  
	  <script>
	  	function onSuccess(googleUser) {
		  var profile = googleUser.getBasicProfile();
		  console.log('ID: ' + profile.getId()); // Do not send to your backend! Use an ID token instead.
		  console.log('Name: ' + profile.getName());
		  console.log('Image URL: ' + profile.getImageUrl());
		  console.log('Email: ' + profile.getEmail()); // This is null if the 'email' scope is not present.
		  console.log('Logged in as: ' + googleUser.getBasicProfile().getName());
		}
		function onFailure(error) {
		  console.log(error);
		}
		function renderButton() {
		  gapi.signin2.render('my-signin2', {
			'scope': 'profile email',
			'width': 240,
			'height': 50,
			'longtitle': true,
			'theme': 'dark',
			'onsuccess': onSuccess,
			'onfailure': onFailure
		  });
		}
		</script>
	  <script src="https://apis.google.com/js/platform.js" async defer></script>
   </body>
</html>