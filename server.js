const app = require("./app");

const PORT = process.env.PORT || 3052;

async function fetch_a() {
  try {
    console.log("After 1 min");

    const response = await fetch("https://kzjhrn-3052.csb.app/drafts_db");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("remove await");
    console.log(data);
  } catch (error) {
    console.error(error);
    console.error("Fetch error!!:", error.message);
  }
}

async function fetch_b() {
  try {
    console.log("hi fetch b");

    const response = await fetch(
      "https://jsonplaceholder.typicode.com/posts/1"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Fetch error:", error.message);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log("++++++++app+++++++");

  setInterval(() => {
    // fetch_a();
    console.log("///////hi////////");
  }, 10000); // Calls greet() every 1000 ms (1 second)
  // setInterval(fetch_b, 200000);
});
