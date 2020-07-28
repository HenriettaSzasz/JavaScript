//  Part I
//  1. Get the main content container

console.log(document.body)

//  2. Get first post title

console.log(document.getElementById('gg').innerHTML)

//  3. Get first post content

console.log(document.getElementsByClassName('entry-content')[0].getElementsByTagName('p')[0].innerHTML)

//  4. Get all post titles

let el = document.getElementsByClassName('entry-title');
for(let i = 0; i < el.length; i++){ console.log(el[i].getElementsByTagName('a')[0].innerHTML)
}

//  5. Change the value for the first title

document.getElementById('gg').innerHTML = 'Changed title'

console.log(document.getElementById('gg').innerHTML)

//  6. Change the URL for the first title link

document.getElementById('gg').href = 'https://adventofcode.com/2019/day/16#'

console.log(document.getElementById('gg').innerHTML)

//  7. Change the background color for the body

document.body.style.backgroundColor = 'cyan'

//  8. Add a new class to the articles then add styles

let el = document.getElementsByTagName('article');

for(let i = 0; i < el.length; i++){       
  el[i].classList.add('mystyle')
}

el = document.getElementsByClassName('mystyle')

for(let i = 0; i < el.length; i++){       
  let a = el[i].getElementsByTagName('a')[0]
  a.style.textDecoration  = 'none'
  a.style.color = 'red'
  a.style.fontFamily = 'Helvetica'
  
  let p = el[i].getElementsByTagName('p')[0]
  
  p.style.color = 'blue'
  p.style.backgroundColor = 'gray'
}

//  Part II
//  1.  Select the parent element for the first post title

document.getElementById('gg').parentNode

//  2.  Select the first post and log the sibligns
//  3.  Select the #main container and log the children

// Bonus Set the entry content with the curent date and time and update it 
// every x (as parameter) seconds

