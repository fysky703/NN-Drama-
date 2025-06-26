   <script>
        const app = {
            data: { popular: [], trending: [], continue: [], action: [], comedy: [] },
            allContent: [],
            lastActivePage: { id: 'home', categoryName: null, categoryTitle: null },
            isSearchOpen: false,

            playerState: { currentMovieId: null, currentEpisodeIndex: 0, isLocked: false, playOnLoad: false, inactivityTimer: null, HIDE_TIMEOUT_MS: 3000, },
            EPISODES_PER_RANGE: 25, 

            init() {
                this.generateDummyData();
                this.allContent = [ ...this.data.popular, ...this.data.trending, ...this.data.continue, ...this.data.action, ...this.data.comedy ];
                document.addEventListener('DOMContentLoaded', () => {
                    this.buildHomeCarousels();
                    this.setupEventListeners();
                    this.setupSlider();
                    this.setupVideoOverlay(); 
                    this.setupLockToggleFunctionality(); 
                    this.showPage('home');
                });
            },
            
            generateDummyData() {
                this.data.popular = [ { id: 'p1', title: 'ស្ដេចនាគសង្គ្រោះឋានទាំង3', img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEga9fuu6-CIo9xwmiv8ix4YsH0KOOhanVVSI7C_YxlHP-3s8j4vwmdV3zdB5fKdKS7E8IRKnteClKPVTOzikgvy9rcNw4IPDrdoRNp4j_ZML6MFPd1Os60si6Ls1FraS3TIn9G2YUsOWZ2PIuYW3Q3BIrjNEN26giYO6xWV7eJfNXv3pU34pkC18ePyytVq/s800/Tep%20Macha%20Broha%20Vinhean%20Beysach.jpg', year: '2010', episodes: 'Drama', status: 'ongoing', rating: '8.8', likes: '34k', views: '10M', type: '', trailerId: 'YoHD9XEInc0', description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', tags: ['Action', 'Sci-Fi', 'Thriller'], premium: true }, { id: 'p2', title: 'The Dark Knight', img: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', year: '2008', episodes: 'Movie', status: 'Completed', rating: '9.0', likes: '41k', views: '15M', type: 'movie', trailerId: 'yupEwQ6qCd0', description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', tags: ['Action', 'Drama', 'Crime'], premium: true }, { id: 'p3', title: 'The Shawshank Redemption', img: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', year: '1994', episodes: 'Movie', status: 'Completed', rating: '9.3', likes: '45k', views: '18M', type: 'movie', trailerId: '6hB3S9bIaco', description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', tags: ['Drama', 'Crime'], premium: true }, { id: 'p4', title: 'The Godfather', img: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', year: '1972', episodes: 'Movie', status: 'Completed', rating: '9.2', likes: '38k', views: '16M', type: 'movie', trailerId: 'sY1S34973zA', description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', tags: ['Drama', 'Crime'], premium: true }, { id: 'p5', title: 'Pulp Fiction', img: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzrKYOFTl8rD8.jpg', year: '1994', episodes: 'Movie', status: 'Completed', rating: '8.9', likes: '36k', views: '13M', type: 'movie', trailerId: 's7EdQ4FqbhY', description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', tags: ['Crime', 'Thriller'], premium: false }, { id: 'p6', title: 'Forrest Gump', img: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', year: '1994', episodes: 'Movie', status: 'Completed', rating: '8.8', likes: '39k', views: '17M', type: 'movie', trailerId: 'bLvqoHBptjg', description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.', tags: ['Comedy', 'Drama', 'Romance'], premium: false } ];
                this.data.trending = [ { id: 't1', title: 'Dune: Part Two', img: 'https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg', year: '2024', episodes: 'Movie', status: 'Completed', rating: '8.3', likes: '15k', views: '7M', type: 'movie', trailerId: 'U2Qp5pL3ovA', description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.', tags: ['Sci-Fi', 'Adventure'], premium: true }, { id: 't2', title: 'សង្គ្រាម ឋានទាំង3', img: 'https://khflix.com/wp-content/uploads/2024/07/sangkream-than-tang3-khflix.jpg', year: '2011', episodes: 'EP-53 ', status: 'Completed', rating: '8.4', likes: '60k', views: '30M', type: 'series', trailerId: 'KPLWWIO_sbk', description: 'Seven noble families fight for control of the mythical land of Westeros.', tags: ['Fantasy', 'Drama', 'Adventure'], season: '8 Seasons', premium: true }, { id: 't3', title: 'Shōgun', img: 'https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCS2MHE2hS4Y2N3pB.jpg', year: '2024', episodes: '10 EP', status: 'Completed', rating: '8.7', likes: '20k', views: '8M', type: 'series', trailerId: 'g5aom9X5mjs', description: 'When a mysterious European ship is found marooned in a nearby fishing village, Lord Yoshii Toranaga discovers secrets that could tip the scales of power and devastate his enemies.', tags: ['Drama', 'History', 'War'], season: '1 Season', premium: true }, { id: 't4', title: 'Godzilla x Kong', img: 'https://image.tmdb.org/t/p/w500/tMefBSflR6PGsBvUWM5AUR2WxnD.jpg', year: '2024', episodes: 'Movie', status: 'Completed', rating: '6.5', likes: '12k', views: '6M', type: 'movie', trailerId: 'qR_0c2Hq53M', description: 'Two ancient titans, Godzilla and Kong, clash in an epic battle as humans unravel their intertwined origins and connection to Skull Island\'s mysteries.', tags: ['Action', 'Sci-Fi'], premium: false }, { id: 't5', title: 'Fallout', img: 'https://image.tmdb.org/t/p/w500/gO9k7t9JpZ1L1fce1K4eI0o2dve.jpg', year: '2024', episodes: '8 EP', status: 'Completed', rating: '8.2', likes: '18k', views: '7.5M', type: 'series', trailerId: 'V-ugvG1S-T8', description: 'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens must live in underground bunkers to protect themselves from radiation, mutants and bandits.', tags: ['Sci-Fi', 'Action', 'Adventure'], season: '1 Season', premium: true }, { id: 't6', title: 'Kung Fu Panda 4', img: 'https://image.tmdb.org/t/p/w500/kDp1vUB0asd4zqXTFdyJqnG0nAy.jpg', year: '2024', episodes: 'Movie', status: 'Completed', rating: '7.2', likes: '10k', views: '5M', type: 'movie', trailerId: '_inKs45Jo_w', description: 'Po is gearing up to become the spiritual leader of his Valley of Peace, but also needs someone to take his place as Dragon Warrior.', tags: ['Animation', 'Action', 'Comedy'], premium: false } ];
                this.data.continue = [ { id: 'c1', title: 'Breaking Bad', img: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg', year: '2008', episodes: '62 EP', status: 'Completed', rating: '9.5', likes: '55k', views: '20M', type: 'series', trailerId: 'HhesaQXLuRY', description: 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.', tags: ['Crime', 'Drama', 'Thriller'], season: '5 Seasons', premium: true }, { id: 'c2', title: 'Stranger Things', img: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', year: '2016', episodes: '34 EP', status: 'Ongoing', rating: '8.6', likes: '65k', views: '35M', type: 'series', trailerId: 'b9EkMc79ZSU', description: 'When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces, and one strange little girl.', tags: ['Sci-Fi', 'Mystery', 'Horror'], season: '4 Seasons', premium: true }, { id: 'c3', title: 'The Witcher', img: 'https://image.tmdb.org/t/p/w500/cZ0d3rtvXAeGaEDyIFc1Vj2O5gV.jpg', year: '2019', episodes: '24 EP', status: 'Ongoing', rating: '8.2', likes: '48k', views: '25M', type: 'series', trailerId: 'ndl1W4ltcmg', description: 'Geralt of Rivia, a solitary monster hunter, struggles to find his place in a world where people often prove more wicked than beasts.', tags: ['Fantasy', 'Action', 'Adventure'], season: '3 Seasons', premium: true }, { id: 'c4', title: 'Money Heist', img: 'https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg', year: '2017', episodes: '41 EP', status: 'Completed', rating: '8.3', likes: '58k', views: '28M', type: 'series', trailerId: 'ht5_4Q232so', description: 'An unusual group of robbers attempt to carry out the most perfect robbery in Spanish history - stealing 2.4 billion euros from the Royal Mint of Spain.', tags: ['Crime', 'Thriller', 'Action'], season: '5 Parts', premium: true }, { id: 'c5', title: 'Peaky Blinders', img: 'https://image.tmdb.org/t/p/w500/vUUqzSykIBcAwpqCTTimfqL2Ddf.jpg', year: '2013', episodes: '36 EP', status: 'Completed', rating: '8.8', likes: '52k', views: '22M', type: 'series', trailerId: 'RuAGeAiS_4c', description: 'A gangster family epic set in 1900s England, centering on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby.', tags: ['Crime', 'Drama'], season: '6 Seasons', premium: false }, { id: 'c6', title: 'Squid Game', img: 'https://image.tmdb.org/t/p/w500/dDlEsimI32LwHbf2aR5IgrzHw2N.jpg', year: '2021', episodes: '9 EP', status: 'Ongoing', rating: '7.8', likes: '70k', views: '40M', type: 'series', trailerId: 'oq22eI_8zaI', description: 'Hundreds of cash-strapped contestants accept an invitation to compete in children\'s games for a tempting prize, but the stakes are deadly.', tags: ['Action', 'Thriller', 'Mystery'], season: '1 Season', premium: true } ];
                
                this.data.Korean= [ { id: 'z1', title: 'ស្ដេចនាគ សង្គ្រោះឋានទាំង3', img: 'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEga9fuu6-CIo9xwmiv8ix4YsH0KOOhanVVSI7C_YxlHP-3s8j4vwmdV3zdB5fKdKS7E8IRKnteClKPVTOzikgvy9rcNw4IPDrdoRNp4j_ZML6MFPd1Os60si6Ls1FraS3TIn9G2YUsOWZ2PIuYW3Q3BIrjNEN26giYO6xWV7eJfNXv3pU34pkC18ePyytVq/s800/Tep%20Macha%20Broha%20Vinhean%20Beysach.jpg', year: '2010', episodes: 'Movie', status: 'Completed', rating: '8.8', likes: '34k', views: '10M', type: 'movie', trailerId: 'YoHD9XEInc0', description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.', tags: ['Action', 'Sci-Fi', 'Thriller'], premium: true }, { id: 'p2', title: 'The Dark Knight', img: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', year: '2008', episodes: 'Movie', status: 'Completed', rating: '9.0', likes: '41k', views: '15M', type: 'movie', trailerId: 'yupEwQ6qCd0', description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.', tags: ['Action', 'Drama', 'Crime'], premium: true }, { id: 'p3', title: 'The Shawshank Redemption', img: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg', year: '1994', episodes: 'Movie', status: 'Completed', rating: '9.3', likes: '45k', views: '18M', type: 'movie', trailerId: '6hB3S9bIaco', description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.', tags: ['Drama', 'Crime'], premium: true }, { id: 'p4', title: 'The Godfather', img: 'https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg', year: '1972', episodes: 'Movie', status: 'Completed', rating: '9.2', likes: '38k', views: '16M', type: 'movie', trailerId: 'sY1S34973zA', description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.', tags: ['Drama', 'Crime'], premium: true }, { id: 'p5', title: 'Pulp Fiction', img: 'https://image.tmdb.org/t/p/w500/d5iIlFn5s0ImszYzrKYOFTl8rD8.jpg', year: '1994', episodes: 'Movie', status: 'Completed', rating: '8.9', likes: '36k', views: '13M', type: 'movie', trailerId: 's7EdQ4FqbhY', description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.', tags: ['Crime', 'Thriller'], premium: false }, { id: 'p6', title: 'Forrest Gump', img: 'https://image.tmdb.org/t/p/w500/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg', year: '1994', episodes: 'Movie', status: 'Completed', rating: '8.8', likes: '39k', views: '17M', type: 'movie', trailerId: 'bLvqoHBptjg', description: 'The presidencies of Kennedy and Johnson, the Vietnam War, the Watergate scandal and other historical events unfold from the perspective of an Alabama man with an IQ of 75, whose only desire is to be reunited with his childhood sweetheart.', tags: ['Comedy', 'Drama', 'Romance'], premium: false } ];
                this.data.action = [ { id: 'a1', title: 'John Wick', img: 'https://image.tmdb.org/t/p/w500/fZPSd91yGE9fXFwS2sXG7l2AU3e.jpg', year: '2014', episodes: 'Movie', status: 'Completed', rating: '7.4', likes: '25k', views: '9M', type: 'movie', trailerId: 'C0BMx-qxsP4', tags: ['Action', 'Thriller'], premium: false }, { id: 'a2', title: 'Mad Max: Fury Road', img: 'https://image.tmdb.org/t/p/w500/825cWuCFMAbJ6B1M5aLMB4k1row.jpg', year: '2015', episodes: 'Movie', status: 'Completed', rating: '8.1', likes: '30k', views: '12M', type: 'movie', trailerId: 'hEJnMQG9ev8', tags: ['Action', 'Sci-Fi'], premium: true }, { id: 'a3', title: 'The Avengers', img: 'https://image.tmdb.org/t/p/w500/RYMX2wcKCBAr24UyPD7xwmjaTn.jpg', year: '2012', episodes: 'Movie', status: 'Completed', rating: '8.0', likes: '35k', views: '18M', type: 'movie', trailerId: 'eOrNdBpGMv8', tags: ['Action', 'Sci-Fi'], premium: true }, ];
                this.data.comedy = [ { id: 'co1', title: 'The Hangover', img: 'https://image.tmdb.org/t/p/w500/60mDBer3yH020aL1aQp6OKQY9so.jpg', year: '2009', episodes: 'Movie', status: 'Completed', rating: '7.2', likes: '18k', views: '6M', type: 'movie', trailerId: 'tcdUhdOlz9M', tags: ['Comedy'], premium: false }, { id: 'co2', title: 'Superbad', img: 'https://image.tmdb.org/t/p/w500/p1y3iH2nZt3iYmS6q3w42bhaK33.jpg', year: '2007', episodes: 'Movie', status: 'Completed', rating: '7.1', likes: '15k', views: '5M', type: 'movie', trailerId: '4v8KEb1c2rc', tags: ['Comedy'], premium: true } ];
                
                // ✅ Add episodes to Inception (in Popular section)
const inceptionPlaylists = [
  { file: "https://1a-1791.com/video/fww1/b7/s8/2/V/g/E/R/VgERy.aaa.mp4" },
  { file: "https://1a-1791.com/video/fww1/07/s8/2/J/P/Y/R/JPYRy.aaa.mp4" },
  { file: "https://1a-1791.com/video/fww1/1a/s8/2/f/C/b/T/fCbTy.aaa.mp4" },
  // បន្តដល់ចំនួន EP ដែលអ្នកចង់បាន...
];

const ស្ដេចនាគសង្គ្រោះឋានទាំង3Episodes = inceptionPlaylists.map((item, index) => ({
  ep: index + 1,
  url: item.file
}));

const ស្ដេចនាគសង្គ្រោះឋានទាំង3 = this.data.popular.find(m => m.title === 'ស្ដេចនាគសង្គ្រោះឋានទាំង3');

if (ស្ដេចនាគសង្គ្រោះឋានទាំង3) {
  ស្ដេចនាគសង្គ្រោះឋានទាំង3.type = 'series'; // ⛔ ប្ដូរពី 'movie' ទៅជា 'series'
  ស្ដេចនាគសង្គ្រោះឋានទាំង3.episodeCount = ស្ដេចនាគសង្គ្រោះឋានទាំង3Episodes.length;
  ស្ដេចនាគសង្គ្រោះឋានទាំង3.episodesData = ស្ដេចនាគសង្គ្រោះឋានទាំង3Episodes;
}
                const playlists = [ {file: "https://bigf.bigo.sg/asia_live/V4s7/14HJpD.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/14HNun.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0LYUhG.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0GTRgB.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/16JVZo.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/02FDOh.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/05IEI8.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/01EL2O.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/22FcdV.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/2u7WNU.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/11Edym.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0ANdrp.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/2WjEPr.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/21Elia.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/21Encm.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/1LY8sG.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0GTu5N.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0WjFJH.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/1WjQhH.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0WjJHT.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/12G5U7.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0WjQxr.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/04H0Dz.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0u7tyU.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/11FIdO.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/14INvP.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/21FQ6y.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/2Rfi9v.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/1AOQy3.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/15JM9W.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/1GUnfZ.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/04ISz1.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/14IiUD.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/11FicO.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/2LZ8zG.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/1u8iUU.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0WkCpr.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/25NSv8.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/15JyKW.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/12GxvV.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0AOyQp.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0AO0xF.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/16L87E.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0u8oFs.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/22HCS7.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/06K5do.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/01G2hm.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/05K7xK.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/12LSuV.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/2Asjq3.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/1RHFn9.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/0WUz5f.mp4"}, {file: "https://bigf.bigo.sg/asia_live/V4s7/2HMcrB.mp4"} ];
                const gameOfThronesEpisodes = playlists.map((item, index) => ({ ep: index + 1, url: item.file }));
                const got = this.data.trending.find(m => m.id === 't2');
                
                if (got) {
                    got.episodeCount = gameOfThronesEpisodes.length;
                    got.episodesData = gameOfThronesEpisodes;
                }
                [...this.data.popular, ...this.data.trending, ...this.data.continue, ...this.data.action, ...this.data.comedy].forEach(movie => {
                    if (movie.type === 'movie') {
                        movie.videoUrl = "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"; // Generic for all movies
                    }
                });
            },

            createMovieCardHTML(movie) { return `<div class="relative"><img src="${movie.img}" alt="${movie.title}" class="w-full h-auto object-cover aspect-[2/3]" onerror="this.onerror=null;this.src='https://placehold.co/300x450/141414/E50914?text=Error';"><div class="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">${movie.episodes}</div><div class="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">${movie.status}</div></div><div class="p-3"><h4 class="text-white font-bold text-base truncate" title="${movie.title}">${movie.title}</h4><div class="flex justify-between items-center mt-2 text-gray-400 text-xs"><span>${movie.year}</span><div class="flex items-center space-x-2"><div class="flex items-center"><i class="fas fa-heart text-red-500 mr-1"></i><span>${movie.likes}</span></div><div class="flex items-center"><i class="fas fa-eye mr-1"></i><span>${movie.views}</span></div></div><div class="flex items-center"><i class="fas fa-star text-gold mr-1"></i><span class="font-bold">${movie.rating}</span></div></div></div>`; },
            populateGrid(container, movies, isCarousel = false) { if (!container) return; container.innerHTML = ''; movies.forEach(movie => { const cardWrapper = document.createElement('div'); cardWrapper.className = `movie-card bg-[#1A1A1A] rounded-lg overflow-hidden`; if (isCarousel) { cardWrapper.classList.add('flex-shrink-0', 'w-[48%]', 'sm:w-56', 'md:w-64'); } cardWrapper.innerHTML = this.createMovieCardHTML(movie); cardWrapper.onclick = () => this.viewDetails(movie.id); container.appendChild(cardWrapper); }); },
            closeCategoryMenu() { const categoryDropdown = document.getElementById('category-dropdown'); const menuIcon = document.getElementById('menu-toggle-button')?.querySelector('i'); if (categoryDropdown && !categoryDropdown.classList.contains('opacity-0')) { categoryDropdown.classList.add('opacity-0', '-translate-y-full', 'pointer-events-none'); if (menuIcon) { menuIcon.classList.replace('fa-times', 'fa-bars'); } } },

            renderPaginatedGrid(gridContainer, paginationContainer, fullData) { const ITEMS_PER_PAGE = 18; let currentPage = 1; const totalPages = Math.ceil(fullData.length / ITEMS_PER_PAGE); const renderPage = (page) => { currentPage = page; const start = (currentPage - 1) * ITEMS_PER_PAGE; const end = start + ITEMS_PER_PAGE; const pageData = fullData.slice(start, end); this.populateGrid(gridContainer, pageData, false); if(paginationContainer) { paginationContainer.innerHTML = ''; if (totalPages > 1) { const prevBtn = document.createElement('button'); prevBtn.innerHTML = `<i class="fas fa-chevron-left"></i>`; prevBtn.className = 'pagination-btn'; prevBtn.disabled = currentPage === 1; prevBtn.onclick = () => renderPage(currentPage - 1); paginationContainer.appendChild(prevBtn); for (let i = 1; i <= totalPages; i++) { const pageBtn = document.createElement('button'); pageBtn.textContent = i; pageBtn.className = 'pagination-btn'; if (i === currentPage) pageBtn.classList.add('active'); pageBtn.onclick = () => renderPage(i); paginationContainer.appendChild(pageBtn); } const nextBtn = document.createElement('button'); nextBtn.innerHTML = `<i class="fas fa-chevron-right"></i>`; nextBtn.className = 'pagination-btn'; nextBtn.disabled = currentPage === totalPages; nextBtn.onclick = () => renderPage(currentPage + 1); paginationContainer.appendChild(nextBtn); } } window.scrollTo(0, 0); }; renderPage(1); },
            
            showPage(pageId, categoryName = null, categoryTitle = null) {
                document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
                const targetPage = document.getElementById(`page-${pageId}`);
                if (targetPage) targetPage.classList.add('active');

                if (pageId !== 'player') {
                    const videoPlayer = document.getElementById('main-video-player');
                    if (videoPlayer && !videoPlayer.paused) { videoPlayer.pause(); }
                }

                const isPaginatedPage = ['category', 'movies', 'series'].includes(pageId);
                if (isPaginatedPage) {
                    const gridContainer = targetPage.querySelector('.grid, .movie-grid-populate');
                    const paginationContainer = targetPage.querySelector('.pagination-container');
                    let fullData = [];

                    if (pageId === 'category') {
                        const titleElem = document.getElementById('category-page-title');
                        if (titleElem) titleElem.textContent = categoryTitle || categoryName;
                        
                        if (this.data[categoryName]) {
                            fullData = this.data[categoryName];
                        } else {
                            fullData = this.allContent.filter(item => item.tags && item.tags.map(t => t.toLowerCase()).includes(categoryName.toLowerCase())) || [];
                        }

                    } else if (pageId === 'my-list') {
                        document.getElementById('category-page-title').textContent = categoryTitle;
                        fullData = []; 
                    } else { 
                        const type = pageId.slice(0, -1); 
                        fullData = this.allContent.filter(item => item.type === type); 
                    }
                    this.renderPaginatedGrid(gridContainer, paginationContainer, fullData);
                }
                if (!['search-results', 'details', 'player'].includes(pageId)) { this.updateActiveLink(pageId, categoryName); window.scrollTo(0, 0); }
            },
            
            updateActiveLink(pageId, categoryName) { const links = document.querySelectorAll('#category-carousel a'); links.forEach(link => { link.classList.remove('active-link'); const linkPage = link.dataset.page; const linkCategory = link.dataset.category; if (linkPage === pageId && (pageId !== 'category' || linkCategory === categoryName)) { link.classList.add('active-link'); } }); },

            viewDetails(movieId) {
                // ===== FIX: Close search dropdown if it's open =====
                if (this.isSearchOpen) {
                    this.toggleSearch();
                }

                const movie = this.allContent.find(m => m.id === movieId);
                if (!movie) return;
                
                const currentPage = document.querySelector('.page-content.active');
                if (currentPage) { 
                    this.lastActivePage.id = currentPage.id.replace('page-', '');
                    const titleElement = currentPage.querySelector('#category-page-title, h2');
                    this.lastActivePage.categoryTitle = titleElement ? titleElement.textContent : null;
                    if(this.lastActivePage.id === 'category') {
                        this.lastActivePage.categoryName = this.lastActivePage.categoryTitle;
                    } else {
                        this.lastActivePage.categoryName = null;
                    }
                }
                
                const videoContainer = document.getElementById('details-video-container');
                const detailsContentContainer = document.getElementById('details-content-container');

                videoContainer.style.backgroundImage = `url('${movie.img}')`;
                videoContainer.innerHTML = `<div id="video-overlay-details" class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center cursor-pointer"><div class="text-center text-white"><i class="far fa-play-circle text-6xl"></i><p class="mt-2 font-semibold">លេង​វីដេអូ​ខ្លី</p></div></div><iframe id="video-player-details" class="absolute inset-0 w-full h-full hidden" src="" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><button onclick="app.goBack()" class="absolute top-5 left-5 text-white text-3xl z-20 player-control-btn"><i class="fas fa-arrow-left"></i></button><button onclick="app.openShareModal('${movie.id}')" class="absolute top-5 right-5 text-white text-3xl z-20 player-control-btn"><i class="fas fa-share-alt"></i></button>`;

                const tagsHTML = movie.tags.map(tag => `<span class="bg-gray-700 text-gray-300 text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full">${tag}</span>`).join('');
                const metaHTML = `<span class="border border-white text-white text-xs font-bold px-2.5 py-1 rounded-full">NN</span><span class="text-gray-400 mx-2">&#8226;</span><span class="text-gray-400">${movie.year}</span><span class="text-gray-400 mx-2">&#8226;</span><span class="text-gray-400">${movie.season || '1 Season'}</span>${movie.premium ? '<span class="text-gray-400 mx-2">&#8226;</span><span class="bg-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center"><i class="fas fa-star text-white mr-1.5"></i>Premium</span>' : ''}`;
                
                detailsContentContainer.innerHTML = `<div class="flex flex-col items-center text-center"><h1 class="text-3xl md:text-4xl font-extrabold text-white">${movie.title}</h1><div class="mt-4">${tagsHTML}</div><div class="mt-4 flex items-center flex-wrap justify-center">${metaHTML}</div><button onclick="app.startPlayback('${movie.id}')" class="w-full max-w-xs bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-full mt-6 text-lg transition-colors">លេងឥឡូវនេះ</button><p class="mt-6 text-gray-300 leading-relaxed max-w-2xl px-4">${movie.description}</p></div>`;
                
                this.showPage('details');
                document.getElementById('video-overlay-details').onclick = () => { 
                    document.getElementById('video-overlay-details').classList.add('hidden'); 
                    const player = document.getElementById('video-player-details'); 
                    player.src = `https://www.youtube.com/embed/${movie.trailerId}?autoplay=1&mute=1`; 
                    player.classList.remove('hidden'); 
                };
            },
            
            goBack() { 
                const player = document.getElementById('video-player-details'); 
                if (player) { player.src = ''; } 
                this.showPage(this.lastActivePage.id, this.lastActivePage.categoryName, this.lastActivePage.categoryTitle); 
            },

            openShareModal(movieId) { const movie = this.allContent.find(m => m.id === movieId); if (!movie) return; const shareModal = document.getElementById('share-modal'); const shareOptions = document.getElementById('share-options'); const pageUrl = window.location.href; const shareText = `Check out this movie: ${movie.title}`; const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(shareText)}`; const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`; shareOptions.innerHTML = `<a href="${telegramUrl}" target="_blank" class="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"><i class="fab fa-telegram-plane mr-2"></i> Share to Telegram</a><a href="${facebookUrl}" target="_blank" class="block w-full bg-blue-800 hover:bg-blue-900 text-white font-bold py-3 px-4 rounded-lg transition-colors"><i class="fab fa-facebook-f mr-2"></i> Share to Facebook</a><button id="copy-link-btn" class="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"><i class="fas fa-copy mr-2"></i> Copy Link</button>`; shareModal.classList.remove('hidden'); document.getElementById('copy-link-btn').onclick = (e) => { const btn = e.currentTarget; const tempInput = document.createElement("textarea"); tempInput.value = pageUrl; document.body.appendChild(tempInput); tempInput.select(); document.execCommand("copy"); document.body.removeChild(tempInput); btn.innerHTML = `<i class="fas fa-check mr-2"></i> Copied!`; setTimeout(() => { btn.innerHTML = `<i class="fas fa-copy mr-2"></i> Copy Link`; }, 2000); }; },
            closeShareModal() { document.getElementById('share-modal').classList.add('hidden'); },
            
            performSearch() { const query = document.getElementById('search-input').value.toLowerCase().trim(); const resultsGrid = document.getElementById('search-grid'); const noResultsMsg = document.getElementById('no-search-results'); const resultsTitle = document.getElementById('search-results-title'); if (!query && this.isSearchOpen) { resultsGrid.innerHTML = ''; noResultsMsg.classList.add('hidden'); resultsTitle.style.visibility = 'hidden'; return; } this.showPage('search-results'); resultsTitle.style.visibility = 'visible'; document.getElementById('search-query-display').textContent = query; const filteredContent = this.allContent.filter(movie => movie.title.toLowerCase().includes(query)); if (filteredContent.length > 0) { this.populateGrid(resultsGrid, filteredContent, false); noResultsMsg.classList.add('hidden'); } else { resultsGrid.innerHTML = ''; noResultsMsg.classList.remove('hidden'); } },
            
            toggleSearch() { 
                const searchDropdown = document.getElementById('search-dropdown'); 
                const searchInput = document.getElementById('search-input'); 
                const searchToggleBtn = document.getElementById('search-toggle-btn'); 
                const searchIcon = searchToggleBtn.querySelector('i'); 
                
                this.isSearchOpen = !this.isSearchOpen; 
                
                if (this.isSearchOpen) { 
                    const currentPage = document.querySelector('.page-content.active'); 
                    if (currentPage) { 
                        this.lastActivePage.id = currentPage.id.replace('page-', ''); 
                    } 
                    this.closeCategoryMenu(); 
                    searchDropdown.classList.remove('opacity-0', '-translate-y-full', 'pointer-events-none'); 
                    searchIcon.classList.replace('fa-search', 'fa-times'); 
                    this.showPage('search-results'); 
                    const resultsTitle = document.getElementById('search-results-title'); 
                    if (resultsTitle) { 
                        resultsTitle.style.visibility = 'hidden'; 
                    } 
                    searchInput.focus(); 
                } else { 
                    searchDropdown.classList.add('opacity-0', '-translate-y-full', 'pointer-events-none'); 
                    searchIcon.classList.replace('fa-times', 'fa-search'); 
                    searchInput.value = ''; 
                    this.goBack(); 
                } 
            },
            
            buildHomeCarousels() { document.querySelectorAll('.movie-carousel-section').forEach(section => { const title = section.dataset.carouselTitle; const categoryKey = section.dataset.carouselCategory; const movies = this.data[categoryKey]; if (!movies) return; let seeAllButtonHTML = `<a href="#" onclick="event.preventDefault(); app.showPage('category', '${categoryKey}', '${title}')" class="text-sm bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-full transition-colors">មើល​ទាំងអស់</a>`; const headerHTML = `<div class="container mx-auto px-4 lg:px-8"><div class="flex justify-between items-center mb-4"><div class="flex items-center space-x-3"><span class="w-1 h-6 bg-blue-500 rounded-full"></span><h3 class="text-2xl font-bold text-white">${title}</h3></div><div class="flex items-center space-x-3"><span class="text-gray-400 font-semibold">${movies.length} រឿង</span>${seeAllButtonHTML}</div></div><div class="relative"><div class="carousel flex space-x-4 overflow-x-auto pb-4"></div></div></div>`; section.innerHTML = headerHTML; this.populateGrid(section.querySelector('.carousel'), movies, true); }); },
            setupEventListeners() {
                const categories = [ { name: 'ទំព័រដើម', page: 'home' }, { name: 'ភាពយន្ត', page: 'movies' }, { name: 'ស៊េរី', page: 'series' }, { name: 'បញ្ជីខ្ញុំ', page: 'my-list', category: 'mylist' }, { name: 'វាយប្រហារ', page: 'category', category: 'action' }, { name: 'កំប្លែង', page: 'category', category: 'comedy' } ];
                const categoryCarousel = document.getElementById('category-carousel');
                categories.forEach(cat => { const link = document.createElement('a'); link.href = '#'; link.textContent = cat.name; link.dataset.page = cat.page; if (cat.category) link.dataset.category = cat.category; link.className = 'flex-shrink-0 px-3 py-2 rounded-md hover:bg-red-600 transition-colors text-white font-medium'; link.addEventListener('click', (e) => { e.preventDefault(); if (this.isSearchOpen) this.toggleSearch(); this.showPage(cat.page, cat.category || cat.name, cat.name); this.closeCategoryMenu(); }); categoryCarousel.appendChild(link); });
                document.getElementById('search-toggle-btn').addEventListener('click', () => this.toggleSearch());
                document.getElementById('menu-toggle-button').addEventListener('click', (e) => { e.stopPropagation(); const categoryDropdown = document.getElementById('category-dropdown'); const menuIcon = e.currentTarget.querySelector('i'); const isHidden = categoryDropdown.classList.contains('opacity-0'); if (isHidden) { if(this.isSearchOpen) this.toggleSearch(); categoryDropdown.classList.remove('opacity-0', '-translate-y-full', 'pointer-events-none'); menuIcon.classList.replace('fa-bars', 'fa-times'); } else { this.closeCategoryMenu(); } });
            },
            setupSlider() {
                const sliderData = [ { title: 'The Double', img: 'https://vcover-hz-pic.wetvinfo.com/vcover_hz_pic/0/fc0jm32uyhpfqae1724323629639/0' }, { title: 'Lost You Forever', img: 'https://puui.wetvinfo.com/wetv/cms/6945_1696415708_19201080.jpeg?imageMogr2/thumbnail/3000x' } ];
                const sliderContainer = document.getElementById('hero-slider'); let currentSlideIndex = 0;
                function createSlider() { if (!sliderContainer) return; sliderContainer.innerHTML = ''; sliderData.forEach((slide, index) => { const slideElement = document.createElement('div'); slideElement.className = `hero-slide absolute inset-0 w-full h-full ${index === 0 ? 'opacity-100' : 'opacity-0'}`; slideElement.style.backgroundImage = `url('${slide.img}')`; slideElement.innerHTML = `<div class="absolute top-4 left-4 bg-gray-900 bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-md z-10">${slide.title}</div>`; sliderContainer.appendChild(slideElement); }); const paginationContainer = document.createElement('div'); paginationContainer.className = 'absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-20'; sliderData.forEach((_, index) => { const dot = document.createElement('button'); dot.className = `w-2.5 h-2.5 rounded-full transition-all duration-300 ${index === 0 ? 'bg-white scale-125' : 'bg-gray-500 bg-opacity-70'}`; dot.addEventListener('click', () => showSlide(index)); paginationContainer.appendChild(dot); }); sliderContainer.appendChild(paginationContainer); }
                function showSlide(index) { if (index === currentSlideIndex || !sliderContainer) return; const slides = sliderContainer.querySelectorAll('.hero-slide'); const dots = sliderContainer.querySelectorAll('.z-20 button'); if (!slides.length || !dots.length) return; slides.forEach((slide, i) => slide.style.opacity = i === index ? '1' : '0'); dots.forEach((dot, i) => { dot.classList.toggle('bg-white', i === index); dot.classList.toggle('scale-125', i === index); dot.classList.toggle('bg-gray-500', i !== index); }); currentSlideIndex = index; }
                createSlider(); setInterval(() => showSlide((currentSlideIndex + 1) % sliderData.length), 5000);
            },

            // ===== PLAYER FUNCTIONS =====
            startPlayback(movieId) {
                const movie = this.allContent.find(m => m.id === movieId);
                if (!movie) return;
                this.playerState.currentMovieId = movieId;
                this.playerState.currentEpisodeIndex = 0;
                this.renderPlayerPage(movieId, 0);
                this.showPage('player');
            },
            
            renderPlayerPage(movieId, episodeIndex) {
                const movie = this.allContent.find(m => m.id === movieId);
                if (!movie) return;
                document.getElementById('player-breadcrumb').innerHTML = `<span class="text-gray-400">ទំព័រដើម</span> / <span class="text-white">${movie.title}</span>`;
                this.setupCustomPlayer();
                const episodeListContainer = document.getElementById('episode-list-container');
                const videoPlayer = document.getElementById('main-video-player');
                if (movie.type === 'series' && movie.episodesData) {
                    episodeListContainer.style.display = 'block';
                    document.getElementById('player-total-episodes').textContent = `សរុប ${movie.episodesData.length} ភាគ`;
                    this.renderEpisodeTabs(movie);
                    this.playerState.playOnLoad = true;
                    videoPlayer.src = movie.episodesData[episodeIndex].url;
                } else if (movie.type === 'movie' && movie.videoUrl) {
                    episodeListContainer.style.display = 'none';
                    this.playerState.playOnLoad = true;
                    videoPlayer.src = movie.videoUrl;
                }
            },

            renderEpisodeTabs(movie) {
                const episodeRangeTabs = document.getElementById('player-episode-range-tabs');
                episodeRangeTabs.innerHTML = '';
                const totalEpisodes = movie.episodesData.length;
                const rangeCount = Math.ceil(totalEpisodes / this.EPISODES_PER_RANGE);
                for (let i = 0; i < rangeCount; i++) {
                    const start = i * this.EPISODES_PER_RANGE + 1;
                    const end = Math.min((i + 1) * this.EPISODES_PER_RANGE, totalEpisodes);
                    const rangeButton = document.createElement('button');
                    rangeButton.className = 'episode-range-btn pb-2 text-lg rounded-t-md';
                    rangeButton.textContent = `${start}-${end}`;
                    rangeButton.onclick = () => this.displayEpisodeDetailGrid(i);
                    episodeRangeTabs.appendChild(rangeButton);
                }
                this.displayEpisodeDetailGrid(Math.floor(this.playerState.currentEpisodeIndex / this.EPISODES_PER_RANGE));
            },

            displayEpisodeDetailGrid(rangeIndex) {
                const movie = this.allContent.find(m => m.id === this.playerState.currentMovieId);
                if (!movie) return;
                document.querySelectorAll('.episode-range-btn').forEach((btn, i) => btn.classList.toggle('active', i === rangeIndex));
                const detailGrid = document.getElementById('player-episode-detail-grid');
                detailGrid.innerHTML = '';
                const start = rangeIndex * this.EPISODES_PER_RANGE;
                const end = Math.min(start + this.EPISODES_PER_RANGE, movie.episodesData.length);
                for (let i = start; i < end; i++) {
                    const epButton = document.createElement('button');
                    epButton.className = `episode-btn text-white font-semibold p-2 rounded-md transition-colors flex items-center justify-center aspect-square ${i === this.playerState.currentEpisodeIndex ? 'active' : ''}`;
                    epButton.textContent = `${i + 1}`;
                    epButton.dataset.index = i;
                    epButton.onclick = () => this.playEpisode(i);
                    detailGrid.appendChild(epButton);
                }
            },

            playEpisode(index) {
                const movie = this.allContent.find(m => m.id === this.playerState.currentMovieId);
                if (!movie || !movie.episodesData || index < 0 || index >= movie.episodesData.length) return;
                this.playerState.currentEpisodeIndex = index;
                this.displayEpisodeDetailGrid(Math.floor(index / this.EPISODES_PER_RANGE));
                const videoPlayer = document.getElementById('main-video-player');
                this.playerState.playOnLoad = true;
                videoPlayer.src = movie.episodesData[index].url;
            },
            
            setupCustomPlayer() {
                const video = document.getElementById('main-video-player');
                const playPauseBtn = document.getElementById('play-pause-btn');
                const volumeBtn = document.getElementById('volume-btn');
                const seekBar = document.getElementById('seek-bar');
                const seekProgress = document.getElementById('seek-progress');
                const timeDisplay = document.getElementById('time-display');
                const fullscreenBtn = document.getElementById('fullscreen-btn');
                const seekBarContainer = document.getElementById('seek-bar-container');
                const seekTooltip = document.getElementById('seek-tooltip');
                const videoOverlay = document.getElementById('video-overlay');
                const playerContainer = document.getElementById('player-container');
                const formatTime = (time) => { const minutes = Math.floor(time / 60); const seconds = Math.floor(time % 60); return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; };
                playPauseBtn.onclick = () => { if (!this.playerState.isLocked) { video.paused ? video.play() : video.pause(); } };
                video.onplay = () => { playPauseBtn.querySelector('i').className = 'fas fa-pause'; videoOverlay.classList.add('hidden-when-playing'); };
                video.onpause = () => { playPauseBtn.querySelector('i').className = 'fas fa-play'; if (!this.playerState.isLocked) { videoOverlay.classList.remove('hidden-when-playing'); } };
                video.onended = () => { playPauseBtn.querySelector('i').className = 'fas fa-play'; if (!this.playerState.isLocked) { videoOverlay.classList.remove('hidden-when-playing'); } };
                video.onloadedmetadata = () => { seekBar.max = video.duration; timeDisplay.textContent = `${formatTime(0)} / ${formatTime(video.duration)}`; if (this.playerState.playOnLoad) { video.play().catch(e => console.error("Play Error:", e)); this.playerState.playOnLoad = false; } };
                video.ontimeupdate = () => { seekBar.value = video.currentTime; seekProgress.style.width = `${(video.currentTime / video.duration) * 100}%`; timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`; };
                seekBar.oninput = () => { if (!this.playerState.isLocked) { video.currentTime = seekBar.value; } };
                seekBarContainer.onmousemove = (e) => { if (!this.playerState.isLocked) { const rect = seekBarContainer.getBoundingClientRect(); const x = e.clientX - rect.left; const percentage = Math.max(0, Math.min(1, x / rect.width)); const time = percentage * video.duration; seekTooltip.style.left = `${x}px`; seekTooltip.textContent = formatTime(time); seekTooltip.style.display = 'block'; } };
                seekBarContainer.onmouseleave = () => seekTooltip.style.display = 'none';
                volumeBtn.onclick = () => { if (!this.playerState.isLocked) { video.muted = !video.muted; } };
                video.onvolumechange = () => { const icon = volumeBtn.querySelector('i'); if (video.muted || video.volume === 0) icon.className = 'fas fa-volume-mute'; else if (video.volume < 0.5) icon.className = 'fas fa-volume-down'; else icon.className = 'fas fa-volume-up'; };
                fullscreenBtn.onclick = async () => { if (!this.playerState.isLocked) { try { if (!document.fullscreenElement) { if (playerContainer.requestFullscreen) await playerContainer.requestFullscreen(); if (screen.orientation && screen.orientation.lock) await screen.orientation.lock("landscape").catch(err => console.warn("Orientation lock failed:", err)); } else { if (document.exitFullscreen) await document.exitFullscreen(); if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } } catch (error) { console.error("Fullscreen error:", error); } } };
            },
            
            setupVideoOverlay() {
                const videoOverlay = document.getElementById('video-overlay');
                const video = document.getElementById('main-video-player');
                videoOverlay.addEventListener('click', () => { if (!this.playerState.isLocked && (video.paused || video.ended)) { video.play().catch(e => console.error("Overlay Play Error:", e)); } });
            },

            setupLockToggleFunctionality() {
                const lockToggleButton = document.getElementById('lock-toggle-btn');
                const lockIcon = lockToggleButton.querySelector('i');
                const customControls = document.getElementById('custom-controls');
                const videoOverlay = document.getElementById('video-overlay');
                const interactionBlocker = document.getElementById('interaction-blocker');
                const video = document.getElementById('main-video-player'); 
                const playerContainer = document.getElementById('player-container'); 
                const hideControlsOnInactivity = () => { if (!this.playerState.isLocked) { customControls.classList.add('fade-out-inactive'); videoOverlay.classList.add('fade-out-inactive'); } lockToggleButton.classList.add('fade-out-inactive'); };
                const showControlsOnInteraction = () => { clearTimeout(this.playerState.inactivityTimer); if (!this.playerState.isLocked) { customControls.classList.remove('fade-out-inactive'); if (video.paused || video.ended) { videoOverlay.classList.remove('fade-out-inactive'); videoOverlay.classList.remove('hidden-when-playing'); } else { videoOverlay.classList.add('fade-out-inactive'); } } else { customControls.classList.add('locked-force-hide'); videoOverlay.classList.add('locked-force-hide'); } lockToggleButton.classList.remove('fade-out-inactive'); this.playerState.inactivityTimer = setTimeout(hideControlsOnInactivity, this.playerState.HIDE_TIMEOUT_MS); };
                playerContainer.addEventListener('mousemove', showControlsOnInteraction);
                playerContainer.addEventListener('touchstart', showControlsOnInteraction);
                playerContainer.addEventListener('mouseleave', () => { clearTimeout(this.playerState.inactivityTimer); this.playerState.inactivityTimer = setTimeout(hideControlsOnInactivity, this.playerState.HIDE_TIMEOUT_MS); });
                lockToggleButton.addEventListener('click', () => { this.playerState.isLocked = !this.playerState.isLocked; if (this.playerState.isLocked) { lockIcon.className = 'fas fa-lock'; lockToggleButton.classList.remove('unlocked-state'); lockToggleButton.classList.add('locked-state'); customControls.classList.add('locked-force-hide'); videoOverlay.classList.add('locked-force-hide'); interactionBlocker.classList.add('active'); lockToggleButton.classList.remove('fade-out-inactive'); clearTimeout(this.playerState.inactivityTimer); this.playerState.inactivityTimer = setTimeout(hideControlsOnInactivity, this.playerState.HIDE_TIMEOUT_MS); } else { lockIcon.className = 'fas fa-unlock'; lockToggleButton.classList.remove('locked-state'); lockToggleButton.classList.add('unlocked-state'); customControls.classList.remove('locked-force-hide'); videoOverlay.classList.remove('locked-force-hide'); interactionBlocker.classList.remove('active'); showControlsOnInteraction(); } });
                showControlsOnInteraction(); 
            }
        };

        app.init();
    </script>

