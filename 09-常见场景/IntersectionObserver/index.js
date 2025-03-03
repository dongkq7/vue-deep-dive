const target = document.querySelector('.target')

// 1

// const callback = (entries, observer) => {
//   entries.forEach(entry => {
//     console.log(entry)
//     if (entry.isIntersecting) {
//       console.log('目标元素进入视口')
//     } else {
//       console.log('目标元素离开')
//     }
//   })
// }

// const ob = new IntersectionObserver(callback, {
//   root: null,
//   rootMargin: '0px',
//   threshold: 0
// })

// ob.observe(target)


const callback = (entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('出现了')
    } else {
      console.log('离开了')
    }
  })
}

const ob = new IntersectionObserver(callback, {
  root: document.querySelector('.container'),
  rootMargin: '-50px',
  threshold: 1
})

ob.observe(target)