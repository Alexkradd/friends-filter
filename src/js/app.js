import '../style/style.scss'
var FriendsList = {left: [], right: []}
var filter = document.querySelector('.filter')
var DragItem = {id: 0, zone: ''}
var Save = document.querySelector('.footer__save-link')
var Close = document.querySelector('.header__close-link')
VK.init({
  apiId: 6501969
})

function auth () {
  return new Promise((resolve, reject) => {
    VK.Auth.login(data => {
      if (data.session) {
        resolve()
      } else {
        reject(new Error('Не удалось авторизироваться'))
      }
    }, 2)
  })
}
auth().then(() => console.log('ok'))
function GetFriends () {
  return new Promise((resolve, reject) => {
    VK.api('friends.get', {v: '5.76', 'fields': ['photo_50']}, res => {
      resolve(res)
    })
  })
}
GetFriends()
async function storage () {
  const friends = localStorage.getItem('friends')
  if (typeof friends === 'undefined' || friends === null) {
    const getVKapiFriends = await GetFriends()
    FriendsList.left = getVKapiFriends.response.items
  } else {
    FriendsList = JSON.parse(friends)
  }
  Render(FriendsList.left, 'left')
  Render(FriendsList.right || [], 'right')
}
storage()

function Render (friendsItems, zone) {
  const lists = {left: document.createElement('ul'), right: document.createElement('ul')}
  const containerList = {left: document.querySelector('.filter-friends__container-left'), right: document.querySelector('.filter-friends__container-right')}
  lists[zone].classList.add('filter-friends__list')
  const container = document.createDocumentFragment()
  for (let friend of Sort(friendsItems)) {
    const li = document.createElement('li')
    li.setAttribute('draggable', true)
    li.setAttribute('data-id', friend.id)
    li.classList.add('filter-friends__item')
    li.innerHTML = `<div class="filter-friends__item-container">
                       <img class="filter-friends__img" src="${friend.photo_50}" alt="photo" draggable="false">
                       <span class="filter-friends__name">${friend.first_name} ${friend.last_name} </span>
                         <div class="filter-friends__${(zone === 'left') ? 'add' : 'delete'}">
                           <a data-id="${friend.id}" class="filter-friends__link fas fa-${(zone === 'left') ? 'plus' : 'times'}"></a>
                         </div>
                    </div>`
    container.appendChild(li)
  }
  lists[zone].appendChild(container)
  console.log(containerList)
  containerList[zone].innerHTML = ''
  containerList[zone].appendChild(lists[zone])
}
function Sort (arr) {
  return arr.sort((a, b) => {
    if (a.first_name > b.first_name) {
      return 1
    }
    if (a.first_name < b.first_name) {
      return -1
    }
  }
  )
}
function FriendsFilter (chunk, zone) {
  let filterArr = []
  for (let item of FriendsList[zone]) {
    if (item.first_name.toLowerCase().includes(chunk.toLowerCase()) || item.last_name.toLowerCase().includes(chunk.toLowerCase())) {
      filterArr.push(item)
    }
  }
  Render(filterArr || FriendsList[zone], zone)
}
document.addEventListener('input', e => {
  if (e.target.classList.contains('search__inp--left')) {
    FriendsFilter(e.target.value, 'left')
  }
  if (e.target.classList.contains('search__inp--right')) {
    FriendsFilter(e.target.value, 'right')
  }
})
function GetCurentZone (targ) {
  let zone = targ.getAttribute('data-zone')
  if (['left', 'right'].includes(zone)) {
    return zone
  }
  if (targ.parentElement) {
    return GetCurentZone(targ.parentElement)
  }
}
filter.addEventListener('click', e => {
  if (e.target.classList.contains('filter-friends__capt')) {
    return
  }
  const CurentZone = GetCurentZone(e.target)
  if (e.target.nodeName === 'A') {
    const id = e.target.getAttribute('data-id')
    RefreshTable({id: id, zone: CurentZone})
  }
})
function RefreshTable (params) {
  let FinishZone = (params.zone === 'left') ? 'right' : 'left'
  FriendsList[params.zone].forEach((element, i) => {
    if (element.id === Number(params.id) && params.zone !== FinishZone) {
      FriendsList[params.zone].splice(i, 1)
      FriendsList[FinishZone].push(element)
    }
  })
  Render(FriendsList[params.zone], params.zone)
  Render(FriendsList[FinishZone], FinishZone)
}
filter.addEventListener('dragstart', e => {
  DragItem.id = e.target.getAttribute('data-id')
  DragItem.zone = GetCurentZone(e.target)
  e.dataTransfer.effectAllowed === 'move'
})
filter.addEventListener('dragover', e => {
  e.preventDefault()
})
filter.addEventListener('dragenter', e => {
  e.preventDefault()
})
filter.addEventListener('drop', e => {
  RefreshTable({id: DragItem.id, zone: DragItem.zone})
})
Save.addEventListener('click', e => {
  e.preventDefault()
  localStorage.setItem('friends', JSON.stringify(FriendsList))
})
Close.addEventListener('click', e => {
  e.preventDefault()
  localStorage.clear()
  window.location.reload()
})
