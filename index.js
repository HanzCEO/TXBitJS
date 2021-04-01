const axios = require("axios").default;
const url = require("url");
const base = "https://api.txbit.io/api/";

const EndpointType = [ "public/", "market/", "account/" ];
const axiosInstances = {
	[EndpointType[0]]: axios.create({ baseURL: base + EndpointType[0] }),
	[EndpointType[1]]: axios.create({ baseURL: base + EndpointType[1] }),
	[EndpointType[2]]: axios.create({ baseURL: base + EndpointType[2] })
};

/**
 * This is a private function. You don't need to learn this
 *
 * @private
 * @param {string} endpointType - The endpoint major section
 * @param {string} endpointName - The endpoint method to call. Just put the name
 * @param {object} args - An array of mixed content, can be filled with anything
 */
async function processApi(endpointType, endpointName, args) {
	if (!EndpointType.includes(endpointType)) return false;

	let instance = axiosInstances[EndpointType.indexOf(endpointType)];
	let params = new url.URLSearchParams(args);

	let response = await instance.get(`${endpointName}?${params.toString()}`);
	let data = response.data;

	if (!data.success) throw new Error(data.success);
	else return data.result;
}

/**
 * Allow access to public TXBit API endpoints. This cost no API key or account.
 *
 * @function Public
 * @returns {Proxy}
 */
function Public() {
	let get = function(target, key) {
		return async function wrapper(args) {
			return await processApi("public/", key, args);
		}
	}

	return new Proxy({}, get);
}

/**
 * Allow access to TXBit's market API endpoints. This cost API key with allow
 * trading permission.
 *
 * @function Market
 * @returns {Proxy}
 */
function Market() {
	let get = function(target, key) {
		return async function wrapper(args) {
			return await processApi("market/", key, args);
		}
	}

	return new Proxy({}, get);
}

/**
 * Allow access to your TXBit Account API endpoints. This cost permissive API
 * key and account.
 *
 * @function Account
 * @returns {Proxy}
 */
function Account() {
	let get = function(target, key) {
		return async function wrapper(args) {
			return await processApi("account/", key, args);
		}
	}

	return new Proxy({}, get);
}

exports.Public = Public;
exports.Market = Market;
exports.Account = Account;
