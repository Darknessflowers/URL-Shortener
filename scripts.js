let shortLinks = [];
let shortLinksDisplayArray;
const shortenForm = document.querySelector("#shortener form");
const linkToShorten = document.querySelector("#shortener input");
const inputError = document.querySelector("form .error");
let linkDisplay = document.querySelector('#shortLinkDisplay');
const navIcon = document.querySelector('#openNav');
const nav = document.querySelector('nav');
let duplicateIndex;
let resizeTimer;

function linkExists(link) {
  return shortLinks.some(function(el) {
    if(el.link === link) {
      duplicateIndex = shortLinks.map(function(e) { return e.link; }).indexOf(link);
      return el.link === link;
    }
  }); 
}
function updateClipboard(link) {
  navigator.clipboard.writeText(link).then(function() {
    /* success */
    console.log('copied')
  }, function() {
    /* failure */
    console.log('copy failed');
  });
}

function showError() {
  if(linkToShorten.validity.valueMissing) {
    inputError.textContent = 'Please add a link.';
    console.log('failed');

  } else if(linkToShorten.validity.typeMismatch) {
    inputError.textContent = 'Please add a link in the format of http:// or https://'
  } else {
    inputError.textContent = 'Please add a link.';
  }
}

function writeToLocalStorage() {
  // localStorage.setItem({shortLinks});
  localStorage.setItem('shortLinks', JSON.stringify(shortLinks));
}

function readFromLocalStorage() {
  const retrievedLinks = JSON.parse(localStorage.getItem('shortLinks'));
  if(retrievedLinks !== null) {
    shortLinks = retrievedLinks;
    displayLinks();
  }
}

function displayLinks() {
  shortLinksDisplayArray = [...shortLinks].reverse();
  const html = shortLinksDisplayArray.map(obj =>
    `<div id="${obj.id}" class="inputted">
    <span class="link">${obj.link}</span>
    <div class="shortLink">
      <a href="${obj.shortLink}" target="_blank">${obj.shortLink}</a>
      <button class="copyShort">Copy</button>
    </div>
  </div>
    `).join('');
    linkDisplay.innerHTML = html;
    writeToLocalStorage();
}


async function shortenURL(url) {
  const response = await fetch('https://rel.ink/api/links/', {
    method: 'POST',
    body: JSON.stringify({url}),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  const data = await response.json();
  const shortUrl = `https://rel.ink/${data.hashid}`;
  // let slash = url.indexOf('/');
  // console.log(slash);
  if(linkExists(url)) {
    console.log('You have already shortened this link');
    inputError.innerHTML = `You have already shortened this link.`;
    window.location = window.location.pathname + `#${shortLinks[duplicateIndex].id}`;
    let duplicatedItem = document.querySelector(`#${shortLinks[duplicateIndex].id}`);
    duplicatedItem.classList.add('duplicate');
  } else {
    shortLinks.push({
      'link': url,
      'shortLink': shortUrl,
      'id': 'id-'+Date.now(),
    });
    console.log(shortUrl);

    displayLinks();
  }
  
  return shortUrl;
}


readFromLocalStorage();

shortenForm.addEventListener('submit', function(e) {
if(!linkToShorten.validity.valid) {
  shortenForm.classList.add('submitted');
  console.log('failed');
  //display error
  showError();
  //prevent form from being sent
  e.preventDefault();
} else {
  e.preventDefault();
  inputError.textContent = '';
  console.log(linkToShorten.value);
  shortenURL(linkToShorten.value);
}
});

// Event Delegation: listen for the click on the link div but then delegate the click over to the button if that is what was clicked
linkDisplay.addEventListener('click', function(e) {
 if(e.target.matches('.copyShort')) {
   console.log(e.target);
   e.target.innerText = 'Copied';
   e.target.style.background = '#3A3054';
   let linkToCopy = e.target.closest('.shortLink').firstElementChild.href;
   console.log(linkToCopy);
   updateClipboard(linkToCopy);
 }
});

window.addEventListener("resize", () => {
  document.body.classList.add("resize-animation-stopper");
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    document.body.classList.remove("resize-animation-stopper");
  }, 400);
});

navIcon.addEventListener('click', () => nav.classList.toggle('open'));