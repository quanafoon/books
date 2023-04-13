document.addEventListener("DOMContentLoaded", function() {
  const main = document.querySelector('main');
  const form = document.querySelector('form');
  const popularGenres = ['fiction', 'nonfiction', 'mystery', 'romance', 'thriller', 'fantasy', 'science_fiction', 'history', 'biography', 'business', 'self-help', 'horror', 'comics', 'young_adult', 'children', 'travel', 'poetry', 'cooking', 'art', 'music', 'sports', 'religion', 'philosophy', 'science', 'nature', 'technology'];

  function createGenreSection(genre) {
    const genreDiv = document.createElement('div');
    genreDiv.classList.add('genre', genre);
    const titleH2 = document.createElement('h2');
    titleH2.textContent = genre.charAt(0).toUpperCase() + genre.slice(1).replace('_', ' ');
    const scrollingWrapperDiv = document.createElement('div');
    scrollingWrapperDiv.classList.add('scrolling-wrapper');
    const booksDiv = document.createElement('div');
    booksDiv.classList.add('bookshelf');
    scrollingWrapperDiv.appendChild(booksDiv);
    genreDiv.appendChild(titleH2);
    genreDiv.appendChild(scrollingWrapperDiv);
    main.appendChild(genreDiv);

    fetch(`https://openlibrary.org/subjects/${genre}.json?limit=10`)
      .then(response => response.json())
      .then(data => {
        data.works.forEach(work => {
          const bookDiv = document.createElement('div');
          bookDiv.classList.add('book');
          const coverImg = document.createElement('img');
          if (work.cover_id) {
            coverImg.src = `https://covers.openlibrary.org/b/id/${work.cover_id}-M.jpg`;
          } else {
            coverImg.src = 'https://via.placeholder.com/150x225?text=No+Image+Available';
          }
          const titleP = document.createElement('p');
          titleP.textContent = work.title;
          bookDiv.appendChild(coverImg);
          bookDiv.appendChild(titleP);
          booksDiv.appendChild(bookDiv);
        });
      })
      .catch(error => console.error(error));
  }

  const randomGenres = [];
  for (let i = 0; i < 5; i++) {
    const index = Math.floor(Math.random() * popularGenres.length);
    const genre = popularGenres.splice(index, 1)[0];
    randomGenres.push(genre);
  }
  randomGenres.forEach(genre => createGenreSection(genre));

  const logo = document.querySelector('.logo');
  logo.addEventListener("click", function() {
    main.innerHTML = '';
    randomGenres.forEach(genre => createGenreSection(genre));
  });

  form.addEventListener('submit', async function(event) {
    event.preventDefault();

    const type = document.querySelector('#headerSelect').value;
    const searchKey = document.querySelector('#headerSearch').value;
    let response;
    let data;

    if (type === 'title') {
      response = await fetch(`https://openlibrary.org/search.json?title=${searchKey}&limit=10`);
      data = await response.json();
      main.innerHTML = '';
      if (data.numFound > 0) {
        let html = '';
        for (let i = 0; (i < 10 && i < data.numFound); i++) {
          const book = data.docs[i];
          let works = await fetch(`https://openlibrary.org${book.key}.json`);
          let detail = await works.json();
          html += `
              <div class="result-card">`
          if (book.cover_i) {
            html += `<img src="http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="Book Cover">`
          } else {
            html += `<img src="https://via.placeholder.com/150x225?text=No+Image+Available" alt="Book Cover">`
          }
          html += `
              <div>
              <h3>${book.title}</h3>
              <p>By: ${book.author_name.join(', ')}</p>`
          if (detail.description && detail.description.value) {
            html += `<p>${detail.description.value}</p>`;
          } else {
            html += `<p>${detail.description || 'No biography available.'}</p>`;
          }
          html += `
            </div>
            </div>
            `;
        }
        // create a container element to hold the book cards
        const container = document.createElement('div');
        container.classList.add('result-container');
        container.innerHTML = html;
        main.appendChild(container);
      } else {
        main.innerHTML = '<p>No results found.</p>';
      }
    }

    if (type === 'author') {
      response = await fetch(`https://openlibrary.org/search/authors.json?q=${searchKey}&limit=10`);
      data = await response.json();
      main.innerHTML = '';
      if (data.numFound > 0) {
        let html = '';
        for (let i = 0; (i < 10 && i < data.numFound); i++) {
          const author = data.docs[i];
          let authorInfo = await fetch(`https://openlibrary.org/authors/${author.key}.json`);
          let detail = await authorInfo.json();
          html += `
              <div class="result-card">`
          if (detail.photos) {
            html += `<img src="https://covers.openlibrary.org/a/id/${detail.photos[0]}-M.jpg" alt="Author Photo">`
          } else {
            html += `<img src="https://via.placeholder.com/150x225?text=No+Image+Available" alt="Author Photo">`
          }
          html += `
              <div>
              <h3>${detail.name}</h3>
              <p>Born: ${detail.birth_date} ${detail.death_date ? `, Died: ${detail.death_date}` : ''}</p>`
          if (detail.bio && detail.bio.value) {
            html += `<p>${detail.bio.value}</p>`;
          } else {
            html += `<p>${detail.bio || 'No biography available.'}</p>`;
          }
          html += `
            </div>
            </div>
            `;
        }
        // create a container element to hold the book cards
        const container = document.createElement('div');
        container.classList.add('result-container');
        container.innerHTML = html;
        main.appendChild(container);
      } else {
        main.innerHTML = '<p>No results found.</p>';
      }
    }

    if (type === 'subject') {
      response = await fetch(`https://openlibrary.org/search.json?subject=${searchKey}&limit=10`);
      data = await response.json();
      main.innerHTML = '';
      if (data.numFound > 0) {
        let html = '';
        for (let i = 0; (i < 10 && i < data.numFound); i++) {
          const book = data.docs[i];
          let works = await fetch(`https://openlibrary.org${book.key}.json`);
          let detail = await works.json();
          html += `
              <div class="result-card">`
          if (book.cover_i) {
            html += `<img src="http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg" alt="Book Cover">`
          } else {
            html += `<img src="https://via.placeholder.com/150x225?text=No+Image+Available" alt="Book Cover">`
          }
          html += `
              <div>
              <h3>${book.title}</h3>
              <p>By: ${book.author_name.join(', ')}</p>`
          if (detail.description && detail.description.value) {
            html += `<p>${detail.description.value}</p>`;
          } else {
            html += `<p>${detail.description || 'No biography available.'}</p>`;
          }
          html += `
            </div>
            </div>
            `;
        }
        // create a container element to hold the book cards
        const container = document.createElement('div');
        container.classList.add('result-container');
        container.innerHTML = html;
        main.appendChild(container);
      } else {
        main.innerHTML = '<p>No results found.</p>';
      }
    }
  });
});