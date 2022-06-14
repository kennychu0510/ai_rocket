import { APIOrigin } from './api.js';
import { getDOMElement } from './functions.js';

const tbody = getDOMElement('#rankings')



// function getUsersRanks() {
fetch(APIOrigin + '/scores', {
  method: 'GET',
})
  .then((res) => res.json())
  .catch((err) => ({ error: String(err) }))
  .then((json) => {

    let i = 0;
    json.getAddedResult.forEach((record: { user: string; time: string; map_id: number; }) => {


      let tr = document.createElement('tr')
      let defaultRanking = document.createElement('td')
      let td1 = document.createElement('td')
      let td2 = document.createElement('td')
      let td3 = document.createElement('td')

      td1.textContent = record.user
      td2.textContent = record.time
      td3.textContent = (record.map_id === 1) ? 'Easy' : (record.map_id === 2) ? 'Normal' : 'Hard'
      defaultRanking.innerHTML += i

      parseInt(defaultRanking.innerHTML)
      tr.appendChild(defaultRanking)
      tr.appendChild(td1)
      tr.appendChild(td2)
      tr.appendChild(td3)
      tbody.appendChild(tr)
      i++;
    }
    )
  })






















