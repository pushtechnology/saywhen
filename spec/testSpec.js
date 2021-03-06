var when = require('../saywhen');

describe("a test spy", function() {
    var spy;

    beforeEach(function() {
        spy = jasmine.createSpy('foo');
    });

    it("calls a response", function() {
        when(spy).isCalledWith(jasmine.any(String), jasmine.any(Object)).then(function(str, obj) {
            return obj[str];
        });

        var result = spy("foo", { foo : "bar" });
        
        expect(result).toBe("bar");
    });

    it("doesn't call response with wrong type", function() {
        when(spy).isCalledWith(jasmine.any(String)).then(function() {
            return true;
        });

        expect(spy(123)).toBe(undefined);
    });

    it("can assign response value", function() {
        when(spy).isCalledWith(jasmine.any(String)).thenReturn("string");

        expect(spy("foo")).toBe("string");
        expect(spy(123)).toBe(undefined);
    });

    it("can use function as matcher", function() {
        var matcher = function(v) {
            return v === 123;
        };

        when(spy).isCalledWith(matcher).thenReturn(456);

        expect(spy(123)).toBe(456);
        expect(spy(456)).toBe(undefined);
    });

    it("works with value matching", function() {
        when(spy).isCalledWith("hello").thenReturn("world");

        expect(spy("hello")).toBe("world");
        expect(spy("goodbye")).toBe(undefined);
    });

    it("only does strict value matching", function() {
        when(spy).isCalledWith(123).thenReturn(456);

        expect(spy(123)).toBe(456);
        expect(spy("123")).toBe(undefined);
    });

    it("can use provided loose equals matcher", function() {
        when(spy).isCalledWith(when.is(123)).thenReturn(456);

        expect(spy(123)).toBe(456);
        expect(spy("123")).toBe(456);
        expect(spy("something else")).toBe(undefined);
    });

    it("uses complex object matching", function() {
        when(spy).isCalledWith(jasmine.objectContaining({
            foo : 123
        })).thenReturn(456);

        expect(spy({
            foo : 123,
            bar : "hello"
        })).toBe(456);

        expect(spy({
            foo : 789
        })).toBe(undefined);

        expect(spy({
            bar : "hello"
        })).toBe(undefined);
    });

    it("can throw errors", function() {
        when(spy).isCalledWith(123).thenThrow(new Error("foo"));

        expect(function() {
            spy(123);
        }).toThrow();

        expect(spy(456)).toBe(undefined);
    });

    it("can assign multiple responses", function() {
        when(spy).isCalledWith(jasmine.any(String))
            .then(function() {
                return 1;
            })
            .then(function() {
                return 2;
            })
            .then(function() {
                return 3;
            });

        expect(spy("first")).toBe(1);
        expect(spy("second")).toBe(2);
        expect(spy("third")).toBe(3);
    });

    it("can assign responses and return values", function() {
        when(spy).isCalledWith(jasmine.any(String))
            .then(function() {
                return 1;
            })
            .thenReturn(2);

        expect(spy("first")).toBe(1);
        expect(spy("second")).toBe(2);
    });

    it("calls single response multiple times", function() {
        when(spy).isCalledWith(jasmine.any(String)).then(function() {
            return 1;
        });

        expect(spy("foo")).toBe(1);
        expect(spy("foo")).toBe(1);
        expect(spy("bar")).toBe(1);
    });

    it("calls all responses and repeats last one", function() {
        when(spy).isCalledWith(jasmine.any(String))
            .then(function() {
                return 1;
            })
            .then(function() {
                return 2;
            });

        expect(spy("first")).toBe(1);
        expect(spy("second")).toBe(2);
        expect(spy("third")).toBe(2);
    });

    it("can set default handler", function() {
        when(spy).isCalled.thenReturn("foo");

        expect(spy()).toBe("foo");
        expect(spy("foo", 123, [4, 5, 6])).toBe("foo");
    });

    it("can set multiple responses to default handler", function() {
        when(spy).isCalled.thenReturn(1)
                          .thenReturn(2)
                          .thenReturn(3);

        expect(spy()).toBe(1);
        expect(spy()).toBe(2);
        expect(spy()).toBe(3);
        expect(spy()).toBe(3);
    });

    it("can set default handler and specific handler", function() {
        when(spy).isCalledWith("foo").thenReturn("bar");
        when(spy).isCalled.thenReturn("bing");

        expect(spy("foo")).toBe("bar");
        expect(spy("baz")).toBe("bing");
    });

    it("proxies and.callFake behaviour", function() {
        when(spy).isCalledWith('foo').thenReturn('bar');
        
        spy.and.callFake(function() {
            return 123;
        });

        expect(spy('foo')).toBe('bar');
        expect(spy()).toBe(123);
    });

    it("can assign multiple argument matchers", function() {
        when(spy).isCalledWith(jasmine.any(String)).then(function() {
            return "string";
        });

        when(spy).isCalledWith(jasmine.any(Number)).then(function() {
            return "number";
        });

        expect(spy("foo")).toBe("string");
        expect(spy(123)).toBe("number");
    });

    it("can be applied to spy object methods", function() {
        var spy = jasmine.createSpyObj('spy', ['fake1', 'fake2', 'fake3']);
        
        when(spy.fake1).isCalled.thenReturn(123);
        when(spy.fake2).isCalledWith(jasmine.any(String)).thenReturn(456);

        expect(spy.fake1()).toBe(123);
        expect(spy.fake2('foo')).toBe(456);
    });

    it("can use default argument captor", function() {
        var captor = when.captor();

        when(spy).isCalledWith(captor);

        spy("foo");

        expect(captor.latest).toBe("foo");
        expect(captor.values()).toEqual(["foo"]);
    });

    it("captors can track multiple arguments", function() {
         var captor = when.captor();

        when(spy).isCalledWith(captor);

        spy("foo");
        spy("bar");

        expect(captor.latest).toBe("bar");
        expect(captor.values()).toEqual(["foo", "bar"]);
    });

    it("captors only capture specific argument position", function() {
        var captor = when.captor();

        when(spy).isCalledWith("foo", captor);

        spy("foo", 123);
        spy("bar", 456);
        spy("foo", 789);

        expect(captor.latest).toBe(789);
        expect(captor.values()).toEqual([123, 789]);
    });

    it("captors can take value matchers", function() {
        var captor = when.captor('foo');

        when(spy).isCalledWith(captor);

        spy('foo');
        spy('bar');
        spy('foo');

        expect(captor.values()).toEqual(['foo', 'foo']);
    });

    it('captors can take jasmine.any matchers', function() {
        var captor = when.captor(jasmine.any(String));

        when(spy).isCalledWith(captor);
        
        spy('foo');
        spy(12345);
        spy([678]);
        spy('bar');

        expect(captor.latest).toBe('bar');
        expect(captor.values()).toEqual(['foo', 'bar']);
    });

    it('captors can be used with responses', function() {
        var captor = when.captor(jasmine.any(Number));

        when(spy).isCalledWith(captor).then(function(arg) { 
            return arg * 2;
        });

        expect(spy(1)).toBe(2);
        expect(spy(3)).toBe(6);
        expect(spy("foo")).toBe(undefined);

        expect(captor.latest).toBe(3);
        expect(captor.values()).toEqual([1, 3]);
    });
});
