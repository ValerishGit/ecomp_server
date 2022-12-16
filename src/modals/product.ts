class Product {
  name: string;
  price: string;
  link: string;
  img: string;
  rating: string;
  numOfReviews: string;

  constructor(
    name: string,

    price: string,
    link: string,
    img: string,
    rating: string,
    numOfReviews: string
  ) {
    this.name = name;
    this.price = price;
    this.link = link;
    this.img = img;
    this.rating = rating;
    this.numOfReviews = numOfReviews;
  }
}

export default Product;
