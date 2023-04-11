import PixabayApi from './pixabayApi';
import { Notify } from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import createGalleryCards from '../templates/gallery-card.hbs';

import 'simplelightbox/dist/simple-lightbox.min.css';

const galleryListEl = document.querySelector('.gallery');
const searchFormEl = document.querySelector('.search-form');
const scrollTargetEl = document.querySelector('.target-element');

const pixabayApiInstance = new PixabayApi();
let lightboxRef;

const options = {
  rootMargin: '200px',
  root: null,
  threshold: 1.0,
};

const observer = new IntersectionObserver(entries => {
  entries.forEach(async entry => {
    if (entry.isIntersecting) {
      pixabayApiInstance.page += 1;

      try {
        const {
          data: { hits, totalHits },
        } = await pixabayApiInstance.fetchPhotos();

        galleryListEl.insertAdjacentHTML('beforeend', createGalleryCards(hits));
        lightboxRef.refresh();

        const { height: cardHeight } = document
          .querySelector('.gallery')
          .firstElementChild.getBoundingClientRect();

        window.scrollBy({
          top: cardHeight * 2,
          behavior: 'smooth',
        });

        if (
          pixabayApiInstance.page >=
          totalHits / pixabayApiInstance.itemsPerPage
        ) {
          observer.unobserve(scrollTargetEl);

          throw new Error(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }
      } catch ({ message }) {
        Notify.info(message);
      }
    }
  });
}, options);

const handleSearchFormSubmit = async event => {
  event.preventDefault();

  const searchInputRef = event.target.elements.searchQuery;

  const searchQuery = searchInputRef.value.trim();

  searchInputRef.value = '';

  if (pixabayApiInstance.query === searchQuery || searchQuery === '') {
    return;
  }

  pixabayApiInstance.query = searchQuery;
  pixabayApiInstance.page = 1;

  try {
    const {
      data: { hits, totalHits },
    } = await pixabayApiInstance.fetchPhotos();

    if (!hits.length) {
      throw new Error(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    Notify.success(`Hooray! We found ${totalHits} images.`);

    galleryListEl.innerHTML = createGalleryCards(hits);

    observer.observe(scrollTargetEl);

    lightboxRef = new SimpleLightbox('.gallery a');
  } catch ({ message }) {
    Notify.failure(message);
  }
};

searchFormEl.addEventListener('submit', handleSearchFormSubmit);
