const leaderboardList = document.querySelector('#leaderboard > a')

    function getLeaderboard(){
    fetch('/scores/')
    .then(res => res.json())
    .then(json =>{
        if (json.error) {
            console.error('error: ' + error);
            return;
        }
        defaultResult = json.result;
        for (let item of json.result){
            appendNode(item);
            
        }
    })
    .catch(error => console.error('error: ' + error));
}
getLeaderboard();
    function appendNode(item){
        let node = leaderboard.cloneNode(true);
        node.querySelector('.user').textContent = item.user;

        document.querySelector('#leaderboard').appendChild(node);
    }