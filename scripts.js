// @ts-check

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

class BookPreview {
    constructor(book) {
        this.book = book;
        this.element = this.createElement();
    }

    createElement() {
        const { author, id, image, title } = this.book;
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', id);
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        return element;
    }
}

// Initialize state variables
let page = 1;
let matches = books;

// Define query selectors in an object
const selectors = {
    listItems: document.querySelector('[data-list-items]'),
    searchCancel: document.querySelector('[data-search-cancel]'),
    settingsCancel: document.querySelector('[data-settings-cancel]'),
    headerSearch: document.querySelector('[data-header-search]'),
    headerSettings: document.querySelector('[data-header-settings]'),
    listClose: document.querySelector('[data-list-close]'),
    settingsForm: document.querySelector('[data-settings-form]'),
    searchForm: document.querySelector('[data-search-form]'),
    listButton: document.querySelector('[data-list-button]'),
    listMessage: document.querySelector('[data-list-message]'),
    searchOverlay: document.querySelector('[data-search-overlay]'),
    settingsOverlay: document.querySelector('[data-settings-overlay]'),
    listActive: document.querySelector('[data-list-active]'),
    listBlur: document.querySelector('[data-list-blur]'),
    listImage: document.querySelector('[data-list-image]'),
    listTitle: document.querySelector('[data-list-title]'),
    listSubtitle: document.querySelector('[data-list-subtitle]'),
    listDescription: document.querySelector('[data-list-description]'),
    settingsTheme: document.querySelector('[data-settings-theme]'),
    searchGenres: document.querySelector('[data-search-genres]'),
    searchAuthors: document.querySelector('[data-search-authors]'),
};

// Function to render initial books
const renderInitialBooks = () => {
    const starting = document.createDocumentFragment();
    matches.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const bookPreview = new BookPreview(book);
        starting.appendChild(bookPreview.element);
    });
    selectors.listItems.appendChild(starting);
};

// Function to populate genres dropdown
const populateGenres = () => {
    const genreHtml = document.createDocumentFragment();
    const firstGenreElement = document.createElement('option');
    firstGenreElement.value = 'any';
    firstGenreElement.innerText = 'All Genres';
    genreHtml.appendChild(firstGenreElement);

    for (const [id, name] of Object.entries(genres)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        genreHtml.appendChild(element);
    }
    
    selectors.searchGenres.appendChild(genreHtml);
};

// Function to populate authors dropdown
const populateAuthors = () => {
    const authorsHtml = document.createDocumentFragment();
    const firstAuthorElement = document.createElement('option');
    firstAuthorElement.value = 'any';
    firstAuthorElement.innerText = 'All Authors';
    authorsHtml.appendChild(firstAuthorElement);

    for (const [id, name] of Object.entries(authors)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        authorsHtml.appendChild(element);
    }

    selectors.searchAuthors.appendChild(authorsHtml);
};

// Function to set theme based on user preference
const setTheme = () => {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themeValue = isDarkMode ? 'night' : 'day';
    
    document.querySelector('[data-settings-theme]').value = themeValue;
    document.documentElement.style.setProperty('--color-dark', isDarkMode ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', isDarkMode ? '10, 10, 20' : '255, 255, 255');
};

// Function to update "Show more" button
const updateShowMoreButton = () => {
    const remainingBooks = matches.length - (page * BOOKS_PER_PAGE);
    selectors.listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
    `;
    selectors.listButton.disabled = remainingBooks <= 0;
};

// Function to setup event listeners
const setupEventListeners = () => {
    selectors.searchCancel.addEventListener('click', () => {
        selectors.searchOverlay.open = false;
    });

    selectors.settingsCancel.addEventListener('click', () => {
        selectors.settingsOverlay.open = false;
    });

    selectors.headerSearch.addEventListener('click', () => {
        selectors.searchOverlay.open = true;
        document.querySelector('[data-search-title]').focus();
    });

    selectors.headerSettings.addEventListener('click', () => {
        selectors.settingsOverlay.open = true;
    });

    selectors.listClose.addEventListener('click', () => {
        selectors.listActive.open = false;
    });

    selectors.settingsForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const { theme } = Object.fromEntries(formData);
        
        if (theme === 'night') {
            document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
            document.documentElement.style.setProperty('--color-light', '10, 10, 20');
        } else {
            document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
            document.documentElement.style.setProperty('--color-light', '255, 255, 255');
        }
        selectors.settingsOverlay.open = false;
    });

    selectors.searchForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
        const filters = Object.fromEntries(formData);
        const result = [];

        for (const book of books) {
            const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
            if (
                (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
                (filters.author === 'any' || book.author === filters.author) &&
                genreMatch
            ) {
                result.push(book);
            }
        }

        page = 1;
        matches = result;

        if (result.length < 1) {
            selectors.listMessage.classList.add('list__message_show');
        } else {
            selectors.listMessage.classList.remove('list__message_show');
        }

        selectors.listItems.innerHTML = '';
        const newItems = document.createDocumentFragment();
        result.slice(0, BOOKS_PER_PAGE).forEach(book => {
            const bookPreview = new BookPreview(book);
            newItems.appendChild(bookPreview.element);
        });

        selectors.listItems.appendChild(newItems);
        updateShowMoreButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        selectors.searchOverlay.open = false;
    });

    selectors.listButton.addEventListener('click', () => {
        const fragment = document.createDocumentFragment();
        matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
            const bookPreview = new BookPreview(book);
            fragment.appendChild(bookPreview.element);
        });
        selectors.listItems.appendChild(fragment);
        page += 1;
        updateShowMoreButton();
    });

    selectors.listItems.addEventListener('click', (event) => {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (active) break;

            if (node?.dataset?.preview) {
                active = books.find(book => book.id === node.dataset.preview);
            }
        }

        if (active) {
            selectors.listActive.open = true;
            selectors.listBlur.src = active.image;
            selectors.listImage.src = active.image;
            selectors.listTitle.innerText = active.title;
            selectors.listSubtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
            selectors.listDescription.innerText = active.description;
        }
    });
};

// Initialize the application
const initializeApp = () => {
    renderInitialBooks();
    populateGenres();
    populateAuthors();
    setTheme();
    updateShowMoreButton();
    setupEventListeners();
};

initializeApp();
