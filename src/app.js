const button = document.querySelector('button');

button.addEventListener('click', () => {
  const index = document.querySelector('input').value;
  const query = `query GetUser($index: ID!) {
    getUser(index: $index) {
      name
      age
    }
  }`;

  fetch('http://localhost:4000/graphql', {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      query,
      variables: { index },
    }),
  })
    .then((res) => res.json())
    .then((data) => console.log('data returned:', data))
    .catch((err) => console.log(err));
});
