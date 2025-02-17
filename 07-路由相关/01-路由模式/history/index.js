document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#container')

  function reanderPage(path = '/') {
    switch(path) {
      case '/':
        container.innerHTML = 'home'
        break
      case '/about':
        container.innerHTML = 'about'
        break
      case '/contact':
        container.innerHTML = 'contact'
        break
      default: 
        container.innerHTML = 'not found'
    }
  }

  document.querySelectorAll('a[data-link]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault()
      const path = e.target.getAttribute('href')
      history.pushState(null, null, path)
      reanderPage(path)
    })
  })

  reanderPage()
})