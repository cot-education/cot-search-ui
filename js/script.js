//our search object
let searchBooksObj = {}

//the URL base with which we can concat/specify our endpoints
let baseUrl = `http://52.11.188.162/`;

//POST to /search to retrieve data
function searchBooks() {
  //check if repositoryIds and licenseCodes have any values. If not, remove them from object
  if (searchBooksObj.repositoryIds.length === 0) delete searchBooksObj.repositoryIds;
  if (searchBooksObj.licenseCodes.length === 0) delete searchBooksObj.licenseCodes;

  //if object is empty, ask user to enter data to see results
  if (Object.keys(searchBooksObj).length === 0) alert('Please, enter some data to see results.')
  //this log just is to double-check the actual body of the object we're sending
  console.log(JSON.stringify(searchBooksObj));
  fetch(baseUrl + 'search', {
    body: JSON.stringify(searchBooksObj),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST',
  }).then(response => response.json())
    .then(data => {
      buildList(data);
    })
    .catch(error => console.error(error));
}


//kick things off when the page loads
function init() {
  getTitle();
  getLicences();
  getDisciplines();
  // getEditors();
  getAuthors();
  getRepositories();
}

//invoke searchBooks and send POST request
const btn = document.getElementById('search-button');
btn.addEventListener("click", () => {
  searchBooks();
  clear();
});


//this populates/GETs disciplines. populate searchBooksObj's tagIds key
function getDisciplines()  {
  const disciplineList = document.querySelector('#disciplines');
  fetch(baseUrl + 'tag')
    .then(disciplineResponse => disciplineResponse.json())
    .then(disciplines => {
      const lists = disciplines.map((i) => [i.name, i.id]  );
      //use awesomplete js library to dynamically list tags
      new Awesomplete(disciplineList, {
        list: lists,
        replace: function(name) {
         this.input.value = name.label
      }
    });
    //get selected tag and populate tag key in searchBookObj to POST
    disciplineList.addEventListener("awesomplete-select", function(event) {
      searchBooksObj.tagIds = [event.text.value];
    });
  })
  .catch(error => console.error(error));
}

//get title from user input and populate searchBookObj's partialTitle key
function getTitle() {
  const title = document.querySelector('#title');
  title.addEventListener('change', (e) => {
    searchBooksObj.partialTitle = e.target.value;
  })
}

//get author from user input and populate searchBookObj's auhthorId key
// function getEditors() {
//   const editorsList = document.querySelector('#author-name');
//   fetch(baseUrl + 'editors')
//     .then(response => response.json())
//     .then(editors => {
//       const lists = editors.map((i) => [i.name, i.id]);
//       //use awesomplete js library to dynamically list editors
//       new Awesomplete(editorsList, {
//         list: lists,
//         replace: function(name) {
//           this.input.value = name.label
//         }
//       });
//       //get selected editor and populate tag key in searchBookObj to POST
//       editorsList.addEventListener("awesomplete-select", function(event) {
//         searchBooksObj.editorIds = [event.text.value];
//       });
//     })
//     .catch(error => console.error(error));
// }

function getAuthors() {
  const authorsList = document.querySelector('#author-name');
  fetch(baseUrl + 'authors')
    .then(response => response.json())
    .then(authors => {
      const lists = authors.map((i) => [i.name, i.id]);
      //use awesomplete js library to dynamically list authors
      new Awesomplete(authorsList, {
        list: lists,
        replace: function(name) {
          this.input.value = name.label
        }
      });
      //get selected author and populate tag key in searchBookObj to POST
      authorsList.addEventListener("awesomplete-select", function(event) {
        searchBooksObj.authorIds = [event.text.value];
      });

    })
    .catch(error => console.error(error));
}

//this both lists license values and gets custom license search.
//populates searchBooksObj's licensesCodes key
function getLicences() {
  searchBooksObj.licenseCodes = [];
  //these are the licenses provided from the spec that the user can select in a dropdown format
  const licenses = ["CC BY", "CC BY-NC", "CC BY-NC-ND", "CC BY-NC-SA", "CC BY-SA", "EMUCL", "GFDL", "GGPL", "OPL", "PD"]
  const licenseList = document.getElementById('license-select');
  const licenseSearch = document.getElementById('license-search');
  for(let i = 0; i < licenses.length; i++) {
    const licenseListItem = document.createElement("option");
      licenseListItem.textContent = licenses[i];
      licenseListItem.value = licenses[i];
      licenseList.appendChild(licenseListItem);
  }
  //get user selected license from the dropdown and populate license key in searchBookObj to POST
  licenseList.addEventListener('change', (e) => {
    searchBooksObj.licenseCodes.push(e.target.value);
  });
  //get custom license from text input and populate license key in searchBookObj to POST
  licenseSearch.addEventListener('change', (e) => {
    searchBooksObj.licenseCodes.push(e.target.value);
  });
}

//this populates/GETs the repositories. populates searchBooksObj's repositories key
function getRepositories() {
  const respository = document.querySelector('#repository');
  searchBooksObj.repositoryIds = [];
  fetch(baseUrl + 'repositories')
    .then(response => response.json())
    .then(repositories => {
      const lists = repositories.map((i) => [i.name, i.id]);
      //use awesomplete js library to dynamically list repositories
      new Awesomplete(repository, {
        list: lists,
        replace: function(name) {
          this.input.value = name.label
        }
      });
      repository.addEventListener("awesomplete-select", function(event) {
        searchBooksObj.repositoryIds.push(event.text.value);
      });
    })
    .catch(error => console.error(error));
}


const list = document.getElementById('list');
// Build the results list from the user input
function buildList(searchResults) {
  searchResults.forEach(result => {
    let li = `<li>
                <p><strong>Title</strong>: ${result.title}</p>
                <p><strong>Author/Editor</strong>: ${result.authors.length > 0 ? result.authors.map(author => author.name).join(' ') : 'Not found'}  </p>
                <p><strong>Resource URL</strong>: ${result.url}</p>
                <p><strong>Discipline</strong>: ${result.tags.length > 0 ? result.tags.map(tag => tag.name).join(' ') : 'Not found' }</p>
                <p><strong>Repository</strong>: ${result.repository.name}</p>
                <p><strong>License</strong>: ${result.license.name !== null && result.license.name.length < 12 ? result.license.name : 'Custom'}</p>
                <p><strong>Peer Reviews</strong>: ${result.reviews !== null ? result.reviews :  'Not found'}</p>
                <p><strong>Ancillaries</strong>: ${result.ancillariesUrl !== null ? result.ancillariesUrl : 'Not found'}</p>
              </li>
              <br>`
  list.insertAdjacentHTML('beforeend', li);
  });
}


//this just erases the unordered list when the user makes multiple searches.
function clear() {
  document.getElementById('list').innerHTML = "";
};
document.addEventListener("DOMContentLoaded", init);
