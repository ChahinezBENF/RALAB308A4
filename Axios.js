/**
 * 3. Fork your own sandbox, creating a new one named "JavaScript Axios Lab."
 */

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

/**
 * 4. Change all of your fetch() functions to axios!
 */
// Store your API key for easy access
axios.defaults.baseURL = "https://api.thecatapi.com/v1/";
axios.defaults.headers.common["x-api-key"] =
  "live_CYhOik1GLRaeEtPRD959IvxoAEk4lZIx0SiUn3xpReQysLAMowE1KuSu9QskJ1kq";

// Function to load breeds and populate the dropdown
export async function initialLoad() {
  try {
    const response = await axios.get("breeds");
    const breeds = response.data;

    breedSelect.innerHTML = ""; // Clear previous options

    breeds.forEach((breed) => {
      const option = document.createElement("option");
      option.value = breed.id; // Set value as breed ID
      option.textContent = breed.name; // Display breed name
      breedSelect.appendChild(option);
    });

    // Automatically load the first breed's images if breeds are available
    if (breeds.length) {
      await loadBreedImagesAxios(breeds[0].id);
    }
  } catch (error) {
    console.error("Error loading breeds:", error);
  }
}
initialLoad();

// Function to load breed images into the carousel
export async function loadBreedImagesAxios(breedId) {
  try {
    const response = await axios.get("images/search", {
      params: { breed_id: breedId, limit: 5 },
      onDownloadProgress: updateProgress, // Attach the progress function
    });
    const images = response.data;

    const carousel = document.getElementById("carouselInner");
    carousel.innerHTML = ""; // Clear previous images

    // If there are no images, show a message, this is from part 10
    if (images.length === 0) {
      const noImagesMessage = document.createElement("div");
      noImagesMessage.textContent = "No images available for this breed.";
      carousel.appendChild(noImagesMessage);
    } else {
      images.forEach((image) => {
        const template = document.getElementById("carouselItemTemplate");
        const clone = template.content.cloneNode(true);
        const imgElement = clone.querySelector("img");

        imgElement.src = image.url;
        imgElement.alt = "Cat image";

        // Get the heart icon element in the cloned template
        const heartIcon = clone.querySelector(".favourite-button");
        heartIcon.setAttribute("data-img-id", image.id); // Set the image ID as a data attribute

        // Attach the event listener to the heart icon
        heartIcon.addEventListener("click", function () {
          favourite(heartIcon); // Call the favourite function when clicked on the heart
          // i have some trouble here that i couldnt fix unfortunatly
        });

        // Append the carousel item to the carousel
        carousel.appendChild(clone);
      });
    }

    // Check if breed description is available, otherwise show a fallback message
    const breedDescription =
      images[0]?.breeds?.[0]?.description || "No description available.";
    infoDump.innerHTML = `Breed Info: ${breedDescription}`;
  } catch (error) {
    console.error("Error loading breed images:", error);
  }
}

// Function to set up breed selection event listener
export function setupBreedSelection() {
  breedSelect.addEventListener("change", async (event) => {
    const breedId = event.target.value;
    await loadBreedImagesAxios(breedId);
  });
}
setupBreedSelection();

/**
 * 5- Add axios interceptors to log the time between request and response to the console.
 */

/**
 * 7. As a final element of progress indication, add the following to your axios interceptors:
 * - In your request interceptor, set the body element's cursor style to "progress."
 * - In your response interceptor, remove the progress cursor style from the body element.
 */
axios.interceptors.request.use((config) => {
  config.metadata = { startTime: Date.now() }; // Store the start time
  console.log(`Request started: ${config.url}`); // Log the beginning of the request
  return config;
});

axios.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    console.log(`Request completed: ${response.config.url}`);
    console.log(`Duration: ${duration}ms`); // Log the time taken
    return response;
  },
  (error) => {
    if (error.config && error.config.metadata) {
      const duration = Date.now() - error.config.metadata.startTime;
      console.log(`Request failed: ${error.config.url}`);
      console.log(`Duration: ${duration}ms`);
    }
    return Promise.reject(error);
  }
);

/**
 * 6 . Create a progress bar to indicate the request is in progress.:
 * - You need only to modify its width style property to align with the request progress.
 * - in your request interceptor, set the width of the progressBar element to 0%.
 */

function updateProgress(event) {
  console.log("ProgressEvent:", event); // Log the entire ProgressEvent object

  if (event.total > 0) {
    // Calculate the progress as a percentage
    const percentage = Math.round((event.loaded / event.total) * 100);
    progressBar.style.width = `${percentage}%`; // Update the progress bar
    console.log(`Progress: ${percentage}%`);
  } else {
    console.log("Progress not computable."); // Fallback message, although this shouldn't trigger now
  }
}

/**
 * 8. To practice posting data, we'll create a system to "favourite" certain images.
 * - The skeleton of this function has already been created for you.
 * - This function is used within Carousel.js to add the event listener as items are created.
 * - This is why we use the export keyword for this function.
 * - Post to the cat API's favourites endpoint with the given ID.
 * - The API documentation gives examples of this functionality using fetch(); use Axios!
 * - Add additional logic to this function such that if the image is already favourited,
 *   you delete that favourite using the API, giving this function "toggle" functionality.
 * - You can call this function by clicking on the heart at the top right of any image.
 */

export async function favourite(heartIcon) {
  console.log("favourite() called", heartIcon);
  const imageId = heartIcon.getAttribute("data-img-id"); // Get the image ID from the heart icon's data attribute

  try {
    // Fetch the list of favourites to check if the image is already favourited
    const response = await axios.get("favourites");
    const favourites = response.data;

    // Check if the image is already in the favourites
    const isFavourited = favourites.some((fav) => fav.image.id === imageId);

    if (isFavourited) {
      // If the image is already favourited, remove it from the favourites
      const favouriteId = favourites.find((fav) => fav.image.id === imageId).id;
      await axios.delete(`favourites/${favouriteId}`);
      console.log(`Image ${imageId} removed from favourites.`);

      // Update the heart icon to "unfavourited" state
      updateHeartIcon(heartIcon, false);
    } else {
      // If the image is not favourited, add it to the favourites
      await axios.post("favourites", {
        image_id: imageId,
      });
      console.log(`Image ${imageId} added to favourites.`);

      // Update the heart icon to "favourited" state
      updateHeartIcon(heartIcon, true);
    }
  } catch (error) {
    console.error("Error favouriting image:", error);
  }
}

// Function to update the heart icon based on the favourited status
function updateHeartIcon(heartIcon, isFavourited) {
  const heart = heartIcon.querySelector(".heart-icon"); // Get the heart icon element

  if (isFavourited) {
    heart.classList.add("favourited");
    heart.classList.remove("unfavourited");
  } else {
    heart.classList.add("unfavourited");
    heart.classList.remove("favourited");
  }
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
export async function getFavourites() {
  try {
    const response = await axios.get("favourites");
    const favourites = response.data;

    if (favourites.length === 0) {
      console.log("No favourites found.");
      return;
    }

    // Clear the carousel before adding new images
    const carousel = document.getElementById("carouselInner");
    carousel.innerHTML = ""; // Clear the current carousel images

    // Loop through the favourites and create carousel items
    favourites.forEach((favourite) => {
      const image = favourite.image;
      const template = document.getElementById("carouselItemTemplate");
      const clone = template.content.cloneNode(true);
      const imgElement = clone.querySelector("img");

      imgElement.src = image.url;
      imgElement.alt = "Favourited Cat Image"; // Add alt text for accessibility

      // Set the image ID in the heart icon's data attribute
      const heartIcon = clone.querySelector(".favourite-button");
      heartIcon.setAttribute("data-img-id", image.id);

      // Attach event listener to the heart icon to toggle favourites
      heartIcon.addEventListener("click", () => favourite(heartIcon));

      // Append the carousel item to the carousel
      carousel.appendChild(clone);
    });

    console.log("Favourites loaded into the carousel.");
  } catch (error) {
    console.error("Error loading favourites:", error);
  }
}

getFavouritesBtn.addEventListener("click", async () => {
  await getFavourites(); // Fetch and display favourites when button is clicked
});
/**
 * 10. Test your site, thoroughly!
 *  - If this is working, good job! If not, look for the reason why and fix it!
 * - Test other breeds as well. Not every breed has the same data available, so
 *   your code should account for this.
 */
