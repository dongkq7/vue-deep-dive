document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('#container')

  function reanderPage(hash = '#home') {
    switch(hash) {
      case '#home':
        container.innerHTML = 'home'
        break
      case '#about':
        container.innerHTML = 'about'
        break
      case '#contact':
        container.innerHTML = 'contact'
        break
      default: 
        container.innerHTML = 'not found'
    }
  }

  window.addEventListener('hashchange', () => {
    reanderPage(window.location.hash)
  })

  reanderPage()
})