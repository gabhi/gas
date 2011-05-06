
module('core');

test('_sanitizeString', function(){
    var san = _gas.gh._sanitizeString;
    expect(6);
    equals(san('  /tééééá íóú  '),'/teeeea_iou');
    equals(san(''),'');
    equals(san(' '),'');
    equals(san('ÇA ÄR'),'ca_ar');

    stop()
    _gas.push(function(){
        console.log('asdasd', this);
        equals(this._sanitizeString('Áéí óù '),'aei_ou', 
            'From within pushed function');
        start();
    });

    equals(san('&$*()[]/\éa', true), '_ea', 'strict mode');
});

test('_addHook _trackPageview', function(){
    expect(1);
    
    stop();
    
    _gas.push(['_addHook', '_trackPageview', function(page){
        equals(page, '/test.html', 'Check that Hook runs and has access to params');
        return false;
    }]);
    _gas.push(['_trackPageview', '/test.html']);

    // This should not execute
    _gas.push(['_addHook', '_trackPageview', function(page){
        equals(page, '/test.html');
        return false;
    }]);

    _gas.push(function(){start();});

    _gas.push(['_popHook', '_trackPageview']);
    _gas.push(['_popHook', '_trackPageview']);
});

test('_addHook _trackEvent', function(){
    expect(4);
    stop()

    _gas.push(['_addHook', '_trackEvent', function(category, action, label, value){
        equals(category, 'CATxX');
        equals(action, 'ACT');
        equals(label, 'LAB');
        equals(value, 13);
    }]);
    _gas.push(['_trackEvent', 'CATxX', 'ACT', 'LAB', 13]);

    _gas.push(function(){start();});
    _gas.push(['_popHook', '_trackEvent']);
});

test('_popHook', function(){
    expect(1);
    stop();

    _gas.push(['_addHook', '_testeTeste', function(t){
        equals(t, 't');
        return false;
    }]);
    _gas.push(['_testeTeste', 't']);
    _gas.push(['_popHook', '_testeTeste']);
    _gas.push(['_testeTeste', 't']);

    _gas.push(function(){start();});
});

test('_setAccount', function(){
    expect(3);

    // Remove previous accounts
    _gas._accounts = {};
    _gas._accounts_length = 0;

    _gas.push(['_setAccount', 'UA-XXXXX-1']);
    _gas.push(['_setAccount', 'UA-XXXXX-2']);
    _gas.push(['custom._setAccount', 'UA-XXXXX-3']);

    stop();

    _gas.push(function(){
        equals(_gas._accounts['_gas1'], 'UA-XXXXX-1');
        equals(_gas._accounts['_gas2'], 'UA-XXXXX-2');
        equals(_gas._accounts['custom'], 'UA-XXXXX-3');

        // Remove previous accounts
        _gas._accounts = {};
        _gas._accounts_length = 0;

        start();
    });
});

test('_gaq execution with and without named account', function(){
    expect(7);

    // Remove previous accounts
    _gas._accounts = {};
    _gas._accounts_length = 0;

    // Use fake _gaq
    var orig_gaq = window._gaq;
    window._gaq = {};


    // _setAccounts, 3 calls
    window._gaq['push'] = function(arr){
        if(typeof arr === 'function'){arr.call(this);return 1;}
        console.log('Fake _gaq.push: ', arr);
        ok(true, 'Account Pushed')
    };
    _gas.push(['_setAccount', 'UA-XXXXX-1']);
    _gas.push(['_setAccount', 'UA-XXXXX-2']);
    _gas.push(['custom._setAccount', 'UA-XXXXX-3']);


    // _trackPageview, 3 calls
    window._gaq['push'] = function(arr){
        if(typeof arr === 'function'){arr.call(this);return 1;}
        console.log('Fake _gaq.push: ', arr);
        ok(true, 'Pageview Pushed')
    };
    _gas.push(['_trackPageview',  '/test.html']);

    // custom._trackPageview, 1call
    window._gaq['push'] = function(arr){
        if(typeof arr === 'function'){arr.call(this);return 1;}
        console.log('Fake _gaq.push: ', arr);
        ok(true, 'custom tracker Pageview Pushed once')
    };
    _gas.push(['custom._trackPageview', '/test.html']);

    stop();
    _gas.push(function(){
        start();
        // Restore _gaq
        window._gaq = orig_gaq;

        // Remove previous accounts
        _gas._accounts = {};
        _gas._accounts_length = 0;
    });

});
