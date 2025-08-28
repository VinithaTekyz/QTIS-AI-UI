Vue.component('cnx-chat-ai', {
	template: `
	<div id="cnx-chat-ai">    
		<div class="chat-ai">
			<!-- Floating Chat Button -->
			<div v-show="showIcon"
				style="position: fixed; bottom: 20px; right: 20px; z-index: 9999; animation: fadeDark 2s infinite ease-in-out;">
				<img src="https://i.postimg.cc/g2HH8Fk2/chatbot-bubble.png" alt="Chatbot" @click="toggleChat"
				style="width: 200px; height: 100px; cursor: pointer;" />
				</q-btn>
			</div>

			<!-- Chat Panel -->
			<q-dialog v-model="showChat" position="bottom-right" backdrop-filter="blur(4px)" transition-hide="fade"
				transition-show="slide-up" transition-duration="200"
				style="position: fixed !important; bottom: 10px !important; right: 10px !important; top: auto !important; left: auto !important; margin: 0 !important; align-items: flex-end !important; justify-content: flex-end !important;">
				<q-card
				style="position: fixed; bottom:20px; right:20px; min-height: 90vh; width: 100%; max-width: 70vh; min-width: 70vh; border-radius: 20px; max-height: 90vh; display: flex; flex-direction: column;"
				class="q-pa-none">
				<div
					style="position: relative; background-image: linear-gradient(to right, #091c2d, #627ee7); color: white; padding: 10px 15px 30px;">
					<div style="display: flex; align-items: center; gap: 10px; padding-bottom: 1px;">
					<q-toolbar>
						<q-avatar
						style="left: -12px; flex: 0 0 auto !important; width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; align-self: flex-start !important;">
						<img
							src="https://cdn3.iconfinder.com/data/icons/customer-service-color/64/support_customer_service_technical_support_avatar_call_center_agent_customer_support_man_support_agent_call_center-512.png">
						</q-avatar>
						<q-avatar
						style="left: -24px; flex: 0 0 auto !important; width: 40px !important; height: 40px !important; min-width: 40px !important; min-height: 40px !important; align-self: flex-start !important;">
						<img
							src="https://www.kindpng.com/picc/m/630-6306130_avatar-avatar-male-user-icon-hd-png-download.png">
						</q-avatar>

						<q-toolbar-title><span style="font-size: 18px; font-weight: bold;">Qtis</span>
						Assistant</q-toolbar-title>

						<q-btn flat round dense icon="close" v-close-popup @click="toggleChat" />
					</q-toolbar>
					</div>
					<q-badge rounded color="green"></q-badge> Online
					<svg viewBox="0 0 500 100" preserveAspectRatio="none"
					style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40px;">
					<path d="M0,40 C120,100 360,0 720,34 C1080,68 1320,8 1440,48 L1440,120 L0,120 Z" fill="white" />
					</svg>
				</div>

				<!-- Messages -->
				<q-card-section style="flex: 1; overflow-y: auto;" ref="chatContainer">
					<template v-for="(msg, index) in messages" :key="index">

					<!-- User message -->
					<div v-if="msg.from === 'user'"
						style="display: flex; align-items: flex-end; justify-content: flex-end; margin-bottom: 8px; margin-left:40px">
						<q-chat-message text-color="white" sent bg-color="indigo-10" style="max-width: max-content;
								background: #1A237E;
								margin: 0;
								box-shadow: 0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19) !important;
								border-radius: 10px !important;
								min-width: 50px;
								line-height: 1.2 !important;
								padding-top: 0px !important;">
						<div v-html="msg.text"></div>
						</q-chat-message>

						<img src="https://www.kindpng.com/picc/m/630-6306130_avatar-avatar-male-user-icon-hd-png-download.png"
						style="width: 28px; height: 28px; border-radius: 50%; margin-left: 8px;" />
					</div>

					<!-- Bot message -->
					<div v-if="msg.from === 'bot'"
						style="display: flex; align-items: flex-end; justify-content: flex-start; margin-bottom: 8px; margin-right: 40px;">
						<img
						src="https://cdn3.iconfinder.com/data/icons/customer-service-color/64/support_customer_service_technical_support_avatar_call_center_agent_customer_support_man_support_agent_call_center-512.png"
						style="width: 28px; height: 28px; border-radius: 50%; margin-right: 8px;" />

						<q-chat-message bg-color="white" text-color="black" style="max-width: max-content;
								margin: 0;
								box-shadow: 0 4px 8px rgba(0,0,0,0.2), 0 6px 20px rgba(0,0,0,0.19) !important;
								border-radius: 10px !important;
								min-width: 50px;
								line-height: 1.2 !important;
								padding-top: 0px !important;">
						<template v-if="msg.isLoading">
							<q-spinner-dots size="2rem" />
						</template>
						<template v-else>
							<div v-html="msg.text"></div>
						</template>
						</q-chat-message>
					</div>

					</template>

				</q-card-section>

				<!-- Quick Questions -->
				<q-card style="padding-left: 20px; color:#0d4f8a">
					Quick questions:
					<q-card-actions align="center" style="flex-wrap: wrap;">
					<q-btn outline rounded color="primary" style="margin:2px" size="xs"
						@click="sendMessage('How can I access the portal?')">
						How can I access the portal?
					</q-btn>
					<q-btn outline rounded color="primary" style="margin:2px" size="xs"
						@click="sendMessage('Give me support email.')">
						Give me support email
					</q-btn>
					<q-btn outline rounded color="primary" style="margin:2px" size="xs" @click="sendMessage('Book a slot.')">
						Book a slot
					</q-btn>
					<q-btn outline rounded color="primary" style="margin:2px" size="xs"
						@click="sendMessage('I am facing issue with login.')">
						I am facing issue with login
					</q-btn>
					</q-card-actions>
				</q-card>

				<!-- File Preview -->
				<q-card-section v-if="attachedFiles.length" style="padding:10px; display:flex; flex-wrap:wrap; gap:8px;">
					<div v-for="(file, idx) in attachedFiles" :key="idx">
					<q-btn outline rounded push style="background-color:#0d4f8a!important;color:white" size="sm" :label="file.filename">
						<q-badge color="red" floating rounded style="cursor:pointer;" @click="removeFile(idx)">
						-
						</q-badge>
					</q-btn>
					</div>
				</q-card-section>

				<q-card-actions align="center" style="display:flex; gap:5px; padding:8px;">
					<!-- Attach File Button -->
					<div style="flex:0 0 auto;">
					<q-btn flat style="color:#0d4f8a!important;" icon="attach_file" @click="$refs.fileInput.click()" />
					</div>

					<!-- Hidden File Input -->
					<input type="file" ref="fileInput" style="display:none" accept=".xls,.xlsx,.pdf,.png,.jpg,.jpeg" multiple
					@change="handleFileUpload" />

					<!-- Message Input -->
					<div style="flex:1; min-width:0;">
					<q-input rounded v-model="newMessage" placeholder="Type your message..."
						@keyup.enter="sendMessage(newMessage)" style="width:100%;" />
					</div>

					<!-- Send Button -->
					<div style="flex:0 0 auto;">
					<q-btn flat style="color:#0d4f8a!important" icon="send" @click="sendMessage(newMessage)" />
					</div>
				</q-card-actions>

				</q-card>
			</q-dialog>
		</div>
	</div>`,
	data() {
		return {
			botIndex: -1,
			showChat: false,
			chatContainer: null,
			showIcon: true,
			unreadCount: 1,
			newMessage: '',
			attachedFiles: [], // store multiple uploaded files
			messages: [
				{ from: 'bot', text: 'Hello! How can I help you?', isLoading: false }
			]
		}
	},
	created() {

	},
	mounted() {
		document.addEventListener("click", this.handleOutsideClick);
	},
	beforeUnmount() {
		document.removeEventListener("click", this.handleOutsideClick);
	},
	methods: {
		handleOutsideClick(event) {
			const chat = this.$el.querySelector(".q-dialog");
			const chatBtn = this.$el.querySelector("img[alt='Chatbot']");

			if (
				this.showChat &&
				chat &&
				!chat.contains(event.target) &&
				!chatBtn.contains(event.target)
			) {
				this.showChat = false;
			}
		},
		toggleChat() {
			this.showChat = !this.showChat;
			if (this.showChat) this.unreadCount = 0;
		},
		handleFileUpload(event) {
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
			if (quickQuestion !== '') {
				this.newMessage = quickQuestion;
			}
			const msg = this.newMessage.trim();
			if (!msg && !this.attachedFiles.length) return;

			// Push user message
			if (msg) {
				this.messages.push({ from: 'user', text: msg, isLoading: false });
			}
			if (this.attachedFiles.length) {
				this.attachedFiles.forEach(file => {
					this.messages.push({ from: 'user', text: `[📎 ${file.filename}]`, isLoading: false });
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
			// store index of the bot message

			var parameters = {
				messages: [
					{
						"role": "system",
						"content": "You are Iris, You are a friendly, helpful assistant for QTIS application. You help users navigate the site, answer FAQs, and guide them to relevant pages. If you don't know something, say you don't know instead of making things up. say you are assistant to the users chatting with you, providing responses with proper alignment, spaces in more readable format which can be interpretted in HTML. You are not just a computer program. Always respond in pure HTML format using <b> for bold and <br> for line breaks. Never use Markdown. Give good detailed answer not just one line"
					},
					{ role: 'user', content: msg || '' }
				],
				files: this.attachedFiles,
				summarizeFiles: false,
				temperature: 0,
				max_tokens: 0
			};
			executeAppAPI("chataiapi", { input: parameters }, null, this.handleResult);
			this.attachedFiles = [];
			/*try {
				const res = await fetch('http://3.80.147.19/api/v1/chat/completions', {
					method: 'POST',
					headers: {
						'accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						messages: [
							{ role: 'system', content: msg }
						],
						files: [],
						summarizeFiles: false,
						temperature: 0,
						max_tokens: 0
					})
				});

				const data = await res.json();
				const reply = data?.choices?.[0]?.message?.content || "No reply received.";
				// ✅ Update the same object so Vue detects changes
				this.messages[botIndex] = {
					from: 'bot',
					text: reply,
					isLoading: false
				};;

				this.$nextTick(() => this.scrollToBottom());

			} catch (err) {
				console.error('Error calling API:', err);
				this.messages[botIndex] = { from: 'bot', text: 'Sorry, there was an error processing your request.', isLoading: false };
			}*/
		},
		handleResult(response) {
			if (response.status == 'OK') {
				console.log("response", JSON.parse(response.result));
				const data = JSON.parse(response.result);
				const reply = data?.choices?.[0]?.message?.content || "No reply received.";
				// ✅ Update the same object so Vue detects changes
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