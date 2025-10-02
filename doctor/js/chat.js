
// بيانات المحادثات الافتراضية
const chatsData = [
    {
        id: 1,
        patientId: 1,
        patientName: "محمد السيد",
        patientInitial: "م",
        lastMessage: "شكراً دكتور، التحسن ملحوظ جداً",
        lastMessageTime: "10:30",
        unreadCount: 0,
        isOnline: true,
        isActive: true,
        isImportant: true,
        isArchived: false,
        patientInfo: {
            age: 45,
            gender: "ذكر",
            bloodType: "A+",
            lastVisit: "2024-01-15",
            conditions: ["ارتفاع ضغط الدم", "سكري النوع الثاني"],
            medications: ["ميتفورمين 500mg", "لوزارتان 50mg"],
            allergies: ["بنسلين"]
        },
        messages: [
            { id: 1, sender: 'patient', text: 'السلام عليكم دكتور', time: '09:15', read: true },
            { id: 2, sender: 'doctor', text: 'وعليكم السلام، كيف يمكنني مساعدتك؟', time: '09:16', read: true },
            { id: 3, sender: 'patient', text: 'أشعر بتحسن كبير بعد تناول الدواء', time: '09:20', read: true },
            { id: 4, sender: 'doctor', text: 'هذا رائع، استمر على نفس الجرعة', time: '09:22', read: true },
            { id: 5, sender: 'patient', text: 'شكراً دكتور، التحسن ملحوظ جداً', time: '10:30', read: true }
        ]
    },
    {
        id: 2,
        patientId: 2,
        patientName: "فاطمة أحمد",
        patientInitial: "ف",
        lastMessage: "هل يمكنني تغيير موعدي؟",
        lastMessageTime: "أمس",
        unreadCount: 3,
        isOnline: false,
        isActive: true,
        isImportant: false,
        isArchived: false,
        patientInfo: {
            age: 32,
            gender: "أنثى",
            bloodType: "O+",
            lastVisit: "2024-01-10",
            conditions: ["ربو", "حساسية موسمية"],
            medications: ["فينتولين", "كلاريتين"],
            allergies: ["غبار الطلع"]
        },
        messages: [
            { id: 1, sender: 'patient', text: 'دكتور، أريد استشارة بخصوص التحاليل', time: '15:30', read: true },
            { id: 2, sender: 'doctor', text: 'تفضلي، التحاليل تبدو جيدة', time: '16:00', read: true },
            { id: 3, sender: 'patient', text: 'هل يمكنني تغيير موعدي؟', time: '10:00', read: false }
        ]
    }
];

// عناصر DOM
const elements = {
    activeChats: document.getElementById('activeChats'),
    chatsList: document.getElementById('chatsList'),
    searchInput: document.getElementById('searchInput'),
    refreshBtn: document.getElementById('refreshBtn'),
    newChatBtn: document.getElementById('newChatBtn'),
    chatFilters: document.getElementById('chatFilters'),
    chatWindow: document.getElementById('chatWindow'),
    backButton: document.getElementById('backButton'),
    chatWindowAvatar: document.getElementById('chatWindowAvatar'),
    chatWindowName: document.getElementById('chatWindowName'),
    chatWindowStatus: document.getElementById('chatWindowStatus'),
    chatMessages: document.getElementById('chatMessages'),
    chatInput: document.getElementById('chatInput'),
    sendButton: document.getElementById('sendButton'),
    attachButton: document.getElementById('attachButton'),
    voiceButton: document.getElementById('voiceButton'),
    typingIndicator: document.getElementById('typingIndicator'),
    voiceRecorder: document.getElementById('voiceRecorder'),
    voiceTimer: document.getElementById('voiceTimer'),
    deleteRecording: document.getElementById('deleteRecording'),
    sendRecording: document.getElementById('sendRecording'),
    chatActionsBtn: document.getElementById('chatActionsBtn'),
    quickActionsMenu: document.getElementById('quickActionsMenu'),
    profileModal: document.getElementById('profileModal'),
    closeProfileModal: document.getElementById('closeProfileModal'),
    profileModalBody: document.getElementById('profileModalBody'),
    callModal: document.getElementById('callModal'),
    callAvatar: document.getElementById('callAvatar'),
    callName: document.getElementById('callName'),
    callStatus: document.getElementById('callStatus'),
    callTimer: document.getElementById('callTimer'),
    micToggle: document.getElementById('micToggle'),
    videoToggle: document.getElementById('videoToggle'),
    endCall: document.getElementById('endCall'),
    speakerToggle: document.getElementById('speakerToggle'),
    flipCamera: document.getElementById('flipCamera'),
    attachModal: document.getElementById('attachModal'),
    closeAttachModal: document.getElementById('closeAttachModal'),
    mediaPreview: document.getElementById('mediaPreview'),
    backPreview: document.getElementById('backPreview'),
    sendPreview: document.getElementById('sendPreview'),
    previewContent: document.getElementById('previewContent'),
    currentTime: document.getElementById('currentTime')
};

// متغيرات الحالة
let currentChatId = null;
let currentFilter = 'all';
let isRecording = false;
let recordingTimer = null;
let recordingSeconds = 0;
let typingTimer = null;
let callTimer = null;
let callSeconds = 0;
let mediaRecorder = null;
let audioChunks = [];
let currentMediaFile = null;
let audioContext = null;
let analyser = null;
let isCallActive = false;

// فئات المساعدة
class ChatManager {
    static displayActiveChats() {
        elements.activeChats.innerHTML = '';
        
        const activeChatsData = chatsData
            .filter(chat => chat.isActive && !chat.isArchived)
            .slice(0, 6);
        
        activeChatsData.forEach(chat => {
            const activeChatItem = document.createElement('div');
            activeChatItem.className = 'active-chat-item fade-in';
            activeChatItem.setAttribute('data-chat-id', chat.id);
            activeChatItem.innerHTML = `
                <div class="active-chat-avatar ${chat.isOnline ? 'online' : ''}">
                    ${chat.patientInitial}
                </div>
                <div class="active-chat-name">${chat.patientName.split(' ')[0]}</div>
            `;
            
            activeChatItem.addEventListener('click', () => {
                ChatWindow.open(chat.id);
            });
            
            elements.activeChats.appendChild(activeChatItem);
        });
    }

    static displayChats(searchTerm = '') {
        elements.chatsList.innerHTML = '';
        
        let filteredChats = chatsData;
        
        // تطبيق الفلتر
        if (currentFilter === 'unread') {
            filteredChats = filteredChats.filter(chat => chat.unreadCount > 0);
        } else if (currentFilter === 'online') {
            filteredChats = filteredChats.filter(chat => chat.isOnline);
        } else if (currentFilter === 'archived') {
            filteredChats = filteredChats.filter(chat => chat.isArchived);
        } else if (currentFilter === 'important') {
            filteredChats = filteredChats.filter(chat => chat.isImportant);
        }
        
        // تطبيق البحث
        if (searchTerm) {
            filteredChats = filteredChats.filter(chat => 
                chat.patientName.includes(searchTerm)
            );
        }
        
        if (filteredChats.length === 0) {
            elements.chatsList.innerHTML = `
                <div class="no-chats fade-in">
                    <i class="fas fa-comment-slash"></i>
                    <h3>لا توجد محادثات</h3>
                    <p>${searchTerm ? 'لم يتم العثور على محادثات تطابق بحثك' : 'ابدأ محادثة جديدة مع مرضاك'}</p>
                </div>
            `;
            return;
        }
        
        filteredChats.forEach(chat => {
            const chatItem = document.createElement('div');
            chatItem.className = `chat-item fade-in ${chat.unreadCount > 0 ? 'active' : ''}`;
            chatItem.setAttribute('data-chat-id', chat.id);
            chatItem.innerHTML = `
                <div class="chat-avatar ${chat.isOnline ? 'online' : ''}">
                    ${chat.patientInitial}
                    ${chat.isImportant ? '<i class="fas fa-star" style="position: absolute; top: -5px; right: -5px; color: var(--warning); font-size: 12px; background: white; border-radius: 50%; padding: 2px;"></i>' : ''}
                </div>
                <div class="chat-info">
                    <div class="chat-header">
                        <div class="chat-name">
                            ${chat.patientName}
                            ${chat.unreadCount > 0 ? '<span class="new-badge">جديد</span>' : ''}
                        </div>
                        <div class="chat-time">${chat.lastMessageTime}</div>
                    </div>
                    <div class="chat-preview">
                        <div class="chat-message">${chat.lastMessage}</div>
                        ${chat.unreadCount > 0 ? 
                            `<div class="chat-badge">${chat.unreadCount}</div>` : 
                            `<div class="message-status ${chat.messages[chat.messages.length - 1].sender === 'doctor' ? 'status-read' : ''}">
                                <i class="fas fa-check${chat.messages[chat.messages.length - 1].sender === 'doctor' ? '-double' : ''}"></i>
                            </div>`
                        }
                    </div>
                </div>
            `;
            
            chatItem.addEventListener('click', () => {
                ChatWindow.open(chat.id);
            });
            
            // إضافة قائمة السياق للنقر الطويل
            chatItem.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                ContextMenu.show(e, chat);
            });
            
            elements.chatsList.appendChild(chatItem);
        });
        
        // تفعيل تأثيرات الظهور
        UIHelper.observeFadeElements();
    }
}

class ChatWindow {
    static open(chatId) {
        const chat = chatsData.find(c => c.id === chatId);
        if (chat) {
            currentChatId = chatId;
            
            // تحديث معلومات نافذة المحادثة
            elements.chatWindowAvatar.textContent = chat.patientInitial;
            elements.chatWindowName.textContent = chat.patientName;
            elements.chatWindowStatus.innerHTML = `
                <span>${chat.isOnline ? 'متصل الآن' : 'غير متصل'}</span>
                ${chat.isOnline ? '<div class="typing-dot" style="background: var(--success);"></div>' : ''}
            `;
            
            // عرض الرسائل
            this.displayMessages(chat.messages);
            
            // إظهار نافذة المحادثة
            elements.chatWindow.style.display = 'flex';
            
            // إزالة الإشعارات غير المقروءة
            chat.unreadCount = 0;
            ChatManager.displayChats(elements.searchInput.value);
            ChatManager.displayActiveChats();
            
            // تمرير إلى آخر رسالة
            setTimeout(() => {
                elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
            }, 100);
        }
    }

    static displayMessages(messages) {
        elements.chatMessages.innerHTML = '';
        
        // إضافة رسالة ترحيبية للنظام
        const systemMessage = document.createElement('div');
        systemMessage.className = 'system-message';
        systemMessage.textContent = 'بدأت هذه المحادثة في ' + new Date().toLocaleDateString('ar-EG');
        elements.chatMessages.appendChild(systemMessage);
        
        messages.forEach(message => {
            this.addMessageToChat(message);
        });
    }

    static addMessageToChat(message) {
        const messageElement = document.createElement('div');
        
        if (message.type === 'image') {
            messageElement.className = `message ${message.sender === 'patient' ? 'message-patient' : 'message-doctor'} message-media`;
            messageElement.innerHTML = `
                <img src="${message.content}" alt="صورة" onclick="MediaPreview.show('${message.content}', 'image')">
                ${message.caption ? `<div class="media-caption">${message.caption}</div>` : ''}
                <div class="message-time">${message.time}</div>
            `;
        } else if (message.type === 'audio') {
            messageElement.className = `message ${message.sender === 'patient' ? 'message-patient' : 'message-doctor'} message-audio`;
            messageElement.innerHTML = `
                <div class="audio-controls">
                    <button class="audio-play" onclick="AudioPlayer.toggle(this, ${message.duration})">
                        <i class="fas fa-play"></i>
                    </button>
                    <div class="audio-progress">
                        <div class="audio-progress-bar" style="width: 0%"></div>
                    </div>
                    <div class="audio-duration">${this.formatTime(message.duration)}</div>
                </div>
                <div class="message-time">${message.time}</div>
            `;
        } else {
            messageElement.className = `message ${message.sender === 'patient' ? 'message-patient' : 'message-doctor'}`;
            messageElement.innerHTML = `
                <div class="message-text">${message.text}</div>
                <div class="message-time">${message.time}</div>
                ${message.sender === 'doctor' ? 
                    `<div class="message-options">
                        <i class="fas fa-ellipsis-v"></i>
                    </div>` : ''
                }
            `;
        }
        
        elements.chatMessages.appendChild(messageElement);
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
    }

    static formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    static sendMessage() {
        const messageText = elements.chatInput.value.trim();
        if (!messageText || !currentChatId) return;
        
        const chat = chatsData.find(c => c.id === currentChatId);
        if (chat) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            
            // إضافة الرسالة الجديدة
            const newMessage = {
                id: chat.messages.length + 1,
                sender: 'doctor',
                text: messageText,
                time: timeString,
                read: false
            };
            
            chat.messages.push(newMessage);
            chat.lastMessage = messageText;
            chat.lastMessageTime = 'الآن';
            
            // عرض الرسالة
            this.addMessageToChat(newMessage);
            
            // مسح حقل الإدخال
            elements.chatInput.value = '';
            this.resetTextareaHeight();
            
            // محاكاة رد المريض بعد فترة
            this.simulatePatientReply(chat);
        }
    }

    static simulatePatientReply(chat) {
        // إظهار مؤشر الكتابة
        elements.typingIndicator.style.display = 'flex';
        elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
        
        // إخفاء مؤشر الكتابة بعد 2-4 ثوانٍ
        const typingTime = 2000 + Math.random() * 2000;
        
        setTimeout(() => {
            elements.typingIndicator.style.display = 'none';
            
            // إضافة رد المريض
            const replies = [
                "شكراً دكتور على النصيحة",
                "سأفعل ما نصحتموني به",
                "هل يمكنني أخذ موعد للمراجعة؟",
                "الألم تحسن كثيراً شكراً",
                "سأستمر على الدواء كما أوصيت"
            ];
            
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            const now = new Date();
            const timeString = now.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            
            const patientMessage = {
                id: chat.messages.length + 1,
                sender: 'patient',
                text: randomReply,
                time: timeString,
                read: true
            };
            
            chat.messages.push(patientMessage);
            chat.lastMessage = randomReply;
            chat.lastMessageTime = 'الآن';
            
            // عرض رسالة المريض
            this.addMessageToChat(patientMessage);
            
            // تحديث قائمة المحادثات
            ChatManager.displayChats(elements.searchInput.value);
            ChatManager.displayActiveChats();
            
        }, typingTime);
    }

    static resetTextareaHeight() {
        elements.chatInput.style.height = 'auto';
    }

    static handleTyping() {
        // إظهار زر الصوت إذا كان الحقل فارغاً، وإلا إظهار زر الإرسال
        if (elements.chatInput.value.trim() === '') {
            elements.voiceButton.style.display = 'block';
            elements.sendButton.style.display = 'none';
        } else {
            elements.voiceButton.style.display = 'none';
            elements.sendButton.style.display = 'flex';
        }
        
        // ضبط ارتفاع حقل النص تلقائياً
        elements.chatInput.style.height = 'auto';
        elements.chatInput.style.height = Math.min(elements.chatInput.scrollHeight, 120) + 'px';
    }
}

class VoiceRecorder {
    static async start() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                currentMediaFile = audioBlob;
            };
            
            mediaRecorder.start();
            isRecording = true;
            recordingSeconds = 0;
            elements.voiceButton.classList.add('recording');
            elements.voiceRecorder.style.display = 'flex';
            
            // بدء المؤقت
            recordingTimer = setInterval(() => {
                recordingSeconds++;
                const minutes = Math.floor(recordingSeconds / 60);
                const seconds = recordingSeconds % 60;
                elements.voiceTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                
                // محاكاة موجة صوتية
                this.simulateWaveform();
            }, 1000);
            
            // بدء تحليل الصوت
            this.startAudioAnalysis(stream);
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            Notification.show('تعذر الوصول إلى الميكروفون', 'error');
        }
    }

    static stop(send = false) {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            isRecording = false;
            clearInterval(recordingTimer);
            elements.voiceButton.classList.remove('recording');
            elements.voiceRecorder.style.display = 'none';
            
            if (audioContext) {
                audioContext.close();
                audioContext = null;
            }
            
            if (send && currentMediaFile) {
                this.sendVoiceMessage();
            }
        }
    }

    static sendVoiceMessage() {
        const chat = chatsData.find(c => c.id === currentChatId);
        if (chat) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            
            const audioMessage = {
                id: chat.messages.length + 1,
                sender: 'doctor',
                type: 'audio',
                duration: recordingSeconds,
                time: timeString,
                read: false
            };
            
            chat.messages.push(audioMessage);
            chat.lastMessage = '🎤 رسالة صوتية';
            chat.lastMessageTime = 'الآن';
            
            ChatWindow.addMessageToChat(audioMessage);
            Notification.show('تم إرسال الرسالة الصوتية', 'success');
            
            // محاكاة رد المريض
            setTimeout(() => ChatWindow.simulatePatientReply(chat), 3000);
        }
    }

    static simulateWaveform() {
        const waveform = elements.voiceWaveform;
        waveform.innerHTML = '';
        
        for (let i = 0; i < 20; i++) {
            const bar = document.createElement('div');
            const height = 10 + Math.random() * 30;
            bar.style.cssText = `
                width: 3px;
                height: ${height}px;
                background: var(--primary);
                border-radius: 2px;
                margin: 0 1px;
            `;
            waveform.appendChild(bar);
        }
    }

    static startAudioAnalysis(stream) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);
    }
}

class CallManager {
    static startCall(type, chatId) {
        const chat = chatsData.find(c => c.id === chatId);
        if (chat) {
            elements.callAvatar.textContent = chat.patientInitial;
            elements.callName.textContent = chat.patientName;
            elements.callStatus.textContent = type === 'video' ? 'مكالمة فيديو...' : 'مكالمة صوتية...';
            elements.callModal.style.display = 'flex';
            isCallActive = true;
            
            // محاكاة قبول المكالمة بعد 3 ثوان
            setTimeout(() => {
                if (isCallActive) {
                    elements.callStatus.textContent = 'متصل';
                    this.startCallTimer();
                    Notification.show('تم الاتصال بنجاح', 'success');
                }
            }, 3000);
        }
    }

    static startCallTimer() {
        callSeconds = 0;
        callTimer = setInterval(() => {
            callSeconds++;
            const minutes = Math.floor(callSeconds / 60);
            const seconds = callSeconds % 60;
            elements.callTimer.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    static endCall() {
        isCallActive = false;
        clearInterval(callTimer);
        elements.callModal.style.display = 'none';
        Notification.show('تم إنهاء المكالمة', 'info');
    }

    static toggleMic() {
        elements.micToggle.classList.toggle('active');
        Notification.show(elements.micToggle.classList.contains('active') ? 'تم تفعيل الميكروفون' : 'تم إيقاف الميكروفون', 'info');
    }

    static toggleVideo() {
        elements.videoToggle.classList.toggle('active');
        Notification.show(elements.videoToggle.classList.contains('active') ? 'تم تفعيل الكاميرا' : 'تم إيقاف الكاميرا', 'info');
    }

    static toggleSpeaker() {
        elements.speakerToggle.classList.toggle('active');
        Notification.show(elements.speakerToggle.classList.contains('active') ? 'تم تفعيل السماعة' : 'تم إيقاف السماعة', 'info');
    }

    static flipCamera() {
        Notification.show('تم تبديل الكاميرا', 'info');
    }
}

class ProfileManager {
    static show(chatId) {
        const chat = chatsData.find(c => c.id === chatId);
        if (chat) {
            elements.profileModalBody.innerHTML = this.createProfileHTML(chat);
            elements.profileModal.style.display = 'flex';
        }
    }

    static createProfileHTML(chat) {
        return `
            <div class="profile-info">
                <div class="profile-header">
                    <div class="profile-avatar">${chat.patientInitial}</div>
                    <div class="profile-details">
                        <h3>${chat.patientName}</h3>
                        <div class="profile-status">
                            <i class="fas fa-circle ${chat.isOnline ? 'online' : 'offline'}"></i>
                            <span>${chat.isOnline ? 'متصل الآن' : 'غير متصل'}</span>
                        </div>
                    </div>
                </div>
                
                <div class="profile-sections">
                    <div class="profile-section">
                        <div class="section-title">المعلومات الأساسية</div>
                        <div class="info-item">
                            <span class="info-label">العمر</span>
                            <span class="info-value">${chat.patientInfo.age} سنة</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">الجنس</span>
                            <span class="info-value">${chat.patientInfo.gender}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">فصيلة الدم</span>
                            <span class="info-value">${chat.patientInfo.bloodType}</span>
                        </div>
                    </div>
                    
                    <div class="profile-section">
                        <div class="section-title">الحالات الطبية</div>
                        ${chat.patientInfo.conditions.map(condition => `
                            <div class="info-item">
                                <span class="info-label">${condition}</span>
                                <span class="info-value"><i class="fas fa-heartbeat"></i></span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="profile-section">
                        <div class="section-title">الأدوية</div>
                        ${chat.patientInfo.medications.map(med => `
                            <div class="info-item">
                                <span class="info-label">${med}</span>
                                <span class="info-value"><i class="fas fa-pills"></i></span>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="profile-section">
                        <div class="section-title">الحساسيات</div>
                        ${chat.patientInfo.allergies.map(allergy => `
                            <div class="info-item">
                                <span class="info-label">${allergy}</span>
                                <span class="info-value"><i class="fas fa-allergies"></i></span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
}

class AttachmentManager {
    static showOptions() {
        elements.attachModal.style.display = 'flex';
    }

    static handleAttachment(type) {
        elements.attachModal.style.display = 'none';
        
        switch (type) {
            case 'camera':
                this.openCamera();
                break;
            case 'gallery':
                this.openGallery();
                break;
            case 'document':
                this.openDocumentPicker();
                break;
            case 'location':
                this.shareLocation();
                break;
            case 'contact':
                this.shareContact();
                break;
            case 'audio':
                VoiceRecorder.start();
                break;
        }
    }

    static openCamera() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.capture = 'environment';
        input.onchange = (e) => this.handleFileSelect(e);
        input.click();
    }

    static openGallery() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*,video/*';
        input.multiple = true;
        input.onchange = (e) => this.handleFileSelect(e);
        input.click();
    }

    static openDocumentPicker() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt';
        input.onchange = (e) => this.handleFileSelect(e);
        input.click();
    }

    static handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            currentMediaFile = file;
            this.previewMedia(file);
        }
    }

    static previewMedia(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            if (file.type.startsWith('image/')) {
                elements.previewContent.innerHTML = `<img src="${e.target.result}" alt="معاينة الصورة">`;
            } else if (file.type.startsWith('video/')) {
                elements.previewContent.innerHTML = `<video controls src="${e.target.result}"></video>`;
            } else {
                elements.previewContent.innerHTML = `
                    <div class="message-document">
                        <div class="document-icon">
                            <i class="fas fa-file"></i>
                        </div>
                        <div class="document-info">
                            <div class="document-name">${file.name}</div>
                            <div class="document-size">${this.formatFileSize(file.size)}</div>
                        </div>
                    </div>
                `;
            }
            
            elements.mediaPreview.style.display = 'flex';
        };
        
        reader.readAsDataURL(file);
    }

    static formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    static shareLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.sendLocation(latitude, longitude);
                },
                (error) => {
                    Notification.show('تعذر الحصول على الموقع', 'error');
                }
            );
        } else {
            Notification.show('المتصفح لا يدخدم خدمة الموقع', 'error');
        }
    }

    static sendLocation(lat, lng) {
        const chat = chatsData.find(c => c.id === currentChatId);
        if (chat) {
            const now = new Date();
            const timeString = now.toLocaleTimeString('ar-EG', { 
                hour: '2-digit', 
                minute: '2-digit'
            });
            
            const locationMessage = {
                id: chat.messages.length + 1,
                sender: 'doctor',
                type: 'location',
                latitude: lat,
                longitude: lng,
                time: timeString,
                read: false
            };
            
            chat.messages.push(locationMessage);
            chat.lastMessage = '📍 موقع';
            chat.lastMessageTime = 'الآن';
            
            ChatWindow.addMessageToChat(locationMessage);
            Notification.show('تم مشاركة الموقع', 'success');
        }
    }

    static shareContact() {
        // في التطبيق الحقيقي، سيتم فتح جهات الاتصال
        Notification.show('سيتم فتح قائمة جهات الاتصال', 'info');
    }

    static sendMedia() {
        if (currentMediaFile) {
            const chat = chatsData.find(c => c.id === currentChatId);
            if (chat) {
                const now = new Date();
                const timeString = now.toLocaleTimeString('ar-EG', { 
                    hour: '2-digit', 
                    minute: '2-digit'
                });
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    const mediaMessage = {
                        id: chat.messages.length + 1,
                        sender: 'doctor',
                        type: currentMediaFile.type.startsWith('image/') ? 'image' : 'file',
                        content: e.target.result,
                        time: timeString,
                        read: false
                    };
                    
                    chat.messages.push(mediaMessage);
                    chat.lastMessage = currentMediaFile.type.startsWith('image/') ? '🖼️ صورة' : '📎 ملف';
                    chat.lastMessageTime = 'الآن';
                    
                    ChatWindow.addMessageToChat(mediaMessage);
                    Notification.show('تم إرسال الملف', 'success');
                    
                    elements.mediaPreview.style.display = 'none';
                    currentMediaFile = null;
                };
                
                reader.readAsDataURL(currentMediaFile);
            }
        }
    }
}

class MediaPreview {
    static show(url, type) {
        if (type === 'image') {
            elements.previewContent.innerHTML = `<img src="${url}" alt="معاينة الصورة">`;
        } else if (type === 'video') {
            elements.previewContent.innerHTML = `<video controls src="${url}"></video>`;
        }
        elements.mediaPreview.style.display = 'flex';
    }
}

class AudioPlayer {
    static toggle(button, duration) {
        const icon = button.querySelector('i');
        const isPlaying = icon.classList.contains('fa-pause');
        
        if (isPlaying) {
            icon.classList.replace('fa-pause', 'fa-play');
            // إيقاف التشغيل
        } else {
            icon.classList.replace('fa-play', 'fa-pause');
            // بدء التشغيل
            this.simulatePlayback(button, duration);
        }
    }

    static simulatePlayback(button, duration) {
        const progressBar = button.closest('.audio-controls').querySelector('.audio-progress-bar');
        let currentTime = 0;
        
        const interval = setInterval(() => {
            currentTime++;
            const progress = (currentTime / duration) * 100;
            progressBar.style.width = `${progress}%`;
            
            if (currentTime >= duration) {
                clearInterval(interval);
                button.querySelector('i').classList.replace('fa-pause', 'fa-play');
                progressBar.style.width = '0%';
            }
        }, 1000);
    }
}

class ContextMenu {
    static show(event, chat) {
        // إزالة أي قائمة سياق موجودة مسبقاً
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) {
            existingMenu.remove();
        }
        
        // إنشاء قائمة السياق
        const contextMenu = document.createElement('div');
        contextMenu.className = 'context-menu';
        contextMenu.style.left = event.clientX + 'px';
        contextMenu.style.top = event.clientY + 'px';
        
        contextMenu.innerHTML = `
            <div class="context-item" data-action="mark-read">
                <i class="fas fa-check-double"></i>
                <span>تحديد كمقروء</span>
            </div>
            <div class="context-item" data-action="mark-unread">
                <i class="fas fa-envelope"></i>
                <span>تحديد كغير مقروء</span>
            </div>
            <div class="context-item" data-action="${chat.isImportant ? 'unmark-important' : 'mark-important'}">
                <i class="fas fa-star"></i>
                <span>${chat.isImportant ? 'إلغاء التمييز' : 'تمييز كمهم'}</span>
            </div>
            <div class="context-item" data-action="${chat.isArchived ? 'unarchive' : 'archive'}">
                <i class="fas fa-archive"></i>
                <span>${chat.isArchived ? 'إلغاء الأرشفة' : 'أرشفة'}</span>
            </div>
            <div class="context-item" data-action="delete">
                <i class="fas fa-trash"></i>
                <span>حذف المحادثة</span>
            </div>
        `;
        
        document.body.appendChild(contextMenu);
        
        // إضافة مستمعي الأحداث لعناصر القائمة
        contextMenu.querySelectorAll('.context-item').forEach(item => {
            item.addEventListener('click', () => {
                const action = item.getAttribute('data-action');
                this.handleAction(action, chat);
                contextMenu.remove();
            });
        });
        
        // إخفاء القائمة عند النقر في أي مكان آخر
        document.addEventListener('click', function hideContextMenu() {
            contextMenu.remove();
            document.removeEventListener('click', hideContextMenu);
        });
    }

    static handleAction(action, chat) {
        switch (action) {
            case 'mark-read':
                chat.unreadCount = 0;
                Notification.show('تم تحديد المحادثة كمقروءة', 'success');
                break;
            case 'mark-unread':
                chat.unreadCount = 1;
                Notification.show('تم تحديد المحادثة كغير مقروءة', 'info');
                break;
            case 'mark-important':
                chat.isImportant = true;
                Notification.show('تم تمييز المحادثة كمهمة', 'success');
                break;
            case 'unmark-important':
                chat.isImportant = false;
                Notification.show('تم إلغاء تمييز المحادثة', 'info');
                break;
            case 'archive':
                chat.isArchived = true;
                Notification.show('تم أرشفة المحادثة', 'success');
                break;
            case 'unarchive':
                chat.isArchived = false;
                Notification.show('تم إلغاء أرشفة المحادثة', 'info');
                break;
            case 'delete':
                if (confirm('هل أنت متأكد من حذف هذه المحادثة؟')) {
                    const index = chatsData.indexOf(chat);
                    if (index > -1) {
                        chatsData.splice(index, 1);
                        Notification.show('تم حذف المحادثة', 'success');
                    }
                }
                break;
        }
        
        ChatManager.displayChats(elements.searchInput.value);
        ChatManager.displayActiveChats();
    }
}

class Notification {
    static show(message, type = 'info') {
        // إنشاء عنصر الإشعار
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثوانٍ
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

class UIHelper {
    static observeFadeElements() {
        const fadeElements = document.querySelectorAll('.fade-in');
        const appearOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const appearOnScroll = new IntersectionObserver(function(entries, appearOnScroll) {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                appearOnScroll.unobserve(entry.target);
            });
        }, appearOptions);

        fadeElements.forEach(element => {
            appearOnScroll.observe(element);
        });
    }

    static updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('ar-EG', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
        elements.currentTime.textContent = timeString;
    }

    static simulateNewMessages() {
        setInterval(() => {
            if (Math.random() > 0.7 && chatsData.length > 0) {
                const randomChat = chatsData[Math.floor(Math.random() * chatsData.length)];
                const messages = [
                    "هل يمكنني استشارتك؟",
                    "شكراً على المساعدة",
                    "أشعر بتحسن كبير",
                    "متى يمكنني الحضور للمراجعة؟",
                    "هل الدواء آمن أثناء الحمل؟"
                ];
                
                randomChat.lastMessage = messages[Math.floor(Math.random() * messages.length)];
                randomChat.lastMessageTime = "الآن";
                randomChat.unreadCount += 1;
                randomChat.isOnline = Math.random() > 0.5;
                
                ChatManager.displayChats(elements.searchInput.value);
                ChatManager.displayActiveChats();
                
                if (randomChat.unreadCount === 1) {
                    Notification.show(`رسالة جديدة من ${randomChat.patientName}`, 'info');
                }
            }
        }, 15000);
    }
}

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    // تهيئة واجهة المستخدم
    ChatManager.displayActiveChats();
    ChatManager.displayChats();
    ChatWindow.handleTyping();
    
    // تحديث الوقت
    setInterval(UIHelper.updateTime, 60000);
    UIHelper.updateTime();
    
    // محاكاة الرسائل الجديدة
    UIHelper.simulateNewMessages();
    
    // إعداد مستمعي الأحداث
    setupEventListeners();
});

function setupEventListeners() {
    // البحث
    elements.searchInput.addEventListener('input', () => {
        ChatManager.displayChats(elements.searchInput.value);
    });

    // الفلاتر
    elements.chatFilters.querySelectorAll('.chat-filter').forEach(filter => {
        filter.addEventListener('click', () => {
            elements.chatFilters.querySelectorAll('.chat-filter').forEach(f => {
                f.classList.remove('active');
            });
            filter.classList.add('active');
            currentFilter = filter.getAttribute('data-filter');
            ChatManager.displayChats(elements.searchInput.value);
        });
    });

    // زر التحديث
    elements.refreshBtn.addEventListener('click', () => {
        elements.refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            elements.refreshBtn.style.transform = '';
            ChatManager.displayChats(elements.searchInput.value);
            ChatManager.displayActiveChats();
            Notification.show('تم تحديث المحادثات', 'info');
        }, 500);
    });

    // زر محادثة جديدة
    elements.newChatBtn.addEventListener('click', () => {
        Notification.show('جاري فتح قائمة المرضى لبدء محادثة جديدة', 'info');
    });

    // نافذة المحادثة
    elements.backButton.addEventListener('click', () => {
        elements.chatWindow.style.display = 'none';
        currentChatId = null;
    });

    elements.sendButton.addEventListener('click', () => ChatWindow.sendMessage());
    elements.chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            ChatWindow.sendMessage();
        }
    });
    elements.chatInput.addEventListener('input', () => ChatWindow.handleTyping());

    // الإرفاق
    elements.attachButton.addEventListener('click', () => AttachmentManager.showOptions());
    elements.closeAttachModal.addEventListener('click', () => {
        elements.attachModal.style.display = 'none';
    });

    // خيارات الإرفاق
    document.querySelectorAll('.attach-option').forEach(option => {
        option.addEventListener('click', () => {
            const type = option.getAttribute('data-type');
            AttachmentManager.handleAttachment(type);
        });
    });

    // التسجيل الصوتي
    elements.voiceButton.addEventListener('mousedown', () => VoiceRecorder.start());
    elements.voiceButton.addEventListener('touchstart', (e) => {
        e.preventDefault();
        VoiceRecorder.start();
    });

    document.addEventListener('mouseup', () => {
        if (isRecording) {
            VoiceRecorder.stop(false);
        }
    });

    document.addEventListener('touchend', () => {
        if (isRecording) {
            VoiceRecorder.stop(false);
        }
    });

    elements.deleteRecording.addEventListener('click', () => VoiceRecorder.stop(false));
    elements.sendRecording.addEventListener('click', () => VoiceRecorder.stop(true));

    // الإجراءات السريعة
    elements.chatActionsBtn.addEventListener('click', () => {
        elements.quickActionsMenu.style.display = elements.quickActionsMenu.style.display === 'flex' ? 'none' : 'flex';
    });

    elements.quickActionsMenu.querySelectorAll('.quick-action').forEach(action => {
        action.addEventListener('click', () => {
            const actionType = action.getAttribute('data-action');
            handleQuickAction(actionType);
            elements.quickActionsMenu.style.display = 'none';
        });
    });

    // الملف الشخصي
    elements.closeProfileModal.addEventListener('click', () => {
        elements.profileModal.style.display = 'none';
    });

    // المكالمات
    elements.endCall.addEventListener('click', () => CallManager.endCall());
    elements.micToggle.addEventListener('click', () => CallManager.toggleMic());
    elements.videoToggle.addEventListener('click', () => CallManager.toggleVideo());
    elements.speakerToggle.addEventListener('click', () => CallManager.toggleSpeaker());
    elements.flipCamera.addEventListener('click', () => CallManager.flipCamera());

    // معاينة الوسائط
    elements.backPreview.addEventListener('click', () => {
        elements.mediaPreview.style.display = 'none';
        currentMediaFile = null;
    });

    elements.sendPreview.addEventListener('click', () => AttachmentManager.sendMedia());
}

function handleQuickAction(action) {
    const chat = chatsData.find(c => c.id === currentChatId);
    if (!chat) return;

    switch (action) {
        case 'video-call':
            CallManager.startCall('video', currentChatId);
            break;
        case 'voice-call':
            CallManager.startCall('audio', currentChatId);
            break;
        case 'view-profile':
            ProfileManager.show(currentChatId);
            break;
        case 'medical-history':
            Notification.show('جاري فتح السجل الطبي...', 'info');
            break;
        case 'prescription':
            Notification.show('جاري فتح نموذج الوصفة الطبية...', 'info');
            break;
        case 'block':
            if (confirm('هل أنت متأكد من حظر هذا المريض؟')) {
                Notification.show('تم حظر المريض', 'success');
            }
            break;
    }
}

// جعل الدوال متاحة عالمياً للاستخدام في HTML
window.ChatWindow = ChatWindow;
window.MediaPreview = MediaPreview;
window.AudioPlayer = AudioPlayer;
window.handleQuickAction = handleQuickAction;
