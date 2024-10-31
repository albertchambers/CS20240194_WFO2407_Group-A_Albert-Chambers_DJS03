// @ts-check

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

/** @class */
class Book {
    constructor({ id, author, image, title, published, description }) {
        this.id = id;
        this.author = author;
        this.image = image;
        this.title = title;
        this.published = published;
        this.description = description;
    }

    /** Creates a preview element for the book.
     * @returns {HTMLElement}
     */
    createPreviewElement() {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', this.id);
        element.innerHTML = `
            <img class="preview__image" src="${this.image}" alt="${this.title} cover image" />
            <div class="preview__info">
                <h3 class="preview__title">${this.title}</h3>
                <div class="preview__author">${authors[this.author] || 'Unknown Author'}</div>
            </div>
        `;
        return element;
    }
}

let page = 1;
let matches = books;

const elements = {
    listItems: document.querySelector('[data-list-items]'),
    listButton: document.querySelector('[data-list-button]'),
    searchOverlay: document.querySelector('[data-search-overlay]'),
    searchTitle: document.querySelector('[data-search-title]'),
    searchForm: document.querySelector('[data-search-form]'),
    settingsOverlay: document.querySelector('[data-settings-overlay]'),
    settingsForm: document.querySelector('[data-settings-form]'),
    message: document.querySelector('[data-list-message]'),
    cancelSearch: document.querySelector('[data-search-cancel]'),
    cancelSettings: document.querySelector('[data-settings-cancel]'),
    headerSearch: document.querySelector('[data-header-search]'),
    headerSettings: document.querySelector('[data-header-settings]'),
    listClose: document.querySelector('[data-list-close]'),
    listBlur: document.querySelector('[data-list-blur]'),
    listImage: document.querySelector('[data-list-image]'),
    listTitle: document.querySelector('[data-list-title]'),
    listSubtitle: document.querySelector('[data-list-subtitle]'),
    listDescription: document.querySelector('[data-list-description]'),
};

/** Renders the initial books on the page. */
const renderInitialBooks = () => {
    try {
        const starting = document.createDocumentFragment();
        for (const bookData of matches.slice(0, BOOKS_PER_PAGE)) {
            const book = new Book(bookData);
            starting.appendChild(book.createPreviewElement());
        }
        elements?.listItems?.appendChild(starting);
        updateListButton();
    } catch (error) {
        console.error("Error rendering initial books:", error);
    }
};

/** Sets up the genres dropdown. */
const setupGenres = () => {
    const genreHtml = createSelectOptions(genres, 'any', 'All Genres');
    document.querySelector('[data-search-genres]')?.appendChild(genreHtml);
};

/** Sets up the authors dropdown. */
const setupAuthors = () => {
    const authorsHtml = createSelectOptions(authors, 'any', 'All Authors');
    document.querySelector('[data-search-authors]')?.appendChild(authorsHtml);
};

/** Creates select options for dropdowns.
 * @param {Object} data - The data to create options from.
 * @param {string} defaultValue - The default value for the select.
 * @param {string} defaultText - The default text for the select.
 * @returns {DocumentFragment}
 */
const createSelectOptions = (data, defaultValue, defaultText) => {
    const fragment = document.createDocumentFragment();
    const firstElement = document.createElement('option');
    firstElement.value = defaultValue;
    firstElement.innerText = defaultText;
    fragment.appendChild(firstElement);

    for (const [id, name] of Object.entries(data)) {
        const element = document.createElement('option');
        element.value = id;
        element.innerText = name;
        fragment.appendChild(element);
    }
    return fragment;
};

/** Sets the initial theme based on user preference. */
const setInitialTheme = () => {
    try {
        // Check for the user's preferred color scheme
        const theme = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';

        // Safely update the button text if listButton exists
        if (elements.listButton instanceof HTMLElement) {
            elements.listButton.innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
        } else {
            console.warn("listButton element is not defined or not an HTMLElement.");
        }

        // Update the theme using the previously defined function
        updateTheme(theme);

        // Safely set the value of the theme setting element if it exists
        const themeSettingElement = document.querySelector('[data-settings-theme]');
        if (themeSettingElement instanceof HTMLInputElement) {
            themeSettingElement.value = theme; // Set the value if the element is an input
        } else {
            console.warn("Theme setting element is not found or not an HTMLInputElement.");
        }
    } catch (error) {
        console.error("Error setting initial theme:", error);
    }
};

/** Updates the theme of the page.
 * @param {string} theme - The current theme ('day' or 'night').
 */
const updateTheme = (theme) => {
    const colorSettings = theme === 'night'
        ? { dark: '255, 255, 255', light: '10, 10, 20' }
        : { dark: '10, 10, 20', light: '255, 255, 255' };

    document.documentElement.style.setProperty('--color-dark', colorSettings.dark);
    document.documentElement.style.setProperty('--color-light', colorSettings.light);
};

/** Sets up event listeners for various elements. */
const setupEventListeners = () => {
    elements.cancelSearch.addEventListener('click', () => closeOverlay(elements.searchOverlay));
    elements.cancelSettings.addEventListener('click', () => closeOverlay(elements.settingsOverlay));
    elements.headerSearch.addEventListener('click', () => openOverlay(elements.searchOverlay, elements.searchTitle));
    elements.headerSettings.addEventListener('click', () => openOverlay(elements.settingsOverlay));
    elements.listClose.addEventListener('click', () => closeOverlay(document.querySelector('[data-list-active]')));
    elements.settingsForm.addEventListener('submit', handleSettingsSubmit);
    elements.searchForm.addEventListener('submit', handleSearchSubmit);
    elements.listButton.addEventListener('click', loadMoreBooks);
    elements.listItems.addEventListener('click', showBookDetails);
};

/** Opens a specified overlay and focuses on a given element.
 * @param {HTMLElement} overlay - The overlay element to open.
 * @param {HTMLElement} focusElement - The element to focus on.
 */
const openOverlay = (overlay, focusElement) => {
    overlay.open = true;
    if (focusElement) focusElement.focus();
};

/** Closes a specified overlay.
 * @param {HTMLElement} overlay - The overlay element to close.
 */
const closeOverlay = (overlay) => {
    overlay.open = false;
};

/** Handles the submission of the settings form.
 * @param {Event} event - The form submission event.
 */
const handleSettingsSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);
    updateTheme(theme);
    closeOverlay(elements.settingsOverlay);
};

/** Handles the submission of the search form.
 * @param {Event} event - The form submission event.
 */
const handleSearchSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    matches = filterBooks(filters);
    renderFilteredBooks();
};

/** Filters books based on search criteria.
 * @param {Object} filters - The filters to apply.
 * @returns {Array}
 */
const filterBooks = (filters) => {
    return books.filter(book => {
        const genreMatch = filters.genre === 'any' || book.genres.includes(filters.genre);
        const titleMatch = filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase());
        const authorMatch = filters.author === 'any' || book.author === filters.author;
        return titleMatch && authorMatch && genreMatch;
    });
};

/** Renders filtered books after search.
 * Handles the case when no matches are found.
 */
const renderFilteredBooks = () => {
    try {
        if (matches.length < 1) {
            elements.message.classList.add('list__message_show');
        } else {
            elements.message.classList.remove('list__message_show');
        }

        elements.listItems.innerHTML = '';
        const newItems = document.createDocumentFragment();
        for (const bookData of matches.slice(0, BOOKS_PER_PAGE)) {
            const book = new Book(bookData);
            newItems.appendChild(book.createPreviewElement());
        }
        elements.listItems.appendChild(newItems);
        updateListButton();
        window.scrollTo({ top: 0, behavior: 'smooth' });
        closeOverlay(elements.searchOverlay);
    } catch (error) {
        console.error("Error rendering filtered books:", error);
    }
};

/** Loads more books when the button is clicked. */
const loadMoreBooks = () => {
    try {
        const fragment = document.createDocumentFragment();
        const start = page * BOOKS_PER_PAGE;
        const end = (page + 1) * BOOKS_PER_PAGE;

        for (const bookData of matches.slice(start, end)) {
            const book = new Book(bookData);
            fragment.appendChild(book.createPreviewElement());
        }

        elements.listItems.appendChild(fragment);
        page += 1;
        updateListButton();
    } catch (error) {
        console.error("Error loading more books:", error);
    }
};

/** Updates the button's text to reflect the number of remaining books. */
const updateListButton = () => {
    const remaining = matches.length - (page * BOOKS_PER_PAGE);
    elements.listButton.innerText = `Show more (${remaining < 0 ? 0 : remaining})`;
};

/** Displays book details in a modal. */
const showBookDetails = (event) => {
    const target = event.target.closest('[data-preview]');
    if (!target) return;

    const bookId = target.dataset.preview;
    const bookData = books.find(book => book.id === bookId);

    if (bookData) {
        elements.listImage.src = bookData.image;
        elements.listTitle.innerText = bookData.title;
        elements.listSubtitle.innerText = authors[bookData.author] || 'Unknown Author';
        elements.listDescription.innerText = bookData.description;
        document.querySelector('[data-list-active]').showModal();
    } else {
        console.warn("Book not found for ID:", bookId);
    }
};

// Initialize the app
const init = () => {
    setupGenres();
    setupAuthors();
    setInitialTheme();
    renderInitialBooks();
    setupEventListeners();
};

// Run the initialization
init();
