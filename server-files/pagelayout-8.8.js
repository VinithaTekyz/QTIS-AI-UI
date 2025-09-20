Vue.component('cnx-pagebar', {
	template: `<template id="cnx-pagebar">

	 <q-toolbar dense :class="' cnx-topBar bg-' + theme.top.bgColor + ' text-' + theme.top.color">
   	    
   	    <q-btn v-for="btn in uiprops.buttons.left" flat 
   	    	v-if="!btn.hidden"
   	    	@click="btn.eventHandlers.onclick()" round dense :icon="btn.icon" ></q-btn>
       	
       	<img v-if="uiprops.logo" height="30px" v-bind:src="uiprops.logo"></img>
       	<div v-else class="q-ml-md"></div>
       	
       	<div v-if="$q.screen.lt.md && uiprops.menu && uiprops.menu.length > 0">
       		<q-btn size="md" dense class="q-px-xs" flat :color="theme.top.color" icon="playlist_add">
       			<q-menu>
       			<q-list> 
       				<q-item v-for="menuGroup in uiprops.menu" v-if="menuGroup.visible">
       					<q-btn-dropdown v-if="menuGroup.visible && menuGroup.children" size="md" dense class="q-px-xs" flat  :color="theme.top.color" 
		            			no-caps :label="menuGroup.label.default"  :icon="menuGroup.icon">
								        
								<q-list>
									<q-item v-close-popup class="q-px-md" v-for="menuItem in menuGroup.children" 
											clickable @click="handleTopMenuClick(menuItem);" 
											v-if="menuItem.visible" >
								        <q-item-section avatar>
							            	<q-icon :name="menuItem.icon" ></q-icon>
							          </q-item-section>
										<q-item-section><q-item-label>{{ menuItem.label.default }}</q-item-label></q-item-section>
									</q-item>
								</q-list>
		    
		      				</q-btn-dropdown>
		      				<q-btn class="q-px-xs" no-caps v-if="menuGroup.visible && !menuGroup.children" size="md" @click="handleTopMenuClick(menuGroup);" dense :label="menuGroup.label.default"  flat :icon="menuGroup.icon"></q-btn>
       				</q-item>
       			</q-list> 
       			</q-menu>
           	</q-btn> 
       	</div>
       	
           <div v-else v-if="uiprops.menu && !($q.screen.lt.md)" v-for="menuGroup in uiprops.menu" >
           	  <q-btn v-if="menuGroup.visible && menuGroup.children" size="md" dense class="q-px-sm" flat  :color="theme.top.color" 
           			no-caps :icon="menuGroup.icon" :label="$q.screen.gt.md ? menuGroup.label.default : ''" 
           			:title="$q.screen.gt.md ? '' : menuGroup.label.default" >
					 <q-menu anchor="bottom left" self="top left">
						<q-list>
						  
							<q-item v-close-popup class="q-px-md" v-if="menuItem.visible" v-for="menuItem in menuGroup.children" clickable @click="handleTopMenuClick(menuItem);" >
						      <q-item-section avatar>
						      
					              <q-icon :name="menuItem.icon" ></q-icon>  
					          </q-item-section>
								<q-item-section><q-item-label>{{ menuItem.label.default }}</q-item-label></q-item-section>
							</q-item>
						</q-list>
                      </q-menu>
     				</q-btn>
     				
     				<q-btn class="q-px-xs" no-caps v-if="menuGroup.visible && !menuGroup.children" size="md" @click="handleTopMenuClick(menuGroup);" dense 
     					:label="$q.screen.gt.md ? menuGroup.label.default : ''"  flat :icon="menuGroup.icon"
     					:title="$q.screen.gt.md ? '' : menuGroup.label.default" ></q-btn>
           	</div> 
       	
       	<q-toolbar-title></q-toolbar-title>
       	
       	<div v-if="uiprops.customControls" >
       		<component v-for="customTopComp in uiprops.customControls" :is="customTopComp.controlName"></component>
       	</div>
       	           	
       	<q-btn v-for="btn in uiprops.buttons.right"  flat @click="btn.eventHandlers.onclick()" round dense :icon="btn.icon" ></q-btn>
		<div v-if="moduleName == 'qtisotp'" >
		   <cnx-sharing-record-otp-screen></cnx-sharing-record-otp-screen>
	   	<div>
		<div v-if="moduleName == 'qtisreceivefile'" >
		   <cnx-receive-file-screen></cnx-receive-file-screen>
	   	<div>
	</q-toolbar>

</template>`,
	extends: baseComponent,
	methods: {
		handleTopMenuClick: function (menuItem) {
			menuItem.top = true;
			handleNavMenuClick(menuItem);
		},
		data: {
			showing: false
		}
	}

});

Vue.component('cnx-toolbar', {
	template: `<template id="cnx-toolbar">

	 <q-toolbar dense :class="'cnx-toolbar bg-' + (uiprops.color ? uiprops.color : uiprops.theme.bgColor)">
   	    <q-btn v-for="btn in uiprops.buttons.left" flat @click="btn.eventHandlers.onclick()" round dense :icon="btn.icon" ></q-btn>
       	<q-toolbar-title>
       		{{ getLabel() }}
       	</q-toolbar-title>
       	<q-btn v-for="btn in uiprops.buttons.right"  flat @click="btn.eventHandlers.onclick()" round dense :icon="btn.icon" ></q-btn>
	 </q-toolbar>

</template>
`,
	extends: baseComponent

});

Vue.component('cnx-drawer', {
	template: `<template id="cnx-drawer">
		
		<q-drawer :breakpoint="600"  :content-class="theme.drawer + ' test  ' + uiprops.styleClasses" :dark="theme.isDark" 
			:overlay="$q.screen.lt.md ? true : uiprops.overlay" 
			fixed :width="uiprops.width" :style="uiprops.style" :mini="uiprops.miniState"
			v-model="uiprops.visible" :side="uiprops.side" app v-if="!(uiprops.resourceId == 'LayerDrawer' && moduleName == 'qtisweb')">
			
			<q-scroll-area class="fit" :thumb-style="{backgroundColor: '#d500f9', width:'8px', height: '200px', opacity: 0.6}">
			
			<q-toolbar dense fixed clipped-left app 
				:class="'bg-' + (uiprops.titleColor ? uiprops.titleColor : 'blue') + ' text-white'" 
				v-if="$q.screen.lt.md || uiprops.showTitle">
			
				<q-toolbar-title  :class="'text-white' + ' text-subtitle1 text-weight-thin'" floating font-weight-thin class="mr-5 align-center">
						<span v-if="uiprops.showTitle">{{ getLabel() }}</span>
				</q-toolbar-title>
				
				<q-btn  float-right size="sm" flat round icon="close"
					@click.stop="uiprops.visible = !uiprops.visible"></q-btn>
			
			</q-toolbar>	 
			
				
			
				<component v-for="child in uiprops.children" :is="child.controlName" v-bind:uiprops="child" v-bind:model="model"
				v-bind:parent="ref" v-bind:widget="ref.getWidget()"></component>
			</q-scroll-area>
			
			<q-resize-observer @resize="onResize" ></q-resize-observer>
			
		</q-drawer>

	</template>`,
	extends: baseComponent,
	props: ['miniState'],
	methods: {
		onResize() {

		}
	}

});

Vue.component('cnx-footerControls', {
	props: ['showlogo'],
	template: `<template id="footerControls">
			<div class="row text-white items-center"> 
				<div class="col-auto q-mr-sm">
				
				<q-spinner-dots v-if="showLoading"
		          	color="light-blue"
		          	size="3em" 
		        	/> 
	        	</div>  
	        	<div class="col-auto q-mx-xs" style="font-size:10px !important;" v-if="showlogo">
	        		Powered by
	        	</div>
	        	<div class="col-auto q-mx-sm" v-if="showlogo">
	        		<img src="../../../images/cnx_logo2.png" height="30px" />
	        	</div>
	        	<a id="download_link" download="download" href=”” ></a>
	        </div>
		</template>
		`,
	data: function () {
		return {
			showLoading: false
		}
	},
	created() {
		this.$root.registerEventListener("loadingStatusChanged", this);

	},
	destroyed() {
		this.$root.removeEventListener("loadingStatusChanged", this);
	},
	methods: {
		notifyEvent(event, eventData) {
			this.showLoading = eventData;
		}
	}
});


Vue.component('cnx-footerInfo', {
	template: `<template id="footerInfo">
			<div class="row text-white items-center"> 
				<div class="col-12 q-mr-sm">
					<div class="footer-message">
					<div class="footer-img-text">
					<img :src=" baseURL + '/common/images/footer-logo.png'" /> Secure Client Portal
					</div>
					<div class="footer-img-text">
					<img :src=" baseURL + '/common/images/footer-logo.png'" /> Data Encrypted
					</div>
					<div class="footer-img-text">
					<img :src=" baseURL + '/common/images/footer-logo.png'" /> MFA Security
					</div>
					<div class="footer-img-text">
					<img :src=" baseURL + '/common/images/footer-logo.png'" /> Secure file sharing
					</div>
					</div>
				
				</div>
		</template>
		`,
	data: function () {
		return {
		}
	},
	methods: {

	}
});


Vue.component('cnx-page', {
	template: `<template id="cnx-page">
		<q-layout   :view="uiprops.layout"  >
		<q-inner-loading :showing="showLoader" style="z-index: 9999;">
			<q-spinner size="20em" :thickness="1" color="primary"></q-spinner>
		</q-inner-loading>
		<q-header class="cnx-border-bottom-light">
	    	<component v-for="child in uiprops.headerItems" :is="child.controlName" v-bind:uiprops="child" v-bind:model="model" ></component> 
		</q-header>
		  
		<q-footer > 
		<template v-if="user.tenantId === 'chatai'">
		<div v-if="isMinimized">
            <q-dialog @click.stop v-model="isMinimized" position="bottom-right" transition-hide="slide-up" persistent no-focus
                seamless transition-show="slide-down" transition-duration="200"
                style="z-index:20;position: fixed !important; bottom: 10px !important; right: 10px !important; top: auto !important; left: auto !important; margin: 0 !important; align-items: flex-end !important; justify-content: flex-end !important;">
                <q-card
                  style="position: fixed; bottom:50px; right:10px; width: 200px; height: 50px; display: flex; align-items: center; justify-content: space-between !important; padding: 0 8px; border-radius: 15px;">                    <!-- Header with close button -->
                     <div>QTIS AI</div>
                    <div style="display: flex;">
                        <div>
                            <q-btn dense flat round :icon="isMinimized ? 'expand_less' : 'expand_more'" color="grey-7"
                                @click="toggleMinimize" />
                        </div>
                        <q-btn dense flat round icon="close" color="grey-7" @click="toggleChat" />
                    </div>
                </q-card>

            </q-dialog>
        </div>
		</template>
		<template v-if="user.tenantId == 'chatai' && showChat">
		<div 
			:style="{
				height: isFullScreen ? '80vh' : '50vh',
				display: 'flex',
				flexDirection: 'column',
				backgroundColor: 'rgb(245, 245, 245)',
				alignItems: 'center'
			}"
			:class="messages.length === 0 ? 'justify-center' : ''"
			>
            <!-- Header with close button -->
            <div style="position: absolute; top: 14px; right: 14px; display: flex;">
				<div>
                    <q-btn dense flat round :icon="isFullScreen ? 'fullscreen_exit' : 'fullscreen'" color="grey-7"
                        @click="toggleFullScreen" />
                </div>
                <div>
                    <q-btn dense flat round :icon="isMinimized ? 'expand_less' : 'expand_more'" color="grey-7"
                        @click="toggleMinimize" />
                </div>
                <div>
                    <q-btn dense flat round icon="delete" color="grey-7" @click="clearChat" />
                </div>
                <q-btn dense flat round icon="close" color="grey-7" @click="toggleChat" />
            </div>
            <!-- Messages -->
            <q-card-section v-show="messages.length" style="flex: 1; overflow-y: auto; width:70%" ref="chatContainer">
                <template v-for="(msg, index) in messages" :key="index">

                    <!-- User message -->
                    <div v-if="msg.from === 'user'" class="custom-msg"
                        style="display: flex; align-items: flex-end; justify-content: flex-end; margin-bottom: 8px; margin-left:40px">
                        <q-chat-message text-color="white" sent bg-color="grey-6" style="max-width: max-content;
                         margin: 0;
                         border-radius: 10px !important;
                         min-width: 50px;
                         line-height: 1.2 !important;
                         padding-top: 0px !important;
                         min-height: auto !important;"
                         >
                            <div v-html="msg.text"></div>
                        </q-chat-message>
                    </div>

                    <!-- Bot message -->
                    <div v-if="msg.from === 'bot'" class="custom-msg"
                        style="display: flex; align-items: flex-end; justify-content: flex-start; margin-bottom: 8px; margin-right: 40px;">
                        <q-chat-message bg-color="white" text-color="black" style="max-width: max-content;
                         margin: 0;
                         border-radius: 10px !important;
                         min-width: 50px;
                         line-height: 1.2 !important;
                         padding-top: 0px !important;
                         min-height: auto !important;"
						 >
                            <template v-if="msg.isLoading">
                                <q-spinner-dots size="1rem" />
                            </template>
                            <template v-else>
                                <div v-html="msg.text"></div>
                            </template>
                        </q-chat-message>
                    </div>

                </template>

            </q-card-section>

            <!-- Quick Access -->
			<div v-if="messages.length === 0" style="width:70%; text-align:center; margin-bottom:8px;">
                <h5 style="margin:0; color:#212121; font-weight:bold; display:inline-block;">QTIS AI Assistant</h5>
            </div>
            <q-card v-show="!isMinimized"
                style="padding-left: 20px; color:#0d4f8a; box-shadow: none; background-color: transparent;">
                <q-card-actions align="center" style="flex-wrap: wrap;">
                    <q-btn outline rounded color="primary" style="margin:2px" size="sm" :loading="aiAssistUserLoading"
                        :disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading"  @click="getAiAssist('users')">
						<q-icon name="add" class="q-mr-none" /> <!-- No spacing -->
						User
                    </q-btn>
                    <q-btn outline rounded color="primary" style="margin:2px" size="sm" :loading="aiAssistClientLoading"
                        :disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading" @click="getAiAssist('clients')">
						<q-icon name="add" class="q-mr-none" /> <!-- No spacing -->
						Client
                    </q-btn>
                    <q-btn outline rounded color="primary" style="margin:2px" size="sm" :loading="aiAssistNoteLoading"
                        :disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading" @click="getAiAssist('notepad')">
						<q-icon name="add" class="q-mr-none" /> <!-- No spacing -->
						Notes
                    </q-btn>
                    <q-btn outline rounded color="primary" style="margin:2px" size="sm" :loading="aiAssistCaseLoading"
                        :disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading" @click="getAiAssist('cases')">
						<q-icon name="add" class="q-mr-none" /> <!-- No spacing -->
						Case
                    </q-btn>
                </q-card-actions>
            </q-card>
            <q-card-section v-if="attachedFiles.length" class="q-pt-none">
                <div class="row" style="gap:6px; flex-wrap:wrap;">
                    <q-chip v-for="(f, idx) in attachedFiles" :key="idx" outline removable
                        @remove="removeFile(idx)" text-color="grey-7" size="sm" :label="f.filename">
                    </q-chip>
                </div>
            </q-card-section>

            <!-- Chat input (composer) -->
            <q-card-actions align="center" class="q-pa-sm bg-grey-2 custom-field"
                style="gap:6px; border-top:1px solid #eee; width:70%">
                <q-input outlined dense autogrow rounded class="col" v-model="newMessage" placeholder="What would you like Qtis assist to help with…"
                    @keyup.enter="sendMessage(newMessage)" :input-style="{ maxHeight: '120px', overflowY: 'auto' }">
                    <div style="flex:0 0 auto;">
                        <q-btn color="grey-7" flat icon="add" @click="$refs.fileInput.click()" />
                    </div>

                    <!-- Hidden File Input -->
                    <input type="file" ref="fileInput" style="display:none" accept=".xls,.xlsx,.pdf,.doc,.docx,.txt,.csv"
                        multiple @change="handleFileUpload" />
                    <!-- Right slot (send icon inside input) -->
                    <template v-slot:after>
                        <q-icon 
                    	    name="send"
                            :class="[newMessage.trim() ? 'text-blue-9' : 'text-grey-5']"
                    	    :disabled="!newMessage.trim()"
                            :loading="false"
                            @click="newMessage.trim() && sendMessage(newMessage)"
                        />
					</template>
                </q-input>
            </q-card-actions>
        </div>
		</template>
			<cnx-footerInfo v-if="moduleName == 'qtisweb'"></cnx-footerInfo>
			
			<template v-if="false">
			   <q-toolbar dense class="bg-grey-10">
				
				<q-toolbar-title>
					<component v-for="child in uiprops.footerItems" :is="child.controlName" v-bind:uiprops="child" v-bind:model="model" ></component>
					
				</q-toolbar-title>
				
				<cnx-footerControls v-bind:showlogo="uiprops.showLogo"> </cnx-footerControls>
				
			   </q-toolbar>
				
			   <q-page-sticky position="bottom" :offset="[0, 2]" style="z-index:999;margin-bottom:-40px !important;" v-if="!uiprops.hideAugmentedInputs">
					<q-btn  class="q-mr-xs" round icon="filter_center_focus" color="blue"  size="18px" v-if="!uiprops.hideQRInput" @click="startQRInput()"></q-btn>
				<!-- 	<q-btn  class="q-mr-xs" round icon="camera_alt" color="blue"  size="18px" v-if="!uiprops.hideQRInput" @click="startImageCapture()"></q-btn> -->
					<q-btn  outline1 round icon="keyboard_voice"  :color="voiceBtnController ? 'light-green' : 'grey'" size="18px" v-if="!uiprops.hideVoiceInput" @click="toggleVtoT()"></q-btn>
					<q-btn  outline1 round icon="camera_alt" color="blue" size="18px" v-if="!uiprops.hideICInput" @click="imageCapture()"> </q-btn>
					<!-- <q-btn  color="primary" rounded class="full-width" size="md" label="Clear" size="18px" v-if="!uiprops.hideClrInput" @click="clearFunc()"> </q-btn> -->
			  </q-page-sticky>
			  <q-page-sticky v-if="!uiprops.hideAugmentedInputs" position="bottom-right" :offset="[0, 2]" style="z-index:999;margin-bottom:-40px; margin-right:150px !important;">
					<q-btn  color="blue" size="18px" round icon="refresh"  @click="clearFunc()"> </q-btn>
			  </q-page-sticky>
			  <q-dialog v-model="showQRDialog" persistent>
				  <q-card>
					<q-card-section class="row items-center">
					 <div><video id="qr" style="color:rgba(0,0,0,0);display: inline-block; width: 500px; height: 500px;"></video></div>
					  <!-- <q-avatar  color="primary" text-color="white" /> -->
					  <!-- <span class="q-ml-sm">You are currently not connected to any network.</span> -->
					  
					</q-card-section> 

					<q-card-actions align="right">
					  <q-btn flat label="Close" color="primary" @click="stopQRScanner()" v-close-popup />
					 <!-- <q-btn flat label="Proceed" color="primary" v-close-popup /> -->
					</q-card-actions>
				   
				  </q-card>
			  </q-dialog>
			</template>
			
			
			<!-- THIS IS FOR IMAGE CAPTURE DIALOG -->
	    
	      
	    </q-footer>
	     
		<q-page-container >
		  <q-page  :class="theme.page" >
		  	<div class="row justify-center">
		  	<div class="col-12 col-md-12">
			<template v-for="child in uiprops.children">
				<component :is="child.controlName" v-bind:uiprops="child" v-bind:model="model" ></component>
			</template>
			
			</div>
			</div>

			<cnx-user-profile-settings></cnx-user-profile-settings>
	      
		  </q-page>
		</q-page-container>
		</q-layout>
	</template>`,
	extends: baseComponent,
	data() {
		return {
			showLoader: false,
			isChatOpen: false,
			isMinimized: false,
			showChat: false,
			chatContainer: null,
			showIcon: true,
			unreadCount: 1,
			newMessage: '',
			attachedFiles: [], // store multiple uploaded files
			messages: [],
			aiAssistUserLoading: false,
			aiAssistClientLoading: false,
			aiAssistCaseLoading: false,
			aiAssistNoteLoading: false,
			selectedType: null,
			fileSummary: null,
			isFullScreen: false,
		}
	},
	computed: {
		showQRDialog: {
			get: function () {
				var show = this.uistate.showQRDialog;
				return this.updateToggle ? show : show;
			},
			set: function (show) {
				this.uistate.showQRDialog = show;
				this.updateToggle = !this.updateToggle;
			}
		},
		showICDialog: {
			get: function () {
				var capt = this.uistate.showICDialog;
				return this.updateToggle ? capt : capt;
			},
			set: function (capt) {
				this.uistate.showICDialog = capt;
				this.updateToggle = !this.updateToggle;
			}
		},
		voiceBtnController: {
			get: function () {
				var state = this.uistate.voiceBtnController;
				return this.updateToggle ? state : state;
			},
			set: function (state) {
				this.uistate.voiceBtnController = state;
				this.updateToggle = !this.updateToggle;
			}
		}
	},
	created() {
		this.$root.registerEventListener("chat-opened", this); // 👈 register listener
		var loginLoader = localStorage.getItem('loginLoader');
		if (loginLoader) {
			this.showLoader = true;
			setTimeout(() => {
				this.showLoader = false;
				localStorage.setItem('loginLoader', '');
			}, 3500);
		}
	},
	methods: {

		/******************	QR SCANNING	******************/
		onLoad() {
			this.$root.registerEventListener("onLoadingStatusUpdate", this);
		},

		notifyEvent(event, eventData) {
			if (event === "chat-opened") {
				console.log("✅ Chat opened event received in cnx-page", eventData);
				this.showChat = true;
				this.isMinimized = false;
			}
		},
		startQRInput() {
			this.showQRDialog = true;
			setTimeout(this.showQRScanner, 300);
		},
		showQRScanner() {
			startQRScanner(this.handelQRInput);
		},
		handelQRInput(content) {
			stopQRScanner();
			this.showQRDialog = false;
			console.log('SCANNED QR ! ');
			//var activeElement = window.document.activeElement;//this.uistate.activeElement;
			console.log('DATA IS : ' + content);

			var activeElement = window.document.activeElement;
			//this.uistate.activeElement;

			var focused = this.$root.getGlobalComponent("focusedInput");
			if (focused) {
				focused.fieldValue = content;
				focused.handleEvent("onchange");

			}
			else {
				var qrInput = this.$root.getGlobalComponent("qrInput");
				if (qrInput) {
					qrInput.fieldValue = content;
					qrInput.handleEvent("onchange");
				}
			}
			console.log('QR SCANNED!');
			//	delete this.uistate.activeElement;
		},
		stopQRInput() {

			stopQRScanner(this.handelQR1Input);

		},
		handelQR1Input() {
			console.log('STOPPED..');
		},

		/******************	VOICE TO TEXT CONVERSION	******************/

		toggleVtoT() {

			this.voiceBtnController = !this.voiceBtnController;
			if (this.voiceBtnController) {
				setTimeout(this.startVoiceToText(), 300);
			}
			else {
				this.stopVoiceToText();
			}

		},
		startVoiceToText() {

			//this.uistate.voiceInputType = inputType;
			startSpeechRecognition(this.handleVoiceInput);

		},

		handleVoiceInput(event) {

			//stopSpeechRecognition();
			//this.voiceBtnController = false; 

			console.log('LISTENED YOUR RESPONSE... ');

			var interimTranscripts = ''; // Interim transcripts used to store the converted text.

			var finalTranscripts = '';

			for (var i = event.resultIndex; i < event.results.length; i++) {
				var transcript = event.results[i][0].transcript;
				transcript.replace("\n", "<br>");
				if (event.results[i].isFinal) {
					finalTranscripts += transcript; //if the result is final, then add to final result else add to interim result
				} else {
					interimTranscripts += transcript;
				}
			}

			//var activeElement = window.document.activeElement;//this.uistate.activeElement;


			if (finalTranscripts && finalTranscripts.trim()) {
				var focused = this.$root.getGlobalComponent("focusedInput");
				if (focused) {
					focused.fieldValue = finalTranscripts.trim();
					focused.handleEvent("onchange");
				}
				else {
					var voiceInput = this.$root.getGlobalComponent("voiceInput");
					if (voiceInput) {
						voiceInput.fieldValue = finalTranscripts.trim();
						voiceInput.handleEvent("onchange");
					}
				}

				//delete this.uistate.activeElement;
				//console.log(JSON.stringify(voiceEvent));
			}
		},
		stopVoiceToText() {

			stopSpeechRecognition();
			this.voiceBtnController = false;
			console.log('STOPPED.')

		},

		/******************	IMAGE CAPTURE PROCESSING	******************/

		imageCapture() {
			this.showICDialog = true;
			//this.showLoading();
			setTimeout(this.showICScanner, 10);
		},
		showICScanner() {
			Webcam.attach('#ic');
			//take_snapshot(this.handelICInput);
		},
		takeIC() {
			this.showLoading();
			setTimeout(take_snapshot(this.handelICInput), 300);

		},
		handelICInput(image) {
			console.log(image);
			var img;
			var result = [];
			var max = "";
			for (field in image) {
				if (field != "time") {
					img = image[field];
					result = img;
				}
			}

			var activeElement = window.document.activeElement;
			//this.uistate.activeElement;

			var focused = this.$root.getGlobalComponent("focusedInput");
			if (focused) {
				focused.fieldValue = result;
				focused.handleEvent("onchange");

			}
			else {
				var icInput = this.$root.getGlobalComponent("voiceInput");
				if (icInput) {
					icInput.fieldValue = result;
					icInput.handleEvent("onchange");
				}
			}

			console.log('Image Captured!');
			Webcam.reset();
			this.showICDialog = false;
		},
		stopICScan() {
			//this.showICDialog = false;
			Webcam.reset();
			console.log('STOPPED');

		},
		showLoading() {
			this.$q.loading.show()
			// hiding in 1s
			this.timer = setTimeout(() => {
				this.$q.loading.hide()
				this.timer = void 0
			}, 1000)
		},
		beforeDestroy() {
			if (this.timer !== void 0) {
				clearTimeout(this.timer)
				this.$q.loading.hide()
			}
		},
		clearFunc() {

			var focused = this.$root.getGlobalComponent("focusedInput");
			if (focused) {
				focused.fieldValue = "";
				focused.handleEvent("onchange");

			}
			else {
				var icInput = this.$root.getGlobalComponent("voiceInput");
				if (icInput) {
					icInput.fieldValue = "";
					icInput.handleEvent("onchange");
				}
			}
			//this.imageCapture();

		},
		clearChat() {
			this.messages = [];
			this.newMessage = '';
			this.attachedFiles = [];
		},
		async getAiAssist(selectedType) {
			this.selectedType = selectedType;
			if (selectedType === 'users') {
				this.aiAssistUserLoading = true;
			} else if (selectedType === 'clients') {
				this.aiAssistClientLoading = true;
			} else if (selectedType === 'cases') {
				this.aiAssistCaseLoading = true;
			} else if (selectedType === 'notepad') {
				this.aiAssistNoteLoading = true;
			}
			// store index of the bot message or API
			const formattedMessages = this.messages.map(m => {
				if (m.from === 'user' && !m.isFile) return { role: 'user', content: m.text };
				if (m.from === 'bot' && !m.isLoading) return { role: 'assistant', content: m.text };
				return null; // skip loading placeholders
			}).filter(Boolean);
			console.log('Formatted Messages for AI Assist:', formattedMessages);
			if (this.fileSummary && this.fileSummary.trim() !== 'YES') {
				const prompt = `Prompt:
						You are given the following entities that can be created, each with their respective fields:
						users → { firstName, lastName, email, phoneNumber, address }
						clients → { firstName, lastName, middleName, streetAddress, company, homePhone, cellPhone, email, dateOfBirth, DL }
						cases → { client, caseType, lawyer, country, caseNumber, status (ACTIVE, INACTIVE, COMPLETED), startDate, endDate, mileRateCost, notes, insuranceClaim - either 1 or 0 - default is 0 }
						FileImportMap → { mappingName, entityMapping, mappingEntityId }
						notepad → { notes }
						You will receive a natural language message. Your task is to:
						Identify fields that can be extracted to create the entity ${selectedType}.
						Extract the relevant fields and values from the below message.
						Message: ${this.fileSummary}.
						Return only one entity that is asked with fields data.
						example output:
								{
									"type": "users",
									"fields": {
										"firstName": "John",
										"lastName": "Doe",
										"email": "john.doe@example.com"
									}
								}
						Preserve conversation context. see the previous messages for context.`;

				const parameters = {
					messages: [
						{
							"role": "system",
							"content": "You are an assistant that extracts entities and their fields from a given message and returns them in a structured JSON format. \
					  Identify which entity or entities need to be created based on the message. \
					  Extract the relevant fields and values from the message. \
					  Return the result as a JSON object."
						},
						{ role: 'user', content: prompt }
					],
					files: [],
					summarizeFiles: false,
					temperature: 0,
					max_tokens: 0
				};
				executeAppAPI("chataiapi", { input: parameters }, null, this.handleAiAssist);
			} else {
				this.openEntityForm({
					type: this.selectedType,
					fields: {}
				})
			}
		},
		handleAiAssist(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				const contents = data?.choices?.[0]?.message?.content;
				try {
					this.parsedEntities = JSON.parse(contents);
					console.log('AI Assist Result 1--------->', this.parsedEntities);
					if (this.parsedEntities.type === this.selectedType) {
						this.openEntityForm(this.parsedEntities);
						this.parsedEntities = [];
					} else {
						this.openEntityForm({
							type: this.selectedType,
							fields: {}
						})
					}
				} catch (error) {
					this.openEntityForm({
						type: this.selectedType,
						fields: {}
					})
				}
			}
		},
		openEntityForm(entity) {
			console.log('AI Assist Result 2--------->', entity);
			if (entity.type === 'users') {
				this.aiAssistUserLoading = false;
			} else if (entity.type === 'clients') {
				this.aiAssistClientLoading = false;
			} else if (entity.type === 'cases') {
				this.aiAssistCaseLoading = false;
			} else if (entity.type === 'notepad') {
				this.aiAssistNoteLoading = false;
			}
			var widgetEntityForm = app.getGlobalComponent("widgetEntityForm");
			var record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX" }
			if (entity.type === 'users') {
				record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX", FirstName: entity.fields.firstName, LastName: entity.fields.lastName, Username: ((entity.fields.firstName || '') + ' ' + (entity.fields.lastName || '')).trim(), Email: entity.fields.email, Phone: entity.fields.phoneNumber, Address: entity.fields.address }
				widgetEntityForm.newForm(this, record, "System Users - New", record.entityId, "new");
			} else if (entity.type === 'clients') {
				record = { rowState: 1, entityId: "c6l186nAXRsP4uaQ2Y8GWNfW", MiddleName: entity.fields.middleName, firstname: entity.fields.firstName, lastname: entity.fields.lastName, StreetAddress: entity.fields.streetAddress, Company: entity.fields.company, HomePhone: entity.fields.homePhone, CellPhone: entity.fields.cellPhone, Email: entity.fields.email, DOB: entity.fields.dateOfBirth, DL: entity.fields.DL }
				widgetEntityForm.newForm(this, record, "Clients - New", record.entityId, "new");
			} else if (entity.type === 'FileImportMap') {
				record = { rowState: 1, entityId: "c2anoaNGE7iR52IbRJ51VGyS1", EntityMapping: entity.fields.entityMapping, MappingName: entity.fields.mappingName, MappingEntityId: entity.fields.mappingEntityId }
				widgetEntityForm.newForm(this, record, "File Import Map - New", record.entityId, "new");
			} else if (entity.type === 'notepad') {
				record = { rowState: 1, entityId: "cAoaWa4xLQIjV5HwBEXzWYGUl", comments: entity.fields.notes }
				widgetEntityForm.newForm(this, record, "Notepad - New", record.entityId, "new");
			} else if (entity.type === 'cases') {
				record = {
					rowState: 1, entityId: "cQ8lzxq3MBU8xUpQGlW4EeSl", MileRateCost: entity.fields.mileRateCost, StartDate: entity.fields.StartDate,
					EndDate: entity.fields.EndDate, NotesPrimeNotes: entity.fields.notes, CaseNumber: entity.fields.caseNumber, CaseType: entity.fields.caseType,
					Country: entity.fields.country, Lawyer: entity.fields.lawyer, "relations.client.displayValue": entity.fields.client,
					CaseStatus1: entity.fields.caseStatus, InsuranceClaim: entity.fields.insuranceClaim
				}
				widgetEntityForm.newForm(this, record, "Cases - New", record.entityId, "new");
			}
		},
		toggleChat() {
			this.showChat = false;
			this.isMinimized = false;
		},
		toggleFullScreen() {
			this.isFullScreen = !this.isFullScreen;
		},
		toggleMinimize() {
			this.isMinimized = !this.isMinimized;
			this.showChat = !this.isMinimized;
			console.log("-----------", this.isMinimized, this.showChat)
		},
		handleFileUpload(event) {
			if (this.attachedFiles.length + event.target.files.length > 3) {
				alert("You can upload a maximum of 3 files.");
				return;
			}
			const files = Array.from(event.target.files);
			const allowedTypes = [
				"application/vnd.ms-excel",
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
				"application/pdf",
				"image/png",
				"image/jpeg"
			];

			files.forEach(file => {
				if (!allowedTypes.includes(file.type)) {
					alert(`Invalid file type: ${file.name}`);
					return;
				}

				const reader = new FileReader();
				reader.onload = () => {
					const base64Data = reader.result.split(",")[1];
					this.attachedFiles.push({
						data: base64Data,
						filename: file.name,
						mimeType: file.type
					});
				};
				reader.readAsDataURL(file);
			});

			// Allow selecting the same file again
			this.$refs.fileInput.value = '';
		},
		removeFile(index) {
			this.attachedFiles.splice(index, 1);
		},
		async sendMessage(quickQuestion = '') {
			// Check for quick question commands
			quickQuestion = quickQuestion.toLowerCase();
			// Example: "create user", "add client"
			// Open corresponding form based on command
			// Reset input field after processing command
			// If no command, proceed with normal message sending
			// Check for quick question commands
			if ((quickQuestion.includes("create") || quickQuestion.includes("add")) &&
				(quickQuestion.includes("user") || quickQuestion.includes("client") || quickQuestion.includes("case") || quickQuestion.includes("note"))) {
				const type = quickQuestion.includes("user") ? 'users' :
					quickQuestion.includes("client") ? 'clients' :
						quickQuestion.includes("case") ? 'cases' :
							quickQuestion.includes("note") ? 'notepad' : '';
				this.openEntityForm({ type: type, fields: {} });
				this.newMessage = '';
			} else {
				if (quickQuestion !== '') {
					this.newMessage = quickQuestion;
				}
				const msg = this.newMessage.trim();
				if ((!msg || msg === '') && !this.attachedFiles.length) return;

				// Push user message
				if (msg) {
					this.messages.push({ from: 'user', text: msg, isLoading: false });
				}
				if (this.attachedFiles.length) {
					this.fileSummary = "YES";
					this.attachedFiles.forEach(file => {
						this.messages.push({ from: 'user', text: `[📎 ${file.filename}]`, isLoading: false, isFile: true });
					});
				}
				this.$nextTick(() => this.scrollToBottom());
				this.newMessage = '';
				// Add bot "typing" spinner message
				this.botIndex = this.messages.push({
					from: 'bot',
					text: '',
					isLoading: true
				}) - 1;
				this.$nextTick(() => this.scrollToBottom());
				// Push bot loading message
				// store index of the bot message or API
				const formattedMessages = this.messages.map(m => {
					if (m.from === 'user' && !m.isFile) return { role: 'user', content: m.text };
					if (m.from === 'bot' && !m.isLoading) return { role: 'assistant', content: m.text };
					return null; // skip loading placeholders
				}).filter(Boolean);
				console.log("formattedMessages", formattedMessages);

				var parameters = {
					messages: [
						{
							"role": "system",
							"content": this.attachedFiles.length == 0 ? `You are Iris, You are a friendly, 
						helpful assistant for QTIS application. You help users navigate the site, answer FAQs, 
						and guide them to relevant pages. If you don't know something, say you don't know instead of making things up. 
						say you are assistant to the users chatting with you, providing responses with proper alignment, 
						spaces in more readable format which can be interpretted in HTML. 
						You are not just a computer program. Always respond in pure HTML format using <b> for bold and <br> for line breaks.
						Never use Markdown and preserve conversation context. 
						see the previous messages for context. Give good detailed answer not just one line` :
								`You are an AI assistant that analyzes uploaded case files for investigators.
								Your job:
								1. Read the provided file metadata and content.
								2. Summarize the file in 2–3 sentences.
								3. Highlight important entities, keywords, and phrases using <b>…</b> tags for emphasis.
								4. Assign relevant tags (short keywords, max 8).
								5. Suggest one or more categories from this predefined taxonomy:
								- Suspect Statement
								- Witness Statement
								- Vehicle Evidence
								- Financial Record
								- Phone Record
								- Weapon Evidence
								- General Document
								6. Provide the output as clean HTML (no extra commentary) that can be directly displayed in a chat response.

								HTML layout must contain:
								- A summary with <b>highlighted</b> terms.
								- <br> for line breaks
								- A tag section (inline chips or comma-separated).
								- A category section with suggested categories.
								- Optional confidence scores.

								Do not output JSON. Only HTML with highlights and sections.
								Preserve conversation context. see the previous messages for context.`
						},
						...formattedMessages
					],
					files: this.attachedFiles,
					summarizeFiles: false,
					temperature: 0,
					max_tokens: 0
				};
				executeAppAPI("chataiapi", { input: parameters }, null, this.handleResult);
				this.attachedFiles = []; // Clear files after sending
			}
		},
		handleResult(response) {
			if (response.status == 'OK') {
				console.log("response", JSON.parse(response.result));
				const data = JSON.parse(response.result);
				const reply = data?.choices?.[0]?.message?.content || "No reply received.";
				// ✅ Update the same object so Vue detects changes
				if (this.fileSummary === "YES") {
					this.fileSummary = reply;
				}
				this.messages[this.botIndex].text = reply;
				this.messages[this.botIndex].isLoading = false;
				console.log("message array", this.messages)
			} else {
				console.error('Error calling API:', err);
				this.messages[botIndex] = { from: 'bot', text: 'Sorry, there was an error processing your request.', isLoading: false };
			}
			this.$nextTick(() => this.scrollToBottom());
		},
		scrollToBottom() {
			const container = this.$refs.chatContainer?.$el;
			if (container) {
				container.scrollTop = container.scrollHeight;
			}
		}
	}
});

Vue.component('cnx-mininavmenu', {
	template: `<template >
			
			<q-drawer  :content-class="theme.drawer + ' ' + uiprops.styleClasses" :dark="theme.isDark" 
			    fixed :mini="miniState" 
			    @mouseover="miniState = false"
			    @mouseout="miniState = true"
			    mini-to-overlay :width="250"
			    app :key="updateToggle" v-model="uiprops.visible">
				
				<q-scroll-area class="fit" >
			   		<q-list padding :dark="theme.isDark" :class="uiprops.styleClasses">
			   			<q-item clickable @click.stop="handleNavMenuClick({url:webModule.homePage});">
					   		<q-item-section avatar>
								<q-icon name="home"  :size="uiprops.iconSize" ></q-icon>
							</q-item-section>
							<q-item-section>
								{{ $root.getLocalizedLabel('home') }}
							</q-item-section>
						</q-item>
						<template v-for="menuItem in uiprops.menu" >
				   			<q-item  clickable @click.stop="handleNavMenuClick(menuItem);"
				   				v-if="menuItem.visible && !menuItem.hasChildren">
						   		<q-item-section avatar>
									<q-icon :name="menuItem.icon" :size="uiprops.iconSize" :title="$root.getLocalizedLabel(menuItem.label)"></q-icon>
								</q-item-section>		
								<q-item-section>
									{{ $root.getLocalizedLabel(menuItem.label) }}
								</q-item-section>	   				
				   			</q-item>
				   			<q-item  clickable 
				   				v-if="menuItem.visible && menuItem.hasChildren">
						   		<q-item-section avatar>
									<q-icon :name="menuItem.icon"  :size="uiprops.iconSize" :title="$root.getLocalizedLabel(menuItem.label)">
									</q-icon>
								</q-item-section>
								<q-item-section>
									{{ $root.getLocalizedLabel(menuItem.label) }}
								</q-item-section>
								<q-menu :offset="uiprops.subMenuOffset" >
								          <q-list style="min-width: 100px" :class="uiprops.styleClasses">
								            	<q-item :dense="uiprops.denseMenu" clickable 
								            		v-ripple dark class="q-pl-xs list-menu" v-if="mchild.visible"
						  					  		v-for="mchild in menuItem.children" 
						  					  		@click.stop="handleNavMenuClick(mchild);">
											  			<q-item-section avatar class="q-pl-lg">
										            		<q-icon :name="mchild.icon" ></q-icon>
										          		</q-item-section>
					 
											          <q-item-section>
											          	{{ $root.getLocalizedLabel(mchild.label) }}
											          </q-item-section>
										        </q-item> 
								          </q-list>
								        </q-menu>			   				
				   			</q-item>
			   			</template>
					</q-list>
			   	</q-scroll-area>
			</q-drawer>

		</template>`,
	extends: baseComponent,
	data: function () {
		return {
			miniState: true
		}
	},
	methods: {
		onLoad() {
			this.$root.registerEventListener("permissionsChanged", this);
		},
		notifyEvent(event, eventData) {
			if (event == "permissionsChanged") {
				loadWebModulePermissions();
				this.updateToggle = !this.updateToggle;
			}
		}
	}
});

var parentMenu = false;
var activeMenu = '';

Vue.component('cnx-navmenu', {
	template: `<template id="cnx-navmenu">   
		<div class="full-width">
		
		<div v-if="uiprops.logo" :style="'width:100%;' + uiprops.logoStyle" class="sidebar-logo">
			<img :src="checkLogo(uiprops.logo)" width="100%" class=""></img>
		</div>
		 
		<q-list dark no-border class="bg-transparent" :key="updateToggle"> 
			<!--<q-item icon="home" clickable v-ripple dark  @click.stop="handleNavMenuClick({url:webModule.homePage}); if (uiprops.closeOnClick) { toggleNavMenu(); }">
					    
				<q-item-section avatar>
					<q-icon name="home" ></q-icon>
				</q-item-section>
				  
				<q-item-section>Home</q-item-section>
			</q-item>-->
						 
			<template v-for="item in uiprops.menu" v-if="item.visible" style="height:85vh"> 
				<template v-if="item.label.default != 'Top Bar Icons'">
					<q-expansion-item :dense="uiprops.denseMenu" group="navmenu" class="bg-transparent" 
						:value="CheckOpenState(item.opened)" :id="'menu_' + item.id" 
						:icon="item.icon" :label="getMenuLabel($root.getLocalizedLabel(item.label))"  
						v-if="item.visible && item.hasChildren && item.label.default != 'Home'" v-model="otherMenuExpanded[item.id]" @click="CheckMenuItem(item)"> 
						<q-list :dense="uiprops.denseMenu" class="bg-black" no-border>  
							<q-item :dense="uiprops.denseMenu" clickable v-ripple dark class="q-pl-xs list-menu" v-if="mchild.visible" :class="checkActiveClass(mchild)" 
							v-for="mchild in item.children" @click.stop="handleNavMenuClick(mchild); item.opened = true; parentMenu = false; GetActivemenu(mchild); if (uiprops.closeOnClick || $q.screen.lt.md) { toggleNavMenu(); }">
								<q-item-section avatar class="q-pl-lg">
										<q-icon :name="mchild.icon" ></q-icon>
								</q-item-section>
								<q-item-section>
								{{ getMenuLabel($root.getLocalizedLabel(mchild.label)) }}
								</q-item-section>
							</q-item> 
						</q-list> 
					</q-expansion-item>
					<q-item v-if="item.visible && (!item.hasChildren || item.label.default == 'Home')" class="list-menu" :class="checkActiveClass(item)" :id="'menu_' + item.id" :icon="item.icon" clickable v-ripple dark  @click.stop="handleNavMenuClick(item); otherMenuExpanded = {}; formMenuExpanded = false; parentMenu = true; GetActivemenu(item); if (uiprops.closeOnClick) { toggleNavMenu(); }">
						<q-item-section avatar>
							<q-icon :name="item.icon" ></q-icon>
						</q-item-section>
						<q-item-section>{{ getMenuLabel($root.getLocalizedLabel(item.label)) }}</q-item-section>
					</q-item>
				    <q-item-separator ></q-item-separator>
				</template>   
			</template>
		</q-list>
		<template v-if="user.tenantId == 'chatai'">
			<div ref="chatBtn"
				style="z-index:10;position: fixed; bottom: 20px; right: 40px; z-index: 9999; animation: fadeDark 2s infinite ease-in-out;">
				<img src="https://res.cloudinary.com/dn7ejk1ei/image/upload/v1757864421/image_2_1_prdwfg.png" alt="Chatbot" @click="openChat"
				style="width: 200px; height: 100px; cursor: pointer;" />
				</q-btn>
			</div>
		</template>
		</div>
	</template>`,
	extends: baseComponent,
	data: function () {
		return {
			otherMenuExpanded: {},
			updateToggle: false,
		}
	},
	created() {
		loadWebModulePermissions();
		this.updateToggle = !this.updateToggle;
		this.$root.registerEventListener("settingsLabelChange", this);
		this.$root.registerEventListener("navMenuItemClicked", this);
	},
	destroyed() {
		this.$root.removeEventListener("settingsLabelChange", this);
		this.$root.removeEventListener("navMenuItemClicked", this);
	},
	methods: {
		openChat() {
			this.$root.emitEvent("chat-opened", { from: "navmenu" });
		},
		CheckMenuItem(item) {
			if (Object.keys(this.otherMenuExpanded).length > 0) {
				var menuId = "menu_" + item.id;
				var ids = this.otherMenuExpanded.hasOwnProperty(menuId);
				if (ids.includes(menuId)) {
					this.otherMenuExpanded = {};
				} else {
					this.otherMenuExpanded = {};
					this.otherMenuExpanded[menuId] = true;
				}
			}
		},
		checkActiveClass(item) {
			var activeClass = '';
			var url = "#" + item.url
			if (url && url == window.location.hash) {
				if (item.parentId) {
					this.otherMenuExpanded[item.parentId] = true;
				}
				activeClass = "active-menu";
			} else if (item.parentId && item.parentId == "clientbilling" && window.location.hash == "#cn6LdWeG8PtNgIQpe2e3W3CQ" && activeMenu.parentId == item.parentId) {
				if (item.id == activeMenu.id) {
					activeClass = "active-menu";
				}
			} else if (item.parentId && item.parentId == "admintimesheet" && window.location.hash == "#cazBGANNKkf6lu65021ekZsYZ") {
				activeClass = "active-menu";
			} else if (item.id == "home" && window.location.hash == '#cR5xGWEV82sVIwNd0dPgpuP') {
				activeClass = "active-menu";
			} else if (item.parentId && item.parentId == "help" && item.id == activeMenu.id) {
				activeClass = "active-menu";
			}

			if (item.hasChildren) {
				for (var i = 0; i < item.children.length; i++) {
					var childurl = "#" + item.children[i].url;
					activeClass = '';
					if (childurl && childurl == window.location.hash) {
						activeClass = "active-menu";
					}
				}
			}
			return activeClass;
		},
		SetActiveMenu() {
			setTimeout(() => {
				var ActiveMenuIndex = 0;
				for (var i = 0; i < this.uiprops.menu.length; i++) {
					var menu = "#" + this.uiprops.menu[i].url;
					if (menu == window.location.hash) {
						ActiveMenuIndex = i;
					} else {
						if (this.uiprops.menu[i].children) {
							for (var c = 0; c < this.uiprops.menu[i].children.length; c++) {
								var submenu = "#" + this.uiprops.menu[i].children[c].url;
								if (submenu == window.location.hash) {
									if (parentMenu == false) {
										this.uiprops.menu[i].opened = true;
										ActiveMenuIndex = i;
									} else {
										this.uiprops.menu[i].opened = false;
									}
								} else {
									this.uiprops.menu[i].opened = false;
								}
							}
						}
					}
				}
				this.uiprops.menu[ActiveMenuIndex].opened = true;
				this.updateToggle = !this.updateToggle;
				this.uiprops.menu[ActiveMenuIndex].opened = true;
			}, 200);
		},
		CheckOpenState(val) {
			return val;
		},
		GetActivemenu(child) {
			activeMenu = child;
		},
		onLoad() {
			this.$root.registerEventListener("permissionsChanged", this);
		},
		notifyEvent(event, eventData) {
			if (event == "permissionsChanged") {
				loadWebModulePermissions();
				//this.updateToggle = !this.updateToggle;
			}
			if (event == "settingsLabelChange") {
				this.updateToggle = !this.updateToggle;
			}
			if (event == "navMenuItemClicked") {
				this.SetActiveMenu();
			}
		},
		getMenuLabel(label) {
			if (changeCaselabel) {
				label = label.replace(/\bCase\b/, "Project");
				label = label.replace(/\bcase\b/, "project");
			}
			return label;
		},
		checkLogo(logoPath) {
			var fileName = logoPath.substr(logoPath.lastIndexOf("/") + 1);
			var fileExt = fileName.split(".");
			var newfileName = fileExt[0] + "." + fileExt[1];
			var filePath = logoPath.replace(newfileName, "");
			var defaultLogo = (user && user.userDetails && user.userDetails.logo && user.userDetails.logo == 1) ? filePath + 'DemoLogo.png' : filePath + fileExt[0] + "-main." + fileExt[1];
			return defaultLogo;
		},
	}

});

Vue.component('cnx-account-menu', {
	template: `<template id="cnx-account-menu" class="account-sidebar">

		<div>
		<q-list :dark="!($root.theme.accountMenuLight)" no-border style="z-index:9999 !important">

		  					
							
		  					<q-separator ></q-separator>
							 
							<q-item :dark="!($root.theme.accountMenuLight)" class="row" link >
		  					    <q-item-section class="text-itallic">
							          	{{ $root.getLabel('Account')}}: {{ user.tenantName }}
							    </q-item-section>
		  					</q-item>
		  					
		  					<q-separator ></q-separator>
							
							<q-item :dark="!($root.theme.accountMenuLight)" class="row" link >
		  					    <q-item-section class="text-itallic">
							          	{{ $root.getLabel('Logged in as')}}: {{ user.username }} 
							    </q-item-section>
		  					</q-item>
		  					
		  					<q-separator ></q-separator>
		  					
		  					<q-item :dark="!($root.theme.accountMenuLight)" class="row" clickable @click="VersionLink(customizationFunctions.getVersionLink())" >
		  					    <q-item-section class="text-caption">
		  					    	{{ customizationFunctions.getVersionNo() }}								          	
							    </q-item-section>
		  					</q-item>

		  					<q-separator :dark="!($root.theme.accountMenuLight)" ></q-separator>

							<q-item :dark="!($root.theme.accountMenuLight)"  class="row" clickable 
								@click="$root.emitEvent('showSettings');">
								<q-item-section >
									{{ $root.getLabel('My Settings') }}
								</q-item-section>
							</q-item>

		  					<q-separator :dark="!($root.theme.accountMenuLight)" ></q-separator>
		  					 
							<q-item clickable :dark="!($root.theme.accountMenuLight)" class="row" link @click.native="logout">
		  						<q-item-section>
							          	{{ $root.getLabel('logout')}} 
							    </q-item-section>
		  					</q-item>
							
		  				</q-list>	

		  				</div>
		</template>
`,

	extends: uiComponent,
	methods: {
		logout() {
			this.$root.logout();
		},
		changePassword() {
			app.showChangePasswordDialog = true;

		},
		VersionLink(versionLink) {
			window.open(versionLink, '_blank');
		},
	}

});

Vue.component('cnx-user-profile-settings', {
	template: `<template id="cnx-user-profile-settings">
		<div>
			<q-dialog v-model="showSettingsDialog" content-class="cnx-modal" transition-show="fade" transition-hide="fade" persistent>  
				<q-card class="bg-white shadow-20 row" > 
					<q-card-section class="row full-width dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
						<span class="text-h6">{{ $root.getLabel('My Settings') }}</span>
					</q-card-section>
					<q-card-section  class="row  full-width items-center dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
						<div class="row full-width">
							<div class="row col-xs-12" v-for="setting in settings">
								<div class="col-xs-12 row q-mb-md" style="border-bottom:1px solid rgba(0,0,0,0.0);">
									<div class="col-xs-12 text-subtitle1">
										{{ setting.label }}
									</div>
									<div class="col-xs-12 " v-for="childSetting in setting.children">
										<q-toggle @input="updateSetting(childSetting)" :label="$root.getLabel(childSetting.label)" v-model="childSetting.value" v-if="childSetting.user == user && childSetting.type == 'boolean'"></q-toggle>
									</div>
								</div>
							</div>
							<div class="row col-xs-12">
								<template v-if="subTenantName == 'cpsubscription' && tabData && !tabData.error">
									<div class="col-xs-12 text-subtitle1">Admin</div>
									<div class="col-xs-12 row">
										<q-btn :label="$root.getLabel('Dashboard Access')" class="q-mt-md" color="blue" @click="$root.emitEvent('showDashboard'); showSettingsDialog = false;"></q-btn>
									</div>
									<div class="col-xs-12 row">
										 <q-btn :label="$root.getLabel('Cancel Subscription')" class="q-mt-md bg-red text-white" @click="$root.emitEvent('showDashboardCancel'); showSettingsDialog = false;"></q-btn>
									</div>
								</template>
							</div>
						</div>
					</q-card-section>
					<q-card-section  v-if="app.changePasswordState" class="row  full-width items-center dialog " style="border-bottom: 1px solid rgba(0,0,0,0.1)">
							<div class="col-xs-12 text-subtitle1">
								{{ $root.getLabel('Profile Settings') }}
							</div>
							<q-btn :label="$root.getLabel('Change Password')" class="q-mt-md" color="blue" @click="changePassword()"></q-btn>
					</q-card-section>
					<q-card-actions align="right" class="full-width row dialog">
						<q-btn flat v-close-popup >{{$root.getLabel('Close')}}</q-btn> 
					</q-card-actions>
				</q-card> 
			</q-dialog> 
								
			<q-dialog v-model="showDashboardDialog" content-class="cnx-modal subscription-dashboard" persistent transition-show="none" transition-hide="none" :maximized="$q.screen.lt.md" persistent :style="$q.screen.lt.md ? '' : 'min-width:1050px' ">  
				<q-card class="bg-white shadow-20 row" :style="$q.screen.lt.md ? 'width:100%;' : 'min-width:1050px'"> 
					<q-card-section class="row full-width dialog" style="border-bottom:1px solid rgba(0,0,0,0.1)">
						<q-toolbar :class="'bg-grey-- q-pl-md'"> 
							<q-toolbar-title class="text-h6 mr-5 align-center" floating>My Qtis Dashboard Account</q-toolbar-title>  
							<q-btn icon="close" size="md" flat v-close-popup id="close-dialog"></q-btn>
						</q-toolbar> 
					</q-card-section>
					<q-card-section  class="row  full-width items-center text-left dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
						<div class="row full-width">
							<q-splitter v-model="splitterModel" style="height: 250px; width:100%;">
								<template v-slot:before>
									<q-tabs v-model="tab" vertical class="text-blue-9 text-left">
										<q-tab v-for="tab in tabs" class="text-left" :name="tab.name" :label="tab.label"></q-tab>
									</q-tabs>
								</template>

								<template v-slot:after>
									<q-tab-panels v-model="tab" animated swipeable vertical transition-prev="jump-up" transition-next="jump-up" style="width: 80%;">
										<q-tab-panel v-for="tab in tabs" :name="tab.name">
											<template v-if="tab.name == 'dashboard'">
												<template v-if="tabData.error">
													<p class="text-center text-weight-bold">No data available</p>
												</template>
												<template v-else>
													<p class="text-weight-bold">Hello {{ tabData.email}}</p>

													<div class="col-md-12">
														<div class="row col-lg-12 col-12 account-widget-wrap ">
															<div class="col-12 concurrent account-widget">
																<div class="case-count">{{concurrentUser}}</div>
																<div class="widget-name">Concurrent users</div>
															</div>
															<div class="col-12 status account-widget">
																<div class="case-count text-capitalize">{{subscriptionRows[subscriptionRows.length - 1].status}}</div>
																<div class="widget-name">Status</div>
															</div>
															<div class="col-12 startdate account-widget">
																<div class="case-count">{{subscriptionRows[subscriptionRows.length - 1].start_date}}</div>
																<div class="widget-name">Start Date</div>
															</div>
															<div class="col-12 renewaldate account-widget">
																<div class="case-count">{{subscriptionRows[subscriptionRows.length - 1].payment_due_date}}</div>
																<div class="widget-name">Renewal Date</div>
															</div>
														</div>
													</div>
												</template>
											</template>
											<template v-if="tab.name == 'orders'">
												<div class="col-md-12">
													<template v-if="tabData.error">
														<p class="text-center text-weight-bold">No data available</p>
													</template>
													<template v-else>
														<div class="order-details col-md-12">
															<table>
																<thead>
																	<tr>
																		<th>Order ID</th>
																		<th>Date</th>
																		<th>Status</th>
																		<th>Next payment Date</th>
																		<th>Total</th>
																	</tr>
																</thead>
																<tbody>
																	<tr class="" v-for="row in orderRows" :key="row.id">
																		<td>{{ row.id }}</td>
																		<td>{{ row.date }}</td>
																		<td class="text-capitalize">{{ (row.status == 'processing') ? 'completed' : row.status }}</td>
																		<td>{{ row.payment_due_date }}</td>
																		<td>{{ row.total }}</td>
																	</tr>
																</tbody>
															</table>
														</div>
													</template>
												</div>
											</template>
											<template v-if="tab.name == 'address'">
												<div class="col-md-12 text-center">
													<template v-if="tabData.error">
														<p class="text-center text-weight-bold">No data available</p>
													</template>
													<template v-else>
														<p class="font-weight-bold text-h6">Billing Address</p>
														<p>{{tabData.billing.first_name }}, {{tabData.billing.last_name }}</p>
														<p>{{tabData.billing.address_1 }}</p>
														<p>{{tabData.billing.city }}, {{tabData.billing.state }}, {{tabData.billing.postcode }}</p>
													</template>
												</div>
											</template>
											<template v-if="tab.name == 'accountdetails'">
												<div class="col-md-12">
													<template v-if="tabData.error">
														<p class="text-center text-weight-bold">No data available</p>
													</template>
													<template v-else>
														<div class="flex items-center row col-md-12">
															<div class="col-md-6">
																<p class="font-weight-bold text-h6">Billing Address</p>
																<p><strong>First Name:</strong> {{tabData.first_name }}</p>
																<p><strong>Last Name:</strong> {{tabData.last_name }}</p>
																<p><strong>Display name:</strong> {{tabData.display_name }}</p>
																<p><strong>Email:</strong> {{tabData.email}}</p>
															</div>
															<div class="col-md-6">
																<template v-if="showCancelBtn">
																	<p style="padding-bottom:10px;">Click the button to cancel the subscription:</p>
																	<p v-if="!OTPVerify">
																		<q-btn label="Cancel Subscription" class="bg-red text-white"  @click="sendOtp()"/>
																	</p>
																	<div class="" v-if="OTPVerify">
																		<div class="text-subtitle1 ">
																			Enter the OTP sent to your Email
																		</div>
																		<q-input ref="login_otp" name="otp" class="col-xs-12 login-field" v-model="OTP" label="OTP" required autofocus>
																			<template v-slot:prepend>
																				<div class="text-subtitle1" style="width:80px;">{{ timeLeft }} </div>
																			</template>
																			<template v-slot:after>
																				<q-btn label="CONFIRM" @click="verifyOTP();OTPRetryCount++;" size="md" class="bg-red text-white" :disable="OTP.length == 0"></q-btn>
																			</template>	
                     													</q-input>
																	</div>
																</template>
																<template v-else>
																	<p class="text-center"><strong>No active subscriptions</strong></p>
																</template>
															</div>
														</div>
													</template>
												</div>
											</template>
											<template v-if="tab.name == 'subscription'">
												<div class="col-md-12">
													<template v-if="tabData.error">
														<p class="text-center text-weight-bold">No data available</p>
													</template>
													<template v-else>
														<table>
															<thead>
																<tr>
																	<th>Subscription</th>
																	<th>Started on</th>
																	<th>Recurring</th>
																	<th>Next billing</th>
																	<th>Ends on</th>
																	<th>Status</th>
																</tr>
															</thead>
															<tbody>
																<tr v-for="row in subscriptionRows" :key="row.id">
																	<td>{{row.name}}</td>
																	<td>{{row.start_date}}</td>
																	<td>{{row.recurring }}</td>
																	<td>{{row.payment_due_date}}</td>
																	<td class="text-center">{{ (row.status == 'cancelled') ? row.end_date : '-'}}</td>
																	<td class="text-capitalize">{{row.status}}</td>
																</tr>
															</tbody>
														</table>
													</template>
												</div>
											</template>
										</q-tab-panel>
									</q-tab-panels>
								</template>
							</q-splitter>
						</div>
					</q-card-section>
					<q-card-actions align="right" class="full-width row dialog">
						<q-btn flat v-close-popup >{{$root.getLabel('Close')}}</q-btn> 
					</q-card-actions>
				</q-card> 
			</q-dialog>

			<q-dialog v-model="showVideoDialog" content-class="cnx-modal" persistent transition-show="none" transition-hide="none" :maximized="$q.screen.lt.md" persistent :style="$q.screen.lt.md ? '' : 'min-width:700px' ">  
				<q-card class="bg-white shadow-20 row" :style="$q.screen.lt.md ? 'width:100%;' : 'min-width:700px'"> 
					<q-card-section class="row full-width dialog" style="border-bottom:1px solid rgba(0,0,0,0.1)">
						<q-toolbar :class="'bg-grey-- q-pl-md'"> 
							<q-toolbar-title class="text-h6 mr-5 align-center" floating></q-toolbar-title>  
							<q-btn icon="close" size="md" flat @click="handleVideoPopup()" id="close-dialog"></q-btn>
						</q-toolbar> 
					</q-card-section>
					<q-card-section  class="row  full-width items-center text-left dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
						<div class="row full-width">
							<iframe width="100%" height="400px" src="https://www.youtube-nocookie.com/embed/qWJ4Y9jfJQs?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen referrerpolicy="cross-origin-with-strict-origin"></iframe>
						</div>
					</q-card-section>
				</q-card> 
			</q-dialog>

			<q-dialog v-model="showAgreementDialog" content-class="cnx-modal" persistent transition-show="none" transition-hide="none" :maximized="$q.screen.lt.md" persistent :style="$q.screen.lt.md ? '' : 'min-width:700px' ">  
				<q-card class="bg-white shadow-20 row" :style="$q.screen.lt.md ? 'width:100%;' : 'min-width:700px'"> 
					<q-card-section class="row full-width dialog" style="border-bottom:1px solid rgba(0,0,0,0.1)">
						<q-toolbar :class="'bg-grey-- '"> 
							<q-toolbar-title class="text-h6 mr-5 align-center" floating style="margin-left: -10px !important;">Qtis End User License Agreement</q-toolbar-title>  
						</q-toolbar> 
					</q-card-section>
					<q-card-section  class="row  full-width items-center text-left dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
						<div class="row full-width">
							<cnx-agreement/>
							<div class="row full-width" style="margin-top: 10px;">
								<div class="col-md-6" style="padding-right: 10px;">
									<q-input v-model="agreementName" label="Name" required @input="handleChangetext()"/>
								</div>
								<div class="col-md-6 cnx-input-date" style="padding-left: 10px;"> 
									<q-input filled label="Date" v-model="agreementDate" :readonly="true">
										<template v-slot:append>
										<q-icon name="event"></q-icon>
										</template>
									</q-input>
								</div>
							</div>
							<div class="row full-width" style="margin-top: 10px; min-height: 60px;">
								<div class="col-md-6  flex items-center justify-left">
								 	<q-checkbox label="Send me a copy of this agreement" v-model="agreementCopy" primary hide-details style="margin-right: 25px;" @input="handleChangetext()"/>
								</div>
								<div class="col-md-6">
									<q-input type="email" v-if="agreementCopy" v-model="agreementEmail" label="Email" required @input="handleChangetext()"/>
								</div>
							</div>
							<div class="row full-width  flex items-center justify-center">
								<p class="text-red" style="padding: 7px 0px;">{{errMsg}}</p>
							</div>
							<div class="row full-width  flex items-center justify-center ">
								<q-btn class="q-mt-md bg-blue text-white text-capitalize" size="md" flat @click="handleAgreementPopup()" :loading="agreeLoding" :disable="agreeDisable">Agree & Continue</q-btn>
							</div>

						</div>
					</q-card-section>
				</q-card> 
			</q-dialog>
		</div>
		</template>`,
	extends: uiComponent,

	data: function () {
		return {
			settings: [],
			groups: {},
			showSettingsDialog: false,
			showDashboardDialog: false,
			showVideoDialog: false,
			user: user.username,
			tabs: [
				{ name: 'dashboard', label: 'Dashboard' },
				{ name: 'orders', label: 'Orders' },
				{ name: 'address', label: 'Billing Address' },
				{ name: 'accountdetails', label: 'Account details' },
				{ name: 'subscription', label: 'Subscription' },
			],
			orderRows: [],
			subscriptionRows: [],
			tabData: '',
			splitterModel: 250,
			tab: 'dashboard',
			concurrentUser: 0,
			showCancelBtn: false,
			labelSetting: false,
			OTP: "",
			OTPRetryCount: 0,
			expiryTime: null,
			timeLeft: "",
			OTPVerify: false,
			OTPResult: null,
			showAgreementDialog: false,
			agreementName: '',
			agreementEmail: '',
			agreementDate: '',
			agreementCopy: false,
			errMsg: '',
			agreeLoding: false,
			agreeDisable: true,
		}
	},
	created() {
		this.$root.registerEventListener("settingsLoaded", this);
		this.$root.registerEventListener("showSettings", this);
		this.$root.registerEventListener("showDashboard", this);
		this.$root.registerEventListener("showDashboardCancel", this);
		this.$root.registerEventListener("agreementPdfclose", this);
		customizationFunctions.loadUserSettings();
		this.getSubscription();
	},
	destroyed() {
		this.$root.removeEventListener("settingsLoaded", this);
		this.$root.removeEventListener("showSettings", this);
		this.$root.removeEventListener("showDashboard", this);
		this.$root.removeEventListener("showDashboardCancel", this);
		this.$root.removeEventListener("agreementPdfclose", this);
	},
	methods: {
		notifyEvent(event, eventData) {
			if (event == "settingsLoaded") {
				//this.settings = eventData;
				for (let s = 0; s < eventData.length; s++) {
					var setting = eventData[s];
					var group = this.groups[setting.group];
					if (!group) {
						group = {
							label: setting.group,
							children: []
						}
						this.settings.push(group);
						this.groups[setting.group] = group;
					}
					group.children.push(setting);
					if (setting.user == user.username) {
						this.setSetting(setting);
					}
				}
			}
			else if (event == "showSettings") {
				this.showSettingsDialog = true;
				setTimeout(() => {
					renderButton();
				}, 1800);
				if (eventData) {
					this.user = eventData;
				}
			}
			else if (event == "showDashboard") {
				this.tab = 'dashboard';
				this.showDashboardDialog = true;
			}
			else if (event == "showDashboardCancel") {
				this.showDashboardDialog = true;
				this.tab = 'accountdetails';
			}
			else if (event == "showDashboardCancel") {
				this.showDashboardDialog = true;
				this.tab = 'accountdetails';
			} else if (event == "agreementPdfclose") {
				this.showAgreementDialog = false;
				this.agreementName = '';
				this.agreementEmail = '';
				this.agreementDate = '';
				this.agreeLoding = false;
			}
		},
		getSubscription() {
			setTimeout(() => {
				if (window.location.hash == '#cR5xGWEV82sVIwNd0dPgpuP') {
					const homeMenu = document.getElementById("home");
					if (homeMenu) {
						homeMenu.classList.add("active-menu")
					}
				}
			}, 2200);

			if (subTenantName == 'cpsubscription' && moduleName == "qtisweb") {
				executeAppAPI("getwpuserdetails", { input: { email: user.email } }, null, this.handleDashbaordData);
				executeAppAPI("checkfirsttimelogin", { parameters: { email: user.email } }, null, this.handleFirstlogin);
				executeAppAPI("GetActiveConcurrentUsersofAppTenant", { input: { TenantId: user.tenantId } }, null, this.handleConcurrentlimit);
			}
		},
		sendOtp() {
			executeAppAPI("CancelSubscriptionOtp", { input: { email: user.email } }, null, this.handleOtp);
		},
		verifyOTP() {
			if (this.OTP == this.OTPResult) {
				this.OTPVerify = false;
				this.cancelSubscription();
				this.showDashboardDialog = false;
			} else {
				this.$root.showDialog({
					show: true,
					title: app.getLabel('OTP Incorrect!'),
					message: app.getLabel('Please try again.'),
					icon: "priority_high",
					okButtonText: app.getLabel('OK'),
					onOk: function () { }
				});
			}
		},
		handleOtp(response) {
			if (response.status == "OK") {
				this.OTPVerify = true;
				this.OTPResult = parseInt(response.result);

				// Assuming this.expiryTime is a Date object
				this.expiryTime = new Date(new Date().getTime() + 60000); // 60 seconds from now

				// Use an arrow function to keep the context of 'this'
				let timer = setInterval(() => {
					// Calculate the remaining time in milliseconds
					var timeInMillisLeft = this.expiryTime.getTime() - new Date().getTime();

					// Check if the time has expired
					if (timeInMillisLeft <= 0 && !this.timeExpired) {
						this.timeExpired = true;

						// Clear the interval to stop further updates
						clearInterval(timer);

						// Show the dialog when time expires
						this.$root.showDialog({
							show: true,
							title: app.getLabel('Time limit expired!'),
							message: app.getLabel('Please try again.'),
							icon: "priority_high",
							okButtonText: app.getLabel('OK'),
							onOk: () => {
								this.OTPVerify = false;
							}
						});
					} else {
						// Update the time left
						this.timeLeft = utils.parseMillisecondsIntoReadableTime(timeInMillisLeft);
					}
				}, 1000); // Runs every second
				// This runs every second (1000 milliseconds)

			}
		},
		cancelSubscription() {
			executeAppAPI("getwpuserdetails", { input: { email: user.email, cancel_subscription: true } }, null, this.handleCancelData);
		},
		handleConcurrentlimit(response) {
			if (response.status == "OK") {
				this.concurrentUser = response.result?.data[0]?.ActiveUserCount;
			}
		},
		handleDashbaordData(response) {
			this.tabData = JSON.parse(response.result);
			if (this.tabData.orders) {
				this.subscriptionRows = Object.keys(this.tabData.subscriptions).map(order_id => {
					const subs = this.tabData.subscriptions[order_id];
					return {
						id: order_id,
						name: "#" + order_id + " - " + subs.product_name,
						start_date: subs.start_date,
						recurring: "$" + subs.order_total + " / " + subs.price_is_per + " " + subs.price_time_option,
						trial: subs.trial_per + " " + subs.trial_time_option,
						nextbilling: (subs.status == "cancelled") ? "-" : subs.payment_due_date,
						end_date: (subs.status == "cancelled") ? subs.end_date : subs.payment_due_date,
						payment_due_date: (subs.status == "cancelled") ? "-" : subs.payment_due_date,
						status: subs.status,
					};
				});
				this.tabData.orders.forEach(order => {
					this.orderRows.push({
						id: "#" + order.order_id,
						date: order.date,
						status: order.status,
						payment_due_date: (this.tabData.subscriptions[order.order_id + 1].status == 'cancelled') ? '-' : this.tabData.subscriptions[order.order_id + 1].payment_due_date,
						total: "$" + order.total
					});
				});

				this.showCancelBtn = this.subscriptionRows.some(sub => sub.status === "trial" || sub.status === "active");
			}
		},
		handleCancelData(response) {
			this.$root.showDialog({
				show: true,
				title: "Subscription Cancel",
				message: "Your subscription has cancelled",
				icon: "info",
				showCancel: false,
				okButtonText: "Close"
			});
			this.getSubscription();
		},
		handleFirstlogin(response) {
			if (response.status == "OK") {
				if (response.result.FirstTimeLogin == 0) {
					this.showVideoDialog = true;
					this.showAgreementDialog = true;

					const agreementDate = new Date();
					const month = String(agreementDate.getMonth() + 1).padStart(2, '0');
					const day = String(agreementDate.getDate()).padStart(2, '0');
					const year = agreementDate.getFullYear();

					let hours = agreementDate.getHours();
					const minutes = String(agreementDate.getMinutes()).padStart(2, '0');
					const seconds = String(agreementDate.getSeconds()).padStart(2, '0');

					const ampm = hours >= 12 ? 'PM' : 'AM';
					hours = hours % 12;
					hours = hours ? String(hours).padStart(2, '0') : '12';

					this.agreementDate = `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
				}
			}
		},
		handleVideoPopup() {
			this.showVideoDialog = false;
			executeAppAPI("updatefirsttimeloginflag", { parameters: { Id: user.id } }, null, {});
		},
		handleChangetext() {
			if (this.agreementName && this.agreementName.trim() && this.agreementDate) {
				if (this.agreementCopy) {
					const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
					if (this.agreementEmail && regex.test(this.agreementEmail)) {
						this.agreeDisable = false;
					} else {
						this.agreeDisable = true;
					}
				} else {
					this.agreeDisable = false;
				}
			} else {
				this.agreeDisable = true;
			}
		},
		handleAgreementPopup() {
			this.agreeLoding = true;
			if (this.agreementName && this.agreementDate) {
				const date = new Date(this.agreementDate);
				const year = date.getUTCFullYear();
				const month = String(date.getUTCMonth() + 1).padStart(2, '0');
				const day = String(date.getUTCDate()).padStart(2, '0');
				const hours = String(date.getUTCHours()).padStart(2, '0');
				const minutes = String(date.getUTCMinutes()).padStart(2, '0');
				const seconds = String(date.getUTCSeconds()).padStart(2, '0');
				const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
				const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

				executeAppAPI("UpdateSubscriberAgreementDetails", {
					parameters: {
						email: user.email,
						SubscriberAgreementName: this.agreementName,
						SubscriberAgreementDate: formattedDate,
						SubscriberAgreementEmail: this.agreementEmail ? this.agreementEmail : '',
					}
				}, null, this.handleAgreementres);

			} else {
				this.agreeLoding = false;
			}
		},
		handleAgreementres(response) {
			if (response.status == "OK") {
				if (this.agreementEmail) {
					this.$root.emitEvent('agreementPDF', { 'name': this.agreementName, 'date': this.agreementDate, email: this.agreementEmail });
				} else {
					this.showAgreementDialog = false;
					this.agreementName = '';
					this.agreementEmail = '';
					this.agreementDate = '';
					this.agreeLoding = false;
				}
			}
		},
		setSetting(setting) {
			if (setting.label == 'Outlined Fields') {
				this.$root.theme.fieldOutline = setting.value;
			}
			else if (setting.label == 'Filled Fields') {
				this.$root.theme.fieldFilled = setting.value;
			}
		},
		updateSetting(setting) {
			this.setSetting(setting);
			customizationFunctions.saveUserSettings(setting);
		},
		changePassword() {
			app.showChangePasswordDialog = true;
		}
	}

});




