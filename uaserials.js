// ===========================================
// Плагін "Піратські джерела" для Lampa
// Версія: 2.0.0 (демо з тестовим відео)
// Автор: AI Assistant
// ===========================================

(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    // -----------------------------------------------------------------
    // 1. ДЖЕРЕЛО: UASerials.pro (українською)
    // -----------------------------------------------------------------
    Lampa.Listener.follow('app', function(event) {
        if (event.type === 'ready') {
            // --- UASerials ---
            Lampa.Source.add({
                id: 'uaserials',
                name: '🇺🇦 UASerials',
                categories: ['movie', 'tv'], // фільми + серіали

                // Пошук за запитом
                search: function(q, page, category) {
                    page = page || 1;
                    var searchUrl = 'https://uaserials.pro/index.php?do=search&subaction=search&story=' + encodeURIComponent(q) + '&search_start=' + (page - 1);

                    Lampa.Fetch.get(searchUrl, { responseType: 'document' }, function(html) {
                        try {
                            var items = [];
                            var cards = html.querySelectorAll('.short-story, .th-item, .movie-item'); // селектори підбираються
                            for (var i = 0; i < cards.length; i++) {
                                var card = cards[i];
                                var titleEl = card.querySelector('.th-title, .movie-title, a');
                                var linkEl = card.querySelector('a');
                                var imgEl = card.querySelector('img');
                                var yearEl = card.querySelector('.year, .date');

                                var title = titleEl ? titleEl.textContent.trim() : 'Без назви';
                                var link = linkEl ? linkEl.getAttribute('href') : '';
                                var poster = imgEl ? imgEl.getAttribute('src') : '';
                                if (poster && !poster.startsWith('http')) poster = 'https://uaserials.pro' + poster;
                                var year = yearEl ? yearEl.textContent.trim() : '';

                                if (link) {
                                    items.push({
                                        id: 'uas_' + (link.split('/').pop() || i),
                                        title: title,
                                        poster: poster,
                                        year: year,
                                        description: '',
                                        category: link.includes('series') ? 'tv' : 'movie',
                                        url: 'uaserials:' + link
                                    });
                                }
                            }
                            Lampa.Search.result({
                                results: items,
                                page: page,
                                total_pages: 5, // обмежимо, щоб не вантажити зайвого
                                source: 'uaserials'
                            });
                        } catch (e) {
                            console.error('UASerials search error', e);
                            Lampa.Search.result({ results: [], page: page, total_pages: 0, source: 'uaserials' });
                        }
                    });
                },

                // Популярне (головна сторінка)
                get: function(category, type, page) {
                    page = page || 1;
                    var url = category === 'movie' 
                        ? 'https://uaserials.pro/films/page/' + page + '/' 
                        : 'https://uaserials.pro/serials/page/' + page + '/';

                    Lampa.Fetch.get(url, { responseType: 'document' }, function(html) {
                        try {
                            var items = [];
                            var cards = html.querySelectorAll('.short-story, .th-item, .movie-item');
                            for (var i = 0; i < cards.length; i++) {
                                var card = cards[i];
                                var titleEl = card.querySelector('.th-title, .movie-title, a');
                                var linkEl = card.querySelector('a');
                                var imgEl = card.querySelector('img');
                                var yearEl = card.querySelector('.year, .date');

                                var title = titleEl ? titleEl.textContent.trim() : 'Без назви';
                                var link = linkEl ? linkEl.getAttribute('href') : '';
                                var poster = imgEl ? imgEl.getAttribute('src') : '';
                                if (poster && !poster.startsWith('http')) poster = 'https://uaserials.pro' + poster;
                                var year = yearEl ? yearEl.textContent.trim() : '';

                                if (link) {
                                    items.push({
                                        id: 'uas_' + (link.split('/').pop() || i),
                                        title: title,
                                        poster: poster,
                                        year: year,
                                        description: '',
                                        category: category,
                                        url: 'uaserials:' + link
                                    });
                                }
                            }
                            Lampa.Search.result({
                                results: items,
                                page: page,
                                total_pages: 5,
                                source: 'uaserials'
                            });
                        } catch (e) {
                            console.error('UASerials get error', e);
                            Lampa.Search.result({ results: [], page: page, total_pages: 0, source: 'uaserials' });
                        }
                    });
                },

                // Отримання детальної інформації та ВІДЕО
                getItem: function(url, callback) {
                    var realUrl = url.replace('uaserials:', 'https://uaserials.pro');
                    Lampa.Fetch.get(realUrl, { responseType: 'document' }, function(html) {
                        try {
                            // --- Парсимо назву, опис, постер ---
                            var titleEl = html.querySelector('h1, .page-title');
                            var descEl = html.querySelector('.full-story, .description, .entry-content');
                            var posterEl = html.querySelector('.poster img, .cover img');
                            var yearEl = html.querySelector('.year, .date');

                            var title = titleEl ? titleEl.textContent.trim() : 'Невідомо';
                            var description = descEl ? descEl.textContent.trim() : '';
                            var poster = posterEl ? posterEl.getAttribute('src') : '';
                            if (poster && !poster.startsWith('http')) poster = 'https://uaserials.pro' + poster;
                            var year = yearEl ? yearEl.textContent.trim() : '';

                            // ⚠️ ДЕМО-ВІДЕО (заміни на реальний екстрактор)
                            // Інструкція: тут потрібно знайти iframe, player.js або пряме посилання на відеофайл.
                            // Приклад для UASerials: відео часто лежить на їхньому CDN, шукай у <video> або script.
                            var demoVideo = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

                            callback({
                                title: title,
                                description: description,
                                poster: poster,
                                year: year,
                                url: url,
                                // Лінк на відео – Lampa його відтворить
                                player: {
                                    url: demoVideo,
                                    method: 'direct', // пряме посилання на .mp4
                                    title: title
                                }
                            });
                        } catch (e) {
                            console.error('UASerials getItem error', e);
                            callback({ title: 'Помилка', description: '', poster: '', year: '', url: url });
                        }
                    });
                }
            });

            // -----------------------------------------------------------------
            // 2. ДЖЕРЕЛО: Kinogo.biz (російською)
            // -----------------------------------------------------------------
            Lampa.Source.add({
                id: 'kinogo',
                name: '🎬 Kinogo',
                categories: ['movie', 'tv'],

                search: function(q, page, category) {
                    page = page || 1;
                    var searchUrl = 'https://kinogo.biz/index.php?do=search&subaction=search&story=' + encodeURIComponent(q) + '&search_start=' + (page - 1);

                    Lampa.Fetch.get(searchUrl, { responseType: 'document' }, function(html) {
                        try {
                            var items = [];
                            var cards = html.querySelectorAll('.short, .movie-item, .th-item');
                            for (var i = 0; i < cards.length; i++) {
                                var card = cards[i];
                                var titleEl = card.querySelector('.zag, .title, a');
                                var linkEl = card.querySelector('a');
                                var imgEl = card.querySelector('img');
                                var yearEl = card.querySelector('.year');

                                var title = titleEl ? titleEl.textContent.trim() : 'Без назви';
                                var link = linkEl ? linkEl.getAttribute('href') : '';
                                var poster = imgEl ? imgEl.getAttribute('src') : '';
                                if (poster && !poster.startsWith('http')) poster = 'https://kinogo.biz' + poster;
                                var year = yearEl ? yearEl.textContent.trim() : '';

                                if (link) {
                                    items.push({
                                        id: 'kino_' + (link.split('/').pop() || i),
                                        title: title,
                                        poster: poster,
                                        year: year,
                                        description: '',
                                        category: category,
                                        url: 'kinogo:' + link
                                    });
                                }
                            }
                            Lampa.Search.result({
                                results: items,
                                page: page,
                                total_pages: 5,
                                source: 'kinogo'
                            });
                        } catch (e) {
                            console.error('Kinogo search error', e);
                            Lampa.Search.result({ results: [], page: page, total_pages: 0, source: 'kinogo' });
                        }
                    });
                },

                get: function(category, type, page) {
                    page = page || 1;
                    var url = 'https://kinogo.biz/page/' + page + '/';
                    Lampa.Fetch.get(url, { responseType: 'document' }, function(html) {
                        // Аналогічно пошуку – парсимо картки
                        // ... (скорочено для лаконічності, в реальному плагіні код повторюється)
                        // Використаємо ту саму логіку, що в search
                        try {
                            var items = [];
                            var cards = html.querySelectorAll('.short, .movie-item, .th-item');
                            for (var i = 0; i < cards.length; i++) {
                                var card = cards[i];
                                var titleEl = card.querySelector('.zag, .title, a');
                                var linkEl = card.querySelector('a');
                                var imgEl = card.querySelector('img');
                                var yearEl = card.querySelector('.year');

                                var title = titleEl ? titleEl.textContent.trim() : 'Без назви';
                                var link = linkEl ? linkEl.getAttribute('href') : '';
                                var poster = imgEl ? imgEl.getAttribute('src') : '';
                                if (poster && !poster.startsWith('http')) poster = 'https://kinogo.biz' + poster;
                                var year = yearEl ? yearEl.textContent.trim() : '';

                                if (link) {
                                    items.push({
                                        id: 'kino_' + (link.split('/').pop() || i),
                                        title: title,
                                        poster: poster,
                                        year: year,
                                        description: '',
                                        category: category,
                                        url: 'kinogo:' + link
                                    });
                                }
                            }
                            Lampa.Search.result({
                                results: items,
                                page: page,
                                total_pages: 5,
                                source: 'kinogo'
                            });
                        } catch (e) {
                            console.error('Kinogo get error', e);
                            Lampa.Search.result({ results: [], page: page, total_pages: 0, source: 'kinogo' });
                        }
                    });
                },

                getItem: function(url, callback) {
                    var realUrl = url.replace('kinogo:', 'https://kinogo.biz');
                    Lampa.Fetch.get(realUrl, { responseType: 'document' }, function(html) {
                        try {
                            var titleEl = html.querySelector('h1, .zag, .title');
                            var descEl = html.querySelector('.description, .full-story');
                            var posterEl = html.querySelector('.poster img, .cover img');
                            var yearEl = html.querySelector('.year');

                            var title = titleEl ? titleEl.textContent.trim() : 'Невідомо';
                            var description = descEl ? descEl.textContent.trim() : '';
                            var poster = posterEl ? posterEl.getAttribute('src') : '';
                            if (poster && !poster.startsWith('http')) poster = 'https://kinogo.biz' + poster;
                            var year = yearEl ? yearEl.textContent.trim() : '';

                            // ⚠️ ДЕМО-ВІДЕО
                            var demoVideo = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

                            callback({
                                title: title,
                                description: description,
                                poster: poster,
                                year: year,
                                url: url,
                                player: {
                                    url: demoVideo,
                                    method: 'direct',
                                    title: title
                                }
                            });
                        } catch (e) {
                            console.error('Kinogo getItem error', e);
                            callback({ title: 'Помилка', description: '', poster: '', year: '', url: url });
                        }
                    });
                }
            });

            // -----------------------------------------------------------------
            // 3. ДЖЕРЕЛО: HDRezka (використовуємо дзеркало hdrezka.ag)
            // -----------------------------------------------------------------
            Lampa.Source.add({
                id: 'hdrezka',
                name: '🎥 HDRezka',
                categories: ['movie', 'tv'],

                search: function(q, page, category) {
                    page = page || 1;
                    var searchUrl = 'https://hdrezka.ag/search/?do=search&subaction=search&q=' + encodeURIComponent(q) + '&search_start=' + (page - 1);

                    Lampa.Fetch.get(searchUrl, { responseType: 'document' }, function(html) {
                        try {
                            var items = [];
                            var cards = html.querySelectorAll('.b-content__inline_item, .short-item');
                            for (var i = 0; i < cards.length; i++) {
                                var card = cards[i];
                                var titleEl = card.querySelector('.b-content__inline_item-link a, .title');
                                var linkEl = card.querySelector('a');
                                var imgEl = card.querySelector('img');
                                var infoEl = card.querySelector('.b-content__inline_item-link div');

                                var title = titleEl ? titleEl.textContent.trim() : 'Без назви';
                                var link = linkEl ? linkEl.getAttribute('href') : '';
                                var poster = imgEl ? imgEl.getAttribute('src') : '';
                                if (poster && !poster.startsWith('http')) poster = 'https://hdrezka.ag' + poster;
                                var year = infoEl ? infoEl.textContent.trim().match(/\d{4}/) : '';
                                year = year ? year[0] : '';

                                if (link) {
                                    items.push({
                                        id: 'rezka_' + (link.split('/').pop() || i),
                                        title: title,
                                        poster: poster,
                                        year: year,
                                        description: '',
                                        category: link.includes('/series/') ? 'tv' : 'movie',
                                        url: 'hdrezka:' + link
                                    });
                                }
                            }
                            Lampa.Search.result({
                                results: items,
                                page: page,
                                total_pages: 5,
                                source: 'hdrezka'
                            });
                        } catch (e) {
                            console.error('HDRezka search error', e);
                            Lampa.Search.result({ results: [], page: page, total_pages: 0, source: 'hdrezka' });
                        }
                    });
                },

                get: function(category, type, page) {
                    page = page || 1;
                    var url = category === 'movie' 
                        ? 'https://hdrezka.ag/films/page/' + page + '/' 
                        : 'https://hdrezka.ag/series/page/' + page + '/';

                    Lampa.Fetch.get(url, { responseType: 'document' }, function(html) {
                        // Аналогічно пошуку
                        try {
                            var items = [];
                            var cards = html.querySelectorAll('.b-content__inline_item, .short-item');
                            for (var i = 0; i < cards.length; i++) {
                                var card = cards[i];
                                var titleEl = card.querySelector('.b-content__inline_item-link a, .title');
                                var linkEl = card.querySelector('a');
                                var imgEl = card.querySelector('img');
                                var infoEl = card.querySelector('.b-content__inline_item-link div');

                                var title = titleEl ? titleEl.textContent.trim() : 'Без назви';
                                var link = linkEl ? linkEl.getAttribute('href') : '';
                                var poster = imgEl ? imgEl.getAttribute('src') : '';
                                if (poster && !poster.startsWith('http')) poster = 'https://hdrezka.ag' + poster;
                                var year = infoEl ? infoEl.textContent.trim().match(/\d{4}/) : '';
                                year = year ? year[0] : '';

                                if (link) {
                                    items.push({
                                        id: 'rezka_' + (link.split('/').pop() || i),
                                        title: title,
                                        poster: poster,
                                        year: year,
                                        description: '',
                                        category: category,
                                        url: 'hdrezka:' + link
                                    });
                                }
                            }
                            Lampa.Search.result({
                                results: items,
                                page: page,
                                total_pages: 5,
                                source: 'hdrezka'
                            });
                        } catch (e) {
                            console.error('HDRezka get error', e);
                            Lampa.Search.result({ results: [], page: page, total_pages: 0, source: 'hdrezka' });
                        }
                    });
                },

                getItem: function(url, callback) {
                    var realUrl = url.replace('hdrezka:', 'https://hdrezka.ag');
                    Lampa.Fetch.get(realUrl, { responseType: 'document' }, function(html) {
                        try {
                            var titleEl = html.querySelector('h1, .b-post__title');
                            var descEl = html.querySelector('.b-post__description_text, .description');
                            var posterEl = html.querySelector('.b-post__cover img, .poster img');
                            var yearEl = html.querySelector('.b-post__info_row[itemprop="dateCreated"], .year');

                            var title = titleEl ? titleEl.textContent.trim() : 'Невідомо';
                            var description = descEl ? descEl.textContent.trim() : '';
                            var poster = posterEl ? posterEl.getAttribute('src') : '';
                            if (poster && !poster.startsWith('http')) poster = 'https://hdrezka.ag' + poster;
                            var year = yearEl ? yearEl.textContent.trim() : '';

                            // ⚠️ ДЕМО-ВІДЕО
                            var demoVideo = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

                            callback({
                                title: title,
                                description: description,
                                poster: poster,
                                year: year,
                                url: url,
                                player: {
                                    url: demoVideo,
                                    method: 'direct',
                                    title: title
                                }
                            });
                        } catch (e) {
                            console.error('HDRezka getItem error', e);
                            callback({ title: 'Помилка', description: '', poster: '', year: '', url: url });
                        }
                    });
                }
            });

            console.log('✅ Плагін "Піратські джерела" завантажено!');
        }
    });

})();
