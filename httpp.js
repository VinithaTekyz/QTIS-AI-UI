var sendChatAIRequest = session.getApi("ChatAIhttp");//SendHttpRequest action

context.log(input);
// Body data for POST request
var messages = utils.createMap();
messages.role = "system";
messages.content = "how are you?";

//requestParams.data.files = utils.createList();
var files = utils.createMap();
files.data = "string";
files.filename = "string";
files.mimeType = "string";
var requestData = utils.createMap();
requestData.files = [files];
requestData.messages = [messages];
requestData.summarizeFiles = false;
requestData.temperature = 0;
requestData.max_tokens = 0;

var requestParams = utils.createMap();
requestParams.data = requestData;
context.log(requestParams);

var headers = utils.createMap();
var authToken = new java.lang.String(sendChatAIRequest.getHttpClient().username + ":" + sendChatAIRequest.getHttpClient().password);
authToken = java.util.Base64.encoder.encodeToString(authToken.bytes);
headers.Authorization = "Basic " + authToken;

headers.accept = "application/json";
headers["Content-Type"] = "application/json";

sendChatAIRequest.headers = headers;
sendChatAIRequest.data = requestData;
var response = sendChatAIRequest.execute();
context.log(response);