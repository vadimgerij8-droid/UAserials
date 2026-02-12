// ===========================================
// Плагін "Піратські джерела" для Lampa
// Версія: 2.0.0 (з реальним парсингом)
// Автор: AI Assistant
// ===========================================

(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    var network = new Lampa.Reguest();

    // -----------------------------------------------------------------
    // 1. ДЖЕРЕЛО: UASerials.com (українською)
    // -----------------------------------------------------------------
    Lampa.Source.add({
        id: 'uaserials',
        name: '🇺🇦 UASerials',
        categories: ['movie', 'tv'], // фільми + серіали

        // Пошук за запитом
        search: function(q, page, category) {
            page = page || 1;
            var searchUrl = 'https://uaserials.com/index.php?do=search&subaction=search&story=' + encodeURIComponent(q) + '&search_start=' + (page - 1);

            network.silent(searchUrl, function(html) {
                try {
                    var items = [];
                    var cards = $(html).find('.short-story, .th-item, .movie-item, .serial-item, .poster, .card');
                    cards.each(function() {
                        var card = $(this);
                        var titleEl = card.find('.th-title, .movie-title, h3, .title, a');
                        var linkEl = card.find('a');
                        var imgEl = card.find('img');
                        var yearEl = card.find('.year, .date, .info');

                        var title = titleEl.text() ? titleEl.text().trim() : 'Без назви';
                        var link = linkEl.attr('href') || '';
                        var poster = imgEl.attr('src') || imgEl.attr('data-src') || '';
                        if (poster && !poster.startsWith('http')) poster = 'https://uaserials.com' + poster;
                        var year = yearEl.text() ? yearEl.text().match(/\d{4}/) : '';
                        year = year ? year[0] : '';

                        if (link) {
                            items.push({
                                id: 'uas_' + (link.split('/').pop() || items.length),
                                title: title,
                                poster: poster,
                                year: year,
                                description: '',
                                category: link.includes('serials') ? 'tv' : 'movie',
                                url: 'uaserials:' + link
                            });
                        }
                    });
                    Lampa.Search.result({
                        results: items,
                        page: page,
                        total_pages: 5, // обмежимо
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
                ? 'https://uaserials.com/films/page/' + page + '/' 
                : 'https://uaserials.com/serials/page/' + page + '/';

            network.silent(url, function(html) {
                try {
                    var items = [];
                    var cards = $(html).find('.short-story, .th-item, .movie-item, .serial-item, .poster, .card');
                    cards.each(function() {
                        var card = $(this);
                        var titleEl = card.find('.th-title, .movie-title, h3, .title, a');
                        var linkEl = card.find('a');
                        var imgEl = card.find('img');
                        var yearEl = card.find('.year, .date, .info');

                        var title = titleEl.text() ? titleEl.text().trim() : 'Без назви';
                        var link = linkEl.attr('href') || '';
                        var poster = imgEl.attr('src') || imgEl.attr('data-src') || '';
                        if (poster && !poster.startsWith('http')) poster = 'https://uaserials.com' + poster;
                        var year = yearEl.text() ? yearEl.text().match(/\d{4}/) : '';
                        year = year ? year[0] : '';

                        if (link) {
                            items.push({
                                id: 'uas_' + (link.split('/').pop() || items.length),
                                title: title,
                                poster: poster,
                                year: year,
                                description: '',
                                category: category,
                                url: 'uaserials:' + link
                            });
                        }
                    });
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
            var realUrl = url.replace('uaserials:', 'https://uaserials.com');
            network.silent(realUrl, function(html) {
                try {
                    var $html = $(html);
                    var titleEl = $html.find('h1, .page-title, .title');
                    var descEl = $html.find('.full-story, .description, .entry-content');
                    var posterEl = $html.find('.poster img, .cover img');
                    var yearEl = $html.find('.year, .date');

                    var title = titleEl.text() ? titleEl.text().trim() : 'Невідомо';
                    var description = descEl.text() ? descEl.text().trim() : '';
                    var poster = posterEl.attr('src') || '';
                    if (poster && !poster.startsWith('http')) poster = 'https://uaserials.com' + poster;
                    var year = yearEl.text() ? yearEl.text().trim() : '';

                    // Парсинг плеєра: шукаємо iframe або video
                    var playerIframe = $html.find('#player iframe, .player iframe, div.player iframe').attr('src');
                    var videoTag = $html.find('video source').attr('src') || $html.find('video').attr('src');

                    var videoUrl = videoTag || playerIframe || '';
                    if (videoUrl && !videoUrl.startsWith('http')) videoUrl = 'https://uaserials.com' + videoUrl;

                    if (!videoUrl) {
                        // Якщо немає, шукаємо в скриптах JSON з посиланнями
                        var scripts = $html.find('script');
                        scripts.each(function() {
                            var scriptText = $(this).text();
                            var m3u8Match = scriptText.match(/"file":"([^"]+\.m3u8)"/);
                            if (m3u8Match) videoUrl = m3u8Match[1];
                        });
                    }

                    if (!videoUrl) videoUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4'; // Демо, якщо не знайдено

                    callback({
                        title: title,
                        description: description,
                        poster: poster,
                        year: year,
                        category: url.includes('serials') ? 'tv' : 'movie',
                        url: url,
                        player: {
                            url: videoUrl,
                            method: 'direct', // або 'hls' для m3u8
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
            var searchUrl = 'https://kinogo.biz/search/' + encodeURIComponent(q) + '/page/' + page + '/';

            network.silent(searchUrl, function(html) {
                try {
                    var items = [];
                    var cards = $(html).find('.short, .movie-item, .th-item, .card, .poster');
                    cards.each(function() {
                        var card = $(this);
                        var titleEl = card.find('.zag, .title, h3, a');
                        var linkEl = card.find('a');
                        var imgEl = card.find('img');
                        var yearEl = card.find('.year');

                        var title = titleEl.text() ? titleEl.text().trim() : 'Без назви';
                        var link = linkEl.attr('href') || '';
                        var poster = imgEl.attr('src') || imgEl.attr('data-src') || '';
                        if (poster && !poster.startsWith('http')) poster = 'https://kinogo.biz' + poster;
                        var year = yearEl.text() ? yearEl.text().trim() : '';

                        if (link) {
                            items.push({
                                id: 'kino_' + (link.split('/').pop() || items.length),
                                title: title,
                                poster: poster,
                                year: year,
                                description: '',
                                category: link.includes('series') ? 'tv' : 'movie',
                                url: 'kinogo:' + link
                            });
                        }
                    });
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
            var url = 'https://kinogo.biz/' + (category === 'movie' ? 'filmy' : 'serialy') + '/page/' + page + '/';

            network.silent(url, function(html) {
                try {
                    var items = [];
                    var cards = $(html).find('.short, .movie-item, .th-item, .card, .poster');
                    cards.each(function() {
                        var card = $(this);
                        var titleEl = card.find('.zag, .title, h3, a');
                        var linkEl = card.find('a');
                        var imgEl = card.find('img');
                        var yearEl = card.find('.year');

                        var title = titleEl.text() ? titleEl.text().trim() : 'Без назви';
                        var link = linkEl.attr('href') || '';
                        var poster = imgEl.attr('src') || imgEl.attr('data-src') || '';
                        if (poster && !poster.startsWith('http')) poster = 'https://kinogo.biz' + poster;
                        var year = yearEl.text() ? yearEl.text().trim() : '';

                        if (link) {
                            items.push({
                                id: 'kino_' + (link.split('/').pop() || items.length),
                                title: title,
                                poster: poster,
                                year: year,
                                description: '',
                                category: category,
                                url: 'kinogo:' + link
                            });
                        }
                    });
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
            network.silent(realUrl, function(html) {
                try {
                    var $html = $(html);
                    var titleEl = $html.find('h1, .zag, .title');
                    var descEl = $html.find('.description, .full-story');
                    var posterEl = $html.find('.poster img, .cover img');
                    var yearEl = $html.find('.year');

                    var title = titleEl.text() ? titleEl.text().trim() : 'Невідомо';
                    var description = descEl.text() ? descEl.text().trim() : '';
                    var poster = posterEl.attr('src') || '';
                    if (poster && !poster.startsWith('http')) poster = 'https://kinogo.biz' + poster;
                    var year = yearEl.text() ? yearEl.text().trim() : '';

                    // Парсинг плеєра
                    var playerIframe = $html.find('#player iframe, .player iframe').attr('src');
                    var videoUrl = playerIframe || '';

                    if (videoUrl) {
                        // Якщо iframe, завантажуємо його зміст для m3u8
                        network.silent(videoUrl, function(playerHtml) {
                            var $player = $(playerHtml);
                            var m3u8 = $player.find('source[src*=".m3u8"]').attr('src') || $player.find('video').attr('src') || '';
                            if (m3u8) videoUrl = m3u8;
                            callback({
                                title: title,
                                description: description,
                                poster: poster,
                                year: year,
                                category: url.includes('series') ? 'tv' : 'movie',
                                url: url,
                                player: {
                                    url: videoUrl,
                                    method: 'direct',
                                    title: title
                                }
                            });
                        });
                    } else {
                        callback({
                            title: title,
                            description: description,
                            poster: poster,
                            year: year,
                            url: url,
                            player: {
                                url: 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4',
                                method: 'direct',
                                title: title
                            }
                        });
                    }
                } catch (e) {
                    console.error('Kinogo getItem error', e);
                    callback({ title: 'Помилка', description: '', poster: '', year: '', url: url });
                }
            });
        }
    });

    // -----------------------------------------------------------------
    // 3. ДЖЕРЕЛО: HDRezka.ag
    // -----------------------------------------------------------------
    Lampa.Source.add({
        id: 'hdrezka',
        name: '🎥 HDRezka',
        categories: ['movie', 'tv'],

        search: function(q, page, category) {
            page = page || 1;
            var searchUrl = 'https://hdrezka.ag/search/?do=search&subaction=search&q=' + encodeURIComponent(q) + '&page=' + page;

            network.silent(searchUrl, function(html) {
                try {
                    var items = [];
                    var cards = $(html).find('.b-content__inline_item, .short-item, .card, .poster');
                    cards.each(function() {
                        var card = $(this);
                        var titleEl = card.find('.b-content__inline_item-link a, .title, h3');
                        var linkEl = card.find('a');
                        var imgEl = card.find('img');
                        var infoEl = card.find('.b-content__inline_item-link div, .info');

                        var title = titleEl.text() ? titleEl.text().trim() : 'Без назви';
                        var link = linkEl.attr('href') || '';
                        var poster = imgEl.attr('src') || imgEl.attr('data-src') || '';
                        if (poster && !poster.startsWith('http')) poster = 'https://hdrezka.ag' + poster;
                        var year = infoEl.text() ? infoEl.text().match(/\d{4}/) : '';
                        year = year ? year[0] : '';

                        if (link) {
                            items.push({
                                id: 'rezka_' + (link.split('/').pop() || items.length),
                                title: title,
                                poster: poster,
                                year: year,
                                description: '',
                                category: link.includes('/series/') ? 'tv' : 'movie',
                                url: 'hdrezka:' + link
                            });
                        }
                    });
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

            network.silent(url, function(html) {
                try {
                    var items = [];
                    var cards = $(html).find('.b-content__inline_item, .short-item, .card, .poster');
                    cards.each(function() {
                        var card = $(this);
                        var titleEl = card.find('.b-content__inline_item-link a, .title, h3');
                        var linkEl = card.find('a');
                        var imgEl = card.find('img');
                        var infoEl = card.find('.b-content__inline_item-link div, .info');

                        var title = titleEl.text() ? titleEl.text().trim() : 'Без назви';
                        var link = linkEl.attr('href') || '';
                        var poster = imgEl.attr('src') || imgEl.attr('data-src') || '';
                        if (poster && !poster.startsWith('http')) poster = 'https://hdrezka.ag' + poster;
                        var year = infoEl.text() ? infoEl.text().match(/\d{4}/) : '';
                        year = year ? year[0] : '';

                        if (link) {
                            items.push({
                                id: 'rezka_' + (link.split('/').pop() || items.length),
                                title: title,
                                poster: poster,
                                year: year,
                                description: '',
                                category: category,
                                url: 'hdrezka:' + link
                            });
                        }
                    });
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
            network.silent(realUrl, function(html) {
                try {
                    var $html = $(html);
                    var titleEl = $html.find('h1, .b-post__title');
                    var descEl = $html.find('.b-post__description_text, .description');
                    var posterEl = $html.find('.b-post__cover img, .poster img');
                    var yearEl = $html.find('.b-post__info_row[itemprop="dateCreated"], .year');

                    var title = titleEl.text() ? titleEl.text().trim() : 'Невідомо';
                    var description = descEl.text() ? descEl.text().trim() : '';
                    var poster = posterEl.attr('src') || '';
                    if (poster && !poster.startsWith('http')) poster = 'https://hdrezka.ag' + poster;
                    var year = yearEl.text() ? yearEl.text().trim() : '';

                    // Парсинг плеєра для HDRezka - часто в <script> з translations
                    var videoUrl = '';
                    var scripts = $html.find('script');
                    scripts.each(function() {
                        var scriptText = $(this).text();
                        var match = scriptText.match(/file:"([^"]+)"/);
                        if (match) {
                            var data = match[1].replace(/\[([^\]]+)\]/g, ''); // видаляємо якості
                            videoUrl = data.split(',')[0]; // беремо перше посилання
                        }
                    });

                    if (!videoUrl) {
                        var iframe = $html.find('#translators-list iframe, .player iframe').attr('src');
                        if (iframe) videoUrl = iframe;
                    }

                    if (!videoUrl) videoUrl = 'https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4';

                    callback({
                        title: title,
                        description: description,
                        poster: poster,
                        year: year,
                        category: url.includes('/series/') ? 'tv' : 'movie',
                        url: url,
                        player: {
                            url: videoUrl,
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

    console.log('✅ Плагін "Піратські джерела" завантажено! У Lampa з'являться нові джерела для пошуку і перегляду.');
})();
