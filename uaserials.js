(function () {
    'use strict';

    if (window.uaserials_installed) return;
    window.uaserials_installed = true;

    var base = 'https://uaserials.com/';
    var net = new Lampa.Reguest();

    // Допоміжна функція для запитів з UA та нормальними хедерами
    function getPage(url, success, error) {
        net.silent(url, success, error, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept-Language': 'uk-UA,uk;q=0.9,ru;q=0.8,en;q=0.7'
            }
        });
    }

    Lampa.Online.add({
        title: 'UASerials',
        priority: 10,           // щоб був вище в списку
        icon: '⊕',             // можна замінити на emoji або залишити порожнім

        // Пошук
        search: function (query, year) {
            var q = encodeURIComponent(query.trim());
            var url = base + '?s=' + q;  // типовий пошук на таких сайтах

            return new Promise((resolve, reject) => {
                getPage(url, (html) => {
                    var $doc = $(html);
                    var items = [];

                    // Знайди картки (перевір на сайті: .film-poster-item, .poster-item, .item-film тощо)
                    $doc.find('.poster-item, .film-item, .item, .card').each(function () {
                        var $el = $(this);
                        var link = $el.find('a').first().attr('href');
                        if (!link) return;

                        if (link.startsWith('/')) link = base + link.slice(1);

                        var title = $el.find('.title, h3, .name, [itemprop="name"]').text().trim() ||
                                    $el.attr('title') || $el.find('img').attr('alt') || '';

                        var img = $el.find('img').attr('src') || $el.find('img').attr('data-src') || '';
                        if (img && img.startsWith('/')) img = base + img.slice(1);

                        items.push({
                            url: link,
                            title: title,
                            img: img
                        });
                    });

                    if (items.length === 0) {
                        Lampa.Noty.show('UASerials: нічого не знайдено');
                    }

                    resolve(items);
                }, (err) => {
                    console.log('UASerials search error:', err);
                    reject(err);
                });
            });
        },

        // Фільм (одна сторінка з плеєром)
        movie: function (item) {
            return new Promise((resolve, reject) => {
                getPage(item.url, (html) => {
                    var $doc = $(html);
                    var src = $doc.find('iframe[src*="player"], iframe[src*="moonwalk"], iframe[src*="ashdi"], iframe[src*="vidstream"], iframe.player, #player iframe, .video iframe').attr('src');

                    if (src) {
                        if (src.startsWith('//')) src = 'https:' + src;
                        if (src.startsWith('/')) src = base + src.slice(1);

                        // Якщо це плеєр — повертаємо як є (Lampa часто може відкрити iframe напряму)
                        resolve([{ url: src, quality: 'Auto' }]);
                    } else {
                        reject('Плеєр не знайдено');
                    }
                }, reject);
            });
        },

        // Серіал — повертає об'єкт сезонів з епізодами
        serial: function (item) {
            return new Promise((resolve, reject) => {
                getPage(item.url, (html) => {
                    var $doc = $(html);
                    var seasons = {};

                    // Типові блоки сезонів (accordion, tabs, .season-list тощо)
                    $doc.find('.seasons, .season-tabs, .accordion, [data-season], .tab-season').each(function (i) {
                        var seasonNum = i + 1;
                        seasons[seasonNum] = [];

                        // Епізоди в сезоні
                        $(this).find('.episode, .ep-item, a[href*="-s"], .play-episode').each(function () {
                            var $ep = $(this);
                            var epNum = parseInt($ep.text().match(/\d+/)?.[0] || $ep.attr('data-ep') || $ep.find('.num').text() || '1', 10);
                            var href = $ep.attr('href') || $ep.attr('data-url') || $ep.find('a').attr('href');

                            if (href) {
                                if (href.startsWith('/')) href = base + href.slice(1);
                                seasons[seasonNum].push({
                                    episode: epNum,
                                    url: href
                                });
                            }
                        });
                    });

                    if (Object.keys(seasons).length === 0) {
                        reject('Сезони не знайдено');
                    } else {
                        resolve(seasons);
                    }
                }, reject);
            });
        },

        // Окремий епізод серіалу
        episode: function (item) {
            return this.movie(item);  // та ж логіка, що й для фільму
        }
    });

    Lampa.Noty.show('UASerials балансер встановлено!');

})();
