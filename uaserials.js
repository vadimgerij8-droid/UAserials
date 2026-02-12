// ===========================================
// Плагін "UA Online" для Lampa (як online_mod)
// Версія: 1.0
// Автор: Вадим
// ===========================================

(function() {
    'use strict';

    if (typeof Lampa === 'undefined') return;

    Lampa.Listener.follow('app', function(e) {
        if (e.type === 'ready') {
            console.log('[UA Online] Плагін запущено');

            // Додаємо джерело в список онлайн-джерел
            Lampa.Source.add({
                id: 'ua_online',
                name: '🇺🇦 UA Online (UASerials + інші)',

                // Пошук
                search: function(query, page, type) {
                    page = page || 1;
                    var url = 'https://uaserials.com/index.php?do=search&subaction=search&story=' + encodeURIComponent(query) + '&page=' + page;

                    Lampa.Network.request(url, {}, function(html) {
                        var results = [];
                        var $html = $(html);
                        $html.find('.shortstory, .movie-item, .serial-item, .card').each(function() {
                            var $this = $(this);
                            var title = $this.find('h3, .title, a').first().text().trim() || 'Без назви';
                            var href = $this.find('a').first().attr('href') || '';
                            var img = $this.find('img').first().attr('src') || '';
                            if (img && !img.startsWith('http')) img = 'https://uaserials.com' + img;

                            if (href && title) {
                                if (!href.startsWith('http')) href = 'https://uaserials.com' + href;
                                results.push({
                                    title: title,
                                    poster: img,
                                    url: href,
                                    type: href.includes('serial') ? 'tv' : 'movie'
                                });
                            }
                        });

                        Lampa.Search.result({
                            results: results,
                            page: page,
                            total_pages: 10,
                            source: 'ua_online'
                        });
                    });
                },

                // Відкриття сторінки тайтлу і витягування плеєра
                getFile: function(url, callback) {
                    Lampa.Network.request(url, {}, function(html) {
                        var $html = $(html);
                        var title = $html.find('h1, .title').first().text().trim() || 'Без назви';
                        var playerUrl = '';

                        // Шукаємо типові плеєри на UASerials-подібних сайтах
                        var iframe = $html.find('iframe[src*="player"], iframe[src*="video"], #player iframe').first().attr('src');
                        if (iframe) playerUrl = iframe;

                        // Якщо iframe, намагаємось знайти пряме посилання
                        if (playerUrl) {
                            if (!playerUrl.startsWith('http')) playerUrl = 'https:' + playerUrl;
                            callback({
                                title: title,
                                files: [{
                                    url: playerUrl,
                                    quality: 'Auto',
                                    codec: 'hls/mp4'
                                }]
                            });
                        } else {
                            // Якщо не знайшли — відкриваємо сторінку в браузері
                            Lampa.Browser.open(url);
                            callback({ files: [] });
                        }
                    });
                }
            });

            Lampa.Noty.show('Джерело UA Online додано! Шукай фільми/серіали українською.');
        }
    });
})();
