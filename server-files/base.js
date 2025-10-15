



 

var component_methods = {
		onUIPartLoaded(selfLoaded) {

		},
		notifyEvent(event, eventData) {
			if (this.uiprops.eventHandlers && this.uiprops.eventHandlers[event]) {
				return this.handleEvent(event, eventData);
			}
			else if (this.uiprops.eventHandlers && this.uiprops.eventHandlers[event.toLowerCase()]) {
				return this.handleEvent(event.toLowerCase(), eventData);
			}
			else if (this.handleNotifyEvent) {
				return this.handleNotifyEvent(event, eventData);
			}
		},
		emitEventToParent(event, eventData) {
			this.getCustomParent().handleEvent("onchildevent", { event: event, eventData: eventData});
		},
		emitEventToChild(event, eventData, childResourceId) {
			for (c = 0; c < this.$children.length; c++) {
				var child = this.$children[c];
				if (child.uiprops && child.uiprops.resourceId == childResourceId && child.handleEvent) {
					child.handleEvent("onparentevent", { event: event, eventData: eventData});
				}
			}
		},
		checkPermission(permission) {
			if (this.uiprops.accessFunctionId) {
				return checkPermission(this.uiprops.accessFunctionId, permission);
			}
		},
		getAppLabel(labelKey) {
			return this.$root.getLabel(labelKey);
		},
		getLabel() {
			return this.getComponentLabel(this.uiprops);
		},
		getComponentLabel(uiprops) {
			var label;
			try {
				var locale = this.$root.$data.currentLocale;
				label = uiprops.label[locale];
				if (!label) {
					label = uiprops.label["default"];
				}
				if (changeCaselabel && label && subTenantName == 'cpsubscription') {
					label = label.replace(/\bCase\b/, "Project");
					label = label.replace(/\bcase\b/, "project");
				}
			} catch (e) { }
			return label;
		},
		getLabelStyle(uiprops) {
			try {
			  const locale = this.$root.$data.currentLocale;
			  const label = uiprops.label[locale] || uiprops.label["default"];
			  
			  if ((label === 'Generate Summary' || label === 'Summary Templates') && subTenantName === 'cpsubscription') {
				// return 'text-weight-bold';
				return uiprops.id;
			  } else {
				return '';
			  }
			} catch (e) {
			  console.error('Error in getLabelStyle:', e);
			  return '';
			}
		},
		getControlName(componentProps) {
			return customizationFunctions.getControlName(componentProps);
		},
		setRootData(path, value) {
			setValueAtPath(this.$root.$data, path, value);
			//alert("Data modified: " + getValueAtPath(this.$root.$data, path));
		},
		getRoot() {
			return this.$root;
		},
		getRootData(field) {
			//alert("Getting root data: " + JSON.stringify(this.$root.$data[field]));
			return this.$root.$data[field];
		},
		refresh() { 
			this.ref.refreshDataMapping();
		},
		reloadData() {
			if (this.beforeReload) {
				this.beforeReload();
			}
			if (this.uiprops.dataPath) {
				this.uistate.loading = true;
				this.updateToggle = !this.updateToggle; 
				loadModelItem(this.widgetModel, this.uiprops.dataPath, true);
			}
			this.refreshModel();
		},
		handleEvent(event, args, startTime) {
			if (this.uiprops.eventHandlers && this.uiprops.eventHandlers[event]) {
				var evh = this.uiprops.eventHandlers[event];
				var isValid = true;
				
				if (!args && this.bean) {
					args = this.bean;
				}
				
				if (evh.componentsToValidate) {
					var componentsToValidate = evh.componentsToValidate.split(","); 
					isValid = this.invokeComponentMethod(componentsToValidate, "validateTree", { } );
				}
				if (isValid) {
					if (this.uistate.pendingValidations) {
						if (!startTime) {
							startTime = new Date().getTime();
						}
						if (new Date().getTime() - startTime < 5000) {
							var component = this;
							var validationCheckCallback = {
								event: event,
								args: args,
								component: component,
								startTime: startTime,
								check() {
									this.component.handleEvent(this.event, this.args, this.startTime);
								}
							}
							setTimeout(validationCheckCallback.check, 1000);
						}
					}
					else {
						log("events/" + this.uiprops.controlName, "Handling event: " + event + " - " + evh.componentsToValidate);
						return this.ref.handleEvent(event, args);
					}
				}
				else {
					this.$root.showDialog({
						  show: true, 
						  title: "Error",
						  message: "Please resolve the errors shown.",
					   	  icon: "warning", 
					   	  showCancel: false, 
					   	  okButtonText: "Close"
					});
				}
			}
		},
		invokeComponentMethod(componentList, method, visited) {
			var status = true;
			//console.log("Invoke Method: " + method + " - " + this.uiprops.resourceId + " -> " + this.uiprops.path);
			//log("ui-update/invoke-start", "Start Invoke Method: " + method + " - " + this.uiprops.resourceId + " -> " + this.uiprops.path); 
			try {
				if (!visited[this.uiprops.id]) {
					visited[this.uiprops.id] = true;
					var l = 0;
					for (l = 0; l < componentList.length; l++) {
						var componentPath = componentList[l];
						//console.log("Checking Path: " + componentPath + " ====>>>>> " + this.uiprops.path);
						if ((componentPath == this.uiprops.path) && this[method]) {
							status = this[method]() && status;
							//log("ui-update/invoking", "Invoking Method: " + method + " - " + this.uiprops.resourceId + " -> " + this.uiprops.path); 
							//console.log("INVOKING: " + method + " ====>>>>> " + this.uiprops.resourceId);
							componentList.splice(l, 1);
							l--;
						}
					}
					
					for (l = 0; l < componentList.length; l++) {
						var componentPath = componentList[l];
						if (this.uiprops.path && componentPath.startsWith(this.uiprops.path)) {
							if (this.uistate.childListeners) {
								var c = 0;
								for (c = 0; c < this.uistate.childListeners.length; c++) {
									var child = this.uistate.childListeners[c];
									status = child.invokeComponentMethod(componentList, method, visited) && status;
								}
							}
						}
						else {
							
							var p = this.getCustomParent();
							if (p) {
								status = p.invokeComponentMethod(componentList, method, visited) && status;
							}
							
						}
					}
				}
			} catch (e) { console.error(e); }
			return status;
		},
		getCustomParent() {
			var p = this.$parent;
			var nextParentFound = p.ref && p.uistate;
			while (!nextParentFound) {
				p = p.$parent;
				nextParentFound = !p || p.ref;
			}
			return p;
		},
		getWidget() {
			if (!('widget' in this.uistate)){
				var widget = (this.uistate && this.uistate.isWidget) ? this : this.getCustomParent().getWidget();
				this.uistate.widget = widget;
			}
			return this.uistate.widget;
		},
		getUIProp(prop) {
			var propValue = this.uiprops[prop];
			if (!propValue) {
				var p = this.getCustomParent();
				if (p) {
					propValue = p.getUIProp(prop);
				}
			}
			return propValue;
		}
		,
		registerChildListener(child) {
			if (this.uistate) {
				if (!this.uistate.childListeners) {
					this.uistate.childListeners = [];
				}
				
				this.uistate.childListeners.push(child);
				child.uistate.listeningForUpdates = true;
				
				//alert("Registering : " + child.uiprops.resourceId + " ==> " + this.uiprops.resourceId + "(" + this.uiprops.controlName + ") - " + JSON.stringify(this.$parent.uistate ? "yes" : "no"));
				
				if (!this.uistate.listeningForUpdates) {
					if (this.$parent && this.$parent.registerChildListener) {
						this.$parent.registerChildListener(this);
					}
				}
			}
			else if (this.$parent && this.$parent.uistate) {
				this.$parent.registerChildListener(child);
			}
		},
		unregisterChildListener(child) {
			if (this.uistate.childListeners) {
				var c = 0;
				for (c = 0; c < this.uistate.childListeners.length; c++) {
					if (this.uistate.childListeners[c] == child) {
						this.uistate.childListeners.splice(c, 1);
						c--;
					}
				}
			}
		},
		notifyModelUpdate() {
			if (this.widgetModel && this.dataPath) {
				this.widgetModel.notify(this.dataPath);
			}
		},
		refreshModel(refreshPageTitle) {
			try {
				//this.ref.refreshDataMapping();
				//this.updateToggle = !this.updateToggle;
				//this.uistate.loading = false;
				var widget = this.getWidget();
				if (widget) {
					if (!(this.ref.widget.onloadCompleted) && this.widgetModel.$autoloadPendingCount == 0) {
						widget.afterDataLoad();
					}
				}
				
				if (refreshPageTitle) {
					this.getWidget().refreshPageTitle();
				}
				
				//this.updateToggle = !this.updateToggle;
				
				if (this.afterModelRefresh) {
					this.afterModelRefresh();
				}
				else {
					this.uistate.loading = false;
				}
				
				this.updateToggle = !this.updateToggle;
				this.dataToggle = !this.dataToggle;
				this.key = this.key + 1;
				
			} 
			catch (ex) {
				console.log("Error in base.html methods.refreshModel: " + ex);
			}
		},
		refreshView() {
			this.updateToggle = !this.updateToggle;
			this.dataToggle = !this.dataToggle;
			this.key = this.key + 1;
			
		},
		updateUIStateFlag(flag, checkFunction) {
			if (this.uiprops[checkFunction]) {
				var prevVisible = this.uistate[flag];
				try {
					this.uistate[flag] = this.uiprops[checkFunction](this.ref, this.ref.getWidget().model, this.ref.getWidget().model);
					log("ui-update/visible-enable", flag + " for : " + this.uiprops.resourceId + " = " + this.uistate[flag]);
				}
				catch (e) {
					log("ui-update/visible-enable", flag +  " error for : " + this.uiprops.resourceId + " = " + e);
					this.uistate[flag] = true;
				}
				if (prevVisible != this.uistate[flag]) {
					
				}
			}
			else {
				this.uistate[flag] = true;
			}
		},
		clearValidations() {
			if (this.validateData) {
				this.uistate.error = false;
				delete this.uistate.errorMessage;
				delete this.uistate.pendingValidations;
				delete this.uistate.validationRequired;
			}
			else {
				delete this.uistate.pendingValidations;
				var c = 0;
				for (c = 0; c < this.$children.length; c++) {
					var child = this.$children[c];
					if (child.clearValidations) {
						child.clearValidations();
					}
				}
			}
		},
		validateTree() {
			var isValid = true;
			if (this.validateData) {
				if (this.uistate.error) {
					log("ui-update/validating", "EXISTING ERROR found for: " + this.uiprops.resourceId);
					isValid = false;
				}
				else {
					isValid = this.uistate.pendingValidations ? true : (this.validateData ? this.validateData() : true);		
				}
			}
			else {
				delete this.uistate.pendingValidations;
				var c = 0;
				for (c = 0; c < this.$children.length; c++) {
					var child = this.$children[c];
					if (child.validateTree) {
						var childValid = child.validateTree(); 
						isValid = childValid && isValid; 
						if (child.uistate) {
							this.uistate.hasValue = this.uistate.hasValue || child.uistate.hasValue;
							if (child.uistate.pendingValidations) {
								this.uistate.pendingValidations = child.uistate.pendingValidations;		
								log("ui-update/validating", "Pending Validations found for: " + child.uiprops.resourceId + ". Set To -> " + this.uiprops.resourceId);
							}
						}
					}
				}
			}
			
			return isValid;
		},
		getDynamicAttribute(fieldName, defaultValue) {
			return this.getDynamicAttributeValue(this.uiprops, fieldName, defaultValue);
		},
		getDynamicAttributeFromCustomProperties(fieldName, defaultValue) {
			return this.getDynamicAttributeValue(this.uiprops.customProperties, fieldName, defaultValue);
		},
		getDynamicAttributeValue(baseObject, fieldName, defaultValue) {
			var label = '';
			
			if(baseObject) {
				label = baseObject[fieldName];
				
				if (label && label.startsWith("{") && label.endsWith("}")) {
					labelField = label.replace("{", "").replace("}", "");
					label = this.dataModel ? getValueAtPath(this.dataModel, labelField) : '';
				}
			}
			
			if(!label) {
				label = ((defaultValue) ? defaultValue : '');
			}
			
			return label;
		}
	};

var data_function = function() {
	var uiState;
	if (this.uiprops) {
		var componentRef1 = null;//this.componentRef;
		
		if (!componentRef1 || !componentRef1.uiprops) {
			componentRef1 = new cnx.UIComponent(this.uiprops, this.parent, 
					this.widget,
					//((this.uiprops.controlName == "cnx-widget-content") ? null : this.widget), 
					false, this.index, this.subtype);
		}
		else {
			this.uiprops = componentRef1.uiprops;
			console.log("Component found for: " + this.uiprops.resourceId);
		}
		
		componentRef1.uiprops = this.uiprops;
		componentRef1.component = this;
		
		var widgetModel = componentRef1.widget.model;
		
		var dataBeanRef;
		
		if (this.bean) {
			dataBeanRef = { data : this.bean };
		}
		else {
			//dataBeanRef = componentRef1.getDataBeanRef();
		}
		
		uiState = { visible: 'visible' in this.uiprops ? this.uiprops.visible : true, enabled: true };
		if (this.uiprops.pageSize) {
			uiState.pagination = { rowsPerPage: this.uiprops.pageSize, page: 1 };
		}
		
		uiState.id = this.uiprops.id + "_" + this.$root.getAutoincrementNumber();
		//console.log("Creating Data for: " + this.uiprops.resourceId + ": " + JSON.stringify(dataBeanRef));
		
		uiState.permissionView = true;
		uiState.permissionCreate = true;
		uiState.permissionEdit = true;
			  
		if (this.uiprops.accessFunctionId) {
			
			if (this.uiprops.controlName == "cnx-button") {
				uiState.permissionView = checkPermission(this.uiprops.accessFunctionId);
			}
			else {
				uiState.permissionView = checkPermission(this.uiprops.accessFunctionId, 1);
				uiState.permissionCreate = checkPermission(this.uiprops.accessFunctionId, 4);
				uiState.permissionEdit = checkPermission(this.uiprops.accessFunctionId, 8);
			}
			
		}
		
		componentRef1.uistate = uiState;
	}
	else {
		this.uiprops = { delegates: {} };
		uiState = {};
	}
	 
	return {
		delegates: this.uiprops ? this.uiprops.delegates : {},
		widgetModel: componentRef1 ? componentRef1.widget.model : {},
		selection: null,
		listItem: this.bean,
		theme: this.$root.theme,
		ref: componentRef1,
		widgetRef: {},
		uistate: uiState ? uiState : {},
		modelModified: false,
		updateToggle: false,
		dynamicStyle: "",
		key: 0,
		dataToggle: false
	}
	
}; 
 
var baseComponent = Vue.component('cnx-basecomponent', { 
	  props: ['uiprops', 'model', 'bean', 'index', 'widget', 'parent', 'subtype', 'componentRef' ],
	 
	  data: data_function,
	  methods: component_methods,
	  created() { 
		 //console.log("CREATED: " + this.uiprops.resourceId);
		 
		 if (this.ref) { 
			 //this.inDesignerMode = this.getWidget().inDesignerMode;
			 var p = this.getCustomParent();
			 //console.log("CREATED #2: " + this.uiprops.resourceId);
			  if (p && (this.uiprops.checkVisibility || this.uiprops.checkEnabled || this.uiprops.dataPath || this.uiprops.listenToParent
					  || (this.uiprops.validations && this.uiprops.validations.length > 0))) {
					//this.$parent.ref.registerChildListener(this.ref);
					p.registerChildListener(this);
					//console.log("CREATED #3: " + this.uiprops.resourceId);
			  }
			  if (this.uiprops.requiresUpdate) {
				  initComponent(this, "update$" + this.uiprops.id, null, this.getLabel() + " - Update", {});
			  }
			  if (this.onLoad) {
				  this.onLoad(); 
			  }
			  
			  try {
				  if (p.inDesignerMode || p.uistate.inDesignerMode) {
					  this.uistate.inDesignerMode = true;
					  this.inDesignerMode = true;
					  this.uistate.loading = false;
				  }
			  } catch (e) {};
			  
			  if (this.uiprops.subscribeToEvents) {
				  this.subscribeToEvents = this.uiprops.subscribeToEvents; 
				  var events = this.uiprops.subscribeToEvents.split(",");
				  for (let e = 0; e < events.length; e++) {
					  var event = events[e];
					  if (event.indexOf("{index}") > -1 && (this.index || this.index == 0)) {
						  event = event.replace("{index}", this.index);
					  }
					  this.$root.registerEventListener(event, this);
				  }
			  }
			  
			  
		 }
		 
	  },
	  destroyed() {
		  
		  if (this.subscribeToEvents) {
			  var events = this.subscribeToEvents.split(",");
			  for (let e = 0; e < events.length; e++) {
				  var event = events[e];
				  if (event.indexOf("{index}") > -1 && (this.index || this.index == 0)) {
					  event = event.replace("{index}", this.index);
				  }
				  this.$root.removeEventListener(event, this);
			  }
		  }
		  if (this.onDestroyed) {
			  this.onDestroyed();
		  }
	  },
	  computed: {
		  dataModel: {
			  get: function() {
		  		var m = this.uiprops.dataPath ? null : this.listItem;
				if (!m) {
					if (this.dataPath && this.widgetModel) {
						if (this.dataPath.startsWith("$widget.parentWidget.dataBean")) {
							var parentWidget = this.getWidget().getParentWidget();
							m = parentWidget ? getValueAtPath(parentWidget.widgetModel, 
									parentWidget.dataPath + this.dataPath.replace("$widget.parentWidget.dataBean", "")) : null;//getValueAtPath(this.ref, this.dataPath.substring(1));
						}
						else if (this.dataPath.startsWith("$widget.parentWidget.")) {
							var parentWidget = this.getWidget().getParentWidget();
							m = parentWidget ? getValueAtPath(parentWidget.ref.widget, this.dataPath.replace("$widget.parentWidget.", "")) : null;
						}
						else if (this.dataPath.startsWith(".") && this.listItem) {
							m = getValueAtPath(this.listItem, this.dataPath.substring(1));
						}
						else {
							var pathItem = getValueAtPath(this.widgetModel, this.dataPath);
							if (!pathItem) {
								if (this.listItem) {
									setValueAtPath(this.widgetModel, this.dataPath, this.listItem);
								}
								else {
									pathItem = this.createdefaultDataModel ? this.createdefaultDataModel() : {};
									setValueAtPath(this.widgetModel, this.dataPath, pathItem);
								}
							}
							m = pathItem;
						}
					}
				}
				
				return this.updateToggle ? m : m;
			  }, 
			  set: function(dm) {
				  setValueAtPath(this.widgetModel, this.dataPath, dm);
			  }
  		  },
  		  dataPath: function() {
  			  var dataPath = this.getUIProp('dataPath');
  			  return dataPath;
  		  },
  		  dataModelState: function() {
  			  return getWidget().getModelState();
  		  },  
  		  visible: function() { 
  			  var show =  
  				  (this.uistate.inDesignerMode || ('checkVisibility' in this.uiprops) || !('visible' in this.uiprops) 
  			  	|| (!('checkVisibility' in this.uiprops) && this.uiprops.visible));
  			  if (this.uiprops.checkVisibility) {
  				  try {
  				  	show = this.uistate.inDesignerMode || this.uiprops.checkVisibility(this.ref, this.widgetModel, this.widgetModel);
  				  }
  				  catch (e) {
  					  
  				  }
  			  }
  			  show = !this.uistate.hidden && show && (this.uistate.ignorePermissionView || this.uistate.permissionView);
  			  return this.updateToggle ? show : show;
  		  }
	  },
	  mounted() {
		  if (this.afterMounted) {
			  this.afterMounted();
		  }
		  if (this.afterLoad) {
			  this.afterLoad();
		  }
		  else {
			  this.onUIPartLoaded(true);
		  }
	  },
	  updated() {
		  //console.log("UPDATED: " + this.uiprops.resourceId); 
		  if (this.afterUpdated) {
			  this.afterUpdated();
		  }
	  },
	  beforeDestroy() {
		  if (this.$parent && this.$parent.registerChildListener) {
			  this.$parent.unregisterChildListener(this);
		  }
	  }
	});
	
	Vue.component('cnx-row', {
		template: `
		<template id="cnx-cell">
	 
	<div  :class="uiprops.styleClasses + ' items-start cnx-cell row layer-enabled'" v-if="visible" :dark="theme.isDark" 
	   v-on:click="handleEvent('onclick')">
		
		<template v-for="child in uiprops.children">
		  
			<div :class="uiprops.styleClasses + ' designerMenu'" v-if="false && uistate.inDesignerMode"
			     style="background-color:rgba(0,0,0,0.5);height:20px;"
			></div>		   
		  
			<component   :is="getControlName(child)" v-bind:uiprops="child" 
						   v-bind:bean="bean" 
						   v-bind:parent="ref" v-bind:widget="ref.getWidget()">
			</component>
		
		
		
		</template> 
		
	</div>

</template>
		`,
	  	extends: baseComponent
	});
    
	var cellComponent = Vue.component('cnx-cell', {
		  template: `
		  <template id="cnx-cell">
	 
	<div  :class="uiprops.styleClasses + ' items-start cnx-cell row layer-enabled'" v-if="visible" :dark="theme.isDark" :key="updateToggle">
		
		<div class="col-12" v-html="getCustomHTML()" v-if="hasCustomHTML()"></div>
		
			
		<template v-for="child in uiprops.children">
		  
			<component   :is="getControlName(child)" v-bind:uiprops="child" 
						   v-bind:bean="bean" v-bind:index="index"
						   v-bind:parent="ref" v-bind:widget="ref.getWidget()">
			</component>
		
		
		
		</template> 
		
	</div>

</template>
		  `,
		  extends: baseComponent,
		  methods: {
			onLoad() {
				initComponent(this, this.uiprops.dataPath, this.uiprops.dataLoader, this.getLabel());	   
			},
			hasCustomHTML() {
				return this.uiprops.innerHTML || (this.uiprops.customProperties && this.uiprops.customProperties.customHTML);
			},
			getCustomHTML() {
				if (this.uiprops.customProperties && this.uiprops.customProperties.customHTML) {
					return this.uiprops.customProperties.customHTML(this);
				}
				else {
					return this.uiprops.innerHTML;
				}
			} 
		  }
	});

	
	
    
    Vue.component('cnx-panel', {
    	template: `
    	<template id="cnx-panel">
	<div  :key="updateToggle" :class="uiprops.styleClasses + theme.cell + '  items-start  cnx-cell row q-pa-xs '" :dark="theme.isDark"  v-if="visible">
	
	
	
	<div :id="uiprops.id" :class="(uiprops.isInnerPanel || !ref.getWidget().isRootWidget() ? theme.section : theme.panel) + '  items-start col-xs-12 row ' + (uiprops.isInnerPanel  || !ref.getWidget().isRootWidget() ? '' : 'shadow-4') ">
		<q-toolbar v-if="uiprops.label && !uiprops.hideHeader" dense fixed clipped-left app :class="uiprops.isInnerPanel ? theme.sectionBar : theme.panelBar" >
			<q-toolbar-title :class="' cnx-section-title text-subtitle '" floating font-weight-thin class="mr-5 align-center">
					{{ getLabel() }}
			</q-toolbar-title>
		</q-toolbar>
		<div class="col-xs-12 row">
			<component  v-for="child in uiprops.children" :is="getControlName(child)" v-bind:uiprops="child"  v-bind:index="index" 
			 v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()"></component> 
		</div>
	</div>
	</div> 
</template>
    	`,
		extends: cellComponent,
		methods: {
			hasHeader() {
				return this.uiprops.label && !this.uiprops.hideHeader;
			},
			onLoad() {
				initComponent(this, this.uiprops.dataPath, this.uiprops.dataLoader, this.getLabel());
				if (this.uiprops.addShortcutFromPageBar) {
					var pageWidget = this.$root.getGlobalComponent('pageWidget');
					pageWidget.addSectionNavButton(this);
				}
			}
		}
	});
    

	
	Vue.component('cnx-uirepeater', {
		  template: `
		  <template id="cnx-uirepeater">
			<div :class="uiprops.styleClasses + ' row '" :key="updateToggle">
			<template v-for="item, childindex in dataModel" >
				
				<component v-for="child in uiprops.children" :is="getControlName(child)" v-bind:uiprops="getUIProps(child)" 
					v-bind:bean="item" v-bind:index="(index ? (index + '_') : '') + childindex" 
					v-bind:parent="ref"  v-bind:widget="ref.getWidget()" >
				</component> 
				
			</template>
			</div>
		</template>
		  `,
		  extends: baseComponent,
		  methods: {
			  onLoad() {
				     
				  initComponent(this, this.uiprops.dataPath, this.uiprops.dataLoader, this.getLabel(), []);
				  //alert("UI Repeater loaded #2: " + this.uiprops.resourceId);
			  },
			  getUIProps(uiprops) {
				  //var childProps = eval("(" + JSON.stringify(uiprops) + ")");
				  var childProps = cloneObject(uiprops);
				  return childProps;
				  //return Object.assign({}, uiprops);
			  }			  
		  }
	});
	
	Vue.component('cnx-tabpage', {
		extends: cellComponent
	});
	
	Vue.component('cnx-tabcontrol', {
		template: `
		<template >
		  <div :class="uiprops.styleClasses + ' row '" :key="updateToggle">
		  
			  <q-tabs v-model="selectedTab" :align="getTabsAlignment()" class="col-xs-12" >
				  <q-tab v-for="tabPage in uiprops.children" v-if="isTabVisible(tabPage)" :name="tabPage.id" :label="getComponentLabel(tabPage)" :class="getLabelStyle(tabPage)">
			  </q-tabs>	
			   
			  <q-tab-panels v-model="selectedTab" animated transition-prev="jump-up" transition-next="jump-up" class="col-xs-12">
				   
				  <q-tab-panel v-for="child in uiprops.children" :name="child.id" v-if="isTabVisible(child)">
					  
					  
						<component   :is="getControlName(child)" v-bind:uiprops="child" 
						 v-bind:bean="bean" 
						 v-bind:parent="ref" v-bind:widget="ref.getWidget()">
						</component>
						  
				  </q-tab-panel>
				</q-tab-panels>
		  
		  
		  </div>
	  </template>
		`,
		extends: baseComponent,
		computed: {
			selectedTab: {
				get: function() {
					var selectedTab = this.uistate.selectedTab;
					if (!this.uistate.selectedTab && this.uiprops.children && this.uiprops.children.length > 0) {
						for (let t = 0; t < this.uiprops.children.length; t++) {
							if (this.isTabVisible(this.uiprops.children[t])) {
								 selectedTab = this.uiprops.children[t].id;
								 break;
							}
						}
						
						this.uistate.selectedTab = selectedTab;
					}
					return this.updateToggle ? selectedTab : selectedTab;
				},
				set: function(selectedTab) {
					this.uistate.selectedTab = selectedTab;
					this.updateToggle = !this.updateToggle; 
					this.handleTabChange();
				}
			}
		},
		methods: {
			isTabVisible(childProps) {
				var tabVisible = checkPermission(childProps.accessFunctionId, 1);
				console.log('tabVisible', tabVisible, childProps.label.default, childProps, childProps.accessFunctionId);
				return tabVisible;
			},
			changeTabPage(index) {
				var tabPage = this.uiprops.children[index];
				this.selectedTab = tabPage.id;
			},
			handleTabChange() {
				let t = 0;
				for (t = 0; t < this.uiprops.children.length; t++) {
					var tabPage = this.uiprops.children[t];
					if (tabPage.id == this.uistate.selectedTab) {
						this.handleEvent("ontabpagechanged", t);
					}
				}
			},
			getTabsAlignment() {
				  return this.uiprops.tabsAlignment ? this.uiprops.tabsAlignment : "left"; 
			},
			onLoad() {
				initComponent(this, this.uiprops.dataPath, this.uiprops.dataLoader, this.getLabel(), []);
				this.ref.tabControl = this;
			}		  
		}
  });
	
	
	Vue.component('cnx-dialog', {
		  template: `
		  
<template id="cnx-dialog">
	<div>
		<q-dialog v-model="showDialog" persistent @show="handleEvent('onshow')" >
	        <q-card :class="this.uiprops.styleClasses" :style="this.uiprops.style">
	          <q-card-section class="row items-center dialog text-grey-7" v-if="uiprops.label">
	          	<q-toolbar dense class="zerospace">
	          		<q-toolbar-title>
	          			{{ getLabel() }} 
	          		</q-toolbar-title>
	          		<q-btn dense flat icon="close" @click="handleEvent('onclose')" v-close-popup />
	          	</q-toolbar>
	            
	          </q-card-section>
	          
	          <q-separator ></q-separator>
	  
	  		  <q-card-section class="row items-center" >
	  		  	
	  		  	<component  v-for="child in uiprops.children" :is="child.controlName" v-bind:uiprops="child"  
			  		v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()"></component> 
	            			
	          </q-card-section>
	          
	          
	        </q-card>
      </q-dialog>		
	</div>

</template>
		  `,
		  extends: baseComponent,
		  computed: {
			  showDialog: {
				get: function() {
					var visible = false;
					if (this.uiprops.checkVisibility) {
						visible = this.visible;
					}
					var showDialog = this.uistate.showDialog || visible;
				  	return this.updateToggle ? showDialog : showDialog;
			  	},
			  	set: function(show) {
			  		this.uistate.showDialog = show;
			  		this.updateToggle = !this.updateToggle;
			  	}
			  }
		  },
		  methods: {
			  onLoad() {
				  initComponent(this, this.dataPath, this.uiprops.dataLoader, this.getLabel());
				  this.$root.registerEventListener("showDialog-" + this.uiprops.resourceId, this);
			  },
			  handleNotifyEvent(event, eventData) {
				  this.showDialog = eventData;
			  },
			  getUIProps(uiprops) {
				  return eval('(' + JSON.stringify(uiprops) + ")");
			  }			  
		  }
	});
	

	
var uiComponent = Vue.component('cnx-component', {
		props:['uiprops'],
    	methods: {
    		getAppLabel(labelKey) {
    			return this.$root.getLabel(labelKey);
    		},
    		getCustomParent() {
    			var p = this.$parent;
    			var nextParentFound = p.ref && p.uistate;
    			while (!nextParentFound) {
    				p = p.$parent;
    				nextParentFound = !p || p.ref;
    			}
    			return p;
    		},
    		getWidget() {
    			return this.getCustomParent().getWidget();
    		}
		}
	});


Vue.component('cnx-customcontrol', {
	  template: `
	  <template >
		<div :class="uiprops.styleClasses + ' row '" :key="updateToggle">
		 
		  	<component :is="uiprops.customControlName" v-bind:uiprops="uiprops.customControlProps" 
				v-bind:bean="bean" v-bind:index="index" 
				v-bind:parent="ref"  v-bind:widget="ref.getWidget()" >
			</component> 
		
		</div>
	</template>
	  `,
	  extends: baseComponent,
	  methods: {
		  onLoad() {
			  initComponent(this, this.uiprops.dataPath, this.uiprops.dataLoader, this.getLabel(), []);
		  },
		  getUIProps(uiprops) {
			  return Object.assign({}, uiprops);
		  }			  
	  }
});

