$(document).ready(function() {
//our search object
let searchBooksObj = {}

//the URL base with which we can concat/specify our endpoints
let baseUrl = `http://52.11.188.162/`;

let loader = document.querySelector('.loader');

//POST to /search to retrieve data
function searchBooks() {
  //if object is empty, ask user to enter data to see results
  if (Object.keys(searchBooksObj).length === 0) {
    alert('Please, enter some data to see results.');
    return;
  };

  console.log(searchBooksObj);

  //this log just is to double-check the actual body of the object we're sending
  console.log(JSON.stringify(searchBooksObj));
  loader.style.display = 'block';

  fetch(baseUrl + 'search', {
    body: JSON.stringify(searchBooksObj),
    cache: 'no-cache',
    headers: {
      'content-type': 'application/json',
    },
    method: 'POST'
  }).then(response => response.json())
    .then(data => {
      if (data.length === 0) {
        alert('No results found. Try searching again');
        clearButton.click();
      }
      buildList(data);
      loader.style.display = 'none';
      window.scroll({
        top: 700,
        behavior: 'smooth'
      })
    })

    .catch(error => console.error(error));
}
  getTitle();
  getAuthors();
  getPeerReviews()
  getAncillaries()
  getLicences();
  getDisciplines();
  getRepositories();

//invoke searchBooks and send POST request
const searchButton = document.getElementById('search-button');
searchButton.addEventListener("click", () => {
  searchBooks();
  clear();
});

//clear input text fields and clear object
const clearButton = document.getElementById('clear-button');
clearButton.addEventListener('click', () => {
  getLicences();
  getDisciplines();
  getRepositories();
  $('#disciplines').multiselect('deselectAll');
  $('#license-select').multiselect('refresh');
  $('#repository').multiselect('deselectAll');
  searchBooksObj = {};
  licenseArr = [];
  disciplineArr = [];
  document.querySelectorAll('[type="text"]').forEach(input => input.value = '');
  clear();
});

let disciplineArr = []
//this populates/GETs disciplines. populate searchBooksObj's tagIds key
function getDisciplines()  {
  $('#disciplines').multiselect({
    includeSelectAllOption: true,
    buttonText: function(options, select) {
      return 'Select one or more';
    },
    onChange: function(option, checked, select) {
      $(option).each(function(index, id) {
        let i = disciplineArr.indexOf(id.value);
        if (i === -1) {
          disciplineArr.push(id.value);  
        } else {
          disciplineArr.splice(i, 1);
          if (disciplineArr.length === 0) {
            disciplineArr.push(0);
          }
        }
      });
      searchBooksObj.tagIds = disciplineArr;
    }
  });
  fetch(baseUrl + 'tag')
    .then(disciplineResponse => disciplineResponse.json())
    .then(disciplines => {
      let data = disciplines.map(discipline => {
        return {label: discipline.name, title: discipline.name, value: discipline.id};
      });
      // programmatically add data to select list using multiselect library
      $('#disciplines').multiselect('dataprovider', data);
  })
  .catch(error => console.error(error));
}

//get title from user input and populate searchBookObj's partialTitle key
function getTitle() {
  const title = document.querySelector('#title');
  title.addEventListener('change', (e) => {
    if (title.value !== '') {
      searchBooksObj.partialTitle = e.target.value;
    }
  });
}

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

function getPeerReviews() {
  const peerReviewsList = document.querySelector("#peer-reviews-list");
  peerReviewsList.addEventListener('change', (e) => {
    let peerReview = peerReviewsList.options[peerReviewsList.selectedIndex].value;
    if (peerReview === 'yes') {
      searchBooksObj.hasReview = true
    } else {
      searchBooksObj.hasReview = false
    }
  });
}

function getAncillaries() {
  const ancillariesList = document.querySelector("#ancillaries-list");
  ancillariesList.addEventListener('change', (e) => {
    let ancillary = ancillariesList.options[ancillariesList.selectedIndex].value;
    if (ancillary === 'yes') {
      searchBooksObj.hasAncillaries = true
      searchBooksObj.hasAncillary = true
    } else {
      searchBooksObj.hasAncillaries = false
      searchBooksObj.hasAncillary = false
    }
  });
}

// since the object for this takes an array, I am setting it here
let licenseArr = []
//populates searchBooksObj's licensesCodes key
function getLicences() {

  //these are the licenses provided from the spec that the user can select in a dropdown format
  const licenses = ["CC BY", "CC BY-NC", "CC BY-NC-ND", "CC BY-NC-SA", "CC BY-SA", "EMUCL", "GFDL", "GGPL", "OPL", "PD"]
  const licenseList = document.getElementById('license-select');

  for(let i = 0; i < licenses.length; i++) {
    const licenseListItem = document.createElement("option");
    licenseListItem.textContent = licenses[i];
    licenseListItem.value = licenses[i];
    licenseList.appendChild(licenseListItem);
  }

  $('#license-select').multiselect({
    includeSelectAllOption: true,
    buttonText: function(options, select) {
      return 'Select one or more';
    },
    onChange: function(option, checked, select) {
      $(option).each(function(index, id) {
        let i = licenseArr.indexOf(id.value);
        if (i === -1) {
          licenseArr.push(id.value);  
        } else {
          licenseArr.splice(i, 1);
          if (licenseArr.length === 0) {
            licenseArr.push(0);
          }
        }
      });
      searchBooksObj.licenseCodes = licenseArr;
    },
    onSelectAll: function() {
      searchBooksObj.licenseCodes = $('#license-select').val();
    }
  });
}


// since the object for this takes an array, I am setting it here
let respositoryArr = []
//this populates/GETs the repositories. populates searchBooksObj's repositories key
function getRepositories() {
  $('#repository').multiselect({
    includeSelectAllOption: true,
    buttonText: function(options, select) {
      return 'Select one or more';
    },
    onChange: function(option, checked, select) {
      $(option).each(function(index, id) {
        let i = respositoryArr.indexOf(id.value);
        if (i === -1) {
          respositoryArr.push(id.value);  
        } else {
          respositoryArr.splice(i, 1);
          if (respositoryArr.length === 0) {
            respositoryArr.push(0);
          }
        }
      });
      searchBooksObj.repositoryIds = respositoryArr;
    },
    onSelectAll: function() {
      searchBooksObj.repositoryIds = $('#repository').val();
    }
  });

  fetch(baseUrl + 'repositories')
    .then(response => response.json())
    .then(repositories => {
      let data = repositories.map(repositories => {
        return {label: repositories.name, title: repositories.name, value: repositories.id};
      });
      $('#repository').multiselect('dataprovider', data)
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
}); //end jquery
