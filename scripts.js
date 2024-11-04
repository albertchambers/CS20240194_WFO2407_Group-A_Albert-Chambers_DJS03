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

let page = 1;
let matches = books;

const renderInitialBooks = () => {
    const starting = document.createDocumentFragment();
    matches.slice(0, BOOKS_PER_PAGE).forEach(book => {
        const bookPreview = new BookPreview(book);
        starting.appendChild(bookPreview.element);
    });
    document.querySelector('[data-list-items]').appendChild(starting);
};

const renderGenres = () => {
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
    document.querySelector('[data-search-genres]').appendChild(genreHtml);
};

const renderAuthors = () => {
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
    document.querySelector('[data-search-authors]').appendChild(authorsHtml);
};

const setTheme = () => {
    const themeSelector = document.querySelector('[data-settings-theme]');
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeSelector.value = 'night';
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        themeSelector.value = 'day';
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
};

const updateShowMoreButton = () => {
    const remainingBooks = matches.length - (page * BOOKS_PER_PAGE);
    const showMoreButton = document.querySelector('[data-list-button]');
    showMoreButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${remainingBooks > 0 ? remainingBooks : 0})</span>
    `;
    showMoreButton.disabled = remainingBooks <= 0;
};

// Consolidate all event listeners here
const setupEventListeners = () => {
    document.querySelector('[data-search-cancel]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-settings-cancel]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-header-search]').addEventListener('click', () => {
        document.querySelector('[data-search-overlay]').open = true;
        document.querySelector('[data-search-title]').focus();
    });

    document.querySelector('[data-header-settings]').addEventListener('click', () => {
        document.querySelector('[data-settings-overlay]').open = true;
    });

    document.querySelector('[data-list-close]').addEventListener('click', () => {
        document.querySelector('[data-list-active]').open = false;
    });

    document.querySelector('[data-settings-form]').addEventListener('submit', (event) => {
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
        document.querySelector('[data-settings-overlay]').open = false;
    });

    document.querySelector('[data-search-form]').addEventListener('submit', (event) => {
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

        const messageElement = document.querySelector('[data-list-message]');
        if (result.length < 1) {
            messageElement.classList.add('list__message_show');
        } else {
            messageElement.classList.remove('list__message_show');
        }

        document.querySelector('[data-list-items]').innerHTML = '';
        const newItems = document.createDocumentFragment();
        result.slice(0, BOOKS_PER_PAGE).forEach(book => {
            const bookPreview = new BookPreview(book);
            newItems.appendChild(bookPreview.element);
        });

        document.querySelector('[data-list-items]').appendChild(newItems);
        updateShowMoreButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.querySelector('[data-search-overlay]').open = false;
    });

    document.querySelector('[data-list-button]').addEventListener('click', () => {
        const fragment = document.createDocumentFragment();
        matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE).forEach(book => {
            const bookPreview = new BookPreview(book);
            fragment.appendChild(bookPreview.element);
        });
        document.querySelector('[data-list-items]').appendChild(fragment);
        page += 1;
        updateShowMoreButton();
    });

    document.querySelector('[data-list-items]').addEventListener('click', (event) => {
        const pathArray = Array.from(event.path || event.composedPath());
        let active = null;

        for (const node of pathArray) {
            if (active) break;

            if (node?.dataset?.preview) {
                active = books.find(book => book.id === node.dataset.preview);
            }
        }

        if (active) {
            document.querySelector('[data-list-active]').open = true;
            document.querySelector('[data-list-blur]').src = active.image;
            document.querySelector('[data-list-image]').src = active.image;
            document.querySelector('[data-list-title]').innerText = active.title;
            document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`;
            document.querySelector('[data-list-description]').innerText = active.description;
        }
    });
};

// Initialize the application
const initializeApp = () => {
    renderInitialBooks();
    renderGenres();
    renderAuthors();
    setTheme();
    updateShowMoreButton();
    setupEventListeners();
};

initializeApp();
