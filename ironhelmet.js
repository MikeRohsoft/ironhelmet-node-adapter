const LWP = require('http-wrapper');

class Ironhelmet {
    /**
     * The Ironhelmet Handler
     * @param {'np' | 'blight' | 'bbb'} game 
     */
    constructor(game) {
		this.game = game;
		this.url = `https://${game}.ironhelmet.com`;
		this.events = {};
    };
    /**
     * this should be called only by the Object
     * @param {string} url 
     * @param {Map<string | number, string | number>} parameters 
     * @param {function(IronhelmetResult): void} [callback]
     * @returns {Promise<IronhelmetResult>} Returns nothing if callback is set
     */
	returnFunc(url, parameters, callback) {
		const promiseHandler = (a) => {
			const responseHandler = v => {
				if (!v.content) {
					console.log(`No Response Code ${v.code}`);
					return;
				}
				try {
					a(JSON.parse(v.content));
				} catch(err) {
					console.log(`Coudn't parse JSON ${err}`);
				}
			};
			LWP.post(url, parameters)
				.then(responseHandler)
				.catch();
		};
		const result = new Promise(promiseHandler);
		const callbackType = typeof callback;
		if (callbackType === 'function') {
			result
				.then(callback)
				.catch();
			return;
		} else if (callbackType !== 'undefined') {
			result
				.then()
				.catch();
			return;
		} else {
			return result;
		}
    };
    /**
     * Simple Copy of the Browser order request
     * @param {string | number} gameNumber the game Number
     * @param {string | number | Array<string | number> | Map<string, string | number>} obj
     * @param {function(IronhelmetResult): void} [callback] return Promise if omitted
     * @returns {Promise<IronhelmetResult> | void} 
     */
	order(gameNumber, obj, callback) {
		if (!obj) {
			return;
		}
		let url;
		const parameters = {
			game_number: gameNumber, 
			order: '', 
			type: 'order', 
		};
		if (this.game === 'np') {
			url = `${this.url}/trequest/order`;
			parametersversion = '';
		} else if (this.game === 'blight') {
			url = `${this.url}/grequest/order`;
			parameters['build_number'] = 1052;
			parameters['age'] = 0;
		}
		const paramType = typeof obj;
		if (paramType === 'object') {
			if (!!obj.find) {
				parameters.order = obj.join(',');
			} else {
				for (let k in obj) {
					parameters[k] = obj[k];
				}
			}	
		} else if (paramType === 'string') {
			parameters.order = obj; 
		} else if (paramType === 'number') {
			parameters.order = obj.toString(); 
		}
		return this.returnFunc(url, parameters, callback)
	};
	/**
	 * Login Function
	 * @param {string} username Your NeptunePride User Login
	 * @param {string} password Your NeptunePride User Password
	 * @fires load if succeded
	 * @fires error if failed
	 */
	login(username, password) {
		if (!username || !password) {
			throw 'Invalid Username/Password Combination';
		}
		const url = `${this.url}/arequest/login`;
		const parameters = {
			alias: username,
			password: password,
			type: 'login',
		};
		const loginHandler = v => {
			if (!v[0] || v[0].indexOf('login_success') === -1) {
				this.fire('error', 'Login failed');
				return;
			}
			this.fire('load', true);
			return;
		};
		this.returnFunc(url, parameters)
			.then(loginHandler)
			.catch();
	};
	/**
	 * this should be called only by the Object
	 * @param {string} evt ready | error | load
	 * @param {PlayerInfo | string} params
	 */
	fire(evt, params) {
		if (!this.events[evt]) {
			return;
		}
		for (let i = 0, l = this.events[evt].length; i < l; i++) {
			this.events[evt][i](params);
		}
	};
	/**
	 * add a listener to an Event
	 * @param {string} evt - ready | error 
	 * @param {function(PlayerInfo): void} eventFunc
	 */
	on(evt, eventFunc) {
		if (!this.events[evt]) {
			this.events[evt] = [];
		}
		this.events[evt].push(eventFunc);
	};
}

module.exports = Ironhelmet;