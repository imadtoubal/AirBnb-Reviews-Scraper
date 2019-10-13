const puppeteer = require('puppeteer');
const fs = require('fs');

const link = 'https://www.airbnb.com/rooms/15942160?adults=1&children=0&infants=0&source_impression_id=p3_1570833910_UVwEvClt1JJFdoEV';
const selector = '#reviews ._czm8crp';
const nextBtnSelector = '#reviews ._r4n1gzb';
const readMoreBtnClass = '#reviews ._b0ybw8s';

(async () => {
	// const browser = await puppeteer.launch();
	const browser = await puppeteer.launch({ headless: true }); // default is true
	const page = await browser.newPage();
	await page.goto(link, { waitUntil: 'networkidle2' });
	let nextpage;
	let output = '';
	// get the number of pages
	// let pageNumber = 0;
	let currentPage = 0;
	let counter = 2;
	do {
		try {
			// Get page number _e602arm
			prevNumber = currentPage;
			currentPage = Number((await page.$$eval('#reviews ._e602arm', e => e.map((a) => a.innerHTML)))[0]);
			//Scroll 
			await page.evaluate(_ => {
				window.scrollBy(0, 10);
			});
	
			// Remove replies
			await page.evaluate((sel) => {
				let elements = document.querySelectorAll(sel);
				for (el of elements) {
					el.parentNode.removeChild(el);
				}
			}, '#reviews ._n5lh69r');
			console.log(currentPage, prevNumber);
			if (currentPage !== prevNumber) {
		
				// click on all "read more"
				await page.evaluate(() => {
					let elements = document.querySelectorAll('#reviews ._b0ybw8s');
					for (let element of elements)
						element.click();
				});
		
				// get the reviews
				let els = await page.$$eval(selector, e => e.map((a) => a.innerText.replace(/\r\n|\n/, ' ')));
				els.splice(0, 6);
				els.splice(els.length - 1, 1);
				output += els.join('\n').replace('\u2026', '') + '\n';
		
				console.log("page: " + currentPage);
			}
			// click on next pagination
			await page.click('#reviews ._r4n1gzb');
			nextpage = await page.$$eval('#reviews ._r4n1gzb svg', e => e.map((a) => a.innerHTML));
			if (nextpage.length == 0) {
				counter--;
			}
 		} catch(e) {
			console.warn(e);
		}
	} while (counter != 0);

	fs.writeFileSync('data.txt', output.replace(/\n\n/, '\n'));
	await browser.close();
})();


function delay(time) {
	return new Promise(function (resolve) {
		setTimeout(resolve, time)
	});
}
