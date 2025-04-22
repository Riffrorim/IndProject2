const addEditor = document.getElementById("addEditor");
const modalOverlay = document.querySelector(".modal-overlay");
const createButton = document.getElementById("createButton");
const inputHeading = document.getElementById("inputHeading");
const inputArticle = document.querySelector(".inputArticle");
const charCounter = document.querySelector(".char-counter");
const categorySelect = document.querySelector("select");
const myArticlesBtn = document.querySelector(".myArticles");
const changeArticlesModal = document.querySelector(".changeArticles");
const articlesList = document.querySelector(".listOfThemes");

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", function() {
    loadFromLocalStorage();
    loadMessagesFromLocalStorage();
});

// Обработчики событий
categorySelect.addEventListener("change", function() {
    const categoryDisplay = document.querySelector(".article-category p");
    if (this.value !== "Выбрать категорию") {
        categoryDisplay.textContent = `Категория: ${this.value}`;
    } else {
        categoryDisplay.textContent = "Категория: не выбрана";
    }
});

addEditor.addEventListener("click", function() {
    modalOverlay.classList.toggle("active");
});

modalOverlay.addEventListener("click", function(event) {
    if (event.target === modalOverlay) {
        modalOverlay.classList.remove("active");
    }
});

createButton.addEventListener("click", function() {
    createNewArticle();
});

inputArticle.addEventListener("input", function() {
    updateCharCounter();
});

myArticlesBtn.addEventListener("click", function() {
    changeArticlesModal.classList.add("active");
    displayMyArticles();
});

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("sendButton")) {
        sendMessage(event);
    }
    if (event.target === changeArticlesModal) {
        changeArticlesModal.classList.remove("active");
    }
});

// Функции для работы со статьями
function createNewArticle() {
    const title = inputHeading.value;
    const content = inputArticle.value;
    const category = categorySelect.value;
    
    if (category === "Выбрать категорию") {
        alert("Пожалуйста, выберите категорию.");
        return;
    }
    
    if (content.length < 100) {
        alert("Статья должна содержать как минимум 100 символов.");
        return;
    }

    if (title && content) {
        const newBlock = createInformationBlock(title, content, category);
        document.querySelector(".themes").appendChild(newBlock);
        const blockId = newBlock.getAttribute("data-id");
        const newPopTheme = createPopTheme(title, blockId);
        document.querySelector(".popularTheme").appendChild(newPopTheme);

        saveToLocalStorage(title, content, category);

        resetForm();
        modalOverlay.classList.remove("active");
    } else {
        alert("Пожалуйста, заполните все поля.");
    }
}

function createInformationBlock(title, content, category) {
    const newBlock = document.createElement("div");
    newBlock.classList.add("informationBlock");
    const blockId = generateUniqueId();
    newBlock.setAttribute("data-id", blockId);

    newBlock.innerHTML = `
        <div class="headInformation">
            <p class="name-theme">${title}</p>
        </div>
        <div class="mainInformation">
            <div class="information">
                <p class="text">${content}</p>
                <div class="article-category">
                    <p>Категория: ${category}</p>
                </div>
            </div>
            <div class="chat">
                <div class="windowChat">
                    <p class="start-conversation">Начните беседу</p>
                </div>
                <div class="inputBlock">
                    <input placeholder="Введите комментарий" class="inputMessage">
                    <img src="send.png" class="sendButton">
                </div>
            </div>
        </div>
    `;

    return newBlock;
}

function createPopTheme(title, blockId) {
    const newPopTheme = document.createElement("div");
    newPopTheme.classList.add("conteinerThemePop");
    newPopTheme.innerHTML = `
        <p class="pop-theme" data-id="${blockId}">
            ${title}
        </p>
    `;

    newPopTheme.addEventListener("click", function() {
        const targetBlock = document.querySelector(`.informationBlock[data-id="${blockId}"]`);
        if (targetBlock) {
            targetBlock.scrollIntoView({ behavior: "smooth" });
        }
    });

    return newPopTheme;
}

// Функции для работы с LocalStorage
function saveToLocalStorage(title, content, category) {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    articles.push({ title, content, category });
    localStorage.setItem("articles", JSON.stringify(articles));
}

function loadFromLocalStorage() {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    const themesSection = document.querySelector(".themes");

    articles.forEach(article => {
        const newBlock = createInformationBlock(article.title, article.content, article.category);
        themesSection.appendChild(newBlock);

        const blockId = newBlock.getAttribute("data-id");
        const newPopTheme = createPopTheme(article.title, blockId);
        document.querySelector(".popularTheme").appendChild(newPopTheme);
    });
}

// Функции для работы с чатом
function sendMessage(event) {
    const inputMessage = event.target.previousElementSibling;
    const message = inputMessage.value.trim();

    if (message) {
        const chatWindow = event.target.closest(".chat").querySelector(".windowChat");
        const blockId = event.target.closest(".informationBlock").getAttribute("data-id");
        addMessageToChat(chatWindow, message, true);
        saveMessageToLocalStorage(blockId, message, true);
        inputMessage.value = "";
    }
}

function addMessageToChat(chatWindow, message, isMyMessage = true) {
    const startMessage = chatWindow.querySelector(".start-conversation");
    if (startMessage) {
        startMessage.remove();
    }

    const messageElement = document.createElement("p");
    messageElement.classList.add(isMyMessage ? "myMessage" : "message");
    messageElement.textContent = message;
    chatWindow.appendChild(messageElement);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

function saveMessageToLocalStorage(blockId, message, isMyMessage = true) {
    const chats = JSON.parse(localStorage.getItem("chats")) || {};
    if (!chats[blockId]) {
        chats[blockId] = [];
    }
    chats[blockId].push({ message, isMyMessage });
    localStorage.setItem("chats", JSON.stringify(chats));
}

function loadMessagesFromLocalStorage() {
    const chats = JSON.parse(localStorage.getItem("chats")) || {};
    const informationBlocks = document.querySelectorAll(".informationBlock");

    informationBlocks.forEach(block => {
        const blockId = block.getAttribute("data-id");
        const chatWindow = block.querySelector(".windowChat");

        if (chats[blockId] && chats[blockId].length > 0) {
            const startMessage = chatWindow.querySelector(".start-conversation");
            if (startMessage) {
                startMessage.remove();
            }

            chats[blockId].forEach(msg => {
                addMessageToChat(chatWindow, msg.message, msg.isMyMessage);
            });
        }
    });
}

// Функции для работы с "Мои статьи"
function displayMyArticles() {
    articlesList.innerHTML = '';
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    
    if (articles.length === 0) {
        articlesList.innerHTML = '<p class="no-articles">У вас пока нет статей</p>';
        return;
    }
    
    articles.forEach((article, index) => {
        const articleItem = document.createElement("div");
        articleItem.classList.add("article-item");
        
        const titleElement = document.createElement("p");
        titleElement.textContent = article.title;
        
        const deleteBtn = document.createElement("button");
        deleteBtn.classList.add("delete-btn");
        deleteBtn.textContent = "Удалить";
        
        deleteBtn.addEventListener("click", () => {
            deleteArticle(index);
        });
        
        articleItem.appendChild(titleElement);
        articleItem.appendChild(deleteBtn);
        articlesList.appendChild(articleItem);
    });
}

function deleteArticle(index) {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    if (index >= 0 && index < articles.length) {
        articles.splice(index, 1);
        localStorage.setItem("articles", JSON.stringify(articles));
        displayMyArticles();
        location.reload();
    }
}

// Функции для работы с поиском
function searchArticles(query) {
    const articles = JSON.parse(localStorage.getItem("articles")) || [];
    const themesSection = document.querySelector(".themes");
    themesSection.innerHTML = '';
    
    if (!query.trim()) {
        loadFromLocalStorage();
        return;
    }
    
    const normalizedQuery = query.toLowerCase();
    const results = articles.filter(article => 
        article.title.toLowerCase().includes(normalizedQuery) || 
        article.content.toLowerCase().includes(normalizedQuery) ||
        article.category.toLowerCase().includes(normalizedQuery)
    );
    
    if (results.length === 0) {
        themesSection.innerHTML = '<p class="no-results">Ничего не найдено :/</p>';
    } else {
        results.forEach(article => {
            const newBlock = createInformationBlock(
                article.title, 
                article.content, 
                article.category
            );
            themesSection.appendChild(newBlock);
        });
    }
}

// Вспомогательные функции
function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function resetForm() {
    inputHeading.value = "";
    inputArticle.value = "";
    categorySelect.value = "Выбрать категорию";
    charCounter.textContent = "Символов: 0/100";
    charCounter.style.color = "red";
    createButton.disabled = true;
}

function updateCharCounter() {
    const length = inputArticle.value.length;
    charCounter.textContent = `Символов: ${length}/100`;
    if (length < 100) {
        createButton.disabled = true;
        charCounter.style.color = "red";
    } else {
        createButton.disabled = false;
        charCounter.style.color = "white";
    }
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Обработчики для поиска
const searchIcon = document.querySelector(".iconSearch");
const searchInput = document.querySelector(".inputSearch");

searchIcon.addEventListener("click", function() {
    searchArticles(searchInput.value);
});

searchInput.addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        searchArticles(this.value);
    }
});

document.addEventListener('click', function(event) {
    const changeArticlesModal = document.querySelector('.changeArticles');

    if (changeArticlesModal.classList.contains('active') && 
        !event.target.closest('.changeArticles') && 
        event.target !== myArticlesBtn) {
        changeArticlesModal.classList.remove('active');
    }
});
const modalBackdrop = document.querySelector(".modal-backdrop");

myArticlesBtn.addEventListener("click", function() {
    changeArticlesModal.classList.add("active");
    modalBackdrop.classList.add("active");
    displayMyArticles();
});

document.addEventListener("click", function(event) {
    if (event.target.classList.contains("sendButton")) {
        sendMessage(event);
    }
    if (event.target === modalBackdrop) {
        changeArticlesModal.classList.remove("active");
        modalBackdrop.classList.remove("active");
    }
});