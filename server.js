// import the required external libraries
const express = require("express")
const { json, urlencoded } = require("body-parser")
const Butter = require("buttercms")

// import the required methods from the store
const { addToCart, getCartItems } = require("./store")

// initialize your butterCMS instance
const butter = Butter("f148a1e8d384482bf3e5aa9e2b3a7af5dc62c734")

// initialize the express application
const app = express()
app.use(json())
app.use(urlencoded({ extended: true }))
app.use(express.static("public"))
app.set("view engine", "ejs")

const port = 3000

// our application can have multiple users, but for now, let's assume there's a single user
// who has this user name
const userName = "sample user"

app.post("/cart", (req, res) => {
	// get the item id from the request and add it to the cart
	addToCart(userName, req.body.itemId)
	res.end()
})

app.get("/products", (req, res) => {
	// get all product page types from the ButterCMS portal
	butter.page
		.list("product")
		.then((resp) => {
			// if successful, return the products in the response
			res.json(resp.data)
		})
		// return an internal server error if the call failed
		.catch((err) => res.status(500).send(err))
})

const regionPrice = {
	US: "price",
	EU: "price-euro",
}

app.post("/checkout", (req, res) => {
	const { region } = req.body
	// get items from the users cart
	const items = getCartItems(userName)

	// create a list of requests to retrieve product information for each item.
	const requests = Object.keys(items).map((key) =>
		butter.page.retrieve("product", key)
	)

	// initialize total to 0
	let total = 0

	// execute all requests simultaneously using Promise.all
	Promise.all(requests)
		.then((responses) => {
			// once all the info is retrieved, add to the total
			// using the product price and quantity
			const renderItems = responses.map((resp) => {
				const { title } = resp.data.data.fields
				const price = resp.data.data.fields[regionPrice[region]]
				const quantity = items[resp.data.data.name]
				total += price * quantity

				// the quantity and title are returned and stored in the
				// renderItems variable
				return {
					quantity,
					title,
				}
			})

			// we render the "payment-confirmation" ejs template, by providing
			// the total and the items as template variables
			res.render("payment-confirmation", {
				total,
				items: renderItems,
			})
		})
		// return an internal server error if the API returns an error
		.catch((err) => {
			console.log(err)
			res.status(500).end()
		})
})

// start an express server on the given port
app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})
