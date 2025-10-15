Vue.component('cnx-chat-ai', {
	template: `
	<div id="cnx-chat-ai">    
		<template v-if="user.tenantId === 'chatai'">
		<div v-if="isMinimized">
            <q-dialog @click.stop v-model="isMinimized" position="bottom-right" transition-hide="slide-up" persistent no-focus
                seamless transition-show="slide-down" transition-duration="200"
                style="z-index:20;position: fixed !important; bottom: 10px !important; right: 10px !important; top: auto !important; left: auto !important; margin: 0 !important; align-items: flex-end !important; justify-content: flex-end !important;">
                <q-card
                  style="position: fixed; bottom:50px; right:10px; width: 72px; height: 70px; display: flex; align-items: center; justify-content: space-between !important; padding: 0 8px; border-radius: 50% 50% 6% 50%; background: linear-gradient(135deg, #e8f2ff 0%, #fff2f8 78%, #f5f2ff 100%);"> 
                     <q-btn round @click="toggleMinimize" style=" width: 60px; height: 60px;">
					 	<img src="https://iili.io/KaciQjf.png" alt="Chatbot"
							style="width: 60px; height: 60px;" />
					</q-btn>
                </q-card>
            </q-dialog>
        </div>
		</template>
		<template v-if="user.tenantId == 'chatai' && showChat">
		<div :style="{
				height: isFullScreen ? '80vh' : '50vh',
				display: 'flex',
				flexDirection: 'column',
				background: 'linear-gradient(135deg, #e8f2ff 0%, #fff2f8 78%, #f5f2ff 100%)',
				alignItems: 'center',
                boxShadow: '0 -2px 6px rgba(0, 0, 0, 0.1)'
			}">
                <!-- Header with close button -->
                <!-- Sticky Header with Title, Menu, and Close -->
                <div style="
                    position: sticky;
                    top: 0;
                    width: 100%;
                    z-index: 10;
                    ">
                    <div style="
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 8px 14px;
                        ">
                        <!-- Title on the left -->
                        <div style="display:flex; align-items:center; gap:5px;">
                            <q-btn dense flat style="border-radius: 10px; padding-left: 15px; padding-right: 10px;"
                                :label="currentMode" icon-right="expand_more" color="black" size="md">
                                <q-menu auto-close transition-show="jump-down" transition-hide="jump-up">
                                    <q-list style="min-width:160px">
                                        <q-item clickable v-ripple @click="setMode('assistant')">
                                            <q-item-section>QTIS AI Assistant</q-item-section>
                                        </q-item>
                                        <q-item clickable v-ripple @click="setMode('training')">
                                            <q-item-section>QTIS AI Training Mode</q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>
                        </div>
                        <!-- Actions on the right -->
                        <div style="display:flex; align-items:center; gap:8px;">
                            <!-- Three-Dot Menu -->
                            <q-btn dense flat round icon="more_vert" color="grey-7">
                                <q-menu auto-close>
                                    <q-list style="min-width: 120px">
                                        <q-item clickable v-ripple @click="toggleFullScreen">
                                            <q-item-section avatar>
                                                <q-icon :name="isFullScreen ? 'fullscreen_exit' : 'fullscreen'" />
                                            </q-item-section>
                                            <q-item-section>{{ isFullScreen ? 'Exit Fullscreen' : 'Fullscreen'
                                                }}</q-item-section>
                                        </q-item>
                                        <q-item clickable v-ripple @click="toggleMinimize">
                                            <q-item-section avatar>
                                                <q-icon :name="isMinimized ? 'expand_less' : 'expand_more'" />
                                            </q-item-section>
                                            <q-item-section>{{ isMinimized ? 'Expand' : 'Minimize' }}</q-item-section>
                                        </q-item>
                                        <q-item clickable v-ripple @click="clearChat">
                                            <q-item-section avatar>
                                                <q-icon name="delete" />
                                            </q-item-section>
                                            <q-item-section>Clear Chat</q-item-section>
                                        </q-item>
                                    </q-list>
                                </q-menu>
                            </q-btn>

                            <!-- Close Button -->
                            <q-btn dense flat round icon="close" color="grey-7" @click="toggleChat" />
                        </div>
                    </div>

                    <!-- Separator -->
                    <q-separator />
                </div>


                <div :class="messages.length === 0 ? 'justify-center chat-container' : 'chat-container'">
					<!-- History -->
					<div class="chat-history">
						<cnx-chat-ai-history/>
					</div>
					<div class="chatbox" :style="{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        height: isFullScreen ? '73vh' : '43vh' // match parent height
                    }">
						<!-- Messages -->
						<q-card-section class="messages" :style="{ height: messages.length ? '100%' : 'unset' }">
							<template v-for="(msg, index) in messages" :key="index">
								<!-- User message -->
								<div v-if="msg.from === 'user'" class="msg-row user-row">
									<div class="bubble user-bubble" v-html="msg.text"></div>
								</div>

								<!-- Bot message -->
								<div v-if="msg.from === 'bot'" class="msg-row bot-row">
									<template v-if="msg.isLoading">
										<q-spinner-dots size="20em" :thickness="1" color="black" size="1rem" />
									</template>
									<template v-else>
										<div class="bubble bot-bubble" v-html="msg.text"></div>
									</template>
								</div>
							</template>
						</q-card-section>

						<!-- Quick Access -->
						<div v-if="messages.length === 0" style="width:70%; text-align:center; margin-bottom:8px;">
						
							<img src="https://iili.io/KaciQjf.png" alt="Chatbot"
								style="width: 75px; height: 75px;" />
							<br />
							<p v-if="trainingMode"
								style="font-size: large; margin: 10px; color:#212121; font-weight:bold; display:inline-block;">
								Start updating FAQ database</p>
							<p v-if="!trainingMode"
								style="font-size: large; margin: 10px; color:#212121; font-weight:bold; display:inline-block;">
								Hello! How can I assist you?</p>
							<!-- FAQ Chips -->
							<div v-if="trainingMode && !faqFlowStarted">
								<q-chip clickable color="white" text-color="primary" @click="startFaqFlow('ADD')">
									Add FAQ
								</q-chip>
								<q-chip clickable color="white" text-color="orange" @click="startFaqFlow('EDIT')">
									Edit FAQ
								</q-chip>
								<q-chip clickable color="white" text-color="red" @click="startFaqFlow('DELETE')">
									Delete FAQ
								</q-chip>
							</div>
						</div>

						<q-card-section v-if="attachedFiles.length" class="q-pt-none"
							style="padding-bottom: 0px !important;">
							<div class="row" style="gap:6px; flex-wrap:wrap;">
								<q-chip v-for="(f, idx) in attachedFiles" :key="idx" outline removable
									@remove="removeFile(idx)" text-color="grey-8" size="sm" :label="f.filename">
								</q-chip>
							</div>
						</q-card-section>

						<!-- Chat input (composer) -->
						<q-card-actions align="center" class="q-pa-sm bg-grey-2 custom-field"
							style="gap:6px; width:70%; background: transparent !important; display: block;">
							<q-input outlined dense autogrow rounded class="col" v-model="newMessage"
								placeholder="What would you like Qtis assist to help with…"
								@keyup.enter="sendMessage(newMessage)"
								:input-style="{ maxHeight: '120px', overflowY: 'auto' }">
								<!-- Left slot: Dropdown menu -->
								<template v-slot:prepend>
									<q-btn dense flat round icon="add" color="grey-7">
										<q-menu auto-close>
											<q-list style="min-width:150px">
												<!-- new Chat -->
												<q-item clickable v-ripple @click="newChat()">
													<q-item-section avatar><q-icon name="add" /></q-item-section>
													<q-item-section>New Chat</q-item-section>
												</q-item>
												<hr style="width:85%; background-color: #9ea2a5;" />
												<!-- Upload File -->
												<q-item clickable v-ripple @click="$refs.fileInput.click()">
													<q-item-section avatar><q-icon name="upload" /></q-item-section>
													<q-item-section>Upload File</q-item-section>
												</q-item>
												<hr style="width:85%; background-color: #9ea2a5;" />
												<!-- User -->
												<q-item clickable v-ripple v-if="!trainingMode"
													:disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading"
													@click="getAiAssist('users')">
													<q-item-section avatar><q-icon name="person_add" /></q-item-section>
													<q-item-section>User</q-item-section>
													<q-item-section side v-if="aiAssistUserLoading">
														<q-spinner-gears size="25px" color="primary" />
													</q-item-section>
												</q-item>
												<!-- Client -->
												<q-item clickable v-ripple v-if="!trainingMode"
													:disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading"
													@click="getAiAssist('clients')">
													<q-item-section avatar><q-icon name="groups" /></q-item-section>
													<q-item-section>Client</q-item-section>
													<q-item-section side v-if="aiAssistClientLoading">
														<q-spinner-gears size="25px" color="primary" />
													</q-item-section>
												</q-item>
												<!-- Notes -->
												<q-item clickable v-ripple v-if="!trainingMode"
													:disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading"
													@click="getAiAssist('notepad')">
													<q-item-section avatar><q-icon name="note_add" /></q-item-section>
													<q-item-section>Notes</q-item-section>
													<q-item-section side v-if="aiAssistNoteLoading">
														<q-spinner-gears size="25px" color="primary" />
													</q-item-section>
												</q-item>
												<!-- Case -->
												<q-item clickable v-ripple v-if="!trainingMode"
													:disable="aiAssistUserLoading || aiAssistClientLoading || aiAssistNoteLoading || aiAssistCaseLoading"
													@click="getAiAssist('cases')">
													<q-item-section avatar><q-icon name="folder_open" /></q-item-section>
													<q-item-section>Case</q-item-section>
													<q-item-section side v-if="aiAssistCaseLoading">
														<q-spinner-gears size="25px" color="primary" />
													</q-item-section>
												</q-item>
												<q-item clickable v-ripple v-if="trainingMode"
													@click="startFaqFlow('ADD')">
													<q-item-section avatar><q-icon name="add" /></q-item-section>
													<q-item-section>Add FAQ</q-item-section>
												</q-item>
												<q-item clickable v-ripple v-if="trainingMode"
													@click="startFaqFlow('EDIT')">
													<q-item-section avatar><q-icon name="edit" /></q-item-section>
													<q-item-section>Edit FAQ</q-item-section>
												</q-item>
												<q-item clickable v-ripple v-if="trainingMode"
													@click="startFaqFlow('DELETE')">
													<q-item-section avatar><q-icon name="delete" /></q-item-section>
													<q-item-section>Delete FAQ</q-item-section>
												</q-item>
											</q-list>
										</q-menu>
									</q-btn>
									<!-- Hidden File Input -->
									<input type="file" ref="fileInput" style="display:none"
										accept=".xls,.xlsx,.pdf,.doc,.docx,.txt,.csv" multiple @change="handleFileUpload" />
								</template>

								<!-- Hidden File Input -->
								<input type="file" ref="fileInput" style="display:none"
									accept=".xls,.xlsx,.pdf,.doc,.docx,.txt,.csv" multiple @change="handleFileUpload" />

								<template v-slot:append>
									<q-chip v-if="faqMode === 'ADD'" clickable outline color="primary" text-color="primary" size="xs"
										style="margin-top:6px; max-width: fit-content;">
										Add FAQ
									</q-chip>
									<q-chip v-if="faqMode === 'EDIT'" clickable outline color="orange" text-color="orange" size="xs"
										style="margin-top:6px; max-width: fit-content;">
										Edit FAQ
									</q-chip>
									<q-chip v-if="faqMode === 'DELETE'" clickable outline color="red" text-color="red" size="xs"
										style="margin-top:6px; max-width: fit-content;">
										Delete FAQ
									</q-chip>
								</template>
								<!-- Right slot (send icon inside input) -->
								<template v-slot:after>
									<q-icon name="send" :class="[newMessage.trim() ? 'text-blue-9' : 'text-grey-5']"
										:disabled="!newMessage.trim()" :loading="false"
										@click="newMessage.trim() && sendMessage(newMessage)" />
								</template>
							</q-input>
						</q-card-actions>
					</div>
                </div>
            </div>
		</template>
	</div>`,
	data() {
		return {
			trainingMode: false,
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
			currentMode: 'QTIS AI Assistant', // 'assistant' or 'training'
			displayConfirmTrainingBtn: false,
			lastBotMessage: '',
			faqFlowStarted: false,
			faqMode: '',
			currentEditFaqId: '',
		}
	},
	created() {
		this.$root.registerEventListener("chat-opened", this); // 👈 register listener
	},
	methods: {
		setTrainingMode(value) {
			this.trainingMode = value;
		},
		setMode(mode) {
			this.clearChat();
			if (mode === 'assistant') {
				this.trainingMode = false;
				this.currentMode = 'QTIS AI Assistant';
				this.faqFlowStarted = false;
			} else if (mode === 'training') {
				this.trainingMode = true;
				this.currentMode = 'QTIS AI Training Mode';
			}
		},
		startFaqFlow(value) {
			this.faqFlowStarted = true;
			this.faqMode = value;
			if (this.faqMode === "EDIT" || this.faqMode === "DELETE") {
				this.fetchFAQList();
			}
		},
		fetchFAQList() {
			// Add bot "typing" spinner message
			this.botIndex = this.messages.push({
				from: 'bot',
				text: '',
				isLoading: true
			}) - 1;
			this.$nextTick(() => this.scrollToBottom());
			var parameters = {
				messages: [{
					"role": "system",
					"content": `listIdsWithquestion`
				}],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.hanndleFAQListResult);
		},
		generateFAQListHTML(faqs) {
			// Build a global map for quick lookup
			window._faqMap = new Map(faqs.map(f => [f.id, f]));

			// Build the list safely
			const listItems = faqs.map((faq, index) => {
				return `
					<li style="display: flex; align-items: center; margin-bottom: 8px;">
						<span style="margin-right: 8px; font-weight: bold;">${index + 1}.</span>
						<span style="flex: 1;">${faq.question}</span>
						<span 
						class="edit-icon" 
						style="cursor: pointer; color: #007bff;" 
						onclick="window.__vueHandle('${faq.id}', 'EDIT_FAQ')">
						${this.faqMode === "EDIT" ? '✎' : '🗑'}
						</span>
					</li>
					`;
			}).join("");

			// Wrap in UL
			return `
				<ul style="list-style: none; padding-left: 0;">
				${listItems}
				</ul>
			`;
		},
		editFaq(faq) {
			console.log("edit faq called------------", faq)
			this.currentEditFaqId = faq.id;
			if (this.faqMode === "EDIT") {
				this.newMessage = faq.question + " " + faq.answer;
			} else if (this.faqMode === "DELETE") {
				this.messages.push({
					from: 'bot',
					text: `<b>Are you sure to delete the below FAQ?</b><br>
							${faq.question}<br/>${faq.answer}<br />
							<button 
                                    class="faq-btn again-btn" 
                                    onclick="window.__vueHandle('${faq.id}', 'DELETE_FAQ')">
                                        <span class="material-icons" style="vertical-align:middle;">delete</span>
                                    </button>`
				})
			}
		},
		hanndleFAQListResult(response) {
			if (response.status == 'OK') {
				console.log("response", JSON.parse(response.result));
				const data = JSON.parse(response.result);
				const formattedData = this.generateFAQListHTML(data);
				this.messages[this.botIndex].text = formattedData;
				this.messages[this.botIndex].isLoading = false;
				console.log("message array", this.messages)
			} else {
				console.error('Error calling API:', err);
				this.messages[botIndex] = { from: 'bot', text: 'Sorry, there was an error processing your request.', isLoading: false };
			}
			this.$nextTick(() => this.scrollToBottom());
		},
		clearChat() {
			this.messages = [];
			this.newMessage = '';
			this.attachedFiles = [];
			this.lastBotMessage = '';
			this.faqFlowStarted = false;
			this.faqMode = '';
			this.displayConfirmTrainingBtn = false;
		},
		formattedMessages() {
			if (this.trainingMode) {
				return this.messages.map(m => {
					if (m.from === 'user') return { role: 'user', content: m.text };
					return null;
				}).filter(Boolean);
			}
			return this.messages.map(m => {
				if (m.from === 'user') return { role: 'user', content: m.text };
				if (m.from === 'bot' && !m.isLoading) return { role: 'assistant', content: m.text };
				return null; // skip loading placeholders
			}).filter(Boolean);
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
				"image/jpeg",
				"text/csv"
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
		async sendTrainingMessage(value) {
			this.messages[this.messages.length - 1].text = this.lastBotMessage;
			const currentMessage = this.lastBotMessage;
			this.lastBotMessage = '';
			// Add bot "typing" spinner message
			this.botIndex = this.messages.push({
				from: 'bot',
				text: '',
				isLoading: true
			}) - 1;
			this.$nextTick(() => this.scrollToBottom());
			var parameters = {
				messages: [{
					"role": "system",
					"content": value === "confirm" ?
						this.faqMode === "ADD" ?
							`You are on training mode. Analyse and add the provided FAQ in the system.`
							: this.faqMode === "EDIT" ?
								`You are on training mode. Update the provided FAQ question and answer in the system. Don't modify or reframe the content.`
								: `You are on training mode. Delete the provided FAQ in the system.`
						: "Reframe the given FAQ question and answer in question and answer pattern itself."
				},
				{
					role: "user",
					content: this.faqMode === "DELETE" ? `Delete the faq with Id ${this.currentEditFaqId}`
						: this.faqMode === "EDIT" ? `${currentMessage}. Id of the FAQ is ${this.currentEditFaqId}` : currentMessage
				}],
				files: [],
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			this.lastBotMessage = '';
			if (value === "reframe") {
				this.displayConfirmTrainingBtn = true;
			}
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleTrainingModeResult);
		},
		handleTrainingModeResult(response) {
			if (response.status == 'OK') {
				console.log("response", JSON.parse(response.result));
				const data = JSON.parse(response.result);
				let reply = data?.choices?.[0]?.message?.content || "No reply received.";
				if (this.displayConfirmTrainingBtn) {
					this.lastBotMessage = reply;
					reply += `<button 
                                    class="faq-btn confirm-btn" 
                                    onclick="window.__vueHandle('confirm', 'SEND_TRAINING_MESSAGE')">
                                        <span class="material-icons" style="vertical-align:middle;">check</span>
                                    </button>
                                    <button 
                                    class="faq-btn again-btn" 
                                    onclick="window.__vueHandle('reframe', 'SEND_TRAINING_MESSAGE')">
                                        <span class="material-icons" style="vertical-align:middle;">refresh</span>
                                    </button>`
					this.displayConfirmTrainingBtn = false;
				}
				this.messages[this.botIndex].text = reply;
				this.messages[this.botIndex].isLoading = false;
				console.log("message array", this.messages);
			} else {
				console.error('Error calling API:', err);
				this.messages[botIndex] = { from: 'bot', text: 'Sorry, there was an error processing your request.', isLoading: false };
			}
			this.$nextTick(() => this.scrollToBottom());
		},
		async sendMessage(quickQuestion = '') {
			if (this.lastBotMessage !== '') {
				this.messages[this.messages.length - 1].text = this.lastBotMessage;
				this.lastBotMessage = '';
			}
			console.log("LAST BOT MESSAGE REPLACED in message array", this.messages)
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
				console.log("NEW USER MSG ADDED in message array", this.messages)
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

				console.log("LOADING BOT MESSAGE ADDED in message array", this.messages)
				this.$nextTick(() => this.scrollToBottom());
				// Push bot loading message
				// store index of the bot message or API
				const formattedMessages = this.formattedMessages();
				console.log("formattedMessages", formattedMessages);
				let parameters = {};
				if (this.trainingMode) {
					parameters = {
						messages: [{
							"role": "system",
							"content": `You are an AI assistant that reformulates FAQ pairs. From the conversation history, 
							rewrite the user's input as a single FAQ **question** and **answer** pair only. 
							Do not add explanations, extra text, or metadata. 
							Return only the reframed question and answer.`
						},
						...formattedMessages],
						files: this.attachedFiles,
						summarizeFiles: false,
						temperature: 0,
						max_tokens: 0
					};
					this.displayConfirmTrainingBtn = true;
				} else {
					parameters = {
						messages: [
							{
								"role": "system",
								"content": this.attachedFiles.length == 0 ? `You are Iris, You are a friendly, 
						helpful assistant for QTIS application. You help users navigate the site, answer FAQs, 
						and guide them to relevant pages. If you don't know something, say you don't know instead of making things up. 
						say you are assistant to the users chatting with you, providing responses with proper alignment, 
						spaces in more readable format which can be interpretted in HTML. Don't use <b> tag. 
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
				}
				executeAppAPI("chataiapi", { input: parameters }, null, this.handleResult);
				this.attachedFiles = []; // Clear files after sending
			}
		},
		handleResult(response) {
			if (response.status == 'OK') {
				console.log("response", JSON.parse(response.result));
				const data = JSON.parse(response.result);
				let reply = data?.choices?.[0]?.message?.content || "No reply received.";
				// ✅ Update the same object so Vue detects changes
				if (this.fileSummary === "YES") {
					this.fileSummary = reply;
				}
				if (this.displayConfirmTrainingBtn) {
					this.lastBotMessage = reply;
					reply += `<button 
                                    class="faq-btn confirm-btn" 
                                    onclick="window.__vueHandle('confirm', 'SEND_TRAINING_MESSAGE')">
                                        <span class="material-icons" style="vertical-align:middle;">check</span>
                                    </button>
                                    <button 
                                    class="faq-btn again-btn" 
                                    onclick="window.__vueHandle('reframe', 'SEND_TRAINING_MESSAGE')">
                                        <span class="material-icons" style="vertical-align:middle;">refresh</span>
                                    </button>`
					this.displayConfirmTrainingBtn = false;
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
		},
		newChat(){
			this.$root.emitEvent('chatStatus', true);
		},
	}
});


Vue.component('cnx-chat-ai-history', {
	template: `
	<div id="cnx-chat-ai-history" style="border-right: 1px solid rgba(0, 0, 0, 0.12);height: 100%; overflow: hidden;">   
		<div class="title" style="color: #091c2d;padding: 6px 0px 6px 16px;font-size: 16px;font-weight: 800;">Chats</div>
		<q-scroll-area class="fit">
		<q-list style="color: #2d2d2d;">
			<q-item clickable v-ripple  v-for="item in historyList" :key="item.Id" :class="getActiveChat(item.Id)">
				<q-item-section class="ellipsis" @click="loadHistory(item)" style="font-size: 15px; font-weight: 500; color: #091c2d; display: -webkit-box;-webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden;text-overflow: ellipsis;">
					{{ capitalizeSentence(item.chattitle) }}
					<q-tooltip content-class="grid-tooltip">{{ capitalizeSentence( item.chattitle.length > 30 ? item.chattitle.slice(0, 30) + "..." : item.chattitle) }}</q-tooltip>
				</q-item-section>
				<q-item-section avatar @click="deleteHistory(item)">
					<span style="cursor: pointer;color: #007bff;">🗑</span>
				</q-item-section>
			</q-item>
		</q-list>
		</q-scroll-area>
	</div>`,
	data() {
		return {
			historyList: [],
			activeChat: [],
			chatStatus: null,
		}
	},
	created() {
		this.getHistory();
		this.$root.registerEventListener("chatStatus", this);
		this.$root.registerEventListener("chatMessages", this);
	},
	destroyed(){
		this.$root.removeEventListener("chatStatus", this);
		this.$root.removeEventListener("chatMessages", this);
	},
	methods: {
		notifyEvent(event, eventData) {
			if(event == "chatStatus"){
				if(this.activeChat && this.activeChat.length > 0){
					this.activeChat[0].chatstatus = 'closed';
					this.activeChat[0].messages = JSON.stringify(eventData);
					executeDataAPI("chataihistory/update", this.activeChat[0], null, this.loadResult);
				}
			}
			if(event == "chatMessages"){
				if(this.activeChat && this.activeChat.length > 0){
					this.activeChat[0].chattitle = eventData[0].text.replace(/<[^>]*>/g, '');
					this.activeChat[0].chatstatus = 'opened';
					this.activeChat[0].messages = JSON.stringify(eventData);
					this.activeChat[0].messagecount = Number(this.activeChat[0].messagecount) + 1;
					executeDataAPI("chataihistory/update", this.activeChat[0], null, this.loadResult);
				} else {
					var row = {
						chattitle: eventData[0].text.replace(/<[^>]*>/g, ''),
						chatstatus: 'opened',
						messagecount: 1,
						messages: JSON.stringify(eventData),
					};
					executeDataAPI("chataihistory/insert", row, null, this.loadResult);
				}
			}
		},
		getHistory(){
			executeAPI("getchataihistorybyuser", {}, null, this.handleResult);
		},
		handleResult(response){
			this.activeChat = [];
			this.historyList = [];
			if (response.status == 'OK' && response.result?.data.length > 0) {
				var filtered = response.result.data.filter(item => item.chatstatus === "opened");
				if(filtered.length > 0){
					this.activeChat.push(filtered[0]);
				}
				this.historyList = response.result.data;
			}
		},
		loadResult(response){
			if (response.status == 'OK'|| response.status == 'ERROR') {
				this.getHistory();
			}
		},
		deleteHistory(item) {
			var evRef = this;
			this.$root.showDialog({
				show: true,
				title: 'Confirmation Required',
				message: 'Are you sure to delete?',
				icon: 'priority_high',
				showCancel: true,
				cancelButtonText: 'Cancel',
				okButtonText: 'OK',
				ev: evRef,
				onOk: function () {
				this.ev.handleDelete(item);
				},
			});
		},
    	handleDelete(item) {
			executeDataAPI("chataihistory/delete", item, null, this.loadResult);
		},
		loadHistory(row){
			if(this.activeChat && this.activeChat.length > 0 && row.Id != this.activeChat[0].Id){
				this.activeChat[0].chatstatus = 'closed';
				executeDataAPI("chataihistory/update", this.activeChat[0], null, {});
			}
			if(row){
				row.chatstatus = 'opened';
				executeDataAPI("chataihistory/update", row, null, this.loadResult);
				setTimeout(() => {
					this.$root.emitEvent('setChatHistory', JSON.parse(row.messages));
				}, 1200);
			}
			
		},
		getActiveChat(Id){
			return (this.activeChat.length > 0 && Id && this.activeChat[0].Id == Id) ? 'active' : '';
		},
		capitalizeSentence(text) {
			if (!text) return '';
			text = text.toLowerCase();
			return text.charAt(0).toUpperCase() + text.slice(1);
		},
	}
});