document.addEventListener("DOMContentLoaded", function() {
  const main = document.querySelector('main');  // main object for referencing main markup in index.html
  const form = document.querySelector('form');  // form object for referencing form markup in index.html
  const popularGenres = ['fiction', 'nonfiction', 'mystery', 'romance', 'thriller', 'fantasy', 'science_fiction', 'history', 'biography', 'business', 'self-help', 'horror', 'comics', 'young_adult', 'children', 'travel', 'poetry', 'cooking', 'art', 'music', 'sports', 'religion', 'philosophy', 'science', 'nature', 'technology'];  // popularGenres hardcoded array used for randomizing displayed genres on Home Page

  const resultLimit = 15;  // access point to change results limit across all website fetches
  
  // function renders a 'bookshelf' containing a horizontally scrollable lineup of book covers fetched based on the genre passed into the function
  function createGenreSection(genre) {
    // create a div object with class named "genre + (passed genre)"
    const genreDiv = document.createElement('div');
    genreDiv.classList.add('genre', genre);
    // create a heading object where the text is the passed genre
    const titleHead = document.createElement('p');
    titleHead.textContent = genre.charAt(0).toUpperCase() + genre.slice(1).replace('_', ' ');
    // create a div object with class named "scrolling-wrapper"
    const scrollingWrapperDiv = document.createElement('div');
    scrollingWrapperDiv.classList.add('scrolling-wrapper');
    // create a div object with class named "bookshelf"
    const booksDiv = document.createElement('div');
    booksDiv.classList.add('bookshelf');
    
    // append objects to html markup to render them
    scrollingWrapperDiv.appendChild(booksDiv);
    genreDiv.appendChild(titleHead);
    genreDiv.appendChild(scrollingWrapperDiv);
    main.appendChild(genreDiv);

    // fetch a list of books based on passed genre
    fetch(`https://openlibrary.org/subjects/${genre}.json?limit=${resultLimit}`)
      .then(response => response.json())
      .then(data => {
        data.works.forEach(work => {
          // loop through each book, creating and appending a book div with cover img and name
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

  // roll for 5 random unique genres from prebuilt array and store in separate array
  const randomGenres = [];
  for (let i = 0; i < 5; i++) {
    const index = Math.floor(Math.random() * popularGenres.length);
    const genre = popularGenres.splice(index, 1)[0];
    randomGenres.push(genre);
  }
  // render each horizontally scrollable genre lineup for each randomly chosen genre
  randomGenres.forEach(genre => createGenreSection(genre));

  // allow logo to be clicked, overwriting main markup with previously selected random genres
  const logo = document.querySelector('.logo');
  logo.addEventListener("click", function() {
    main.innerHTML = '';
    randomGenres.forEach(genre => createGenreSection(genre));
  });

  // event listener to know when a search has been submitted and to then perform search function
  form.addEventListener('submit', async function(event) {
    event.preventDefault();  // prevents page redirection

    // stores search key as well as selected search type
    const type = document.querySelector('#headerSelect').value;
    const searchKey = document.querySelector('#headerSearch').value;
    let response;
    let data;

    // creates result listing of fetched books when selected search type is 'title', overwriting main
    if (type === 'title') {
      response = await fetch(`https://openlibrary.org/search.json?title=${searchKey}&limit=${resultLimit}`);
      data = await response.json();
      main.innerHTML = '';
      if (data.numFound > 0) {
        let html = '';
        for (let i = 0; (i < resultLimit && i < data.numFound); i++) {
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
              <div class="result-text">
              <p class="result-title">${book.title}</p>
              <p>By: ${book.author_name.join(', ')}</p>`
          if (detail.description && detail.description.value) {
            html += `<p style="white-space: pre-wrap;">${detail.description.value}</p>`;
          } else {
            html += `<p style="white-space: pre-wrap;">${detail.description || 'No biography available.'}</p>`;
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

    // creates result listing of fetched authors when selected search type is 'author', overwriting main
    if (type === 'author') {
      response = await fetch(`https://openlibrary.org/search/authors.json?q=${searchKey}&limit=${resultLimit}`);
      data = await response.json();
      main.innerHTML = '';
      if (data.numFound > 0) {
        let html = '';
        for (let i = 0; (i < resultLimit && i < data.numFound); i++) {
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
              <div class="result-text">
              <p class="result-title">${detail.name}</p>
              <p>Born: ${detail.birth_date} ${detail.death_date ? `, Died: ${detail.death_date}` : ''}</p>
              <p>Top Work: ${author.top_work}</p>`
          if (detail.bio && detail.bio.value) {
            html += `<p style="white-space: pre-wrap;">${detail.bio.value}</p>`;
          } else {
            html += `<p style="white-space: pre-wrap;">${detail.bio || 'No biography available.'}</p>`;
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

    // creates result listing of fetched books when selected search type is 'subject', overwriting main
    if (type === 'subject') {
      response = await fetch(`https://openlibrary.org/search.json?subject=${searchKey}&limit=${resultLimit}`);
      data = await response.json();
      main.innerHTML = '';
      if (data.numFound > 0) {
        let html = '';
        for (let i = 0; (i < resultLimit && i < data.numFound); i++) {
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
              <div class="result-text">
              <p class="result-title">${book.title}</p>
              <p>By: ${book.author_name.join(', ')}</p>`
          if (detail.description && detail.description.value) {
            html += `<p style="white-space: pre-wrap;">${detail.description.value}</p>`;
          } else {
            html += `<p style="white-space: pre-wrap;">${detail.description || 'No biography available.'}</p>`;
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