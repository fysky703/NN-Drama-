
  let movies = []; // ✅ Global variable

// ឧទាហរណ៍ Load តាម localStorage ឬ Fetch JSON
// Example:
movies = JSON.parse(localStorage.getItem('movies')) || [];
  const GITHUB_API = 'https://api.github.com';
const REPO = 'fysky703/admin-dashboard-data';
const PATH = 'movie.json';
const BRANCH = 'main';
const TOKEN = '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';
  document.addEventListener('DOMContentLoaded', () => {
            // --- DATA ---
            let movies = [
                { "id": 1, "title": "Inception", "posterUrl": "https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg", "genre": "Sci-Fi", "year": 2010, "description": "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", "rating": 8.8, "featured": true, "top": true },
                { "id": 2, "title": "The Dark Knight", "posterUrl": "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg", "genre": "Action", "year": 2008, "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", "rating": 9.0, "featured": true, "top": true },
                { "id": 3, "title": "Pulp Fiction", "posterUrl": "https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg", "genre": "Drama", "year": 1994, "description": "The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.", "rating": 8.9, "featured": false, "top": false },
                { "id": 4, "title": "The Matrix", "posterUrl": "https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", "genre": "Sci-Fi", "year": 1999, "description": "A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.", "rating": 8.7, "featured": true, "top": false },
                { "id": 5, "title": "Spirited Away", "posterUrl": "https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNWRhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", "genre": "Animation", "year": 2001, "description": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.", "rating": 8.6, "featured": false, "top": true },
                { "id": 6, "title": "The Silence of the Lambs", "posterUrl": "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", "genre": "Thriller", "year": 1991, "description": "A young F.B.I. cadet must receive the help of an incarcerated and manipulative cannibal killer to help catch another serial killer, a madman who skins his victims.", "rating": 8.6, "featured": false, "top": false },
                 { "id": 7, "title": "Forrest Gump", "posterUrl": "https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg", "genre": "Romance", "year": 1994, "description": "The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75.", "rating": 8.8, "featured": true, "top": false },
                { "id": 8, "title": "Se7en", "posterUrl": "https://m.media-amazon.com/images/M/MV5BOTUwODM5MTctZjczMi00OTk4LTg3NWUtNmVhMTAzNTNjYjcyXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", "genre": "Mystery", "year": 1995, "description": "Two detectives, a rookie and a veteran, hunt a serial killer who uses the seven deadly sins as his motives.", "rating": 8.6, "featured": false, "top": true },
                { "id": 9, "title": "The Lord of the Rings", "posterUrl": "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg", "genre": "Fantasy", "year": 2001, "description": "A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.", "rating": 8.8, "featured": true, "top": true }
            ];

            // State variables
            let currentFilter = 'All';
            let deleteTimeout;
            let movieToDeleteId = null;
            let movieToEditId = null;

            // --- DOM Elements ---
            const bodyEl = document.body;
            const movieListEl = document.getElementById('movie-list');
            const adminMovieListEl = document.getElementById('admin-movie-list');
            const genreFiltersEl = document.getElementById('genre-filters');
            
            const addMovieModal = document.getElementById('addMovieModal');
            const addMovieModalContent = document.getElementById('addMovieModalContent');
            const adminPanelModal = document.getElementById('adminPanelModal');
            const adminPanelContent = document.getElementById('adminPanelContent');

            const openAddMovieModalBtn = document.getElementById('openAddMovieModalBtn');
            const closeAddMovieModalBtn = document.getElementById('closeAddMovieModalBtn');
            const cancelAddMovieBtn = document.getElementById('cancelAddMovieBtn');
            const openAdminPanelBtn = document.getElementById('openAdminPanelBtn');
            const closeAdminPanelBtn = document.getElementById('closeAdminPanelBtn');
            const undoDeleteBtn = document.getElementById('undoDeleteBtn');
            
            const adminSearchInput = document.getElementById('adminSearchInput');
            const addMovieForm = document.getElementById('addMovieForm');
            const modalTitle = document.getElementById('modalTitle');
            const submitBtn = document.getElementById('submitBtn');
            const genreSelect = document.getElementById('genre');
            const posterUrlInput = document.getElementById('posterUrl');
            const posterPreview = document.getElementById('posterPreview');

            const deleteToast = document.getElementById('deleteToast');
            
            // --- RENDER FUNCTIONS ---
            const renderMovies = () => {
                movieListEl.innerHTML = '';
                const filteredMovies = movies.filter(movie => currentFilter === 'All' || movie.genre === currentFilter);
                if(filteredMovies.length === 0) {
                    movieListEl.innerHTML = `<p class="col-span-full text-center text-gray-500">No movies found for this genre.</p>`;
                    return;
                }
                filteredMovies.forEach(movie => {
                    const card = document.createElement('div');
                    card.className = 'group relative aspect-[2/3] bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 ease-in-out hover:scale-105 hover:shadow-2xl';
                    card.innerHTML = `
                        <img src="${movie.posterUrl}" alt="${movie.title}" class="w-full h-full object-cover" onerror="this.onerror=null;this.src='https://placehold.co/300x450/1f2937/a78bfa?text=Not+Found';">
                        <div class="absolute bottom-0 left-0 right-0 h-[15%] bg-black/60 backdrop-blur-sm p-2 flex items-center justify-center transition-all duration-300 ease-in-out group-hover:h-[25%]">
                            <h3 class="text-white text-sm font-bold text-center truncate">${movie.title}</h3>
                        </div>`;
                    movieListEl.appendChild(card);
                });
            };

            const renderAdminList = (searchTerm = '') => {
                adminMovieListEl.innerHTML = '';
                const lowerCaseSearchTerm = searchTerm.toLowerCase();

                const filteredMovies = movies.filter(movie =>
                    movie.title.toLowerCase().includes(lowerCaseSearchTerm)
                );

                if(filteredMovies.length === 0) {
                    adminMovieListEl.innerHTML = `<p class="text-center text-gray-500">No matching movies found.</p>`;
                    return;
                }

                const sortedMovies = [...filteredMovies].sort((a, b) => a.title.localeCompare(b.title));
                
                sortedMovies.forEach(movie => {
                    const item = document.createElement('div');
                    item.className = 'bg-gray-700/50 p-4 rounded-lg flex items-center justify-between';
                    item.innerHTML = `
                        <div class="flex items-center space-x-4 overflow-hidden">
                            <img src="${movie.posterUrl}" class="w-12 h-16 object-cover rounded flex-shrink-0" onerror="this.onerror=null;this.src='https://placehold.co/48x64/374151/a78bfa?text=N/A';">
                            <div class="overflow-hidden">
                                <p class="font-bold text-white truncate">${movie.title} (${movie.year})</p>
                                <p class="text-sm text-gray-400">${movie.genre}</p>
                            </div>
                        </div>
                        <div class="flex space-x-2 flex-shrink-0">
                            <button class="edit-btn p-2 rounded-md bg-blue-600/50 hover:bg-blue-600 transition" data-id="${movie.id}">Edit</button>
                            <button class="delete-btn p-2 rounded-md bg-red-600/50 hover:bg-red-600 transition" data-id="${movie.id}">Delete</button>
                        </div>`;
                    adminMovieListEl.appendChild(item);
                });
                adminMovieListEl.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', handleDeleteClick));
                adminMovieListEl.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', handleEditClick));
            };

            const renderGenreFilters = () => {
                const genres = ['All', ...new Set(movies.map(m => m.genre))].sort();
                genreFiltersEl.innerHTML = '';
                // Ensure 'All' is always first
                const allIndex = genres.indexOf('All');
                if (allIndex > -1) {
                    genres.splice(allIndex, 1);
                    genres.unshift('All');
                }

                genres.forEach(genre => {
                    const button = document.createElement('button');
                    button.textContent = genre;
                    button.className = `px-4 py-2 text-sm font-medium rounded-full transition-colors duration-300 whitespace-nowrap ${currentFilter === genre ? 'bg-green-600 text-white shadow-md' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`;
                    button.onclick = () => {
                        currentFilter = genre;
                        renderGenreFilters();
                        renderMovies();
                    };
                    genreFiltersEl.appendChild(button);
                });
            };
            
            // --- EVENT HANDLERS ---
            
            const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = {
        title: document.getElementById('title').value.trim(),
        posterUrl: document.getElementById('posterUrl').value,
        genre: document.getElementById('genre').value,
        year: parseInt(document.getElementById('year').value),
        description: document.getElementById('description').value,
        rating: parseFloat(document.getElementById('rating').value),
        featured: document.getElementById('featured').checked,
        top: document.getElementById('top').checked,
    };
    
    if (!formData.title || !formData.genre) {
        alert('Title and Genre are required.');
        return;
    }
    
    if (movieToEditId) {
        const movieIndex = movies.findIndex(m => m.id === movieToEditId);
        if (movieIndex !== -1) {
            movies[movieIndex] = { ...movies[movieIndex], ...formData };
        }
    } else {
        const newMovie = { id: Date.now(), ...formData };
        movies.unshift(newMovie);
    }
    
    closeAddMovieModal();
    renderAll();
    commitMoviesToGitHub(); // ✅ CALL នៅទីនេះ!
};
    
        const handleEditClick = (e) => {
                movieToEditId = parseInt(e.target.dataset.id);
                const movie = movies.find(m => m.id === movieToEditId);
                if (movie) {
                    closeAdminPanel();
                    setTimeout(() => {
                        openAddMovieModal(movie);
                    }, 300);
                }
            };
            
            const handleDeleteClick = (e) => {
                movieToDeleteId = parseInt(e.target.dataset.id);
                showDeleteToast();
                deleteTimeout = setTimeout(performDelete, 5000);
            };
            
            
            
            const performDelete = () => {
              if (movieToDeleteId === null) return;

              movies = movies.filter(m => m.id !== movieToDeleteId);
              movieToDeleteId = null;

              hideDeleteToast();
              renderAll();

              commitMoviesToGitHub(); // ✅ CALL function commit JSON ទៅ GitHub
                 };
            const handleUndoDelete = () => {
                clearTimeout(deleteTimeout);
                movieToDeleteId = null;
                hideDeleteToast();
            };
            
            // --- UI FUNCTIONS ---
            const openAddMovieModal = (movie = null) => {
                bodyEl.classList.add('modal-open');
                addMovieForm.reset();
                genreSelect.value = "";
                genreSelect.classList.add('placeholder');
                posterPreview.classList.add('hidden');

                if (movie) {
                    modalTitle.textContent = 'Edit Movie';
                    submitBtn.textContent = 'Save Changes';
                    document.getElementById('title').value = movie.title;
                    document.getElementById('posterUrl').value = movie.posterUrl;
                    document.getElementById('genre').value = movie.genre;
                    document.getElementById('year').value = movie.year;
                    document.getElementById('rating').value = movie.rating;
                    document.getElementById('description').value = movie.description;
                    document.getElementById('featured').checked = movie.featured;
                    document.getElementById('top').checked = movie.top;
                    if(movie.genre) genreSelect.classList.remove('placeholder');
                    if(movie.posterUrl) {
                        posterPreview.src = movie.posterUrl;
                        posterPreview.classList.remove('hidden');
                    }
                } else {
                    movieToEditId = null;
                    modalTitle.textContent = 'Add New Movie';
                    submitBtn.textContent = 'Add Movie';
                }
                addMovieModal.classList.remove('hidden');
                setTimeout(() => addMovieModalContent.classList.remove('fade-out'), 10);
            };

            const closeAddMovieModal = () => {
                bodyEl.classList.remove('modal-open');
                addMovieModalContent.classList.add('fade-out');
                setTimeout(() => {
                    addMovieModal.classList.add('hidden');
                    addMovieForm.reset();
                    genreSelect.classList.add('placeholder');
                    movieToEditId = null;
                }, 300);
            };

            const openAdminPanel = () => {
                bodyEl.classList.add('modal-open');
                adminSearchInput.value = '';
                renderAdminList();
                adminPanelModal.classList.remove('hidden');
                setTimeout(() => adminPanelContent.classList.remove('fade-out'), 10);
            };

            const closeAdminPanel = () => {
                bodyEl.classList.remove('modal-open');
                adminPanelContent.classList.add('fade-out');
                setTimeout(() => adminPanelModal.classList.add('hidden'), 300);
            };
            
            const showDeleteToast = () => deleteToast.classList.remove('hidden');
            const hideDeleteToast = () => deleteToast.classList.add('hidden');

            genreSelect.addEventListener('change', () => {
                if(genreSelect.value === "") {
                    genreSelect.classList.add('placeholder');
                } else {
                    genreSelect.classList.remove('placeholder');
                }
            });

            posterUrlInput.addEventListener('input', (e) => {
                const url = e.target.value;
                if (url) {
                    posterPreview.src = url;
                    posterPreview.classList.remove('hidden');
                } else {
                    posterPreview.classList.add('hidden');
                }
            });

            posterPreview.onerror = () => {
                posterPreview.src = 'https://placehold.co/300x450/ef4444/ffffff?text=Invalid+URL';
                posterPreview.classList.remove('hidden');
            };
            
            // --- EVENT LISTENERS ---
            adminSearchInput.addEventListener('input', () => {
                renderAdminList(adminSearchInput.value);
            });

            openAddMovieModalBtn.addEventListener('click', () => openAddMovieModal());
            closeAddMovieModalBtn.addEventListener('click', closeAddMovieModal);
            cancelAddMovieBtn.addEventListener('click', closeAddMovieModal);
            addMovieModal.addEventListener('click', (e) => { if (e.target === addMovieModal) closeAddMovieModal(); });

            openAdminPanelBtn.addEventListener('click', openAdminPanel);
            closeAdminPanelBtn.addEventListener('click', closeAdminPanel);
            adminPanelModal.addEventListener('click', (e) => { if (e.target === adminPanelModal) closeAdminPanel(); });
            
            addMovieForm.addEventListener('submit', handleFormSubmit);
            undoDeleteBtn.addEventListener('click', handleUndoDelete);

            // --- INITIALIZATION ---
            const renderAll = () => {
                renderMovies();
                renderGenreFilters();
                if (!adminPanelModal.classList.contains('hidden')) {
                   renderAdminList(adminSearchInput.value);
                }
            };

            renderAll();
        });
        async function commitMoviesToGitHub() {
  const content = btoa(JSON.stringify(movies, null, 2));

  // STEP 1: Get SHA
  const getRes = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${PATH}`, {
    headers: { 'Authorization': `token ${TOKEN}` }
  });
  const fileData = await getRes.json();

  // STEP 2: PUT updated JSON
  const res = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${PATH}`, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Update movie.json',
      content: content,
      branch: BRANCH,
      sha: fileData.sha
    })
  });

  const data = await res.json();
  console.log('✅ GitHub Commit Response:', data);
}
