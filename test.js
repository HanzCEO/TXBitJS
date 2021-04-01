const txbit = require('./index');

let public = txbit.Public();
let account = txbit.Account("YOUR_SECRET_KEY", "YOU_API_KEY");

(async () => {
	let res = await public.getticker({ market: "XLR/BTC" });
	console.log(res);

	let res1 = await public.getmarketsummary({ market: "ETH/BTC" });
	console.log(res1);

	if (account)
		console.log(await account.getbalance({ currency: "ETH" }));
})()
