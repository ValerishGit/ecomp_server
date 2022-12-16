import { load } from "cheerio";
import { Builder, Browser, By, WebElement } from "selenium-webdriver";
import chrome from "selenium-webdriver/chrome";
import Product from "../modals/product";
import puppeteer from "puppeteer";
import accounting from "../utils/accounting";

const AMAZON_PRICE_CLASS = ".s-price-instructions-style";
const AMAZON_TITLE_CLASS = ".s-title-instructions-style";
const AMAZON_PARENT_CLASS = "[data-component-type='s-search-result']";
const AMAZON_IMAGE_CLASS = ".s-product-image-container";

const ALI_PRICE_CLASS = "_1CCSZ";
const ALI_TITLE_CLASS = "_24F0J Vgu6S";
const ALI_PARENT_CLASS = "_1lP57 _2f4Ho";
const ALI_IMAGE_CLASS = "_36QXb product-img";

async function getSiteHtml(url: string) {
  var browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  var result = await page.content();
  browser.close();

  return result;
}

var replaceAll = function (target: string): string {
  return target.replace(" ", "+");
};

export default {
  amazonResults: async function (searchTerm: string): Promise<Product[]> {
    searchTerm = replaceAll(searchTerm);
    var amazonUrl = `https://www.amazon.com/s?k=${searchTerm}`;

    console.log(`Searching ${searchTerm} on Amazon`);

    var products: Product[] = [];
    try {
      await (async () => {
        var amazon$ = load(await getSiteHtml(amazonUrl));
        console.log(amazon$.html());
        console.log("Site Loaded");
        var search_results = amazon$(AMAZON_PARENT_CLASS);
        console.log(`Amazon Results: ${search_results.length}`);
        products = await getProductsAmazon(search_results, amazon$);
      })().catch((err) => console.error(err));
    } catch (e) {
      console.log(e);
    } finally {
      return products ?? [];
    }
  },
  aliResults: async function (searchTerm: string): Promise<Product[]> {
    searchTerm = replaceAll(searchTerm);
    var aliUrl = `https://www.aliexpress.com/wholesale?SearchText=${searchTerm}&ltype=wholesale&SortType=default&g=y&CatId=0`;

    console.log(`Searching ${searchTerm} on Ali`);

    var products: Product[] = [];
    try {
      await (async () => {
        var ali$ = load(await getSiteHtml(aliUrl));
        var search_results = ali$('[class="_1KpBb"]');
        search_results = search_results.slice(0, 10);
        console.log(`Ali Results: ${search_results.length}`);
        products = await getProductsAli(search_results, ali$);
      })().catch((err) => console.error(err));
    } finally {
      return products ?? [];
    }
  },
  ebayResults: async function (searchTerm: string): Promise<Product[]> {
    searchTerm = replaceAll(searchTerm);
    console.log(`Searching ${searchTerm} on Ebay`);
    var ebayURL = `https://www.ebay.com/sch/i.html?_nkw=${searchTerm}`;
    var products: Product[] = [];
    try {
      await (async () => {
        var ebay$ = load(await getSiteHtml(ebayURL));
        var search_results = ebay$('[class^="s-item__wrapper clearfix"]');
        console.log(`Ebay Results: ${search_results.length}`);
        products = await getProductsEbay(search_results, ebay$);
      })().catch((err) => console.error(err));
    } finally {
      return products ?? [];
    }
  },
};
async function getProductsAmazon(
  search_results: cheerio.Cheerio,
  $: cheerio.Root
) {
  var _products: Product[] = [];
  try {
    //Check if price Shown
    search_results
      .find(AMAZON_PRICE_CLASS)
      .find(".a-offscreen")
      .each(function (index, element) {
        var price: string = "0";
        var link: string = "";
        var img: string = "";
        var rating: string = "";
        var name: string = "";
        var numOfReviews: string = "";
        price = $(element).html() ?? "";

        var nameElement = $(element)
          .parentsUntil(AMAZON_PARENT_CLASS)
          .find(AMAZON_TITLE_CLASS)
          .find(
            '[class="a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal"]'
          )
          .find("span");
        name = nameElement.html() ?? "";

        var imgElement = $(element)
          .parentsUntil(AMAZON_PARENT_CLASS)
          .find(AMAZON_IMAGE_CLASS)
          .find("img");

        img = imgElement.attr("src") ?? "";

        var ratingElement = $(element)
          .parentsUntil(AMAZON_PARENT_CLASS)
          .find('[class^="a-icon a-icon-star-small"]')
          .find("span");

        rating = ratingElement.html()?.substring(0, 3) ?? "No Rating";

        //a-link-normal s-underline-text s-underline-link-text s-link-style
        var numberOfReviewsElement = $(element)
          .parentsUntil(AMAZON_PARENT_CLASS)
          .find('[class^="a-size-base s-underline-text"]');

        numOfReviews =
          numberOfReviewsElement.html()?.replace(/[{()}]/g, "") ?? "0";

        var linkElement = $(element)
          .parentsUntil(AMAZON_PARENT_CLASS)
          .find('[data-component-type="s-product-image"]')
          .find("a");

        link = "https://amazon.com/" + linkElement.attr("href") ?? "";

        var product = new Product(name, price, link, img, rating, numOfReviews);
        if (!_products.includes(product)) {
          _products.push(product);
        }
      });
  } catch (e) {
    console.log(e);
  }
  return _products;
}

async function getProductsAli(
  search_results: cheerio.Cheerio,
  $: cheerio.Root
) {
  var _products: Product[] = [];
  try {
    //Check if price Shown
    search_results.each(async function (index, element) {
      var price: string = "";
      var link: string = "";
      var img: string = "";
      var rating: string = "";
      var name: string = "";
      var numOfReviews: string = "";
      var nameElement = $(element).find('[class="_24F0J Vgu6S"]').find("h1");
      name = nameElement.html() ?? "";

      var priceElement = $(element)
        .find('[class="WvaUg"]')
        .find('[class="_1CCSZ"]')
        .find("span");
      if (!priceElement) return null;
      for (let i = 0; i < priceElement.length; i++) {
        price += $(priceElement[i]).html();
      }

      var linkElement = $(element).prevUntil("a[href]").find("a");

      link = linkElement.attr("href") ?? "";

      var imgElement = $(element).prevUntil("a[href]").find("img");

      img = imgElement.attr("src") ?? "";

      //_3cSMn
      var ratingElement = $(element).find('[class="_3cSMn"]');
      rating = ratingElement.html() ?? "";

      /* var imgElement = $(element)
        .parentsUntil(AMAZON_PARENT_CLASS)
        .find(AMAZON_IMAGE_CLASS)
        .find("img");

      img = imgElement.attr("src") ?? "";

      var ratingElement = $(element)
        .parentsUntil(AMAZON_PARENT_CLASS)
        .find('[class^="a-icon a-icon-star-small"]')
        .find("span");

      rating = ratingElement.html()?.substring(0, 3) ?? "No Rating";

      var linkElement = $(element)
        .parentsUntil(AMAZON_PARENT_CLASS)
        .find('[data-component-type="s-product-image"]')
        .find("a");

      link = "https://amazon.com/" + linkElement.attr("href") ?? ""; */

      _products.push(new Product(name, price, link, img, rating, numOfReviews));
    });
  } catch (e) {
    console.log(e);
  } finally {
    return _products ?? [];
  }
  /*  for (let index = 0; index < search_results.length; index++) {
    var product: Product;
    var price: string = "";

    try {
      //Check if price Shown
      let exists = await search_results[index]
        .findElements(By.className(ALI_PRICE_CLASS))
        .then((found) => !!found.length);
      console.log(exists);
      if (exists) {
        //Get Prices
        priceElement = await search_results[index]
          .findElement(By.className(ALI_PRICE_CLASS))
          .catch((e) => console.log(e));
        console.log(priceElement);

        if (!priceElement) return null;
        var priceText = await priceElement.findElements(By.css("span"));
        for (let index = 0; index < priceText.length; index++) {
          price += await priceText[index].getText();
        }

        var name_element: WebElement = await search_results[index].findElement(
          By.className(ALI_TITLE_CLASS)
        );
        var name: string = await name_element
          .findElement(By.css("h1"))
          .getAttribute("innerHTML");
        img = await search_results[index]
          .findElement(By.className(ALI_IMAGE_CLASS))
          .getAttribute("src");

        rating = await search_results[index]
          .findElement(By.className("_3cSMn"))
          .getAttribute("innerHTML");

        var link: string = (
          await search_results[index].getAttribute("href")
        ).toString();
        product = new Product(name, price, link, img, rating);
        _products.push(product);
      }
    } catch (error) {
      console.log(error);
    }
  } */
  return _products;
}

async function getProductsEbay(
  search_results: cheerio.Cheerio,
  $: cheerio.Root
) {
  var _products: Product[] = [];
  try {
    //Check if price Shown
    search_results.each(async function (index, element) {
      var price: string = "";
      var link: string = "";
      var img: string = "";
      var rating: string = "";
      var name: string = "";
      var numOfReviews: string = "";
      var nameElement = $(element).find('[class="s-item__title"]').find("span");
      name = nameElement.html() ?? "";

      var priceElement = $(element).find('[class="s-item__price"]');
      price = priceElement.text() ?? "";

      var linkElement = $(element).find("a[href]");

      link = linkElement.attr("href") ?? "";

      var imgElement = $(element)
        .find('[class="s-item__image-wrapper image-treatment"]')
        .find("img");

      img = imgElement.attr("src") ?? "";

      //_3cSMn
      var ratingElement = $(element)
        .find('[class="s-item__detail s-item__detail--secondary"]')
        .find('[class="s-item__etrs-text"]');
      rating = ratingElement.html() ?? "";

      _products.push(new Product(name, price, link, img, rating, numOfReviews));
    });
  } catch (e) {
    console.log(e);
  } finally {
    return _products ?? [];
  }
}
