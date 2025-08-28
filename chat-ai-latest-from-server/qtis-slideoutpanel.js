var previewSelectedOpen;
var TableId = '';
var basicFieldsAdded = false;

var getSlideoutPanelTemplate = `
<q-dialog content-class="right-panel-dialog custom_right_panel" v-model="showHoverInfotwo" position="right"
				full-height style="padding: 0px !important; height: 100vh !important;">
				<q-card style="max-width: 500px;min-width: 350px;">
					<q-card-section align="right" class="q-pb-none right-panel-header">
                        <div class="file-title q-pa-xs text-left" :title="sidepannelTitle">
                            <span> {{sidepannelTitle}}</span>
                        </div>
						<div v-if="notContent" class="file-count q-pa-xs text-right">
							<span><i aria-hidden="true"
									class="material-icons q-icon text-white q-ml-sm cnx-list-editicon">folder</i>
								<div class="file-counter">{{totalFiles}}</div>
							</span>
						</div>
						<q-btn icon="close" flat round dense v-close-popup
							@click="showHoverInfotwo = false; fieldsArray = [];" />
					</q-card-section>
					<q-card-section align="center">


				
            <div id="rightSlidePanel" class="right-panel-body"></div>
    
						<div class="copy-clipboard" id="copyClipboard" style="display:none">
							Copied to Clipboard!
						</div>
						<div class="edit-export right-panel-footer">
							<div class="row">
								<div class="col-xs-12 col-sm-12 col-md-12 col-lg-12">
									<div class="record-date q-px-xs">
										<div onclick="copyRecordId()" title="Click to copy Record ID"
											style="cursor: pointer;"
											class='col-xs-12 col-sm-12 col-md-12 col-lg-12 text-left q-pr-sm text-weight-light text-caption ellipsis'>
											<span class="text-left record-copy">Record ID</span>
											<q-icon dense style="cursor:pointer;" name="copy"
												class="cnx-list-expandicon" color="purple">
											</q-icon>
										</div>

										<div class="row">
											<div
												class='col-xs-12 col-sm-12 col-md-6 col-lg-6 text-left q-pr-sm text-weight-light text-caption ellipsis'>
												<span class="text-left" id="record_id">{{ currentSelectedRow.Id
													}}</span>
											</div>
											<div
												class='col-xs-12 col-sm-12 col-md-6 col-lg-6 text-right q-pr-sm text-weight-light text-caption ellipsis'>
												<span class="text-right">{{ currentSelectedRow.CreatedDate }}</span>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div class="slidepanel-buttons">
                            <!--<div class="slide-edit slide-btn">
									<q-btn 
                                        v-close-popup 
                                        v-if="checkPermission(uiprops.accessFunctionId, 8)"
                                        @click="onEdit(selectedRow); getSlideoutTitle(selectedRow); fieldsArray = [];"
										class="panel_tool" size="md" label="Edit" icon="edit" color="deep-purple-8" />
                                    <q-btn 
                                        v-close-popup 
                                        v-if="!checkPermission(uiprops.accessFunctionId, 8)"
                                        disabled
                                        class="panel_tool" size="md" label="Edit" icon="edit" color="deep-purple-8">
                                    </q-btn>
								</div>-->
								<div class="slide-export slide-btn">
									<q-btn v-close-popup  v-if="!isDisabledExport" @click="exportListData(selectedRow); fieldsArray = [];"
										class="panel_tool" size="md" label="Export" icon="download"
										color="deep-purple-8" />
                                    <q-btn v-close-popup v-if="isDisabledExport"
                                        disabled
										class="panel_tool" size="md" label="Export" icon="download"
										color="deep-purple-8" />
								</div>
								<div class="slide-print slide-btn">
									<q-btn class="panel_tool" size="md" label="Print" icon="print" color="deep-purple-8"
										@click="printContent2" />
								</div>
							</div>
						</div>
					</q-card-section>
				</q-card>
			</q-dialog>
            
`;


function openPreview(data, task) {
    let correctedData = JSON.parse(JSON.stringify(data).replaceAll('%3D','='));
	if (correctedData.Path) {
        if(task == 'download') { 
            toDataUrl(correctedData, imageCallBack);
        } else if(task == 'preview') {
            let pDiv = document.getElementById("previewDiv");
            previewSelectedOpen = correctedData;
            pDiv.click();
        }
    }
}

function toDataUrl(correctedData, callback) {
    try {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
            var reader = new FileReader();
            reader.onloadend = function() {
                callback(correctedData, reader.result);
            }
            reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', correctedData.Path);
        xhr.responseType = 'blob';
        xhr.send();
        setTimeout(() => {
            showTextLoading = false;
            visible = false;
        }, 10000);
    } catch(error) {
        console.log("Error in Download file: ", error);
    }
}

function imageCallBack(correctedData, response){
    // console.log("response: ", response);
    try {
        var link = document.createElement("a");
        link.download = correctedData.FileName;
        link.href = response;
        link.click();
        setTimeout(() => {
            delete link;
        }, 200);
    } catch(error) {
        console.log("Error in Download file: ", error);
    }
}


var slidepanel = Vue.component('cnx-qtis-slide-panel', {
    template: getSlideoutPanelTemplate,
    data(){
        return {
            data: [],
            FilesData: [],
            HEICUrl: '',
            showLoader: false,
            imageFileTypes: ['jpg', 'jpeg', 'gif', 'png', 'bmp', 'ico' , 'jfif' , 'jp2'],
            iframeFileTypes: ['pdf'],
            docFileTypes: ['xls', 'ppt', 'doc', 'docx', 'xlsm', 'xlsb', 'xltx', 'xltm', 'xlt', 'xml', 'xlam', 'xla', 'xlw', 'xlr', 'ods', 'ots', 'fods', 'uos', 'dif', 'dbf', 'html', 'slk', 'csv', 'dot', 'odt', 'msg'],
            videoFileTypes: ['webm', 'mpg', 'mp2', 'mpeg', 'mpe', 'mpv', 'ogg', 'mp4', 'm4p', 'm4v','wmp'],
            AudioFileTypes: ['mp3', 'wav', 'aac', 'wma'],
            openNew: false,
            SlideoutPanelTitle: '',
            SlideoutPanelEntity: '',
            currentSelectedRow: { Id: '', CreatedDate: '' },
            updateToggleDialog: false,
            columnArray: [],
            html: '',
            fieldsArray: [],
            currentObject: {},
            flag: 0,
            tableHtml: '',
            textHtml: '',
            totalFiles: 0,
            panelLoader: false,
            tableCount: 0,
            responseCount: 0,
            fileData: [],
            fileNo: null,
            FilesPrimePath: '',
            notContent: false,
            showHoverInfotwo: false,
            customTitle:'TEST',
            sidepannelTitle: '',
            openPanel: false,
            currentUIstate: {},
            identifyCurrency: [],
            NotesExpand: 0,
            ExpandNotesColumn: false,
            filters: null,
            subTypes: null,
            selectedSubTypes: null,
            filterFields: null,
            pagination: null,
            customTableArray: [],
            customReminderShow: false,
            isDisabledExport: false,
            isDisabledEdit: false,
            showTextLoading: false,
            visible: false,
        }
    },
    props: ['uistate', 'uiprops', 'table'],
    created() {
        // this.SlideoutPanelEntity = this.entity.entityId;
        this.$root.registerEventListener("OpenConnectionRecord", this);
    },
    destroyed() {
        this.$root.removeEventListener("OpenConnectionRecord", this);
    },
    methods: {
        getContainer() {
            return (this.uiprops.inDrillDownView) ? this.$root.getGlobalComponent("drilldown") : this.$parent;
        },
        getFilters() {
            var viewData = this.getContainer().viewData[this.uiprops.viewId];
            this.filters = viewData.filters;
            this.subTypes = viewData.subTypes;
            this.selectedSubTypes = viewData.selectedSubTypes;
            this.filterFields = viewData.filterFields;
            this.pagination = viewData.pagination;
        },
        CheckHeicImageType(row) {
            if (row.FileName && row.FileName.endsWith('.heic')) {
                return true;
            } else {
                return false;
            }
        },
        handleFileItemClose() {
            this.GridFilePreviewDialog = false;
            this.HEICUrl = '';
            this.CurrentRow = {};
        },
        CheckImageType(row){
            if(Object.keys(row).length !== 0){
                if(row.FileExtension){
                    var ext = row.FileExtension.toLowerCase();
                } else {
                    if(row.FileName){
                    var FileName = row.FileName.toLowerCase();
                    FileName = FileName.split(".");
                    var index = FileName.length - 1;
                    var ext = FileName[index];
                    } else { var ext = ''; }
                }
                return (this.imageFileTypes.includes(ext)) ? true : false;
            }
        },
        getHeicFilePath(row) {
            this.showLoader = true;
            let self = this;
            if (row.FileName.endsWith('.heic') && row.Path) {
                let HEICUrl = '';
                var xhr = new XMLHttpRequest();
                $.ajax({
                    url: row.Path,
                    crossDomain: true,
                    xhr: function () {
                        return xhr;
                    },
                    success: function (data, statusText, jqhxr) {
                        fetch(xhr.responseURL)
                            .then((res) => res.blob())
                            .then((blob) => heic2any({ blob }))
                            .then((conversionResult) => {
                                self.HEICUrl = URL.createObjectURL(conversionResult);
                                self.showLoader = false;
                                self.updateToggleDialog = !self.updateToggleDialog;
                            })
                            .catch((e) => { console.error(e); });
                    }
                });
            }
        },
        printContent2() {
            var pageWidget = this.$root.getGlobalComponent('pageWidget');
            pageWidget.print('rightSlidePanel');
        },
        notifyEvent(event, eventData) {
            if (event == "OpenConnectionRecord") {
                if(localStorage.getItem("SlideoutPanel") == "true") {
                    basicFieldsAdded = false;
                    this.showHoverInfotwo = true;
                    localStorage.setItem("SlideoutPanel", false);
                    this.hoverInfoOnClick(eventData);
                }
            }
        },
        hoverInfoOnClick(currentRow) {
            if(currentRow.length > 0) {
                var result = currentRow[0].row;
                var properties = currentRow[0].form;
                this.isDisabledEdit = true;
            } else if(currentRow.hasOwnProperty('ActionName')) {
                var result = JSON.parse(currentRow.Data);
                if(result.EntityId == "cmKndexm5quL7pu3YkWJM7nTe"){
                    // this.isDisabledExport = true;
                } else {
                    this.isDisabledExport = false;
                }
                this.isDisabledEdit = true;
                // this.isDisabledExport = true;
            } else {
                var result = currentRow;
            }
            this.html = '';
            this.sidepannelTitle = "";
            if(result.Label) {
                if(result.EntityId == 'cRP7B2eonqTKxzf7QPBLkeVCZ') {
                    this.sidepannelTitle = 'CI Contact Memo' + ' : ' + result.Label;
                } else  if(this.uiprops?.label?.default) {
                    this.sidepannelTitle = this.uiprops.label.default + ' : ' + result.Label;
                } else if(this.uistate?.widget?.uiprops?.label?.default) {
                    this.sidepannelTitle = this.uistate?.widget?.uiprops?.label?.default + ' : ' + result.Label;
                } else if(properties && properties.label) {
                    this.sidepannelTitle = properties.label + ' : ' + result.Label;
                } else if(this.uiprops?.dataPath) {
                    this.sidepannelTitle = this.uiprops?.dataPath.replace('.list', '') + ' : ' + result.Label;
                } else {
                    this.sidepannelTitle = 'Record Details';
                }
            } else if(this.uiprops && this.uiprops.dataPath && result.EntityId =="cZJb6N4d8ZF5DXFJ1KqxDKxTL"){
                const EntityfirstLetter = this.uiprops?.dataPath.replace('.list', '').charAt(0)

               const EntityfirstLetterCap = EntityfirstLetter.toUpperCase()

                const remainingLetters = this.uiprops?.dataPath.replace('.list', '').slice(1)

                this.sidepannelTitle = EntityfirstLetterCap + remainingLetters + ' : ' + result.Tags;
            } else {
                if(this.uiprops && this.uiprops.dataPath && this.uiprops.dataPath.includes("InvestigationCase")){
                    this.sidepannelTitle = (this.uistate?.widget?.uiprops?.label?.default ? this.uistate?.widget?.uiprops?.label?.default + ' : ' : '') + result.CaseNumber;
                } else {
                    this.sidepannelTitle = 'Record Details';
                }
            }

            this.FilesPrimePath = "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/no-image.jpg";
            if (result.EntityId == 'cmKndexm5quL7pu3YkWJM7nTe') {
                this.notContent = false;
                this.FilesPrimePath = result.Path;
                if (this.FilesPrimePath != null) {
                    if (this.CheckImageType(result)) {
                        this.FilesPrimePath.replaceAll(' ', '%20');
                    } else if (this.CheckHeicImageType(result)) {
                        this.FilesPrimePath = this.getHeicFilePath(res[i]);
                    } else {
                        this.FilesPrimePath = "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/others.png";
                    }
                }
            } else {
                this.notContent = true;
            }

            if(this.FilesPrimePath != "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/no-image.jpg"
                && this.FilesPrimePath != "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/others.png" && result.EntityId != 'cRP7B2eonqTKxzf7QPBLkeVCZ') {
                // https://staging.qtis.us/s3/getsignedurl?tenant=zinatt&s3ServiceId=cbm80g23VqCdFndebMaxbHE&bucket=zinatt-app-bucket-usgvt&objectKey=zinatt/test_staging/cwJwR7dem7tGNoImBKX4YXxh1lp158_CO()^%$da(t)a!@$sp._=+_having}{[]char.jpg
                let splitedfileurl = this.FilesPrimePath.slice(0, this.FilesPrimePath.lastIndexOf("/"));
                let splitedfilename = this.FilesPrimePath.slice(this.FilesPrimePath.lastIndexOf("/") + 1);
                let filename = splitedfilename.slice(0, splitedfilename.lastIndexOf("."));
                let extension = splitedfilename.slice(splitedfilename.lastIndexOf(".") + 1);
                let uniq_S3_id = filename.slice(0, filename.indexOf("_"));
                filename = filename.slice(filename.indexOf("_") + 1);
                
                filename = filename.replace(/[^a-zA-Z0-9]/g, '_') + "." + extension;
                this.FilesPrimePath = splitedfileurl + "/" + uniq_S3_id + "_" + filename;
            }
            this.html = "<div id = 'set-image'><div class='col-12 col-sm-3 col-md-3 col-lg-3 text-center'><img src='" + this.FilesPrimePath + "' align='center' style='object-fit:contain; max-width:200px; margin:15px 0;' ></div></div>";
            
            if((this.uiprops && this.uiprops.model && this.uiprops.model.widgetDataBeanPath && this.uiprops.model[this.uiprops.model.widgetDataBeanPath.replace('.list', '')].hasOwnProperty('entityTags') &&
                this.uiprops.model[this.uiprops.model.widgetDataBeanPath.replace('.list', '')].entityTags.includes('#noimage')) || 
                (this.widgetModel && this.widgetModel.widgetDataBeanPath && this.widgetModel[this.widgetModel.widgetDataBeanPath.replace('.list', '')].hasOwnProperty('entityTags') &&
                    this.widgetModel[this.widgetModel.widgetDataBeanPath.replace('.list', '')].entityTags.includes("#noimage")) ||
                    (this.$parent && this.$parent.hasOwnProperty('widgetModel') && this.$parent.widgetModel.widgetDataBeanPath && this.$parent.widgetModel[this.$parent.widgetModel.widgetDataBeanPath.replace('.list', '')].hasOwnProperty('entityTags') &&
                        this.$parent.widgetModel[this.$parent.widgetModel.widgetDataBeanPath.replace('.list', '')].entityTags.includes("#noimage"))
                        || !result.hasOwnProperty('FilesCount')) {
                this.notContent = false;
                this.FilesPrimePath = "";
                this.html = "";
            }

            this.FilesPrimePath = '';
            this.panelLoader = true;
            this.customReminderShow = false;
            this.currentObject = result;
            this.fieldsArray = [];
            this.totalFiles = 0;
            this.tableCount = 0;
            this.responseCount = 0;
            this.textHtml = '';
            this.tableHtml = '';
            this.flag = 0;
            selectedRow = result;
            if(selectedRow.exportType && selectedRow.exportType == 'Grid Export') {
                this.currentSelectedRow = {
                    Id: 'Grid Export',
                    CreatedDate: 'Grid Export'
                };
            } else {
                this.currentSelectedRow = {
                    Id: selectedRow.Id,
                    CreatedDate: this.convertDateAndTime(selectedRow.CreatedDate.$date)
                };
            }
            this.loadResource();
        },
        convertDateAndTime(createdDate) {
            const d = new Date(createdDate);
            var mm = (d.getMonth() <= 8) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
            var dd = (d.getDate() <= 9) ? "0" + d.getDate() : d.getDate();
            var yyyy = d.getFullYear();
            var hh = d.getHours();
            var min = d.getMinutes();
            let ampm = hh >= 12 ? 'PM' : 'AM';
            hh = (hh > 12) ? hh % 12 : (hh == 0) ? "12" : hh;
            min = (min <= 9) ? '0' + min : min;
            hh = (hh <= 9) ? "0" + hh : hh;
            hours = hh ? hh : 12;
            return mm + "/" + dd + "/" + yyyy + " " + hh + ":" + min + " " + ampm;
        },
        convertDOBDate(date) {
            const d = new Date(date);
            var mm = (d.getMonth() <= 8) ? "0" + (d.getMonth() + 1) : (d.getMonth() + 1);
            var dd = (d.getDate() <= 9) ? "0" + d.getDate() : d.getDate();
            var yyyy = d.getFullYear();
            return mm + "/" + dd + "/" + yyyy ;
        },
        // isEntityFileEmbedContains(this) {
        //     if((this.uiprops && this.uiprops.model && this.uiprops.model.widgetDataBeanPath && this.uiprops.model[this.uiprops.model.widgetDataBeanPath.replace('.list', '')].hasOwnProperty('entityTags') &&
        //         this.uiprops.model[this.uiprops.model.widgetDataBeanPath.replace('.list', '')].entityTags.includes('#noimage')) || 
        //         (this.widgetModel && this.widgetModel.widgetDataBeanPath && this.widgetModel[this.widgetModel.widgetDataBeanPath.replace('.list', '')].hasOwnProperty('entityTags') &&
        //             this.widgetModel[this.widgetModel.widgetDataBeanPath.replace('.list', '')].entityTags.includes("#noimage")) ||
        //             (this.$parent && this.$parent.hasOwnProperty('widgetModel') && this.$parent.widgetModel.widgetDataBeanPath && this.$parent.widgetModel[this.$parent.widgetModel.widgetDataBeanPath.replace('.list', '')].hasOwnProperty('entityTags') &&
        //                 this.$parent.widgetModel[this.$parent.widgetModel.widgetDataBeanPath.replace('.list', '')].entityTags.includes("#noimage"))) {
        //         return false;
        //     }
        //     return true;
        // },
        getSlideoutTitle(row) {
            var filteredArray = [];
            for (var i = 0; i < globalSearchEntities.length; i++) {
                if (globalSearchEntities[i].subTypes) {
                    for (var s = 0; s < globalSearchEntities[i].subTypes.length; s++) {
                        if (globalSearchEntities[i].subTypes[s].typeId == row.EntityId) {
                            filteredArray.push(globalSearchEntities[i]);
                        }
                    }
                } else {
                    if (row.EntityId == globalSearchEntities[i].typeId) {
                        filteredArray.push(globalSearchEntities[i]);
                    }
                }
            }
            this.SlideoutPanelTitle = filteredArray[0].label;
            this.SlideoutPanelEntity = row.EntityId;
        },
        loadResource() {
            var widgetId = this.currentObject.EntityId + '!form';
            var loaderAction = new contineo.Action({ $loader: { className: "com.contineo.runtime.config.LoadResource" } });
            loaderAction.userId = user.username;
            loaderAction.componentId = widgetId;
            loaderAction.fileId = 'appfiles/v-zero/custom/_tenant/widgets/_id.json';
            loaderAction.execute(this.update, widgetId);
        },
        update(result) {
            var widgetJson = eval("(" + result.result + ")");
            this.parseElement(widgetJson);
            var widgetId = this.currentObject.EntityId + '!form';
            if (!widgets[widgetId]) {
                widgets[widgetId] = result.result;
            }
            if (this.flag == 1) {
                this.html = this.html + this.textHtml + '</div></div>';
            } else {
                this.html = this.html + this.tableHtml + '</div></div>';
            }
            var htmlid = "rightSlidePanel";
            var htm = document.getElementById(htmlid);
            htm.innerHTML = this.html;
            if (this.fieldsArray) {
                this.fieldsArray.forEach((tab) => {
                    var len = tab.length - 1;
                    if (tab && tab[0].includes('c8PYXJX80AuZBUW15RGVl6tD')) {
                        this.totalFiles = 0;
                    }
                    var element = document.getElementById(tab[0]);
                    if (element) {
                        element.innerHTML = '<tr><td colspan="' + len + '"><span class = "empty-data">No Data</span></td></tr>';
                    }
                });
            }
            if (this.tableCount == 0) {
                this.panelLoader = false;
            }
        },
        handleDoubleQuote(value) {
            if (value && value != '') {
                let textInputCode = value.toString();
                let cleanText = textInputCode.replace(/<\/?[^>]+(>|$)/g, "");
                return cleanText.replaceAll('"', '&quot;');
            }
        },
        //Cheking field would be visible on slide panel or not.
        checkFieldVisibility(component) {
            //We can more conditions to handle slide panel field visibility on checkbox
            if(component.resourceId == "reminder" && !this.customReminderShow) {
                return false;
                //Condition will handle the visibility of the custom reminder field visibility for Tasks side panel.
            } else if(component.resourceId == "description" && this.currentObject.EntityId === "cRP7B2eonqTKxzf7QPBLkeVCZ" && (!this.currentObject.other || this.currentObject.other == 0)) {
                return false;
                //Condition will handle the CI Contact Memo's "description" field based on the value of "other" field 
            } else if(component.resourceId == "date" && this.currentObject.EntityId === "cRP7B2eonqTKxzf7QPBLkeVCZ" && (!this.currentObject.transferdate || this.currentObject.transferdate == 0)) {
                return false;
                //Condition will handle the CI Contact Memo's "date" field based on the value of "transferdate" field 
            } else if((component.resourceId == "caseno" || component.resourceId == "caseno.") && this.currentObject.EntityId == "cRP7B2eonqTKxzf7QPBLkeVCZ" && (!this.currentObject.investigativeactivity || this.currentObject.investigativeactivity == 0)) {
                return false;
                //Condition will handle the CI Contact Memo's "caseno" field based on the value of "investigativeactivity" field 
            } else if(component.hasOwnProperty("customTags") && component.customTags.split(" ").includes("#visibilityhiddenforslidepanel")) {
                return false;
                //Condition to not show field on slidepanel which contains this custom tag "#visibilityhiddenforslidepanel".
            } else {
                return true;
            }
        },
        parseElement(component) {
            var clm = component.fieldName ? component.fieldName.split('.') : "";
            console.log("component.controlName", component.controlName);
            switch (component.controlName) {
                case "cnx-field-text":
				case "cnx-field-checkbox":
                case "cnx-field-radiobutton":
                case "cnx-field-textarea":
                    if(!this.checkFieldVisibility(component)) {
                        //condition function created just above to this function, We can more conditions to handle slide panel field visibility on checkbox
                        break;
                    }
                    if (this.flag == 2) {
                        this.html = this.html + this.tableHtml + '</div></div>';
                        this.tableHtml = '';
                        this.flag = 0;
                    }
                    if (component.styleClasses != null && !component.styleClasses.includes('print-never') && this.flag == 0) {
                        this.html = this.html + '<div class="row "> <div class="col-md-12 col-12 persistent-panel-data row">';
                        this.flag = 1;
                    }
                    if (this.currentObject[clm[clm.length - 1]]) {
                        let value = this.currentObject[clm[clm.length - 1]];
                        if(this.currentObject.EntityId !== "c1V4878xM2UABh6om40MjnsL" && clm[clm.length - 1] !== "Notes1") {
                            value = this.handleDoubleQuote(this.currentObject[clm[clm.length - 1]]);
                        }
                        if(!isNaN(value) && value > -1 && value < 2) {
                            if(!value) {
                                value = 'No';
                            } else if(value == 0) {
                                value = 'No'
                            } else {
                                value = 'Yes'
                            }
                        }
                        
                        if(this.currentObject.EntityId === "c1V4878xM2UABh6om40MjnsL" && clm[clm.length - 1] === "Notes1") {
                            this.textHtml = this.textHtml + '<div class="col-12 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para add-ellipsis" title = "' + this.handleDoubleQuote(value) + '">' + value + '</div></div>';
                        } else if((component.fieldName.includes('values.Tags') && component.id !== "cxYJE25kymSyWhnqKepqX4hzc18") || component.id === "caz786kNjACLgT6o4EzG3oHYc40s0"){
                            this.textHtml = this.textHtml + '<div class="col-12 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + value + '</div></div>';	
                        } else{
                            this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + value + '</div></div>';
                        }
                    } else {
                        let value = this.currentObject[clm[clm.length - 1]];
                        if(!isNaN(value) && value > -1 && value < 2) {
                            if(!value) {
                                value = 'No';
                            } else if(value == 0) {
                                value = 'No'
                            } else {
                                value = 'Yes'
                            }
                        }
                        if(component.fieldName.includes('values.Tags')){
                            this.textHtml = this.textHtml + '<div class="col-12 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ': </div><span class = "empty-data">No Data</span></div>';
                        } else if(component.fieldName.includes('customValues.booleans')) {
                            this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + value + '</div></div>';
                        } else {
                            this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ': </div><span class = "empty-data">No Data</span></div>';
                        }
                    }
                    break;
                case "cnx-field-date":
                    if(!this.checkFieldVisibility(component)) {
                        //condition function created just above to this function, We can more conditions to handle slide panel field visibility on checkbox
                        break;
                    }
                    if (this.flag == 2) {
                        this.html = this.html + this.tableHtml + '</div></div>';
                        this.tableHtml = '';
                        this.flag = 0;
                    }
                    if (component.styleClasses != null && !component.styleClasses.includes('print-never') && this.flag == 0) {
                        this.html = this.html + '<div class="row "> <div class="col-md-12 col-12 persistent-panel-data row">';
                        this.flag = 1;
                    }
                    if (this.currentObject[clm[clm.length - 1]]) {
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + this.convertDOBDate(this.currentObject[clm[clm.length - 1]].$date) + '</div></div>';	
                    } else {
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ': </div><span class = "empty-data">No Data</span></div>';
                    }
                    break;
                case "cnx-field-datetime":
                    if(!this.checkFieldVisibility(component)) {
                        //condition function created just above to this function, We can more conditions to handle slide panel field visibility on checkbox
                        break;
                    }
                    if (this.flag == 2) {
                        this.html = this.html + this.tableHtml + '</div></div>';
                        this.tableHtml = '';
                        this.flag = 0;
                    }
                    if (component.styleClasses != null && !component.styleClasses.includes('print-never') && this.flag == 0) {
                        this.html = this.html + '<div class="row "> <div class="col-md-12 col-12 persistent-panel-data row">';
                        this.flag = 1;
                    }
                    if (this.currentObject[clm[clm.length - 1]]) {
                        if(clm[clm.length - 1].includes('DOB')){
                            this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + this.convertDOBDate(this.currentObject[clm[clm.length - 1]].$date) + '</div></div>';	
                        } else {
                            this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + this.convertDateAndTime(this.currentObject[clm[clm.length - 1]].$date) + '</div></div>';
                        }
                    } else {
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ': </div><span class = "empty-data">No Data</span></div>';
                    }
                    break;
                case "cnx-field-integer":
                case "cnx-field-decimal":
                case "cnx-field-double":
                    if(!this.checkFieldVisibility(component)) {
                        //condition function created just above to this function, We can more conditions to handle slide panel field visibility on checkbox
                        break;
                    }
                    var isCurrency = false;
                    if (component.customTags && component.customTags.includes('#currency')) {
                        isCurrency = true;
                    }
                    if (this.flag == 2) {
                        this.html = this.html + this.tableHtml + '</div></div>';
                        this.tableHtml = '';
                        this.flag = 0;
                    }
                    if (component.styleClasses != null && !component.styleClasses.includes('print-never') && this.flag == 0) {
                        this.html = this.html + '<div class="row "> <div class="col-md-12 col-12 persistent-panel-data row">';
                        this.flag = 1;
                    }
                    if (this.currentObject[clm[clm.length - 1]]) {
                        let value = this.handleDoubleQuote(this.currentObject[clm[clm.length - 1]]);
                        if (isCurrency) {
                            value = '$ ' + Number(value).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
                        }
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div> <div class="desc-para">' + value + '</div></div>';
                    } else {
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ': </div><span class = "empty-data">No Data</span></div>';
                    }
                    break;
                case "cnx-field-dropdown":
                case "cnx-field-rel-dropdown":
                    if(!this.checkFieldVisibility(component)) {
                        //condition function created just above to this function, We can more conditions to handle slide panel field visibility on checkbox
                        break;
                    }
                    var isCurrency = false;
                    if (component.customTags && component.customTags.includes('#currency')) {
                        isCurrency = true;
                    }
                    if (this.flag == 2) {
                        this.html = this.html + this.tableHtml + '</div></div>';
                        this.tableHtml = '';
                        this.flag = 0;
                    }
                    if (component.styleClasses != null && !component.styleClasses.includes('print-never') && this.flag == 0) {
                        this.html = this.html + '<div class="row "> <div class="col-md-12 col-12 persistent-panel-data row">';
                        this.flag = 1;
                    }
                    var keys = Object.keys(this.currentObject);
                    var value = '';
                    keys.forEach((key, index) => {
                        var x = key.split('.');
                        var len = x.length;
                        var val = (len === 1) ? x[0] : x[len - 2];
                        if (len > 1 && val == component.fieldName) {
                            if(this.currentObject[key] && component.hasOwnProperty("customizationProperties") && component.customizationProperties.hasOwnProperty("getSplitLabel")) {
                                value = component.customizationProperties.getSplitLabel(this.currentObject[key]);
                            } else {
                                value = this.handleDoubleQuote(this.currentObject[key]);
                            }
                        }
                        if(component.controlName === "cnx-field-dropdown" && val === component.fieldName) {
                            value = this.handleDoubleQuote(this.currentObject[key]);
                        }
                    });
                    if(component.resourceId === "setreminder" && value === "Custom") {
                        this.customReminderShow = true;
                    }
                    if (value) {
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ' :</div><div class="desc-para"> ' + value + '</div></div>';
                    } else {
                        this.textHtml = this.textHtml + '<div class="col-6 persistent-field"> <div class="desc-title" title="'+ component.label["default"] +'">' + component.label["default"] + ': </div><span class = "empty-data">No Data</span></div>';
                    }
                    break;
                case "cnx-table":
                    let UUID = component.entity['$entityId'] + "_" + Date.now();
                    console.log("cnx-table component", component)
                    var col = new Array();
                    if(!this.checkFieldVisibility(component)) {
                        //condition function created just above to this function, We can more conditions to handle slide panel field visibility on checkbox
                        break;
                    }
                    var addColumn = 0;
                    if (this.flag == 1) {
                        this.html = this.html + this.textHtml + '</div></div>';
                        this.textHtml = '';
                        this.flag = 0;
                    }
                    if (component.styleClasses != null && !component.styleClasses.includes('print-never') && this.flag == 0) {
                        this.html = this.html + '<div class="row "> <div class="col-md-12 col-12 persistent-panel-data row">';
                        this.flag = 2;
                    }
                    let object = { ...this.currentObject };
                    object._fieldSelection = [];
                    if (component.columns.length > 0) {
                        this.tableCount++;
                        let tableclass = "table_" + component.entity['$entityId'];
                        this.tableHtml = this.tableHtml + '<div class="table-right-panel"><table id= ' + tableclass + ' class = ' + component.styleClasses + '><thead><tr style="display: flex  flex-direction: column-reverse">';
                    }
                    col.push(UUID);
                    for (var i = 0; i < component.columns.length; i++) {
                        if (component.columns[i].customTags && component.columns[i].customTags.includes('#currency')) {
                            this.identifyCurrency.push(i);
                        }
                        if (component.entity['$entityId'] != 'c8PYXJX80AuZBUW15RGVl6tD' && component.columns[i].localizedLabel["default"] == "Is Primary Link") {
                            continue;
                        }
                        if (component.entity['$entityId'] == 'c8PYXJX80AuZBUW15RGVl6tD' && component.columns[i].localizedLabel["default"] == 'Label') {
                            addColumn = 1;
                            continue;
                        } else {
                            if (component.columns[i].localizedLabel["default"] == "Is Primary Link") {
                                this.tableHtml = this.tableHtml + '<th>Description</th>';
                                col.push('FileDescription');
                                this.tableHtml = this.tableHtml + '<th>Download</th>';
                            } else {
                                if(this.currentObject.EntityId == 'c21PPRAxw6FdEjFAyWaaBaktz' && component.columns[i].localizedLabel["default"] == "Notes") {
                                    component.columns[i].localizedLabel["default"] = component.label["default"];
                                }
                                this.tableHtml = this.tableHtml + '<th>' + component.columns[i].localizedLabel["default"] + '</th>'
                            }
                        }
                        col.push(component.columns[i].field);
                        object._fieldSelection.push(component.columns[i].field);
                    }
                    col.push(this.identifyCurrency);
                    this.identifyCurrency = [];
                    this.fieldsArray.push(col);
                    console.log("table id 2:", component.entity['$entityId']);
                    this.tableHtml = this.tableHtml + '</tr></thead><tbody id = "' + component.entity['$entityId'] + '"></tbody></table></div>';
                    if(!object.$entityId) {
                        object.$entityId = object.EntityId;
                    }
                    let checkExistance = this.customTableArray.filter(x => x.key === component.entity.$entityId).length > 0 ? true : false;
					if(!checkExistance) { this.customTableArray.push({ key: component.entity.$entityId, dataPath: component.relationName }); }
                   // executeClassAPI("com.contineonx.core.persistence.LoadChildRelationData", {
                    //    isEntityAPI: true,
                    //    relationName: component.relationName,
                    //    parameters: eval("(" + JSON.stringify(object) + ")")
                    //}, null, this.handleHtml);
                    break;
                default:
                    this.html;
                    break;
                    
            }
            if(!basicFieldsAdded) {
                basicFieldsAdded = true;
                console.log("window.SlideoutPanelParentData", window.SlideoutPanelParentData.row);
                this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="">Action</div> <div class="desc-para add-ellipsis" title = "' + window.SlideoutPanelParentData.row.ActionName + '">' + window.SlideoutPanelParentData.row.ActionName + '</div></div>';
                this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="">IP Address</div> <div class="desc-para add-ellipsis" title = "' + window.SlideoutPanelParentData.row.UserIPAddress + '">' + window.SlideoutPanelParentData.row.UserIPAddress + '</div></div>';
                this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="">Modification Time</div> <div class="desc-para add-ellipsis" title = "' + this.convertDateAndTime(window.SlideoutPanelParentData.row.ModificationTime.$date) + '">' + this.convertDateAndTime(window.SlideoutPanelParentData.row.ModificationTime.$date) + '</div></div>';
                this.textHtml = this.textHtml + '<div class="col-6 persistent-panel-field"> <div class="desc-title" title="">Forms</div> <div class="desc-para add-ellipsis" title = "' + window.SlideoutPanelParentData.row.EntityName + '">' + window.SlideoutPanelParentData.row.EntityName + '</div></div>';
            }
            if (component.children) {
                for (let c = 0; c < component.children.length; c++) {
                    this.parseElement(component.children[c]);
                }
                console.log("component.resourceId", component);
                if(component.resourceId == "RecordSharingDetails"){
                    this.parseElement({
                        accessFunctionId: "entities.c8PYXJX80AuZBUW15RGVl6tD.fields.c31q6wJnboUN6HLMW6xXB3UQ",
                        allowEdit: true,
                        allowSelection: false,
                        autoloadData: true,
                        entity: {"$entityId": "c8PYXJX80AuZBUW15RGVl6tD"},
                        columns: [
                            {'accessFunctionId':"entities.c8PYXJX80AuZBUW15RGVl6tD.fields.cP8J0WkRz8HqW2SKNZqGyN8Hd_11",'align':"left",'controlType':"hyperlink",'customTags':"   #reportkeyword",'detailsLinkColumn':0,'field':"Label",'getValue':'','label':"Label",'localizedLabel':{default:"Label"},'name':"Label",'sortable':0,'styleClasses':"",'valueDataType':"String",'visible':1},
                            {'accessFunctionId':"entities.c8PYXJX80AuZBUW15RGVl6tD.fields.cXayRYpqxMcBKQuBzwwbl0oHec11s0",'align':"left",'controlType':"hyperlink",'customTags':"   #reportkeyword",'field':"FileType1",'getValue':'','label':'File Type','localizedLabel':{default:"File Type"},'name':"FileType1",'sortable':0,'styleClasses':"",'visible':0},{'accessFunctionId':"entities.c8PYXJX80AuZBUW15RGVl6tD.fields.cN8deLenbZUgmTeXWLgyGWfj",'align':"left",'controlType':"hyperlink",'customTags':"   #reportkeyword",'field':"FileName",'label':"File Name",'localizedLabel':{default:"File Name"},'name':"FileName",'sortable':0,'styleClasses':"",'visible':0},
                            {'accessFunctionId':"entities.c8PYXJX80AuZBUW15RGVl6tD.fields.cn6LnRWVpgiNDsQpRp1jzmFQ",'align':"left",'controlType':"hyperlink",'customTags':"   #reportkeyword",'field':"IsPrimaryLink",'label':"Is Primary Link",'localizedLabel':{default:"Is Primary Link"},'name':"IsPrimaryLink",'sortable':0,'styleClasses':"",'visible':0},
                        ],
                        controlName: "cnx-table",
                        dataIdField: "objectId",
                        dataLoader: "",
                        dataPath: "",
                        eventHandlers: '',
                        filterCriteriaPath: "",
                        hideToolbar: false,
                        id: "",
                        isList: true,
                        isRelationalData: true,
                        pageSize: 10,
                        path: "",
                        relationName: "Files",
                        resourceId: "files",
                        rowStyleClassField: "",
                        styleClasses: "col-xs-12 col-md-12  cnx-grid  print-always  ",
                        visible: false,
                    });
                    var row = JSON.parse(window.SlideoutPanelData.SharePath);
                    console.log("row", row);
                    this.currentObject.FilesPrimeId = row.FilesPrimeId;
                    if(row.status){
                        executeAppAPI("GetItemAuditLog", { parameters: { ItemId: row.Id } }, {'row': row.Id, 'date': window.SlideoutPanelData.UpdatedDate.$date}, this.updateAuditLogResult);
                    } else {
                        var datas = ["c8PYXJX80AuZBUW15RGVl6tD", "FileType1", "FileName", "FileDescription", "IsPrimaryLink"];
                        this.fieldsArray.push(datas);
                        var Files = [];
                        Files.push({Path: row.Path, FileName: row.FileName, FileDescription: row.FileDescription, FileType1: row['relations.FileType.displayValue'], Id: row.Id, EntityId: row.EntityId});
                        var response = {
                            result : {data: Files},
                        }
                        this.handleHtml(response);
                    }
                }
                if(component.accessFunctionId && component.accessFunctionId == "entities."+ window.SlideoutPanelData.EntityId) {

                        var ChildFiles = [];
                        var ChildNotes = [];
                        if (window.SlideoutPanelData._modifiedChildList) {
                            for(var i = 0; i < window.SlideoutPanelData._modifiedChildList.length; i++){
                                var row = window.SlideoutPanelData._modifiedChildList[i];
                                if(row._relName == "Files"){
                                    var FileType = (row['relations.FileType.displayValue']) ? row['relations.FileType.displayValue'] : '';
                                    ChildFiles.push({Path: row.Path, FileName: row.FileName, FileDescription: row.FileDescription, FileType1: FileType, Id: row.Id, EntityId: row.EntityId});
                                }
                                if(row._relName == "Notes"){
                                    ChildNotes.push({Notes: row.Notes, Id: row.Id, EntityId: row.EntityId});
                                }
                            }
                            var response = {
                                result : {data: ChildFiles},
                            }
                            this.handleHtml(response);
                            var response = {
                                result : {data: ChildNotes},
                            }
                            this.handleHtml(response);
                        }
              
                }
            }
        },
        updateAuditLogResult(response) {
            let date1 = new Date(response.actionId.date).getTime();
            var Files = [];
            response.result.data.reverse();
            for (a = 0; a < response.result.data.length; a++) {
                var auditLog = response.result.data[a];
                if (auditLog.Data) {
                    auditLog.Data = eval("(" + auditLog.Data + ")");
                    let date2 = new Date(auditLog.Data.UpdatedDate.$date).getTime();
                    if(date1 > date2){
                        console.log("date 1 is greater");
                        if (auditLog.Data._modifiedChildList) {
                            for(var i = 0; i < auditLog.Data._modifiedChildList.length; i++){
                                console.log("date 1", response.actionId.date, "date 2", auditLog.Data.UpdatedDate.$date, "auditLog.Data._modifiedChildList", auditLog.Data._modifiedChildList[i]);
                                var row = auditLog.Data._modifiedChildList[i];
                                if(row._relName == "Files"){
                                    if(row._action != "delete"){
                                        var FileType = (row['relations.FileType.displayValue']) ? row['relations.FileType.displayValue'] : '';
                                        Files.push({Path: row.Path, FileName: row.FileName, FileDescription: row.FileDescription, FileType1: FileType, Id: row.Id, EntityId: row.EntityId});
                                    }
                                    if(row._action == "delete"){
                                        const index = Files.map(e => e.Id).indexOf(row.Id);
                                        if(index > -1){
                                            Files.splice(index, 1); 
                                        }
                                    }
                                }
                            }
                        }
                    } 
                }
            }
            var datas = ["c8PYXJX80AuZBUW15RGVl6tD", "FileType1", "FileName", "FileDescription", "IsPrimaryLink"];
            this.fieldsArray.push(datas);
            var response = {
                result : {data: Files},
            }
            this.handleHtml(response);
        },
        handleHtml(response) {
            var tableid = '';
            this.responseCount++;
            var res = response.result.data;
            console.log("response.result.data", response.result.data, "this.fieldsArray", this.fieldsArray);
            if (res[0] && res[0].EntityId == 'c8PYXJX80AuZBUW15RGVl6tD') {
                this.totalFiles = res.length;
            }
            var cols, element, tBody = '', tr = '<tr>', len, identifyCurrency;

            this.fieldsArray.forEach((tab) => {
                if (res[0] && tab[0].includes(res[0].EntityId)) {
                    console.log("tabtabtab", tab);
                    cols = tab;
                    len = cols.length - 1;
                    identifyCurrency = tab[len];
                    const index = this.fieldsArray.indexOf(cols);
                    if (index > -1) {
                        this.fieldsArray.splice(index, 1);
                    }
                    if(cols[0].includes("_")){
                        var col = cols[0].split("_");
                        element = document.getElementById(col[0]);
                        console.log("table id 1:", col[0]);
                        tableid = col[0];
                    } else {
                        tableid = cols[0];
                        element = document.getElementById(cols[0]);
                        console.log("table id 1:", cols[0]);
                    }
                    
                }
            });
            let flag = 0;
            for (var i = 0; i < res.length; i++) {
                if (res[0] && res[0].EntityId == 'c8PYXJX80AuZBUW15RGVl6tD' && res[i].Path == null) {
                    this.totalFiles--;
                    continue;
                }
                if (res[0] && res[0].EntityId == 'c8PYXJX80AuZBUW15RGVl6tD' && this.currentObject.FilesPrimeId != null) {
                    this.FilesPrimePath = res[i].Path;
                    if (this.FilesPrimePath != null) {
                        if (this.CheckImageType(res[i])) {
                            this.FilesPrimePath.replaceAll(' ', '%20');
                        } else if (this.CheckHeicImageType(res[i])) {
                            this.FilesPrimePath = this.getHeicFilePath(res[i]);
                        } else {
                            this.FilesPrimePath = "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/others.png";
                        }
                    }
                    
                    if(this.FilesPrimePath != "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/no-image.jpg"
                        && this.FilesPrimePath != "https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/others.png") {
                    	// https://staging.qtis.us/s3/getsignedurl?tenant=zinatt&s3ServiceId=cbm80g23VqCdFndebMaxbHE&bucket=zinatt-app-bucket-usgvt&objectKey=zinatt/test_staging/cwJwR7dem7tGNoImBKX4YXxh1lp158_CO()^%$da(t)a!@$sp._=+_having}{[]char.jpg
                        let splitedfileurl = this.FilesPrimePath.slice(0, this.FilesPrimePath.lastIndexOf("/"));
                        let splitedfilename = this.FilesPrimePath.slice(this.FilesPrimePath.lastIndexOf("/") + 1);
                        let filename = splitedfilename.slice(0, splitedfilename.lastIndexOf("."));
                        let extension = splitedfilename.slice(splitedfilename.lastIndexOf(".") + 1);
                        let uniq_S3_id = filename.slice(0, filename.indexOf("_"));
                        filename = filename.slice(filename.indexOf("_") + 1);
                        
                        filename = filename.replace(/[^a-zA-Z0-9]/g, '_') + "." + extension;
                        this.FilesPrimePath = splitedfileurl + "/" + uniq_S3_id + "_" + filename;
                    }

                    var img = document.getElementById('set-image');
                    if(img){
                        img.innerHTML = "<div class='col-12 col-sm-3 col-md-3 col-lg-3 text-center'><img src='" + this.FilesPrimePath + "' align='center' style='object-fit:contain; max-width:200px; margin:15px 0;' onerror='this.src='https://zinatt-icons.s3-us-gov-west-1.amazonaws.com/icons/house_80.png''; ></div>";
                    }
                }
                
                flag = 0;
                for (var j = 1; j < len; j++) {
                    let IsPrime = this.isPrime(res[i]) ? 'background-color: #d1dcff;' : '';
                    var isCurrency = false;
                    console.log("res[i][cols[j]]", res[i][cols[j]], res[i], cols[j]);
                    if (res[i][cols[j]]) {
                        var ind = j - 1;
                        let value = identifyCurrency.includes(ind)? "$ "+Number(this.handleDoubleQuote(res[i][cols[j]])).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : res[i][cols[j]];
                        if (typeof res[i][cols[j]] == "object") {
                            tr = tr + '<td style="'+ IsPrime +'" title = "' + this.convertDateAndTime(res[i][cols[j]]["$date"]) + '"class = "add-ellipsis">' + res[i][cols[j]]["$date"].toLocaleString() + '</td>';
                        } else if (res[i].EntityId === "cYq4blbWLyCR8FGdVEEDAohG") {
                                tr = tr + '<td style="word-break: break-all;white-space: normal;'+ IsPrime +'" title = "' + this.handleDoubleQuote(value) + '"class = "add-ellipsis">' + value + '</td>';
                        } else {
                            tr += '<td style="'+ IsPrime +'" title = "' + this.handleDoubleQuote(value) + '"class = "add-ellipsis"> ' + value + '</td>';
                        }
                    } else {
                        flag++;
                        if (res[0].EntityId == 'c8PYXJX80AuZBUW15RGVl6tD' && [cols[j]] == 'IsPrimaryLink') {
                            this.fileData.push(res);
                            var id = this.fileData.length - 1;
                            tr = tr + '<td style="'+ IsPrime +'"><i clickable title="'+ res[i].FileName +'" id="download_file_'+i+'" onClick="openPreview('+ JSON.stringify(res[i]).replaceAll('=','%3D').replaceAll('\"','\'') +', \'download\')" aria-hidden="true" class="material-icons q-icon" style="cursor: pointer;color: #512da8;">cloud_download</i></td>';
                        } else {
                            if(cols[j] == "relations.FileType.displayValue"){
                                tr += '<td style="'+ IsPrime +'" class = "add-ellipsis"> ' + res[i].FileType1 + '</td>';
                            } else {
                                 tr = tr + '<td style="'+ IsPrime +'"></td>';
                            }
                        }
                    }
                }
                if (flag != len - 1) {
                    tBody = tBody + tr + '</tr>';
                    tr = '';
                } else {
                    if (res[0] && res[0].EntityId == 'c8PYXJX80AuZBUW15RGVl6tD') {
                        this.totalFiles--;
                    }
                }
            }
            console.log("tBody", tBody);
            if (element) {
                element.innerHTML = tBody;
            } else {
                if(res[0] && res[0].EntityId){
                    var className = "#table_" + res[0].EntityId + " tbody";
                    if(tBody){
                        if(tBody != '<tr></tr></tr>'){
                            setTimeout( () => {
                                $(className).html(tBody);
                            }, 1000);
                        }
                    }
                }
                
                var elem = document.getElementById(tableid);
                if(elem){
                  //  elem.innerHTML = tBody;
                }
            }
            if (this.tableCount == this.responseCount) {
                this.panelLoader = false;
            }
        },
        isPrime(row) {
            parentObject = this.currentObject;
            if(!this.hasOwnProperty('uistate')) {
                this.uistate = { parentObject };
            } else {
                this.uistate.parentObject = parentObject;
            }
            this.customTableArray.forEach((ct) => {
                if(ct.key === row.EntityId) {
                    if(!this.hasOwnProperty('uistate')) { 
                        this.uistate.primeField = ct.dataPath + "PrimeId";
                    } else {
                        this.uistate.primeField = ct.dataPath.replace(this.uistate.listCommonComponent.widgetModel.widgetDataBeanPath + ".", "") + "PrimeId";
                    }
                }
            });
            let isPrime = (parentObject[this.uistate.primeField] === this.getPrimeId(parentObject, row)) ? true : false;
            return isPrime;
        },
        getPrimeId(parent, row) {
            var primeId = "";
            if (row.LinkSourceId && row.LinkSourceId != parent.Id) {
                primeId = row.LinkSourceId;  
            }
            else if (row.LinkTargetId && row.LinkTargetId != parent.Id) {
                primeId = row.LinkTargetId;  
            }
            else {
                primeId = row.Id;
            }
            return primeId;
        },
        onEdit(selectedRow) {
            if(selectedRow && selectedRow.EntityId == 'c8el8MQlxgfJBI84d4kZoaca') {
                var widgetEntityForm = this.$root.getGlobalComponent("widgetEntityForm");
                widgetEntityForm.openForm(this, selectedRow, '', selectedRow.EntityId, "edit");
            } else {
                localStorage.setItem("EditSlidePanel", true);
                this.$root.emitEvent("OpenPanelRecord", selectedRow);
            }
        },
        exportListData(selectedRow) {
            localStorage.setItem("ExportSlidePanel", true);
            this.$root.emitEvent("exportPanelRecord", selectedRow)
        },
        
    }
});