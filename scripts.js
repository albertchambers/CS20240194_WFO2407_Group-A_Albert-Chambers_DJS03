// @ts-check

import { books, authors, genres, BOOKS_PER_PAGE } from './data.js'

let page = 1;
let matches = books

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
        this.description = description
        this.genres = genres;
        this.published = published;
    }
    renderPreview() {
        const element = document.createElement('button');
        element.classList.add('preview');
        element.setAttribute('data-preview', this.id)
        element.innerHTML = `
            <img class="preview__image" src="${this.image}" />
            <div class="preview__info">
            <h3 class="preview__title">${this.title}</h3>
            <div class="preview__author">${authors[this.author]}</div>
            </div>
        `;
        return element;
    };
};

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

    for (const book of booksSlice) {
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
    }

    const containerElement = document.querySelector(container);
    if (containerElement) {
        containerElement.appendChild(fragment);
    }
}

renderBooks(books, '[data-list-items]', 1, BOOKS_PER_PAGE);

/**
 * Dynamic filter options (dropdown)
 * @param {object} data
 * @param {string} firstOptionText
 * @param {string} selectElement
 */
function renderOptions(selectElement, data, firstOptionText) {
    const fragment = document.createDocumentFragment();
    const firstOption = document.createElement('option');
    firstOption.value = 'any';
    firstOption.innerText = firstOptionText;
    fragment.appendChild(firstOption);

    for (const [id, name] of Object.entries(data)) {
        const option = document.createElement('option');
        option.value = id;
        option.innerText = name;
        fragment.appendChild(option);
    }

    const targetElement = document.querySelector(selectElement);

    // Null check before appending the fragment
    if (targetElement) {
        targetElement.appendChild(fragment);
    } else {
        console.error(`Element with selector "${selectElement}" not found.`);
    }
}

renderOptions('[data-search-genres]', genres, 'All Genres');
renderOptions('[data-search-authors]', authors, 'All Authors');

const themeElement = document.querySelector('[data-settings-theme]');

// Check if the theme element exists and is a select element
if (themeElement && themeElement instanceof HTMLSelectElement) {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        themeElement.value = 'night';
        document.documentElement.style.setProperty('--color-dark', '255, 255, 255');
        document.documentElement.style.setProperty('--color-light', '10, 10, 20');
    } else {
        themeElement.value = 'day';
        document.documentElement.style.setProperty('--color-dark', '10, 10, 20');
        document.documentElement.style.setProperty('--color-light', '255, 255, 255');
    }
} else {
    console.error('Theme element not found or is not a select element.');
}

// Handle the "Show more" button state
const listButton = document.querySelector('[data-list-button]');
if (listButton instanceof HTMLButtonElement) {
    listButton.innerText = `Show more (${books.length - BOOKS_PER_PAGE})`;
    listButton.disabled = (matches.length - (page * BOOKS_PER_PAGE)) <= 0;

    listButton.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `;
}

// Event Listeners (Optional Chaining)
document.querySelector('[data-search-cancel]')?.addEventListener('click', () => {
    document.querySelector('[data-search-overlay]')?.setAttribute('open', 'false');
});

document.querySelector('[data-settings-cancel]')?.addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]')?.setAttribute('open', 'false');
});

document.querySelector('[data-header-search]')?.addEventListener('click', () => {
    document.querySelector('[data-search-overlay]')?.setAttribute('open', 'true');
    document.querySelector('[data-search-title]')?.focus();
});

document.querySelector('[data-header-settings]')?.addEventListener('click', () => {
    document.querySelector('[data-settings-overlay]')?.setAttribute('open', 'true');
});

document.querySelector('[data-list-close]')?.addEventListener('click', () => {
    document.querySelector('[data-list-active]')?.setAttribute('open', 'false');
});

document.querySelector('[data-settings-form]')?.addEventListener('submit', (event) => {
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

    document.querySelector('[data-settings-overlay]')?.setAttribute('open', 'false');
});

// Handling for Search Form
document.querySelector('[data-search-form]')?.addEventListener('submit', (event) => {
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

    const listItems = document.querySelector('[data-list-items]');
    if (listItems) {
        listItems.innerHTML = '';
        const newItems = document.createDocumentFragment();

        for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
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
            newItems.appendChild(element);
        }

        listItems.appendChild(newItems);
    }

    document.querySelector('[data-list-button]')?.setAttribute('disabled', matches.length - (page * BOOKS_PER_PAGE) <= 0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.querySelector('[data-search-overlay]')?.setAttribute('open', 'false');
});

// Pagination Handler
document.querySelector('[data-list-button]')?.addEventListener('click', () => {
    const fragment = document.createDocumentFragment();
    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
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
        fragment.appendChild(element);
    }

    document.querySelector('[data-list-items]')?.appendChild(fragment);
    page += 1;
});


document.querySelector('[data-list-button]').addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    document.querySelector('[data-list-items]').appendChild(fragment)
    page += 1
})

document.querySelector('[data-list-items]').addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        document.querySelector('[data-list-active]').open = true
        document.querySelector('[data-list-blur]').src = active.image
        document.querySelector('[data-list-image]').src = active.image
        document.querySelector('[data-list-title]').innerText = active.title
        document.querySelector('[data-list-subtitle]').innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        document.querySelector('[data-list-description]').innerText = active.description
    }
})