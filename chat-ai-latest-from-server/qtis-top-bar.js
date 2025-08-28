
 

 
 
var clockInOutFormOpened = false;
var changeCaselabel = false;

widgets['calendarPopup'] = 
	JSON.stringify({
	    	widgetType: "Widget",
	    	typeId: "calendarPopUp",
	    	resourceId: "calendarPopUp",
	    	viewMode: "inherit",
	    	accessFunctionId: "widgets.calendarPopUp",
	    	model: {
	    		GetCalendarDataEntities : { $loader: { typeId: 'cV8R47YppAsPK6c1yJVqqo1tP' }, parameters: {} },
	    	},
	    	label: { "default" : "CalendarPopUp"},
	    	id: "calendarPopUp",
	    	path: "Ccl1KlN4AyWFgIJw030Nd7uk/",
	    	resourceId: "dashboard",
	    	children: [ 
	        {	
	        	controlName: "cnx-cell", 
	        	id: "CcobAMpwyPaU7UABj1jLaouw",
	        	path: "Ccl1KlN4AyWFgIJw030Nd7uk/CcobAMpwyPaU7UABj1jLaouw/",
	        	resourceId: "column01", 
	        	accessFunctionId: "",
	          	visible:  true  , 
	        	styleClasses : "col-xs-12 col-md-12  cnx-column",
	        	label: { "default" : "Column (0-1)"},
	        	children: [ 
	            {	
	                	controlName: "cnx-calendar", 
	                	id: "CcdGLNXlbmYiAKDuXqJQlXNYcx",
	                	path: "Ccl1KlN4AyWFgIJw030Nd7uk/CcobAMpwyPaU7UABj1jLaouw/Cc2aj2kgYbKHWUboKdKnXJcW/CcdGLNXlbmYiAKDuXqJQlXNYcx/",
	                	resourceId: "upcomingcalendaritems", 
	                	accessFunctionId: "",
	                  	visible:  true  , 
	                	styleClasses : "col-xs-12 col-md-12  cnx-calendar",
	                	autoloadData: true, 
	                	newEventEntity: { $loader: { typeId: "cGDxMDYLmPUjDJczbxeZo0KtY"} },
	                	dataLoader: "GetCalendarDataEntities",
	                	isList: true,
	                	dataIdField :  "objectId"  ,
	                	dataPath: "GetCalendarDataEntities_data",
	                	filterCriteriaPath: "TestGetCalendarData.input",
	                	label: { "default" : "Upcoming Calendar Items"},
	                	isMultiDataType: true,
	                	allowStartDateSelection: false,
	                	displayType:  "list",
	                	itemType: "popUp",
	                	dateRangeSelectionType:  "nextNDays",
	                	displayType:  "list",
	                	dateRangePeriod:  365,
	                	maxRecordsToShow:  3,
	                	calendarEventEntity:  { $loader: { typeId: "cz57gGG82dIWEhKRjmGQ1Qul"} },
	                	entityCalendarDataAPI:  "ListCalendarData",
	                	fullCalendarViewId:  "c4M7B2gx1LFQfBeZp117XFa",

	               }
	            ]
	         }
	        ]
	});

var calendarPopup = { showTitleBar: true, 
		resourceId: "calendarPopup", styleClasses:"col-md-12 row", gutter: "sm", controlName: "cnx-widget", loaded: false, 
		widgetId: "calendarPopup", label: { 'default' : '' }, _instance: new Date().getTime()
	};


	
Vue.component('cnx-qtis-globalsearch', {
	extends: searchComponent,
	template: `
	<template id="cnx-qtis-globalsearch">    
	<div class="row q-my-xs searchAllPanel " style="width:500px;">
		<q-input :loading="searching" v-model="searchAllText" class="col-md-12 bg-white" autofocus filled bg-transparent borderless debounce="300" @input="search('search')"> 
			<template v-slot:append v-if="!searching" >
		  		<q-btn class="cursor-pointer cnx-input-action" dense size="md" flat icon-right="search" @click="search('search')"></q-btn>
            </template>    
		</q-input>  
		<div class="row col-md-12 q-pt-sm col-12 accordian-section"  
			v-if="searchAllText" > 

			<q-list v-if="uistate.results.CasesList.length > 0">
			    <template v-for="item in uistate.results.CasesList">
					<template v-if="SelectedCaseId == item.CaseNumber">
						<q-expansion-item group="casegroup" :label="caseLabel(item.CaseNumber)" :caption="CaseRowsCount(uistate.results.allCases, item.CaseNumber)" header-class="case-accordian" default-opened>
							<q-card>
							  <q-card-section>
								<q-table flat class="col-md-12" :pagination.sync="uistate.pagination" :key="searchAllText"
								:data="CaseRows(uistate.results.allCases, item.CaseNumber)" :columns="uistate.resultColumns" hide-bottom hide-header>
									
									<template v-slot:body-cell-entityname="props"> 
									  <q-td :props="props">    
										<q-btn size="md"  class="q-pa-xs searchAllResult" no-caps flat dense color="blue" :label="props.value" ></q-btn>
									  </q-td> 
									</template>   
									<template v-slot:body-cell-label="props">  
									  <q-td :props="props"  class="ellipses">  
										<q-btn size="md" @click="openRecord(props.row)" class="ellipsis searchAllResult" no-caps flat color="black" :label="recordData(props)" style="max-width:250px !important;margin:0px !important;padding-left:0px !important;" >
									  </q-td>
									</template>
									
								</q-table>
							  </q-card-section>
							</q-card>
						</q-expansion-item>
					</template>
					<template v-else>
						<q-expansion-item group="casegroup" :label="caseLabel(item.CaseNumber)" :caption="CaseRowsCount(uistate.results.allCases, item.CaseNumber)" header-class="case-accordian">
							<q-card>
							  <q-card-section>
								<q-table flat class="col-md-12" :pagination.sync="uistate.pagination" :key="searchAllText"
								:data="CaseRows(uistate.results.allCases, item.CaseNumber)" :columns="uistate.resultColumns" hide-bottom hide-header>
									
									<template v-slot:body-cell-entityname="props"> 
									  <q-td :props="props">    
										<q-btn size="md"  class="q-pa-xs searchAllResult" no-caps flat dense color="blue" :label="props.value" ></q-btn>
									  </q-td> 
									</template>   
									<template v-slot:body-cell-label="props">  
									  <q-td :props="props"  class="ellipses">  
										<q-btn size="md" @click="openRecord(props.row)" class="ellipsis searchAllResult" no-caps flat color="black" :label="recordData(props)" style="max-width:250px !important;margin:0px !important;padding-left:0px !important;" >
									  </q-td>
									</template>
									
								</q-table>
							  </q-card-section>
							</q-card>
						</q-expansion-item>
					</template>
				  
				</template>
			</q-list>
	
		<!--<q-tabs v-model="resultType" class="col-md-12 full-width bg-grey-1 searchAllResultsTabs" color="purple" active-color="purple">
			<q-tab name="thisCase" v-if="!caseDropdown"> 
				<span>This Case<q-badge class="text-white q-ml-lg q-mb-xs" :color="uistate.results.thisCase.length > 0 ? 'purple' : 'grey'" >{{uistate.results.thisCase.length}}</q-badge></span>
			</q-tab>  
			<q-tab name="otherCases" >
				<span>Other Cases<q-badge class="text-white q-ml-lg q-mb-xs" :color="uistate.results.thisCase.length > 0 ? 'purple' : 'grey'" >{{uistate.results.otherCases.length}}</q-badge></span>
			</q-tab>  
		</q-tabs> 
		 <q-tab-panels v-model="resultType" animated class="col-md-12 full-width searchAllResultsPanels">
		 	<q-tab-panel name="thisCase" v-if="!caseDropdown">
		 		<div class="full-width" style="height:400px;">
		 		<q-scroll-area class="fit fit-scroll" :thumb-style="{backgroundColor: '#d500f9', width:'5px', height: '200px', opacity: 0.6}">
		 		<q-table flat class="col-md-12" :pagination.sync="uistate.pagination" :key="searchAllText"
					:data="uistate.results.thisCase" :columns="uistate.resultColumns" hide-bottom hide-header>
					  
					<template v-slot:body-cell-entityname="props"> 
			          <q-td :props="props">     
			          	<q-btn size="md"  class="q-pa-xs searchAllResult" no-caps flat dense color="blue" :label="props.value" ></q-btn>
			          </q-td> 
			        </template>   
			        <template v-slot:body-cell-label="props">  
			          <q-td :props="props"  >  
			          	<q-btn size="md" @click="openRecord(props.row)" class="ellipsis searchAllResult" no-caps flat color="black" :label="props.value" style="max-width:250px !important;margin:0px !important;padding-left:0px !important;" ></q-badge>
			          </q-td> 
			        </template>
				</q-table>
				</q-scroll-area>
				</div> 
		 	</q-tab-panel>   
		 	<q-tab-panel name="otherCases"> 
		 		<div class="full-width" style="height:400px;">
		 		<q-scroll-area class="fit fit-scroll" :thumb-style="{backgroundColor: '#d500f9', width:'5px', height: '200px', opacity: 0.6}">
		 		<q-table flat class="col-md-12" :pagination.sync="uistate.pagination" :key="searchAllText"
					:data="uistate.results.otherCases" :columns="uistate.resultColumns" hide-bottom hide-header>
					
					<template v-slot:body-cell-entityname="props"> 
			          <q-td :props="props">    
			          	<q-btn size="md"  class="q-pa-xs searchAllResult" no-caps flat dense color="blue" :label="props.value" ></q-btn>
			          </q-td> 
			        </template>   
			        <template v-slot:body-cell-label="props">  
			          <q-td :props="props"  class="ellipses">  
			          	<q-btn size="md" @click="openRecord(props.row)" class="ellipsis searchAllResult" no-caps flat color="black" :label="props.value" style="max-width:250px !important;margin:0px !important;padding-left:0px !important;" ></q-badge>
			          </q-td>
			        </template>
			        
				</q-table>
				</q-scroll-area>
				</div>
		 	</q-tab-panel>
		 	
		 </q-tab-panels>-->
		</div>
	</div>
</template>
	`,
	data(){
		return {
			SelectedCaseId: ''
		}
	},
	created() { 
		this.SelectedCaseId = '';
		this.uistate.results = { allCases: [], CasesList: [] };
		this.uistate.typeIdentifier = "EntityId";
		this.loadEntities();	
		var caseDropdownValue = localStorage.getItem('caseDropdown');
		if(caseDropdownValue != "All"){
			this.SelectedCaseId = caseDropdownValue;
		}		
	},
	methods: {
		openRecord(row) {
			var widgetEntityForm = this.$root.getGlobalComponent("widgetEntityForm");
			widgetEntityForm.openForm(this, row, row.Label, row.EntityId, "view");
		},
		doSearchCheck(entity) {
			return !entity.tags;
		},
		processResultRow(row) {
			if (row.CaseId) {
				var CaseData = this.$root.viewRoot.model.userCases[row.CaseId];
				if(CaseData != null){
					if(!this.uistate.results.CasesList.includes(CaseData)){
						this.uistate.results.CasesList.push(CaseData);
					}
				}
				var userCase = this.$root.viewRoot.model.userCases[row.CaseId];
				row.label = row.label + " (Case: " + userCase.CaseNumber + ")"; 
				const found = this.uistate.results.allCases.some(el => el.Id === row.Id);
				if (!found) this.uistate.results.allCases.push(row);

			} else {
				if(row.entityName == "Client Invoices"){
					var OtherCaseData = {};
					OtherCaseData.CaseNumber = "Invoice";
					const found = this.uistate.results.CasesList.some(el => el.CaseNumber === "Invoice");
					if (!found) this.uistate.results.CasesList.push(OtherCaseData);
					row.label = row.label + " (Case: Invoice)"; 
					const found1 = this.uistate.results.allCases.some(el => el.Id === row.Id);
					if (!found1) this.uistate.results.allCases.push(row);
				}
			}
			this.uistate.results.CasesList.sort(function(a, b) {
				var textA = a.CaseNumber.toUpperCase();
				var textB = b.CaseNumber.toUpperCase();
				return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
			});
			
			if(this.SelectedCaseId != ''){
				const idx = this.uistate.results.CasesList.findIndex(a => a.CaseNumber === this.SelectedCaseId);
				const none = this.uistate.results.CasesList.splice(idx, 1);
				this.uistate.results.CasesList.sort((a, b) => a.CaseNumber.localeCompare(b.CaseNumber));
				this.uistate.results.CasesList.splice(0,0, none[0]);
			}
		},
		recordData(rowData){
			var label = rowData.value.split(" (Case: ");
			if(label[0] == "undefined"){ 
				if(rowData.row.Label){
					var newlabel = rowData.row.Label.split(" (Case: ");
				} else {
					var newlabel = rowData.row.label.split(" (Case: ");
				}
				if(newlabel[0] == "undefined"){ 
					return rowData.row.Id;
				} else {
					return rowData.row.Label;
				}
			}
			return (label[0] == "undefined") ? rowData.row.Id : label[0];
		},
		caseLabel(caseName){
			if(this.SelectedCaseId != ''){
				var currentcase = caseName + ' (THIS CASE) ';
				return (this.SelectedCaseId == caseName) ? currentcase : caseName;
			} else {
				return caseName;
			}
		},
		CaseRows(allRows, caseName){
			var result = [];
			for (var i = 0; i < allRows.length; i++) {
				entry = allRows[i];
				var casedata = entry.label.split(" (Case: ");
				casedata = casedata[1].replace(")", "");
				if(casedata == caseName){
					result.push(entry);
				}
			}
			return result;
		},
		CaseRowsCount(allRows, caseName){
			var result = [];
			for (var i = 0; i < allRows.length; i++) {
				entry = allRows[i];
				var casedata = entry.label.split(" (Case: ");
				casedata = casedata[1].replace(")", "");
				if(casedata == caseName){
					result.push(entry);
				}
			}
			return result.length;
		}
	}
});

	 
	Vue.component('cnx-qtis-topControls', {
		template: `
		<template id="cnx-qtis-topControls">  
	<div class="row topbar-right flex items-center" :key="updateToggle">

		<template v-if="ShowCaseDropdown && checkTopbarPermission('topbar.clockinout', 1) && ShowTopbarIcons('clock')" :key="updateToggle">
			<div class="clock-btn-group" v-if="selectedCase && selectedCase.CaseNumber != 'All'">
				<q-btn color="primary" class="clockin-btn" icon="alarm_add" @click="toggleClockIn" v-if="ShowClockIN"><q-tooltip>Clock In</q-tooltip></q-btn>
				
				<q-btn color="primary" class="clockpause-btn" icon="snooze" @click="toggleClockPause" v-if="ShowClockPause"><q-tooltip>Pause</q-tooltip></q-btn>
				
				<q-btn color="primary" class="clockcontinue-btn" icon="snooze" @click="toggleClockContinue" v-if="ShowClockContinue"><q-tooltip>Continue</q-tooltip></q-btn>
				
				<q-btn color="primary" class="clockout-btn" icon-right="alarm_off" @click="toggleClockOut" v-if="ShowClockOUT"><q-tooltip>Clock Out</q-tooltip></q-btn>
			</div>
		</template>
		
		<template v-if="clockMode == 'clockpause'">
			<clockpause @checkClock="CheckClockState" v-bind:clockModeProps="'clockpause'"/>
		</template>
		
		<template v-if="clockMode == 'clockcontinue'">
			<clockcontinue @checkClock1="CheckClockState" v-bind:clockModeProps="'clockcontinue'"/>
		</template>
		
		<q-dialog v-model="clockModel"
         content-class="cnx-modal" transition-show="fade"
         transition-hide="fade" :maximized="$q.screen.lt.md" persistent
         :style="$q.screen.lt.md ? '' : 'min-width:960px' " >
			<q-card 
            class="bg-white form-popup shadow-20"
            :style="$q.screen.lt.md ? 'width:100%;' : 'min-width:960px' ">
				<q-card-section class="row items-center dialog" style="padding:0px !important;margin:0px !important;">
					<q-toolbar :class="'bg-grey-- q-pl-md'">
					  <q-toolbar-title
						 :class="'text-blue' + ' text-subtitle text-weight-thin'" floating
						 font-weight-thin class="q-toolbar__title ellipsis mr-5 align-center text-blue text-subtitle text-weight-thin text-blue text-subtitle text-weight-thin" >{{ (clockMode == 'clockin') ? 'Clock IN' : 'Clock OUT' }}
					  </q-toolbar-title>
					<q-btn icon="close" size="md" flat id="clockclosebtn" @click="handleItemCancel()"></q-btn>
				  </q-toolbar>
				</q-card-section style="min-height:150px;">
				<q-separator></q-separator>
				<template v-if="clockMode == 'clockin'">
					<clockin v-bind:clockModeProps="'clockin'"/>
				</template>
				<template v-if="clockMode == 'clockout'">
					<clockout v-bind:clockModeProps="'clockout'"/>
				</template>
			</q-card>
		</q-dialog>
		
	  
	<q-btn-toggle dense flat outlined v-if="$q.screen.gt.sm && checkTopbarPermission('topbar.layouts', 1) && ShowTopbarIcons()"
        v-model="selectedView" 
        @input="onLayoutChange"
        color="purple-11" size="sm"
        toggle-color="purple-14"
        :options="[
          {slot: 'column', value: 'column'},
		  {slot: 'grid', value: 'grid'},
          {slot: 'row', value: 'row'}
        ]">
         
        <template v-slot:column>
          <q-icon style="width:18px;height:18px" :name="'img:' + baseURL + '/common/icons/ColumnView' + (selectedView == 'column' ? '_sel.png' : '.png')" ></q-icon>
        </template>
		<template v-slot:grid>
          <q-icon style="width:18px;height:18px" :name="'img:' + baseURL + '/common/icons/GridView' + (selectedView == 'grid' ? '_sel.png' : '.png')" ></q-icon>
        </template>

        <template v-slot:row>
          <q-icon style="width:18px;height:18px" :name="'img:' + baseURL + '/common/icons/RowView' + (selectedView == 'row' ? '_sel.png' : '.png')" ></q-icon>
        </template>
     </q-btn-toggle> 
	
	<q-btn label="Feedback" class="text-white bg-blue" style="min-height: 25px !important; padding: 0px 9px;
    height: 26px; letter-spacing: 0.5px;" v-if="subTenantName == 'cpsubscription'" @click="showFeedback()"></q-btn>

	<q-select :label="caseLabelText" :options="cases" color="grey-8" class="q-px-md case-dropdown" dense style="width:180px;" options-sanitize v-model="selectedCase" @input="onCaseChange" map-options option-value="Id" option-label="CaseNumber" v-if="ShowCaseDropdown && user.userDetails.clientId != 'NA'">
		<template v-slot:option="scope">
			<q-item dense :key="scope.opt.Id" clickable v-ripple v-close-popup @click="CaseOptionChange(scope.opt)">
				<q-item-section>
					<q-item-label>{{scope.opt.CaseNumber}}</q-item-label>
					<q-tooltip content-class="case-hover">
						<div class="case-hover-wrap">
							<u>Assigned Users</u>
							<q-item-label v-for="user in CaseUsersList" v-if="user.caseId == scope.opt.Id">
								{{user.Name}} | {{user.Role}}
							</q-item-label>
						</div>
					</q-tooltip>
				</q-item-section>
			</q-item>
		</template>
	</q-select>
	<q-select :label="caseLabelText" :options="ClientCaseGroup" color="grey-8" class="q-px-md case-accordian-dropdown" dense style="width:220px;" options-sanitize v-model="selectedCase" @input="onCaseChange" map-options option-value="Id" option-label="CaseNumber" v-if="ShowCaseDropdown && user.userDetails.clientId == 'NA'" popup-content-class="case-accordian" :key="updateToggle">
		<template v-slot:option="scope">
			<template v-if="scope.opt.children">
				<q-expansion-item dense expand-separator header-class="text-weight-bold" :label="scope.opt.label" default-opened>
					<template v-for="child in scope.opt.children">
						<q-item dense :key="child.Id" clickable v-ripple v-close-popup  @click="CaseOptionChange(child)"  :class="{ 'bg-blue': selectedCase === child }">
							<q-item-section>
								<q-item-label>{{child.CaseNumber}}</q-item-label>
								<q-tooltip content-class="case-hover">
									<div class="case-hover-wrap">
										<u>Assigned Users</u>
										<q-item-label v-for="user in CaseUsersList" v-if="user.caseId == child.Id">
											{{user.Name}} | {{user.Role}}
										</q-item-label>
									</div>
								</q-tooltip>
								<span :class="(child.CaseStatus1 == 'ACTIVE') ? 'case-active' : 'case-inactive'"></span>
							</q-item-section>
						</q-item>
					</template>
				</q-expansion-item>
			</template>
			<template v-else>
				 <q-item dense :key="scope.opt.Id" clickable v-ripple v-close-popup @click="CaseOptionChange(scope.opt)">
						<q-item-section>
							<q-item-label>{{scope.opt.CaseNumber}}</q-item-label>
							<q-tooltip content-class="case-hover">
								<div class="case-hover-wrap">
									<u>Assigned Users</u>
									<q-item-label v-for="user in CaseUsersList" v-if="user.caseId == child.Id">
										{{user.Name}} | {{user.Role}}
									</q-item-label>
								</div>
							</q-tooltip>
						</q-item-section>
					</q-item>
			</template>
        </template>
	</q-select>
	
	<div class="top-btn-group">
	<q-btn :icon="'img:' + baseURL + 'common/icons/search-purple.png'" flat round push dense v-if="checkTopbarPermission('topbar.search', 1) && ShowTopbarIcons('search')" :key="updateToggle"> 
		<q-popup-proxy style="height:600px;" dense> 
			  
			  
          <cnx-qtis-globalsearch v-bind:typeIdentifier="'EntityId'" ></cnx-qtis-globalsearch>
          
        </q-popup-proxy>
	</q-btn> 
	
	<q-btn :icon="'img:' + baseURL + 'common/icons/notification-icon.png'" flat round push  dense :key="notificationUpdateToggle" class="notification-icon" :class="(notifications.length + tasks.length > 0) ? 'alert' : ''" v-if="checkTopbarPermission('topbar.notifications', 1) && ShowTopbarIcons()"> 
		 <q-badge  class="animated flash" style="font-size:10px;margin-top:5px !important;" v-if="notifications.length + tasks.length > 0" 
			color="accent" floating>{{notifications.length + tasks.length}}</q-badge>
		 <q-popup-proxy style="height:600px;" dense>
		 	<q-list :key="notificationKey"> 
		 		
		 		<q-item style="border-bottom:1px solid rgba(0,0,0,0.1) !important" v-for="task in tasks">
		 			<q-item-section class="notification-text">
		 				<q-linear-progress :value="task.completion/100" color="accent" :key="notificationKey">
					      <div class="absolute-full flex flex-center">
					        <q-badge color="white" text-color="accent" 
					        	:label="task.Name + ': ' + (task.completion > 0 ? (task.completion + '%') : task.TaskStatus)"></q-badge>
							<q-tooltip content-class="notification-tooltip" anchor="top middle" self="top middle">
								{{task.Name}} Start Time: {{task.StartTime}} : {{task.completion}} %
							</q-tooltip>
							<q-btn-group flat dense unelevated>
					        <q-btn  v-if="task.TaskStatus != 'Completed' && task.completion < 100"
					        	:label="task.TaskStatus != 'Cancelling' && task.TaskStatus != 'Cancelled' ? 'Cancel' : task.TaskStatus" 
					        	:outlined="task.TaskStatus == 'Cancelling' || task.TaskStatus == 'Cancelled'"
					        	:disable="task.TaskStatus == 'Cancelling' || task.TaskStatus == 'Cancelled'"
					        	size="sm" color="red" unelevated @click="startCancelTask(task)">
					        </q-btn>
							<q-btn flat dense @click="closeTaskNotification(task.Id)" unelevated icon="close" >
							</q-btn> 
							</q-btn-group
					      </div>
					    </q-linear-progress>
					    
					    
					</q-item-section>
		 		</q-item>
		 		
			<template v-for="notification in notifications">
		 		<q-item class="notification-item" style="border-bottom:1px solid rgba(0,0,0,0.1) !important">
		 			<q-item-section :key="notification.data.length"> 
		 				<q-btn-group flat dense unelevated> 
		 				<q-btn no-caps align="left" style="width:100%" :loading="notification.loading" flat dense @click="handleNotificationNav(notification)" unelevated >
		 					<div class="row items-center" > 
								<div class="col q-mr-md ellipsis" style="font-size:15px;text-align:left !important;">{{ notification.Label }}</div>
								<q-tooltip content-class="notification-tooltip" anchor="top middle" self="top middle">
									{{ notification.Label }}
								</q-tooltip>
								<div class="col-auto q-ml-xs notification-btn-group">
									<template v-if="notification.added"><q-badge class="q-pa-xs" color="green" >{{notification.added}} Added </q-badge></template>
									<template v-if="notification.imported"><q-badge class="q-pa-xs" color="green-8" ></q-icon>{{notification.imported}} Imported </q-badge></template>
									<template v-if="notification.updated"><q-badge class="q-pa-xs" color="blue" ></q-icon>{{notification.updated}} Updated</q-badge></template>
									<template v-if="notification.deleted"><q-badge class="q-pa-xs" color="red" >{{notification.deleted}} Deleted</q-badge></template>
								</div>
		 					</div>
		 				</q-btn>
		 				<q-btn flat dense @click="closeNotification(notification)" unelevated icon="close" >
		 				</q-btn> 
		 				</q-btn-group>
		 				<q-list style="width:100%" v-if="notification.data.length > 0"> 
		 				<q-item clickable style="border-top:2px solid rgba(0,0,0,0.05) !important" @click="openNotificationRecord(changedItem)" v-for="changedItem in notification.data" >
		 					<q-item-section  >
								<div class="row items-center" > 
									<div class="col q-mr-md ellipsis" style="font-size:15px;text-align:left !important;">{{ changedItem.Label }}</div>
									<q-tooltip content-class="notification-tooltip" anchor="top middle" self="top middle">
										{{ changedItem.Label }}
									</q-tooltip>
									<div class="col-auto q-ml-xs" v-if="changedItem.Deleted == 0 && changedItem.RecordStatus == 'added'" ><q-badge class="q-pa-xs" color="green" >Added </q-badge></div>
									<div class="col-auto q-ml-xs  items-center" v-if="changedItem.Deleted == 0 && changedItem.RecordStatus == 'updated'" ><q-badge class="q-pa-xs" color="blue" >Updated</q-badge></div>
									<div class="col-auto q-ml-xs" v-if="changedItem.Deleted == 1" ><q-badge class="q-pa-xs" color="red" >Deleted</q-badge></div>
								</div>
							</q-item-section>
		 				</q-item>
		 				</q-list>
		 				
		 			</q-item-section>
		 		</q-item>
		 		
		 		</template>
				<q-btn label="Clear All" class="clear-top" @click="clearTopnotification" v-if="notifications.length + tasks.length > 0"><i aria-hidden="true" class="material-icons q-icon">close</i></q-btn>
		 	</q-list>
		 	 
				     
         </q-popup-proxy>
	</q-btn>
	
	
	<q-btn :icon="'img:' + baseURL + 'common/icons/setting.png'" flat round push  dense> 
		<q-popup-proxy style="height:600px;" dense> 
			  
			  
          <cnx-account-menu v-bind:isLight="true"></cnx-account-menu>
          
        </q-popup-proxy>
	</q-btn>
	 <q-btn :icon="'img:' + baseURL + 'common/icons/comment.png'" color="purple" flat round push  dense @click="showChatwindow()" :class="(msgnotifications > 0) ? 'chat-alert' : ''" v-if="checkTopbarPermission('topbar.chat', 1) && ShowTopbarIcons('chat') && subTenantName != 'cpsubscription'" :key="updateToggle">  
		<q-badge  class="animated flash" style="font-size:10px;margin-top:5px !important;" color="accent" floating v-if="msgnotifications > 0">{{msgnotifications}}</q-badge>
	 </q-btn> 
	 
	 </div>
		 <cnx-qtis-drilldown ></cnx-qtis-drilldown>
		 
	

	 
<q-dialog v-model="showNewDialog" content-class="cnx-modal"
		transition-show="fade" transition-hide="fade" persistent>  
		
		<q-card class="bg-white shadow-20 row" > 
		
		<q-card-section class="row items-center dialog" style="padding:0px !important;margin:0px !important;" >
        	 <span class="text-subtitle1 q-pa-md">Create new item: <b>{{ newItemDetails.$label }}</b>?</span>
        </q-card-section>
		
		<q-separator></q-separator> 
		

    <q-card-actions align="right" class="full-width row dialog">
		<q-btn flat @click="handleNew('OK')" v-if="newItemDetails._allowQuickAdd" autofocus> Ok</q-btn> 
		<q-btn flat @click="handleNew('CANCEL')">Cancel</q-btn> 
		<q-btn flat @click="handleNew('DETAIL')">Details</q-btn>
	</q-card-actions>
	 
	</q-card> 
	
	</q-dialog> 
	
	<div class="toggle-chat-calendar">
		<div class="calendar-sticky-icon">
            <q-btn fab icon ="today" color="blue" @click="toggleCalendar()" class ="floating-action-button hidecalendar" v-bind:class="{showcalendar: showChat}" v-click-outside="outside"  v-if="checkViewPermission(1)"/>
              <div :key="calendarKey" style="width:400px" v-if="closecalendar">
				<div class="q-menu scroll calendar-sticky hidecalendarpopup" v-bind:class="{showcalendarwindowpopup: showCalendar}" >
					<cnx-widget v-if="calendarPopupWidget" v-bind:uiprops="calendarPopupWidget" :key="calendarKey"></cnx-calendar>
				</div>
              </div>
        </div>
	    <div style="width:600px !important;" class="chat-sticky-window" class="hidechat"  @click="openChaticon()" v-bind:class="{showchatwindow: showChat}" > 
		   <chat v-bind:chatRooms="chatRooms" />
		</div>
	</div>
	<cnx-qtis-map></cnx-qtis-map>
	
		<q-dialog v-model="SubscriberInfoModel"
         content-class="cnx-modal" transition-show="fade"
         transition-hide="fade" :maximized="$q.screen.lt.md" persistent
         :style="$q.screen.lt.md ? '' : 'min-width:960px' " >
			<q-card 
            class="bg-white form-popup shadow-20"
            :style="$q.screen.lt.md ? 'width:100%;' : 'min-width:960px' ">
				<q-card-section class="row items-center dialog" style="padding:0px !important;margin:0px !important;">
					<q-toolbar :class="'bg-grey-- q-pl-md'">
					  <q-toolbar-title
						 :class="'text-blue' + ' text-subtitle text-weight-thin'" floating
						 font-weight-thin class="q-toolbar__title ellipsis mr-5 align-center text-blue text-subtitle text-weight-thin text-blue text-subtitle text-weight-thin" >Subscribers Info - Edit </q-toolbar-title>
					<q-btn icon="close" size="md" flat id="subscribeclosebtn" @click="handleItemInfoCancel()"></q-btn>
				  </q-toolbar>
				</q-card-section style="min-height:150px;">
				<q-separator></q-separator>
				<subscriberinfo v-bind:SubscriberInfoData="SubscriberInfoData"></subscriberinfo>
			</q-card>
		</q-dialog>

		<q-dialog v-model="feedbackDialog" content-class="cnx-modal" persistent transition-show="none" transition-hide="none" :maximized="$q.screen.lt.md" persistent :style="$q.screen.lt.md ? '' : 'min-width:700px' ">  
			<q-card class="bg-white shadow-20 row" :style="$q.screen.lt.md ? 'width:100%;' : 'min-width:700px'"> 
				<q-card-section class="row full-width dialog" style="border-bottom:1px solid rgba(0,0,0,0.1)">
					<q-toolbar :class="'bg-grey-- '"> 
						<q-toolbar-title class="text-h6 mr-5 align-center" floating style="margin-left: -10px !important;">Feedback</q-toolbar-title>  
						<q-btn icon="close" size="md" flat v-close-popup></q-btn>
					</q-toolbar> 
				</q-card-section>
				<q-card-section  class="row  full-width items-center text-left dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
					<div class="col-md-12">
						<q-form @submit.prevent="submitForm" ref="form">
							<div class="row full-width">
								<div class="col-md-12">
									<q-input filled v-model="feedback" label="Enter Feedback" ref="feedback" type="textarea" :rules="[val => !!val || 'Feedback is required']"/>
								</div>
							</div>
							<q-separator size="2px" style="margin: 0px 0px 15px 0px !important;"></q-separator>
							<div class="row full-width">
								<div class="col-md-12 text-right">
									<q-btn type="submit" label="Send Feedback" class="text-white bg-blue" />
								</div>
							</div>
						</q-form>
					</div>
				</q-card-section>
			</q-card> 
		</q-dialog>

		<q-dialog v-model="helpDialog" content-class="cnx-modal" persistent transition-show="none" transition-hide="none" :maximized="$q.screen.lt.md" persistent :style="$q.screen.lt.md ? '' : 'min-width:90%' ">  
			<q-card class="bg-white shadow-20 row" style="max-height: calc(100vh); min-width:90%; width:100%;" > 
				<q-card-section class="row full-width dialog" style="border-bottom:1px solid rgba(0,0,0,0.1)">
					<q-toolbar :class="'bg-grey-- '"> 
						<q-toolbar-title class="text-h6 mr-5 align-center" floating style="margin-left: -10px !important;">{{helpTitle}}</q-toolbar-title>  
						<q-btn icon="close" size="md" flat @click="handleClosePopup()" v-close-popup></q-btn>
					</q-toolbar> 
				</q-card-section>
				<q-card-section  class="row  full-width items-center text-left dialog" style="border-bottom: 1px solid rgba(0,0,0,0.1)">
					<div class="row full-width">
						<q-inner-loading :showing="showLoader" style="z-index: 9999;">
							<q-spinner size="20em" :thickness="1" color="primary"></q-spinner>
						</q-inner-loading>
						<template v-if="helpTitle == 'Getting Started'">
							<iframe width="100%" height="400px" src="https://www.youtube.com/embed/qWJ4Y9jfJQs?rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
						</template>
						<template v-else>
							<iframe :src="helpSrc" width="100%" height="600" frameborder="0" allowfullscreen>Your browser does not support iframes.</iframe>
						</template>
					</div>
				</q-card-section>
			</q-card> 
		</q-dialog>
	</div>
</template>  
		`,
		data: function() {
			return {
				baseURL: baseURL,
				cases: [],
				notifications: [],
				msgnotifications: 0,
				notificationUpdateToggle: false,
				notificationKey: 0,
				selectedCase: null,
				selectedView: "column",
				loading: false,
				showNewDialog: false,
				newItemDetails: {},
				newItemAction: "",
				calendarPopupWidget: null,
				calendarKey: 0,
				chatRooms: [],
				uistate: { },
				showChat: false,
				showCalendar: false,
				tasks: [],
				clickOutside: 0,
				clickInside: 0,
				closecalendar: false,
				taskToCancel: null,
				ShowCaseDropdown: true,
				CalendarToggle: false,
				ViewCalendar: true,
				clockMode: '',
				clockModel: false,
				ShowClockIN: false,
				ShowClockOUT: false,
				ShowClockPause: false,
				ShowClockContinue: false,
				timesheetTable: {},
				SubscriberInfoModel: false,
				SubscriberInfoData: {},
				saving: false,
				ClientCaseGroup: [],
				CaseAccordian: false,
				updateToggle: false,
				CaseUsersList: [],
				caseLabelText: (subTenantName !== "tbt100840") ? "Case" : "Lead",
				feedbackDialog: false,
				feedback: '',
				helpDialog: false,
				helpTitle: '',
				helpSrc: '',
				showLoader: false,
			} 
		},  
		created() {
			this.$root.registerGlobalComponent("caseSelection", this); 
			this.$root.registerEventListener("messageReceived", this);
			this.$root.registerEventListener("settingsLoaded", this);
			this.$root.registerEventListener("chatNotificationReceived", this);
			this.$root.registerEventListener("CalendarCaseChanged", this);
			this.$root.registerEventListener("CheckCasePermission", this);
			this.$root.registerEventListener("ClockItemSaved", this);
			this.$root.registerEventListener("subscriberInfo", this);
			this.$root.registerEventListener("settingsLabelChange", this);
			this.$root.registerEventListener("helpWindow", this);
			subscribeToTopics(user.username);
			this.loadTasks();
			localStorage.setItem("caseDropdown", '');
			localStorage.setItem("locationDetails", '');
			localStorage.setItem("caseDropdownID", '');
			localStorage.setItem("NoViewPermissionCases", '');
			let self = this;
			setTimeout(function(){
				self.CheckClockInOut();
			}, 3500);
		},
		mounted() {  
			//executeDataAPI("InvestigationCase/list", { _searchAll: ""  }, null, this.updateCaseOptions);
			executeAppAPI("GetUserCaseRoleData", { }, null, this.updateCaseOptions);
		}, 
		destroyed() {
			this.$root.removeEventListener("messageReceived", this);
			this.$root.removeEventListener("caseSelection", this);
			this.$root.removeEventListener("ClockItemSaved", this);
			this.$root.removeEventListener("settingsLoaded", this);
			this.$root.removeEventListener("chatNotificationReceived", this);
			this.$root.removeEventListener("CalendarCaseChanged", this);
			this.$root.removeEventListener("CheckCasePermission", this);
			this.$root.removeEventListener("ClockItemSaved", this);
			this.$root.removeEventListener("subscriberInfo", this);
			this.$root.removeEventListener("settingsLabelChange", this);
			this.$root.removeEventListener("helpWindow", this);
		}, 
		methods: {
			handleClosePopup(){
				const helpContainer = document.getElementById("help");
				if (helpContainer) {
					const activeItems = helpContainer.querySelectorAll('.active-menu');
					activeItems.forEach(item => {
						item.classList.remove('active-menu');
					});
				}
			},
			showFeedback(){
				this.feedbackDialog = true;
			},
			submitForm(){
				if (this.$refs.form.validate()) {
					var selectedRow = {
						entity: "Entityc7N5yPz3ooFG3ib01oPmYGC3",
						$entity: "c7N5yPz3ooFG3ib01oPmYGC3",
						$loader: {className: "com.contineonx.core.persistence.EntityObject"},
						feedback: this.feedback,
						clientId: "NA",
						CaseId: this.$root.viewRoot.model.globalTags.CaseId,
						viewId: "cpsubscription-qtis-qtisweb",
					};
	
					executeDataAPI('Feedback/insert', selectedRow, null, this.handleAfterRes);
				} else {
					console.log("Form validation failed");
				}
			},
			handleAfterRes(response) {
				if (response.status == 'OK') {
					this.feedback = '';
	
					this.$refs.form.reset();
					this.$refs.form.resetValidation();
					
					this.feedbackDialog = false;

					this.$root.showDialog({
						show: true, 
						title: app.getLabel('Success'),
						message: app.getLabel('Success! Your feedback has been sent.'), 
						icon: "check_circle", 
						okButtonText: app.getLabel('OK'),
						onOk: function() {}
					});
				}
			},
			CheckClockState(param){
				this.CheckClockInOut();
			},
			CheckClockInOut(){
				var entityName = "ClockIN";
				var today = new Date();
				var FromDate = moment(today).format('YYYY-MM-DD');
				var ToDate = new Date(new Date(today).getTime() + (60000 * 60 * 24 * 1));
				ToDate = moment(ToDate).format('YYYY-MM-DD');
				if(this.selectedCase && this.selectedCase.Id && this.selectedCase.Id != 'ALL'){
					var params = {
						ClockInDateTimeFrom: FromDate, 
						//ClockInDateTimeTo: ToDate,
						UserId: user.id,
						CaseId: this.selectedCase.Id,
						IsOpenEntry: true,
					};
					executeDataAPI("ClockIN/list", params, null, this.updateClockEntry);
				}
			},
			updateClockEntry(response){
				var MapAPIkey = utils.getMapsAPIAccessKey();
				$.ajax({
					url: `https://www.googleapis.com/geolocation/v1/geolocate?key=${MapAPIkey}`,
					type: 'POST',
					data: JSON.stringify({considerIp: true}),
					contentType: 'application/json; charset=utf-8',
					dataType: 'json',
					success: (data) => {
						if (data) {
							var locationDetails = "Latitude: " + data.location.lat.toFixed(4) + ", Longtitude: " + data.location.lng.toFixed(4) + ", IP: " + userIPAddress;
							localStorage.setItem("locationDetails", locationDetails);
						} else {
							var locationdeatils = "No location access";
							localStorage.setItem("locationDetails", locationdeatils);
						}
					},
					error: (err) => {
					var locationdeatils = "No location access";
						localStorage.setItem("locationDetails", locationdeatils);
					},
				});
				
				// false button enable
				if(response.result && response.result.length == 0){
					this.ShowClockIN = true;
					this.ShowClockOUT = false;
					this.ShowClockPause	= false;
					this.ShowClockContinue	= false;
				} else {
					var entry = response.result[0];
					var DefaultClockOutDateTime = new Date(entry.DefaultClockOutDateTime.$date);
					var now = new Date();
					now.setHours(0,0,0,0);
					if (DefaultClockOutDateTime < now) {
						this.ShowClockIN = true;
						this.ShowClockOUT = false;
						this.ShowClockPause	= false;
						this.ShowClockContinue	= false;
					} else {
						if(entry.ContinueClockTime){
							var res = JSON.parse(entry.ContinueClockTime);
							if(res.StartTime && !res.EndTime){
								this.ShowClockIN = false;
								this.ShowClockOUT = true;
								this.ShowClockPause	= false;
								this.ShowClockContinue = true;
							}
							if(res.StartTime && res.EndTime){
								this.ShowClockIN = false;
								this.ShowClockOUT = true;
								this.ShowClockPause	= true;
								this.ShowClockContinue = false;
							}
						} else {
							this.ShowClockIN = false;
							this.ShowClockOUT = true;
							this.ShowClockPause	= true;
							this.ShowClockContinue	= false;
						}
					}
				}
				this.clockMode = '';
			},
			toggleClockIn(){
				clockInOutFormOpened = true;
				this.clockMode = "clockin";
				this.clockModel = true;
		    },
			toggleClockPause(){
				this.clockMode = "clockpause";
			},
			toggleClockContinue(){
				this.clockMode = "clockcontinue";
			},
			toggleClockOut(){
				clockInOutFormOpened = true;
				this.clockMode = "clockout";
				this.clockModel = true;
		    },
			handleItemCancel(){
				this.clockModel = false;
				clockInOutFormOpened = false;
				this.CheckClockInOut();
			},
			handleItemInfoCancel(){
				this.SubscriberInfoModel = false;
			},
			checkClockPermission(permission){
				var ClockPermission = checkPermission("entities.cj1GZZex0xH1A4InB7jZkbDIEc", permission);
				return (ClockPermission) ? true : false;
			},
			startCancelTask(task) {
				this.taskToCancel = task;
				 var evRef = this;
		   			this.$root.showDialog({
		   				  show: true, 
		   				  title: "Confirmation required!",
		   			   	  message: "Cancel this task? Any data already created will have to be deleted separately.", 
		   			   	  icon: "priority_high", 
		   			   	  showCancel: true,
		   			   	  cancelButtonText: "Cancel",
		   			   	  okButtonText: "OK",
		   			   	  ev : evRef,
		   			   	  onOk: function() { 
		   			   		  this.ev.cancelTask(); 
		   			   	  }
		   				});
			},
			checkViewPermission(permission) {
				var hasView = checkPermission("entities.cGDxMDYLmPUjDJczbxeZo0KtY", permission);
				if(hasView && this.ViewCalendar){
					return true;
				} else {
					return false;
				}
			},
			ShowTopbarIcons(type){
				if(type && (type == "search" || type == "chat" || type == "clock")){
					return true;
				} else {
					return false;
					if('clientId' in user.userDetails){
						return false;
					} else {
						return true;
					}
				}
			},
			ShowClockIcons(){
				if('clientId' in user.userDetails){
					return false;
				} else {
					return true;
				}	
			},
			checkTopbarPermission(id, permission){
				
				//setTimeout(() => {
					var TopbarPermission = checkPermission("menus."+id, permission);
					
					console.log('checkTopbarPermission', id,  TopbarPermission);
					return (TopbarPermission && this.selectedCase && this.selectedCase.Id && this.selectedCase.Id != "ALL") ? true : false;
				//}, 2500);
			},
			CaseAccordianDropdown(){
				this.CaseAccordian = true;
			},
			cancelTask() {
				var task = this.taskToCancel;
				if (true || task.TaskStatus == 'Queued') {
					task.TaskStatus = 'Cancelled';
					executeAppAPI("CancelImportTask", { parameters: { taskId: task.Id }}, task.Id + "_CancelQueued", function(response) {});
				}
				else {
					task.TaskStatus = 'Cancelling';
				}
				//task.TaskStatus = 'Cancelling';
				var cancelTaskAction = { $loader: {className:"com.contineo.runtime.processes.CancelTask" }, 
						taskId: task.Id };
				var cancelTask = new contineo.Action(cancelTaskAction, this);
				cancelTask.execute(function(response) {}, task.Id + "_Cancel");
				this.notificationKey = this.notificationKey + 1;
			},			
			loadTasks() {
				executeDataAPI("SystemTask/list", { CreatedBy: user.username, TaskStatus: ['Queued', 'Started'] }, null, this.updateTasks);
			},
			updateTasks(response) { 
				this.tasks = response.result;
				for (let t = 0; t < this.tasks.length; t++) {
					this.calculateTaskCompletion(this.tasks[t]);
				}
			},
			openNotificationRecord(changedItem) {
				var widgetEntityForm = this.$root.getGlobalComponent("widgetEntityForm");
				widgetEntityForm.openForm(this, changedItem, changedItem.Label, changedItem.EntityId, "view");
			},
			showChatwindow(){
				if(this.cases.length == 1 && this.cases.CaseNumber == "All"){
					this.ViewCalendar = false;
					this.checkViewPermission(1);
				}
				this.showChat = !this.showChat;
				this.showCalendar = false;
				this.calendarPopupWidget = null;
			},	
			clearTopnotification(){
				this.tasks = [];
				for(var n = 0; n < this.notifications.length; n++){
					this.closeNotification(this.notifications[n]);
				}
			},			
			calculateTaskCompletion(task) {
				task.completion = 0;
				if (task.TotalCount) {
					if (!task.SuccessCount) { task.SuccessCount = 0; }
					if (!task.ErrorCount) { task.ErrorCount = 0; }
					task.completion = Math.ceil((100 * (task.SuccessCount + task.ErrorCount)) / task.TotalCount); 
				}
				if (task.TaskStatus == "Completed") {
					task.completion = 100;
				}
				if (task.completion > 100) {
					task.completion = 100;
				}
			},
			notifyEvent(event, eventData) { 
				if (event == "chatNotificationReceived") { 
					this.msgnotifications = eventData;
				}
				if (event == "settingsLoaded") { 
					this.uistate.settingsLoaded = true;
					this.loadNotifications();
				}
				if(event == "CalendarCaseChanged"){
					this.checkViewPermission(1);
				}
				if(event == "ClockItemSaved"){
					this.CheckClockInOut();
				}
				if(event == "subscriberInfo"){
					this.SubscriberInfoModel = true;
					this.SubscriberInfoData = eventData;
					localStorage.setItem("SubscriberInfoData", '');
					localStorage.setItem("SubscriberInfoData", eventData.abc);
					this.$root.emitEvent("subscriberInfo1", eventData);
				}
	   			if (event == "messageReceived") { 
	   				var msgParts = eventData.split(",");
	   				if (msgParts[0] == "TaskStatus") {
	   					//alert(eventData);
	   					var foundTask = null;
	   					for (let t = 0; t < this.tasks.length; t++) {
	   						var task = this.tasks[t];
	   						if (this.tasks[t].Id == msgParts[1]) {
	   							foundTask = task;
	   							break;
	   						}
	   					}
	   					if (!foundTask) {
	   						foundTask = {
	   							Id : msgParts[1], Name: msgParts[2], TotalCount: 0, SuccessCount: 0, ErrorCount: 0
	   						};
	   						this.tasks.push(foundTask);
	   						this.notificationUpdateToggle = !this.notificationUpdateToggle;
	   					}
	   					
	   					var updateTaskView = msgParts[3] != "Queued" || !foundTask.TaskStatus; 
	   						
	   					if (foundTask.TaskStatus != "Cancelling" || msgParts[3] == "Cancelled") {
	   						foundTask.TaskStatus = msgParts[3];
	   					}
	   					
						for (let c = 4; c < msgParts.length; c++) {
							var statusCount = msgParts[c].split("=");
							if (statusCount[0] == 'totalCount') { foundTask.TotalCount = foundTask.TotalCount + parseInt(statusCount[1]); }
							if (statusCount[0] == 'successCount') { foundTask.SuccessCount = foundTask.SuccessCount + parseInt(statusCount[1]); }
							if (statusCount[0] == 'errorCount') { foundTask.ErrorCount = foundTask.ErrorCount + parseInt(statusCount[1]); }
						}
						this.calculateTaskCompletion(foundTask);
						if (updateTaskView) {
							this.notificationKey = this.notificationKey + 1;
						}
	   				}
	   				else if (msgParts[msgParts.length-1] != user.username) {
	   					//alert(eventData);
	   					var entityParts = msgParts[0].split("/");
	   					var entity = entityParts.length == 1 ? entityParts[0] : entityParts[1];
	   					var caseId = entityParts.length == 1 ? null : entityParts[0];
	   					var userCase = this.$root.viewRoot.model.userCases[caseId];
   						if (!caseId || userCase) {
		   					var action = msgParts[1];
		   					var recordInfo = msgParts[2];
		   					var found = false;
		   					var notification;
		   					for (n = 0; n < this.notifications.length; n++) {
								notification = this.notifications[n];
								if ((!caseId || notification.CaseId == caseId) 
										&& notification.EntityId == entity) {
									found = true;
									break;
								}
							}
		   					if (!found) {
	   						
		   						notification = {
		   							EntityId: entity,
		   							CaseId: caseId,
		   							added: 0, updated: 0, imported: 0, deleted: 0,
		   							Label: ""
		   						};
	   						
		   						if (userCase) {
		   							notification.Label = userCase.CaseNumber + ": ";
		   						}
		   						var entityInfo = notificationEntities[notification.EntityId];
		   						if (entityInfo) {
		   							notification.Label =  notification.Label + entityInfo.label;
		   							notification.icon = entityInfo.icon;
		   						}
		   						
		   						this.notifications.unshift(notification);
	   						
	   						}
		   					notification[action] = notification[action] + 1;
		   					this.notificationUpdateToggle = !this.notificationUpdateToggle;
	   					}
	   				}
	   			}
				if(event == "settingsLabelChange"){
					this.caseLabelText = (eventData) ? "Project" : "Case";
				}
				if(event == "helpWindow"){
					this.helpDialog = true;
					this.showLoader = true;
					this.helpTitle = eventData.title;
					this.helpSrc = eventData.link;
					setTimeout(() => {
						this.showLoader = false;
					}, 1700);
				}
			},
			openChaticon(){
				this.$root.emitEvent("ChatpopupTriggered", true);
			},
			toggleCalendar() {
				recentUpcomingEvent = '';
				this.clickInside += 1;
				this.closecalendar = true;
				if (!this.calendarPopupWidget) {
					this.showCalendar = true;
					calendarPopup._instance = new Date().getTime();
					this.calendarPopupWidget = eval("(" + JSON.stringify(calendarPopup) + ")");
					this.calendarKey++;
				}
				else {
					this.showCalendar = false;
					this.calendarPopupWidget = null;
				}
				if(this.showCalendar){
					this.$root.emitEvent("calenderpopupTriggered", 'opened');
				} else {
					this.$root.emitEvent("calenderpopupTriggered", 'closeCal');
				}
			},
			handleTopMenuClick: function(url) {
				var menuItem = { url: url, top:true, id: url};
		 		handleNavMenuClick(menuItem);
		 	},
			showNewItemPrompt(control, newItem) {
				if (this.showNewDialog) {
					
				}
				else {
					newItem._allowQuickAdd = (control.uiprops.allowQuickAdd != "false");
					
					newItemDropDownSource = control;
					this.showNewDialog = true;
					this.newItemDetails = newItem;
					nextControlToFocus = document.activeElement;
				}
			},
			handleNew(action) {
				this.newItemAction = action;
				if (action == "OK") {
					newItemDropDownSource.endNewPrompt(true, this.newItemDetails, this.completeNew);
				}
				else if (action == "CANCEL") {
					newItemDropDownSource.endNewPrompt(false, this.newItemDetails);
					this.completeNew();
				} 
				else {
					newItemDropDownSource.handleNew(this.newItemDetails.$label);
					this.completeNew();
				} 
			},
			completeNew(response) {
				this.showNewDialog = false;
				if (response && response.result) {
					newItemDropDownSource.updateNewOption(response.result.Id, this.newItemDetails.$label);
				}
				else {
					Vue.nextTick(function () {
						if (nextControlToFocus) {
							nextControlToFocus.focus();
							nextControlToFocus = null;
						}
					});
				}
			},
			showAllCaseOption(show) {  
				if (user.userDetails.clientId != "NA") {
					var allCaseOption = this.cases.length > 0 ? this.cases[0] : null;
					if (show) {
						if (!allCaseOption || allCaseOption.Id != "ALL") {
							this.cases.splice(0,0, { Id: "ALL", CaseNumber: "All" });
						}
						if (!this.ShowCaseDropdown) { 
							this.selectedCase = this.cases[0];
							this.onCaseChange();
						}
					} else { 
						if (allCaseOption && allCaseOption.Id == "ALL") {
							this.cases.splice(0,1);
							if(this.cases.length > 0){
								if (allCaseOption.Id == this.selectedCase.Id) {
									this.selectedCase = this.cases[0];
									this.onCaseChange();
								}
							} else {
								this.$root.emitEvent("UserHasNoCase", true);
							}
						}
					}
				}
				if (user.userDetails.clientId == "NA") {
					var allCaseOption = this.ClientCaseGroup.length > 0 ? this.ClientCaseGroup[0] : null;
					if (show) {
						if (!allCaseOption || allCaseOption.Id != "ALL") {
							//this.ClientCaseGroup.splice(0,0, { Id: "ALL", CaseNumber: "All" });
						}
						if (!this.ShowCaseDropdown) { 
							this.selectedCase = this.ClientCaseGroup[0];
							this.onCaseChange();
						}
					} else { 
						if (allCaseOption && allCaseOption.Id == "ALL") {
							this.ClientCaseGroup.splice(0,1);
							if(this.ClientCaseGroup.length > 0){
								if (allCaseOption.Id == this.selectedCase.Id) {
									this.selectedCase = this.ClientCaseGroup[0];
									this.onCaseChange();
								}
							} else {
								this.$root.emitEvent("UserHasNoCase", true);
							}
						} else {
							if(this.ClientCaseGroup.length > 0){
								if (allCaseOption.Id == this.selectedCase.Id) {
									this.selectedCase = this.ClientCaseGroup[0];
									this.onCaseChange();
								}
							} else {
								this.$root.emitEvent("UserHasNoCase", true);
							}
						}
					}
				}
			},
			updateCaseOptions(response) {
				this.cases = response.result;
				if (this.cases.data) {
					this.cases = this.cases.data;
					
					if (user.userDetails.clientId == "NA") {
						this.ClientCaseGroup = [];
						for(var i = 0; i < this.cases.length; i++){
							executeAppAPI("getusersdataclient", { parameters: { CaseId: this.cases[i].Id} }, this.cases[i].Id, this.updateUserCaseOptions);
							if(this.cases[i].ClientCase){
								
								var ClientCase = this.cases[i].ClientCase.split(" : ");
								if(subTenantName == 'tbt100840'){
									this.cases[i].CaseNumber = this.cases[i].FullName;
								}
								
								const found = this.ClientCaseGroup.some(el => el.label === ClientCase[0]);
								if (!found) {
									this.ClientCaseGroup.push({'label': ClientCase[0], 'children': [this.cases[i]]});
								} else {
									for(var c = 0; c < this.ClientCaseGroup.length; c++){
										if(this.ClientCaseGroup[c].label == ClientCase[0]){
											if(subTenantName == 'tbt100840'){
												this.cases[i].CaseNumber = this.cases[i].FullName;
											}
											this.ClientCaseGroup[c].children.push(this.cases[i]);
										}
									}
								}
							}
						}
					} else {
						for(var i = 0; i < this.cases.length; i++){
							executeAppAPI("getusersdataclient", { parameters: { CaseId: this.cases[i].Id} }, this.cases[i].Id, this.updateUserCaseOptions);
						}
					}
				}
				this.updateToggle = !this.updateToggle;
				if (!window.location.hash || window.location.hash == ("#" + WIDGETS.DASHBOARD) || window.location.hash == ("#cQdkPmRmKzSog7c7n5jPdgaIg")) {
					this.showAllCaseOption(true);
				}
				this.$root.viewRoot.model.userCases = {};
				if (this.cases.length > 0) { 
					if(this.cases.length == 2){
						this.selectedCase = this.cases[1];
						var userCase = this.cases[1];
						this.$root.viewRoot.model.userCases[userCase.Id] = userCase;
						this.cases = this.cases.filter((c) => c.CaseNumber !== 'All');
					} else {
						this.selectedCase = this.cases[0];
					}

					var caseIdList = [];
					var caseTopics = "";
					for (c = 0; c < this.cases.length; c++) {
						var usercase = this.cases[c];
						caseIdList.push(usercase.Id);
						this.$root.viewRoot.model.userCases[usercase.Id] = usercase;
						this.chatRooms.push({ name: usercase.CaseNumber, id: usercase.Id });
						caseTopics = caseTopics + user.tenantId + "/" + usercase.Id + ",";
					}
					this.onCaseChange();
				}
				
				this.$root.emitEvent("chatRoomsLoaded", this.chatRooms);
				
				this.uistate.casesLoaded = true;
				this.uistate.caseIdList = caseIdList;
				this.uistate.caseTopics = caseTopics;
				this.loadNotifications();
				this.loadCasePermissions();
			},
			updateUserCaseOptions(response) {
				if(response.result){
					for(var i = 0; i < response.result.data.length; i++){
						this.CaseUsersList.push({caseId: response.actionId, Name: response.result.data[i].Username, Role: response.result.data[i].Role});
					}
				}
			},
			CaseOptionChange(child){
				console.log('case', child);
				this.selectedCase = child;
				this.onCaseChange();
			}, 
			loadNotifications(caseIdList) {
				if (!this.uistate.notificationsLoaded && this.uistate.casesLoaded && this.uistate.settingsLoaded) {
					this.uistate.notificationsLoaded = true;
					var sendNotifications = customizationFunctions.getUserSetting("Live Notifications");
					if (sendNotifications) {
						subscribeToTopics(this.uistate.caseTopics);
						executeAppAPI("GetUserNotifications", { parameters: { CaseIdList: this.uistate.caseIdList } }, null, this.updateNotifications);
					}
				}
			}, 
			updateNotifications(response) {
				if(response.result){
					var notifications = response.result.data;
					notifications.sort((d1, d2) => new Date(d2.lastUpdated.$date) - new Date(d1.lastUpdated.$date));
					this.notifications = notifications;
					for (n = 0; n < this.notifications.length; n++) {
						var notification = this.notifications[n];
						notification.data = [];
						var entityInfo = notificationEntities[notification.EntityId];
						if (entityInfo) {
							notification.Label = entityInfo.label;
							notification.icon = entityInfo.icon;
						}
						var userCase = this.$root.viewRoot.model.userCases[notification.CaseId];
						if (userCase) {
							notification.Label = userCase.CaseNumber + ": " + notification.Label;
						}
					}
					this.notificationUpdateToggle = !this.notificationUpdateToggle; 
				}
			},
			closeNotification(notification) {
				var unStatus = {
						UserId: user.id,
						NotificationEntityId: notification.EntityId, 
						SubGroupId: notification.CaseId,
						Id: notification.notificationId, 
						rowState: notification.notificationId ? 3 : 1
					};
					  
					executeDataAPI("UserEntityNotificationStatus/" + (unStatus.Id ? "update" : "insert"), unStatus, 
						null, this.updateNotificationStatusUpdate);
			},
			closeTaskNotification(task_id){
				for (var i = this.tasks.length - 1; i >= 0; --i) {
					if (this.tasks[i].Id == task_id) {
						this.tasks.splice(i,1);
					}
				}
			},				
			handleNotificationNav(notification) {
				
				this.uistate.expandedNotification = notification;
				notification.expanded = !notification.expanded;
				if (notification.expanded) {
					notification.loading = true;
					var entityInfo = notificationEntities[notification.EntityId];
					executeAppAPI("GetCaseNotifications", {
						input: {
							entityId: notification.EntityId,
							entity: entityInfo.resourceId,
							caseId: notification.CaseId
						}
					}, null, this.updateNotificationsData);
				}
				else {
					notification.data.length = 0;
					this.notificationKey = this.notificationKey + 1;
					//this.notificationUpdateToggle = !this.notificationUpdateToggle; 
				}
			},
			updateNotificationsData(response) {
				this.uistate.expandedNotification.loading = false;
				//this.notificationUpdateToggle = !this.notificationUpdateToggle; 
				this.uistate.expandedNotification.data = response.result.data;
				this.notificationKey = this.notificationKey + 1;
				//this.notificationUpdateToggle = !this.notificationUpdateToggle; 
			},
			updateNotificationStatusUpdate(response) {
				if (response.status == "OK") {
					var unStatus = response.result;
					for (n = 0; n < this.notifications.length; n++) {
						var notification = this.notifications[n];
						if (notification.CaseId == unStatus.SubGroupId 
								&& notification.EntityId == unStatus.NotificationEntityId) {
							this.notifications.splice(n, 1);
							break;
						}
					}
				}
				this.notificationKey = this.notificationKey + 1;
				//this.notificationUpdateToggle = !this.notificationUpdateToggle; 
			},
			onCaseChange() { 
				//alert(JSON.stringify(this.selectedCase));
				if (this.lastCase == this.selectedCase) {
					return;
				}
				
				this.$root.viewRoot.model.selectedCase = this.selectedCase;
				
				if (!this.selectedCase || !this.selectedCase.Id || this.selectedCase.Id == "ALL") {
					var casIdCSV = "";
					var caseIdList = [ "NA" ];
					for (c = 0; c < this.cases.length; c++) { 
						var usercase = this.cases[c];
						if (usercase.Id != "ALL") {
							casIdCSV = casIdCSV + (casIdCSV ? ",'" : "'") + usercase.Id + "'"; 
						}
						caseIdList.push(usercase.Id);
					}
					if (window.location.hash == "#cXaVdobPMPCppTBE3GYQgWcp") {
						delete this.$root.viewRoot.model.globalTags.CaseIdCSV;
						this.$root.viewRoot.model.globalTags.CaseId = caseIdList;
					}
					else {
						this.$root.viewRoot.model.globalTags.CaseIdCSV = casIdCSV;
					}
					delete this.$root.viewRoot.model.globalTags.CaseId;
				}
				else {
					this.$root.viewRoot.model.globalTags.CaseId = this.selectedCase.Id;
					delete this.$root.viewRoot.model.globalTags.CaseIdCSV;
				} 
				this.$root.emitEvent("caseChanged", this.selectedCase);
				this.CheckClockInOut();
				//this.$root.emitEvent("caseSelectionChanged", this.selectedCase);
				this.loadCasePermissions();
				this.reloadCurrentView();
				//this.$root.getGlobalComponent("pageWidget").beforeDataLoad();
				//this.$root.getGlobalComponent("pageWidget").onDataLoad();
				localStorage.setItem("caseDropdown", this.selectedCase.CaseNumber);
				localStorage.setItem("caseDropdownID", this.selectedCase.Id);
				this.lastCase = this.selectedCase;
			},
			reloadCurrentView() {
				if (window.location.hash) {
					var currentView = window.location.hash.replace("#", "");
					if (currentView != WIDGETS.FORMS_SEARCH) {
						switchPageView(currentView);
					}
				}
				else {
					switchPageView(WIDGETS.DASHBOARD);
				}
			},
			onLayoutChange() { 
				this.$root.emitEvent("searchLayoutChanged", this.selectedView);
			},
			loadCasePermissions() {
				var objectId = this.$root.viewRoot.model.globalTags.CaseId;
				if (objectId && !objectPermissions[objectId]) {
					executeAppAPI("GetCasePermissions", { parameters: { CaseId: objectId } }, null, this.updateCasePermissions);
				}
				else {
					this.completeCaseSelection();
				}
			},
			updateCasePermissions(response) {
				try {
				var objectId = this.$root.viewRoot.model.globalTags.CaseId;
				objectPermissions[objectId] = response.result.data;
				console.log('updateCasePermissions', objectPermissions[objectId]);
				} catch (e) {}
				this.reloadCurrentView();
				this.completeCaseSelection();
				this.updateToggle = !this.updateToggle;
			},
			completeCaseSelection() {
				try {
				 var objectId = this.$root.viewRoot.model.globalTags.CaseId;
				 setObjectPermissions(objectId);
				} catch (e) { }
				this.$root.emitEvent("caseSelectionChanged", this.selectedCase);
				this.$root.emitEvent("permissionsChanged", this.selectedCase);
				this.updateToggle = !this.updateToggle;
			},
			outside: function(e) {
				this.clickOutside += 1;
				this.closecalendar = false;
				this.$root.emitEvent("calenderpopupTriggered", 'closed');
			},
		},
		directives: {
			'click-outside': {
			  bind: function(el, binding, vNode) {
				// Provided expression must evaluate to a function.
				if (typeof binding.value !== 'function') {
					const compName = vNode.context.name
				  let warn = `[Vue-click-outside:] provided expression '${binding.expression}' is not a function, but has to be`
				  if (compName) { warn += `Found in component '${compName}'` }
				  
				  console.warn(warn)
				}
				// Define Handler and cache it on the element
				const bubble = binding.modifiers.bubble
				const handler = (e) => {
				  if (bubble || (!el.contains(e.target) && el !== e.target)) {
					binding.value(e)
				  }
				}
				el.__vueClickOutside__ = handler

				// add Event Listeners
				document.addEventListener('click', handler)
					},
			  
			  unbind: function(el, binding) {
				// Remove Event Listeners
				document.removeEventListener('click', el.__vueClickOutside__)
				el.__vueClickOutside__ = null

			  }
			}
		}
	});


	function getAuditLogChildModText(mod, recId) {
			var textProp = mod.LinkSourceId == recId ? 'LinkTarget' : 'LinkSource';
			var modText = mod[textProp + 'Name'];
			if (!modText) { 
				modText = mod['relations.' + textProp + '.displayValue'];
			}
			if (modText) {
				modText = modText.length > 100 ? modText.substr(0, 100)+'...' : modText;
			}
			if (mod.LinkName) {
				modText = modText + ", REASON: " +  mod.LinkName;
			}
			modText = modText + ", rID: " +  mod[textProp + 'Id'];
			return modText;
   		}
	