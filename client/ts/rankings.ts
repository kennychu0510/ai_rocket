import { APIOrigin } from './api.js';
import { getDOMElement } from './functions.js';

const tbody = getDOMElement('#rankings');

const rankingForm = getDOMElement('#rankingForm') as HTMLFormElement;
// Fetch ranking to display in frontend

updateRankingTable(APIOrigin);

rankingForm.addEventListener('change', (event) => {
  updateRankingTable(APIOrigin);
  // loadData()
});
function loadData() {
  console.log('Loading data...', {
    level: rankingForm.level.value,
    page: rankingForm.page.value,
  });
  const params = new URLSearchParams();
  params.set('level', rankingForm.level.value);
  params.set('page', rankingForm.page.value);
  const url = '/rankingForm?' + params.toString();
  console.log(url);
  return url;
}

function nextPage(event: { preventDefault: () => void }) {
  event.preventDefault();
  rankingForm.page.value++;
  loadData();
}

function prevPage(event: { preventDefault: () => void }) {
  event.preventDefault();
  rankingForm.page.value--;

  loadData();
}

function updateRankingTable(APIOrigin: string) {
  tbody.innerHTML = '';
  fetch(APIOrigin + loadData(), {
    method: 'GET',
  })
    .then((res) => res.json())
    .catch((err) => ({ error: String(err) }))
    .then((json) => {
      let i = 1;
      json.data.forEach(
        (record: { user: string; time: string; map_id: number }) => {
          // insert into table
          const tr = document.createElement('tr');
          const defaultRanking = document.createElement('td');
          const td1 = document.createElement('td');
          const td2 = document.createElement('td');
          const td3 = document.createElement('td');

          td1.textContent = record.user;
          td2.textContent = record.time;
          td3.textContent =
            record.map_id === 1 ?
              'Easy' :
              record.map_id === 2 ?
                'Normal' :
                'Hard';
          defaultRanking.innerHTML += i;

          parseInt(defaultRanking.innerHTML);
          tr.appendChild(defaultRanking);
          tr.appendChild(td1);
          tr.appendChild(td2);
          tr.appendChild(td3);
          tbody.appendChild(tr);
          i++;
        },
      );
    });
}
