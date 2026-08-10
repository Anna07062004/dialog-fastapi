const elements = {
    sidebar: document.getElementById("sidebar"),
    sidebarBackdrop: document.getElementById("sidebarBackdrop"),
    sidebarOpen: document.getElementById("sidebarOpen"),
    sidebarClose: document.getElementById("sidebarClose"),
    newChatButton: document.getElementById("newChatButton"),
    chatSearch: document.getElementById("chatSearch"),
    chatHistory: document.getElementById("chatHistory"),
    emptyHistory: document.getElementById("emptyHistory"),
    profileAvatar: document.getElementById("profileAvatar"),
    profileName: document.getElementById("profileName"),
    profileEmail: document.getElementById(" profileEmail"),
    logoutButton: document.getElementById("logoutButton"),
    chatTitle: document.getElementById("chatTitle"),
    saveStatus: document.getElementById("saveStatus"),
    deleteChatButton: document.getElementById("deleteChatButton"),
    chatViewport: document.getElementById("chatViewport"),
    emptyState: document.getElementById("emptyState"),
    messages: document.getElementById("messages"),
    globalError: document.getElementById("globalError"),
    chatForm: document.getElementById("chatForm"),
    messageInput: document.getElementById("messageInput"),
    modelSelect: document.getElementById("modelSelect"),
    charCount: document.getElementById("charCount"),
    sendButton: document.getElementById("sendButton")
};

const state = {
    user: null,
    chats: [],
    models: [],
    currentChatId: null,
    sending: false
};

function showError(message) {
    elements.globalError.textContent = message;
    elements.globalError.classList.remove("hidden")
}

function cleanError(message) {
    elements.globalError.classList.add("hidden")
    elements.globalError.textContent = "";
}

function setEmptyState(isEmpty) {
    elements.emptyState.classList.toggle("hidden", !isEmpty)
    elements.messages.classList.toggle("hidden", isEmpty)
}

function renderChats() {
    const query = elements.chatSearch.value.trim().toLowerCase();
    const visibleChats = state.chats.filter(chat => chat.title.toLowerCase().includes(query))

    elements.chatHistory.replaceChildren();
    elements.emptyHistory.classList.toggle("hidden", visibleChats.length > 0);

    visibleChats.forEach(chat => {
        const button = document.createElement("button");
        const active = chat.id === state.currentChatId;
        button.type = "button";
        button.className = active
            ? "flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-left font-medium text-ink shadow-sm"
            : "flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2.5 text-left font-medium text-stone-600"
        button.dataset.chatId = chat.id;

        const icon = document.createElement("span");
        icon.className = "size-1.5 shrink-0 rounded-full bg-stone-400"

        const label = document.createElement("span");
        label.className = "truncate";
        label.textContent = chat.title;

        button.append(icon, label);
        button.addEventListener("click", () => loadChat(chat.id))
        elements.chatHistory.appendChild(button);
    })
}

async function loadChat(chatId) {
    try{
        const detail = await api(`/api/chats/${chatId}`);
        state.currentChatId = chatId;
        elements.chatTitle.textContent = detail.chat.title;
        elements.deleteChatButton.classList.remove("hidden");

        renderMessages();
        renderChats();
    }catch(e){
        showError(e.message);
    }
}

function createMessageElement(message) {
    const isUser = message.role === "user";
    const article = document.createAttribute("article")
    article.className = isUser
        ? "flex items-center justify-end"
        : "flex items-start gap-3"

    const content = document.createElement("div");
    content.className = isUser
        ? "max-w-[85%] whitespace-pre-wrap rounded-2x1 border-br-md bg-stone-100 px-4 py-3 text-sm"
        : "min-w-0 max-w-[clac(100%_-2.5rem)] whitespace-pre-wrap pt-0.5 text-stone-800"

    
}

async function renderMessages(messages) {
    elements.messages.replaceChildren(...messages.map(createMessageElment));

    scrollToBottom()
}

function stateNewChat() {
    state.currentChatId = null;
    elements.chatTitle.textContent = "новый чат";
    elements.deleteChatButton.classList.add("hidden");
    elements.messages.replaceChildren();
    setEmptyState(true);
    renderChats();
    elements.messageInput.focus()
}

async function createChat() {
    const chat = await api("/api/chats", {
        method: "POST",
        body: JSON.stringify({ title: "Новый чат" })
    });

    state.chats.unshift(chat);
    state.currentChatId = chat.id;
    elements.deta
}

elements.chatForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const content = elements.messageInput.value.trin();
    if (!content) return;
    elements.messageInput.value = "";
    updateComposer();
    sendMessager(content);
});

elements.messageInput.addEventListener("input", updateComposer);
elements.messageInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        elements.chatForm.requestSubmit();
    }
});
