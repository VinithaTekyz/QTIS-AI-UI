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
		handleTopMenuClick: function(menuItem) {
	 		menuItem.top = true;
	 		handleNavMenuClick(menuItem);
	 	},
	data: {
	 	    showing:false
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
		data : function() {
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
		data : function() {
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
		data(){
			return {
				showLoader: false,
			}
		},
		computed: {
			showQRDialog: {
				get: function() {
					var show = this.uistate.showQRDialog;
					return this.updateToggle ? show : show;
				},
				set: function(show) {
					this.uistate.showQRDialog = show;
					this.updateToggle = !this.updateToggle;
				}
			},
			showICDialog: {
				get: function() {
					var capt = this.uistate.showICDialog;
					return this.updateToggle ? capt : capt;
				},
				set: function(capt) {
					this.uistate.showICDialog = capt;
					this.updateToggle = !this.updateToggle;
				}
			},
			voiceBtnController: {
				get: function() {
					var state = this.uistate.voiceBtnController;
					return this.updateToggle ? state : state;
				},
				set: function(state) {
					this.uistate.voiceBtnController = state;
					this.updateToggle = !this.updateToggle;
				}
			}
		},
		created() {
			var loginLoader = localStorage.getItem('loginLoader');
			if(loginLoader){
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
				
			},
			startQRInput() {
				this.showQRDialog = true;
				setTimeout(this.showQRScanner, 300);
			},
			showQRScanner() {
				startQRScanner(this.handelQRInput);
			},
			handelQRInput(content){
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
			handelQR1Input(){
				console.log('STOPPED..');
			},
			
			/******************	VOICE TO TEXT CONVERSION	******************/
			
			toggleVtoT(){
				
				this.voiceBtnController = !this.voiceBtnController; 
				if (this.voiceBtnController) {
					setTimeout(this.startVoiceToText(),300);
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
			stopVoiceToText(){
				
				stopSpeechRecognition();
				this.voiceBtnController = false;
				console.log('STOPPED.')
				
			},
			
			/******************	IMAGE CAPTURE PROCESSING	******************/
			
			imageCapture(){
				this.showICDialog = true;
				//this.showLoading();
				setTimeout(this.showICScanner, 10);
			},
			showICScanner(){
				Webcam.attach( '#ic' );
				//take_snapshot(this.handelICInput);
			},
			takeIC(){
				this.showLoading();
				setTimeout(take_snapshot(this.handelICInput), 300);
				
			},
			handelICInput(image){
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
			stopICScan(){
				//this.showICDialog = false;
				Webcam.reset();
				console.log('STOPPED');

			},
			showLoading () {
			      this.$q.loading.show()
			      	// hiding in 1s
			      this.timer = setTimeout(() => {
			    	  this.$q.loading.hide()
			    	  this.timer = void 0
			    	  }, 1000)
			},
			beforeDestroy () {
				if (this.timer !== void 0) {
					clearTimeout(this.timer)
					this.$q.loading.hide()
					}
			},
			clearFunc(){
				
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
		   data: function() {
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
						 
			<template v-for="item in uiprops.menu" v-if="item.visible"> 
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
			<div>chat ai here</div>
			<cnx-chat-ai/>
		</template>
		</div>
	</template>`,
		extends: baseComponent,
		data: function() {
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
			CheckMenuItem(item){
				if(Object.keys(this.otherMenuExpanded).length > 0){
					var menuId = "menu_" + item.id;
					var ids = this.otherMenuExpanded.hasOwnProperty(menuId);
					if(ids.includes(menuId)){
						this.otherMenuExpanded = {};
					} else {
						this.otherMenuExpanded = {};
						this.otherMenuExpanded[menuId] = true;
					}
				}
			},
			checkActiveClass(item){
				var activeClass = '';
				var url = "#" + item.url
				if(url && url == window.location.hash){
					if(item.parentId){
						this.otherMenuExpanded[item.parentId] = true;
					}
					activeClass = "active-menu";
				} else if(item.parentId && item.parentId == "clientbilling" && window.location.hash == "#cn6LdWeG8PtNgIQpe2e3W3CQ" && activeMenu.parentId == item.parentId){
					if(item.id == activeMenu.id){
						activeClass = "active-menu";
					}
				} else if(item.parentId && item.parentId == "admintimesheet" && window.location.hash == "#cazBGANNKkf6lu65021ekZsYZ"){
					activeClass = "active-menu";
				} else if(item.id == "home" && window.location.hash == '#cR5xGWEV82sVIwNd0dPgpuP') {
					activeClass = "active-menu";
				} else if(item.parentId && item.parentId == "help" && item.id == activeMenu.id){
					activeClass = "active-menu";
				}

				if(item.hasChildren){
					for(var i = 0; i < item.children.length; i++){
						var childurl = "#" + item.children[i].url;
						activeClass = '';
						if(childurl && childurl == window.location.hash){
							activeClass = "active-menu";
						}
					}
				}
				return activeClass;
			},
			SetActiveMenu(){
				setTimeout(() => {
					var ActiveMenuIndex = 0;
					for(var i = 0; i < this.uiprops.menu.length; i++){
						var menu = "#" + this.uiprops.menu[i].url;
						if(menu == window.location.hash){
							ActiveMenuIndex = i;
						} else {
							if(this.uiprops.menu[i].children){
								for(var c = 0; c < this.uiprops.menu[i].children.length; c++){
									var submenu = "#" + this.uiprops.menu[i].children[c].url;
									if(submenu == window.location.hash){
										if(parentMenu == false){
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
			CheckOpenState(val){
				return val;
			},
			GetActivemenu(child){
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
				if(event== "settingsLabelChange"){
					this.updateToggle = !this.updateToggle;
				}
				if(event == "navMenuItemClicked"){
					this.SetActiveMenu();
				}
			},
			getMenuLabel(label){
				if(changeCaselabel){
					label = label.replace(/\bCase\b/, "Project");
					label = label.replace(/\bcase\b/, "project");
				}
				return label;
			},
			checkLogo(logoPath){
				var fileName = logoPath.substr(logoPath.lastIndexOf("/")+1);
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
			changePassword(){
				app.showChangePasswordDialog=true;
				
			},
			VersionLink(versionLink){
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
							<iframe width="100%" height="400px" src="https://www.youtube.com/embed/qWJ4Y9jfJQs?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
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
		
		data: function() {
			return {
				settings: [],
				groups: {},
				showSettingsDialog: false,
				showDashboardDialog: false,
				showVideoDialog: false,
				user: user.username,
				tabs: [
					{name: 'dashboard', label: 'Dashboard'},
					{name: 'orders', label: 'Orders'},
					{name: 'address', label: 'Billing Address'},
					{name: 'accountdetails', label: 'Account details'},
					{name: 'subscription', label: 'Subscription'},
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
				else if(event == "showDashboard"){
					this.tab = 'dashboard';
					this.showDashboardDialog = true;
				}
				else if(event == "showDashboardCancel"){
					this.showDashboardDialog = true;
					this.tab = 'accountdetails';
				}
				else if(event == "showDashboardCancel"){
					this.showDashboardDialog = true;
					this.tab = 'accountdetails';
				} else if(event == "agreementPdfclose"){
					this.showAgreementDialog = false;
					this.agreementName = '';
					this.agreementEmail = '';
					this.agreementDate = '';
					this.agreeLoding = false;
				}
			},
			getSubscription(){
				setTimeout(() => {
					if(window.location.hash == '#cR5xGWEV82sVIwNd0dPgpuP') {
						const homeMenu = document.getElementById("home");
						if (homeMenu) {
							homeMenu.classList.add("active-menu")
						}
					}
				}, 2200);
				
				if(subTenantName == 'cpsubscription' && moduleName == "qtisweb"){
					executeAppAPI("getwpuserdetails", {input: {email: user.email} }, null, this.handleDashbaordData);
					executeAppAPI("checkfirsttimelogin", {parameters: {email: user.email} }, null, this.handleFirstlogin);
					executeAppAPI("GetActiveConcurrentUsersofAppTenant", {input: {TenantId : user.tenantId} }, null, this.handleConcurrentlimit);
				}
			},
			sendOtp(){
				executeAppAPI("CancelSubscriptionOtp", {input: {email: user.email} }, null, this.handleOtp);
			},
			verifyOTP(){
				if(this.OTP == this.OTPResult){
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
						onOk: function() {}
					});
				}
			},
			handleOtp(response){
				if(response.status == "OK"){
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
			cancelSubscription(){
				executeAppAPI("getwpuserdetails", {input: {email: user.email, cancel_subscription: true} }, null, this.handleCancelData);
			},
			handleConcurrentlimit(response){
				if(response.status == "OK"){
					this.concurrentUser = response.result?.data[0]?.ActiveUserCount;
				}
			},
			handleDashbaordData(response){
				this.tabData = JSON.parse(response.result);
				if(this.tabData.orders){
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
			handleCancelData(response){
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
			handleFirstlogin(response){
				if(response.status == "OK"){
					if(response.result.FirstTimeLogin == 0){
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
			handleVideoPopup(){
				this.showVideoDialog = false;
				executeAppAPI("updatefirsttimeloginflag", {parameters: {Id: user.id} }, null, {});
			},
			handleChangetext(){
				if(this.agreementName && this.agreementName.trim() && this.agreementDate){
					if(this.agreementCopy){
						const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
						if(this.agreementEmail && regex.test(this.agreementEmail)){
							this.agreeDisable = false;
						} else {
							this.agreeDisable = true;
						}
					} else {
						this.agreeDisable = false;
					}
				} else{
					this.agreeDisable = true;
				}
			},
			handleAgreementPopup(){
				this.agreeLoding = true;
				if(this.agreementName && this.agreementDate){
					const date = new Date(this.agreementDate);
					const year = date.getUTCFullYear();
					const month = String(date.getUTCMonth() + 1).padStart(2, '0');
					const day = String(date.getUTCDate()).padStart(2, '0');
					const hours = String(date.getUTCHours()).padStart(2, '0');
					const minutes = String(date.getUTCMinutes()).padStart(2, '0');
					const seconds = String(date.getUTCSeconds()).padStart(2, '0');
					const milliseconds = String(date.getUTCMilliseconds()).padStart(3, '0');
					const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;

					executeAppAPI("UpdateSubscriberAgreementDetails", {parameters: {
						email: user.email,
						SubscriberAgreementName: this.agreementName,
						SubscriberAgreementDate: formattedDate,
						SubscriberAgreementEmail: this.agreementEmail ? this.agreementEmail : '',
					} }, null, this.handleAgreementres);
					
				} else{
					this.agreeLoding = false;
				}
			},
			handleAgreementres(response){
				if(response.status == "OK"){
					if(this.agreementEmail){
						this.$root.emitEvent('agreementPDF', {'name': this.agreementName, 'date': this.agreementDate, email: this.agreementEmail});
					} else{
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
			changePassword(){
				app.showChangePasswordDialog=true;
			}
		}
		   
	});
	

	

