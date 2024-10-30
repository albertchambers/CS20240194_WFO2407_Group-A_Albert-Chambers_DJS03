// @ts-check

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

class Book {
    /**
     * Create a Book instance.
     * @param {string} id
     * @param {string} title
     * @param {string} author
     * @param {string} image
     * @param {string} description
     * @param {string[]} genres
     * @param {number} published
     */
    constructor(id, title, author, image, description, genres, published) {
        this.id = id;
        this.title = title;
        this.author = author;
        this.image = image;
        this.description = description;
        this.genres = genres;
        this.published = published;
    }

    renderPreview() {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', this.id);
        element.innerHTML = `
            <img class="preview__image" src="${this.image}" />
            <div class="preview__info">
                <h3 class="preview__title">${this.title}</h3>
                <div class="preview__author">${authors[this.author]}</div>
            </div>
        `;
        return element;
    }
}

/**
 * Render a list of books in container.
 * @param {Array<object>} booksToRender
 * @param {string} container
 * @param {number} page
 * @param {number} booksPerPage
 */
function renderBooks(booksToRender, container, page, booksPerPage) {
    const fragment = document.createDocumentFragment();
    const start = (page - 1) * booksPerPage;
    const end = start + booksPerPage;
    const booksSlice = booksToRender.slice(start, end);

    booksSlice.forEach(book => {
        const bookInstance = new Book(
            book.id,
            book.title,
            book.author,
            book.image,
            book.description,
            book.genres,
            book.published
        );
        fragment.appendChild(bookInstance.renderPreview());
    });

    const containerElement = document.querySelector(container);
    containerElement?.appendChild(fragment);
}

renderBooks(books, '[data-list-items]', page, BOOKS_PER_PAGE);

/**
 * Dynamic filter options (dropdown)
 * @param {string} selectElement
 * @param {object} data
 * @param {string} firstOptionText
 */
function renderOptions(selectElement, data, firstOptionText) {
    const fragment = document.createDocumentFragment();
    const firstOption = document.createElement('option');
    firstOption.value = 'any';
    firstOption.innerText = firstOptionText;
    fragment.appendChild(firstOption);

    Object.entries(data).forEach(([id, name]) => {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    });

    const targetElement = document.querySelector(selectElement);
    targetElement?.appendChild(fragment);
}

renderOptions('[data-search-genres]', genres, 'All Genres');
renderOptions('[data-search-authors]', authors, 'All Authors');

const themeElement = document.querySelector('[data-settings-theme]');
if (themeElement instanceof HTMLSelectElement) {
    const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(isDarkMode ? 'night' : 'day');
} else {
    console.error('Theme element not found or is not a select element.');
}

/**
 * Set theme based on preference.
 * @param {string} theme
 */
function setTheme(theme) {
    const darkColor = theme === 'night' ? '255, 255, 255' : '10, 10, 20';
    const lightColor = theme === 'night' ? '10, 10, 20' : '255, 255, 255';

    document.documentElement.style.setProperty('--color-dark', darkColor);
    document.documentElement.style.setProperty('--color-light', lightColor);
}

// Handle the "Show more" button state
const listButton = document.querySelector('[data-list-button]');
if (listButton instanceof HTMLButtonElement) {
    updateListButton();
}

function updateListButton() {
    const remainingBooks = matches.length - (page * BOOKS_PER_PAGE);
    listButton.innerText = `Show more (${remainingBooks})`;
    listButton.disabled = remainingBooks <= 0;
}

// Event Listeners (Optional Chaining)
const searchCancel = document.querySelector('[data-search-cancel]');
const settingsCancel = document.querySelector('[data-settings-cancel]');
const headerSearch = document.querySelector('[data-header-search]');
const headerSettings = document.querySelector('[data-header-settings]');
const listClose = document.querySelector('[data-list-close]');
const settingsForm = document.querySelector('[data-settings-form]');
const searchForm = document.querySelector('[data-search-form]');
const listItems = document.querySelector('[data-list-items]');

searchCancel?.addEventListener('click', () => {
    document.querySelector('[data-search-overlay]')?.setAttribute('open', 'false');
});

settingsCancel?.addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]')?.setAttribute('open', 'false');
});

headerSearch?.addEventListener('click', () => {
    document.querySelector('[data-search-overlay]')?.setAttribute('open', 'true');
    document.querySelector('[data-search-title]')?.focus();
});

headerSettings?.addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]')?.setAttribute('open', 'true');
});

listClose?.addEventListener('click', () => {
    document.querySelector('[data-list-active]')?.setAttribute('open', 'false');
});

settingsForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    setTheme(theme);
    document.querySelector('[data-settings-overlay]')?.setAttribute('open', 'false');
});

// Handling for Search Form
searchForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);

    const result = books.filter((book) => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = !filters.title.trim() || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;

        return genreMatch && titleMatch && authorMatch;
    });

    page = 1;
    matches = result;
    const listMessage = document.querySelector('[data-list-message]');
    
    if (result.length < 1) {
        listMessage?.classList.add('list__message_show');
    } else {
        listMessage?.classList.remove('list__message_show');
    }

    renderBooks(result, '[data-list-items]', page, BOOKS_PER_PAGE);
    updateListButton();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]')?.setAttribute('open', 'false');
});

// Pagination Handler
listButton?.addEventListener('click', () => {
    const fragment = document.createDocumentFragment();
    const nextBooks = matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE);

    nextBooks.forEach(({ author, id, image, title }) => {
        const bookButton = document.createElement('button');
        bookButton.classList.add('preview');
        bookButton.setAttribute('data-preview', id);
        bookButton.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        fragment.appendChild(bookButton);
    });

    listItems?.appendChild(fragment);
    page += 1;
    updateListButton();
});

// List Item Click Handler
listItems?.addEventListener('click', (event) => {
    const target = event.target.closest('[data-preview]');
    if (target) {
        const active = books.find(book => book.id === target.dataset.preview);
        const listActive = document.querySelector('[data-list-active]');
        const titleElement = listActive?.querySelector('[data-list-title]');
        const imageElement = listActive?.querySelector('[data-list-image]');
        const descriptionElement = listActive?.querySelector('[data-list-description]');

        if (listActive && titleElement && imageElement && descriptionElement) {
            listActive.setAttribute('open', 'true');
            titleElement.innerText = active.title;
            imageElement.src = active.image;
            descriptionElement.innerText = active.description;
        }
    }
});
