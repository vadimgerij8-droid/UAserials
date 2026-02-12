(function() {
    'use strict';

    if (window.ua_pirate_full_loaded) return;
    window.ua_pirate_full_loaded = true;

    console.log('[UA Піратські сайти Full] Запущено — 2026 версія');

    function addMenuItem() {
        var menuItem = $(
            '<div class="menu__item selector" data-action="ua-pirate-full">' +
                '<div class="menu__ico">' +
                    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">' +
                        '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.22.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>' +
                    '</svg>' +
                '</div>' +
                '<div class="menu__text">Піратські UA сайти</div>' +
            '</div>'
        );

        menuItem.on('hover:enter', function() {
            Lampa.Activity.push({
                component: 'ua_pirate_sites',
                title: 'Піратські сайти для перегляду в Lampa'
            });
        });

        $('.menu .menu__list').eq(0).append(menuItem);
    }

    Lampa.Component.add('ua_pirate_sites', {
        onCreate: function() {
            this.activity.render().html('<div class="full-start__title" style="padding:1em;">Оберіть сайт</div>');
        },

        onRender: function() {
            var sites = [
                { name: 'UASerials (українською)',          url: 'https://uaserials.com' },
                { name: 'UAKino / UAKino.me',               url: 'https://uakino.me' },
                { name: 'HDRezka / Rezka.ag',               url: 'https://rezka.ag' },
                { name: 'Filmix (дуже популярний)',         url: 'https://filmix.fm' },
                { name: 'Kinogo (kinogo.ec / .biz)',        url: 'https://kinogo.ec' },
                { name: 'UAFlix / UA-Flix',                 url: 'https://uaflix.net' },
                { name: 'Kinobar / KinoBar',                url: 'https://kinobar.vip' },
                { name: 'Kinokrad (якщо працює)',           url: 'https://kinokrad.co' }
            ];

            sites.forEach(function(site) {
                var btn = $(
                    '<div class="selector settings-param__value selector--large" style="margin:0.6em 1em; padding:1em; border-radius:8px;">' +
                        site.name +
                    '</div>'
                );

                btn.on('hover:enter', function() {
                    Lampa.Noty.show('Відкриваю ' + site.name + ' у браузері Lampa...');
                    Lampa.Browser.open(site.url, {
                        // Дозволяємо повноекранний режим і плеєр
                        fullscreen: true,
                        autoplay: false
                    });
                });

                this.activity.render().append(btn);
            });

            // Додатковий пункт — якщо хочеш відкрити всі
            var allBtn = $('<div class="selector" style="margin:2em 1em; color:#ff9800;">Відкрити головну UASerials + UAKino</div>');
            allBtn.on('hover:enter', function() {
                Lampa.Browser.open('https://uaserials.com');
                setTimeout(() => Lampa.Browser.open('https://uakino.me'), 1500);
            });
            this.activity.render().append(allBtn);

            var note = $('<div style="padding:1.5em; color:#aaa; font-size:0.9em; text-align:center;">' +
                'Сайти відкриваються в браузері Lampa.<br>' +
                'Шукай фільм → клікай → плеєр повинен запуститись всередині Lampa.<br>' +
                'Якщо не грає — перевір VPN або дзеркало сайту.' +
            '</div>');
            this.activity.render().append(note);

            Lampa.Controller.toggle('content');
        }
    });

    // Автозапуск
    if (window.appready) {
        addMenuItem();
    } else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') addMenuItem();
        });
    }

})();
