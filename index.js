const searchBar = document.getElementById('search-input');
const mainIconContainer = document.getElementById('icon-container-inner');
const filmContainer = document.getElementById('film-container');

const handleSearchBtnClick = function () {
    const searchBtn = document.getElementById('search-btn');

    if (!searchBtn) return;

    searchBtn.addEventListener('click', function () {
        getSeachInput();
    });

    searchBar.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            getSeachInput();
        }
    })
}
handleSearchBtnClick();


const getSeachInput = function () {
    const inputVal = searchBar.value;
    checkForValidInput(inputVal);
}

const checkForValidInput = function (input) {
    if (!input) {
        mainIconContainer.classList.add('hidden');
        if (!document.getElementById('error-message')) {
            displayErrorMessage();
        }
        return;
    }

    getFilmData(input)
}

const displayErrorMessage = function () {
    const html = `<p class="error-message" id="error-message">
    Unable to find what you're looing for.Please try another search.
    </p>`;
    mainIconContainer.insertAdjacentHTML('afterend', html);
}

const getFilmData = function (title) {
    let apiDataArr = [];
    fetch(`https://www.omdbapi.com/?&apikey=19c81bea&s=${title}&type=movie`)
        .then(res => res.json())
        .then(data => {
            if (data.Response === 'False') {
                checkForValidInput();
                return;
            }

            clearFilmContainer();

            const promises = data.Search.map(film => {
                return fetch(`https://www.omdbapi.com/?&apikey=19c81bea&i=${film.imdbID}&type=movie&plot=short`)
                    .then(res => res.json())
                    .then(data => {
                        apiDataArr.push(data);
                    })
            });

            Promise.all(promises).then(() => {
                apiDataArr = apiDataArr.filter(film => {
                    const keys = ['Poster', 'Title', 'imdbRating', 'Runtime', 'Genre', 'Plot'];
                    return !keys.some(key => film[key] === 'N/A');
                });

                apiDataArr.forEach(film => {
                    // console.log(apiDataArr);
                    const filmHtml = createFilmMarkup(film);
                    renderFilms(filmHtml);
                })
                handleReadMoreBtnClick();
                handleAddToWatchlistBtnClick(apiDataArr);
            });
        })
}

const clearFilmContainer = function () {
    filmContainer.innerHTML = '';
}

const controlTextLength = function (text, maxLength, id) {
    if (text.length > maxLength) {
        const shortText = text.substring(0, maxLength - 3);
        const truncatedText = shortText + '...';
        const fullText = text;
        return `<span class="truncated-text" data-truncated-text-id="${id}">${truncatedText}</span>
                <span class="full-text hidden" data-full-text-id="${id}">${fullText}</span> 
                <button class="read-more" data-btn-id="${id}">Read more</button>
                `;
    } else {
        return text;
    }
}

const handleReadMoreBtnClick = function () {
    const readMoreBtns = document.querySelectorAll('.read-more');
    readMoreBtns.forEach(readMoreBtn => {
        readMoreBtn.addEventListener('click', function () {
            const imdbID = this.getAttribute('data-btn-id');
            const textInteractionBtn =
                document.querySelector(`[data-btn-id="${imdbID}"]`);
            const truncatedTextElement =
                document.querySelector(`[data-truncated-text-id="${imdbID}"]`);
            const fullTextElement = document.querySelector(`[data-full-text-id="${imdbID}"]`);

            truncatedTextElement.classList.toggle('hidden');
            fullTextElement.classList.toggle('hidden');

            if (fullTextElement.classList.contains('hidden')) {
                textInteractionBtn.textContent = 'Read more';
            } else {
                textInteractionBtn.textContent = 'Show less';
            }
        });
    });
}

const showFullText = function () {
    const fullText = document.getElementById('full-text');
    fullText.classList.remove('hidden');
}

const handleAddToWatchlistBtnClick = function (filmArr) {
    const addToWatchlistBtns = document.querySelectorAll('.add-btn');
    addToWatchlistBtns.forEach(addBtn => {
        addBtn.addEventListener('click', function () {
            const imdbID = this.getAttribute('data-add-btn-id');
            const [selectedFilm] = filmArr.filter(film => film.imdbID === imdbID);
            addFilmToLocalStorage(selectedFilm);
        });
    });
}

const addFilmToLocalStorage = function (filmObj) {
    let films = localStorage.getItem('films');

    films = films ? JSON.parse(films) : [];

    if (!films.some(film => film.imdbID === filmObj.imdbID)) {
        const newFilm = filmObj;
        films.unshift(newFilm);
    } else {
        console.log('Film ist bereits in der Liste!')
    }

    localStorage.setItem('films', JSON.stringify(films));
}

const createFilmMarkup = function (film, buttonIcon='plus') {
    const html = `
            <article class="film">
                <img src="${film.Poster}" class="film-img">
                    <div class="film-info">
                        <div class="film-header-info">
                            <h2>${film.Title}</h2>
                            <p>⭐${film.imdbRating}</p>
                        </div>
                        <div class="film-interaction">
                            <p>${film.Runtime}</p>
                            <p>${film.Genre}</p>
                            <button class="add-btn" data-add-btn-id="${film.imdbID}">
                                <i class="fa-solid fa-circle-${buttonIcon}"></i> 
                                <span>Watchlist</span>
                            </button>
                        </div>
                        <p class="film-description">${controlTextLength(film.Plot, 100, film.imdbID)}</p>
                    </div>
        </article>
        `;
    return html;
}

const renderFilms = function (markup) {
    const mainContainer = document.getElementById('main-content');
    const iconContainerOuter = document.getElementById('main-icon-container-outer');

    mainContainer.classList.add('has-movies');
    iconContainerOuter.classList.add('hidden');
    filmContainer.classList.add('film-container')

    filmContainer.insertAdjacentHTML('beforeend', markup);
}

export { createFilmMarkup, renderFilms, filmContainer, handleReadMoreBtnClick };