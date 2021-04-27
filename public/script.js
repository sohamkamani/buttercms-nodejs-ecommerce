// this describes the field to fetch based on the region
const regionPrice = {
	US: "price",
	EU: "price-euro",
}

// this describes the currency unit per region
const regionCurrency = {
	US: "$",
	EU: "€",
}

// we can get the region from the query params
const queryString = window.location.search
const urlParams = new URLSearchParams(queryString)
const region = urlParams.get("region") || "US"

// we append a hidden field to the checkout form to let
// the server know about the region
$("#form-region").attr("value", region)

// create a new class to hold the logic of our products actions
class Product {
	constructor(data) {
		this.data = data
		this.quantity = 0
	}

	addToCart() {
		// send a post request to the /cart endpoint, with the items
		// name as its ID
		fetch("/cart", {
			body: JSON.stringify({ itemId: this.data.name }),
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then(() => {
				// if we get a successful response, increase the items quantity
				// in the webpage
				this.quantity++
				this.quantityHTML.text(` (${this.quantity})`)
			})
			.catch((err) => console.error(err))
	}

	html() {
		// get the fields from the product data
		const { title, description } = this.data.fields
		const price = this.data.fields[regionPrice[region]]

		// create the section that will display the overall quantity
		// and "add to cart" button
		this.quantityHTML = $("<span></span>")
		const addToCart = $("<button>Add to cart</button>").click(
			this.addToCart.bind(this)
		)
		addToCart.append(this.quantityHTML)

		// we render the currency unit and price based on the region
		const elem = $(`<div class="product">
        <div class="title">${title}</div>
        <div class="description">${description}</div>
        <div class="price">${regionCurrency[region]}${price}</div>
    	</div>`).append(addToCart)
		// the addToCart section is appended to each product at the end

		return elem
	}
}

// call the products endpoint we just created
fetch("/products")
	.then((res) => res.json())
	.then((data) => {
		// if successful, loop through each item and append it's
		// HTML output to the product catalog div
		data.data.forEach((item) => {
			const product = new Product(item)
			$(".product-catalog").append(product.html())
		})
	})
	.catch((err) => console.error(err))
