
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    // Adapted from https://github.com/then/is-promise/blob/master/index.js
    // Distributed under MIT License https://github.com/then/is-promise/blob/master/LICENSE
    function is_promise(value) {
        return !!value && (typeof value === 'object' || typeof value === 'function') && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
        select.selectedIndex = -1; // no option should be selected
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            // @ts-ignore
            callbacks.slice().forEach(fn => fn.call(this, event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    let render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = /* @__PURE__ */ Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        // Do not reenter flush while dirty components are updated, as this can
        // result in an infinite loop. Instead, let the inner flush handle it.
        // Reentrancy is ok afterwards for bindings etc.
        if (flushidx !== 0) {
            return;
        }
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            try {
                while (flushidx < dirty_components.length) {
                    const component = dirty_components[flushidx];
                    flushidx++;
                    set_current_component(component);
                    update(component.$$);
                }
            }
            catch (e) {
                // reset dirty state to not end up in a deadlocked state and then rethrow
                dirty_components.length = 0;
                flushidx = 0;
                throw e;
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    /**
     * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
     */
    function flush_render_callbacks(fns) {
        const filtered = [];
        const targets = [];
        render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
        targets.forEach((c) => c());
        render_callbacks = filtered;
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        const updates = [];
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                // defer updates until all the DOM shuffling is done
                updates.push(() => block.p(child_ctx, dirty));
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next);
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        run_all(updates);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error('Cannot have duplicate keys in a keyed each');
            }
            keys.add(key);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
                // if the component was destroyed immediately
                // it will update the `$$.on_destroy` reference to `null`.
                // the destructured on_destroy may still reference to the old array
                if (component.$$.on_destroy) {
                    component.$$.on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            flush_render_callbacks($$.after_update);
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: [],
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            if (!is_function(callback)) {
                return noop;
            }
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.56.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation, has_stop_immediate_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        if (has_stop_immediate_propagation)
            modifiers.push('stopImmediatePropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src\Navbar.svelte generated by Svelte v3.56.0 */

    const file$5 = "src\\Navbar.svelte";

    function create_fragment$5(ctx) {
    	let nav;
    	let div2;
    	let div0;
    	let span0;
    	let span1;
    	let t2;
    	let div1;
    	let a;

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			div2 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "TaskChute";
    			span1 = element("span");
    			span1.textContent = "Clone";
    			t2 = space();
    			div1 = element("div");
    			a = element("a");
    			a.textContent = "PocketBase";
    			attr_dev(span0, "class", "font-bold flex-1");
    			add_location(span0, file$5, 2, 32, 114);
    			attr_dev(span1, "class", "font-light");
    			add_location(span1, file$5, 2, 79, 161);
    			attr_dev(div0, "class", "text-white");
    			add_location(div0, file$5, 2, 8, 90);
    			attr_dev(a, "href", "http://localhost:8090/_/");
    			add_location(a, file$5, 3, 57, 263);
    			attr_dev(div1, "class", "text-white rounded hover:opacity-75");
    			add_location(div1, file$5, 3, 8, 214);
    			attr_dev(div2, "class", "bg-slate-600 flex h-8 px-3 items-center justify-between");
    			add_location(div2, file$5, 1, 4, 11);
    			add_location(nav, file$5, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, div2);
    			append_dev(div2, div0);
    			append_dev(div0, span0);
    			append_dev(div0, span1);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div1, a);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Navbar', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Navbar> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Navbar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Navbar",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    var extendStatics=function(e,t){return extendStatics=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(e,t){e.__proto__=t;}||function(e,t){for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n]);},extendStatics(e,t)};function __extends(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Class extends value "+String(t)+" is not a constructor or null");function __(){this.constructor=e;}extendStatics(e,t),e.prototype=null===t?Object.create(t):(__.prototype=t.prototype,new __);}var __assign=function(){return __assign=Object.assign||function __assign(e){for(var t,n=1,i=arguments.length;n<i;n++)for(var o in t=arguments[n])Object.prototype.hasOwnProperty.call(t,o)&&(e[o]=t[o]);return e},__assign.apply(this,arguments)};function __awaiter(e,t,n,i){return new(n||(n=Promise))((function(o,r){function fulfilled(e){try{step(i.next(e));}catch(e){r(e);}}function rejected(e){try{step(i.throw(e));}catch(e){r(e);}}function step(e){e.done?o(e.value):function adopt(e){return e instanceof n?e:new n((function(t){t(e);}))}(e.value).then(fulfilled,rejected);}step((i=i.apply(e,t||[])).next());}))}function __generator(e,t){var n,i,o,r,s={label:0,sent:function(){if(1&o[0])throw o[1];return o[1]},trys:[],ops:[]};return r={next:verb(0),throw:verb(1),return:verb(2)},"function"==typeof Symbol&&(r[Symbol.iterator]=function(){return this}),r;function verb(r){return function(a){return function step(r){if(n)throw new TypeError("Generator is already executing.");for(;s;)try{if(n=1,i&&(o=2&r[0]?i.return:r[0]?i.throw||((o=i.return)&&o.call(i),0):i.next)&&!(o=o.call(i,r[1])).done)return o;switch(i=0,o&&(r=[2&r[0],o.value]),r[0]){case 0:case 1:o=r;break;case 4:return s.label++,{value:r[1],done:!1};case 5:s.label++,i=r[1],r=[0];continue;case 7:r=s.ops.pop(),s.trys.pop();continue;default:if(!(o=s.trys,(o=o.length>0&&o[o.length-1])||6!==r[0]&&2!==r[0])){s=0;continue}if(3===r[0]&&(!o||r[1]>o[0]&&r[1]<o[3])){s.label=r[1];break}if(6===r[0]&&s.label<o[1]){s.label=o[1],o=r;break}if(o&&s.label<o[2]){s.label=o[2],s.ops.push(r);break}o[2]&&s.ops.pop(),s.trys.pop();continue}r=t.call(e,s);}catch(e){r=[6,e],i=0;}finally{n=o=0;}if(5&r[0])throw r[1];return {value:r[0]?r[1]:void 0,done:!0}}([r,a])}}}var e,t=function(e){function ClientResponseError(t){var n,i,o,r,s=this;return (s=e.call(this,"ClientResponseError")||this).url="",s.status=0,s.response={},s.isAbort=!1,s.originalError=null,Object.setPrototypeOf(s,ClientResponseError.prototype),t instanceof ClientResponseError||(s.originalError=t),null!==t&&"object"==typeof t&&(s.url="string"==typeof t.url?t.url:"",s.status="number"==typeof t.status?t.status:0,s.response=null!==t.data&&"object"==typeof t.data?t.data:{},s.isAbort=!!t.isAbort),"undefined"!=typeof DOMException&&t instanceof DOMException&&(s.isAbort=!0),s.name="ClientResponseError "+s.status,s.message=null===(n=s.response)||void 0===n?void 0:n.message,s.message||(s.isAbort?s.message="The request was autocancelled. You can find more info in https://github.com/pocketbase/js-sdk#auto-cancellation.":(null===(r=null===(o=null===(i=s.originalError)||void 0===i?void 0:i.cause)||void 0===o?void 0:o.message)||void 0===r?void 0:r.includes("ECONNREFUSED ::1"))?s.message="Failed to connect to the PocketBase server. Try changing the SDK URL from localhost to 127.0.0.1 (https://github.com/pocketbase/js-sdk/issues/21).":s.message="Something went wrong while processing your request."),s}return __extends(ClientResponseError,e),Object.defineProperty(ClientResponseError.prototype,"data",{get:function(){return this.response},enumerable:!1,configurable:!0}),ClientResponseError.prototype.toJSON=function(){return __assign({},this)},ClientResponseError}(Error),n=/^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;function cookieSerialize(e,t,i){var o=Object.assign({},i||{}),r=o.encode||defaultEncode;if(!n.test(e))throw new TypeError("argument name is invalid");var s=r(t);if(s&&!n.test(s))throw new TypeError("argument val is invalid");var a=e+"="+s;if(null!=o.maxAge){var c=o.maxAge-0;if(isNaN(c)||!isFinite(c))throw new TypeError("option maxAge is invalid");a+="; Max-Age="+Math.floor(c);}if(o.domain){if(!n.test(o.domain))throw new TypeError("option domain is invalid");a+="; Domain="+o.domain;}if(o.path){if(!n.test(o.path))throw new TypeError("option path is invalid");a+="; Path="+o.path;}if(o.expires){if(!function isDate(e){return "[object Date]"===Object.prototype.toString.call(e)||e instanceof Date}(o.expires)||isNaN(o.expires.valueOf()))throw new TypeError("option expires is invalid");a+="; Expires="+o.expires.toUTCString();}if(o.httpOnly&&(a+="; HttpOnly"),o.secure&&(a+="; Secure"),o.priority)switch("string"==typeof o.priority?o.priority.toLowerCase():o.priority){case"low":a+="; Priority=Low";break;case"medium":a+="; Priority=Medium";break;case"high":a+="; Priority=High";break;default:throw new TypeError("option priority is invalid")}if(o.sameSite)switch("string"==typeof o.sameSite?o.sameSite.toLowerCase():o.sameSite){case!0:a+="; SameSite=Strict";break;case"lax":a+="; SameSite=Lax";break;case"strict":a+="; SameSite=Strict";break;case"none":a+="; SameSite=None";break;default:throw new TypeError("option sameSite is invalid")}return a}function defaultDecode(e){return -1!==e.indexOf("%")?decodeURIComponent(e):e}function defaultEncode(e){return encodeURIComponent(e)}function getTokenPayload(t){if(t)try{var n=decodeURIComponent(e(t.split(".")[1]).split("").map((function(e){return "%"+("00"+e.charCodeAt(0).toString(16)).slice(-2)})).join(""));return JSON.parse(n)||{}}catch(e){}return {}}e="function"==typeof atob?atob:function(e){var t=String(e).replace(/=+$/,"");if(t.length%4==1)throw new Error("'atob' failed: The string to be decoded is not correctly encoded.");for(var n,i,o=0,r=0,s="";i=t.charAt(r++);~i&&(n=o%4?64*n+i:i,o++%4)?s+=String.fromCharCode(255&n>>(-2*o&6)):0)i="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=".indexOf(i);return s};var i=function(){function BaseModel(e){void 0===e&&(e={}),this.load(e||{});}return BaseModel.prototype.load=function(e){for(var t=0,n=Object.entries(e);t<n.length;t++){var i=n[t],o=i[0],r=i[1];this[o]=r;}this.id=void 0!==e.id?e.id:"",this.created=void 0!==e.created?e.created:"",this.updated=void 0!==e.updated?e.updated:"";},Object.defineProperty(BaseModel.prototype,"isNew",{get:function(){return !this.id},enumerable:!1,configurable:!0}),BaseModel.prototype.clone=function(){var e="function"==typeof structuredClone?structuredClone(this):JSON.parse(JSON.stringify(this));return new this.constructor(e)},BaseModel.prototype.export=function(){return Object.assign({},this)},BaseModel}(),o=function(e){function Record(){return null!==e&&e.apply(this,arguments)||this}return __extends(Record,e),Record.prototype.load=function(t){e.prototype.load.call(this,t),this.collectionId="string"==typeof t.collectionId?t.collectionId:"",this.collectionName="string"==typeof t.collectionName?t.collectionName:"",this.loadExpand(t.expand);},Record.prototype.loadExpand=function(e){for(var t in e=e||{},this.expand={},e)Array.isArray(e[t])?this.expand[t]=e[t].map((function(e){return new Record(e||{})})):this.expand[t]=new Record(e[t]||{});},Record}(i),r=function(e){function Admin(){return null!==e&&e.apply(this,arguments)||this}return __extends(Admin,e),Admin.prototype.load=function(t){e.prototype.load.call(this,t),this.avatar="number"==typeof t.avatar?t.avatar:0,this.email="string"==typeof t.email?t.email:"";},Admin}(i),s=function(){function BaseAuthStore(){this.baseToken="",this.baseModel=null,this._onChangeCallbacks=[];}return Object.defineProperty(BaseAuthStore.prototype,"token",{get:function(){return this.baseToken},enumerable:!1,configurable:!0}),Object.defineProperty(BaseAuthStore.prototype,"model",{get:function(){return this.baseModel},enumerable:!1,configurable:!0}),Object.defineProperty(BaseAuthStore.prototype,"isValid",{get:function(){return !function isTokenExpired(e,t){void 0===t&&(t=0);var n=getTokenPayload(e);return !(Object.keys(n).length>0&&(!n.exp||n.exp-t>Date.now()/1e3))}(this.token)},enumerable:!1,configurable:!0}),BaseAuthStore.prototype.save=function(e,t){this.baseToken=e||"",this.baseModel=null!==t&&"object"==typeof t?void 0!==t.collectionId?new o(t):new r(t):null,this.triggerChange();},BaseAuthStore.prototype.clear=function(){this.baseToken="",this.baseModel=null,this.triggerChange();},BaseAuthStore.prototype.loadFromCookie=function(e,t){void 0===t&&(t="pb_auth");var n=function cookieParse(e,t){var n={};if("string"!=typeof e)return n;for(var i=Object.assign({},t||{}).decode||defaultDecode,o=0;o<e.length;){var r=e.indexOf("=",o);if(-1===r)break;var s=e.indexOf(";",o);if(-1===s)s=e.length;else if(s<r){o=e.lastIndexOf(";",r-1)+1;continue}var a=e.slice(o,r).trim();if(void 0===n[a]){var c=e.slice(r+1,s).trim();34===c.charCodeAt(0)&&(c=c.slice(1,-1));try{n[a]=i(c);}catch(e){n[a]=c;}}o=s+1;}return n}(e||"")[t]||"",i={};try{(null===typeof(i=JSON.parse(n))||"object"!=typeof i||Array.isArray(i))&&(i={});}catch(e){}this.save(i.token||"",i.model||null);},BaseAuthStore.prototype.exportToCookie=function(e,t){var n,i,r;void 0===t&&(t="pb_auth");var s={secure:!0,sameSite:!0,httpOnly:!0,path:"/"},a=getTokenPayload(this.token);(null==a?void 0:a.exp)?s.expires=new Date(1e3*a.exp):s.expires=new Date("1970-01-01"),e=Object.assign({},s,e);var c={token:this.token,model:(null===(n=this.model)||void 0===n?void 0:n.export())||null},u=cookieSerialize(t,JSON.stringify(c),e),l="undefined"!=typeof Blob?new Blob([u]).size:u.length;return c.model&&l>4096&&(c.model={id:null===(i=null==c?void 0:c.model)||void 0===i?void 0:i.id,email:null===(r=null==c?void 0:c.model)||void 0===r?void 0:r.email},this.model instanceof o&&(c.model.username=this.model.username,c.model.verified=this.model.verified,c.model.collectionId=this.model.collectionId),u=cookieSerialize(t,JSON.stringify(c),e)),u},BaseAuthStore.prototype.onChange=function(e,t){var n=this;return void 0===t&&(t=!1),this._onChangeCallbacks.push(e),t&&e(this.token,this.model),function(){for(var t=n._onChangeCallbacks.length-1;t>=0;t--)if(n._onChangeCallbacks[t]==e)return delete n._onChangeCallbacks[t],void n._onChangeCallbacks.splice(t,1)}},BaseAuthStore.prototype.triggerChange=function(){for(var e=0,t=this._onChangeCallbacks;e<t.length;e++){var n=t[e];n&&n(this.token,this.model);}},BaseAuthStore}(),a=function(e){function LocalAuthStore(t){void 0===t&&(t="pocketbase_auth");var n=e.call(this)||this;return n.storageFallback={},n.storageKey=t,n}return __extends(LocalAuthStore,e),Object.defineProperty(LocalAuthStore.prototype,"token",{get:function(){return (this._storageGet(this.storageKey)||{}).token||""},enumerable:!1,configurable:!0}),Object.defineProperty(LocalAuthStore.prototype,"model",{get:function(){var e,t=this._storageGet(this.storageKey)||{};return null===t||"object"!=typeof t||null===t.model||"object"!=typeof t.model?null:void 0===(null===(e=t.model)||void 0===e?void 0:e.collectionId)?new r(t.model):new o(t.model)},enumerable:!1,configurable:!0}),LocalAuthStore.prototype.save=function(t,n){this._storageSet(this.storageKey,{token:t,model:n}),e.prototype.save.call(this,t,n);},LocalAuthStore.prototype.clear=function(){this._storageRemove(this.storageKey),e.prototype.clear.call(this);},LocalAuthStore.prototype._storageGet=function(e){if("undefined"!=typeof window&&(null===window||void 0===window?void 0:window.localStorage)){var t=window.localStorage.getItem(e)||"";try{return JSON.parse(t)}catch(e){return t}}return this.storageFallback[e]},LocalAuthStore.prototype._storageSet=function(e,t){if("undefined"!=typeof window&&(null===window||void 0===window?void 0:window.localStorage)){var n=t;"string"!=typeof t&&(n=JSON.stringify(t)),window.localStorage.setItem(e,n);}else this.storageFallback[e]=t;},LocalAuthStore.prototype._storageRemove=function(e){var t;"undefined"!=typeof window&&(null===window||void 0===window?void 0:window.localStorage)&&(null===(t=window.localStorage)||void 0===t||t.removeItem(e)),delete this.storageFallback[e];},LocalAuthStore}(s),c=function c(e){this.client=e;},u=function(e){function SettingsService(){return null!==e&&e.apply(this,arguments)||this}return __extends(SettingsService,e),SettingsService.prototype.getAll=function(e){return void 0===e&&(e={}),this.client.send("/api/settings",{method:"GET",params:e}).then((function(e){return e||{}}))},SettingsService.prototype.update=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),this.client.send("/api/settings",{method:"PATCH",params:t,body:e}).then((function(e){return e||{}}))},SettingsService.prototype.testS3=function(e){return void 0===e&&(e={}),this.client.send("/api/settings/test/s3",{method:"POST",params:e}).then((function(){return !0}))},SettingsService.prototype.testEmail=function(e,t,n){void 0===n&&(n={});var i={email:e,template:t};return this.client.send("/api/settings/test/email",{method:"POST",params:n,body:i}).then((function(){return !0}))},SettingsService}(c),l=function l(e,t,n,i,o){this.page=e>0?e:1,this.perPage=t>=0?t:0,this.totalItems=n>=0?n:0,this.totalPages=i>=0?i:0,this.items=o||[];},d=function(e){function CrudService(){return null!==e&&e.apply(this,arguments)||this}return __extends(CrudService,e),CrudService.prototype.getFullList=function(e,t){if("number"==typeof e)return this._getFullList(this.baseCrudPath,e,t);var n=Object.assign({},e,t);return this._getFullList(this.baseCrudPath,n.batch||200,n)},CrudService.prototype.getList=function(e,t,n){return void 0===e&&(e=1),void 0===t&&(t=30),void 0===n&&(n={}),this._getList(this.baseCrudPath,e,t,n)},CrudService.prototype.getFirstListItem=function(e,t){return void 0===t&&(t={}),this._getFirstListItem(this.baseCrudPath,e,t)},CrudService.prototype.getOne=function(e,t){return void 0===t&&(t={}),this._getOne(this.baseCrudPath,e,t)},CrudService.prototype.create=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),this._create(this.baseCrudPath,e,t)},CrudService.prototype.update=function(e,t,n){return void 0===t&&(t={}),void 0===n&&(n={}),this._update(this.baseCrudPath,e,t,n)},CrudService.prototype.delete=function(e,t){return void 0===t&&(t={}),this._delete(this.baseCrudPath,e,t)},CrudService}(function(e){function BaseCrudService(){return null!==e&&e.apply(this,arguments)||this}return __extends(BaseCrudService,e),BaseCrudService.prototype._getFullList=function(e,t,n){var i=this;void 0===t&&(t=200),void 0===n&&(n={});var o=[],request=function(r){return __awaiter(i,void 0,void 0,(function(){return __generator(this,(function(i){return [2,this._getList(e,r,t||200,n).then((function(e){var t=e,n=t.items,i=t.totalItems;return o=o.concat(n),n.length&&i>o.length?request(r+1):o}))]}))}))};return request(1)},BaseCrudService.prototype._getList=function(e,t,n,i){var o=this;return void 0===t&&(t=1),void 0===n&&(n=30),void 0===i&&(i={}),i=Object.assign({page:t,perPage:n},i),this.client.send(e,{method:"GET",params:i}).then((function(e){var t=[];if(null==e?void 0:e.items){e.items=e.items||[];for(var n=0,i=e.items;n<i.length;n++){var r=i[n];t.push(o.decode(r));}}return new l((null==e?void 0:e.page)||1,(null==e?void 0:e.perPage)||0,(null==e?void 0:e.totalItems)||0,(null==e?void 0:e.totalPages)||0,t)}))},BaseCrudService.prototype._getOne=function(e,t,n){var i=this;return void 0===n&&(n={}),this.client.send(e+"/"+encodeURIComponent(t),{method:"GET",params:n}).then((function(e){return i.decode(e)}))},BaseCrudService.prototype._getFirstListItem=function(e,n,i){return void 0===i&&(i={}),i=Object.assign({filter:n,$cancelKey:"one_by_filter_"+e+"_"+n},i),this._getList(e,1,1,i).then((function(e){var n;if(!(null===(n=null==e?void 0:e.items)||void 0===n?void 0:n.length))throw new t({status:404,data:{code:404,message:"The requested resource wasn't found.",data:{}}});return e.items[0]}))},BaseCrudService.prototype._create=function(e,t,n){var i=this;return void 0===t&&(t={}),void 0===n&&(n={}),this.client.send(e,{method:"POST",params:n,body:t}).then((function(e){return i.decode(e)}))},BaseCrudService.prototype._update=function(e,t,n,i){var o=this;return void 0===n&&(n={}),void 0===i&&(i={}),this.client.send(e+"/"+encodeURIComponent(t),{method:"PATCH",params:i,body:n}).then((function(e){return o.decode(e)}))},BaseCrudService.prototype._delete=function(e,t,n){return void 0===n&&(n={}),this.client.send(e+"/"+encodeURIComponent(t),{method:"DELETE",params:n}).then((function(){return !0}))},BaseCrudService}(c)),h=function(e){function AdminService(){return null!==e&&e.apply(this,arguments)||this}return __extends(AdminService,e),AdminService.prototype.decode=function(e){return new r(e)},Object.defineProperty(AdminService.prototype,"baseCrudPath",{get:function(){return "/api/admins"},enumerable:!1,configurable:!0}),AdminService.prototype.update=function(t,n,i){var o=this;return void 0===n&&(n={}),void 0===i&&(i={}),e.prototype.update.call(this,t,n,i).then((function(e){var t,n;return o.client.authStore.model&&void 0===(null===(t=o.client.authStore.model)||void 0===t?void 0:t.collectionId)&&(null===(n=o.client.authStore.model)||void 0===n?void 0:n.id)===(null==e?void 0:e.id)&&o.client.authStore.save(o.client.authStore.token,e),e}))},AdminService.prototype.delete=function(t,n){var i=this;return void 0===n&&(n={}),e.prototype.delete.call(this,t,n).then((function(e){var n,o;return e&&i.client.authStore.model&&void 0===(null===(n=i.client.authStore.model)||void 0===n?void 0:n.collectionId)&&(null===(o=i.client.authStore.model)||void 0===o?void 0:o.id)===t&&i.client.authStore.clear(),e}))},AdminService.prototype.authResponse=function(e){var t=this.decode((null==e?void 0:e.admin)||{});return (null==e?void 0:e.token)&&(null==e?void 0:e.admin)&&this.client.authStore.save(e.token,t),Object.assign({},e,{token:(null==e?void 0:e.token)||"",admin:t})},AdminService.prototype.authWithPassword=function(e,t,n,i){return void 0===n&&(n={}),void 0===i&&(i={}),n=Object.assign({identity:e,password:t},n),this.client.send(this.baseCrudPath+"/auth-with-password",{method:"POST",params:i,body:n}).then(this.authResponse.bind(this))},AdminService.prototype.authRefresh=function(e,t){return void 0===e&&(e={}),void 0===t&&(t={}),this.client.send(this.baseCrudPath+"/auth-refresh",{method:"POST",params:t,body:e}).then(this.authResponse.bind(this))},AdminService.prototype.requestPasswordReset=function(e,t,n){return void 0===t&&(t={}),void 0===n&&(n={}),t=Object.assign({email:e},t),this.client.send(this.baseCrudPath+"/request-password-reset",{method:"POST",params:n,body:t}).then((function(){return !0}))},AdminService.prototype.confirmPasswordReset=function(e,t,n,i,o){return void 0===i&&(i={}),void 0===o&&(o={}),i=Object.assign({token:e,password:t,passwordConfirm:n},i),this.client.send(this.baseCrudPath+"/confirm-password-reset",{method:"POST",params:o,body:i}).then((function(){return !0}))},AdminService}(d),p=function(e){function ExternalAuth(){return null!==e&&e.apply(this,arguments)||this}return __extends(ExternalAuth,e),ExternalAuth.prototype.load=function(t){e.prototype.load.call(this,t),this.recordId="string"==typeof t.recordId?t.recordId:"",this.collectionId="string"==typeof t.collectionId?t.collectionId:"",this.provider="string"==typeof t.provider?t.provider:"",this.providerId="string"==typeof t.providerId?t.providerId:"";},ExternalAuth}(i),v=function(e){function RecordService(t,n){var i=e.call(this,t)||this;return i.collectionIdOrName=n,i}return __extends(RecordService,e),RecordService.prototype.decode=function(e){return new o(e)},Object.defineProperty(RecordService.prototype,"baseCrudPath",{get:function(){return this.baseCollectionPath+"/records"},enumerable:!1,configurable:!0}),Object.defineProperty(RecordService.prototype,"baseCollectionPath",{get:function(){return "/api/collections/"+encodeURIComponent(this.collectionIdOrName)},enumerable:!1,configurable:!0}),RecordService.prototype.subscribeOne=function(e,t){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(n){return console.warn("PocketBase: subscribeOne(recordId, callback) is deprecated. Please replace it with subscribe(recordId, callback)."),[2,this.client.realtime.subscribe(this.collectionIdOrName+"/"+e,t)]}))}))},RecordService.prototype.subscribe=function(e,t){return __awaiter(this,void 0,void 0,(function(){var n;return __generator(this,(function(i){if("function"==typeof e)return console.warn("PocketBase: subscribe(callback) is deprecated. Please replace it with subscribe('*', callback)."),[2,this.client.realtime.subscribe(this.collectionIdOrName,e)];if(!t)throw new Error("Missing subscription callback.");if(""===e)throw new Error("Missing topic.");return n=this.collectionIdOrName,"*"!==e&&(n+="/"+e),[2,this.client.realtime.subscribe(n,t)]}))}))},RecordService.prototype.unsubscribe=function(e){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(t){return "*"===e?[2,this.client.realtime.unsubscribe(this.collectionIdOrName)]:e?[2,this.client.realtime.unsubscribe(this.collectionIdOrName+"/"+e)]:[2,this.client.realtime.unsubscribeByPrefix(this.collectionIdOrName)]}))}))},RecordService.prototype.getFullList=function(t,n){if("number"==typeof t)return e.prototype.getFullList.call(this,t,n);var i=Object.assign({},t,n);return e.prototype.getFullList.call(this,i)},RecordService.prototype.getList=function(t,n,i){return void 0===t&&(t=1),void 0===n&&(n=30),void 0===i&&(i={}),e.prototype.getList.call(this,t,n,i)},RecordService.prototype.getFirstListItem=function(t,n){return void 0===n&&(n={}),e.prototype.getFirstListItem.call(this,t,n)},RecordService.prototype.getOne=function(t,n){return void 0===n&&(n={}),e.prototype.getOne.call(this,t,n)},RecordService.prototype.create=function(t,n){return void 0===t&&(t={}),void 0===n&&(n={}),e.prototype.create.call(this,t,n)},RecordService.prototype.update=function(t,n,i){var o=this;return void 0===n&&(n={}),void 0===i&&(i={}),e.prototype.update.call(this,t,n,i).then((function(e){var t,n,i;return (null===(t=o.client.authStore.model)||void 0===t?void 0:t.id)!==(null==e?void 0:e.id)||(null===(n=o.client.authStore.model)||void 0===n?void 0:n.collectionId)!==o.collectionIdOrName&&(null===(i=o.client.authStore.model)||void 0===i?void 0:i.collectionName)!==o.collectionIdOrName||o.client.authStore.save(o.client.authStore.token,e),e}))},RecordService.prototype.delete=function(t,n){var i=this;return void 0===n&&(n={}),e.prototype.delete.call(this,t,n).then((function(e){var n,o,r;return !e||(null===(n=i.client.authStore.model)||void 0===n?void 0:n.id)!==t||(null===(o=i.client.authStore.model)||void 0===o?void 0:o.collectionId)!==i.collectionIdOrName&&(null===(r=i.client.authStore.model)||void 0===r?void 0:r.collectionName)!==i.collectionIdOrName||i.client.authStore.clear(),e}))},RecordService.prototype.authResponse=function(e){var t=this.decode((null==e?void 0:e.record)||{});return this.client.authStore.save(null==e?void 0:e.token,t),Object.assign({},e,{token:(null==e?void 0:e.token)||"",record:t})},RecordService.prototype.listAuthMethods=function(e){return void 0===e&&(e={}),this.client.send(this.baseCollectionPath+"/auth-methods",{method:"GET",params:e}).then((function(e){return Object.assign({},e,{usernamePassword:!!(null==e?void 0:e.usernamePassword),emailPassword:!!(null==e?void 0:e.emailPassword),authProviders:Array.isArray(null==e?void 0:e.authProviders)?null==e?void 0:e.authProviders:[]})}))},RecordService.prototype.authWithPassword=function(e,t,n,i){var o=this;return void 0===n&&(n={}),void 0===i&&(i={}),n=Object.assign({identity:e,password:t},n),this.client.send(this.baseCollectionPath+"/auth-with-password",{method:"POST",params:i,body:n}).then((function(e){return o.authResponse(e)}))},RecordService.prototype.authWithOAuth2=function(e,t,n,i,o,r,s){var a=this;return void 0===o&&(o={}),void 0===r&&(r={}),void 0===s&&(s={}),r=Object.assign({provider:e,code:t,codeVerifier:n,redirectUrl:i,createData:o},r),this.client.send(this.baseCollectionPath+"/auth-with-oauth2",{method:"POST",params:s,body:r}).then((function(e){return a.authResponse(e)}))},RecordService.prototype.authRefresh=function(e,t){var n=this;return void 0===e&&(e={}),void 0===t&&(t={}),this.client.send(this.baseCollectionPath+"/auth-refresh",{method:"POST",params:t,body:e}).then((function(e){return n.authResponse(e)}))},RecordService.prototype.requestPasswordReset=function(e,t,n){return void 0===t&&(t={}),void 0===n&&(n={}),t=Object.assign({email:e},t),this.client.send(this.baseCollectionPath+"/request-password-reset",{method:"POST",params:n,body:t}).then((function(){return !0}))},RecordService.prototype.confirmPasswordReset=function(e,t,n,i,o){return void 0===i&&(i={}),void 0===o&&(o={}),i=Object.assign({token:e,password:t,passwordConfirm:n},i),this.client.send(this.baseCollectionPath+"/confirm-password-reset",{method:"POST",params:o,body:i}).then((function(){return !0}))},RecordService.prototype.requestVerification=function(e,t,n){return void 0===t&&(t={}),void 0===n&&(n={}),t=Object.assign({email:e},t),this.client.send(this.baseCollectionPath+"/request-verification",{method:"POST",params:n,body:t}).then((function(){return !0}))},RecordService.prototype.confirmVerification=function(e,t,n){return void 0===t&&(t={}),void 0===n&&(n={}),t=Object.assign({token:e},t),this.client.send(this.baseCollectionPath+"/confirm-verification",{method:"POST",params:n,body:t}).then((function(){return !0}))},RecordService.prototype.requestEmailChange=function(e,t,n){return void 0===t&&(t={}),void 0===n&&(n={}),t=Object.assign({newEmail:e},t),this.client.send(this.baseCollectionPath+"/request-email-change",{method:"POST",params:n,body:t}).then((function(){return !0}))},RecordService.prototype.confirmEmailChange=function(e,t,n,i){return void 0===n&&(n={}),void 0===i&&(i={}),n=Object.assign({token:e,password:t},n),this.client.send(this.baseCollectionPath+"/confirm-email-change",{method:"POST",params:i,body:n}).then((function(){return !0}))},RecordService.prototype.listExternalAuths=function(e,t){return void 0===t&&(t={}),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e)+"/external-auths",{method:"GET",params:t}).then((function(e){var t=[];if(Array.isArray(e))for(var n=0,i=e;n<i.length;n++){var o=i[n];t.push(new p(o));}return t}))},RecordService.prototype.unlinkExternalAuth=function(e,t,n){return void 0===n&&(n={}),this.client.send(this.baseCrudPath+"/"+encodeURIComponent(e)+"/external-auths/"+encodeURIComponent(t),{method:"DELETE",params:n}).then((function(){return !0}))},RecordService}(d),f=function(){function SchemaField(e){void 0===e&&(e={}),this.load(e||{});}return SchemaField.prototype.load=function(e){this.id=void 0!==e.id?e.id:"",this.name=void 0!==e.name?e.name:"",this.type=void 0!==e.type?e.type:"text",this.system=!!e.system,this.required=!!e.required,this.unique=!!e.unique,this.options="object"==typeof e.options&&null!==e.options?e.options:{};},SchemaField}(),m=function(e){function Collection(){return null!==e&&e.apply(this,arguments)||this}return __extends(Collection,e),Collection.prototype.load=function(t){e.prototype.load.call(this,t),this.system=!!t.system,this.name="string"==typeof t.name?t.name:"",this.type="string"==typeof t.type?t.type:"base",this.options=void 0!==t.options?t.options:{},this.listRule="string"==typeof t.listRule?t.listRule:null,this.viewRule="string"==typeof t.viewRule?t.viewRule:null,this.createRule="string"==typeof t.createRule?t.createRule:null,this.updateRule="string"==typeof t.updateRule?t.updateRule:null,this.deleteRule="string"==typeof t.deleteRule?t.deleteRule:null,t.schema=Array.isArray(t.schema)?t.schema:[],this.schema=[];for(var n=0,i=t.schema;n<i.length;n++){var o=i[n];this.schema.push(new f(o));}},Object.defineProperty(Collection.prototype,"isBase",{get:function(){return "base"===this.type},enumerable:!1,configurable:!0}),Object.defineProperty(Collection.prototype,"isAuth",{get:function(){return "auth"===this.type},enumerable:!1,configurable:!0}),Object.defineProperty(Collection.prototype,"isView",{get:function(){return "view"===this.type},enumerable:!1,configurable:!0}),Collection}(i),b=function(e){function CollectionService(){return null!==e&&e.apply(this,arguments)||this}return __extends(CollectionService,e),CollectionService.prototype.decode=function(e){return new m(e)},Object.defineProperty(CollectionService.prototype,"baseCrudPath",{get:function(){return "/api/collections"},enumerable:!1,configurable:!0}),CollectionService.prototype.import=function(e,t,n){return void 0===t&&(t=!1),void 0===n&&(n={}),__awaiter(this,void 0,void 0,(function(){return __generator(this,(function(i){return [2,this.client.send(this.baseCrudPath+"/import",{method:"PUT",params:n,body:{collections:e,deleteMissing:t}}).then((function(){return !0}))]}))}))},CollectionService}(d),y=function(e){function LogRequest(){return null!==e&&e.apply(this,arguments)||this}return __extends(LogRequest,e),LogRequest.prototype.load=function(t){e.prototype.load.call(this,t),t.remoteIp=t.remoteIp||t.ip,this.url="string"==typeof t.url?t.url:"",this.method="string"==typeof t.method?t.method:"GET",this.status="number"==typeof t.status?t.status:200,this.auth="string"==typeof t.auth?t.auth:"guest",this.remoteIp="string"==typeof t.remoteIp?t.remoteIp:"",this.userIp="string"==typeof t.userIp?t.userIp:"",this.referer="string"==typeof t.referer?t.referer:"",this.userAgent="string"==typeof t.userAgent?t.userAgent:"",this.meta="object"==typeof t.meta&&null!==t.meta?t.meta:{};},LogRequest}(i),g=function(e){function LogService(){return null!==e&&e.apply(this,arguments)||this}return __extends(LogService,e),LogService.prototype.getRequestsList=function(e,t,n){return void 0===e&&(e=1),void 0===t&&(t=30),void 0===n&&(n={}),n=Object.assign({page:e,perPage:t},n),this.client.send("/api/logs/requests",{method:"GET",params:n}).then((function(e){var t=[];if(null==e?void 0:e.items){e.items=(null==e?void 0:e.items)||[];for(var n=0,i=e.items;n<i.length;n++){var o=i[n];t.push(new y(o));}}return new l((null==e?void 0:e.page)||1,(null==e?void 0:e.perPage)||0,(null==e?void 0:e.totalItems)||0,(null==e?void 0:e.totalPages)||0,t)}))},LogService.prototype.getRequest=function(e,t){return void 0===t&&(t={}),this.client.send("/api/logs/requests/"+encodeURIComponent(e),{method:"GET",params:t}).then((function(e){return new y(e)}))},LogService.prototype.getRequestsStats=function(e){return void 0===e&&(e={}),this.client.send("/api/logs/requests/stats",{method:"GET",params:e}).then((function(e){return e}))},LogService}(c),S=function(e){function RealtimeService(){var t=null!==e&&e.apply(this,arguments)||this;return t.clientId="",t.eventSource=null,t.subscriptions={},t.lastSentTopics=[],t.maxConnectTimeout=15e3,t.reconnectAttempts=0,t.maxReconnectAttempts=1/0,t.predefinedReconnectIntervals=[200,300,500,1e3,1200,1500,2e3],t.pendingConnects=[],t}return __extends(RealtimeService,e),Object.defineProperty(RealtimeService.prototype,"isConnected",{get:function(){return !!this.eventSource&&!!this.clientId&&!this.pendingConnects.length},enumerable:!1,configurable:!0}),RealtimeService.prototype.subscribe=function(e,t){var n;return __awaiter(this,void 0,void 0,(function(){var i,o=this;return __generator(this,(function(r){switch(r.label){case 0:if(!e)throw new Error("topic must be set.");return i=function(e){var n,i=e;try{n=JSON.parse(null==i?void 0:i.data);}catch(e){}t(n||{});},this.subscriptions[e]||(this.subscriptions[e]=[]),this.subscriptions[e].push(i),this.isConnected?[3,2]:[4,this.connect()];case 1:return r.sent(),[3,5];case 2:return 1!==this.subscriptions[e].length?[3,4]:[4,this.submitSubscriptions()];case 3:return r.sent(),[3,5];case 4:null===(n=this.eventSource)||void 0===n||n.addEventListener(e,i),r.label=5;case 5:return [2,function(){return __awaiter(o,void 0,void 0,(function(){return __generator(this,(function(t){return [2,this.unsubscribeByTopicAndListener(e,i)]}))}))}]}}))}))},RealtimeService.prototype.unsubscribe=function(e){var t;return __awaiter(this,void 0,void 0,(function(){var n,i,o;return __generator(this,(function(r){switch(r.label){case 0:if(!this.hasSubscriptionListeners(e))return [2];if(e){for(n=0,i=this.subscriptions[e];n<i.length;n++)o=i[n],null===(t=this.eventSource)||void 0===t||t.removeEventListener(e,o);delete this.subscriptions[e];}else this.subscriptions={};return this.hasSubscriptionListeners()?[3,1]:(this.disconnect(),[3,3]);case 1:return this.hasSubscriptionListeners(e)?[3,3]:[4,this.submitSubscriptions()];case 2:r.sent(),r.label=3;case 3:return [2]}}))}))},RealtimeService.prototype.unsubscribeByPrefix=function(e){var t;return __awaiter(this,void 0,void 0,(function(){var n,i,o,r,s;return __generator(this,(function(a){switch(a.label){case 0:for(i in n=!1,this.subscriptions)if(i.startsWith(e)){for(n=!0,o=0,r=this.subscriptions[i];o<r.length;o++)s=r[o],null===(t=this.eventSource)||void 0===t||t.removeEventListener(i,s);delete this.subscriptions[i];}return n?this.hasSubscriptionListeners()?[4,this.submitSubscriptions()]:[3,2]:[2];case 1:return a.sent(),[3,3];case 2:this.disconnect(),a.label=3;case 3:return [2]}}))}))},RealtimeService.prototype.unsubscribeByTopicAndListener=function(e,t){var n;return __awaiter(this,void 0,void 0,(function(){var i,o;return __generator(this,(function(r){switch(r.label){case 0:if(!Array.isArray(this.subscriptions[e])||!this.subscriptions[e].length)return [2];for(i=!1,o=this.subscriptions[e].length-1;o>=0;o--)this.subscriptions[e][o]===t&&(i=!0,delete this.subscriptions[e][o],this.subscriptions[e].splice(o,1),null===(n=this.eventSource)||void 0===n||n.removeEventListener(e,t));return i?(this.subscriptions[e].length||delete this.subscriptions[e],this.hasSubscriptionListeners()?[3,1]:(this.disconnect(),[3,3])):[2];case 1:return this.hasSubscriptionListeners(e)?[3,3]:[4,this.submitSubscriptions()];case 2:r.sent(),r.label=3;case 3:return [2]}}))}))},RealtimeService.prototype.hasSubscriptionListeners=function(e){var t,n;if(this.subscriptions=this.subscriptions||{},e)return !!(null===(t=this.subscriptions[e])||void 0===t?void 0:t.length);for(var i in this.subscriptions)if(null===(n=this.subscriptions[i])||void 0===n?void 0:n.length)return !0;return !1},RealtimeService.prototype.submitSubscriptions=function(){return __awaiter(this,void 0,void 0,(function(){return __generator(this,(function(e){return this.clientId?(this.addAllSubscriptionListeners(),this.lastSentTopics=this.getNonEmptySubscriptionTopics(),[2,this.client.send("/api/realtime",{method:"POST",body:{clientId:this.clientId,subscriptions:this.lastSentTopics},params:{$cancelKey:"realtime_"+this.clientId}}).catch((function(e){if(!(null==e?void 0:e.isAbort))throw e}))]):[2]}))}))},RealtimeService.prototype.getNonEmptySubscriptionTopics=function(){var e=[];for(var t in this.subscriptions)this.subscriptions[t].length&&e.push(t);return e},RealtimeService.prototype.addAllSubscriptionListeners=function(){if(this.eventSource)for(var e in this.removeAllSubscriptionListeners(),this.subscriptions)for(var t=0,n=this.subscriptions[e];t<n.length;t++){var i=n[t];this.eventSource.addEventListener(e,i);}},RealtimeService.prototype.removeAllSubscriptionListeners=function(){if(this.eventSource)for(var e in this.subscriptions)for(var t=0,n=this.subscriptions[e];t<n.length;t++){var i=n[t];this.eventSource.removeEventListener(e,i);}},RealtimeService.prototype.connect=function(){return __awaiter(this,void 0,void 0,(function(){var e=this;return __generator(this,(function(t){return this.reconnectAttempts>0?[2]:[2,new Promise((function(t,n){e.pendingConnects.push({resolve:t,reject:n}),e.pendingConnects.length>1||e.initConnect();}))]}))}))},RealtimeService.prototype.initConnect=function(){var e=this;this.disconnect(!0),clearTimeout(this.connectTimeoutId),this.connectTimeoutId=setTimeout((function(){e.connectErrorHandler(new Error("EventSource connect took too long."));}),this.maxConnectTimeout),this.eventSource=new EventSource(this.client.buildUrl("/api/realtime")),this.eventSource.onerror=function(t){e.connectErrorHandler(new Error("Failed to establish realtime connection."));},this.eventSource.addEventListener("PB_CONNECT",(function(t){var n=t;e.clientId=null==n?void 0:n.lastEventId,e.submitSubscriptions().then((function(){return __awaiter(e,void 0,void 0,(function(){var e;return __generator(this,(function(t){switch(t.label){case 0:e=3,t.label=1;case 1:return this.hasUnsentSubscriptions()&&e>0?(e--,[4,this.submitSubscriptions()]):[3,3];case 2:return t.sent(),[3,1];case 3:return [2]}}))}))})).then((function(){for(var t=0,n=e.pendingConnects;t<n.length;t++){n[t].resolve();}e.pendingConnects=[],e.reconnectAttempts=0,clearTimeout(e.reconnectTimeoutId),clearTimeout(e.connectTimeoutId);})).catch((function(t){e.clientId="",e.connectErrorHandler(t);}));}));},RealtimeService.prototype.hasUnsentSubscriptions=function(){var e=this.getNonEmptySubscriptionTopics();if(e.length!=this.lastSentTopics.length)return !0;for(var t=0,n=e;t<n.length;t++){var i=n[t];if(!this.lastSentTopics.includes(i))return !0}return !1},RealtimeService.prototype.connectErrorHandler=function(e){var n=this;if(clearTimeout(this.connectTimeoutId),clearTimeout(this.reconnectTimeoutId),!this.clientId&&!this.reconnectAttempts||this.reconnectAttempts>this.maxReconnectAttempts){for(var i=0,o=this.pendingConnects;i<o.length;i++){o[i].reject(new t(e));}this.disconnect();}else {this.disconnect(!0);var r=this.predefinedReconnectIntervals[this.reconnectAttempts]||this.predefinedReconnectIntervals[this.predefinedReconnectIntervals.length-1];this.reconnectAttempts++,this.reconnectTimeoutId=setTimeout((function(){n.initConnect();}),r);}},RealtimeService.prototype.disconnect=function(e){var n;if(void 0===e&&(e=!1),clearTimeout(this.connectTimeoutId),clearTimeout(this.reconnectTimeoutId),this.removeAllSubscriptionListeners(),null===(n=this.eventSource)||void 0===n||n.close(),this.eventSource=null,this.clientId="",!e){this.reconnectAttempts=0;for(var i=new t(new Error("Realtime disconnected.")),o=0,r=this.pendingConnects;o<r.length;o++){r[o].reject(i);}this.pendingConnects=[];}},RealtimeService}(c),w=function(e){function HealthService(){return null!==e&&e.apply(this,arguments)||this}return __extends(HealthService,e),HealthService.prototype.check=function(e){return void 0===e&&(e={}),this.client.send("/api/health",{method:"GET",params:e})},HealthService}(c),C=function(){function Client(e,t,n){void 0===e&&(e="/"),void 0===n&&(n="en-US"),this.cancelControllers={},this.recordServices={},this.enableAutoCancellation=!0,this.baseUrl=e,this.lang=n,this.authStore=t||new a,this.admins=new h(this),this.collections=new b(this),this.logs=new g(this),this.settings=new u(this),this.realtime=new S(this),this.health=new w(this);}return Client.prototype.collection=function(e){return this.recordServices[e]||(this.recordServices[e]=new v(this,e)),this.recordServices[e]},Client.prototype.autoCancellation=function(e){return this.enableAutoCancellation=!!e,this},Client.prototype.cancelRequest=function(e){return this.cancelControllers[e]&&(this.cancelControllers[e].abort(),delete this.cancelControllers[e]),this},Client.prototype.cancelAllRequests=function(){for(var e in this.cancelControllers)this.cancelControllers[e].abort();return this.cancelControllers={},this},Client.prototype.send=function(e,n){var i,o,r,s,a,c,u,l;return __awaiter(this,void 0,void 0,(function(){var d,h,p,v,f,m,b=this;return __generator(this,(function(y){return d=Object.assign({method:"GET"},n),this.isFormData(d.body)||(d.body&&"string"!=typeof d.body&&(d.body=JSON.stringify(d.body)),void 0===(null===(i=null==d?void 0:d.headers)||void 0===i?void 0:i["Content-Type"])&&(d.headers=Object.assign({},d.headers,{"Content-Type":"application/json"}))),void 0===(null===(o=null==d?void 0:d.headers)||void 0===o?void 0:o["Accept-Language"])&&(d.headers=Object.assign({},d.headers,{"Accept-Language":this.lang})),(null===(r=this.authStore)||void 0===r?void 0:r.token)&&void 0===(null===(s=null==d?void 0:d.headers)||void 0===s?void 0:s.Authorization)&&(d.headers=Object.assign({},d.headers,{Authorization:this.authStore.token})),this.enableAutoCancellation&&!1!==(null===(a=d.params)||void 0===a?void 0:a.$autoCancel)&&(h=(null===(c=d.params)||void 0===c?void 0:c.$cancelKey)||(d.method||"GET")+e,this.cancelRequest(h),p=new AbortController,this.cancelControllers[h]=p,d.signal=p.signal),null===(u=d.params)||void 0===u||delete u.$autoCancel,null===(l=d.params)||void 0===l||delete l.$cancelKey,v=this.buildUrl(e),void 0!==d.params&&((f=this.serializeQueryParams(d.params))&&(v+=(v.includes("?")?"&":"?")+f),delete d.params),this.beforeSend&&(void 0!==(m=Object.assign({},this.beforeSend(v,d))).url||void 0!==m.options?(v=m.url||v,d=m.options||d):Object.keys(m).length&&(d=m,(null===console||void 0===console?void 0:console.warn)&&console.warn("Deprecated format of beforeSend return: please use `return { url, options }`, instead of `return options`."))),[2,fetch(v,d).then((function(e){return __awaiter(b,void 0,void 0,(function(){var n;return __generator(this,(function(i){switch(i.label){case 0:n={},i.label=1;case 1:return i.trys.push([1,3,,4]),[4,e.json()];case 2:return n=i.sent(),[3,4];case 3:return i.sent(),[3,4];case 4:if(this.afterSend&&(n=this.afterSend(e,n)),e.status>=400)throw new t({url:e.url,status:e.status,data:n});return [2,n]}}))}))})).catch((function(e){throw new t(e)}))]}))}))},Client.prototype.getFileUrl=function(e,t,n){void 0===n&&(n={});var i=[];i.push("api"),i.push("files"),i.push(encodeURIComponent(e.collectionId||e.collectionName)),i.push(encodeURIComponent(e.id)),i.push(encodeURIComponent(t));var o=this.buildUrl(i.join("/"));if(Object.keys(n).length){var r=new URLSearchParams(n);o+=(o.includes("?")?"&":"?")+r;}return o},Client.prototype.buildUrl=function(e){var t=this.baseUrl+(this.baseUrl.endsWith("/")?"":"/");return e&&(t+=e.startsWith("/")?e.substring(1):e),t},Client.prototype.isFormData=function(e){return e&&("FormData"===e.constructor.name||"undefined"!=typeof FormData&&e instanceof FormData)},Client.prototype.serializeQueryParams=function(e){var t=[];for(var n in e)if(null!==e[n]){var i=e[n],o=encodeURIComponent(n);if(Array.isArray(i))for(var r=0,s=i;r<s.length;r++){var a=s[r];t.push(o+"="+encodeURIComponent(a));}else i instanceof Date?t.push(o+"="+encodeURIComponent(i.toISOString())):null!==typeof i&&"object"==typeof i?t.push(o+"="+encodeURIComponent(JSON.stringify(i))):t.push(o+"="+encodeURIComponent(i));}return t.join("&")},Client}();

    /* src\TaksList.svelte generated by Svelte v3.56.0 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\TaksList.svelte";

    function get_then_context(ctx) {
    	ctx[4] = ctx[7][0];
    	ctx[5] = ctx[7][1];
    	ctx[6] = ctx[7][2];
    }

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[8] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	return child_ctx;
    }

    // (69:2) {:catch error}
    function create_catch_block$2(ctx) {
    	let p;
    	let t0;
    	let t1_value = /*error*/ ctx[17].message + "";
    	let t1;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t0 = text("error:");
    			t1 = text(t1_value);
    			attr_dev(p, "class", "bg-red-500");
    			add_location(p, file$4, 69, 4, 2174);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t0);
    			append_dev(p, t1);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 1 && t1_value !== (t1_value = /*error*/ ctx[17].message + "")) set_data_dev(t1, t1_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$2.name,
    		type: "catch",
    		source: "(69:2) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (31:2) {:then [tasks, modes, projects]}
    function create_then_block$2(ctx) {
    	get_then_context(ctx);
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let each_1_anchor;
    	let each_value = /*tasks*/ ctx[4];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*task*/ ctx[8].id;
    	validate_each_keys(ctx, each_value, get_each_context$2, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$2(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(target, anchor);
    				}
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			get_then_context(ctx);

    			if (dirty & /*promise, handleChange*/ 3) {
    				each_value = /*tasks*/ ctx[4];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$2, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, each_1_anchor.parentNode, destroy_block, create_each_block$2, each_1_anchor, get_each_context$2);
    			}
    		},
    		d: function destroy(detaching) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d(detaching);
    			}

    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$2.name,
    		type: "then",
    		source: "(31:2) {:then [tasks, modes, projects]}",
    		ctx
    	});

    	return block;
    }

    // (50:10) {#each modes as mode (mode.id)}
    function create_each_block_2(key_1, ctx) {
    	let option;
    	let t_value = /*mode*/ ctx[14].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*mode*/ ctx[14].id;
    			option.value = option.__value;
    			set_style(option, "color", /*mode*/ ctx[14].color);
    			add_location(option, file$4, 50, 12, 1631);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*promise*/ 1 && t_value !== (t_value = /*mode*/ ctx[14].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*promise*/ 1 && option_value_value !== (option_value_value = /*mode*/ ctx[14].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*promise*/ 1) {
    				set_style(option, "color", /*mode*/ ctx[14].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(50:10) {#each modes as mode (mode.id)}",
    		ctx
    	});

    	return block;
    }

    // (63:10) {#each projects as project (project.id)}
    function create_each_block_1(key_1, ctx) {
    	let option;
    	let t_value = /*project*/ ctx[11].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*project*/ ctx[11].id;
    			option.value = option.__value;
    			add_location(option, file$4, 63, 12, 2035);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*promise*/ 1 && t_value !== (t_value = /*project*/ ctx[11].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*promise*/ 1 && option_value_value !== (option_value_value = /*project*/ ctx[11].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(63:10) {#each projects as project (project.id)}",
    		ctx
    	});

    	return block;
    }

    // (32:4) {#each tasks as task (task.id)}
    function create_each_block$2(key_1, ctx) {
    	let div;
    	let input;
    	let input_value_value;
    	let input_data_id_value;
    	let t0;
    	let select0;
    	let each_blocks_1 = [];
    	let each0_lookup = new Map();
    	let select0_value_value;
    	let select0_data_id_value;
    	let t1;
    	let select1;
    	let each_blocks = [];
    	let each1_lookup = new Map();
    	let select1_value_value;
    	let select1_data_id_value;
    	let t2;
    	let mounted;
    	let dispose;
    	let each_value_2 = /*modes*/ ctx[5];
    	validate_each_argument(each_value_2);
    	const get_key = ctx => /*mode*/ ctx[14].id;
    	validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		let child_ctx = get_each_context_2(ctx, each_value_2, i);
    		let key = get_key(child_ctx);
    		each0_lookup.set(key, each_blocks_1[i] = create_each_block_2(key, child_ctx));
    	}

    	let each_value_1 = /*projects*/ ctx[6];
    	validate_each_argument(each_value_1);
    	const get_key_1 = ctx => /*project*/ ctx[11].id;
    	validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_1);

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		let child_ctx = get_each_context_1(ctx, each_value_1, i);
    		let key = get_key_1(child_ctx);
    		each1_lookup.set(key, each_blocks[i] = create_each_block_1(key, child_ctx));
    	}

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			div = element("div");
    			input = element("input");
    			t0 = space();
    			select0 = element("select");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			select1 = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			attr_dev(input, "type", "text");
    			input.value = input_value_value = /*task*/ ctx[8].name;
    			attr_dev(input, "class", "");
    			attr_dev(input, "data-id", input_data_id_value = /*task*/ ctx[8].id);
    			attr_dev(input, "data-field", "name");
    			add_location(input, file$4, 33, 8, 1185);
    			attr_dev(select0, "name", "mode");
    			attr_dev(select0, "id", "mode");
    			attr_dev(select0, "data-id", select0_data_id_value = /*task*/ ctx[8].id);
    			attr_dev(select0, "data-field", "mode");
    			add_location(select0, file$4, 41, 8, 1379);
    			attr_dev(select1, "name", "project");
    			attr_dev(select1, "id", "project");
    			attr_dev(select1, "data-id", select1_data_id_value = /*task*/ ctx[8].id);
    			attr_dev(select1, "data-field", "project");
    			add_location(select1, file$4, 54, 8, 1762);
    			attr_dev(div, "class", "mb-3 h-8 border-b-2");
    			set_style(div, "color", /*task*/ ctx[8].expand.mode.color);
    			add_location(div, file$4, 32, 6, 1105);
    			this.first = div;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, input);
    			append_dev(div, t0);
    			append_dev(div, select0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				if (each_blocks_1[i]) {
    					each_blocks_1[i].m(select0, null);
    				}
    			}

    			select_option(select0, /*task*/ ctx[8].expand.mode.id);
    			append_dev(div, t1);
    			append_dev(div, select1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select1, null);
    				}
    			}

    			select_option(select1, /*task*/ ctx[8].expand.project.id);
    			append_dev(div, t2);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "change", /*handleChange*/ ctx[1], false, false, false, false),
    					listen_dev(select0, "change", /*handleChange*/ ctx[1], false, false, false, false),
    					listen_dev(select1, "change", /*handleChange*/ ctx[1], false, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty & /*promise*/ 1 && input_value_value !== (input_value_value = /*task*/ ctx[8].name) && input.value !== input_value_value) {
    				prop_dev(input, "value", input_value_value);
    			}

    			if (dirty & /*promise*/ 1 && input_data_id_value !== (input_data_id_value = /*task*/ ctx[8].id)) {
    				attr_dev(input, "data-id", input_data_id_value);
    			}

    			if (dirty & /*promise*/ 1) {
    				each_value_2 = /*modes*/ ctx[5];
    				validate_each_argument(each_value_2);
    				validate_each_keys(ctx, each_value_2, get_each_context_2, get_key);
    				each_blocks_1 = update_keyed_each(each_blocks_1, dirty, get_key, 1, ctx, each_value_2, each0_lookup, select0, destroy_block, create_each_block_2, null, get_each_context_2);
    			}

    			if (dirty & /*promise*/ 1 && select0_value_value !== (select0_value_value = /*task*/ ctx[8].expand.mode.id)) {
    				select_option(select0, /*task*/ ctx[8].expand.mode.id);
    			}

    			if (dirty & /*promise*/ 1 && select0_data_id_value !== (select0_data_id_value = /*task*/ ctx[8].id)) {
    				attr_dev(select0, "data-id", select0_data_id_value);
    			}

    			if (dirty & /*promise*/ 1) {
    				each_value_1 = /*projects*/ ctx[6];
    				validate_each_argument(each_value_1);
    				validate_each_keys(ctx, each_value_1, get_each_context_1, get_key_1);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key_1, 1, ctx, each_value_1, each1_lookup, select1, destroy_block, create_each_block_1, null, get_each_context_1);
    			}

    			if (dirty & /*promise*/ 1 && select1_value_value !== (select1_value_value = /*task*/ ctx[8].expand.project.id)) {
    				select_option(select1, /*task*/ ctx[8].expand.project.id);
    			}

    			if (dirty & /*promise*/ 1 && select1_data_id_value !== (select1_data_id_value = /*task*/ ctx[8].id)) {
    				attr_dev(select1, "data-id", select1_data_id_value);
    			}

    			if (dirty & /*promise*/ 1) {
    				set_style(div, "color", /*task*/ ctx[8].expand.mode.color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].d();
    			}

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(32:4) {#each tasks as task (task.id)}",
    		ctx
    	});

    	return block;
    }

    // (29:18)       <p>Loading...</p>    {:then [tasks, modes, projects]}
    function create_pending_block$2(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$4, 29, 4, 1007);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$2.name,
    		type: "pending",
    		source: "(29:18)       <p>Loading...</p>    {:then [tasks, modes, projects]}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let promise_1;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$2,
    		then: create_then_block$2,
    		catch: create_catch_block$2,
    		value: 7,
    		error: 17
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[0], info);

    	const block = {
    		c: function create() {
    			div = element("div");
    			info.block.c();
    			attr_dev(div, "class", "container");
    			add_location(div, file$4, 27, 0, 958);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			info.block.m(div, info.anchor = null);
    			info.mount = () => div;
    			info.anchor = null;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*promise*/ 1 && promise_1 !== (promise_1 = /*promise*/ ctx[0]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('TaksList', slots, []);
    	const pb = new C('http://localhost:8090');
    	let promise;

    	function fetchData() {
    		const tasksPromise = pb.collection('tc_tasks').getFullList({ expand: 'mode,project' });
    		const modesPromise = pb.collection('tc_modes').getFullList();
    		const projectsPromise = pb.collection('tc_projects').getFullList();
    		return Promise.all([tasksPromise, modesPromise, projectsPromise]);
    	}

    	promise = fetchData();

    	async function handleChange(e) {
    		if (!(e.currentTarget instanceof HTMLInputElement) && !(e.currentTarget instanceof HTMLSelectElement)) return;
    		const el = e.currentTarget;
    		const id = el.dataset.id;
    		const field = el.dataset.field;
    		const value = el.value;
    		const data = { [field]: value };
    		console.log(data);
    		await pb.collection('tc_tasks').update(id, data);
    		$$invalidate(0, promise = fetchData());
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1$1.warn(`<TaksList> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		PocketBase: C,
    		pb,
    		promise,
    		fetchData,
    		handleChange
    	});

    	$$self.$inject_state = $$props => {
    		if ('promise' in $$props) $$invalidate(0, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [promise, handleChange];
    }

    class TaksList extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "TaksList",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\ModeSelect.svelte generated by Svelte v3.56.0 */
    const file$3 = "src\\ModeSelect.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[6] = list[i];
    	return child_ctx;
    }

    // (20:0) {:catch error}
    function create_catch_block$1(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[9] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$3, 20, 4, 574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 4 && t_value !== (t_value = /*error*/ ctx[9] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block$1.name,
    		type: "catch",
    		source: "(20:0) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (13:0) {:then modes}
    function create_then_block$1(ctx) {
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = /*modes*/ ctx[5];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*mode*/ ctx[6].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(select, "name", "mode");
    			attr_dev(select, "id", "mode");
    			set_style(select, "color", /*color*/ ctx[0]);
    			add_location(select, file$3, 13, 4, 322);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select, null);
    				}
    			}

    			select_option(select, /*value*/ ctx[1]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*change_handler*/ ctx[3], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 4) {
    				each_value = /*modes*/ ctx[5];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block$1, null, get_each_context$1);
    			}

    			if (dirty & /*value, promise*/ 6) {
    				select_option(select, /*value*/ ctx[1]);
    			}

    			if (dirty & /*color*/ 1) {
    				set_style(select, "color", /*color*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block$1.name,
    		type: "then",
    		source: "(13:0) {:then modes}",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#each modes as mode (mode.id)}
    function create_each_block$1(key_1, ctx) {
    	let option;
    	let t_value = /*mode*/ ctx[6].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*mode*/ ctx[6].id;
    			option.value = option.__value;
    			set_style(option, "color", /*mode*/ ctx[6].color);
    			add_location(option, file$3, 15, 12, 437);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*promise*/ 4 && t_value !== (t_value = /*mode*/ ctx[6].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*promise*/ 4 && option_value_value !== (option_value_value = /*mode*/ ctx[6].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*promise*/ 4) {
    				set_style(option, "color", /*mode*/ ctx[6].color);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(15:8) {#each modes as mode (mode.id)}",
    		ctx
    	});

    	return block;
    }

    // (11:16)       <p>Loading...</p>  {:then modes}
    function create_pending_block$1(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$3, 11, 4, 284);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block$1.name,
    		type: "pending",
    		source: "(11:16)       <p>Loading...</p>  {:then modes}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let await_block_anchor;
    	let promise_1;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block$1,
    		then: create_then_block$1,
    		catch: create_catch_block$1,
    		value: 5,
    		error: 9
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[2], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*promise*/ 4 && promise_1 !== (promise_1 = /*promise*/ ctx[2]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModeSelect', slots, []);
    	const pb = new C('http://localhost:8090');
    	let { color = 'black' } = $$props;
    	let { value = '' } = $$props;

    	// states
    	let promise;

    	promise = pb.collection('tc_modes').getFullList();
    	const writable_props = ['color', 'value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ModeSelect> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ PocketBase: C, pb, color, value, promise });

    	$$self.$inject_state = $$props => {
    		if ('color' in $$props) $$invalidate(0, color = $$props.color);
    		if ('value' in $$props) $$invalidate(1, value = $$props.value);
    		if ('promise' in $$props) $$invalidate(2, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [color, value, promise, change_handler];
    }

    class ModeSelect extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { color: 0, value: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModeSelect",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get color() {
    		throw new Error("<ModeSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set color(value) {
    		throw new Error("<ModeSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<ModeSelect>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<ModeSelect>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const pb = new C('http://localhost:8090');

    /* src\Select.svelte generated by Svelte v3.56.0 */

    const file$2 = "src\\Select.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[3] = list[i];
    	return child_ctx;
    }

    // (6:4) {#each options as option (option.id)}
    function create_each_block(key_1, ctx) {
    	let option;
    	let t_value = /*option*/ ctx[3].name + "";
    	let t;
    	let option_value_value;

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			option = element("option");
    			t = text(t_value);
    			option.__value = option_value_value = /*option*/ ctx[3].id;
    			option.value = option.__value;
    			set_style(option, "color", /*option*/ ctx[3].color || 'black');
    			add_location(option, file$2, 6, 8, 150);
    			this.first = option;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, option, anchor);
    			append_dev(option, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if (dirty & /*options*/ 2 && t_value !== (t_value = /*option*/ ctx[3].name + "")) set_data_dev(t, t_value);

    			if (dirty & /*options*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[3].id)) {
    				prop_dev(option, "__value", option_value_value);
    				option.value = option.__value;
    			}

    			if (dirty & /*options*/ 2) {
    				set_style(option, "color", /*option*/ ctx[3].color || 'black');
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(option);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(6:4) {#each options as option (option.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let select;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let mounted;
    	let dispose;
    	let each_value = /*options*/ ctx[1];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*option*/ ctx[3].id;
    	validate_each_keys(ctx, each_value, get_each_context, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block(key, child_ctx));
    	}

    	const block = {
    		c: function create() {
    			select = element("select");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			add_location(select, file$2, 4, 0, 71);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, select, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				if (each_blocks[i]) {
    					each_blocks[i].m(select, null);
    				}
    			}

    			select_option(select, /*value*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(select, "change", /*change_handler*/ ctx[2], false, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*options*/ 2) {
    				each_value = /*options*/ ctx[1];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, select, destroy_block, create_each_block, null, get_each_context);
    			}

    			if (dirty & /*value, options*/ 3) {
    				select_option(select, /*value*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(select);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Select', slots, []);
    	let { value } = $$props;
    	let { options } = $$props;

    	$$self.$$.on_mount.push(function () {
    		if (value === undefined && !('value' in $$props || $$self.$$.bound[$$self.$$.props['value']])) {
    			console.warn("<Select> was created without expected prop 'value'");
    		}

    		if (options === undefined && !('options' in $$props || $$self.$$.bound[$$self.$$.props['options']])) {
    			console.warn("<Select> was created without expected prop 'options'");
    		}
    	});

    	const writable_props = ['value', 'options'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Select> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    	};

    	$$self.$capture_state = () => ({ value, options });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('options' in $$props) $$invalidate(1, options = $$props.options);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, options, change_handler];
    }

    class Select extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, options: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Select",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get value() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Select>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Select>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\SelectMode.svelte generated by Svelte v3.56.0 */
    const file$1 = "src\\SelectMode.svelte";

    // (12:0) {:catch error}
    function create_catch_block(ctx) {
    	let p;
    	let t_value = /*error*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file$1, 12, 4, 314);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*promise*/ 2 && t_value !== (t_value = /*error*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(12:0) {:catch error}",
    		ctx
    	});

    	return block;
    }

    // (10:0) {:then modes}
    function create_then_block(ctx) {
    	let select;
    	let current;

    	select = new Select({
    			props: {
    				options: /*modes*/ ctx[3],
    				value: /*value*/ ctx[0]
    			},
    			$$inline: true
    		});

    	select.$on("change", /*change_handler*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(select.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(select, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const select_changes = {};
    			if (dirty & /*promise*/ 2) select_changes.options = /*modes*/ ctx[3];
    			if (dirty & /*value*/ 1) select_changes.value = /*value*/ ctx[0];
    			select.$set(select_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(select.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(select.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(select, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(10:0) {:then modes}",
    		ctx
    	});

    	return block;
    }

    // (8:16)       <p>Loading...</p>  {:then modes}
    function create_pending_block(ctx) {
    	let p;

    	const block = {
    		c: function create() {
    			p = element("p");
    			p.textContent = "Loading...";
    			add_location(p, file$1, 8, 4, 210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(8:16)       <p>Loading...</p>  {:then modes}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let await_block_anchor;
    	let promise_1;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: true,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 3,
    		error: 4,
    		blocks: [,,,]
    	};

    	handle_promise(promise_1 = /*promise*/ ctx[1], info);

    	const block = {
    		c: function create() {
    			await_block_anchor = empty();
    			info.block.c();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, await_block_anchor, anchor);
    			info.block.m(target, info.anchor = anchor);
    			info.mount = () => await_block_anchor.parentNode;
    			info.anchor = await_block_anchor;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			info.ctx = ctx;

    			if (dirty & /*promise*/ 2 && promise_1 !== (promise_1 = /*promise*/ ctx[1]) && handle_promise(promise_1, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(await_block_anchor);
    			info.block.d(detaching);
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SelectMode', slots, []);
    	let { value = '' } = $$props;
    	let promise;
    	promise = pb.collection('tc_modes').getFullList();
    	const writable_props = ['value'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SelectMode> was created with unknown prop '${key}'`);
    	});

    	function change_handler(event) {
    		bubble.call(this, $$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    	};

    	$$self.$capture_state = () => ({ pb, Select, value, promise });

    	$$self.$inject_state = $$props => {
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('promise' in $$props) $$invalidate(1, promise = $$props.promise);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [value, promise, change_handler];
    }

    class SelectMode extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { value: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SelectMode",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get value() {
    		throw new Error("<SelectMode>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<SelectMode>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.56.0 */

    const { console: console_1 } = globals;
    const file = "src\\App.svelte";

    function create_fragment(ctx) {
    	let navbar;
    	let t0;
    	let h1;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let takslist;
    	let t5;
    	let modeselect;
    	let t6;
    	let selectmode;
    	let current;
    	navbar = new Navbar({ $$inline: true });
    	takslist = new TaksList({ $$inline: true });

    	modeselect = new ModeSelect({
    			props: { color: "#0ff", value: "ek1fymsy7r2ef6b" },
    			$$inline: true
    		});

    	modeselect.$on("change", /*change_handler*/ ctx[1]);

    	selectmode = new SelectMode({
    			props: { value: "ek1fymsy7r2ef6b" },
    			$$inline: true
    		});

    	selectmode.$on("change", /*change_handler_1*/ ctx[2]);

    	const block = {
    		c: function create() {
    			create_component(navbar.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			t1 = text("Hello ");
    			t2 = text(/*name*/ ctx[0]);
    			t3 = text("!");
    			t4 = space();
    			create_component(takslist.$$.fragment);
    			t5 = space();
    			create_component(modeselect.$$.fragment);
    			t6 = space();
    			create_component(selectmode.$$.fragment);
    			attr_dev(h1, "class", "text-3xl text-red-500");
    			add_location(h1, file, 13, 0, 374);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(navbar, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, h1, anchor);
    			append_dev(h1, t1);
    			append_dev(h1, t2);
    			append_dev(h1, t3);
    			insert_dev(target, t4, anchor);
    			mount_component(takslist, target, anchor);
    			insert_dev(target, t5, anchor);
    			mount_component(modeselect, target, anchor);
    			insert_dev(target, t6, anchor);
    			mount_component(selectmode, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*name*/ 1) set_data_dev(t2, /*name*/ ctx[0]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(navbar.$$.fragment, local);
    			transition_in(takslist.$$.fragment, local);
    			transition_in(modeselect.$$.fragment, local);
    			transition_in(selectmode.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(navbar.$$.fragment, local);
    			transition_out(takslist.$$.fragment, local);
    			transition_out(modeselect.$$.fragment, local);
    			transition_out(selectmode.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(navbar, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(h1);
    			if (detaching) detach_dev(t4);
    			destroy_component(takslist, detaching);
    			if (detaching) detach_dev(t5);
    			destroy_component(modeselect, detaching);
    			if (detaching) detach_dev(t6);
    			destroy_component(selectmode, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let { name = 'world' } = $$props;

    	const options = [
    		{ value: 'a', label: 'one' },
    		{ value: 'b', label: 'two' },
    		{ value: 'c', label: 'three' }
    	];

    	const writable_props = ['name'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const change_handler = e => alert(e.target.value);
    	const change_handler_1 = e => console.log(e.target);

    	$$self.$$set = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	$$self.$capture_state = () => ({
    		Navbar,
    		TaksList,
    		ModeSelect,
    		SelectMode,
    		name,
    		options
    	});

    	$$self.$inject_state = $$props => {
    		if ('name' in $$props) $$invalidate(0, name = $$props.name);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, change_handler, change_handler_1];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { name: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get name() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
