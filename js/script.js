const btn = document.getElementById('search-button');
const list = document.getElementById('list');

let baseUrl = `http://52.11.188.162/`;

const author = document.querySelector('#author-name');
const title = document.querySelector('#title');

function getAuthor() {
  // fetch(`http://52.11.188.162/author`)
  //   .then(response => response.json())
  //   .then(data => console.log(data));
}


//This POST /search part is where I am a little lost. I think I need to
//get the user input, then search the respective GET endpoints and retrieve the
//appropriate Ids, then build this object with said Ids, then make a POST request
//to get more accurate results. I feel like I'm either missing something or
//overcomplicating this part. Previously, I was just calling the resources endpoint
//and trying to match the user input with the right resource, but I see now why
//that isn't a good approach. I'm just a little stuck at what to do now.
let searchBooksObj = {
  "authorIds": [
    0
  ],
  "editorIds": [
    0
  ],
  "licenseCodes": [
    "string"
  ],
  "partialTitle": "string",
  "partialUrl": "string",
  "repositoryIds": [
    0
  ],
  "tagIds": [
    0
  ]
}

//I am currently trying to use the /search endpoint to get better results.
function searchBooks() {
  fetch(`http://52.11.188.162/search`, {
    body: JSON.stringify(searchBooksObj),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
    mode: 'cors',
    redirect: 'follow',
  }).then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error(error));

}



function init() {
  populateLicenseList();
  populateDisciplineList();
}

btn.addEventListener("click", () => {
  clear();
  getAuthor();
  searchBooks();
});


// These are the licenses provided from the spec that the user can select
const populateLicenseList = () => {
  const licenses = ["CC BY", "CC BY-NC", "CC BY-NC-ND", "CC BY-NC-SA", "CC BY-SA", "Custom", "EMUCL", "GFDL", "GGPL", "OPL", "PD"]
  const licenseList = document.getElementById('license-select');
  for(let i = 0; i < licenses.length; i++) {
    const licenseListItem = document.createElement("option");
      licenseListItem.textContent = licenses[i];
      licenseListItem.value = licenses[i];
      licenseList.appendChild(licenseListItem);
  }
}

// This populates the disciplines drop down
const populateDisciplineList = () => {
  fetch('http://52.11.188.162/' + 'tag').then(function(disciplineResponse) {
    return disciplineResponse.json();
  }).then(function(disciplines) {
    const disciplineList = document.getElementById('discipline');
    disciplines.forEach((discipline) => {
      const disciplineListItem = document.createElement("option");
        disciplineListItem.textContent = discipline.name;
        disciplineListItem.value = discipline.name;
        disciplineListItem.setAttribute('class', 'discipline-item');
        disciplineList.appendChild(disciplineListItem);
    });
  });
}

// Build the results list from the user input
const buildList = (resourceItem) => {
  let li = `<li>
            <p><strong>Title</strong>: ${resourceItem.title}</p>
            <p><strong>Author/Editor</strong>: ${resourceItem.authors.length > 0 ? resourceItem.authors.map(author => author.name).join(' ') : 'Not found'}  </p>
            <p><strong>Resource URL</strong>: ${resourceItem.url}</p>
            <p><strong>Discipline</strong>: ${resourceItem.tags.length > 0 ? resourceItem.tags.map(tag => tag.name).join(' ') : 'Not found' }</p>
            <p><strong>Repository</strong>: ${resourceItem.repository.name}</p>
            <p><strong>License</strong>: ${resourceItem.license.name !== null && resourceItem.license.name.length < 12 ? resourceItem.license.name : 'Custom'}</p>
            <p><strong>Peer Reviews</strong>: ${resourceItem.reviews !== null ? resourceItem.reviews :  'Not found'}</p>
            <p><strong>Ancillaries</strong>: ${resourceItem.ancillariesUrl !== null ? resourceItem.ancillariesUrl : 'Not found'}</p>
            </li>
            <br>`
  list.insertAdjacentHTML('beforeend', li);
}

// This just erases the unordered list when the user makes multiple searches.
const clear = () => {
  document.getElementById('list').innerHTML = "";
};
document.addEventListener("DOMContentLoaded", init);
