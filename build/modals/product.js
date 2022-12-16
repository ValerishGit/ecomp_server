"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Product {
    name;
    price;
    link;
    img;
    rating;
    numOfReviews;
    constructor(name, price, link, img, rating, numOfReviews) {
        this.name = name;
        this.price = price;
        this.link = link;
        this.img = img;
        this.rating = rating;
        this.numOfReviews = numOfReviews;
    }
}
exports.default = Product;
