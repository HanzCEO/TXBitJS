const axios = require("axios").default;
const url = require("url");
const crypto = require("crypto");
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
 * @param {string} apiSecret - Your API Secret key for signing hmac
 * @param {string} apiKey - Your API Key
 */
async function processApi(endpointType, endpointName, args, apiSecret="", apiKey="") {
	if (!EndpointType.includes(endpointType)) return false;

	let instance = axiosInstances[endpointType];
	let params = new url.URLSearchParams(args);

	if (apiKey) params.append("apikey", apiKey),
		params.append("nonce", Date.now());

	let response = await instance.get(`${endpointName}?${params.toString()}`, {
		headers: {
			apisign: crypto.createHmac("sha512", apiSecret)
					.update(
						instance.defaults.baseURL +
						endpointName +
						`?${params.toString()}`
					).digest("hex").toUpperCase()
		}
	});
	let data = response.data;

	if (!data.success) throw new Error(data.message);
	else return data.result;
}

/**
 * Allow access to public TXBit API endpoints. This cost no API key or account.
 *
 * @function Public
 * @returns {Proxy}
 */
function Public() {
	let handler = {
		get: function(target, key) {
			return async function wrapper(args) {
				return await processApi("public/", key, args);
			}
		}
	}

	return new Proxy({}, handler);
}

/**
 * Allow access to TXBit's market API endpoints. This cost API key with allow
 * trading permission.
 *
 * @function Market
 * @returns {Proxy}
 */
function Market(apiSecret, apiKey) {
	let get = {
		get: function(target, key) {
			return async function wrapper(args) {
				return await processApi("market/", key, args, apiSecret, apiKey);
			}
		}
	}

	return new Proxy({
		apiKey: apiKey
	}, get);
}

/**
 * Allow access to your TXBit Account API endpoints. This cost permissive API
 * key and account.
 *
 * @function Account
 * @returns {Proxy}
 */
function Account(apiSecret, apiKey) {
	let get = {
		get: function(target, key) {
			return async function wrapper(args) {
				return await processApi("account/", key, args, apiSecret, apiKey);
			}
		}
	}

	return new Proxy({
		apiKey: apiKey
	}, get);
}

exports.Public = Public;
exports.Market = Market;
exports.Account = Account;
