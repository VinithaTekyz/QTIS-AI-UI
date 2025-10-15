
var errorFields = [];

var fieldComponent = Vue.component('cnx-field', {
	extends: baseComponent,

	methods: {
		clearValue() {
			delete this.dataModel[this.fieldName];
			delete this.dataModel[this.fieldName + 'From'];
			delete this.dataModel[this.fieldName + 'To'];
			this.updateToggle = !this.updateToggle;
			this.key = this.key + 1;
		},
		handleClearClick() {
			this.key = this.key + 1;
			this.updateToggle = !this.updateToggle;
			if (this.uiprops.actions.searchOnClear) {
				this.handleSearchClick();
			}
		},
		handleSearchClick() {
			if (this.uiprops.reloadDataForParent && this.$parent.reloadData) {
				this.$parent.reloadData();
			}
			else {
				this.getCustomParent().reloadData();
			}
		},
		getDynamicAttribute(fieldName) {
			var label = this.uiprops[fieldName];
			if (label && label.startsWith("{") && label.endsWith("}")) {
				labelField = label.replace("{", "").replace("}", "");
				label = getValueAtPath(this.dataModel, labelField);
			}
			return label;
		},
		getPrependHTML() {
			if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.prepend) {
				var result = this.uiprops.customizationProperties.prepend(this.fieldValue, this.uiprops.fieldName, this.dataModel);
				return result;
			}
			return null;
		},
		getAppendHTML() {
			if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.append) {
				var result = this.uiprops.customizationProperties.append(this.fieldValue, this.uiprops.fieldName, this.dataModel);
				return result;
			}
			return null;
		},
		onFocus() {
			this.uistate.validationRequired = true;
			this.$root.registerGlobalComponent("focusedInput", this);
			this.handleEvent("onfocus");
		},
		onBlur() {
			console.log("on blur called");
			if (this.forceValueCorrection) {
				this.forceValueCorrection();
			}
			setTimeout(this.validateData, 200);
			var focused = this.$root.getGlobalComponent("focusedInput");
			if (focused == this) {
				this.$root.registerGlobalComponent("focusedInput", null);
			}
			this.handleEvent("onblur");
			this.handleEvent("onchange");  //uncommented for qtis validation
		},
		handleValueChange(newValue) {
			//this.handleEvent("onchange");
		},
		onLoad() {
			this.uistate.ignorePermissionView = true;
			if (this.uiprops.customTags) {
				if (this.uiprops.customTags.indexOf("#capture-voice") > -1) {
					this.$root.registerGlobalComponent("voiceInput", this);
				}
				else if (this.uiprops.customTags.indexOf("#capture-qrcode") > -1) {
					this.$root.registerGlobalComponent("qrInput", this);
				}
				else if (this.uiprops.customTags.indexOf("#capture-barcode") > -1) {
					this.$root.registerGlobalComponent("barInput", this);
				}
			}
			if (this.uiprops.fieldName.startsWith("'")) {
				this.uiprops.useFieldString = true;
				this.uiprops.fieldName = this.uiprops.fieldName.substring(1);
			}
			initComponent(this, this.dataPath + "." + this.uiprops.fieldName, null, this.getLabel(), "");
			//if (this.uiprops.custom)
			registerRequiredEntityData(this.dataModel, this.uiprops.fieldName);
		},
		onEnter: function () {
			if (this.uiprops.actions && this.uiprops.actions.search) {
				if (this.$refs.inputControl) {
					this.$refs.inputControl.blur();
				}
				Vue.nextTick(this.getCustomParent().reloadData);
				//Vue.nextTick(this.$refs.inputControl.focus);
			}
		},
		setValidationError(validationError, vargs) {
			if (!this.dataModel._validation) {
				this.dataModel._validation = {};
			}
			this.uistate.error = true;
			this.dataModel[this.uiprops.fieldName + "$validation"] = { code: validationError, args: vargs };
		},
		resetValidation() {
			this.uistate.error = false;
			delete this.uistate.errorMessage;
		},
		validateData(newValue, skipValidations) {

			try {
				if (!this.visible || this.readonly) {
					this.uistate.error = false;
					delete this.uistate.errorMessage;
					return true;
				}
				//delete this.uistate.pendingValidations;
				fieldVal = newValue ? newValue :
					(this.getValue ? this.getValue() : getValueAtPath(this.dataModel, this.uiprops.fieldName));
				if (this.uiprops.validations && this.uiprops.validations.length > 0 && !this.CheckSkipValidation()) {

					if (!('validationRequired' in this.uistate) || this.uistate.validationRequired) {

						this.uistate.error = false;
						delete this.uistate.errorMessage;

						for (v = 0; v < this.uiprops.validations.length; v++) {
							var validation = this.uiprops.validations[v];
							if (validationFunctions[validation.type]) {
								if (!validation.args) {
									validation.args = {};
								}
								if (validation.type == 'custom') {
									if (this.uistate.pendingValidations && !this.uistate.pendingValidationsComplete) {
										log("ui-update/validating", "Validations pending for: " + this.uiprops.resourceId);
										continue;
									}
								}

								var errorMsg = validationFunctions[validation.type]
									(fieldVal, validation.args, this.dataModel, this);


								if (errorMsg && errorMsg.length > 0) {
									if (errorMsg == "pending") {
										this.uistate.pendingValidations = validation;
										this.uistate.validationRequired = false;
										log("ui-update/validating", "STARTED Validations for: " + this.uiprops.resourceId);
									}
									else {
										//this.uistate.error = true;
										this.setValidationError(errorMsg, validation.args);
										this.uistate.errorMessage =
											(this.uistate.errorMessage ? (this.uistate.errorMessage + ".") : "") + errorMsg;
										break;
									}
								}
							}
						}

					}
				}
				else if (this.uiprops.controlName == 'cnx-field-text') {
					this.uiprops.validations = [{ type: "length", args: { min: 0, max: 250 } }];
					this.validateData(fieldVal);
				}

				this.uistate.hasValue = fieldVal ? true : false;

				//console.log("Validation Error: " + this.uistate.error);
				this.updateToggle = !this.updateToggle;
			}
			catch (e) {
				console.log("Error validating " + this.uiprops.fieldName + ": " + e);
			}

			if (this.uistate.error) {
				//Add To List IF NOT PRESENT
				errorFields.indexOf(this) === -1 && errorFields.push(this);
				//if(errorFields.indexOf(this) === -1 ) errorFields.push(this);
				//this.updateToggle = !this.updateToggle;
			}
			else {
				//Remove From List
				var index = errorFields.indexOf(this);
				if (index > -1) {
					errorFields.splice(index, 1);
				}
				//this.updateToggle = !this.updateToggle;
			}
			if (!skipValidations) {
				for (let e = 0; e < errorFields.length; e++) {
					var errorField = errorFields[e];
					errorField.validateData(null, true);
				}
			}

			return !this.uistate.error;
		},
		CheckSkipValidation() {
			if (this.uiprops.accessFunctionId.startsWith("entities.cq34wjwYMbuKeuE12nYnbphad") && this.uiprops.fieldName == "values.SSN") {
				if (customizationFunctions.getTenantOption) {
					return customizationFunctions.getTenantOption('personSSNNotRequired');
				}
				return false;
			}
			return false;
		},
		handleValidationResult(response) {
			if (this.uistate.pendingValidations) {
				this.uistate.pendingValidationsComplete = true;
				this.uistate.validationAPIError = false;
				if (response.result && response.result.toString() == "true") {
					this.uistate.pendingValidationsComplete = true;
					this.uistate.error = false;
					delete this.uistate.pendingValidations;
					log("ui-update/validating", "Validation OK Response for: " + this.uiprops.resourceId + " = " + response.result);
				}
				else {
					var validation = this.uistate.pendingValidations;
					var errorMsg = this.$root.getLocalizedLabel(validation.args.message)
					this.setValidationError(errorMsg, validation.args);
					this.uistate.errorMessage = errorMsg;
					this.uistate.validationAPIError = true;
					this.uistate.pendingValidationsComplete = false;
					delete this.uistate.pendingValidations;
					log("ui-update/validating", "Validation ERROR Response for: " + this.uiprops.resourceId + " = " + response.result);
				}

				log("ui-update/validating", "Validation Error State" + this.uiprops.resourceId + " = " + this.uistate.error);
				this.updateToggle = !this.updateToggle;
			}
		},
		logValueChange(oldValue, newValue) {
			if (oldValue != newValue) {
				var _changes = getValueAtPath(this.dataModel, '_changes');
				if (!_changes) {
					_changes = {};
					setValueAtPath(this.dataModel, '_changes', _changes);
				}
				if (!(_changes[this.uiprops.fieldName])) {
					var fieldId = this.uiprops.fieldName.replace('values.', '');
					_changes[fieldId] = {
						type: "field",
						resourceId: fieldId,
						label: this.getLabel(),
						action: (oldValue ? "Added" : "Updated"),
						oldValue: (oldValue ? oldValue : null)
					}
				}
			}
		}
	},

	computed: {
		hasError: function () {
			return this.updateToggle ? this.uistate.error : this.uistate.error;
		},
		readonly: function () {

			var readonly =
				('enabled' in this.uiprops && !this.uiprops.enabled) || !this.uistate.permissionView
				|| this.widget.uiprops.viewMode == "view"
				|| ((this.widget.uiprops.viewMode == "edit" || this.widget.uiprops.viewMode == "enabled") && !this.uistate.permissionEdit)
				|| (this.widget.uiprops.viewMode == "new" && !this.uistate.permissionCreate);

			if (!readonly && this.uiprops.checkEnabled) {
				readonly = !this.uiprops.checkEnabled(this.ref, this.widgetModel, this.widgetModel);
			}
			return this.updateToggle ? readonly : readonly;
		},
		fieldValue: {
			get: function () {
				console.log("this.uistate", this.uistate);
				var fieldVal = this.dataModel && this.uistate.permissionView ?
					(this.uiprops.useFieldString ?
						this.dataModel[this.uiprops.fieldName] :
						getValueAtPath(this.dataModel, this.uiprops.fieldName)) :
					(!this.uistate.permissionView ? "(Restricted)" : null);

				if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.get) {
					fieldVal = this.uiprops.customizationProperties.get(fieldVal, this.uiprops.fieldName, this.dataModel);
				}

				return this.updateToggle ? fieldVal : fieldVal;
			},
			set: function (newValue) {
				if (this.dataModel && this.uistate.permissionView) {
					var prevValue = this.fieldValue;
					if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.set) {
						newValue = this.uiprops.customizationProperties.set(newValue, this.uiprops.fieldName, this.dataModel);
					}
					else {
						if (this.uiprops.useFieldString) {
							this.dataModel[this.uiprops.fieldName] = newValue;
						}
						else {
							setValueAtPath(this.dataModel, this.uiprops.fieldName, newValue);
						}
					}
					this.logValueChange(prevValue, newValue);

					//this.updateToggle = !this.updateToggle;
				}
			}
		}
	}
});

var labelFieldTemplate = `
	<template id="cnx-field-label">
		<div :key="key" :functionid="uiprops.accessFunctionId" :class="getDynamicStyleClasses() + ' q-pa-sm  layer-enabled column-12 designer-enabled'" :style="dynamicStyle" :key="updateToggle" v-if="visible" 
			v-on:click="handleEvent('onclick')">
			
			<q-icon :name="iconInfo.iconName" v-if="iconInfo.iconName" :size="iconInfo.iconSize" class="dense"></q-icon>			
			<div :class="textStyleClass">{{ label }}</label>
			
		</div>
	</template>
		`;

Vue.component('cnx-field-label', {
	template: labelFieldTemplate,
	extends: fieldComponent,
	computed: {
		label: function () {
			var fieldVal = "";

			try {
				//console.log('### UI PROPS IN LABEL LOAD ' + JSON.stringify(this.uiprops));

				fieldVal = this.dataModel ? getValueAtPath(this.dataModel, this.uiprops.fieldName) : null;
				fieldVal = fieldVal ? fieldVal : this.getLabel();
			}
			catch (ex) {
				console.log('### ERROR OCCURED WHILE GETTING LABEL VALUE ### ' + this.uiprops.resourceId + ' ### ' + ex);
			}
			if (fieldVal) {
				var result = fieldVal.replace(/<\/?[^>]+(>|$)/g, "");
				result = result.replace(/&nbsp;/gi, " ");
				return result;
			} else {
				return '';
			}
		},
		iconInfo: function () {
			var iconName = "";
			var iconSize = "";

			try {
				var customTagsObj = {};

				if (this.uiprops.customTags && this.uiprops.customTags.length > 0) {
					customTagsObj = JSON.parse(this.uiprops.customTags.replace(/</g, '"').replace(/>/g, '"'));
				}

				var iconNameFromCustomTags = customTagsObj.icon;
				var iconSizeFromCustomTags = customTagsObj.iconsize;

				iconName = iconNameFromCustomTags;
				iconSize = iconSizeFromCustomTags;
			}
			catch (ex) {
				iconName = "";
				iconSize = "md";
				console.log('### ERROR OCCURED WHILE GETTING ICON FOR LABEL ### ' + this.uiprops.resourceId + ' ### ' + ex);
			}

			iconName = (iconName ? iconName.trim() : "");
			iconSize = (iconSize ? iconSize.trim() : "md");

			var iconData = {};

			iconData.iconName = iconName;
			iconData.iconSize = iconSize;

			//console.log('### GETTING ICON FOR LABEL ### ' + this.uiprops.resourceId + ' ### ' + JSON.stringify(iconData));

			return iconData;
		},
		textStyleClass: function () {
			var styleClass = "";

			try {
				if (this.iconInfo.iconName) {
					styleClass += "label-icon-text ";
				}

				var customTagsObj = {};

				if (this.uiprops.customTags && this.uiprops.customTags.length > 0) {
					customTagsObj = JSON.parse(this.uiprops.customTags.replace(/</g, '"').replace(/>/g, '"'));
				}

				if (customTagsObj.textStyleClass) {
					styleClass += customTagsObj.textStyleClass;
				}
			}
			catch (ex) {
				console.log('### ERROR OCCURED WHILE GETTING TEXT STYLE CLASS FOR ### ' + this.uiprops.resourceId + ' ### ' + ex);
			}

			return styleClass;
		}
	},
	methods: {
		getDynamicStyleClasses() {
			var styleClasses = this.uiprops.styleClasses;

			try {
				if (styleClasses && styleClasses.startsWith("{") && styleClasses.endsWith("}")) {
					styleClassesField = styleClasses.replace("{", "").replace("}", "");

					styleClasses = this.dataModel ? getValueAtPath(this.dataModel, styleClassesField) : "";
				}
			}
			catch (e) {
				console.log("### ERROR IN SETTING DYNAMIC STYLE CLASSES FOR LABEL " + e);
				styleClasses = "";
			}

			if (!styleClasses) {
				styleClasses = "";
			}

			return styleClasses;
		}
	}
});


var textFieldTemplate = `
	   <template id="cnx-field-text">

	
	<div :key="key" :functionid="uiprops.accessFunctionId" 
		
		:class="uiprops.styleClasses + ' cnx-input  q-pa-sm  layer-enabled column-12 designer-enabled'" :style="dynamicStyle + ';position:relative'" :key="updateToggle" 
		v-if="visible">
		
		<div ref="layer-menu" style="display:none;z-index:9999;">
			
		</div>  

		 <div class="print-only print-fieldValue" style="line-height:18px !important;" v-html="getTextForPrint()">
		 	
		 </div>
		<q-input dense ref="inputControl" :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="fieldValue" :readonly="readonly" 
			:error="hasError" :error-message="uistate.errorMessage ? uistate.errorMessage : null" @click="handleEvent('onclick')"
			v-on:keyup.enter="CheckEnter(uiprops)" hide-bottom-space  v-on:blur="validateData();" :autogrow="uiprops.controlName == 'cnx-field-textarea'"
			:label="getLabel()" :counter="uiprops.maxlength > 0" :maxlength="uiprops.maxlength"  
			 @input="handleValueChange" @focus="onFocus" @blur="onBlur" :class="uiprops.controlName == 'cnx-field-textarea' ? 'cnx-textarea' : ''"
			   v-if="uiprops.FilterSearch">
			<template v-slot:prepend v-if="getPrependHTML()">
				<div v-html="getPrependHTML()"></div>
			</template>
			<template v-slot:before v-if="uiprops.filterTypePath">
				<q-select class="cnx-field" :label="getLabel()" dense filled bg-grey-3 color="grey-10" :key="updateToggle"
					:options="[{l:'Contains',v:'contains'},{l:'Equals',v:'equal'},{l:'Is Blank',v:'blank'},{l:'Does Not Contain',v:'notcontains'},{l:'Not Equals',v:'notequal'},{l:'Not Blank',v:'notblank'}]"
					emit-value map-options option-value="v" option-label="l" @input="key = key + 1;updateToggle = !updateToggle;"
					v-model="dataModel._filterTypes[uiprops.fieldName]">
				</q-select> 
			</template>
			<template v-slot:append >
            	<q-icon v-if="uiprops.actions && uiprops.actions.clear && fieldValue" 
            		name="close" @click="fieldValue = '';handleClearClick();" class="cursor-pointer cnx-input-action" ></q-icon>
            	<q-btn class="cursor-pointer cnx-input-action" dense size="md" flat v-if="uiprops.actions && uiprops.actions.search" icon-right="search" @click="handleSearchClick()"></q-btn>
          </template>
		</q-input>

		<q-input dense ref="inputControl" :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="fieldValue" :readonly="readonly" 
			:error="hasError" :error-message="uistate.errorMessage ? uistate.errorMessage : null" @click="handleEvent('onclick')"
			v-on:keyup.enter="onEnter" hide-bottom-space  v-on:blur="validateData();" :autogrow="uiprops.controlName == 'cnx-field-textarea'"
			:label="getLabel()" :counter="uiprops.maxlength > 0" :maxlength="uiprops.maxlength"  
			 @input="handleValueChange" @focus="onFocus" @blur="onBlur" :class="uiprops.controlName == 'cnx-field-textarea' ? 'cnx-textarea' : ''"
			   v-if="!uiprops.FilterSearch">
			<template v-slot:prepend v-if="getPrependHTML()">
				<div v-html="getPrependHTML()"></div>
			</template>
			<template v-slot:before v-if="uiprops.filterTypePath">
				<q-select class="cnx-field" :label="getLabel()" dense filled bg-grey-3 color="grey-10" :key="updateToggle"
					:options="[{l:'Contains',v:'contains'},{l:'Equals',v:'equal'},{l:'Is Blank',v:'blank'},{l:'Does Not Contain',v:'notcontains'},{l:'Not Equals',v:'notequal'},{l:'Not Blank',v:'notblank'}]"
					emit-value map-options option-value="v" option-label="l" @input="key = key + 1;updateToggle = !updateToggle;"
					v-model="dataModel._filterTypes[uiprops.fieldName]">
				</q-select> 
			</template>
			<template v-slot:append >
            	<q-icon v-if="uiprops.actions && uiprops.actions.clear && fieldValue" 
            		name="close" @click="fieldValue = '';handleClearClick();" class="cursor-pointer cnx-input-action" ></q-icon>
            	<q-btn class="cursor-pointer cnx-input-action" dense size="md" flat v-if="uiprops.actions && uiprops.actions.search" icon-right="search" @click="handleSearchClick()"></q-btn>
          </template>
		</q-input>		
		
		<div class="fileinfo" v-if="CheckVal(uiprops)">
			<span>*</span> You can upload a maximum of one file at a time.
		</div>

	</div>
</template>

	   `;

var textField = Vue.component('cnx-field-text', {
	template: textFieldTemplate,
	extends: fieldComponent,
	methods: {
		CheckVal(props) {
			var divPopup = document.getElementsByClassName('contents-form');
			var divPopup1 = document.getElementsByClassName('content-form');
			if ((divPopup.length > 0 || divPopup1.length > 0) && props.fieldName == 'values.FileDescription') {
				return true;
			} else {
				return false;
			}
		},
		getTextForPrint() {
			var text = this.fieldValue;
			if (text && this.uiprops.controlName == 'cnx-field-textarea') {
				text = text.replace(/\n/g, "<br/>");
			}
			return text;
		},
		CheckEnter(uiprops) {
			if (uiprops.FilterSearch) {
				this.$root.emitEvent("TableSearch", true);
				return '';
			} else {
				return 'onEnter';
			}
		},
	}

});

Vue.component('cnx-field-textarea', {
	template: textFieldTemplate,
	extends: textField

});


var fileUploadDialog = Vue.component('cnx-du', {
	template: `<q-dialog class="q-pa-md q-gutter-sm" persistent v-model="openFileUpload">
					<q-card style="max-width: 700px;min-width: 700px;height: auto;">
						<q-card-section class="text-weight-thin text-primary">
							File Upload
							<q-btn icon="close" class="float-right" flat v-close-popup @click="closeDialog()" />
						</q-card-section>
						<q-separator />
						<q-card-section>
							<cnx-field-file 
								v-if="openFileUpload"
								:uistate="uistate"
								:theme="theme"
								v-bind:uiprops="uiprops" 
								v-bind:bean="bean" 
								v-bind:parent="ref" 
								v-bind:widget="ref.getWidget()"
								:addImage="addImage"
								:fileLimit="fileLimit"
								@files="getUploadedFiles"
							/>
							<div align="left" class="fileinfo col-md-6">
								<template>
									<span>*</span> You can upload a maximum of {{fileLimit}} image files.
								</template>
							</div>
						</q-card-section>
						<q-separator />
						<q-card-actions align="right" class="bg-white">
							<q-btn class="float-right save-button" flat @click="factoryFn">Save</q-btn>
							<q-btn class="float-right" flat @click="closeDialog">Cancel</q-btn>
						</q-card-section>
					</q-card>
				</q-dialog>`,
	extends: fieldComponent,
	data() {
		return {
			openFileUpload: false,
			uploadedFiles: [],
			uploading: false,
		};
	},
	props: ['openDU', 'addImage', 'fileLimit'],
	watch: {
		openDU(val) {
			this.openFileUpload = val;
		}
	},
	methods: {
		closeDialog() {
			this.uploadedFiles = [];
			this.openFileUpload = false;
			this.uploading = false;
			this.$emit('closeDU', false);
		},
		getUploadedFiles(files) {
			console.log("files:", files);
			this.uploadedFiles = [...this.uploadedFiles, ...files];
			this.fileLimit--;
		},
		factoryFn() {
			if ((window.relationsfileupload == "submitting" || this.uploading) && window.relationsfileupload != "successful") {
				this.$root.showDialog({
					show: true,
					title: 'Warning',
					message: 'Please wait. File upload is in progress.',
					icon: 'warning',
					showCancel: false,
					okButtonText: 'Ok',
				});
				this.uploading = true;
				return false;
			} else {
				if (this.uploadedFiles.length > 0) {
					this.uploadedFiles.forEach((file) => {
						this.$emit('uploadedFiles', file);
					});
					this.uploading = false;
					this.closeDialog();
				} else {
					this.$root.showDialog({
						show: true,
						title: 'Warning',
						message: 'Please upload files.',
						icon: 'warning',
						showCancel: false,
						okButtonText: 'Ok',
					});
					return false;
				}
			}
		},
		onRejected(rejectedEntries) {
			this.$emit('rejectedFiles: ', rejectedEntries);
		}
	}
});


var editorFieldTemplate = `
	    <template id="cnx-field-texteditor">
			<div :key="key" :functionid="uiprops.accessFunctionId" :class="uiprops.styleClasses + ' rel-Notes notes-field cnx-input  q-pa-sm  layer-enabled column-12 designer-enabled'" :style="dynamicStyle + ';position:relative'"  :key="updateToggle" v-if="visible">
				<div ref="layer-menu" style="display:none;z-index:9999;"></div>  
				<div class="print-only print-fieldValue" style="line-height:18px !important;"  v-html="getTextForPrint()"></div>
				
				<template v-if="fieldValue">
					{{TextValue(fieldValue, 'true')}}
				</template>
			<template v-if="!CheckFileUploadOptions()">	
				<q-editor dense ref="inputControl" :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="texteditorValue" :readonly="readonly" 
				:error="hasError" :error-message="uistate.errorMessage ? uistate.errorMessage : null" 
				 hide-bottom-space :label="getLabel()" :counter="uiprops.maxlength > 0" :maxlength="uiprops.maxlength"  
				  :class="uiprops.controlName == 'cnx-field-textarea' ? 'cnx-textarea' : ''" class="print-hide" 
				   @input="handleEditorChange()" ref="editor" :toolbar="[
				   [   
					 {
						label: $q.lang.editor.align,
						icon: $q.iconSet.editor.align,
						fixedLabel: true,
						options: ['left', 'center', 'right', 'justify']
					  }
					],
					[
					  {
						label: $q.lang.editor.fontSize,
						icon: $q.iconSet.editor.fontSize,
						fixedLabel: true,
						fixedIcon: true,
						list: 'no-icons',
						options: [
						  'size-1',
						  'size-2',
						  'size-3',
						  'size-4',
						  'size-5',
						  'size-6',
						  'size-7'
						]
					  },
					],
					['bold', 'italic', 'strike', 'underline'], ['rewrite','undo','aiAssist'], ['token'], ['removeFormat']]" :definitions="editorDefinitions">
					<template v-slot:token>
						<q-btn-dropdown dense no-caps ref="token" no-wrap unelevated color="white" text-color="primary" label="Text Color" size="sm">
						  <q-list dense class="editor-color-box">
							<q-item tag="label" clickable @click="color('foreColor', foreColor)">
							  <q-item-section>
								<q-color v-model="foreColor" no-header no-footer default-view="palette" :palette="[		'##FFFFFF', '#C0C0C0', '#808080', '#000000', '#FF0000', '#800000', '#00FF00', '#008000', '#00FFFF', '#008080', '#0000FF', '#000080', '#FF00FF', '#800080']" class="my-picker" />
							  </q-item-section>
							</q-item>
						  </q-list>
						</q-btn-dropdown>
					  </template>
				 </q-editor>

			<div v-if="showAiPopover"
     style="
       position: absolute;
       top: 40px;
       right: 0;
       background: white;
       border: 1px solid #ccc;
       border-radius: 8px;
       padding: 12px;
       min-width: 200px;
       z-index: 9999;
       width: 400px;
       box-shadow: 0 2px 8px rgba(0,0,0,0.30);
     ">

  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
    <div style="font-weight: bolder; color: #1976d2; font-style: italic;">Create Entities</div>
    <q-btn flat round dense icon="close" size="sm" style="color: #1976d2;" @click="showAiPopover = false">
      <q-tooltip>Close</q-tooltip>
    </q-btn>
  </div>

  <!-- Loader -->
  <div v-if="aiAssistLoading">Processing<q-spinner-dots size="2em" color="grey" /></div>

  <!-- Entities list -->
   <div v-else style="font-size: 12px; color: #555; overflow-y: auto;">
	<div v-if="parsedEntities.length === 0">No entities found. Please try again.</div>
      <div v-for="(entity, index) in parsedEntities" :key="index"
        class="q-mb-sm row items-center no-wrap justify-between"
        style="border: 0.1px solid #808080b0; padding: 8px; border-radius: 10px;">
        <div class="row items-center no-wrap">
          <div class="q-mt-sm" style="margin-right: 10px;">
            <q-icon v-if="entity.type === 'users'" name="manage_accounts" />
            <q-icon v-else-if="entity.type === 'clients'" name="engineering" />
            <q-icon v-else-if="entity.type === 'cases'" name="assignment_ind" />
            <q-icon v-else-if="entity.type === 'department'" name="corporate_fare" />
            <q-icon v-else-if="entity.type === 'notepad'" name="note" />
          </div>
          <div>
            <q-badge transparent style="background: #bdddfd52; border-color: #1976d2; color: #1976d2;"
              class="q-mr-sm">{{
              entity.type }}</q-badge>
            <br />
            <span v-if="entity.type === 'users'">
              <template v-if="entity.fields.firstName || entity.fields.lastName">
                {{ entity.fields.firstName || "" }} {{ entity.fields.lastName || "" }}
              </template>
              <template v-else>
                New User
              </template>
              <div>
                <small style="color: #555;">{{ entity.fields.email || "" }}</small>
              </div>
            </span>
            <span v-else-if="entity.type === 'clients'">
              <template v-if="entity.fields.firstName || entity.fields.lastName">
                <b>{{ entity.fields.firstName || '' }} {{ entity.fields.lastName || '' }}</b>
              </template>
              <template v-else>
                <b>New Client</b>
              </template>
            </span>
            <span v-else-if="entity.type === 'cases'">
              <b>New Case - {{entity.fields.caseNumber || 'New Case'}}</b>
            </span>
            <span v-else-if="entity.type === 'department'">
              Department: <b>{{ entity.fields.name || 'New Department' }}</b>
            </span>
            <span v-else-if="entity.type === 'notepad'">
              Notes: <b>{{entity.fields.notes.substring(0, 30)}}...</b>
            </span>
          </div>
        </div>
        <!-- Create Button -->
        <div class="q-mt-sm">
          <q-btn v-if="!entity.checked" round color="primary" icon="add" size="sm" @click="openEntityForm(entity, index)"/>
		  <q-btn v-else round color="primary" icon="task_alt" size="sm" />
        </div>
      </div>
   </div>
</div>

			</template>
			<template v-else>
				<q-editor dense ref="inputControl" :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="texteditorValue" :readonly="readonly" 
				:error="hasError" :error-message="uistate.errorMessage ? uistate.errorMessage : null" 
				 hide-bottom-space :label="getLabel()" :counter="uiprops.maxlength > 0" :maxlength="uiprops.maxlength"  
				  :class="uiprops.controlName == 'cnx-field-textarea' ? 'cnx-textarea' : ''" class="print-hide" 
				   @input="handleEditorChange()" ref="editor" :toolbar="[
				   [   
					 {
						label: $q.lang.editor.align,
						icon: $q.iconSet.editor.align,
						fixedLabel: true,
						options: ['left', 'center', 'right', 'justify']
					  }
					],
					[
					  {
						label: $q.lang.editor.fontSize,
						icon: $q.iconSet.editor.fontSize,
						fixedLabel: true,
						fixedIcon: true,
						list: 'no-icons',
						options: [
						  'size-1',
						  'size-2',
						  'size-3',
						  'size-4',
						  'size-5',
						  'size-6',
						  'size-7'
						]
					  },
					],
					['bold', 'italic', 'strike', 'underline'],  ['rewrite','undo','aiAssist'], ['upload'], ['token'], ['removeFormat']] :definitions="editorDefinitions"">
					<template v-slot:token>
						<q-btn-dropdown dense no-caps ref="token" no-wrap unelevated color="white" text-color="primary" label="Text Color" size="sm">
						  <q-list dense class="editor-color-box">
							<q-item tag="label" clickable @click="color('foreColor', foreColor)">
							  <q-item-section>
								<q-color v-model="foreColor" no-header no-footer default-view="palette" :palette="[	'##FFFFFF', '#C0C0C0', '#808080', '#000000', '#FF0000', '#800000', '#00FF00', '#008000', '#00FFFF', '#008080', '#0000FF', '#000080', '#FF00FF', '#800080']" class="my-picker" />
							  </q-item-section>
							</q-item>
						  </q-list>
						</q-btn-dropdown>
					  </template>
					  <template v-slot:upload>
						<q-btn dense no-caps ref="upload" no-wrap unelevated color="white" @click="openDialog" text-color="primary" label="File Upload" size="sm" />
					  </template>
				  </q-editor>
			<div v-if="showAiPopover"
     style="
       position: absolute;
       top: 40px;
       right: 0;
       background: white;
       border: 1px solid #ccc;
       border-radius: 8px;
       padding: 12px;
       min-width: 200px;
       z-index: 9999;
       width: 400px;
       box-shadow: 0 2px 8px rgba(0,0,0,0.30);
     ">

  <!-- Header -->
  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
    <div style="font-weight: bolder; color: #1976d2; font-style: italic;">Create Entities</div>
    <q-btn flat round dense icon="close" size="sm" style="color: #1976d2;" @click="showAiPopover = false">
      <q-tooltip>Close</q-tooltip>
    </q-btn>
  </div>

  <!-- Loader -->
  <q-spinner-dots v-if="aiAssistLoading" size="2em" color="grey" />

  <!-- Entities list -->
  <div v-else style="font-size: 12px; color: #555; overflow-y: auto; ">
   <div v-if="parsedEntities.length === 0">No entities found. Please try again.</div>
      <div v-for="(entity, index) in parsedEntities" :key="index"
        class="q-mb-sm row items-center no-wrap justify-between"
        style="border: 0.1px solid #808080b0; padding: 8px; border-radius: 10px;">
        <div class="row items-center no-wrap">
          <div class="q-mt-sm" style="margin-right: 10px;">
            <q-icon v-if="entity.type === 'users'" name="manage_accounts" />
            <q-icon v-else-if="entity.type === 'clients'" name="engineering" />
            <q-icon v-else-if="entity.type === 'cases'" name="assignment_ind" />
            <q-icon v-else-if="entity.type === 'department'" name="corporate_fare" />
            <q-icon v-else-if="entity.type === 'notepad'" name="note" />
          </div>
          <div>
            <q-badge transparent style="background: #bdddfd52; border-color: #1976d2; color: #1976d2;"
              class="q-mr-sm">{{
              entity.type }}</q-badge>
            <br />
            <span v-if="entity.type === 'users'">
              <template v-if="entity.fields.firstName || entity.fields.lastName">
                {{ entity.fields.firstName || "" }} {{ entity.fields.lastName || "" }}
              </template>
              <template v-else>
                New User
              </template>
              <div>
                <small style="color: #555;">{{ entity.fields.email || "" }}</small>
              </div>
            </span>
            <span v-else-if="entity.type === 'clients'">
              <template v-if="entity.fields.firstName || entity.fields.lastName">
                <b>{{ entity.fields.firstName || '' }} {{ entity.fields.lastName || '' }}</b>
              </template>
              <template v-else>
                <b>New Client</b>
              </template>
            </span>
            <span v-else-if="entity.type === 'cases'">
              <b>New Case - {{entity.fields.caseNumber || 'New Case'}}</b>
            </span>
            <span v-else-if="entity.type === 'department'">
              Department: <b>{{ entity.fields.name || 'New Department' }}</b>
            </span>
            <span v-else-if="entity.type === 'notepad'">
              Notes: <b>{{entity.fields.notes.substring(0, 30)}}...</b>
            </span>
          </div>
        </div>
        <!-- Create Button -->
        <div class="q-mt-sm">
          <q-btn v-if="!entity.checked" round color="primary" icon="add" size="sm" @click="openEntityForm(entity, index)"/>
		  <q-btn v-else round color="primary" icon="task_alt" size="sm" />
        </div>
      </div>
  </div>
</div>

			</template>
			<template v-if="CheckFileUploadOptions()">	
			<cnx-du
				:uistate="uistate"
				:theme="theme"
				v-bind:uiprops="uiprops" 
				v-bind:bean="bean" 
				v-bind:parent="ref" 
				v-bind:widget="ref.getWidget()"
				:addImage="addImage"
				:fileLimit="fileLimit"
				:openDU="openUpload" 
				@closeDU="closeDialog" 
				@uploadedFiles="factoryFn" 
				@rejectedFiles="onRejected"
			></cnx-du>
			</template>
			</div>
		</template>`;

Vue.component('cnx-field-texteditor', {
	template: editorFieldTemplate,
	extends: fieldComponent,
	data() {
		return {
			isRewritedisabled: false,
			texteditorValue: '',
			foreColor: '#000000',
			filesUploaded: [],
			suggestedText: '',
			showMenu: false,
			badgeActive: false,
			suggestedTextLoading: false,
			undoText: [],
			showAiPopover: false,
			aiAssistLoading: false,
			currentEntityIndex: null,
			isInputEmpty: true
		};
	},
	created() {
		this.$root.registerEventListener("itemSaved", this); // 👈 register listener
	},
	computed: {
		editorDefinitions() {
			return {
				rewrite: {
					tip: !this.suggestedTextLoading ? 'Rewrite Text' : this.suggestedText,
					icon: 'auto_awesome',
					label: this.suggestedTextLoading ? 'Rewriting...' : 'Rewrite with AI',
					round: true,
					color: this.suggestedTextLoading || this.isInputEmpty ? 'grey' : 'primary',
					disable: this.suggestedTextLoading || this.isInputEmpty,
					loading: this.suggestedTextLoading,
					handler: () => {
						this.getAISuggestions();
					}
				},
				undo: {
					tip: 'Undo AI text',
					icon: 'undo',
					label: 'Undo AI',
					round: true,
					disable: this.undoText.length === 0,
					color: this.undoText.length === 0 ? 'grey' : 'primary',
					handler: () => {
						if (this.undoText.length > 0) {
							this.texteditorValue = this.undoText.pop();
						}
					}
				},
				aiAssist: {
					//this is called from the toolbar button
					tip: 'AI Assistance',
					icon: 'smart_toy',
					label: 'AI Assist',
					round: true,
					color: this.isInputEmpty || this.aiAssistLoading ? 'grey' : 'primary',
					disable: this.isInputEmpty || this.showAiPopover,
					handler: () => {
						var HomeMenu = webModule;
						console.log("HomeMenu", HomeMenu);
						this.aiAssistLoading = true;
						this.getAiAssist();
						this.showAiPopover = true;
					}
				}
			}
		}
	},
	methods: {
		notifyEvent(event, eventData) {
			if (event === "itemSaved") {
				if (this.currentEntityIndex >= 0) {
					this.parsedEntities[this.currentEntityIndex].checked = true;
				}
			}
		},
		applySuggestion() {
			if (this.suggestedText !== '') {
				this.texteditorValue = this.suggestedText;
				this.suggestedText = '';
				this.badgeActive = false;
				this.showMenu = false;
			}
		},
		toggleSuggesstionBox() {
			this.showMenu = !this.showMenu;
		},
		async getAiAssist() {
			const parameters = {
				messages: [
					{
						"role": "system",
						"content": "ai_assist"
					},
					{ role: 'user', content: this.texteditorValue }
				],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleAiAssist);
		},
		handleAiAssist(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				let contents = data?.choices?.[0]?.message?.content || "Type to get AI suggestions...";
				console.log('AI Assist Result--------->', contents);
				contents = contents.replace(/```json|```/g, '').trim();
				this.parsedEntities = JSON.parse(contents).entities || [];
				this.parsedEntities = this.parsedEntities.map((entity) => ({
					...entity,
					checked: false
				}));
				console.log('AI Assist Result 1--------->', this.parsedEntities);
				this.aiAssistLoading = false;
			}
		},
		openEntityForm(entity, index) {
			this.currentEntityIndex = index;
			var widgetEntityForm = app.getGlobalComponent("widgetEntityForm");
			var record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX" }
			if (entity.type === 'users') {
				record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX", FirstName: entity.fields.firstName, LastName: entity.fields.lastName, Username: entity.fields.firstName + ' ' + entity.fields.lastName || '', Email: entity.fields.email, Phone: entity.fields.phoneNumber, Address: entity.fields.address }
				widgetEntityForm.newForm(this, record, "System Users - New", record.entityId, "new");
			} else if (entity.type === 'clients') {
				record = { rowState: 1, entityId: "c6l186nAXRsP4uaQ2Y8GWNfW", MiddleName: entity.fields.middleName, firstname: entity.fields.firstName, lastname: entity.fields.lastName, StreetAddress: entity.fields.streetAddress, Company: entity.fields.company, HomePhone: entity.fields.homePhone, CellPhone: entity.fields.cellPhone, Email: entity.fields.email, DOB: entity.fields.dateOfBirth, DL: !isNaN(entity.fields.DL) ? entity.fields.DL : null };
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
		async getAISuggestions() {
			this.suggestedText = '';
			this.suggestedTextLoading = true;
			const parameters = {
				messages: [
					{
						"role": "system",
						"content": "ai_rephraser"
					},
					{ role: 'user', content: this.texteditorValue }
				],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleResult);
		},
		handleResult(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				const reply = data?.choices?.[0]?.message?.content || "Type to get AI suggestions...";
				this.suggestedText = reply;
				this.badgeActive = this.suggestedText !== '' && !this.showMenu;
				this.suggestedTextLoading = false;
				this.undoText.push(this.texteditorValue);
				console.log('suggestedText ->', this.suggestedText);
				this.texteditorValue = this.suggestedText;
				console.log('texteditorValue ->', this.texteditorValue);
			}
		},
		CheckFileUploadOptions() {
			return (this.uiprops.accessFunctionId.startsWith("entities.cAoEQAjKmjIqRtwQ26QadeFX") && subTenantName == "ls100832") ? true : false;
		},
		getTextForPrint() {
			var text = this.fieldValue;
			if (text && this.uiprops.controlName == 'cnx-field-texteditor') {
				text = text.replace(/\n/g, "<br/>");
			}
			return text;
		},

		TextValue(textVal, hasValue) {
			if (hasValue) {
				this.isInputEmpty = false;
				if (this.texteditorValue == '') {
					this.texteditorValue = this.dataModel.Notes;
				}
			}
		},
		color(cmd, name) {
			const edit = this.$refs.editor;
			this.$refs.token.hide();
			edit.caret.restore();
			edit.runCmd(cmd, name);
			edit.focus();
		},
		isRTEEmpty(rteContent) {
			if (!rteContent) return true; // null, undefined, empty string

			// Remove spaces, &nbsp;, <br>, and other empty HTML tags
			const cleaned = rteContent
				.replace(/&nbsp;/g, '')   // remove non-breaking spaces
				.replace(/<br\s*\/?>/gi, '') // remove <br> or <br/>
				.replace(/<p>\s*<\/p>/gi, '') // remove empty paragraphs
				.trim();

			return cleaned === '';
		},
		handleEditorChange() {
			var newValue = this.texteditorValue;
			var prevValue = '';
			this.isInputEmpty = this.isRTEEmpty(newValue)
			this.logValueChange(prevValue, newValue, 'txtChanges');
		},
		logValueChange(oldValue, newValue) {
			if (oldValue != newValue) {
				var Notes = getValueAtPath(this.dataModel, 'Notes');
				var _changes = getValueAtPath(this.dataModel, '_changes');
				if (!Notes) {
					Notes = '';
					setValueAtPath(this.dataModel, 'Notes', newValue);
				} else {
					setValueAtPath(this.dataModel, 'Notes', newValue);
				}
				if (!_changes) {
					_changes = {};
					setValueAtPath(this.dataModel, '_changes', _changes);
				}
				if (!(_changes[this.uiprops.fieldName])) {
					var fieldId = this.uiprops.fieldName.replace('values.', '');
					_changes[fieldId] = {
						type: "field",
						resourceId: fieldId,
						label: this.getLabel(),
						action: (oldValue ? "Added" : "Updated"),
						oldValue: (oldValue ? oldValue : null)
					}
				}
			}
		}
	}
});

Vue.component('cnx-field-texteditorMsg', {
	template: editorFieldTemplate,
	extends: fieldComponent,
	data() {
		return {
			isRewritedisabled: false,
			texteditorValue: '',
			foreColor: '#000000',
			filesUploaded: [],
			suggestedText: '',
			showMenu: false,
			badgeActive: false,
			suggestedTextLoading: false,
			undoText: [],
			aiAssistLoading: false,
			parsedEntities: [],
			showAiPopover: false,
			currentEntityIndex: null,
			isInputEmpty: true
		}
	},
	created() {
		this.$root.registerEventListener("itemSaved", this); // 👈 register listener
	},
	computed: {
		editorDefinitions() {
			return {
				rewrite: {
					tip: !this.suggestedTextLoading ? this.suggestedText : 'Rewrite Text',
					icon: 'auto_awesome',
					label: this.suggestedTextLoading ? 'Rewriting...' : 'Rewrite with AI',
					round: true,
					color: this.suggestedTextLoading || this.isInputEmpty ? 'grey' : 'primary',
					disable: this.suggestedTextLoading || this.isInputEmpty,
					loading: this.suggestedTextLoading,
					handler: () => {
						this.getAISuggestions();
					}
				},
				undo: {
					tip: 'Undo AI text',
					icon: 'undo',
					label: 'Undo AI',
					round: true,
					disable: this.undoText.length === 0,
					color: this.undoText.length === 0 ? 'grey' : 'primary',
					handler: () => {
						if (this.undoText.length > 0) {
							this.texteditorValue = this.undoText.pop();
						}
					}
				},
				aiAssist: {
					tip: 'AI Assistance',
					icon: 'smart_toy',
					label: 'AI Assist',
					round: true,
					disable: this.isInputEmpty || this.showAiPopover,
					color: this.isInputEmpty || this.aiAssistLoading ? 'grey' : 'primary',
					handler: () => {
						var HomeMenu = webModule;
						console.log("HomeMenu", HomeMenu);
						this.aiAssistLoading = true;
						this.getAiAssist();
						this.showAiPopover = true;
					}
				}
			}
		}
	},
	methods: {
		notifyEvent(event, eventData) {
			if (event === "itemSaved") {
				if (this.currentEntityIndex >= 0) {
					this.parsedEntities[this.currentEntityIndex].checked = true;
				}
			}
		},
		applySuggestion() {
			if (this.suggestedText !== '') {
				this.texteditorValue = this.suggestedText;
				this.suggestedText = '';
				this.badgeActive = false;
				this.showMenu = false;
			}
		},
		toggleSuggesstionBox() {
			this.showMenu = !this.showMenu;
		},
		async getAiAssist() {
			const parameters = {
				messages: [
					{
						"role": "system",
						"content": "ai_assist"
					},
					{ role: 'user', content: this.texteditorValue }
				],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleAiAssist);
		},
		handleAiAssist(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				let contents = data?.choices?.[0]?.message?.content || "Type to get AI suggestions...";
				console.log('AI Assist Result--------->', contents);
				contents = contents.replace(/```json|```/g, '').trim();
				this.parsedEntities = JSON.parse(contents).entities || [];
				this.parsedEntities = this.parsedEntities.map((entity) => ({
					...entity,
					checked: false
				}));
				console.log('AI Assist Result 1--------->', this.parsedEntities.entities);
				this.aiAssistLoading = false;
			}
		},
		openEntityForm(entity, index) {
			this.currentEntityIndex = index;
			var widgetEntityForm = app.getGlobalComponent("widgetEntityForm");
			var record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX" }
			if (entity.type === 'users') {
				record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX", FirstName: entity.fields.firstName, LastName: entity.fields.lastName, Username: entity.fields.firstName + ' ' + entity.fields.lastName || '', Email: entity.fields.email, Phone: entity.fields.phoneNumber, Address: entity.fields.address }
				widgetEntityForm.newForm(this, record, "System Users - New", record.entityId, "new");
			} else if (entity.type === 'clients') {
				record = {
					rowState: 1, entityId: "c6l186nAXRsP4uaQ2Y8GWNfW", MiddleName: entity.fields.middleName, firstname: entity.fields.firstName, lastname: entity.fields.lastName, StreetAddress: entity.fields.streetAddress, Company: entity.fields.company, HomePhone: entity.fields.homePhone, CellPhone: entity.fields.cellPhone, Email: entity.fields.email,
					DOB: entity.fields.dateOfBirth, DL: !isNaN(entity.fields.DL) ? entity.fields.DL : null
				}
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
		async getAISuggestions() {
			this.suggestedTextLoading = true;
			this.suggestedText = '';
			const parameters = {
				messages: [
					{
						"role": "system",
						"content": "ai_rephraser"
					},
					{ role: 'user', content: this.texteditorValue }
				],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleResult);
		},
		handleResult(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				const reply = data?.choices?.[0]?.message?.content || "Type to get AI suggestions...";
				this.suggestedText = reply;
				this.badgeActive = this.suggestedText !== '' && !this.showMenu;
				this.suggestedTextLoading = false;
				this.undoText.push(this.texteditorValue);
				console.log('suggestedText ->', this.suggestedText);
				this.texteditorValue = this.suggestedText;
				console.log('texteditorValue ->', this.texteditorValue);
			}
		},
		CheckFileUploadOptions() {
			return (this.uiprops.accessFunctionId.startsWith("entities.cAoEQAjKmjIqRtwQ26QadeFX") && subTenantName == "ls100832") ? true : false;
		},
		getTextForPrint() {
			var text = this.fieldValue;
			if (text && this.uiprops.controlName == 'cnx-field-texteditorMsg') {
				text = text.replace(/\n/g, "<br/>");
			}
			return text;
		},
		TextValue(textVal, hasValue) {
			if (hasValue) {
				this.isInputEmpty = false;
				if (this.texteditorValue == '') {
					this.texteditorValue = this.dataModel.Message;
				}
			}
		},
		color(cmd, name) {
			const edit = this.$refs.editor;
			this.$refs.token.hide();
			edit.caret.restore();
			edit.runCmd(cmd, name);
			edit.focus();
		},
		isRTEEmpty(rteContent) {
			if (!rteContent) return true; // null, undefined, empty string

			// Remove spaces, &nbsp;, <br>, and other empty HTML tags
			const cleaned = rteContent
				.replace(/&nbsp;/g, '')   // remove non-breaking spaces
				.replace(/<br\s*\/?>/gi, '') // remove <br> or <br/>
				.replace(/<p>\s*<\/p>/gi, '') // remove empty paragraphs
				.trim();

			return cleaned === '';
		},
		handleEditorChange() {
			var newValue = this.texteditorValue;
			var prevValue = '';
			this.isInputEmpty = this.isRTEEmpty(newValue)
			this.logValueChange(prevValue, newValue, 'txtChanges');
		},
		logValueChange(oldValue, newValue) {
			if (oldValue != newValue) {
				var Message = getValueAtPath(this.dataModel, 'Message');
				var _changes = getValueAtPath(this.dataModel, '_changes');
				if (!Message) {
					Message = '';
					setValueAtPath(this.dataModel, 'Message', newValue);
				} else {
					setValueAtPath(this.dataModel, 'Message', newValue);
				}
				if (!_changes) {
					_changes = {};
					setValueAtPath(this.dataModel, '_changes', _changes);
				}
				if (!(_changes[this.uiprops.fieldName])) {
					var fieldId = this.uiprops.fieldName.replace('values.', '');
					_changes[fieldId] = {
						type: "field",
						resourceId: fieldId,
						label: this.getLabel(),
						action: (oldValue ? "Added" : "Updated"),
						oldValue: (oldValue ? oldValue : null)
					}
				}
			}
		}
	}
});

Vue.component('cnx-field-texteditorComments', {
	template: editorFieldTemplate,
	extends: fieldComponent,
	data() {
		return {
			isRewritedisabled: false,
			texteditorValue: '',
			foreColor: '#000000',
			uploaderFiles: null,
			filesUploaded: [],
			openUpload: false,
			addImage: true,
			fileLimit: 8,
			maxFiles: 8,
			suggestedText: '',
			showMenu: false,
			badgeActive: false,
			suggestedTextLoading: false,
			undoText: [],
			parsedEntities: [],
			aiAssistLoading: false,
			showAiPopover: false,
			currentEntityIndex: null,
			isInputEmpty: true
		}
	},
	created() {
		this.$root.registerEventListener("itemSaved", this); // 👈 register listener
		if (this.uiprops.accessFunctionId.startsWith("entities.cAoEQAjKmjIqRtwQ26QadeFX") && subTenantName == "ls100832" && FormState == 'New') {
			this.texteditorValue = '<table><tr><td colspan="2" style="width: 350px;"><img src="https://clientportal.qtis.us/common/images/LS-notes-logo.png" width="300px"/></td></tr><tr> <td colspan="2" style="font-weight: 700; width: 300px; font-size: 17px; text-decoration: underline; padding: 20px 0;">DAILY INVESTIGATIVE UPDATE</td></tr><tr> <td style="font-weight: 700; width: 245px; padding: 5px 0;">Claimant’s name<span style="float: right;">:</span></td><td style="font-weight: 700; width: 245px; padding: 5px 10px;"></td></tr><tr> <td style="font-weight: 700; width: 245px; padding: 5px 0;">LaSalle Investigations case #<span style="float: right;">:</span></td><td style="font-weight: 700; width: 245px; padding: 5px 10px;"></td></tr><tr> <td style="font-weight: 700; width: 245px; padding: 5px 0;">Injury<span style="float: right;">:</span></td><td style="font-weight: 700; width: 245px; padding: 5px 10px;"></td></tr><tr> <td style="font-weight: 700; width: 245px; padding: 5px 0;">Investigator<span style="float: right;">:</span></td><td style="font-weight: 700; width: 245px; padding: 5px 10px;"></td></tr><tr> <td style="font-weight: 700; width: 245px; padding: 5px 0;">Date and Times of Investigation<span style="float: right;">:</span></td><td style="font-weight: 700; width: 245px; padding: 5px 10px;"></td></tr><tr> <td style="font-weight: 700; width: 245px; padding: 5px 0;">Claimant video amount<span style="float: right;">:</span></td><td style="font-weight: 700; width: 245px; padding: 5px 10px;"></td></tr></table><div> <p style="text-decoration: underline; margin-bottom: 0;">Synopsis of Claimant Activity:</p><p style="margin: 0; min-height:20px;">During the surveillance,</p></div><div> <p style="text-decoration: underline; padding-top: 20px; margin-bottom: 0;">Case Status:</p><p style="margin-top: 0; min-height:20px;"></p></div><div class="images-thumbnail-wrap"> <p style="text-decoration: underline;">Pertinent video snapshots:</p><div class="images-thumbnail"></div></div><div> <p style="text-decoration: underline; padding-top: 20px; margin-bottom: 0;">Associated vehicles:</p><p style="margin-top: 0; min-height:20px;"></p></div><div> <p style="text-decoration: underline; padding-top: 20px; margin-bottom: 0;">Directions to residence:</p><p style="margin-top: 0; min-height:20px;"></p></div><div> <p style="text-decoration: underline; padding-top: 20px; margin-bottom: 0;">Surveillance position/pretext used:</p><p style="margin-top: 0; min-height:20px;"></p></div>';
		}
	},
	computed: {
		editorDefinitions() {
			return {
				rewrite: {
					tip: !this.suggestedTextLoading ? 'Rewrite Text' : this.suggestedText,
					icon: 'auto_awesome',
					label: this.suggestedTextLoading ? 'Rewriting...' : 'Rewrite with AI',
					round: true,
					color: this.suggestedTextLoading || this.isInputEmpty ? 'grey' : 'primary',
					disable: this.suggestedTextLoading || this.isInputEmpty,
					loading: this.suggestedTextLoading,
					handler: () => {
						this.getAISuggestions();
					}
				},
				undo: {
					tip: 'Undo AI text',
					icon: 'undo',
					label: 'Undo AI',
					round: true,
					disable: this.undoText.length === 0,
					color: this.undoText.length === 0 ? 'grey' : 'primary',
					handler: () => {
						if (this.undoText.length > 0) {
							this.texteditorValue = this.undoText.pop();
						}
					}
				},
				aiAssist: {
					tip: 'AI Assistance',
					icon: 'smart_toy',
					label: 'AI Assist',
					round: true,
					color: this.isInputEmpty || this.aiAssistLoading ? 'grey' : 'primary',
					disable: this.isInputEmpty || this.showAiPopover,
					handler: () => {
						var HomeMenu = webModule;
						console.log("HomeMenu", HomeMenu);
						this.aiAssistLoading = true;
						this.getAiAssist();
						this.showAiPopover = true;
					}
				}
			}
		}
	},
	methods: {
		notifyEvent(event, eventData) {
			if (event === "itemSaved") {
				if (this.currentEntityIndex >= 0) {
					this.parsedEntities[this.currentEntityIndex].checked = true;
				}
			}
		},
		applySuggestion() {
			if (this.suggestedText !== '') {
				this.texteditorValue = this.suggestedText;
				this.suggestedText = '';
				this.badgeActive = false;
				this.showMenu = false;
			}
		},
		toggleSuggesstionBox() {
			this.showMenu = !this.showMenu;
		},
		async getAiAssist() {
			const parameters = {
				messages: [
					{
						"role": "system",
						"content": "ai_assist"
					},
					{ role: 'user', content: this.texteditorValue }
				],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleAiAssist);
		},
		handleAiAssist(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				let contents = data?.choices?.[0]?.message?.content || "Type to get AI suggestions...";
				console.log('AI Assist Result--------->', contents);
				contents = contents.replace(/```json|```/g, '').trim();
				this.parsedEntities = JSON.parse(contents).entities || [];
				this.parsedEntities = this.parsedEntities.map((entity) => ({
					...entity,
					checked: false
				}));
				console.log('AI Assist Result 1--------->', this.parsedEntities.entities);
				this.aiAssistLoading = false;
			}
		},
		openEntityForm(entity, index) {
			this.currentEntityIndex = index;
			var widgetEntityForm = app.getGlobalComponent("widgetEntityForm");
			var record = { rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX" }
			if (entity.type === 'users') {
				record = {
					rowState: 1, entityId: "cl1dWqPym2tmGfJKzDnV3WiX", FirstName: entity.fields.firstName, LastName: entity.fields.lastName,
					Username: entity.fields.firstName + ' ' + entity.fields.lastName || '', Email: entity.fields.email, Phone: entity.fields.phoneNumber, Address: entity.fields.address
				}
				widgetEntityForm.newForm(this, record, "System Users - New", record.entityId, "new");
			} else if (entity.type === 'clients') {
				record = {
					rowState: 1, entityId: "c6l186nAXRsP4uaQ2Y8GWNfW", MiddleName: entity.fields.middleName, firstname: entity.fields.firstName, lastname: entity.fields.lastName, StreetAddress: entity.fields.streetAddress, Company: entity.fields.company,
					HomePhone: entity.fields.homePhone, CellPhone: entity.fields.cellPhone, Email: entity.fields.email, DOB: entity.fields.dateOfBirth, DL: !isNaN(entity.fields.DL) ? entity.fields.DL : null
				}
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
		async getAISuggestions() {
			this.suggestedText = '';
			this.suggestedTextLoading = true;
			const parameters = {
				messages: [
					{
						"role": "system",
						"content": "ai_rephraser"
					},
					{ role: 'user', content: this.texteditorValue }
				],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleResult);
		},
		handleResult(response) {
			if (response.status == 'OK') {
				const data = JSON.parse(response.result);
				const reply = data?.choices?.[0]?.message?.content || "Type to get AI suggestions...";
				this.suggestedText = reply;
				this.badgeActive = this.suggestedText !== '' && !this.showMenu;
				this.suggestedTextLoading = false;
				this.undoText.push(this.texteditorValue);
				console.log('suggestedText ->', this.suggestedText);
				this.texteditorValue = this.suggestedText;
				console.log('texteditorValue ->', this.texteditorValue);
			}
		},
		openDialog() {
			if (this.widgetModel[this.widgetModel.widgetDataBeanPath.replace('.data', '')].data.rowState != 1) {
				this.checkImages('', this.texteditorValue, 'txtChanges');
			}
			if (this.addImage) {
				this.openUpload = true;
			} else {
				this.$root.showDialog({
					show: true,
					title: 'Warning',
					message: 'You have already uploaded 8 files. Maximum file upload limit is 8.',
					icon: 'warning',
					showCancel: false,
					okButtonText: 'Ok',
				});
			}
		},
		closeDialog(val) {
			this.openUpload = val;
		},
		factoryFn(files) {
			// const formData = new FormData();
			// formData.append('files', files[0]);
			// var viewIdParts = viewId.split("-");
			// var apiURL = baseURL + 'upload/' + viewIdParts[0] + "/" + viewIdParts[1];
			this.filesUploaded.push(files);
			if (this.filesUploaded.length <= 8) {
				// fetch(apiURL, {
				// 	method: 'POST',
				// 	body: formData,
				// 	headers: {
				// 		"Authorization": token
				// 	},
				//   })
				//   .then(response => response.json())
				//   .then(data => {



				var elem = elem1 = document.querySelector("#newform-wrapper .images-thumbnail");
				var UpImgs = [];
				console.log(files)
				// var filepath = baseURL + data[0].fileURL;
				var filepath = files.fileURL;
				console.log('961 ->', filepath);
				var data = document.querySelector('.q-editor__content').innerHTML;

				var op = data.match(/<img/gim).length;
				var ImgC = + op;
				var IDecrement = (ImgC == 4) ? 1 : 2;
				if (elem) {
					elem.innerHTML += "<img src='" + filepath + "' alt='" + files.fileName + "' style='max-width: 264px; padding: 10px;'/>";
					var ImageDiv = $("#newform-wrapper .images-thumbnail img").length - IDecrement;

					console.log(ImageDiv)
					var isOdd = (ImgC % 2 == 0) ? 0 : 1;

					if (isOdd && ImgC > 1) {
						console.log('ADD BREAK >>>', op);
						UpImgs.push("<img src='" + filepath + "' alt='" + files.fileName + "' style='max-width: 264px; padding: 10px;'/><br/>")
						elem.innerHTML += "<br/>";
						// UpImgs.push("<br/>")
					} else {
						UpImgs.push("<img src='" + filepath + "' alt='" + files.fileName + "' style='max-width: 264px; padding: 10px;'/>")
					}

					console.log("UpImgs elemValue: ", elem);

					// var data = this.texteditorValue;
					// const dataDoc = new DOMParser().parseFromString(data, 'text/html');
					// console.log("dataDoc: ", dataDoc);
					// var s = dataDoc.querySelector("#newform-wrapper .images-thumbnail");
					// console.log("s: ", s);
					// const imageDiv = dataDoc.querySelector('.images-thumbnail');

					var htmlImg = UpImgs.join('');
					var htmlNew = '';
					var it = data.split('<div class="images-thumbnail">');

					htmlNew = it[0] + '<div class="images-thumbnail">' + htmlImg + it[1];

					document.querySelector('.q-editor__content').innerHTML = htmlNew;
					data = htmlNew;


					// var elem1 = data.querySelector('.images-thumbnail');
					// elem1.innerHTML = elem.innerHTML;

					console.log("data document: ", data);
					// console.log("imageDiv: ", imageDiv);
					// data = data.replace('<div class=\"images-thumbnail\"></div>', '<div class=\"images-thumbnail\">'+elem.innerHTML+'</div>');
					// console.log("dataValue: ", data);
					this.maxFiles--;
					this.logValueChange(this.texteditorValue, data, 'addingFiles');
				}
				//   })
				//   .catch(error => {
				// 	console.error(error)
				//   });
			} else {
				this.$root.showDialog({
					show: true,
					title: 'Warning',
					message: 'You have already uploaded 4 files. Maximum file upload limit is 4.',
					icon: 'warning',
					showCancel: false,
					okButtonText: 'Ok',
				});
			}
		},
		onRejected(rejectedEntries) {
			$q.notify({
				type: 'negative',
				message: `${rejectedEntries.length} file(s) not uploaded, Maximum file upload limit is 4.`
			})
		},
		CheckFileUploadOptions() {
			return (this.uiprops.accessFunctionId.startsWith("entities.cAoEQAjKmjIqRtwQ26QadeFX") && subTenantName == "ls100832") ? true : false;
		},
		getTextForPrint() {
			var text = this.fieldValue;
			if (text && this.uiprops.controlName == 'cnx-field-texteditorComments') {
				text = text.replace(/\n/g, "<br/>");
			}
			return text;
		},
		TextValue(textVal, hasValue) {
			if (hasValue) {
				this.isInputEmpty = false;
				if (this.texteditorValue == '') {
					this.texteditorValue = this.dataModel.comments;
				}
			}
		},
		color(cmd, name) {
			const edit = this.$refs.editor;
			this.$refs.token.hide();
			edit.caret.restore();
			edit.runCmd(cmd, name);
			edit.focus();
		},
		isRTEEmpty(rteContent) {
			if (!rteContent) return true; // null, undefined, empty string

			// Remove spaces, &nbsp;, <br>, and other empty HTML tags
			const cleaned = rteContent
				.replace(/&nbsp;/g, '')   // remove non-breaking spaces
				.replace(/<br\s*\/?>/gi, '') // remove <br> or <br/>
				.replace(/<p>\s*<\/p>/gi, '') // remove empty paragraphs
				.trim();

			return cleaned === '';
		},
		handleEditorChange() {
			var newValue = this.texteditorValue;
			var prevValue = '';
			this.isInputEmpty = this.isRTEEmpty(newValue)
			this.logValueChange(prevValue, newValue, 'txtChanges');
		},
		checkImages(oldValue, newValue, changed) {
			//checking images count in doc so usser can able to remove uploaded images from Doc and add new
			const doc = new DOMParser().parseFromString(newValue, 'text/html');
			const imageTags = doc.querySelectorAll('.images-thumbnail img');
			if (imageTags.length < 8 && changed == 'addingFiles') {
				if (this.maxFiles > 0) {
					this.fileLimit = 8 - imageTags.length;
					this.addImage = true;
					this.filesUploaded = [];
				} else {
					this.addImage = false;
				}
			} else if (changed == 'txtChanges') {
				//imageTags.length < 8
				var MaxUpFiles = imageTags.length + 8;

				this.fileLimit = MaxUpFiles - imageTags.length;
				this.filesUploaded = [];
				this.maxFiles = this.fileLimit;
				this.addImage = true;
			} else {
				this.addImage = false;
			}
		},
		logValueChange(oldValue, newValue, changed) {
			this.checkImages(oldValue, newValue, changed);
			if (oldValue != newValue) {
				var comments = getValueAtPath(this.dataModel, 'comments');
				var _changes = getValueAtPath(this.dataModel, '_changes');
				if (!comments) {
					comments = '';
					setValueAtPath(this.dataModel, 'comments', newValue);
				} else {
					setValueAtPath(this.dataModel, 'comments', newValue);
				}
				if (!_changes) {
					_changes = {};
					setValueAtPath(this.dataModel, '_changes', _changes);
				}
				if (!(_changes[this.uiprops.fieldName])) {
					var fieldId = this.uiprops.fieldName.replace('values.', '');
					_changes[fieldId] = {
						type: "field",
						resourceId: fieldId,
						label: this.getLabel(),
						action: (oldValue ? "Added" : "Updated"),
						oldValue: (oldValue ? oldValue : null)
					}
				}
				this.texteditorValue = newValue;
			}
		}
	}
});


var checkboxfield = Vue.component('cnx-field-checkbox', {
	template: `
		
<template id="cnx-field-checkbox">
	<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' cnx-validation-length cnx-input cnx-checkbox q-pa-sm  layer-enabled column-12 designer-enabled'" 
		v-if="visible" c-validation="length" :style="dynamicStyle + ';position:relative'">
		
		<q-field dense  :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color" c-validation="length" >
		<template v-slot:control >  
		<q-checkbox color="info" :label="getLabel()" @input="handleEvent('onchange')"
                    v-model="boolValue" :dark="theme.isDark" 
                    primary :disable="readonly" :error="hasError" :error-message="uistate.errorMessage"
                    hide-details
                  ></q-checkbox> 
        </template>
		</q-field>
	</div>
</template>
		`,
	extends: fieldComponent,
	methods: {
		onLoad() {
			this.uiprops.fieldName = this.uiprops.fieldName.replace("customValues.booleans.", "");
		}
	},
	computed: {
		boolValue: {
			get: function () {
				var fieldVal = this.dataModel ? getValueAtPath(this.dataModel, this.uiprops.fieldName) : null;
				fieldVal = fieldVal ? true : false;
				return this.updateToggle ? fieldVal : fieldVal;
			},
			set: function (newValue) {
				if (this.dataModel) {
					setValueAtPath(this.dataModel, this.uiprops.fieldName, newValue ? 1 : 0);
					//console.log(newValue.boolValue)
					if (this.uiprops.validations && this.uiprops.validations.length > 0) {
						this.validateData(newValue);
					}
					this.updateToggle = !this.updateToggle;
				}
			}
		}
	}

});

Vue.component('cnx-field-toggle', {
	template: `
	
<template id="cnx-field-checkbox">
<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' cnx-validation-length cnx-input cnx-checkbox q-pa-sm  layer-enabled column-12 designer-enabled'" 
	v-if="visible" c-validation="length" :style="dynamicStyle + ';position:relative'">
	
	<q-field dense :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color" c-validation="length" >
	<template v-slot:control >  
	<q-toggle color="info" :label="getLabel()" @input="handleEvent('onchange')"
                v-model="boolValue" :dark="theme.isDark" 
                primary :disable="readonly" :error="hasError" :error-message="uistate.errorMessage"
                hide-details
              ></q-toggle> 
    </template>
	</q-field>
</div>
</template>
	`,
	extends: checkboxfield
});

Vue.component('cnx-field-password', {
	template: `
		   <template id="cnx-field-password">

	
	<div :key="key" dense :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' cnx-input  q-pa-sm  layer-enabled column-12 designer-enabled'"  
	:style="dynamicStyle + ';position:relative'" :key="updateToggle" v-if="visible" 
		v-on:mouseover1="dynamicStyle = 'background-color:rgba(255,0,0,0.2);';" v-on:mouseleave="dynamicStyle = 'background-color:rgba(0,0,0,0.0);'; ">
		
		<div ref="layer-menu" style="display:none;z-index:9999;">
			
		</div>
		
		<q-input :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="fieldValue" :readonly="readonly" :error="hasError" :error-message="uistate.errorMessage"
			v-on:keyup.enter="onEnter" hide-bottom-space  v-on:blur="validateData();" :autogrow="uiprops.controlName == 'cnx-field-textarea'"
			:label="getLabel()" :counter="uiprops.maxlength > 0" :maxlength="uiprops.maxlength" 
			:type="updateToggle ? (uistate.showPassword ? 'password' : 'text') : (uistate.showPassword ? 'password' : 'text')" autocomplete="new-password">
			
		<template v-slot:append>
            <q-icon
              :name="uistate.showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="uistate.showPassword = !uistate.showPassword; updateToggle = !updateToggle;"
            ></q-icon>
          </template>
          
		</q-input>	 
		

	</div>
</template>
		   `,
	extends: fieldComponent
});



var fieldNumberTemplate = `
		<template id="cnx-field-number">
			<div :key="key" :functionid="uiprops.accessFunctionId" 
				 :style="dynamicStyle + ';position:relative'"
				:class="uiprops.styleClasses + ' cnx-input  q-pa-sm  layer-enabled column-12 designer-enabled'" v-if="visible" :key="updateToggle">
				
				<template v-if="fieldValue == 0 && ImportFields.includes(uiprops.resourceId)">
					<div class="print-printonly print-fieldValue"></div>
				</template>
				<template v-else>
					<div class="print-printonly print-fieldValue" >{{ fieldValue }}</div>
				</template>
				<q-input  dense :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color" 
					v-model="numericValue"   
					:style="'min-width:' + (uiprops.actions ? '130' : '60') + 'px !important'"
					:readonly="readonly" :error="hasError" :error-message="uistate.errorMessage"
					v-on:keyup.enter="onEnter" hide-bottom-space  
					:input-class="(fieldValue == '(Restricted)') ? 'text-left' : 'text-right'"
					:label="getLabel()" :counter="uiprops.maxlength > 0" :maxlength="uiprops.maxlength" 
					@input="handleValueChange"
					@focus="onFocus" @blur="adjustNumber">
					
				<template v-slot:prepend v-if="getPrependHTML() && fieldValue != '(Restricted)'">
					<div v-html="getPrependHTML()"></div>
				</template>
				
				  <template v-slot:append v-if="uiprops.actions">
						<q-icon v-if="uiprops.actions.clear && fieldValue" 
							name="close" @click="fieldValue = '';key++;updateToggle = !updateToggle;" class="cursor-pointer" ></q-icon>
						<q-btn class="cursor-pointer cnx-input-action" dense size="md" flat v-if="uiprops.actions.search" icon-right="search" @click="handleSearchClick()"></q-btn>
						<div v-if="getAppendHTML()" v-html="getAppendHTML()"></div>
				  </template>
				</q-input>	
			</div>
		</template>
				   `;

var numField = Vue.component('cnx-field-integer', {
	template: fieldNumberTemplate,
	extends: fieldComponent,
	data: function () {
		return {
			numValue: "",
			ImportFields: ['successcount', 'errorcount', 'totalcount', 'datacreated', 'dataupdated', 'datadeleted'],
		}
	},
	computed: {
		numericValue: {
			get: function () {
				if ((this.uiprops.customTags && !this.uiprops.customTags.includes("#noformat")) || !this.uiprops.customTags) {
					var currVal = this.adjustNumber(false, true, false);
					if (!this.numValue) {
						this.numValue = currVal;
					}
					else {
						var displayNum = Number(this.numValue.toString().replace(/,/g, ''));
						var currNum = Number(currVal.toString().replace(/,/g, ''));
						if (displayNum != currNum) {
							this.numValue = currVal;
						}
					}
				}
				if ((this.uiprops.customTags && this.uiprops.customTags.includes("#noformat"))) {

					if (!this.numValue) {
						var currVal = this.adjustNumber(false, true, false);

						this.numValue = (currVal) ? currVal : '';
					}
					else {
						var displayNum = Number(this.numValue.toString().replace(/,/g, ''));
						if (currVal) {
							var currNum = Number(currVal.toString().replace(/,/g, ''));
							if (displayNum != currNum) {
								this.numValue = (currVal) ? currVal : '';
							}
						}

					}
				}
				return this.numValue;
			},
			set: function (newValue) {
				if (newValue) {
					//if( (this.uiprops.customTags && !this.uiprops.customTags.includes("#noformat")) || !this.uiprops.customTags){
					if ((this.uiprops.customTags && !this.uiprops.customTags.includes("#noformat")) || !this.uiprops.customTags) {
						var numberval = newValue;
						newValue = newValue.replace(/[^0-9.,]/g, '');
						var numVal = Number(newValue.toString().replace(/,/g, ''));
						if (numberval.startsWith('-')) {
							numVal = '-' + numVal;
						}
					} else {
						var numVal = newValue;

					}
					if (this.dataModel && this.uistate.permissionView) {
						var prevValue = this.fieldValue;
						if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.set) {
							newValue = this.uiprops.customizationProperties.set(numVal, this.uiprops.fieldName, this.dataModel);
						}
						else {
							if (this.uiprops.useFieldString) {
								this.dataModel[this.uiprops.fieldName] = numVal;
							}
							else {
								setValueAtPath(this.dataModel, this.uiprops.fieldName, numVal);
							}
						}
						this.logValueChange(prevValue, numVal);
					}
					//}
					this.numValue = newValue;
				}
				else {
					setValueAtPath(this.dataModel, this.uiprops.fieldName, null);
					this.numValue = null;
				}
			}
		}
	},
	methods: {
		getCurrentValue() {
			var fieldVal = this.dataModel && this.uistate.permissionView ?
				(this.uiprops.useFieldString ?
					this.dataModel[this.uiprops.fieldName] :
					getValueAtPath(this.dataModel, this.uiprops.fieldName)) :
				(!this.uistate.permissionView ? "(Restricted)" : null);

			if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.get) {
				fieldVal = this.uiprops.customizationProperties.get(fieldVal, this.uiprops.fieldName, this.dataModel, this);
			}
			return fieldVal;
		},
		adjustNumber(event, skipOnBlur, setValue) {
			var fieldVal = this.getCurrentValue();

			//var val = this.numValue ? this.numValue : fieldVal;
			var val = fieldVal ? fieldVal : (this.numValue ? this.numValue : '');
			try {
				var maskParts = this.uiprops.mask.split(".");
				var digits = maskParts.length > 1 ? maskParts[1].length : 0;

				var fieldname = this.uiprops.fieldName.toLowerCase();
				if (val != "(Restricted)" && fieldname.indexOf('month') == -1 && fieldname.indexOf('year') == -1 && val != '.') {
					val = val ? Number(val.toString().replace(/,/g, '')).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }) : '';
				}
				if (!skipOnBlur || setValue) {
					this.numValue = val;
				}


				if (!skipOnBlur) {
					this.onBlur();
				}
			} catch (e) { console.log('Error getting fieldValue: ' + e); }
			return val;
		},
		getValue() {
			var fieldVal = this.getCurrentValue();
			console.log('fieldVal', fieldVal);
			return fieldVal;
		},
	}

});

Vue.component('cnx-field-double', {
	template: fieldNumberTemplate,
	extends: numField

});

Vue.component('cnx-field-decimal', {
	template: fieldNumberTemplate,
	extends: numField

});

var dateComponent = Vue.component('cnx-field-date', {
	template: `
			   <template >
				<div :key="key" :functionid="uiprops.accessFunctionId" 
					 :style="dynamicStyle + ';position:relative'"
					:class="uiprops.styleClasses + ' cnx-input cnx-input-date q-pa-sm  layer-enabled column-12 designer-enabled'" v-if="visible">
				
					<div class="print-only print-fieldValue" >{{ dateValue }}</div>
					
					<q-input dense  :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="dateValue" :readonly="readonly" :error="hasError" :error-message="uistate.errorMessage"
						v-on:keyup.enter="onEnter" hide-bottom-space 
						@focus="onFocus" @blur="onBlur" :style="'min-width:' + (uiprops.actions ? '210' : '150') + 'px !important'"
						:label="getLabel()" @input="dateChanged">
						
				
			        <template v-slot:append v-if="!readonly"> 
			          
			          <q-icon name="event" class="cursor-pointer cnx-input-action" v-if="!readonly">
			            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
			              <q-date v-model="dateValue" :mask="getDateFormat()" v-if="uiprops.resourceId == 'dob'" :options="CheckFutureDates" @input="handleDateChanged"></q-date>
			              <q-date v-model="dateValue" :mask="getDateFormat()" v-if="uiprops.resourceId != 'dob'" @input="handleDateChanged"></q-date>
			            </q-popup-proxy>
			          </q-icon>
			          

			          
			          <q-icon v-if="uiprops.actions && uiprops.actions.clear && dateValue" 
			            		name="close" @click="dateValue = '';key++;updateToggle = !updateToggle;" class="cursor-pointer cnx-input-action"  ></q-icon>
			          <q-btn class="cursor-pointer cnx-input-action"  dense size="md" flat v-if="uiprops.actions && uiprops.actions.search" icon-right="search" @click="handleSearchClick()"></q-btn>
			            	
			        </template>
			          
					</q-input>	
				</div>
			</template>
		   `,
	extends: fieldComponent,
	methods: {
		CheckFutureDates(date) {
			var CurrentDate = getDateFromBsonDate(new Date(), 'YYYY/MM/DD');
			return date <= CurrentDate
		},
		handleDateChanged(newValue) {
			if (this.$refs.qDateProxy) {
				this.$refs.qDateProxy.hide();
			}
			if (this.$refs.qTimeProxy) {
				this.$refs.qTimeProxy.hide();
			}
			this.handleEvent("onchange");
			this.updateToggle = !this.updateToggle;
		},
		getDateFormat() {
			return customizationFunctions.getDateFormat(this.uiprops.dateFormat);
		},
		getDateTimeFormat() {
			return customizationFunctions.getDateTimeFormat(this.uiprops.dateFormat);
		},
		getCustomLocale() {
			var customLocaleJP = {
				/* starting with Sunday */
				days: '?_?_?_?_?_?_?'.split('_'),
				daysShort: '?_?_?_?_?_?_?'.split('_'),
				months: '1?_2?_3?_4?_5?_6?_7?_8?_9?_10?_11?_12?'.split('_'),
				monthsShort: '1?_2?_3?_4?_5?_6?_7?_8?_9?_10?_11?_12?'.split('_'),
				firstDayOfWeek: 0
			};

			var customLocaleEN = {
				/* starting with Sunday */
				days: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
				daysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
				months: 'January_February_March_April_May_June_July_August_September_October_November_December'.split('_'),
				monthsShort: 'Jan_Feb_Mar_Apr_May_Jun_Jul_Aug_Sep_Oct_Nov_Dec'.split('_'),
				firstDayOfWeek: 0
			};

			var customLocale = customLocaleEN;
			var browserLocale = this.$q.lang.getLocale().toLowerCase();
			if (browserLocale == 'ja' || browserLocale == 'jp' || browserLocale == 'ja_jp') {
				customLocale = customLocaleJP;
			}

			return customLocale;
		},
		dateChanged(newValue) {
			if (!newValue) {
				delete this.dataModel[this.uiprops.fieldName.replace("values.", "")];
				this.updateToggle = !this.updateToggle;
			}
			//this.handleEvent("onchange");
		},
		setDateValue() {

		},
		forceValueCorrection() {

			var valid = false;
			var fieldVal = getValueAtPath(this.dataModel, this.uiprops.fieldName);
			if (fieldVal) {
				var mDt = moment(fieldVal.$date ? fieldVal.$date : fieldVal);
				if (mDt.isValid()) {
					setValueAtPath(this.dataModel, this.uiprops.fieldName, {});
					setValueAtPath(this.dataModel, this.uiprops.fieldName + ".$date", mDt._d.toISOString());
					valid = true;
				}
			}
			if (!valid) {
				var fieldVal = getValueAtPath(this.dataModel, this.uiprops.fieldName);
				if (fieldVal && fieldVal.$date) {
					delete fieldVal.$date;
				}
				setValueAtPath(this.dataModel, this.uiprops.fieldName, null);
			}

			/*
			var date = this.dateValue;
			var mDt = moment(date);
		if (!(mDt.isValid() && (mDt._pf.rfc2822 || mDt._pf.iso))) {
			this.dateValue = ""; 
			var fieldVal = getValueAtPath(this.dataModel, this.uiprops.fieldName);
			if (fieldVal && fieldVal.$date) {
				delete fieldVal.$date;
			}
			setValueAtPath(this.dataModel, this.uiprops.fieldName, null);
		}
		*/
		}
	},
	computed: {
		dateValue: {
			get: function () {
				var fieldVal;
				if (this.fieldValue == "(Restricted)") {
					fieldVal = this.fieldValue;
				}
				else {
					if (this.uiprops.fieldName) {
						this.uiprops.fieldName = this.uiprops.fieldName.replace("customValues.dates.", "");
					}
					fieldVal = getValueAtPath(this.dataModel, this.uiprops.fieldName);
					if (this.uiprops.customizationProperties && this.uiprops.customizationProperties.get) {
						fieldVal = this.uiprops.customizationProperties.get(fieldVal, this.uiprops.fieldName, this.dataModel, this);
					}
					if (fieldVal && fieldVal.$date) {
						var format = (this.uiprops.controlName == "cnx-field-date" || this.uiprops.controlName == "cnx-field-daterange") ?
							this.getDateFormat() : this.getDateTimeFormat();
						fieldVal = getDateFromBsonDate(fieldVal, format);
					}
				}
				return this.updateToggle ? fieldVal : fieldVal;
			},
			set: function (newValue) {
				var prevValue = this.dateValue;
				if (newValue) {
					var valid = false;
					if (!newValue.toISOString) {
						if (newValue && newValue.length ==
							((this.uiprops.rangeControlType == "cnx-field-date" || this.uiprops.controlName == "cnx-field-date" || this.uiprops.controlName == "cnx-field-daterange") ? 10 : 19)) {
							var mDt = moment(newValue);
							if (mDt.isValid()) {
								newValue = mDt._d;
								if (newValue.getFullYear() == 1899) {
									var today = new Date();
									today.setHours(newValue.getHours());
									today.setMinutes(newValue.getMinutes());
									newValue = today;
								}
								valid = true;
							}
						}
					}
					if (this.uiprops.fieldName) {
						this.uiprops.fieldName = this.uiprops.fieldName.replace("customValues.dates.", "");
					}

					if (valid) {
						setValueAtPath(this.dataModel, this.uiprops.fieldName, {});
						setValueAtPath(this.dataModel, this.uiprops.fieldName + ".$date", newValue.toISOString());
					}
					else {
						setValueAtPath(this.dataModel, this.uiprops.fieldName, newValue);
					}

					if (this.uiprops.validations && this.uiprops.validations.length > 0) {
						this.validateData(newValue);
					}

					this.updateToggle = !this.updateToggle;

					this.logValueChange(prevValue, newValue);
				}
				else {
					delete this.dataModel[this.uiprops.fieldName];
				}
			}
		}
	}

});

Vue.component('cnx-field-datetime', {
	template: `
			   <template id="cnx-field-datetime">
				<div :key="key" :functionid="uiprops.accessFunctionId" 
					 :style="dynamicStyle + ';position:relative'"
					:class="uiprops.styleClasses + ' cnx-input cnx-input-date q-pa-sm  layer-enabled column-12 designer-enabled'" v-if="visible">
				
					<div class="print-only print-fieldValue" >{{ dateValue }}</div>
					
					<q-input dense :filled="theme.fieldFilled" :outlined="theme.fieldOutline" :dark="theme.isDark" :color="theme.field.color"  v-model="dateValue" :readonly="readonly" :error="hasError" :error-message="uistate.errorMessage"
						v-on:keyup.enter="onEnter" hide-bottom-space 
						@focus="onFocus" @blur="onBlur" 
						:style="'min-width:' + (uiprops.actions ? '240' : '190') + 'px !important'"
						:label="getLabel()" @input="dateChanged;console.log('date changed log 1')">
						
				
			        <template v-slot:append v-if="!readonly"> 
			          
			          <q-icon name="event" class="cursor-pointer cnx-input-action" v-if="!readonly">
			            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
			              <q-date v-model="dateValue" :mask="getDateTimeFormat()" @input="handleDateChanged"></q-date>
			            </q-popup-proxy>
			          </q-icon>
			          
			          <q-icon name="access_time" class="cursor-pointer cnx-input-action" v-if="!readonly">
			            <q-popup-proxy ref="qTimeProxy" transition-show="scale" transition-hide="scale">
			              <q-time v-model="dateValue" :mask="getDateTimeFormat()" :format24h="!getDateTimeFormat().endsWith('a')" @input="handleDateChanged"></q-time>
			            </q-popup-proxy>
			          </q-icon>
			          
			          <q-icon v-if="uiprops.actions && uiprops.actions.clear && dateValue" 
			            		name="close" @click="dateValue = '';key++;updateToggle = !updateToggle;" class="cursor-pointer cnx-input-action"  ></q-icon>
			          <q-btn class="cursor-pointer cnx-input-action"  dense size="md" flat v-if="uiprops.actions && uiprops.actions.search" icon-right="search" @click="handleSearchClick()"></q-btn>
			            	
			        </template>
			          
					</q-input>	
				</div>
			</template>

		   `,
	extends: dateComponent
});



Vue.component('cnx-field-image', {
	template: `
		<template id="cnx-field-image">
	<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' row q-pa-sm  layer-enabled column-12 designer-enabled'" 
		:style="dynamicStyle" 
		:key="updateToggle" v-if="visible"  
		> 
			
			<q-img basic class="captionBackground ? shadow-1" :src="imagePath" :style="'width: ' + uiprops.imageWidth + ';height:' + uiprops.imageHeight" >
				    
				<div :class="'items-center absolute-bottom text-subtitle1'" 
					v-on:click="handleEvent('onclick')"
					:style="'vertical-align:middle;background-color:' + captionBackground + ';' + (uiprops.eventHandlers && uiprops.eventHandlers.onclick ? 'cursor:pointer' : '')" 
					v-if="captionBackground">
	               <span :style="'font-size:' + uiprops.valueFontSize + 'px'">{{ fieldValue }}</span>
	               <q-icon class="float-right" v-if="captionIcon && captionIcon != 'none'" :name="captionIcon" :size="uiprops.iconSize + 'px'"> </q-icon>
	               
	            </div>
	            
            </q-img>
				
	</div> 
</template>
		`,
	extends: fieldComponent,
	computed: {
		imagePath: function () {
			var imagePath = this.getDynamicAttribute('imagePath');
			return this.updateToggle ? imagePath : imagePath;
		},
		captionBackground: function () {
			var backgroundColor = this.getDynamicAttribute('backgroundColor');
			return this.updateToggle ? backgroundColor : backgroundColor;
		},
		captionIcon: function () {
			var icon = this.getDynamicAttribute('icon');
			return this.updateToggle ? icon : icon;
		},
	},
	methods: {

	}
});


Vue.component('cnx-field-indicator', {
	template: `<template id="cnx-field-indicator">
	<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' row q-pa-sm  layer-enabled column-12 designer-enabled'" :style="'cursor:pointer;' + dynamicStyle" :key="updateToggle" v-if="visible" 
		v-on:mouseover1="dynamicStyle = 'background-color:rgba(255,0,0,0.2);';" v-on:mouseleave="dynamicStyle = 'background-color:rgba(0,0,0,0.0);'; ">
		
		<div :class="'col-md-12 q-pa-sm row  bg-' + getDynamicAttribute('backgroundColor') +  ' text-' + getDynamicAttribute('fontColor') " 
		v-on:click="handleEvent('onclick')">
				<div class="col-md-12 float-right text-h6">
					<q-icon :name="uiprops.icon" size="md" class="dense"></q-icon>
					<div class="float-right">{{ displayValue }}</div>
				</div>
				<div class="col-md-12  text-body2"><div class="float-right">{{ getDynamicLabel() }}</div></div>
		</div>
				
	</div> 
</template>`,
	extends: fieldComponent,
	computed: {
		displayValue: function () {
			var val = "";

			try {
				//console.log('### DATA MODEL IN INDICATOR LOAD ### ' + JSON.stringify(this.dataModel));
				val = this.dataModel ? getValueAtPath(this.dataModel, this.uiprops.fieldName) : "";
			}
			catch (e) {
				console.log("### ERROR IN SETTING VALUE OF INDICATOR " + e);
				val = "";
			}

			return val;
		}
	},
	methods: {
		onLoad() {

		},
		getDynamicLabel() {
			var label = this.getLabel();

			try {
				if (label && label.startsWith("{") && label.endsWith("}")) {
					labelField = label.replace("{", "").replace("}", "");

					label = this.dataModel ? getValueAtPath(this.dataModel, labelField) : "";
				}
			}
			catch (e) {
				console.log("### ERROR IN SETTING DYNAMIC LABEL OF INDICATOR " + e);
				label = "";
			}

			return label;
		}
	}
});

Vue.component('cnx-field-qrcodescanner', {
	template: `<template id="cnx-field-qrcodescanner">
					<q-btn :functionid="uiprops.accessFunctionId"  class="q-mr-xs" standard icon="filter_center_focus" color="blue" 
							style="margin-left: 5px;"  size="18px" v-if="visible" @click="startQRInput()"></q-btn>
					
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
				  </template>`,
	extends: fieldComponent,
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
		}
	},
	methods: {
		/******************	QR SCANNING	******************/
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
		}
	}
});


var gaugeTemplate = `<template >
		<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' row q-pa-sm  layer-enabled column-12 designer-enabled'" 
			:style="'cursor:pointer;'" :key="updateToggle" v-if="visible" >
			
			<div class="row col-xs-12 justify-center"> 
						<div class="col-auto text-body clickable" style="cursor:pointer" @click="handleEvent('onclick')">
							{{ getDynamicLabel() }} 
						</div> 
						<div class="col-xs-12 row justify-center">
						
						<q-circular-progress :value="fieldValue" show-value :size="getHeight()" 
					      :track-color="getColor('background', 'grey-3')" :min="getNum('minValue', 0)" :max="getNum('maxValue', 100)"
					      :color="getColor('foreground', 'orange')" class="q-ma-md"
					    />
						</div>
						
			</div>
					
		</div> 
	</template>`;

var gaugeField = Vue.component('cnx-field-gauge', {
	template: gaugeTemplate,
	extends: fieldComponent,
	methods: {
		getHeight() {
			var guageHeight = this.uiprops.gaugeHeight;
			if (!guageHeight) {
				guageHeight = "60px";
			}
			else if (!guageHeight.endsWith("px")) {
				guageHeight = guageHeight + "px";
			}
			return guageHeight;
		},
		getColor(type, defaultColor) {
			var color = this.uiprops[type + 'Color'];
			if (!color) { color = defaultColor; }
			return color;
		},
		getNum(field, defaultValue) {
			var num = this.uiprops[field];
			if (!(num && !isNaN(num))) {
				num = defaultValue;
			}
			return num;
		},
		getDynamicLabel() {
			var label = this.getLabel();

			try {
				if (label && label.startsWith("{") && label.endsWith("}")) {
					labelField = label.replace("{", "").replace("}", "");

					label = this.dataModel ? getValueAtPath(this.dataModel, labelField) : "";
				}
			}
			catch (e) {
				console.log("### ERROR IN SETTING DYNAMIC LABEL OF INDICATOR " + e);
				label = "";
			}

			return label;
		}
	}
});


Vue.component('cnx-gauge', {
	template: gaugeTemplate,
	extends: gaugeField
});

var valRangeTemplate = `
		<template >
		<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' row '" 
			:style="'cursor:pointer;'" :key="updateToggle" v-if="visible" >
			
			<div class="row col-xs-12 items-center "> 
				
				<div class="row col">
					<component :is="rangeControlType" v-bind:uiprops="startProps" 
						v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()" />
				</div>
				<div class="row col-auto justify-center">
					<span class="text-h4 zerospace">~</span>
				</div>
				<div class="row col">
					<component :is="rangeControlType" v-bind:uiprops="endProps" 
						v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()" />
				</div>
			</div>
					
		</div> 
	</template>
	`;

var rangeField = Vue.component('cnx-field-valrange', {
	template: valRangeTemplate,
	extends: fieldComponent,
	computed: {
		startProps: function () {
			var startProps = this.uistate.startProps;
			if (!startProps) {
				startProps = mergeDeep({}, this.uiprops);
				startProps.controlName = this.uiprops.rangeControlType;
				startProps.fieldName = this.uiprops.rangeStartFieldName;
				startProps.label = mergeDeep({}, startProps.label);
				startProps.label.default = startProps.label.default + " (From)";
				startProps.styleClasses = " col-xs-12 ";
				this.uistate.startProps = startProps;
			}
			return this.updateToggle ? startProps : startProps;
		},
		endProps: function () {
			var endProps = this.uistate.endProps;
			if (!endProps) {
				endProps = mergeDeep({}, this.uiprops);
				endProps.controlName = this.uiprops.rangeControlType;
				endProps.label = mergeDeep({}, endProps.label);
				endProps.label.default = endProps.label.default + " (To)";
				endProps.fieldName = this.uiprops.rangeEndFieldName;
				endProps.styleClasses = " col-xs-12 ";
				this.uistate.endProps = endProps;
			}
			return this.updateToggle ? endProps : endProps;
		},
		rangeControlType: function () {
			var rangeControlType = this.uiprops.rangeControlType ? this.uiprops.rangeControlType : this.uiprops.controlName.replace("range", "");
			return this.updateToggle ? rangeControlType : rangeControlType;
		}
	},
	methods: {
		reloadData() {
			if (this.uiprops.reloadDataForParent && this.$parent.reloadData) {
				this.$parent.reloadData();
			}
			else {
				this.getCustomParent().reloadData();
			}
		}
	}
});

Vue.component('cnx-field-daterange', {
	extends: rangeField
});
Vue.component('cnx-field-datetimerange', {
	extends: rangeField
});
Vue.component('cnx-field-integerrange', {
	extends: rangeField
});
Vue.component('cnx-field-decimalrange', {
	extends: rangeField
});
Vue.component('cnx-field-doublerange', {
	extends: rangeField
});


Vue.component('cnx-field-rangefilter', {
	extends: rangeField,
	data: function () {
		return {
			filterType: "range",
			filterOptions: [
				{ l: "Equals", v: "equal" },
				{ l: "Between", v: "between" },
				{ l: "Greater than", v: "greaterThan" },
				{ l: "Greater or Equal to", v: "greaterThanEqualTo" },
				{ l: "Lesser than", v: "lessThan" },
				{ l: "Lesser or Equal to", v: "lessthanequalto" },
				{ l: "Not Equals", v: "notequal" },
				{ l: "Is Blank", v: "blank" },
				{ l: "Not Blank", v: "notblank" }
			]
		}
	},
	template: `
			<template >
			<div :key="key" :functionid="uiprops.accessFunctionId"  :class="uiprops.styleClasses + ' row '" 
				:style="'cursor:pointer;'" :key="updateToggle" v-if="visible" >
				
				<div class="row col-xs-12 items-center "> 
					
					
						
						<q-select :label="getLabel()" dense filled bg-grey-3 class="col-auto q-field__before" color="grey-10" 
								:options="filterOptions" emit-value map-options option-value="v" option-label="l" 
								@input="changeFilterType()" v-model="dataModel._filterTypes[uiprops.fieldName]">
						</q-select> 
						
						<div class="row col items-center " v-if="dataModel._filterTypes[uiprops.fieldName] == 'between'"> 
				
							<div class="row col-auto">
									<component :is="rangeControlType" v-bind:uiprops="startProps" 
										v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()" />
							</div>
							<div class="row col-auto justify-center">
								<span class="text-h4 zerospace">~</span>
							</div>
							<div class="row col-auto">
								<component :is="rangeControlType" v-bind:uiprops="endProps" 
										v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()" />
							</div>
						</div>
						<div class="row col items-center " v-else>
								<component :is="rangeControlType" v-bind:uiprops="uiprops" 
										v-bind:bean="bean" v-bind:parent="ref" v-bind:widget="ref.getWidget()" />
						</div>
				
						
			        <q-btn-group v-if="false">
			          
			          <q-btn flat unelevated dense v-if="hasValue()" 
			            		icon="close" @click="clearValue()" class="cursor-pointer cnx-input-action"  ></q-btn>
			          <q-btn flat unelevated dense class="cursor-pointer cnx-input-action"  dense size="md" 
			          	flat icon-right="search" @click="handleSearchClick()"></q-btn> 
			            	
			        </q-btn-group>						
						
						
					</div>

				</div>
						
			</div> 
		</template>
		`,
	methods: {
		changeFilterType() {
			this.clearValue();
			this.uiprops.rangeControlType = this.rangeControlType;
			var filterType = this.dataModel._filterTypes[this.uiprops.fieldName];
			if (this.rangeControlType == 'cnx-field-date'
				&& (filterType.indexOf('equal') > -1 || filterType.indexOf('notequal') > -1)) {

				var onChangeHandler = {

				}
			}
		},
		hasValue() {
			return this.dataModel[this.uiprops.fieldName] || this.dataModel[this.uiprops.fieldName + 'From']
				|| this.dataModel[this.uiprops.fieldName + 'To'];
		}

	}
});


