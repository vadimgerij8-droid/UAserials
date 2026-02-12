(function() {
    'use strict';

    if (window.uaserials_plugin_loaded) return;
    window.uaserials_plugin_loaded = true;

    console.log('[UASerials Plugin] Запуск...');

    var network = new Lampa.Reguest();

    // Додаємо пункт у бічне меню
    function addMenuItem() {
        var item = $(
            '<div class="menu__item selector" data-action="uaserials">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">' +
                        '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8h16v10z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">UASerials UA</div>' +
            '</div>'
        );

        item.on('hover:enter', function() {
            Lampa.Activity.push({
                url: '',
                component: 'uaserials_categories',
                title: 'UASerials українською'
            });
        });

        $('.menu .menu__list').eq(0).append(item);
    }

    // Категорії (вибір)
    Lampa.Component.add('uaserials_categories', {
        onCreate: function() {
            this.html = $('<div class="full-start__title">Оберіть розділ</div>');
        },

        onRender: function() {
            var cats = [
                { name: 'Новинки',      path: ''          },
                { name: 'Серіали',      path: 'serials/'  },
                { name: 'Фільми',       path: 'films/'    },
                { name: 'Аніме',        path: 'anime/'    },
                { name: 'Мультфільми',  path: 'cartoon/'  },
                { name: 'Мультсеріали', path: 'multserial/' }
            ];

            cats.forEach(cat => {
                var btn = $('<div class="selector settings-param__value selector--large">'+cat.name+'</div>');
                btn.on('hover:enter', () => {
                    Lampa.Activity.push({
                        component: 'uaserials_grid',
                        path: cat.path,
                        title: cat.name,
                        page: 1
                    });
                });
                this.append(btn);
            });

            Lampa.Controller.toggle('content');
        }
    });

    // Сітка контенту
    Lampa.Component.add('uaserials_grid', {
        path: '',
        page: 1,

        onCreate: function() {
            this.activity.loader(true);

            this.scroll = new Lampa.Scroll({ mask: true, over: true, step: 280 });
            this.html.find('.activity__content').css({padding: '0 1em'}).append(this.scroll.render());

            this.items = [];
        },

        onEnter: function() {
            this.loadPage();
        },

        loadPage: function() {
            var self = this;
            var base = 'https://uaserials.com/';
            var url  = base + this.path;

            if (this.page > 1) {
                url += (url.endsWith('/') ? '' : '/') + 'page/' + this.page + '/';
            }

            console.log('[UASerials] Завантаження:', url);

            network.silent(url, function(html) {
                var $doc = $(html
                    .replace(/src\s*=\s*["']\/\//g, 'src="https://')
                    .replace(/data-src\s*=\s*["']\/\//g, 'data-src="https://')
                    .replace(/href\s*=\s*["']\/\//g, 'href="https://')
                );

                var selectors = [
                    '.serial-item', '.movie-item', '.item', '.card', '.poster',
                    '.film-item', '.content-item', '[class*="poster"]', '[class*="card"]',
                    '.list-item', '.grid-item', '.tile', '.block-item'
                ];

                var cards_found = 0;

                selectors.some(function(sel) {
                    var els = $doc.find(sel);
                    if (els.length < 3) return false;

                    els.each(function() {
                        var $el = $(this);

                        // посилання
                        var $a = $el.find('a').first();
                        var href = $a.attr('href') || $el.closest('a').attr('href') || '';
                        if (!href) return;
                        if (!href.match(/^https?:\/\//)) href = base + href.replace(/^\//, '');

                        // назва
                        var title = (
                            $el.find('h3, .title, .name, .film-name, .serial-name, [class*="title"], [class*="name"]').first().text() ||
                            $a.text() ||
                            'Без назви'
                        ).trim();

                        // картинка
                        var img = (
                            $el.find('img').attr('src') ||
                            $el.find('img').attr('data-src') ||
                            $el.find('img').attr('data-lazy') ||
                            ''
                        );
                        if (img && !img.match(/^https?:/)) img = 'https:' + img;

                        // підзаголовок (рік, серії тощо)
                        var subtitle = (
                            $el.find('.year, .info, .season, .episode, .meta, [class*="year"], [class*="info"], [class*="season"]').first().text() ||
                            ''
                        ).trim();

                        if (title.length < 2 || !href) return;

                        var card = Lampa.Card({
                            title: title,
                            img: img || '',
                            subtitle: subtitle || 'UASerials',
                            vote_average: 0,
                            data: { url: href }
                        });

                        card.on('click', function() {
                            Lampa.Browser.open(href);
                            // Якщо хочеш спробувати знайти плеєр — додай сюди self.tryOpenPlayer(href);
                        });

                        self.items.push(card);
                        self.scroll.append(card);
                        cards_found++;
                    });

                    return cards_found > 4; // достатньо, знайшли нормальний блок
                });

                if (cards_found === 0) {
                    Lampa.Noty.show('Не вдалося знайти картки контенту. Сайт змінив структуру?');
                }

                // кнопка "Наступна сторінка"
                if (cards_found >= 6) {
                    var next_btn = $('<div class="button selector" style="margin: 2em auto; padding: 1em 2em;">Наступна сторінка</div>');
                    next_btn.on('hover:enter', function() {
                        self.page++;
                        self.loadPage();
                        next_btn.remove();
                    });
                    self.scroll.append(next_btn);
                }

                self.activity.loader(false);
                self.scroll.update();
            }, function(err, status) {
                console.log('[UASerials] Помилка завантаження:', status, err);
                Lampa.Noty.show('Не вдалося завантажити сторінку UASerials');
                self.activity.loader(false);
            });
        }
    });

    // Додаткові налаштування (опціонально)
    if (!window.lampa_settings || !window.lampa_settings.uaserials) {
        Lampa.SettingsApi.addComponent({
            component: 'uaserials',
            icon: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/></svg>',
            name: 'UASerials UA'
        });

        Lampa.SettingsApi.addParam({
            component: 'uaserials',
            field: { name: 'Джерело', description: 'https://uaserials.com' },
            param: { type: 'title' }
        });

        Lampa.SettingsApi.addParam({
            component: 'uaserials',
            field: { name: 'Відкрити сайт' },
            param: { type: 'button' },
            onChange: function() {
                Lampa.Browser.open('https://uaserials.com');
            }
        });
    }

    // Запускаємо
    if (window.appready) {
        addMenuItem();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') {
                addMenuItem();
            }
        });
    }

})();
