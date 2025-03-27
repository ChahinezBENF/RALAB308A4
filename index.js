import * as Carousel from "./Carousel.js";
import axios from "axios";

// The breed selection input element.
const breedSelect = document.getElementById("breedSelect");
// The information section div element.
const infoDump = document.getElementById("infoDump");
// The progress bar div element.
const progressBar = document.getElementById("progressBar");
// The get favourites button element.
const getFavouritesBtn = document.getElementById("getFavouritesBtn");
// Step 0: Store your API key here for reference and easy access.
const API_KEY =
  "live_CYhOik1GLRaeEtPRD959IvxoAEk4lZIx0SiUn3xpReQysLAMowE1KuSu9QskJ1kq";

// * 1. Create an async function "initialLoad" that does the following:
async function initialLoad() {
  try {
    // * - Retrieve a list of breeds from the cat API using fetch().
    const response = await fetch("https://api.thecatapi.com/v1/breeds");
    const breeds = await response.json(); //Converts the  object into JSON format and the result is an array of objects stored in breeds.
    breeds.forEach((breed) => {
      // * - Create new <options> for each of these breeds
      const option = document.createElement("option");
      // *  - Each option should have a value attribute equal to the id of the breed.
      option.value = breed.id;
      // *  - Each option should display text equal to the name of the breed.
      option.textContent = breed.name;
      // * - append them to breedSelect.
      breedSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error fetching breeds:", error);
  }
}
// * This function should execute immediately.
initialLoad();

// 2. Create an event handler for breedSelect that does the following:
breedSelect.addEventListener("change", async (event) => {
  const breedId = event.target.value; // Get selected breed ID
  //* - Retrieve information on the selected breed from the cat API using fetch().
  await loadBreedImages(breedId);
});

async function loadBreedImages(breedId) {
  try {
    const response = await fetch(
      `https://api.thecatapi.com/v1/images/search?breed_id=${breedId}&limit=5`
    );
    const images = await response.json();
    // *  - Make sure your request is receiving multiple array items!
    // *  - Check the API documentation if you're only getting a single object.
    if (!images || images.length === 0) {
      console.error("No images found for this breed.");
      const infoDump = document.getElementById("infoDump");
      infoDump.innerHTML = "No images available for this breed.";
      return;
    }

    //  * - Each new selection should clear, re-populate, and restart the Carousel.
    const carousel = document.getElementById("carouselInner");
    carousel.innerHTML = "";

    images.forEach((image) => {
      // For each object in the response array, create a new element for the carousel.
      const imgElement = document.createElement("img");
      imgElement.src = image.url;
      imgElement.alt = "Cat image";
      imgElement.classList.add("carousel-item");
      // Append each of these new elements to the carousel.
      carousel.appendChild(imgElement);
    });

    // * - Use the other data you have been given to create an informational section within the infoDump element.
    const breedDescription =
      images[0]?.breeds?.[0]?.description ||
      "Breed description is not available for this selection.";
    infoDump.innerHTML = `Breed Info: ${breedDescription}`;
  } catch (error) {
    console.error("Error loading breed images:", error);
  }
}

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 *  - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */
export async function favourite(imgId) {
  // your code here
}

/**
 * 9. Test your favourite() function by creating a getFavourites() function.
 * - Use Axios to get all of your favourites from the cat API.
 * - Clear the carousel and display your favourites when the button is clicked.
 *  - You will have to bind this event listener to getFavouritesBtn yourself.
 *  - Hint: you already have all of the logic built for building a carousel.
 *    If that isn't in its own function, maybe it should be so you don't have to
 *    repeat yourself in this section.
 */

/**
 * 10. Test your site, thoroughly!
 * - What happens when you try to load the Malayan breed?
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
