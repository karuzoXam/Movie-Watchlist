import { createFilmMarkup, renderFilms, filmContainer, handleReadMoreBtnClick } from '/index.js';

const getFilmsFromLocalStorage = function () {
    return JSON.parse(localStorage.getItem('films')) || [];
};

const removeFilmFromLocalStorage = function (film) {
    const filmArr = getFilmsFromLocalStorage();
    const updatedFilmArr = filmArr.filter(f => f.imdbID !== film.imdbID);
    localStorage.setItem('films', JSON.stringify(updatedFilmArr));
};

const renderFilm = function (film) {
    const filmHtml = createFilmMarkup(film, 'minus');
    renderFilms(filmHtml);

    const removeBtn = document.querySelector(`.add-btn[data-add-btn-id="${film.imdbID}"]`);
    if (removeBtn) {
        removeBtn.addEventListener('click', function () {
            removeFilmFromLocalStorage(film);
            renderFilmsInWatchlist();
        });
    }
};

const renderFilmsInWatchlist = function () {
    const mainContainer = document.getElementById('main-content');
    const iconContainerOuter = document.getElementById('main-icon-container-outer');
    const filmArr = getFilmsFromLocalStorage();

    if (filmArr.length === 0) {
        mainContainer.classList.remove('has-movies');
        iconContainerOuter.classList.remove('hidden');
        filmContainer.classList.remove('film-container')
    }

    filmContainer.innerHTML = '';
    filmArr.forEach(renderFilm);


};

renderFilmsInWatchlist();
handleReadMoreBtnClick();